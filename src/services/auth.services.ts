import { NextFunction, Response, Request } from 'express'
import jwt from 'jsonwebtoken'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { TokenGenerate, UserLoginParams, UserRegisterParams } from '~/constants/types/auth.types'
import prisma from '~/libs/prisma'
import bcryptModule from '~/utils/bcryptModule'
import ErrorHandler from '~/utils/errorHandler'
import jwtServices from './jwt.services'
import splitFullName from '~/utils/splitName'
import generateRandomPhoneNumber from '~/utils/randomPhone'
import { UserRecord } from 'firebase-admin/auth'
import { verifyToken } from '~/utils/auth.utils'
import path from 'node:path'
import ejs, { promiseImpl } from 'ejs'
import { sendMail } from '~/utils/sendMail'
class authServices {
  private getJsonWebToken = async (email: string, id: string) => {
    const payload = {
      email,
      id
    }
    const secret_key = process.env.SECRET_KEY || 'my_secret_key'
    const token = jwt.sign(payload, secret_key, {
      expiresIn: '7d'
    })

    return token
  }
  private generateResponse(data: TokenGenerate, accessToken: string, next: NextFunction) {
    if (!data.id || !accessToken || !data.email) {
      return next(new ErrorHandler('Invalid data', HttpStatusCodes.CONFLICT))
    }
    return {
      user: data,
      access_token: accessToken
    }
  }

  public async login({ email, password, fcmToken }: UserLoginParams, res: Response, next: NextFunction) {
    const user = await prisma.users.findUnique({
      where: { email: email },
      include: {
        role: {
          select: {
            id: true,
            role_name: true
          }
        }
      }
    })
    if (!user || !user.password) {
      return next(new ErrorHandler('User is not registered', HttpStatusCodes.UNAUTHORIZED))
    }
    if (user.status === false) {
      return next(new ErrorHandler('User is forbidden', HttpStatusCodes.FORBIDDEN))
    }
    const compare = await bcryptModule.compare(password, user.password)
    if (compare === false) {
      return next(new ErrorHandler('Password is not correct', HttpStatusCodes.FORBIDDEN))
    }
    await prisma.users.update({
      where: { email: email },
      data: {
        fcmToken: fcmToken
      }
    })
    console.log('fcm token updated', fcmToken)
    const TokenGenerated: TokenGenerate = {
      email: user.email,
      full_name: user.full_name,
      id: user.id,
      role: user.role_id,
      role_name: user.role.role_name
    }
    const accessToken = await jwtServices.generatePairToken(TokenGenerated)
    return this.generateResponse(TokenGenerated, accessToken, next)
  }

  public async verification(email: string, next: NextFunction) {
    const verificationCode = Math.round(1000 + Math.random() * 9000)
    const data = {
      verificationCode: verificationCode
    }
    const html = await ejs.renderFile(path.join(__dirname, '../mails/sendOTP.ejs'), data)
    try {
      await sendMail({
        email: email,
        subject: 'Verification email code',
        template: 'sendOTP.ejs',
        data
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
    return {
      message: 'Verification send mail successfully',
      verificationCode: verificationCode
    }
  }
  public async register({ confirm_password, email, full_name, password }: UserRegisterParams, next: NextFunction) {
    const existUser = await prisma.users.findUnique({
      where: { email: email, status: true }
    })
    if (existUser) {
      return next(new ErrorHandler('Email is exist', HttpStatusCodes.CONFLICT))
    }
    if (password !== confirm_password) {
      return next(new ErrorHandler('Password is not matching!', HttpStatusCodes.CONFLICT))
    }
    const pwd = await bcryptModule.getHash(password)
    const { firstName, middleName, lastName } = splitFullName(full_name)

    const newUser = await prisma.users.create({
      data: {
        email: email,
        password: pwd,
        full_name: full_name,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone_number: generateRandomPhoneNumber(),
        is_active: true,
        role_id: '4d100fe4-7340-4768-93fd-eb7a095f5765',
        avatar: 'https://i.pinimg.com/736x/3b/72/62/3b72621cba7e1b12facb8cd223de9957.jpg'
      }
    })
    return newUser
  }
  public async loginGoogle(idToken: string, next: NextFunction) {
    console.log('idToken', idToken)
    const userRecord = await this.verifyGoogle(idToken)
    if (!userRecord) {
      return next(new ErrorHandler('user is not exist', HttpStatusCodes.NOT_FOUND))
    }
    console.log(userRecord)
    const existUser = await prisma.users.findUnique({
      where: {
        email: userRecord.email
      },
      include: {
        role: {
          select: {
            id: true,
            role_name: true
          }
        }
      }
    })
    if (!existUser) {
      const { firstName, middleName, lastName } = splitFullName(userRecord.name || 'User Guest Souma')

      const newUser = await prisma.users.create({
        data: {
          email: userRecord.email || 'user@gmail.com',
          full_name: userRecord.name || 'User Guest Souma',
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          phone_number: generateRandomPhoneNumber(),
          is_active: true,
          status: true,
          role_id: '4d100fe4-7340-4768-93fd-eb7a095f5765',
          avatar: 'https://i.pinimg.com/736x/3b/72/62/3b72621cba7e1b12facb8cd223de9957.jpg'
        }
      })
      const role_data = await prisma.roles.findUnique({
        where: { id: newUser.role_id }
      })
      const TokenGenerated: TokenGenerate = {
        email: newUser.email,
        full_name: newUser.full_name,
        id: newUser.id,
        role: newUser.role_id,
        role_name: role_data?.role_name || 'user'
      }
      const accessToken = await jwtServices.generatePairToken(TokenGenerated)
      return this.generateResponse(TokenGenerated, accessToken, next)
    } else {
      const TokenGenerated: TokenGenerate = {
        email: existUser.email,
        full_name: existUser.full_name,
        id: existUser.id,
        role: existUser.role_id,
        role_name: existUser.role.role_name
      }
      const accessToken = await jwtServices.generatePairToken(TokenGenerated)
      return this.generateResponse(TokenGenerated, accessToken, next)
    }
  }

  private async verifyGoogle(idToken: string) {
    const decodedUser: UserRecord = await verifyToken(idToken)

    const user = {
      email: decodedUser.email,
      name: decodedUser.displayName,
      avatar: decodedUser.photoURL
    }

    return user
  }
}
export default new authServices()

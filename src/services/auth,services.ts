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

  public async login({ email, password }: UserLoginParams, res: Response, next: NextFunction) {
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
        role_id: 'ba97f3f8-c720-4ae3-b817-d1c1e4e5adb7',
        avatar: 'https://i.pinimg.com/736x/3b/72/62/3b72621cba7e1b12facb8cd223de9957.jpg'
      }
    })
    return newUser
  }
}
export default new authServices()

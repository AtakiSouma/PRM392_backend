
import jwt from 'jsonwebtoken'
import { NextFunction } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { TokenGenerate } from '~/constants/types/auth.types'

class JwtServices {
  public generatePairToken(data: TokenGenerate) {
    const secret_key = process.env.SECRET_KEY || 'my_secret_key'
    const accessToken = jwt.sign(data, secret_key, {
      subject: data.id,
      expiresIn: 60 * 60 * 1000,
      algorithm: 'HS256'
    })
    return accessToken
  }
  public verifyToken(token: string, next: NextFunction) {
    const secret_key = process.env.SECRET_KEY || 'my_secret_key'
    try {
      const payload = jwt.verify(token, secret_key)
      return payload
    } catch (err) {
      console.log(err)
      return next(new ErrorHandler('You are not authenticated', HttpStatusCodes.UNAUTHORIZED))
    }
  }
}
export default new JwtServices()

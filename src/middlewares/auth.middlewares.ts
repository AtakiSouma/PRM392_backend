import { NextFunction, Request, Response } from 'express'
import { CatchAsyncError } from './catchAsyncError.'
import ErrorHandler from '~/utils/errorHandler'
import jwtServices from '~/services/jwt.services'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { JwtPayload } from 'jsonwebtoken'

const MiddleWareController = {
  isAuthenticated: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')
      if (!token) {
        return next(new ErrorHandler('Please login to access this resources', HttpStatusCodes.UNAUTHORIZED))
      }
      const accessToken = token.split(' ')[1]
      const payload = jwtServices.verifyToken(accessToken, next) as JwtPayload
      console.log(payload)
      if (!payload) {
        return next(new ErrorHandler('You are not authenticated', HttpStatusCodes.UNAUTHORIZED))
      }
      res.locals.payload = payload
      next()
    } catch (error) {
      console.log(error)
      return next(new ErrorHandler('Internal server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}
export default MiddleWareController

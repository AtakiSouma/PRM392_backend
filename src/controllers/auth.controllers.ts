import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import authServices from '~/services/auth.services'
import { sendSuccessResponse } from '~/constants/successResponse'

const authController = {
  login: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body
      if (!email || !password) {
        return next(new ErrorHandler('Invalid input', HttpStatusCodes.NOT_FOUND))
      }
      const user = await authServices.login({ email, password }, res, next)
      if (user) sendSuccessResponse(res, HttpStatusCodes.OK, user)
    } catch (error) {
      console.log(error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  register: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, confirm_password, full_name } = req.body
      if (!email || !password || !full_name || !confirm_password) {
        return next(new ErrorHandler('Invalid input', HttpStatusCodes.NOT_FOUND))
      }
      const user = await authServices.register({ email, password, confirm_password, full_name }, next)
      if (user) sendSuccessResponse(res, HttpStatusCodes.OK, user)
    } catch (error) {
      console.log(error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}

export default authController

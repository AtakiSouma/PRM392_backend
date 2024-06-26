import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import authServices from '~/services/auth.services'
import { sendSuccessResponse } from '~/constants/successResponse'
import prisma from '~/libs/prisma'

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
  }),
  verification: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body
      const existEmail = await prisma.users.findUnique({ where: { email: email } })
      if (existEmail) {
        return next(new ErrorHandler('Email has been registered', HttpStatusCodes.CONFLICT))
      }
      if (!email) {
        return next(new ErrorHandler('Invalid input', HttpStatusCodes.NOT_FOUND))
      }
      const user = await authServices.verification(email, next)
      if (user) sendSuccessResponse(res, HttpStatusCodes.OK, user)
    } catch (error) {
      console.log(error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  loginwithgoogle: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body
     
      if (!idToken) {
        return next(new ErrorHandler('id token not found', HttpStatusCodes.NOT_FOUND))
      }
      if (!idToken) {
        return next(new ErrorHandler('Invalid input', HttpStatusCodes.NOT_FOUND))
      }
      const user = await authServices.loginGoogle(idToken, next)
      if (user) sendSuccessResponse(res, HttpStatusCodes.OK, user)
    } catch (error) {
      console.log(error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}

export default authController

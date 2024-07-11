import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { sendSuccessResponse } from '~/constants/successResponse'
import roleServices from '~/services/role.services'
import orderServices from '~/services/order.services'
const ordersController = {
  create: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id, cartItems } = req.body
      const item = await orderServices.create(user_id, cartItems, next)
      return sendSuccessResponse(res, HttpStatusCodes.CREATED, item)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),

  getListOrder: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params
      const item = await orderServices.getOrder(userId, next)
      return sendSuccessResponse(res, HttpStatusCodes.CREATED, item)
    } catch (error) {
      console.log('Error', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  getAllOrder: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await orderServices.getAllOrder(next)
      return sendSuccessResponse(res, HttpStatusCodes.CREATED, item)
    } catch (error) {
      console.log('Error', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  updateCompleted: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const item = await orderServices.updateOrderCompleted(id, next)
      return sendSuccessResponse(res, HttpStatusCodes.OK, item)
    } catch (error) {
      console.log('Error', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  updateCanceled: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const item = await orderServices.updateOrderCancel(id, next)
      return sendSuccessResponse(res, HttpStatusCodes.OK, item)
    } catch (error) {
      console.log('Error', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}
export default ordersController

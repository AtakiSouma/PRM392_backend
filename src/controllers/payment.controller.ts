import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { sendSuccessResponse } from '~/constants/successResponse'
import paymentSevices from '~/services/payment.sevices'
const paymentController = {
  create: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { order_data } = req.body
      const item = await paymentSevices.createPayment(order_data, 5000)
      return sendSuccessResponse(res, HttpStatusCodes.CREATED, item)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  callback: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await paymentSevices.callBackZaloPay(req)
      return sendSuccessResponse(res, HttpStatusCodes.CREATED, item)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}
export default paymentController

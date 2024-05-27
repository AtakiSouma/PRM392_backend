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
  })
}
export default ordersController

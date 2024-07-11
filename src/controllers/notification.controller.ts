import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { sendSuccessResponse, sendSuccessResponseString } from '~/constants/successResponse'
import { IPaginationParams } from '~/constants/types/pagination.types'
import brandServices from '~/services/brand.services'
import messageServices from '~/services/message.services'
import notificationServices from '~/services/notification.services'
const NotificationController = {
  create: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { token, title, body } = req.body
    try {
      if (!token || !title || !body) {
        return next(new ErrorHandler('Invalid Input', HttpStatusCodes.NOT_FOUND))
      }
      const newMessage = await notificationServices.sendNotification(next, token, title, body)
      if (newMessage) return sendSuccessResponseString(res, HttpStatusCodes.CREATED, newMessage)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}
export default NotificationController

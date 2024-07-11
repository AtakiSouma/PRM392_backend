import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { sendSuccessResponse } from '~/constants/successResponse'
import { IPaginationParams } from '~/constants/types/pagination.types'
import brandServices from '~/services/brand.services'
import messageServices from '~/services/message.services'
const MessageController = {
  create: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId, images, senderId, text } = req.body
    try {
      if (!conversationId || !senderId) {
        return next(new ErrorHandler('Invalid Input', HttpStatusCodes.NOT_FOUND))
      }
      const newMessage = await messageServices.createMessages(next, { conversationId, images, senderId, text })
      if (newMessage) return sendSuccessResponse(res, HttpStatusCodes.CREATED, newMessage)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  getListMessage: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId } = req.params
    try {
      if (!conversationId) {
        return next(new ErrorHandler('Invalid Input', HttpStatusCodes.NOT_FOUND))
      }
      const newMessage = await messageServices.getAllMessages(conversationId)
      if (newMessage) return sendSuccessResponse(res, HttpStatusCodes.CREATED, newMessage)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}
export default MessageController

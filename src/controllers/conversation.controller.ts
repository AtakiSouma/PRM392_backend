import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { sendSuccessResponse } from '~/constants/successResponse'
import { IPaginationParams } from '~/constants/types/pagination.types'
import brandServices from '~/services/brand.services'
import { IConversationParams } from '~/constants/types/conversation.types'
import conversationServices from '~/services/conversation.services'
const ConversationController = {
  create: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { lastMessage, lastMessageId, members }: IConversationParams = req.body
    try {
      if (!members) {
        return next(new ErrorHandler('Invalid Input', HttpStatusCodes.NOT_FOUND))
      }
      const newItem = await conversationServices.createConversation(next, {
        lastMessage,
        lastMessageId,
        members
      })
      if (newItem) return sendSuccessResponse(res, HttpStatusCodes.CREATED, newItem)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),

  getallConversationByUser: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params
    try {
      if (!userId) {
        return next(new ErrorHandler('Invalid Input', HttpStatusCodes.NOT_FOUND))
      }
      const new_conversation = await conversationServices.getConversationWithUser(next, userId)
      if (new_conversation) return sendSuccessResponse(res, HttpStatusCodes.CREATED, new_conversation)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  updateLastMessages: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { conversationId } = req.params
    const { lastMessage, lastMessageId } = req.body
    try {
      if (!lastMessage || !lastMessageId) {
        return next(new ErrorHandler('Invalid Input', HttpStatusCodes.NOT_FOUND))
      }
      const new_conversation = await conversationServices.updateLastMessages(
        next,
        lastMessage,
        lastMessageId,
        conversationId
      )
      if (new_conversation) return sendSuccessResponse(res, HttpStatusCodes.CREATED, new_conversation)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}
export default ConversationController

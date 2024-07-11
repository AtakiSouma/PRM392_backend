import { RoleParams } from '~/constants/types/role.types'
import { NextFunction, Request, Response } from 'express'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import prisma from '~/libs/prisma'
import ErrorHandler from '~/utils/errorHandler'
import { IConversationParams } from '~/constants/types/conversation.types'
import { IMessageParams } from '~/constants/types/message.types'
import cloudinary from 'cloudinary'
import uploadOneImages from './images.sevices'
import imagesSevices from './images.sevices'

class messageServices {
  public async createMessages(next: NextFunction, { conversationId, images, senderId, text }: IMessageParams) {
    try {
      let images_url
      if (images) {
        images_url = await imagesSevices.uploadOneImages(images, 'message', next)

        if (!images_url) {
          return next(new ErrorHandler('Failed to upload image', HttpStatusCodes.BAD_REQUEST))
        }
      }
      const new_messages = await prisma.message.create({
        data: {
          conversationId: conversationId,
          images: images_url,
          senderId: senderId,
          text: text
        }
      })
      return new_messages
    } catch (error) {
      console.error('Internal Server Error:', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  public async getAllMessages(conversationId: string) {
    const all_messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    return all_messages
  }
}
export default new messageServices()

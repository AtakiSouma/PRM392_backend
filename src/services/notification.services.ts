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
import admin, { ServiceAccount } from 'firebase-admin'
import { firebaseApp } from '~/firebase/firebase'

class notificationServices {
  public async sendNotification(next: NextFunction, token: string, title: string, body: string) {
    try {
      const messageNotification = {
        notification: {
          title: title,
          body: body
        },
        token: token
      }
      try {
        const response = await admin.messaging().send(messageNotification)
        console.log('Successfully sent message:', response)

        return response
      } catch (error) {
        console.log('send notification', error)
        return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
      }
    } catch (error) {
      console.error('Internal Server Error:', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }
}
export default new notificationServices()

import { RoleParams } from '~/constants/types/role.types'
import { NextFunction, Request, Response } from 'express'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import prisma from '~/libs/prisma'
import ErrorHandler from '~/utils/errorHandler'
import { IConversationParams } from '~/constants/types/conversation.types'

class conversationServices {
  public async createConversation(next: NextFunction, { lastMessage, lastMessageId, members }: IConversationParams) {
    try {
      if (members.length !== 2) {
        return next(new ErrorHandler('Conversation creation must be exactly 2 members', HttpStatusCodes.CONFLICT))
      }
      const uniqueMembers = new Set(members)
      if (uniqueMembers.size !== members.length) {
        return next(new ErrorHandler('Conversation members must be unique', HttpStatusCodes.CONFLICT))
      }
      // Generate groupTitle based on user IDs
      const sortedMembers = Array.from(uniqueMembers).sort()
      const groupTitle = sortedMembers.join('_')
      const isConversationExist = await prisma.conversation.findUnique({
        where: { groupTitle },
        include: {
          members: {
            include: {
              user: {
                select: {
                  avatar: true,
                  email: true,
                  full_name: true,
                  id: true
                }
              }
            }
          }
        }
      })
      if (isConversationExist) {
        const conversation = isConversationExist
        return conversation
      } else {
        const newConversation = await prisma.conversation.create({
          data: {
            groupTitle: groupTitle,
            lastMessage: lastMessage,
            lastMessageId: lastMessageId
          }
        })
        const conversationMembers = await prisma.conversationMember.createMany({
          data: members.map((userId) => ({
            userId,
            conversationId: newConversation.id
          }))
        })
        const conversationData = await prisma.conversation.findUnique({
          where: { id: newConversation.id },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    avatar: true,
                    email: true,
                    full_name: true,
                    id: true
                  }
                }
              }
            }
          }
        })
        return conversationData
      }
    } catch (error) {
      console.error('Internal Server Error:', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }
  public async getConversationWithUser(next: NextFunction, userId: string) {
    try {
      const isConversationExist = await prisma.conversation.findMany({
        where: {
          members: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  avatar: true,
                  email: true,
                  full_name: true,
                  id: true
                }
              }
            }
          }
        }
      })
      return isConversationExist
    } catch (error) {
      console.error('Internal Server Error:', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }
  public async updateLastMessages(
    next: NextFunction,
    lastMessage: string,
    lastMessageId: string,
    conversationId: string
  ) {
    try {
      const conversation = await prisma.conversation.findUnique({
        where: {
          id: conversationId
        }
      })
      if (!conversation) {
        return next(new ErrorHandler('Could not find conversation', HttpStatusCodes.NOT_FOUND))
      }
      const updatedConversation = await prisma.conversation.update({
        where: {
          id: conversationId
        },
        data: {
          lastMessage: lastMessage,
          lastMessageId: lastMessageId,
          updatedAt: new Date()
        }
      })
      return updatedConversation
    } catch (error) {
      console.error('Internal Server Error:', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }
}
export default new conversationServices()

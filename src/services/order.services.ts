import { RoleParams } from '~/constants/types/role.types'
import { NextFunction, Request, Response } from 'express'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import prisma from '~/libs/prisma'
import ErrorHandler from '~/utils/errorHandler'
import paymentSevices from './payment.sevices'
import path from 'node:path'
import ejs, { promiseImpl } from 'ejs'
import { sendMail } from '~/utils/sendMail'
import { generateOrderName } from '~/utils/GenerateOrderName'
interface ICartItem {
  productId: string
  quantity: number
}
class orderServices {
  public async create(user_id: string, cartItems: ICartItem[], next: NextFunction) {
    try {
      if (cartItems.length === 0) {
        return next(new ErrorHandler('Giỏ hàng trống', HttpStatusCodes.BAD_REQUEST))
      }

      let totalPrice = 0

      const orderItemsData = await Promise.all(
        cartItems.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId }
          })

          if (!product) {
            throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại`)
          }
          totalPrice += product.discountPrice * item.quantity
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.discountPrice
          }
        })
      )
      const order = await prisma.order.create({
        data: {
          orderName: generateOrderName(),
          userId: user_id,
          note: 'Order Start',
          totalPrice: totalPrice,
          status: 'Processing'
        }
      })
      // Thêm các mục vào bảng OrderItem
      for (const item of orderItemsData) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }
        })
      }
      console.log('orderr-data', order)
      console.log('price', totalPrice)
      const payment_data = await paymentSevices.createPayment(order, totalPrice)
      return {
        payment_data,
        order
      }
    } catch (error) {
      console.error('Lỗi khi tạo đơn hàng:', error)
      return next(new ErrorHandler('Lỗi khi tạo đơn hàng', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }
  public async getOrder(userId: string, next: NextFunction) {
    const user = await prisma.users.findUnique({
      where: {
        id: userId
      }
    })
    if (!user) {
      return next(new ErrorHandler('User not found', HttpStatusCodes.UNAUTHORIZED))
    }
    const order = await prisma.order.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true
          }
        },
        _count: true,
        OrderItem: {
          include: {
            product: {
              select: {
                name: true,
                ProductImages: {
                  select: {
                    image_url: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return order
  }
  public async getAllOrder(next: NextFunction) {
    const order = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            address: true,
            phone_number: true,
            fcmToken: true
          }
        },
        _count: true,

        OrderItem: {
          include: {
            product: {
              select: {
                name: true,
                ProductImages: {
                  select: {
                    image_url: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return order
  }
  public async updateOrderCompleted(orderId: string, next: NextFunction) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId
      }
    })
    if (!order) {
      return next(new ErrorHandler('Order not found', HttpStatusCodes.NOT_FOUND))
    }

    const update = await prisma.order.update({
      where: {
        id: orderId
      },
      select: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      data: {
        status: 'Completed'
      }
    })
    const data = { order: update }
    const html = await ejs.renderFile(path.join(__dirname, '../mails//sendordercofirm.ejs'), data)
    try {
      await sendMail({
        email: update.user.email,
        subject: 'Verification email code',
        template: 'sendordercofirm.ejs',
        data
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
    return update
  }
  public async updateOrderCancel(orderId: string, next: NextFunction) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId
      }
    })
    if (!order) {
      return next(new ErrorHandler('Order not found', HttpStatusCodes.NOT_FOUND))
    }
    const update = await prisma.order.update({
      where: {
        id: orderId
      },
      data: {
        status: 'Canceled'
      }
    })
    return update
  }
}
export default new orderServices()

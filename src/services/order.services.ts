import { RoleParams } from '~/constants/types/role.types'
import { NextFunction, Request, Response } from 'express'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import prisma from '~/libs/prisma'
import ErrorHandler from '~/utils/errorHandler'
import paymentSevices from './payment.sevices'
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
      console.log("orderr-data" , order);
      console.log("price",totalPrice)
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
}
export default new orderServices()

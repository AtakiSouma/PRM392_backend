import express from 'express'
import roleRouter from './role.route'
import authRouter from './auth.route'
import categoryRouter from './category.route'
import brandRouter from './brand.route'
import productRouter from './products.route'
import orderRouter from './order.route'
import paymentRouter from './payment.route'
import conversationRouter from './conversation.route'
import messageRouter from './message.route'
import notificationRouter from "./notification.route"
export function route(app: express.Express) {
  app.use('/api/v1/role', roleRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/category', categoryRouter)
  app.use('/api/v1/brand', brandRouter)
  app.use('/api/v1/product', productRouter)
  app.use('/api/v1/order', orderRouter)
  app.use('/api/v1/payment', paymentRouter)
  app.use('/api/v1/conversation', conversationRouter)
  app.use('/api/v1/message', messageRouter)
  app.use('/api/v1/notification', notificationRouter)
}

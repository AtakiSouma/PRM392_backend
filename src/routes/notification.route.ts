import express, { Request, Response, Application } from 'express'
import BrandController from '~/controllers/brand.controller'
import MessageController from '~/controllers/messages.controller'
import NotificationController from '~/controllers/notification.controller'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', MiddleWareController.isAuthenticated, NotificationController.create)

export default router

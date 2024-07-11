import express, { Request, Response, Application } from 'express'
import BrandController from '~/controllers/brand.controller'
import MessageController from '~/controllers/messages.controller'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', MiddleWareController.isAuthenticated, MessageController.create)
router.get('/:conversationId', MiddleWareController.isAuthenticated, MessageController.getListMessage)

export default router

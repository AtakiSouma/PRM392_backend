import express, { Request, Response, Application } from 'express'
import ConversationController from '~/controllers/conversation.controller'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', MiddleWareController.isAuthenticated, ConversationController.create)
router.get('/:userId', MiddleWareController.isAuthenticated, ConversationController.getallConversationByUser)
router.put('/:conversationId', MiddleWareController.isAuthenticated, ConversationController.updateLastMessages)

export default router

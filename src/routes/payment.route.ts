import express, { Request, Response, Application } from 'express'
import paymentController from '~/controllers/payment.controller'

import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', MiddleWareController.isAuthenticated, paymentController.create)
router.post('/callback', paymentController.callback)

export default router

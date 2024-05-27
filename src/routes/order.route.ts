import express, { Request, Response, Application } from 'express'
import categoryController from '~/controllers/category.controller'
import ordersController from '~/controllers/order.controller'
import ProductController from '~/controllers/product.controller'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', MiddleWareController.isAuthenticated, ordersController.create)

export default router

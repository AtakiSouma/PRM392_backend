import express, { Request, Response, Application } from 'express'
import categoryController from '~/controllers/category.controller'
import ordersController from '~/controllers/order.controller'
import ProductController from '~/controllers/product.controller'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', MiddleWareController.isAuthenticated, ordersController.create)
router.get('/:userId', MiddleWareController.isAuthenticated, ordersController.getListOrder)
router.get('/', MiddleWareController.isAuthenticated, ordersController.getAllOrder)

router.put('/completed/:id', MiddleWareController.isAuthenticated, ordersController.updateCompleted)
router.put('/canceled/:id', MiddleWareController.isAuthenticated, ordersController.updateCanceled)
export default router

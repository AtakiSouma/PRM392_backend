import express, { Request, Response, Application } from 'express'
import categoryController from '~/controllers/category.controller'
import ProductController from '~/controllers/product.controller'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', MiddleWareController.isAuthenticated, ProductController.create)
router.get('/',  ProductController.find)
router.get('/:id', ProductController.findOne)
export default router

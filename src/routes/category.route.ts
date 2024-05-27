import express, { Request, Response, Application } from 'express'
import categoryController from '~/controllers/category.controller'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', MiddleWareController.isAuthenticated, categoryController.create)
router.get('/', MiddleWareController.isAuthenticated, categoryController.find)
export default router

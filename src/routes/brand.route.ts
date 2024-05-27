import express, { Request, Response, Application } from 'express'
import BrandController from '~/controllers/brand.controller'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', MiddleWareController.isAuthenticated, BrandController.create)
router.get('/', MiddleWareController.isAuthenticated, BrandController.find)
export default router

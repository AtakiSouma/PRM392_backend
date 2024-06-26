import express, { Request, Response, Application } from 'express'
import authController from '~/controllers/auth.controllers'
import rolesController from '~/controllers/role.controllerrs'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/verification', authController.verification)
export default router

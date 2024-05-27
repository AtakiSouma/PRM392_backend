import express, { Request, Response, Application } from 'express'
import rolesController from '~/controllers/role.controllerrs'
import MiddleWareController from '~/middlewares/auth.middlewares'

const router = express.Router()

router.post('/', rolesController.createNewRole)
router.get('/', rolesController.getAllRoles)

export default router

import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { sendSuccessResponse } from '~/constants/successResponse'
import roleServices from '~/services/role.services'
const rolesController = {
  createNewRole: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { role_name, role_description } = req.body
    try {
      if (!role_name || !role_description) {
        return next(new ErrorHandler('Invalid Input', HttpStatusCodes.NOT_FOUND))
      }
      const newRole = await roleServices.createRole({ role_description, role_name }, next)
      return sendSuccessResponse(res, HttpStatusCodes.CREATED, newRole)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  getAllRoles: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await roleServices.getAllRole()
      return sendSuccessResponse(res, HttpStatusCodes.OK, roles)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}
export default rolesController

import { RoleParams } from '~/constants/types/role.types'
import { NextFunction, Request, Response } from 'express'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import prisma from '~/libs/prisma'
import ErrorHandler from '~/utils/errorHandler'
class RoleService {
  public async createRole({ role_name, role_description }: RoleParams, next: NextFunction) {
    const existingRole = await prisma.roles.findUnique({
      where: { role_name: role_name }
    })
    if (existingRole) {
      return next(new ErrorHandler('Role is existed', HttpStatusCodes.CONFLICT))
    }
    const newRole = await prisma.roles.create({
      data: {
        role_name: role_name,
        role_description: role_description
      }
    })
    return newRole
  }
  public async getAllRole() {
    const roles = await prisma.roles.findMany()
    return roles
  }
}
export default new RoleService()

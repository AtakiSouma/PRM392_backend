import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { sendSuccessResponse } from '~/constants/successResponse'
import { IPaginationParams } from '~/constants/types/pagination.types'
import brandServices from '~/services/brand.services'
const BrandController = {
  create: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, image } = req.body
    try {
      if (!name || !description || !image) {
        return next(new ErrorHandler('Invalid Input', HttpStatusCodes.NOT_FOUND))
      }
      const newItem = await brandServices.createBrand({ description, image, name }, next)
      if (newItem) return sendSuccessResponse(res, HttpStatusCodes.CREATED, newItem)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),

  find: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : ''
      const page = typeof req.query.page === 'string' ? parseInt(req.query.page, 10) : 1
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 10

      const items = await brandServices.findAll({ search, page, limit })
      if (items) return sendSuccessResponse(res, HttpStatusCodes.OK, items)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}
export default BrandController

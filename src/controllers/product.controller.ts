import { CatchAsyncError } from '~/middlewares/catchAsyncError.'
import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '~/utils/errorHandler'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import { sendSuccessResponse } from '~/constants/successResponse'
import { IPaginationParams } from '~/constants/types/pagination.types'
import brandServices from '~/services/brand.services'
import productServices from '~/services/product.services'
const ProductController = {
  create: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const { brandId, categoryId, description, discountPrice, name, originalPrice, quantity, tags, images } = req.body
    try {
      if (
        !brandId ||
        !categoryId ||
        !description ||
        !originalPrice ||
        !discountPrice ||
        !quantity ||
        !tags ||
        !images ||
        !name
      ) {
        return next(new ErrorHandler('Invalid Input', HttpStatusCodes.NOT_FOUND))
      }
      const newItem = await productServices.create(
        { brandId, categoryId, description, discountPrice, name, originalPrice, quantity, tags, images },
        next
      )
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

      const items = await productServices.findAll({ search, page, limit })
      if (items) return sendSuccessResponse(res, HttpStatusCodes.OK, items)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }),
  findOne: CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      const items = await productServices.findOne(id)
      if (items) return sendSuccessResponse(res, HttpStatusCodes.OK, items)
    } catch (error) {
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  })
}
export default ProductController

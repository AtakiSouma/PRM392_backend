import { RoleParams } from '~/constants/types/role.types'
import { NextFunction, Request, Response } from 'express'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import prisma from '~/libs/prisma'
import ErrorHandler from '~/utils/errorHandler'
import cloudinary from 'cloudinary'
import { IPaginationParams } from '~/constants/types/pagination.types'
import { describe } from 'node:test'
import { IBrandParams } from '~/constants/types/brand.type'

class BrandServices {
  public async createBrand(
    { name, description, image }: IBrandParams,

    next: NextFunction
  ) {
    try {
      const existingBrand = await prisma.brand.findUnique({
        where: { name: name }
      })

      if (existingBrand) {
        return next(new ErrorHandler('Brand already exists', HttpStatusCodes.CONFLICT))
      }

      let uploadedImageUrl
      if (image) {
        try {
          const myCloud = await cloudinary.v2.uploader.upload(image, {
            folder: 'brands'
          })
          uploadedImageUrl = myCloud.secure_url
        } catch (error) {
          console.error('Image upload error:', error)
          return next(new ErrorHandler('Image upload error', HttpStatusCodes.BAD_REQUEST))
        }
      }
      if (!uploadedImageUrl) {
        return next(new ErrorHandler('Image upload error', HttpStatusCodes.BAD_REQUEST))
      }
      const newBrand = await prisma.brand.create({
        data: {
          name: name,
          description: description,
          image: uploadedImageUrl
        }
      })

      // Send the response back to the client
      return newBrand
    } catch (error) {
      console.error('Internal Server Error:', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  public async findAll({ limit, page, search }: IPaginationParams) {
    const Brand = await prisma.brand.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        name: {
          contains: search
        }
      }
    })
    const totalCount = await prisma.brand.count({
      where: {
        name: {
          contains: search
        }
      }
    })
    const data = Brand.map((item) => {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    })
    const response = {
      data,
      totalCount: totalCount,
      pageCount: Math.ceil(totalCount / limit)
    }

    return response
  }
}
export default new BrandServices()

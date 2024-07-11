import { RoleParams } from '~/constants/types/role.types'
import { NextFunction, Request, Response } from 'express'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import prisma from '~/libs/prisma'
import ErrorHandler from '~/utils/errorHandler'
import { ICategoryParams } from '~/constants/types/category.types'
import cloudinary from 'cloudinary'
import { IPaginationParams } from '~/constants/types/pagination.types'
import { describe } from 'node:test'
import { IProductParams } from '~/constants/types/product.types'

class productServices {
  public async create(
    { brandId, categoryId, description, discountPrice, name, originalPrice, quantity, tags, images }: IProductParams,

    next: NextFunction
  ) {
    try {
      // Parallelize database checks

      const [existProduct, existCategory, existBrand] = await Promise.all([
        prisma.product.findUnique({ where: { name: name } }),
        prisma.category.findUnique({ where: { id: categoryId } }),
        prisma.brand.findUnique({ where: { id: brandId } })
      ])
      if (existProduct) {
        return next(new ErrorHandler('Product already exists', HttpStatusCodes.CONFLICT))
      }

      if (!existCategory) {
        return next(new ErrorHandler('Category not found', HttpStatusCodes.NOT_FOUND))
      }

      if (!existCategory) {
        return next(new ErrorHandler('Category not found', HttpStatusCodes.NOT_FOUND))
      }
      const uploadPromises = images.map((imagePath) => {
        return cloudinary.v2.uploader.upload(imagePath, {
          folder: 'products'
        })
      })
      const uploadResults = await Promise.all(uploadPromises)
      const imageUrls = uploadResults.map((result) => result.secure_url)

      const newProduct = await prisma.product.create({
        data: {
          name: name,
          description: description,
          discountPrice: discountPrice,
          originalPrice: originalPrice,
          quantity: quantity,
          ratings: 5,
          tags: tags,
          sold_out: 0,
          brandId: brandId,
          categoryId: categoryId
        }
      })
      const productImages = imageUrls.map((imageUrl) => ({
        image_url: imageUrl,
        productId: newProduct.id
      }))
      await prisma.productImages.createMany({
        data: productImages
      })
      return newProduct
    } catch (error) {
      console.error('Internal Server Error:', error)
      return next(new ErrorHandler('Internal Server Error', HttpStatusCodes.INTERNAL_SERVER_ERROR))
    }
  }

  public async findAll({ limit, page, search }: IPaginationParams) {
    const products = await prisma.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        name: {
          contains: search
        }
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        ProductImages: {
          select: {
            id: true,
            image_url: true
          }
        }
      }
    })
    const totalCount = await prisma.product.count({
      where: {
        name: {
          contains: search
        }
      }
    })
    const data = products.map((item) => {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        tags: item.tags,
        originalPrice: item.originalPrice,
        discountPrice: item.discountPrice,
        quantity: item.quantity,
        ratings: item.ratings,
        status: item.status,
        sold_out: item.sold_out,
        brand: item.brand,
        category: item.category,
        images: item.ProductImages,
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
  public async findOne(id: string) {
    const product = await prisma.product.findUnique({
      where: {
        id: id
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        ProductImages: {
          select: {
            id: true,
            image_url: true
          }
        }
      }
    })

    return product
  }
}
export default new productServices()

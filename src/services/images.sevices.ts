import cloudinary from 'cloudinary'
import { NextFunction } from 'express'
import HttpStatusCodes from '~/constants/HttpStatusCodes'
import ErrorHandler from '~/utils/errorHandler'
class ImagesServices {
  public async uploadOneImages(image: string, folder_name: string, next: NextFunction) {
    let uploadedImageUrl
    if (image) {
      try {
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: `${folder_name}`
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
    return uploadedImageUrl
  }
}

export default new ImagesServices()

import { Request, Response, NextFunction } from 'express'
import HttpStatusCodes from '../../constants/HttpStatusCodes'

export default class CustomError extends Error {
  public statusCode: HttpStatusCodes

  public constructor(message: string, statusCode: HttpStatusCodes) {
    super(message)
    this.statusCode = statusCode
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export const generateError = (message: string, statusCode: HttpStatusCodes): CustomError => {
  const error = new CustomError(message, statusCode)
  return error
}

export const errorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof CustomError) {
    return res.status(error.statusCode).send({ error: { message: error.message, status: error.statusCode } })
  }

  return res.status(500).send({ error: { message: error, status: 500 } })
}

export interface IError {
  message: string
  statusCode: HttpStatusCodes
}

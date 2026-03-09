import fp from 'fastify-plugin'
import { ZodError } from 'zod'
import { BaseException, ExceptionHttpMapper } from '../errors'
import { logger } from '../logger'

export const errorHandlerPlugin = fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof BaseException) {
      if (error.reportable) {
        logger.error({ err: error, method: request.method, url: request.url, metadata: error.metadata }, error.message)
      }
      const { status, error: errorText } = ExceptionHttpMapper.toHttp(error.code)
      return reply.status(status).send({ status, error: errorText, message: error.message })
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        status: 400,
        error: 'Bad Request',
        message: 'Validation error',
        details: error.issues,
      })
    }

    if ((error as { validation?: unknown }).validation) {
      return reply.status(400).send({
        status: 400,
        error: 'Bad Request',
        message: (error as Error).message,
      })
    }

    logger.error({ err: error, method: request.method, url: request.url }, 'Internal server error')
    return reply.status(500).send({
      status: 500,
      error: 'Internal Server Error',
      message: 'Internal server error',
    })
  })
})

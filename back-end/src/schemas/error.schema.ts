import { z } from 'zod'

const ErrorResponse = (status: number, error: string) =>
  z.object({
    status: z.literal(status),
    error: z.literal(error),
    message: z.string(),
  })

const ValidationErrorResponse = z.object({
  status: z.literal(400),
  error: z.literal('Bad Request'),
  message: z.string(),
  details: z.array(z.unknown()).optional(),
})

export const BadRequestResponse = ErrorResponse(400, 'Bad Request')
export const NotFoundResponse = ErrorResponse(404, 'Not Found')
export const InternalErrorResponse = ErrorResponse(500, 'Internal Server Error')
export { ValidationErrorResponse }

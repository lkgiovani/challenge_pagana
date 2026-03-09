// Exception codes (seguindo padrão do boilerplate-api)
export enum ExceptionCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unprocessable = 'UNPROCESSABLE',
  Internal = 'INTERNAL',
}

// HTTP mapping centralizado
type HttpMapping = { status: number; error: string }

const HTTP_MAPPINGS: Record<ExceptionCode, HttpMapping> = {
  [ExceptionCode.BadRequest]: { status: 400, error: 'Bad Request' },
  [ExceptionCode.NotFound]: { status: 404, error: 'Not Found' },
  [ExceptionCode.Unprocessable]: { status: 422, error: 'Unprocessable Entity' },
  [ExceptionCode.Internal]: { status: 500, error: 'Internal Server Error' },
}

export class ExceptionHttpMapper {
  static toHttp(code: ExceptionCode): HttpMapping {
    return HTTP_MAPPINGS[code] ?? { status: 500, error: 'Internal Server Error' }
  }
}

// Base exception (seguindo padrão do boilerplate-api)
export class BaseException extends Error {
  readonly code: ExceptionCode
  readonly metadata?: Record<string, unknown>
  readonly reportable: boolean

  constructor({
    message,
    code,
    metadata,
    reportable = false,
  }: {
    message: string
    code: ExceptionCode
    metadata?: Record<string, unknown>
    reportable?: boolean
  }) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.metadata = metadata
    this.reportable = reportable
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// Exceções concretas
export class NotFoundException extends BaseException {
  constructor(message = 'Not found', metadata?: Record<string, unknown>) {
    super({ message, code: ExceptionCode.NotFound, metadata })
  }
}

export class BadRequestException extends BaseException {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super({ message, code: ExceptionCode.BadRequest, metadata })
  }
}

export class UnprocessableException extends BaseException {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super({ message, code: ExceptionCode.Unprocessable, metadata })
  }
}

export class InternalException extends BaseException {
  constructor(metadata?: Record<string, unknown>) {
    super({ message: 'Internal Server Error', code: ExceptionCode.Internal, metadata, reportable: true })
  }
}

// Aliases para retrocompatibilidade (testes e services existentes)
export { BaseException as AppError }
export { NotFoundException as NotFoundError }
export { BadRequestException as ValidationError }

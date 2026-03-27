jest.mock('~/logger/logger', () => ({
  error: jest.fn()
}))

jest.mock('~/utils/getUniqueFields', () => jest.fn())

jest.mock('~/consts/errors', () => ({
  INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR' },
  DOCUMENT_ALREADY_EXISTS: jest.fn(),
  MONGO_SERVER_ERROR: jest.fn(),
  VALIDATION_ERROR: jest.fn()
}))

const errorMiddleware = require('~/middlewares/error')
const logger = require('~/logger/logger')
const getUniqueFields = require('~/utils/getUniqueFields')
const {
  INTERNAL_SERVER_ERROR,
  DOCUMENT_ALREADY_EXISTS,
  MONGO_SERVER_ERROR,
  VALIDATION_ERROR
} = require('~/consts/errors')

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('errorMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should handle MongoServerError with duplicate key (11000)', () => {
    const err = {
      name: 'MongoServerError',
      code: 11000,
      message: 'duplicate key error'
    }

    const res = mockRes()

    getUniqueFields.mockReturnValue(['email'])
    DOCUMENT_ALREADY_EXISTS.mockReturnValue({
      code: 'DOCUMENT_ALREADY_EXISTS',
      message: 'Document exists'
    })

    errorMiddleware(err, {}, res, {})

    expect(logger.error).toHaveBeenCalledWith(err)
    expect(getUniqueFields).toHaveBeenCalledWith(err.message)
    expect(DOCUMENT_ALREADY_EXISTS).toHaveBeenCalledWith(['email'])

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      code: 'DOCUMENT_ALREADY_EXISTS',
      message: 'Document exists'
    })
  })

  test('should handle MongoServerError with other codes', () => {
    const err = {
      name: 'MongoServerError',
      code: 12345,
      message: 'some mongo error'
    }

    const res = mockRes()

    MONGO_SERVER_ERROR.mockReturnValue({
      code: 'MONGO_SERVER_ERROR',
      message: 'some mongo error'
    })

    errorMiddleware(err, {}, res, {})

    expect(logger.error).toHaveBeenCalledWith(err)
    expect(MONGO_SERVER_ERROR).toHaveBeenCalledWith('some mongo error')

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      code: 'MONGO_SERVER_ERROR',
      message: 'some mongo error'
    })
  })

  test('should handle ValidationError', () => {
    const err = {
      name: 'ValidationError',
      message: 'validation failed'
    }

    const res = mockRes()

    VALIDATION_ERROR.mockReturnValue({
      code: 'VALIDATION_ERROR',
      message: 'validation failed'
    })

    errorMiddleware(err, {}, res, {})

    expect(logger.error).toHaveBeenCalledWith(err)
    expect(VALIDATION_ERROR).toHaveBeenCalledWith('validation failed')

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      status: 409,
      code: 'VALIDATION_ERROR',
      message: 'validation failed'
    })
  })

  test('should handle error without status and code', () => {
    const err = { message: 'unexpected' }
    const res = mockRes()

    errorMiddleware(err, {}, res, {})

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      code: INTERNAL_SERVER_ERROR.code,
      message: 'unexpected'
    })
  })

  test('should handle error with status and code', () => {
    const err = {
      status: 403,
      code: 'FORBIDDEN',
      message: 'Access denied'
    }

    const res = mockRes()

    errorMiddleware(err, {}, res, {})

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      status: 403,
      code: 'FORBIDDEN',
      message: 'Access denied'
    })
  })
})

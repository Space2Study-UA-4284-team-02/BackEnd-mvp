const { INVALID_ID } = require('~/consts/errors')

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}))

jest.mock('~/utils/errorsHelper', () => ({
  createError: jest.fn((status, message) => ({ status, message }))
}))

const mongoose = require('mongoose')
const errorsHelper = require('~/utils/errorsHelper')
const idValidation = require('~/middlewares/idValidation')

describe('idValidation middleware', () => {
  const req = {}
  const res = {}
  const next = jest.fn()
  const validId = '507f1f77bcf86cd799439011'
  const invalidId = 'invalid-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call next() if the id is valid', () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(true)
    idValidation(req, res, next, validId)
    expect(next).toHaveBeenCalled()
  })

  it('should throw an error if the id is invalid', () => {
    mongoose.Types.ObjectId.isValid.mockReturnValue(false)
    expect(() => idValidation(req, res, next, invalidId)).toThrow()
    expect(errorsHelper.createError).toHaveBeenCalledWith(400, INVALID_ID)
    expect(next).not.toHaveBeenCalled()
  })
})

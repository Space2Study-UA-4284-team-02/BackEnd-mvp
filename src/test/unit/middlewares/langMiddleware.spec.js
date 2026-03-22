const langMiddleware = require('~/middlewares/appLanguage')
const { INVALID_LANGUAGE } = require('~/consts/errors')

describe('langMiddleware', () => {
  it('sets requested language and calls next if language is supported', () => {
    const req = {
      acceptsLanguages: () => 'en'
    }
    const res = {}
    const next = jest.fn()

    langMiddleware(req, res, next)

    expect(req.lang).toBe('en')
    expect(next).toHaveBeenCalled()
  })

  it('throws error with INVALID_LANGUAGE if language is not supported', () => {
    const req = {
      acceptsLanguages: () => false
    }
    const res = {}
    const next = jest.fn()

    expect(() => langMiddleware(req, res, next)).toThrow(INVALID_LANGUAGE)
  })
})

const { serverInit, serverCleanup, stopServer } = require('~/test/setup')
const {
  lengths: { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH },
  enums: { ROLE_ENUM }
} = require('~/consts/validation')
const errors = require('~/consts/errors')
const tokenService = require('~/services/token')
const Token = require('~/models/token')
const { expectError } = require('~/test/helpers')
const authService = require('~/services/auth')
const googleAuthService = require('~/services/googleAuth')

describe('Auth controller', () => {
  let app, server, signupResponse

  beforeAll(async () => {
    ;({ app, server } = await serverInit())
  })

  beforeEach(async () => {
    signupResponse = await app.post('/auth/signup').send(user)
  })

  afterEach(async () => {
    await serverCleanup()
  })

  afterAll(async () => {
    await stopServer(server)
  })

  const user = {
    role: 'student',
    firstName: 'test',
    lastName: 'test',
    email: 'test@gmail.com',
    password: 'testpass_135'
  }

  describe('Signup endpoint', () => {
    it('should throw validation errors for the firstName field', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, firstName: '12345' })
      const responseForNull = await app.post('/auth/signup').send({ ...user, firstName: null })

      const formatError = errors.NAME_FIELD_IS_NOT_OF_PROPER_FORMAT('firstName')
      const nullError = errors.FIELD_IS_NOT_DEFINED('firstName')
      expectError(422, formatError, responseForFormat)
      expectError(422, nullError, responseForNull)
    })

    it('should throw validation errors for the email format', async () => {
      const responseForFormat = await app.post('/auth/signup').send({ ...user, email: 'test' })
      const responseForType = await app.post('/auth/signup').send({ ...user, email: 312938 })

      const formatError = errors.FIELD_IS_NOT_OF_PROPER_FORMAT('email')
      const typeError = errors.FIELD_IS_NOT_OF_PROPER_TYPE('email', 'string')
      expectError(422, formatError, responseForFormat)
      expectError(422, typeError, responseForType)
    })

    it('should throw validation error for the role value', async () => {
      const signupResponse = await app.post('/auth/signup').send({ ...user, role: 'test' })

      const error = errors.FIELD_IS_NOT_OF_PROPER_ENUM_VALUE('role', ROLE_ENUM)
      expectError(422, error, signupResponse)
    })

    it('should throw validation errors for the password`s length', async () => {
      const responseForMax = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MAX_PASSWORD_LENGTH + 1) })

      const responseForMin = await app
        .post('/auth/signup')
        .send({ ...user, password: '1'.repeat(MIN_PASSWORD_LENGTH - 1) })

      const error = errors.FIELD_IS_NOT_OF_PROPER_LENGTH('password', {
        min: MIN_PASSWORD_LENGTH,
        max: MAX_PASSWORD_LENGTH
      })
      expectError(422, error, responseForMax)
      expectError(422, error, responseForMin)
    })

    it('should throw ALREADY_REGISTERED error', async () => {
      await app.post('/auth/signup').send(user)

      const response = await app.post('/auth/signup').send(user)

      expectError(409, errors.ALREADY_REGISTERED, response)
    })
  })

  describe('Google Auth (login/signup)', () => {
    const fakeToken = 'google-token-123'
    const fakeTokens = {
      accessToken: 'access-token-abc',
      refreshToken: 'refresh-token-def'
    }

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should fail if there is no token or it is wrong type', async () => {
      const noToken = await app.post('/auth/google-auth').send({})
      expect(noToken.status).toBe(400)
      expect(noToken.body.message).toBe('token is required')

      const wrongType = await app.post('/auth/google-auth').send({ token: 123 })
      expect(wrongType.status).toBe(400)
      expect(wrongType.body.message).toBe('token is required')
    })

    it('should log in or sign up with Google and set cookies', async () => {
      jest.spyOn(googleAuthService, 'loginOrSignupWithGoogle').mockResolvedValue({ ...fakeTokens })

      const response = await app
        .post('/auth/google-auth')
        .send({ token: { credential: fakeToken }, role: 'student', language: 'en' })

      // Did we call the service with correct info?
      expect(googleAuthService.loginOrSignupWithGoogle).toHaveBeenCalledWith(fakeToken, 'student', 'en')

      // Check response
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ accessToken: fakeTokens.accessToken })

      // Ensure refreshToken is not leaked in the JSON body
      expect(response.body).not.toHaveProperty('refreshToken')

      // Check cookies (access and refresh tokens should be set)
      const setCookieHeader = response.headers['set-cookie']
      expect(setCookieHeader).toBeDefined()
      expect(Array.isArray(setCookieHeader)).toBe(true)
      expect(setCookieHeader).toEqual(
        expect.arrayContaining([
          expect.stringContaining(`accessToken=${fakeTokens.accessToken}`),
          expect.stringContaining(`refreshToken=${fakeTokens.refreshToken}`)
        ])
      )
    })
  })

  describe('SendResetPasswordEmail endpoint', () => {
    it('should throw USER_NOT_FOUND error', async () => {
      const response = await app.post('/auth/forgot-password').send({ email: 'invalid@gmail.com' })

      expectError(404, errors.USER_NOT_FOUND, response)
    })
  })

  describe('UpdatePassword endpoint', () => {
    let resetToken
    beforeEach(() => {
      const { firstName, email, role } = user

      resetToken = tokenService.generateResetToken({ id: signupResponse.body.userId, firstName, email, role })

      Token.findOne = jest.fn().mockResolvedValue({ save: jest.fn().mockResolvedValue(resetToken) })
    })
    afterEach(() => jest.resetAllMocks())

    it('should throw BAD_RESET_TOKEN error', async () => {
      const response = await app.patch('/auth/reset-password/invalid-token').send({ password: 'valid_pass1' })

      expectError(400, errors.BAD_RESET_TOKEN, response)
    })
  })

  describe('ConfirmEmail endpoint', () => {
    let confirmToken
    beforeEach(() => {
      confirmToken = 'valid-confirmation-token'
      jest.spyOn(authService, 'confirmEmail').mockResolvedValue()
    })

    afterEach(() => jest.restoreAllMocks())

    it('should redirect to the email confirmed page if the token is valid', async () => {
      const response = await app.get(`/auth/confirm-email/${confirmToken}`)

      expect(response.status).toBe(302)
      expect(response.headers.location).toBe(`${process.env.CLIENT_URL}/email-confirmed`)
    })

    it('should throw 404 error if the token is not provided', async () => {
      const response = await app.get('/auth/confirm-email/')

      expectError(404, errors.NOT_FOUND, response)
    })

    it('should throw BAD_CONFIRMATION_TOKEN error if the token is invalid', async () => {
      jest.spyOn(authService, 'confirmEmail').mockRejectedValue({
        status: 400,
        ...errors.BAD_CONFIRMATION_TOKEN
      })

      const response = await app.get('/auth/confirm-email/invalid-token')
      expectError(400, errors.BAD_CONFIRMATION_TOKEN, response)
    })
  })
})

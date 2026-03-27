const googleAuthService = require('~/services/googleAuth')
const { tokenNames } = require('~/consts/auth')
const { oneDayInMs } = require('~/consts/auth')
const {
  config: { COOKIE_DOMAIN }
} = require('~/configs/config')

const googleLoginOrSignup = async (req, res) => {
  const token = req.body?.token?.credential
  const role = req.body?.role
  const language = req.lang

  if (typeof token !== 'string' || !token) {
    return res.status(400).json({ message: 'token is required' })
  }

  const tokens = await googleAuthService.loginOrSignupWithGoogle(token, role || 'student', language || 'en')

  const COOKIE_OPTIONS = {
    maxAge: oneDayInMs,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    domain: COOKIE_DOMAIN
  }

  res.cookie(tokenNames.ACCESS_TOKEN, tokens.accessToken, COOKIE_OPTIONS)
  res.cookie(tokenNames.REFRESH_TOKEN, tokens.refreshToken, COOKIE_OPTIONS)

  // eslint-disable-next-line no-unused-vars
  const { refreshToken, ...safeTokens } = tokens
  res.status(200).json(safeTokens)
}

module.exports = {
  googleLoginOrSignup
}

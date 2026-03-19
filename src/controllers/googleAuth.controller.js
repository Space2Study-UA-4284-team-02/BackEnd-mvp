const googleAuthService = require('~/services/googleAuth.service')
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

  delete tokens.refreshToken

  res.status(200).json(tokens)
}

module.exports = {
  googleLoginOrSignup
}

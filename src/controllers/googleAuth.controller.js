const googleAuthService = require('../services/googleAuth.service')
const { tokenNames } = require('~/consts/auth')
const { oneDayInMs } = require('~/consts/auth')
const {
  config: { COOKIE_DOMAIN }
} = require('~/configs/config')

const googleLoginOrSignup = async (req, res) => {
  const { idToken, role } = req.body
  const language = req.lang

  if (typeof idToken !== 'string') {
    return res.status(400).json({ message: 'idToken is required' })
  }

  const tokens = await googleAuthService.loginOrSignupWithGoogle(idToken, role || 'student', language || 'en')

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

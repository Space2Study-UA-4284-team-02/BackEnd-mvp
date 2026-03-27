const { OAuth2Client } = require('google-auth-library')
const authService = require('~/services/auth')
const { getUserByEmail, createUser } = require('~/services/user')
const { gmailCredentials } = require('~/configs/config')
const errors = require('~/consts/errors')
const crypto = require('crypto')

const client = new OAuth2Client(gmailCredentials.clientId)

const googleAuthService = {
  verifyIdToken: async (token) => {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: gmailCredentials.clientId
    })
    return ticket.getPayload()
  },

  loginOrSignupWithGoogle: async (token, role, language) => {
    const payload = await googleAuthService.verifyIdToken(token)
    const { email, email_verified, given_name, family_name } = payload

    if (!email || !email_verified) {
      throw errors.UNAUTHORIZED
    }

    // fallback if given_name or family_name is not provided by Google, use default values
    const firstName = given_name || 'Unknown'
    const lastName = family_name || 'User'

    let user = await getUserByEmail(email)

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex')
      user = await createUser(role, firstName, lastName, email, randomPassword, language, true)
    }
    return authService.login(email, null, true)
  }
}

module.exports = googleAuthService

const { OAuth2Client } = require('google-auth-library')
const authService = require('~/services/auth')
const { getUserByEmail, createUser } = require('~/services/user')
const { gmailCredentials } = require('~/configs/config')
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
    const { email, given_name: firstName, family_name: lastName } = payload

    let user = await getUserByEmail(email)

    if (!user) {
      const randomPassword = crypto.randomBytes(16).toString('hex')
      user = await createUser(role, firstName, lastName, email, randomPassword, language, true)
    }
    return authService.login(email, null, true)
  }
}

module.exports = googleAuthService

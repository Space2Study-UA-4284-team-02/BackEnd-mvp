const crypto = require('crypto')

function generateSecret() {
  return crypto.randomBytes(64).toString('hex')
}

console.log('JWT_ACCESS_SECRET=' + generateSecret())
console.log('JWT_REFRESH_SECRET=' + generateSecret())
console.log('JWT_RESET_SECRET=' + generateSecret())
console.log('JWT_CONFIRM_SECRET=' + generateSecret())

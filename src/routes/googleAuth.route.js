const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const googleAuthController = require('~/controllers/googleAuth')

router.post('/', asyncWrapper(googleAuthController.googleLoginOrSignup))

module.exports = router

const router = require('express').Router()

const asyncWrapper = require('~/middlewares/asyncWrapper')
const googleAuthController = require('~/controllers/googleAuth')
const langMiddleware = require('../middlewares/appLanguage')

router.post('/', langMiddleware, asyncWrapper(googleAuthController.googleLoginOrSignup))

module.exports = router

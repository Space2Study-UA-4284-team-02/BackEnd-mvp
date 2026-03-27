const router = require('express').Router()

const auth = require('~/routes/auth')
const user = require('~/routes/user')
const email = require('~/routes/email')
const adminInvitation = require('~/routes/adminInvitation')
const question = require('~/routes/question')
const resourcesCategory = require('~/routes/resourcesCategory')
const offer = require('~/routes/offer')
const googleAuth = require('~/routes/googleAuth')

router.use('/auth', auth)
router.use('/auth/google-auth', googleAuth)
router.use('/users', user)
router.use('/send-email', email)
router.use('/admin-invitations', adminInvitation)
router.use('/questions', question)
router.use('/resources-categories', resourcesCategory)
router.use('/offers', offer)

module.exports = router

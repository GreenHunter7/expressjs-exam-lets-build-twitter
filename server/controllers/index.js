const usersController = require('./users-controller')
const tweetController = require('./tweet-controller')
const adminController = require('./admin-controller')

module.exports = {
  users: usersController,
  tweet: tweetController,
  admin: adminController
}

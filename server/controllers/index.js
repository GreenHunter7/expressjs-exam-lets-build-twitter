const usersController = require('./users-controller')
const tweetController = require('./tweet-controller')

module.exports = {
  users: usersController,
  tweet: tweetController
}

const controllers = require('../controllers')
const auth = require('../config/auth')

module.exports = (app, config) => {
  app.get('/', controllers.tweet.list(app, config))
  app.get('/:tagName', controllers.tweet.list(app, config))
  app.get('/users/register', controllers.users.register)
  app.post('/users/create', controllers.users.create)
  app.get('/users/login', controllers.users.login)
  app.post('/users/authenticate', controllers.users.authenticate)
  app.post('/users/logout', controllers.users.logout)

  app.get('/tweet', [].concat(auth.isAuthenticated, controllers.tweet.add(app, config)))
  app.post('/tweet', [].concat(auth.isAuthenticated, controllers.tweet.create(app, config)))

  app.all('*', (req, res) => {
    res.status(404)
    res.send('404 Not Found')
    res.end()
  })
}

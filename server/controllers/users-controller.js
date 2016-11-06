let encryption = require('../utilities/encryption')
let User = require('mongoose').model('User')

module.exports = {
  register: (req, res) => {
    res.render('users/register')
  },

  create: (req, res) => {
    let user = req.body

    // todo - check if username/email is unique

    if (user.password !== user.confirmPassword) {
      user.globalError = 'Passwords no not match!'
      res.render('users/register', user)
    } else {
      user.salt = encryption.generateSalt()
      user.hashedPass = encryption.generateHashedPassword(user.salt, user.password)
      user.roles = ['Owner']

      User
          .create(user)
          .then(user => {
            req
                .logIn(user, (err, user) => {
                  if (err) {
                    user.globalError = err
                    return res.render('users/register', user)
                  }

                  res.redirect('/')
                })
          })
    }
  },

  login: (req, res) => {
    res.render('users/login')
  },

  authenticate: (req, res) => {
    let reqUser = req.body

    User
        .findOne({username: reqUser.username})
        .then((user) => {
          if (!user || !user.authenticate(reqUser.password)) {
            res.render('users/login', {globalError: 'Invalid username or password'})
          } else {
            req.logIn(user, (err, user) => {
              if (err) {
                return res.render('users/login', {globalError: 'Login error'})
              }
              res.redirect('/')
            })
          }
        })
        .catch((err) => {
          res.render('users/login', {globalError: err})
        })
  },

  logout: (req, res) => {
    req.logout()
    res.redirect('/')
  }
}

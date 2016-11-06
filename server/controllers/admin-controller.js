const encryption = require('../utilities/encryption')
const User = require('mongoose').model('User')
const _ = require('underscore')
const moment = require('moment')

module.exports = {
  add: (app, config) => {
    return (req, res, next) => {
      let pageTitle = 'Add New Admin'

      let data = {
        pageTitle: pageTitle,
        formTitle: pageTitle,
        formAction: '/admins/add',
        moment: moment
      }
      data = _.extend(getPostedData(req), data)
      res.render('admin/form', data)
    }
  },

  create: (app, config) => {
    return [
      (req, res, next) => {
        let user = req.body
        let pageTitle = 'Add New Admin'

        let data = _.extend(getPostedData(req), {
          pageTitle: pageTitle,
          formTitle: pageTitle,
          formAction: '/admins/add',
          moment: moment
        })

        if (!data.username) {
          data.globalError = 'Username is required!'
          res.render('admin/form', data)
        } else if (user.password !== user.confirmPassword) {
          data.globalError = 'Passwords no not match!'
          res.render('admin/form', data)
        } else {
          user.salt = encryption.generateSalt()
          user.hashedPass = encryption.generateHashedPassword(user.salt, user.password)
          user.roles = ['Admin']

          User
                      .create(user)
                      .then(user => {
                        res.redirect('/admins/all')
                      })
                      .catch((err) => {
                        res.render('error', {
                          pageTitle: pageTitle,
                          formTitle: pageTitle,
                          message: 'Error selecting admins.',
                          error: err
                        })
                      })
        }
      }
    ]
  },

  list: (app, config) => {
    return [
      (req, res, next) => {
        let pageTitle = 'Admin User List'
        User
                    .find({roles: 'Admin'})
                    .sort('username')
                    .then((users) => {
                      res.render('admin/list', {
                        pageTitle: pageTitle,
                        users: users,
                        moment: moment
                      })
                    })
                    .catch((err) => {
                      res.render('error', {
                        pageTitle: pageTitle,
                        message: 'Error selecting admins.',
                        error: err
                      })
                    })
      }
    ]
  }
}

// utility functions
function getPostedData (req) {
  let params = (req && req.body) || null

  return {
    username: params.username || '',
    firstName: params.firstName || '',
    lastName: params.lastName || ''
  }
}

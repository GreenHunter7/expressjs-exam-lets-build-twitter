const mongoose = require('mongoose')

mongoose.Promise = global.Promise

let User = require('../data/User')

module.exports = (config) => {
  mongoose.connect(config.db)
  let db = mongoose.connection

  db.once('open', (err) => {
    if (err) throw err
    console.log('MongoDB ready!')
    User.seedAdminUser()
  })

  db.on('error', (err) => console.log('Database error: ' + err))
}

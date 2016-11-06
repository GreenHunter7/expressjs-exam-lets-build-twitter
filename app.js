const express = require('express')
let app = express()

const env = process.env.NODE_ENV || 'development'
const config = require('./server/config/config')[env]

require('./server/config/database')(config)
require('./server/config/express')(app, config)
require('./server/config/routes')(app, config)
require('./server/config/passport')()

app.listen(config.port, () => {
  console.log(`Express.js app up and running on port: ${config.port}`)
})

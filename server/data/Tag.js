const mongoose = require('mongoose')

let Schema = mongoose.Schema
mongoose.Promise = global.Promise

let tagSchema = mongoose.Schema({
    tags: [String]
})

let Tag = mongoose.model('Tag', tagSchema)
module.exports = Tag
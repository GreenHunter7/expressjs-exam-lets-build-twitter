const mongoose = require('mongoose')
const User = require('./User')

let Schema = mongoose.Schema
mongoose.Promise = global.Promise

let tweetSchema = mongoose.Schema({
  _author: {type: Schema.ObjectId, ref: 'User', default: null},
  handles: [{type: Schema.ObjectId, ref: 'User', default: null}],
  message: { type: String, required: true, unique: true },
  views: {type: Number, default: 0},
  likes: [{type: Schema.ObjectId, ref: 'User', default: null}],
  tags: [String],
  createdAt: {type: Date, default: null}
})

tweetSchema.pre('save', function (next) {
  if (this.isNew) {
    this.createdAt = new Date()
  }
  console.log('Saving tweet')
  next()
})

let Tweet = mongoose.model('Tweet', tweetSchema)

module.exports = Tweet

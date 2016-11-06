const User = require('mongoose').model('User')
const Tweet = require('../data/Tweet')
const Tag = require('../data/Tag')
const _ = require('underscore')
const moment = require('moment')

module.exports = {
    list: (app, config) => {
        return [
            // get tag list
            (req, res, next) => {
                Tag
                    .find({})
                    .then((tags) => {
                        req.tags = (tags.length > 0) ? tags[0] : []
                        next()
                    })
                    .catch((err) => {
                        console.log('Error selecting tags: ', err)
                        next()
                    })
            },
            (req, res, next) => {
                let pageTitle = 'Tweet List'
                let pageSize = 100

                let query = {}
                if (req.params.tagName && req.params.tagName !== 'tweet') {
                    query.tags = new RegExp(req.params.tagName, 'i')
                }

                Tweet
                    .find(query)
                    .populate('_author') // <-- only works if you pushed refs to children
                    .sort('-createdAt')
                    .limit(pageSize)
                    .then((tweets) => {
                        let data = {
                            pageTitle: pageTitle,
                            rows: tweets,
                            moment: moment,
                            tags: req.tags.tags
                        }
                        res.render('tweet/list', data)
                    })
                    .catch((err) => {
                        res.render('error', {
                            pageTitle: pageTitle,
                            message: 'Error selecting tweets.',
                            error: err
                        })
                    })
            }
        ]
    },

    add: (app, config) => {
        return [
            (req, res, next) => {
                let pageTitle = 'New Tweet'

                let data = {
                    pageTitle: pageTitle,
                    formAction: '/tweet'
                }
                data = _.extend(getPostedData(req), data)
                res.render('tweet/form', data)
            }
        ]
    },

    create: (app, config) => {
        let data = {
            pageTitle: 'New Tweet',
            formAction: '/tweet'
        }

        return [
            parseAndPrepareData(data),
            getHandleIDs(data),
            (req, res, next) => {
                new Tweet(data)
                    .save()
                    .then((tweet) => {
                        req.tweet = tweet
                        next()
                    })
                    .catch((err) => {
                        data.globalError = 'Error saving new tweet: ' + err.message
                        return res.render('tweet/form', data)
                    })
            },
            updateAuthorRef(data),
            updateHandles(data),
            updateTags(data),
            (req, res, next) => {
                res.redirect('/')
            }
        ]
    },

    edit: (app, config) => {
        return [
            (req, res, next) => {
                let pageTitle = 'Edit Tweet'
                let _id = req.params.id || null
                let data = {
                    pageTitle: pageTitle,
                    formAction: '/edit/' + _id
                }

                Tweet
                    .findOne({_id: _id})
                    .then((tweet) => {
                        data = _.extend(getPostedData(req), data)
                        data = _.extend(data, tweet)
                        if (req.session.globalSuccess) {
                            data.globalSuccess = req.session.globalSuccess
                            delete req.session.globalSuccess
                        }
                        res.render('tweet/form', data)
                    })
                    .catch((err) => {
                        res.render('error', {
                            pageTitle: pageTitle,
                            message: 'Error selecting tweet.',
                            error: err
                        })
                    })
            }
        ]
    },

    save: (app, config) => {
        let data = {
            pageTitle: 'Edit Tweet',
            formAction: null,
            _id: null
        }

        return [
            (req, res, next) => {
                data. _id = req.params.id || 0
                data.formAction = '/edit/' + data. _id

                console.log('-----')

                next()
            },
            parseAndPrepareData(data),
            getHandleIDs(data),
            (req, res, next) => {
                let _id = data._id

                Tweet
                    .findOne({_id: _id})
                    .then((tweet) => {
                        tweet.message = data.message
                        tweet
                            .save()
                            .then((tweet) => {
                                req.tweet = tweet
                                console.log('Tweet successfully updated')
                                next()
                            })
                            .catch((err) => {
                                console.log('Error updating tweet: ', err)
                                next()
                            })

                    })
                    .catch((err) => {
                        data.globalError = 'Error editing tweet: ' + err.message
                        return res.render('tweet/form', data)
                    })
            },
            updateAuthorRef(data),
            updateHandles(data),
            updateTags(data),
            (req, res, next) => {
                res.redirect('/')
            }
        ]
    },

    author: (app, config) => {
        return [
            (req, res, next) => {
                let username = req.params.username || ''
                let pageTitle = 'Tweet List'
                let pageSize = 100
                let data = {
                    pageTitle: pageTitle
                }

                if (!username) {
                    data.globalError = 'Username is missing'
                    return res.render('tweet/author', data)
                }

                let query = {
                    username: username
                }

                User
                    .findOne(query)
                    .populate('tweets') // <-- only works if you pushed refs to children
                    .sort('-tweets.createdAt')
                    .limit(pageSize)
                    .then((user) => {
                        // sort by by total views
                        user.tweets.sort(function (a, b) {
                            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                        })

                        let data = {
                            pageTitle: pageTitle,
                            user: user,
                            moment: moment
                        }
                        res.render('tweet/author', data)
                    })
                    .catch((err) => {
                        res.render('error', {
                            pageTitle: pageTitle,
                            message: 'Error selecting user data.',
                            error: err
                        })
                    })
                
            }
        ]
    },

    delete: (app, config) => {
        return [
            (req, res, next) => {
                let pageTitle = 'Delete Tweet'
                let _id = req.params.id || 0

                Tweet
                    .findOne({_id: _id})
                    .then((tweet) => {
                        req.tweet = tweet
                        tweet
                            .remove()
                            .then(() => {
                                console.log('Successfully deleted tweet.')
                                next()
                            })
                            .catch((err) => {
                                return console.log('Error deleting tweet: ', err)
                            })
                    })
                    .catch((err) => {
                        return res.render('error', {
                            pageTitle: pageTitle,
                            message: 'Error selecting tweet.',
                            error: err
                        })
                    })
            },
            (req, res, next) => {
                res.redirect('/')
            }
        ]
    }
}

// utility functions
function getPostedData (req) {
    let params = (req && req.body) || null

    return {
        _author: req.user._id,
        message: params.message || ''
    }
}

function parseMessage(message) {
    let tags = [];
    let handles = [];

    if (message) {
        let words = message.split(/[\s\.,!\?]+/)
        words.forEach(word => {
            if (word.indexOf('#') === 0) {
                let tag = word.substring(1);
                if (tags.indexOf(tag) === -1) {
                    tags.push(tag)
                }
            }
            if (word.indexOf('@') === 0) {
                let handle = word.substring(1);
                if (handles.indexOf(handle) === -1) {
                    handles.push(handle)
                }
            }
        });
    }

    return {
        tags: tags.sort(),
        handles: handles.sort()
    }
}

// Parse and prepare data
function parseAndPrepareData(data) {
    return (req, res, next) => {
        data = _.extend(data, getPostedData(req))

        console.log('Inside parseAndPrepareData...')

        // form validation
        if (!data.message) {
            data.globalError = 'Message is required'
            return res.render('tweet/form', data)
        }
        if (data.message.length > 140) {
            data.globalError = 'Your message cannot contain more than 140 symbols'
            return res.render('tweet/form', data)
        }

        let parsed = parseMessage(data.message);
        data.tags = parsed.tags
        data.handles = parsed.handles
        next()
    }
}

// Get handle IDs
function getHandleIDs(data) {
    return (req, res, next) => {
        if (!data.handles || !data.handles.length) {
            return next()
        }

        let handleIds = []
        let handles = []
        let query = { username: { $in: data.handles }}

        User
            .find(query)
            .then((users) => {
                if (!users) {
                    console.log('pass #2');
                    return next()
                }
                users.forEach((user) => {
                    handleIds.push(user._id)
                    handles.push(user)
                })
                data.handles = handleIds
                req.handles = handles
                next()
            })
            .catch((err) => {
                data.globalError = 'Error selecting handles: ' + err.message
                return res.render('tweet/form', data)
            })

    }
}

// update author ref.
function updateAuthorRef(data) {
    return (req, res, next) => {

        console.log('Inside updateAuthorRef...')

        req.user.tweets.push(req.tweet._id)
        req.user
            .save()
            .then((usr) => {
                console.log('Successfully adding tweet ref. to author')
                next()
            })
            .catch((err) => {
                console.log('Error adding tweet ref. to author: ', err)
                next()
            })

    }
}

// update handles
function updateHandles(data) {
    return (req, res, next) => {
        if (!req.handles || !req.handles.length) {
            return next()
        }

        let idx = 0
        let addMessageToHandle = () => {
            if (typeof req.handles[idx] === 'undefined') {
                return next()
            }

            let user = req.handles[idx]
            idx++
            user.tweets.push(req.tweet._id)

            user
                .save()
                .then((usr) => {
                    addMessageToHandle()
                })
                .catch((err) => {
                    console.log('Error pushing tweet to handle: ', err)
                    addMessageToHandle()
                })
        }

        addMessageToHandle()
    }
}

// update tags
function updateTags(data) {
    return (req, res, next) => {
        if (!data.tags || !data.tags.length) {
            return next()
        }

        Tag
            .find({})
            .then((tags) => {
                if (tags.length === 0) {
                    new Tag({tags: data.tags})
                        .save()
                        .then((tag) => {
                            console.log('New tags successfully added to tag model')
                            next()
                        })
                        .catch((err) => {
                            console.log('Error adding new tags: ', err)
                            next()
                        })

                } else {
                    let allTags = tags[0].tags
                    data.tags.forEach((tag) => {
                        allTags.push(tag)
                    })
                    allTags = _.uniq(allTags, (name) => {
                        return name.toString()
                    })

                    tags[0].tags = allTags.sort()

                    tags[0]
                        .save()
                        .then((t) => {
                            console.log('Successfully updated tag array')
                            next()
                        })
                        .catch((err) => {
                            console.log('Error adding new tags: ', err)
                            next()
                        })
                }
            })
            .catch((err) => {
                console.log('Error selecting tags: ', err)
                next()
            })

    }
}
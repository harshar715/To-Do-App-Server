const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    userName: {
        type: String,
        required: true
    },
    userDate: {
        type: Date,
        default: Date.now
    },
    userMobileNumber: {
        type: Number,
        required: true
    },
    userPassword: {
        type: String,
        required: true
    },
    userToken: [{
        type: String
    }],
    notifications: [{
        date: {
            type: Date,
            default: Date.now
        },
        title: {
            type: String
        },
        shortTitle: {
            type: String
        },
        targetId: {
            type: String
        },
        targetName: {
            type: String
        },
        targetUrl: {
            type: String
        },
        hasViewed: {
            type: Boolean,
            default: false
        }
    }]
});

const user = mongoose.model('user', userSchema);

module.exports = user;
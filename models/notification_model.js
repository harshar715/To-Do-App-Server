const mongoose = require('mongoose');
const schema = mongoose.Schema;

const notificationSchema = new schema({
    userId: {
        type: String,
        required: true
    },
    subscriptionObj: [{
        type: String,
        required: true
    }]
});

const notification = mongoose.model('notification', notificationSchema);

module.exports = notification;
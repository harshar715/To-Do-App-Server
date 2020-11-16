const mongoose = require('mongoose');
const schema = mongoose.Schema;

const taskSchema = new schema({
    taskUserId: {
        type: String,
        required: true
    },
    taskUserName: {
        type: String,
        required: true
    },
    taskTitle: {
        type: String,
        required: true
    },
    taskDiscription: {
        type: String,
        required: true
    },
    taskCreatedDate: {
        type: Date,
        default: Date.now
    },
    taskDeadline: {
        type: Date,
        required: true
    },
    taskNotes: [{
        noteTitle: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

const task = mongoose.model('task', taskSchema);

module.exports = task;
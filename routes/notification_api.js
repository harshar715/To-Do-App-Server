const express = require('express');
const router = express.Router();
const user = require('../models/user_model');
const notification = require('../models/notification_model');

router.post('/postNotificationSubscription', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {

            let query = { userId: decoded.data._id };
            notification.findOne(query).then(function (notificationObj) {
                if (notificationObj) {
                    let arr = notificationObj.subscriptionObj.filter(data => data !== JSON.stringify(req.body))

                    arr.push(JSON.stringify(req.body));
                    let myNotif = {
                        subscriptionObj: arr
                    }
                    notification.findOneAndUpdate(query, myNotif).then(res1 => {
                        res.status(200).json({
                            message: 'Subscription Successful',
                            data: '',
                            status: 200
                        });
                    }).catch(next)
                } else {
                    let arr = {
                        userId: decoded.data._id,
                        subscriptionObj: [JSON.stringify(req.body)]
                    }
                    notification.create(arr).then(function (notificationObj1) {
                        if (notificationObj1) {
                            res.status(200).json({
                                message: 'Subscription Successful',
                                data: '',
                                status: 200
                            });
                        }
                    }).catch(next)
                }
            }).catch(next)

        } else {
            res.status(401).json({
                message: 'Unauthorized',
                data: '',
                status: 401
            });
        }
    } else {
        res.status(500).json({
            message: 'Bad Request ',
            data: '',
            status: 500
        });
    }
});

router.get('/getNotifications', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            let query = { _id: decoded.data._id };
            user.findOne(query).select({ notifications: 1 }).lean().then(function (user1) {
                if (user1) {
                    res.status(200).json({
                        data: user1,
                        message: 'Notifications fetched Successful',
                        status: 200
                    });
                }
            });
        } else {
            res.status(500).json({
                message: 'Bad Request ',
                data: '',
                status: 500
            });
        }
    } else {
        res.status(500).json({
            message: 'Bad Request ',
            data: '',
            status: 500
        });
    }
});

router.get('/getNotificationCount', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            let query = { _id: decoded.data._id };
            user.findOne(query).select({ notifications: 1 }).lean().then(function (user1) {
                if (user1) {
                    res.status(200).json({
                        data: user1.notifications.length,
                        message: 'Notifications Count fetched Successful',
                        status: 200
                    });
                }
            });
        } else {
            res.status(500).json({
                message: 'Bad Request ',
                data: '',
                status: 500
            });
        }
    } else {
        res.status(500).json({
            message: 'Bad Request ',
            data: '',
            status: 500
        });
    }
});

router.get('/deleteNotification', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {

            let query = { _id: decoded.data._id };
            user.findOne(query).select({ notifications: 1 }).lean().then(function (user1) {
                let arr = user1.notifications;
                arr = arr.filter(res => String(res._id) !== String(req.query.notificationId));
                let myUser = {
                    notifications: arr
                }
                user.findOneAndUpdate(query, myUser).then(function (userUp) {
                    if (userUp) {
                        res.status(200).json({
                            data: '',
                            message: 'Notification Deleted Successful',
                            status: 200
                        });
                    }
                });
            });
        } else {
            res.status(500).json({
                message: 'Bad Request ',
                data: '',
                status: 500
            });
        }
    } else {
        res.status(500).json({
            message: 'Bad Request ',
            data: '',
            status: 500
        });
    }
});

module.exports = router;

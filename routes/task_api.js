const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const webpush = require('web-push');
const schedule = require('node-schedule');
const task = require('../models/task_model');
const user = require('../models/user_model');
const notification = require('../models/notification_model');

const vapidKeys = {
    publicKey: "BHtjmZQzFy2Bakk0W2J8-bSjKc2C8-u5Xc1Lp8udcHK3vzXl52I4tWGCWTJBpkhYsNblnAjswqdE1haEyv9RLQU",
    privateKey: "CQLwL5U-bBwSxnHxTxiy26_FllqzmzC96_fVjZQAsHo"
};
webpush.setVapidDetails(
    'mailto:harshar715@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

router.get('/getAllTasks', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            task.find(req.query).then(function (task1) {
                if (task1.length !== 0) {
                    res.status(200).json({
                        message: 'taskData Fetched Successful',
                        data: task1,
                        status: 200
                    });
                } else {
                    res.status(500).json({
                        message: 'No Data Found ',
                        data: '',
                        status: 500
                    });
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

router.post('/postDefaultTasks', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            let myTask = {
                taskUserId: decoded.data._id,
                taskUserName: decoded.data.userName,
                taskTitle: req.body.taskTitle,
                taskDiscription: req.body.taskDiscription,
                taskDeadline: req.body.taskDeadline
            }
            task.create(myTask).then(function (taskReg) {
                if (taskReg) {
                    res.status(200).json({
                        message: 'Task Registration Successful',
                        data: taskReg,
                        status: 200
                    });
                    let oneDay = new Date(taskReg.taskDeadline);
                    oneDay.setDate(oneDay.getDate() - 1);
                    console.log(oneDay);
                    schedule.scheduleJob(oneDay, function () {
                        let query1 = { _id: decoded.data._id }
                        user.findOne(query1).select({ notifications: 1 }).lean().then(user1 => {
                            let arr = user1.notifications;
                            const notif = {
                                title: 'Your Task - ' + '<b>' + taskReg.taskTitle + '</b>' + ' is about to get schedule in 24hrs',
                                shortTitle: 'Your Task - ' + taskReg.taskTitle + ' is about to get schedule in 24hrs',
                                targetId: taskReg._id,
                                targetName: taskReg.taskTitle,
                                targetUrl: '/task/' + taskReg._id
                            };
                            arr.push(notif);
                            let myUser = {
                                notifications: arr
                            }
                            user.findOneAndUpdate(query1, myUser).then(user2 => { });
                        });
                        notification.findOne({ userId: decoded.data._id }).select({ subscriptionObj: 1 }).lean().then(notif1 => {
                            if (notif1.subscriptionObj.length > 0) {
                                const notificationPayload = {
                                    notification: {
                                        title: 'Alert From To-Do-App',
                                        body: 'Your Task - ' + taskReg.taskTitle + ' is about to get schedule in 24hrs',
                                        vibrate: [200, 100, 200, 100, 200, 100, 200],
                                        data: {
                                            url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                            dateOfArrival: Date.now(),
                                            primaryKey: 1
                                        },
                                        url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                        actions: [{
                                            action: "explore",
                                            url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                            title: "View"
                                        }]
                                    }
                                };
                                notif1.subscriptionObj.forEach(res => {
                                    webpush.sendNotification(JSON.parse(res), JSON.stringify(notificationPayload))
                                });
                            }
                        })

                    });

                    let oneHour = new Date(taskReg.taskDeadline);
                    oneHour.setHours(oneHour.getHours() - 1);

                    schedule.scheduleJob(oneHour, function () {

                        let query1 = { _id: decoded.data._id }
                        user.findOne(query1).select({ notifications: 1 }).lean().then(user1 => {
                            let arr = user1.notifications;
                            const notif = {
                                title: 'Your Task - ' + '<b>' + taskReg.taskTitle + '</b>' + ' is about to get schedule in 60min',
                                shortTitle: 'Your Task - ' + taskReg.taskTitle + ' is about to get schedule in 60min',
                                targetId: taskReg._id,
                                targetName: taskReg.taskTitle,
                                targetUrl: '/task/' + taskReg._id
                            };
                            arr.push(notif);
                            let myUser = {
                                notifications: arr
                            }
                            user.findOneAndUpdate(query1, myUser).then(user2 => { });
                        });
                        notification.findOne({ userId: decoded.data._id }).select({ subscriptionObj: 1 }).lean().then(notif1 => {
                            if (notif1.subscriptionObj.length > 0) {
                                const notificationPayload = {
                                    notification: {
                                        title: 'Alert From To-Do-App',
                                        body: 'Your Task - ' + taskReg.taskTitle + ' is about to get schedule in 60min',
                                        vibrate: [200, 100, 200, 100, 200, 100, 200],
                                        data: {
                                            url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                            dateOfArrival: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                                            primaryKey: 1
                                        },
                                        url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                        actions: [{
                                            action: "explore",
                                            url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                            title: "View"
                                        }]
                                    }
                                };
                                notif1.subscriptionObj.forEach(res => {
                                    webpush.sendNotification(JSON.parse(res), JSON.stringify(notificationPayload))
                                });
                            }
                        })

                    });
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

router.post('/postRecurringTasks', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            let rule = new schedule.RecurrenceRule();
            rule.dayOfWeek = req.body.daysOfWeek;
            rule.hour = 0;
            rule.minute = 0;
            schedule.scheduleJob(rule, function () {
                const d = new Date();
                let nd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), req.body.hours, req.body.minutes);
                nd.setHours(nd.getHours() - 5);
                nd.setMinutes(nd.getMinutes() - 30);
                let myTask = {
                    taskUserId: decoded.data._id,
                    taskUserName: decoded.data.userName,
                    taskTitle: req.body.taskTitle,
                    taskDiscription: req.body.taskDiscription,
                    taskDeadline: nd
                }
                task.create(myTask).then(function (taskReg) {
                    if (taskReg) {

                        let oneHour = new Date(taskReg.taskDeadline);
                        oneHour.setHours(oneHour.getHours() - 1);

                        schedule.scheduleJob(oneHour, function () {

                            let query1 = { _id: decoded.data._id }
                            user.findOne(query1).select({ notifications: 1 }).lean().then(user1 => {
                                let arr = user1.notifications;
                                const notif = {
                                    title: 'Your Task - ' + '<b>' + taskReg.taskTitle + '</b>' + ' is about to get schedule in 60min',
                                    shortTitle: 'Your Task - ' + taskReg.taskTitle + ' is about to get schedule in 60min',
                                    targetId: taskReg._id,
                                    targetName: taskReg.taskTitle,
                                    targetUrl: '/task/' + taskReg._id
                                };
                                arr.push(notif);
                                let myUser = {
                                    notifications: arr
                                }
                                user.findOneAndUpdate(query1, myUser).then(user2 => { });
                            });
                            notification.findOne({ userId: decoded.data._id }).select({ subscriptionObj: 1 }).lean().then(notif1 => {
                                if (notif1.subscriptionObj.length > 0) {
                                    const notificationPayload = {
                                        notification: {
                                            title: 'Alert From To-Do-App',
                                            body: 'Your Task - ' + taskReg.taskTitle + ' is about to get schedule in 60min',
                                            vibrate: [200, 100, 200, 100, 200, 100, 200],
                                            data: {
                                                url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                                dateOfArrival: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
                                                primaryKey: 1
                                            },
                                            url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                            actions: [{
                                                action: "explore",
                                                url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                                title: "View"
                                            }]
                                        }
                                    };
                                    notif1.subscriptionObj.forEach(res => {
                                        webpush.sendNotification(JSON.parse(res), JSON.stringify(notificationPayload))
                                    });
                                }
                            })

                        });
                    }
                }).catch(next)
            });

            const d = new Date();
            let nd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), req.body.hours, req.body.minutes);
            nd.setHours(nd.getHours() - 5);
            nd.setMinutes(nd.getMinutes() - 30);
            let myTask = {
                taskUserId: decoded.data._id,
                taskUserName: decoded.data.userName,
                taskTitle: req.body.taskTitle,
                taskDiscription: req.body.taskDiscription,
                taskDeadline: nd
            }
            task.create(myTask).then(function (taskReg) {
                if (taskReg) {
                    res.status(200).json({
                        message: 'Task Registration Successful',
                        data: taskReg,
                        status: 200
                    });
                    let oneHour = new Date(taskReg.taskDeadline);
                    oneHour.setHours(oneHour.getHours() - 1);

                    schedule.scheduleJob(oneHour, function () {

                        let query1 = { _id: decoded.data._id }
                        user.findOne(query1).select({ notifications: 1 }).lean().then(user1 => {
                            let arr = user1.notifications;
                            const notif = {
                                title: 'Your Task - ' + '<b>' + taskReg.taskTitle + '</b>' + ' is about to get schedule in 60min',
                                shortTitle: 'Your Task - ' + taskReg.taskTitle + ' is about to get schedule in 60min',
                                targetId: taskReg._id,
                                targetName: taskReg.taskTitle,
                                targetUrl: '/task/' + taskReg._id
                            };
                            arr.push(notif);
                            let myUser = {
                                notifications: arr
                            }
                            user.findOneAndUpdate(query1, myUser).then(user2 => { });
                        });
                        notification.findOne({ userId: decoded.data._id }).select({ subscriptionObj: 1 }).lean().then(notif1 => {
                            if (notif1.subscriptionObj.length > 0) {
                                const notificationPayload = {
                                    notification: {
                                        title: 'Alert From To-Do-App',
                                        body: 'Your Task - ' + taskReg.taskTitle + ' is about to get schedule in 60min',
                                        vibrate: [200, 100, 200, 100, 200, 100, 200],
                                        data: {
                                            url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                            dateOfArrival: Date.now(),
                                            primaryKey: 1
                                        },
                                        url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                        actions: [{
                                            action: "explore",
                                            url: req.app.get("appUrl") + '/#/task/' + taskReg._id,
                                            title: "View"
                                        }]
                                    }
                                };
                                notif1.subscriptionObj.forEach(res => {
                                    webpush.sendNotification(JSON.parse(res), JSON.stringify(notificationPayload))
                                });
                            }
                        })

                    });
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

router.get('/getTodayTasks', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            task.find({ taskUserId: decoded.data._id, taskDeadline: { $gte: new Date() } }).then(function (task1) {
                if (task1.length !== 0) {
                    const oneDay = 24 * 60 * 60 * 1000;
                    let todayTasks = task1.filter(res => (Math.ceil(Math.abs((new Date().setHours(0, 0, 0, 0) - new Date(res.taskDeadline)) / oneDay))) <= 1);
                    if (todayTasks.length !== 0) {
                        res.status(200).json({
                            message: 'taskData Fetched Successful',
                            data: todayTasks,
                            status: 200
                        });
                    } else {
                        res.status(200).json({
                            message: 'No Data Found ',
                            data: [],
                            status: 200
                        });
                    }
                } else {
                    res.status(200).json({
                        message: 'No Data Found ',
                        data: '',
                        status: 200
                    });
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

router.get('/getTomorrowTasks', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            task.find({ taskUserId: decoded.data._id }).then(function (task1) {
                if (task1.length !== 0) {
                    const oneDay = 24 * 60 * 60 * 1000;
                    let tomorrowTasks = task1.filter(res => (Math.ceil(Math.abs((new Date().setHours(0, 0, 0, 0) - new Date(res.taskDeadline)) / oneDay))) > 1 && (Math.ceil(Math.abs((new Date() - new Date(res.taskDeadline)) / oneDay))) <= 2);
                    if (tomorrowTasks.length !== 0) {
                        res.status(200).json({
                            message: 'taskData Fetched Successful',
                            data: tomorrowTasks,
                            status: 200
                        });
                    } else {
                        res.status(200).json({
                            message: 'No Data Found ',
                            data: [],
                            status: 200
                        });
                    }
                } else {
                    res.status(200).json({
                        message: 'No Data Found ',
                        data: '',
                        status: 200
                    });
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

router.get('/getUpcomingTasks', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            task.find({ taskUserId: decoded.data._id }).then(function (task1) {
                if (task1.length !== 0) {
                    const oneDay = 24 * 60 * 60 * 1000;
                    let upcomingTasks = task1.filter(res => (Math.ceil(Math.abs((new Date().setHours(0, 0, 0, 0) - new Date(res.taskDeadline)) / oneDay))) > 2);
                    if (upcomingTasks.length !== 0) {
                        res.status(200).json({
                            message: 'taskData Fetched Successful',
                            data: upcomingTasks,
                            status: 200
                        });
                    } else {
                        res.status(200).json({
                            message: 'No Data Found ',
                            data: [],
                            status: 200
                        });
                    }
                } else {
                    res.status(200).json({
                        message: 'No Data Found ',
                        data: '',
                        status: 200
                    });
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

module.exports = router;

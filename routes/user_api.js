const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const user = require('../models/user_model');

router.get('/getAllUsers', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            user.find(req.query).then(function (user1) {
                if (user1.length !== 0) {
                    res.status(200).json({
                        message: 'UserData Fetched Successful',
                        data: user1,
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

router.post('/postUsers', function (req, res, next) {
    user.findOne({ userMobileNumber: req.body.userMobileNumber }).then(function (regUser) {
        if (regUser) {
            res.status(409).json({
                message: 'Mobile Number is already Registered',
                data: '',
                status: 409
            });
        } else {
            user.create(req.body).then(function (userReg) {
                if (userReg) {
                    res.status(200).json({
                        message: 'User Registration Successful',
                        data: userReg,
                        status: 200
                    });
                }
            }).catch(next)
        }
    }).catch(next)
});

router.post('/signin', function (req, res, next) {
    let query = { userMobileNumber: req.body.userMobileNumber, userPassword: req.body.userPassword };
    user.find(query).then(function (regUser) {
        if (regUser.length !== 0) {
            const token = jwt.sign({
                data: {
                    _id: regUser[0]._id,
                    userName: regUser[0].userName,
                    userMobileNumber: regUser[0].userMobileNumber,
                    userDate: regUser[0].userDate
                }
            }, 'thisistodoapp');
            let myToken = new Array();
            if (regUser[0].userToken) {
                if (regUser[0].userToken.length < 6) {
                    myToken = [...regUser[0].userToken];
                    myToken.push(token);
                } else {
                    myToken = [...regUser[0].userToken];
                    myToken.push(token);
                    myToken.splice(0, 1);
                }
            } else {
                myToken.push(token);
            }
            if (myToken) {
                let myUser = {
                    userName: regUser[0].userName,
                    userMobileNumber: regUser[0].userMobileNumber,
                    userPassword: regUser[0].userPassword,
                    userToken: myToken
                }
                if (myUser) {
                    let query = { userMobileNumber: myUser.userMobileNumber };
                    user.updateOne(query, myUser).then(function (user) {
                        if (user) {
                            res.status(200).json({
                                message: 'Signin Successful',
                                data: token,
                                status: 200
                            });
                        }
                    }).catch(next)
                }
            }
        } else {
            res.status(500).json({
                message: 'User Does Not  Exist',
                data: '',
                status: 500
            });
        }
    }).catch(next)
});

router.post('/signout', function (req, res, next) {
    if (req.header('Authorization')) {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'thisistodoapp');
        if (decoded.data && token) {
            let query = { userMobile: req.body.userMobile, userPassword: req.body.userPassword };
            user.find(query).then(function (regUser) {
                if (regUser) {
                    const myToken = regUser[0].userToken.filter(result => result !== token);
                    if (myToken) {
                        let myUser = {
                            userToken: myToken
                        }
                        if (myUser) {
                            let query = { userMobile: req.body.userMobile };
                            user.updateOne(query, myUser).then(function (user) {
                                if (user) {
                                    res.status(200).json({
                                        message: 'Signout Successful',
                                        data: '',
                                        status: 200
                                    });
                                }
                            }).catch(next)
                        }
                    }
                }
            }).catch(next)

        } else {
            res.status(401).json({
                message: 'Unauthorized',
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

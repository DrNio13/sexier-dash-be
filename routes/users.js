const express = require('express');
const usersRouter = express.Router();
const config = require('../config/config');
const jwt = require('jsonwebtoken');

let response = {message: '', reason: 'temp'};

usersRouter.route('/')
    .get((req, res, next) => {
        const db = req.db;
        db.collection('users').find({}).toArray((err, users) => {
            res.json(users);
        });
    })
    .post((req, res, next) => {
        const username = req.body.username ?  req.body.username.trim() : req.body.username;
        const password = req.body.password ?  req.body.password.trim() : req.body.password;

        if (Object.keys(req.body).length === 0) {
            return res.json({success: false, message: 'Empty request payload'});
        }

        if (!username) {
            res.statusCode = 400;
            return res.json({success: false, message: 'Empty username'});
        }

        if (!password) {
            res.statusCode = 400;
            return res.json({success: false, message: 'Empty password'});
        }

        const db = req.db;
        try {
            db.collection('users').findOne({username: username}, (err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.json({err:"error with db"});
                    throw err;
                }
                if (user) {
                    res.statusCode = 400;
                    return res.json({success: false, message: 'Username is already used'});
                }

                const token = jwt.sign(password, config.secret);
                console.log(token);
                const newUser = {
                    username: username,
                    password: token,
                    name: req.body.name ? req.body.name.trim() : req.body.name,
                    surname: req.body.surname? req.body.surname.trim(): req.body.surname,
                    isAdmin: false
                };

                db.collection('users').insert(newUser, (err, doc)=>{
                    if (err) {
                        res.statusCode = 500;
                        res.json({error: 'error with db'});
                        throw err;
                    }

                    if (doc.result.ok === 1 && doc.result.n === 1) {
                        res.statusCode = 201;
                        return res.json({
                            success: true, message: 'User created', data: {
                                username: doc.ops[0].username,
                                name: doc.ops[0].name,
                                surname: doc.ops[0].surname
                            }
                        })
                    }
                    return res.json({
                        success: false,
                        message: 'Something went wrong dude'
                    })
                })
            });
        } catch (e) {
            throw e;
        }
    });

usersRouter.route('/:userId')
    .get((req, res, next) => {
        response.message = 'get';
        res.json(response)
    })
    .put((req, res, next) => {
        response.message = 'put';
        res.json(response)
    })
    .delete((req, res, next) => {
        response.message = 'delete';
        res.json(response)
    });

module.exports = usersRouter;
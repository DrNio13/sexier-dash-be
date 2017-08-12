const express = require('express');
const jwt = require('jsonwebtoken');
const authRouter = express.Router();
const config = require('../config/config');

let reply = {message: '', reason: 'temp'};

authRouter.use(function(req, res, next) {
    next();
});

authRouter.route('/')
    .get((req, res, next) => {
        reply.message = 'auth get';
        res.json(reply);
    })
    .post((req, res, next) => {
        if (req && req.body && Object.keys(req.body).length === 0) {
            res.statusCode = 400;
            return res.json({success: false, message: 'empty body'});
        }

        const db = req.db;
        try {
            db.collection('users')
                .findOne({username: req.body.username}, (err, user) => {
                    if (err) throw err;

                    if (!user) {
                        return res.json({success: false, message: `User not found. Authentication failed.`});
                    }

                    jwt.verify(user.password, config.secret, function(err, decoded) {
                        if (err) {
                            res.statusCode = 500;
                            res.json({success: false, message: 'Something went wrong with verification'});
                            throw err
                        }

                        if (decoded !== req.body.password) {
                            return res.json({success: false, message: `Wrong username or password.`})
                        }

                        const token = jwt.sign(user, config.secret, {
                            expiresIn: '2h'
                        });

                        res.json({
                            success: true,
                            message: 'Authentication success.',
                            token: token
                        })
                    });
                })
        } catch(e) {
            throw e;
        }
    });

module.exports = authRouter;
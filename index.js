'use strict';

// External modules
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

// App modules
const chat = require('./chat')(io);

let db = null;
const config = require('./config/local.config');
const port = process.env.PORT || config.webPort;

app.use(bodyParser.urlencoded({extended: false})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json());

try {
    MongoClient.connect(`mongodb://localhost:${config.mongoDbPort}/${config.database}`, {
        poolSize: 10
    }, (err, database) => {
        if (err) throw new Error("Error while connecting to db...", err);
        db = database;
    });
} catch (err) {
    throw err;
}

// Pass the db everywhere - needs optimization
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    req.db = db;
    next();
});

// App routes
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/authentication');

app.use('/api/users', usersRoutes);
app.use('/api/authenticate', authRoutes);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found amigo');
    err.status = 404;
    next(err);
});

// error handlers
if (app.get('env') === config.dev) {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({reason: 'error', error: err, message: err.message, stacktrace: err});
    });
}

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({reason: 'error', error: {}, message: err.message})
});

http.listen(config.webPort, () => {
    console.log(`Server is up and running in port ${port}`);
});

module.exports = app;
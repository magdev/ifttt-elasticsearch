var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    webhook = require('express-ifttt-webhook'),
    elasticsearch = require('elasticsearch'),
    
    routes = require('./routes/index'),
    config = require('./config/default.json'),
    app = express(),
    
    es = new elasticsearch.Client(config.elasticsearch);


    
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(webhook(function(json, done) {
    es.index({
        index: (config.index.name || 'articles'),
        type: (config.index.type || 'article'),
        body: json
    }, function(error, response) {
        if (error) {
            return done(error, response);
        }
        done();
    });
}));

app.use('/', routes);


app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500).json({
            message: err.message,
            error: err
        });
    });
}
app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message,
        error: {}
    });
});


module.exports = app;

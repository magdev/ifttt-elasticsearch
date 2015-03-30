/**
 * Copyright (c) 2015, Marco Grätsch <magdev3.0@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the <organization> nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('cookie-session'),
    flash = require('connect-flash'),
    gnutp = require('gnu-terry-pratchett'),
    csrf = require('csurf');
   

    
module.exports = function(app, config) {

    app.set('views', path.join(process.cwd(), 'views'));
    app.set('view engine', 'jade');
    app.set('etag', 'strong');
    app.set('trust proxy', true);
    
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ 
        extended: false 
    }));
    app.use(cookieParser(config.session.secret || 'secretsessionkey'));
    app.use(session({
        secret: config.session.secret || 'secretsessionkey'
    }));
    app.use(flash());
    app.use(['/login', '/share'], csrf({ 
        cookie: true 
    }));
    app.use(gnutp());
    app.use(function (req, res, next) {
        if (req.url.indexOf('/stream') === 0 ||
            req.url === '/' || req.url === '' ||
            req.url.indexOf('/xmlrpc.php') === 0 ||
            req.url.indexOf('/feed.xml') === 0 ||
            req.url.indexOf('/search') === 0 ||
            req.url.indexOf('/share') === 0 ||
            req.url.indexOf('/login') === 0) {
	            res.setHeader('Cache-Control', 'no-cache');
	            res.setHeader('Expires', new Date(Date.now()).toUTCString());
        } else {
            res.setHeader('Cache-Control', 'public, max-age=' + (config.cache.maxAge/1000) + ', must-revalidate');
            res.setHeader('Expires', new Date(Date.now() + config.cache.maxAge).toUTCString());
        }
        return next();
    });
    app.use(function(req, res, next) {
        res.setHeader('X-Frame-Options', 'deny');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (req.secure) {
            res.setHeader('Strict-Transport-Security', 'max-age=' + (config.cache.maxAge/1000) + '; includeSubDomains');
        }
        return next();
    });
    app.use(favicon(process.cwd() + '/public/favicon.ico'));
    app.use(express.static(path.join(process.cwd(), 'public'), {
        maxAge: (config.cache.maxAge || 2592000000)
    }));
    
    app.use(function(req, res, next) {
        res.locals.config = req.config = config;
        res.locals.pckg = require('../package.json');
        res.locals.owner = config.owner;
        res.locals.appdata = config.app;
        res.locals.baseurl = req.currentBaseurl = req.protocol + "://" + req.get('host');
        res.locals.moment = req.moment = require('moment');
        res.locals.isAuthenticated = req.isAuthenticated;
        res.locals.bookmarklet = function() {
            return 'javascript:window.open("' + req.currentBaseurl + '/share?url="+encodeURIComponent(location.href), "indexall", "locationbar=yes,width=480px,height=500px,statusbar=no,menubar=no,scrollbars=yes,toolbar=no,resizable=yes")';
        };
        res.locals.imageNotBlank = function(url) {
            var regexp = RegExp('no_image_card.png$');
            return url && regexp.test(url) === false;
        };
        res.locals.buildUrl = function(url, path) {
            if (path.indexOf('http') === 0) {
                return path;
            }
            // @TODO implement normalization
            return path;
        };
        req.isRole = res.locals.isRole = function(role) {
            if (req.isAuthenticated() && req.user && req.user.role === role) {
                return true;
            }
            return false;
        };
        req.isAdmin = res.locals.isAdmin = function() {
            return req.isRole('admin');
        };
        return next();
    });
    
    if (app.get('env') === 'development') {
	    app.use('/xmlrpc.php', function(req, res, next) {
	        console.log(req.body);
	        next();
	    });
	}
 };
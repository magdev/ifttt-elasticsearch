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
 
var LocalStrategy = require('passport-local').Strategy,
    passport = require('passport'),
    User = require('./user');
    
module.exports = function(app, config) {
    passport.serializeUser(function(user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(function(username, done) {
        User.find(username, function(err, user) {
            done(err, user);
        });
    });
    
    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true 
        },
        function (req, username, password, done) {
            process.nextTick(function() {
                User.find(username, function(err, user) {
                    if (err) { 
                        return done(err); 
                    }
                    if (!user) { 
                        return done(null, false, { 
                            message: 'Unknown user ' + username 
                        }); 
                    }
                    if (user.password != password) { 
                        return done(null, false, { 
                           message: 'Invalid password' 
                        }); 
                    }
                    return done(null, user);
                });
            });
        }
    ));
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.post('/login', passport.authenticate('local', { 
        failureRedirect: '/', 
        failureFlash: true,
        successRedirect: '/search'
    }));
    
    app.get('/logout', function(req, res) {
        req.logout();
        req.session = null;
        res.redirect('/');
    });
    
    return passport;
};
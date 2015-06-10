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
 
var webhook = require('express-ifttt-webhook'),
    User = require('./user'),
    Parser = require('./ifttt/parser'),
    types = require('../config/elasticsearch/types.json'),
    debug = require('debug')('ifttt-elasticsearch:ifttt'),
    strip = require('js-striphtml'),
    scraper = require('./elasticsearch/scraper'),
    
    generateRequest = function(json, config) {
        debug('Generate request using ' + JSON.stringify(json));
        return {
            index: (config.elasticsearch.index.name || 'ifttt'),
            type: (json.type || config.elasticsearch.index.type || 'common'),
            body: json
        };
    },
    
    verifyUser = function(username, password, done) {
        debug('Verify user ' + username);
        return User.verify(username, password, done);
    };
    

module.exports = function(app, config, es) {
    var parser = new Parser(types, config);
    
    app.use(webhook(verifyUser, function(json, done) {
        debug('Webhook called with ' + JSON.stringify(json));
        
        parser.parse(json);
        debug('Webhook parsed JSON: ' + JSON.stringify(parser.json()));
        
        es.index(generateRequest(parser.json(), config), function(error, response) {
            if (error) {
                return done(error, response);
            }
            
            scraper(parser.get('url'), function(err, data) {
                if (err) {
                    console.trace(err);
                }
                
                es.get({
                    index: response._index,
                    type: response._type,
                    id: response._id
                }).then(function(body) {
                    es.update({
                        index: body._index,
                        type: body._type,
                        id: body._id,
                        body: {
                            doc: {
                                fullpage: strip.stripTags(data.text)
                            }
                        }
                    }, function(error) {
                        console.trace(error);
                    });
                }, function (error) {
                    console.trace(error);
                });
            });
            return done();
        });
    }));
};
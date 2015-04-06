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

var jsesc = require('jsesc'),
    debug = require('debug')('ifttt-elasticsearch:ifttt:parser'),
    url = require('url');

var IFTTTParser = function(types, config) {
   this.types = types;
   this.config = config;
};

IFTTTParser.prototype = {
    types: {},
    config: {},
    
    parse: function(json) {
        debug('Received JSON: ' + JSON.stringify(json));
        
        json.timestamp = new Date();
        
        if (typeof json.description === 'string') {
	        try {
	            var parts = json.description.split('||'),
	                data = {};
	                
	            parts.forEach(function(row) {
	                var kv = row.split('::'),
	                    k = kv[0],
	                    v = kv[1];
	                if (k !== 'description' && k != 'embed') {
	                    data[k] = jsesc(v);
	                } else {
	                    data[k] = v;
	                }
	            });
	            json.description = data;
                debug('Transformed JSON: ' + JSON.stringify(json));
	        } catch(e) {
	            debug('Error: ' + e.message);
	            console.log(e);
	        };
        }
        
        if (typeof json.description === 'object') {
            var content = json.description.content || '',
                type = (json.description.type || this.config.index.type || 'common'),
                fields = Object.keys(this.types[type].properties),
                
                fieldHandler = function(field) {
	                if (field !== 'content' && field !== 'type' && typeof typedef.properties[field] !== 'undefined') {
	                    if (typeof json.description[field] === typedef.properties[field].type) {
	                        json[field] = json.description[field];
	                        delete json.description[field];
	                    }
	                }
	            };
                
            typedef = this.types[type];
	        if (typeof typedef === 'undefined') {
	            typedef = this.types['common'];
	        }
	        
            fields.forEach(fieldHandler);
            json.type = type;
            json.description = content;
            debug('Parsed JSON: ' + JSON.stringify(json));
        }
        
        if (json.image) {
            json.image = url.resolve(json.url, json.image);
        }
        
        delete json.password;
        delete json.user;
        delete json.post_status;
        debug('Indexed JSON: ' + JSON.stringify(json));
        return json;
    }
};
module.exports = IFTTTParser;
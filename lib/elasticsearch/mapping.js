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


var ESMapping = function(app, config, es, settings, types) {
    this.app = app;
    this.config = config;
    this.es = es;
    this.types = types; 
    this.settings = settings;
    this.update();
};


ESMapping.prototype = {
    app: null,
    config: {},
    es: null,
    types: {},
    settings: {},
    
    
    getType: function(type) {
        return this.types[type] || this.types['common'] || null;
    },
    
    getTypeFields: function(type) {
        var t = this.getType(type);
        
        if (!t) {
            t = this.getType('common');
        }
        return t.properties;
    },
    
    update: function(index) {
        var types = Object.keys(this.types),
            settings = this.settings,
            typedefs = this.types,
            es = this.es,
            index = index || this.config.index.name || '_all',
            
            typeHandler = function(type) {
	            es.indices.putMapping({
	                index: index,
	                body: typedefs[type],
	                type: type
	            }, function(err, response, status) {
	                if (err) {
	                    console.trace(err);
	                }
	                console.log(response, status);
	            });
	        };
        
        es.indices.create({
            index: index,
            body: {
                settings: settings
            }
        }, function(err, response, status) {
            if (err) {
                console.trace(err);
            }
            types.forEach(typeHandler);
        });
    }
};

module.exports = ESMapping;
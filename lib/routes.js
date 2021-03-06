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

var router = require('express').Router(),
    //validator = require('validator'),
    pagination = require('pagination'),
    pagerTemplate = require('./pager'),
    url = require('url'),
    extractor = require('unfluff'),
    request = require('request'),
    scraper = require('./elasticsearch/scraper'),

    ensureAuthenticated = function() {
        return function(req, res, next) {
		    if (req.isAuthenticated()) { 
		    	delete req.session.originalUrl;
		        return next(); 
		    }
		    req.session.originalUrl = req.originalUrl;
		    res.redirect('/login');
		};
	},
	
	
	parseJson = function(data) {
		var output = {};
		
		if (data.result) {
			output.total = data.result.total;
			output.hits = [];
			if (data.result.hits) {
				data.result.hits.forEach(function(item) {
					output.hits.push(item);
				});
			} else {
				output = data.result;
			}
		} else {
			output = data;
		}
		return output;
	},
	
	
	output = function(res, template, data) {
		res.format({
			html: function() {
				res.render(template, data);
			},
			json: function() {
				res.json(parseJson(data));
			},
			rss: function() {
				res.render('feed', data);
			}
		});
	};


/**
 * Default Route
 *
 * @Route GET /
 * @API
 */
router.get('/', function(req, res) {
	var data = { 
	        user: req.user, 
	        message: req.flash('error'),
	        q: '',
	        title: res.locals.appdata.name,
			slides: null
	    };
	if (req.isAuthenticated()) {
		req.es.search({
		    q: req.config.app.ui.home.slider.searchTerm,
		    size: req.config.app.ui.home.slider.resultSize,
		    sort: req.config.app.ui.home.slider.sort
		}).then(function(body) {
		    data.slides = body.hits.hits;
		    output(res, 'index', data);
		}, function (error) {
		    console.trace(error.message);
		});
	} else {
		output(res, 'index', data);
	}
});


/**
 * Login
 *
 * @Route GET /login
 */
router.get('/login', function(req, res) {
    res.render('login', { 
        user: req.user, 
        message: req.flash('error'),
        csrfToken: req.csrfToken(),
        title: 'Login'
    });
});


/**
 * Search
 *
 * @Route GET /search
 * @API
 */
router.get('/search', ensureAuthenticated(), function(req, res) {
    var q = req.query.q ? req.query.q : (req.session.q || ''),
        size = 10,
        page = (req.query.page ? parseInt(req.query.page, 10) : 1),
		startIndex = ((page * size) - size),
        data = {
            q: q,
            user: req.user, 
            message: req.flash('error'),
	        title: 'Search',
			mode: (req.query.mode || res.locals.appdata.ui.search.style || 'cards'),
			page: page,
			startIndex: startIndex,
			itemsPerPage: size
        };
        
    if (q) {
	    req.es.search({
	        q: q,
	        from: startIndex,
	        size: size
	    }).then(function(body) {
	        var pager = new pagination.TemplatePaginator({
		            prelink: '/search?q=' + q,
		            current: page,
		            rowsPerPage: size,
		            totalResult: body.hits.total,
				    template: pagerTemplate.EndlessScrollingTemplate
		        }),
				header = new pagination.TemplatePaginator({
		            prelink: '/search?q=' + q,
		            current: page,
		            rowsPerPage: size,
		            totalResult: body.hits.total,
				    template: pagerTemplate.HeaderTemplate
		        });
	        data.result = body.hits;
	        data.q = q;
	        data.pager = pager.render();
	        data.header = header.render();
	        req.session.q = q;
	        output(res, 'search', data);
	    }, function (error) {
	        console.trace(error.message);
	    });
	} else {
	    req.session.q = null;
	    output(res, 'search', data);
	}
});


/**
 * Stream
 *
 * @Route GET /stream
 * @API
 */
router.get('/stream', ensureAuthenticated(), function(req, res) {
    var size = (req.config.app.ui.stream.resultSize || 10),
        page = (req.query.page ? parseInt(req.query.page, 10) : 1),
		data = {
            user: req.user, 
            message: req.flash('error'),
	        title: 'Stream',
			mode: (req.query.mode || req.config.app.ui.stream.style || 'cards')
        };
        
    req.es.search({
        q: req.config.app.ui.stream.searchTerm || '*',
        from: ((page * size) - size),
        size: size,
        sort: req.config.app.ui.stream.sort
    }).then(function(body) {
        var pager = new pagination.TemplatePaginator({
            prelink: '/stream',
            current: page,
            rowsPerPage: size,
            totalResult: body.hits.total,
            template: pagerTemplate.EndlessScrollingTemplate
        });
        data.result = body.hits;
        data.pager = pager.render();
        output(res, 'stream', data);
    }, function (error) {
        console.trace(error.message);
    });
});


/**
 * View
 *
 * @Route GET /view
 * @API
 */
router.get('/view/:index/:type/:id', ensureAuthenticated(), function(req, res) {
    var data = {
            user: req.user, 
            message: req.flash('error'),
	        title: 'View'
        };
    
    req.es.get({
    	index: req.params.index,
		type: req.params.type,
        id: req.params.id
    }).then(function(body) {
        data.result = body;
        console.log(data);
        output(res, 'view', data);
    }, function (error) {
        console.trace(error.message);
    });
});


/**
 * Type Mapping
 *
 * @Route GET /types
 * @API
 */
router.get('/types', ensureAuthenticated(), function(req, res) {
	output(res, 'types', {
		types: require(process.cwd() + '/config/elasticsearch/types.json'),
		title: 'Types'
	});
});


/**
 * Push
 *
 * @Route GET|POST /push
 */
router.route('/push')
    .get(ensureAuthenticated(), function(req, res) {
	    res.render('push', {
	        url: (req.query.url || ''),
	        success: req.query.success || null,
	        error: req.session.error || null,
            csrfToken: req.csrfToken(),
	        readonly: (req.query.url ? 'readonly' : ''),
	        title: 'Push'
	    });
	})
	.post(ensureAuthenticated(), function(req, res) {
	    var json = {
	            index: req.config.elasticsearch.index.name || 'ifttt',
	            type: req.body.type || 'common',
	            body:{
	                title: req.body.title,
	                description: req.body.description,
	                image: (req.body.image ? url.resolve(req.body.url, req.body.image) : null),
	                url: req.body.url,
	                username: req.user.username,
	                type: req.body.type || 'common',
	                datasource: req.body.datasource || 'web',
	                timestamp: new Date()
	            }
	        };
	        
	    req.es.index(json, function(error, response) {
	        if (error) {
	            req.session.error = error;
	            return res.redirect('/push');
	        }
	        req.session.error = null;
	        
            scraper(json.body.url, function(err, data) {
                if (err) {
                    console.trace(err);
                }
                
                req.es.get({
                    index: response._index,
                    type: response._type,
                    id: response._id
                }).then(function(body) {
                    req.es.update({
                        index: body._index,
                        type: body._type,
                        id: body._id,
                        body: {
                            doc: {
                                fullpage: data.text
                            }
                        }
                    }, function(error) {
                        if (error) {
                            console.trace(error);
                        }
                    });
                }, function (error) {
                    if (error) {
                        console.trace(error);
                    }
                });
            });
	        return res.redirect('/push?success=1');
	    });
	});


/**
 * Delete
 *
 * @Route POST /delete
 */
router.post('/delete', ensureAuthenticated(), function(req, res) {
    req.es.delete({
        index: req.body.index,
        type: req.body.type,
        id: req.body.id
    }).then(function(body) {
        res.json(body);
    }, function (error) {
        console.trace(error.message);
    });
});


/**
 * OpenSearch Description
 *
 * @Route GET /opensearch.xml
 */
router.get('/opensearch.xml', ensureAuthenticated(), function(req, res) {
    res.set({'Content-Type': 'application/opensearchdescription+xml'});
    res.render('opensearch');
});


/**
 * RSS-Feed
 *
 * @Route GET /feed.xml
 */
router.get('/feed.xml', ensureAuthenticated(), function(req, res) {
	var q = (req.query.q || req.config.app.ui.feed.searchTerm || '*'),
        page = (req.query.page ? parseInt(req.query.page, 10) : 1),
        size = (req.config.app.ui.feed.resultSize || 10),
        startIndex = ((page * size) - size),
		data = {
	        user: req.user,
	        title: 'RSS-Feed',
	        queryTerm: q,
	        startIndex: startIndex,
	        size: size
	    };
	
    req.es.search({
        q: q,
        from: startIndex,
        size: size,
        sort: req.config.app.ui.feed.sort
    }).then(function(body) {
        data.documents = body.hits.hits;
        data.body = body;
        console.log(body);
        res.set({'Content-Type': 'application/rss+xml'});   
        res.render('feed', data);
    }, function (error) {
        console.trace(error.message);
    });
});
 

router.get('/inspect', function(req, res, next) {
    var target = req.query.url;
    if (!target) {
        return res.sendStatus(404);
    }
    request(target, function(error, response, body) {
        var json = extractor(body);
        
        if (json.title.indexOf('Error (') === 0) {
            return next(new Error(json.text));
        }
        if (json.image) {
            json.image = url.resolve(target, json.image);
        }
        return res.json(json);
    });
});
 
module.exports = router;

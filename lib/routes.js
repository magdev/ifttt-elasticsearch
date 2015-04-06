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
    validator = require('validator'),
    pagination = require('pagination'),
	pagerTemplate = require('./pager').EndlessScrollingTemplate,
	headerTemplate = require('./pager').HeaderTemplate,	

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
				if (output.hits.length === 1) {
					output = output.hits[0];
				}
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
router.get('/', function(req, res, next) {
	var data = { 
	        user: req.user, 
	        message: req.flash('error'),
	        q: '',
	        title: res.locals.appdata.name,
			slides: null
	    };
	if (req.isAuthenticated()) {
		req.es.search({
		    q: '* +image:*',
		    size: 10,
		    sort: 'timestamp:desc'
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
router.get('/login', function(req, res, next) {
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
router.get('/search', ensureAuthenticated(), function(req, res, next) {
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
				    template: pagerTemplate
		        }),
				header = new pagination.TemplatePaginator({
		            prelink: '/search?q=' + q,
		            current: page,
		            rowsPerPage: size,
		            totalResult: body.hits.total,
				    template: headerTemplate
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
router.get('/stream', ensureAuthenticated(), function(req, res, next) {
    var size = 12,
        page = (req.query.page ? parseInt(req.query.page, 10) : 1),
		data = {
            user: req.user, 
            message: req.flash('error'),
	        title: 'Stream',
			mode: (req.query.mode || res.locals.appdata.ui.recent.style || 'cards')
        };
        
    req.es.search({
        q: '*',
        from: ((page * size) - size),
        size: size,
        sort: 'timestamp:desc'
    }).then(function(body) {
        var pager = new pagination.TemplatePaginator({
            prelink: '/stream',
            current: page,
            rowsPerPage: size,
            totalResult: body.hits.total,
            template: pagerTemplate
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
router.get('/view/:index/:type/:id', ensureAuthenticated(), function(req, res, next) {
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
router.get('/types', ensureAuthenticated(), function(req, res, next) {
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
    .get(ensureAuthenticated(), function(req, res, next) {
	    res.render('push', {
	        url: (req.query.url || ''),
	        success: req.query.success || null,
	        error: req.session.error || null,
	        readonly: (req.query.url ? 'readonly' : ''),
	        title: 'Push'
	    });
	})
	.post(ensureAuthenticated(), function(req, res, next) {
	    var json = {
	            index: req.config.elasticsearch.index.name || 'ifttt',
	            type: req.body.type || 'common',
	            body:{
	                title: req.body.title,
	                description: req.body.description,
	                image: req.body.image,
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
	        return res.redirect('/push?success=1');
	    });
	});


/**
 * Settings
 *
 * @Route GET|POST /settings
 */
router.route('/settings')
    .get(ensureAuthenticated(), function(req, res, next) {
        res.render('settings', {
            user: req.user, 
            message: req.flash('error'),
            title: 'Settings',
            disableAddButton: true
        });
    })
    .post(ensureAuthenticated(), function(req, res, next) {
        if (req.body.baseColor) {
            req.config.app.ui.theme.baseColor = req.body.baseColor;
        }
        if (req.body.buttonColor) {
            req.config.app.ui.theme.buttonColor = req.body.buttonColor;
        }
        if (req.body.textColor) {
            req.config.app.ui.theme.textColor = req.body.textColor;
        }
        return res.redirect('/settings');
    });


/**
 * Delete
 *
 * @Route POST /delete
 */
router.post('/delete', ensureAuthenticated(), function(req, res, next) {
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
router.get('/opensearch.xml', ensureAuthenticated(), function(req, res, next) {
    res.set({'Content-Type': 'application/opensearchdescription+xml'});
    res.render('opensearch');
});


/**
 * RSS-Feed
 *
 * @Route GET /feed.xml
 */
router.get('/feed.xml', ensureAuthenticated(), function(req, res, next) {
	var q = req.query.q || '*',
		data = {
	        user: req.user,
	        title: 'RSS-Feed'
	    };
	
    req.es.search({
        q: q,
        size: 10,
        sort: 'timestamp:desc'
    }).then(function(body) {
        data.documents = body.hits.hits;
        res.set({'Content-Type': 'application/rss+xml'});   
        res.render('feed', data);
    }, function (error) {
        console.trace(error.message);
    });
});


module.exports = router;

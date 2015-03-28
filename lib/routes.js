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
    pagination = require('pagination'),

    ensureAuthenticated = function() {
        return function(req, res, next) {
		    if (req.isAuthenticated()) { 
		        return next(); 
		    }
		    res.redirect('/login');
		};
	},
	
	
	pagerTemplate = function(result) {
        var i, len, prelink;
        var html = '<ul class="pagination">';
        if(result.pageCount < 2) {
            html += '</ul></div>';
            return html;
        }
        prelink = this.preparePreLink(result.prelink);
        if(result.previous) {
            html += '<li><a href="' + prelink + result.previous + '"><i class="mdi-navigation-chevron-left"></i></a></li>';
        }
        if(result.range.length) {
            for( i = 0, len = result.range.length; i < len; i++) {
                if(result.range[i] === result.current) {
                    html += '<li class="active"><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
                } else {
                    html += '<li class="waves-effect"><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
                }
            }
        }
        if(result.next) {
            html += '<li><a href="' + prelink + result.next + '" class="paginator-next"><i class="mdi-navigation-chevron-right"></i></a></li>';
        }
        html += '</ul></div>';
        return html;
    };


router.get('/', function(req, res, next) {
    res.redirect('/stream');
});


router.get('/login', function(req, res, next) {
    res.render('index', { 
        user: req.user, 
        message: req.flash('error'),
        csrfToken: req.csrfToken(),
        q: req.query.q ? req.query.q : req.session.q,
        title: 'Login'
    });
});


router.get('/search', ensureAuthenticated(), function(req, res, next) {
    var q = req.query.q ? req.query.q : (req.session.q || ''),
        size = 10,
        page = (req.query.page ? parseInt(req.query.page, 10) : 1),
        data = {
            q: q,
            user: req.user, 
            message: req.flash('error'),
	        title: 'Search'
        };
        
    if (q) {
	    req.es.search({
	        q: q,
	        from: ((page * size) - size),
	        size: size
	    }).then(function(body) {
	        var pager = new pagination.TemplatePaginator({
	            prelink: '/search?q=' + q,
	            current: page,
	            rowsPerPage: size,
	            totalResult: body.hits.total,
			    template: pagerTemplate
	        });
	        data.result = body.hits;
	        data.q = q;
	        data.pager = pager.render();
	        req.session.q = q;
	        res.render('search', data);
	    }, function (error) {
	        console.trace(error.message);
	    });
	} else {
	    req.session.q = null;
	    res.render('search', data);
	}
});


router.get('/stream', ensureAuthenticated(), function(req, res, next) {
    var size = 12,
        page = (req.query.page ? parseInt(req.query.page, 10) : 1),
        data = {
            user: req.user, 
            message: req.flash('error'),
	        title: 'Stream'
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
        res.render('stream', data);
    }, function (error) {
        console.trace(error.message);
    });
});



router.route('/share')
    .get(ensureAuthenticated(), function(req, res, next) {
	    res.render('share', {
	        url: (req.query.url || ''),
	        success: req.query.success || null,
	        error: req.session.error || null,
	        readonly: (req.query.url ? 'readonly' : ''),
	        title: 'Share'
	    });
	})
	.post(ensureAuthenticated(), function(req, res, next) {
	    var json = {
	            index: req.config.index.name || 'ifttt',
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
	            return res.redirect('/share');
	        }
	        req.session.error = null;
	        return res.redirect('/share?success=1');
	    });
	});


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


router.get('/opensearch.xml', ensureAuthenticated(), function(req, res, next) {
    res.set({'Content-Type': 'application/opensearchdescription+xml'});
    res.render('opensearch');
});


module.exports = router;

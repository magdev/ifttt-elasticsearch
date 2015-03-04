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

    ensureAuthenticated = function(req, res, next) {
	    if (req.isAuthenticated()) { 
	        return next(); 
	    }
	    res.redirect('/login');
	};

router.get('/', function(req, res, next) {
    res.redirect('/login');
});

router.get('/login', function(req, res, next) {
    res.render('index', { 
        user: req.user, 
        message: req.flash('error'),
        csrfToken: req.csrfToken(),
        q: req.query.q ? req.query.q : req.session.q,
        from: req.query.f ? req.query.f : 0,
        size: req.query.s ? req.query.s : 10
    });
});

router.get('/search', ensureAuthenticated, function(req, res, next) {
    var data = {
            q: '',
            user: req.user, 
            message: req.flash('error'),
        },
        q = req.query.q ? req.query.q : req.session.q;
        
    if (q) {
	    req.es.search({
	        q: q
	    }).then(function(body) {
	        data.result = body.hits;
	        data.q = q;
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

module.exports = router;

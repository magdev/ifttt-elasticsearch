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
 
module.exports = function(app, config) {

    app.use(function(req, res, next) {
        res.locals.bookmarklet = function() {
            return 'javascript:window.open("' + req.currentBaseurl + '/share?url="+encodeURIComponent(location.href), "indexall", "locationbar=yes,width=480px,height=500px,statusbar=no,menubar=no,scrollbars=yes,toolbar=no,resizable=yes")';
        };
        res.locals.imageNotBlank = function(url) {
            var regexp = RegExp('no_image_card.png$');
            return url && regexp.test(url) === false;
        };
        return next();
    });
    
    app.use(function (req, res, next) {
        if (req.url.indexOf('/css/') === 0 
                || req.url.indexOf('/js/') === 0 
                || req.url.indexOf('/fonts/') === 0 
                || req.url.indexOf('/assets/') === 0 
                || req.url.indexOf('/img') === 0 
                || req.url.indexOf('/favicon') === 0) {
            
            res.setHeader('Cache-Control', 'public, max-age=' + (config.cache.maxAge/1000) + ', must-revalidate');
            res.setHeader('Expires', new Date(Date.now() + config.cache.maxAge).toUTCString());
        } else if (req.url == '/' || req.url == '/xmlrpc.php') {
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Expires', new Date(Date.now()).toUTCString());
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
};
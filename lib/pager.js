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
 
module.exports = {
    SimpleTemplate: function(result) {
        var prelink,
            html = '<ul class="pagination">';
            
        if(result.pageCount < 2) {
            html += '</ul></div>';
            return html;
        }
        prelink = this.preparePreLink(result.prelink);
        if(result.previous) {
            html += '<li><a href="' + prelink + result.previous + '" class="paginator-prev"><i class="mdi-navigation-chevron-left"></i></a></li>';
        }
        if(result.next) {
            html += '<li><a href="' + prelink + result.next + '" class="paginator-next"><i class="mdi-navigation-chevron-right"></i></a></li>';
        }
        html += '</ul></div>';
        return html;
    },
    
    ExtendedTemplate: function(result) {
        var i, len, prelink,
            html = '<ul class="pagination">';
            
        if(result.pageCount < 2) {
            html += '</ul></div>';
            return html;
        }
        prelink = this.preparePreLink(result.prelink);
        if(result.previous) {
            html += '<li><a href="' + prelink + result.previous + '" class="paginator-prev"><i class="mdi-navigation-chevron-left"></i></a></li>';
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
    },
    
    EndlessScrollingTemplate: function(result) {
        var prelink,
            html = '<ul class="pagination">';
            
        if(result.pageCount < 2) {
            html += '</ul></div>';
            return html;
        }
        prelink = this.preparePreLink(result.prelink);
        if(result.previous) {
            html += '<li><a href="' + prelink + result.previous + '" class="paginator-prev"><i class="mdi-navigation-chevron-left"></i></a></li>';
        }
        if(result.next) {
            html += '<li><a href="' + prelink + result.next + '" class="paginator-next"><i class="mdi-navigation-chevron-right"></i></a></li>';
        }
        html += '</ul></div>';
        return html;
    },
    
    HeaderTemplate: function(result) {
        var prelink, html = '';
        
        prelink = this.preparePreLink(result.prelink);
        if(result.previous) {
            html += '<link rel="previous" href="' + prelink + result.previous + '" type="text/html">';
        }
        if(result.next) {
            html += '<link rel="next" href="' + prelink + result.next + '" type="text/html">';
        }
        if(result.current) {
            html += '<link rel="self" href="' + prelink + result.current + '" type="text/html">';
        }
        html += '<link rel="first" href="' + prelink + '1" type="text/html">';
        if(result.last) {
            html += '<link rel="last" href="' + prelink + result.last + '" type="text/html">';
        }
        return html;
    }
};
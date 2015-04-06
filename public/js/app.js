(function($) {
    var bindEventHandlers = function(elements) {
            $(elements).find('.delete').each(function() {
		        $(this).click(function(ev) {
		            ev.preventDefault();
		            if (confirm('Are you sure?')) {
		                var item = $(this).closest('.item').get(0);
		                $.post('/delete', item.dataset, function(result) {
		                    $(item).closest('.col').fadeOut({
		                        done: function(result) {
		                            $(this).remove();
		                        },
		                        fail: function(result) {
		                            toast(result.message, 5000, 'rounded');
		                        }
		                    });
		                });
		            };
		        });
		    });
		    
		    $(elements).find('.share-button').dropdown({
		        inDuration: 300,
		        outDuration: 225,
		        constrainWidth: false,
		        hover: false,
		        alignment: 'right',
		        gutter: 0,
		        belowOrigin: true
		    });
	    };
    
	$('.headroom').click(function(ev) {
	    $('html, body').animate({
	        scrollTop: 0
	    }, 500);
	});
	$('.headroom').find('a').not('.modal-trigger,.button-collapse').click(function(ev) {
	    ev.stopImmediatePropagation();
	});
	$('.headroom').headroom({
	    onPin : function() {
	       $('#share-button,.github-badge')
	           .removeClass('unpinned')
	           .addClass('pinned');
	    },
        onUnpin : function() {
           $('#share-button,.github-badge')
               .removeClass('pinned')
               .addClass('unpinned');
        },
	});
	
    $('.button-collapse').sideNav();
    $('.modal-trigger').leanModal();
    $('#message').each(function() {
        toast(this.innerHTML, 4000, 'rounded');
    });
    $('.add-search').click(function(ev) {
        ev.preventDefault();
        window.external.AddSearchProvider($(this).attr('href'));
    });
    $('.btn-bookmarklet').click(function(ev) {
        ev.preventDefault();
        return false;
    });
    bindEventHandlers($('.card'));
    $('.infsc-container').infinitescroll({
        navSelector: '.pagination',
        nextSelector: '.paginator-next',
        itemSelector: '.infsc-item',
        donetext: '',
        loadingText: '',
        loadingImg: ''
    }, function(newElements) {
        bindEventHandlers(newElements);
    });
    $('.btn-add').click(function(ev) {
        ev.preventDefault();
        window.open('/push', 'indexall', 'locationbar=yes,width=480px,height=500px,statusbar=no,menubar=no,scrollbars=yes,toolbar=no,resizable=yes')
    });
    var shr = new Share();
    $('.slider').slider({
        full_width: true,
        interval: 5000
    });
    $('.collapsible').collapsible();
})(jQuery);
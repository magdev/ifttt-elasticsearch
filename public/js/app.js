(function($) {
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
    $('.delete').each(function() {
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
})(jQuery);
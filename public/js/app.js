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
})(jQuery);
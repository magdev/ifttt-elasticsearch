(function($) {
    $(".button-collapse").sideNav();
    
    $('#message').each(function() {
        toast(this.innerHTML, 4000, 'rounded');
    });
})(jQuery);
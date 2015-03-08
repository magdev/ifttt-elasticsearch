(function($) {
    $('#url').urlive({ 
        container: '.preview',
        callbacks: {
            onSuccess: function(data) {
                $('#title').val(data.title);
                $('#description').val(data.description);
                $('#image').val(data.image);
            }
        }
    });
})(jQuery);
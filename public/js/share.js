(function($) {
    var opts = { 
            container: '.preview',
            callbacks: {
                onSuccess: function(data) {
                    $('#title').val(data.title);
                    $('#description').val(data.description);
                    $('#image').val(data.image);
                    $('.btn-submit').attr('disabled', false);
                }
            }
        };
        
    if ($('#url').val() !== '') {
	    $('#url').urlive(opts);
	} else {
	   $('#url').change(function(ev) {
	       $(this).urlive(opts);
	   });
	}
})(jQuery);
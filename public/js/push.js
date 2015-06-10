(function($) {
    var renderData = function(data, cb) {
            $('.card-title').text(data.title);
            $('.card-description').text(data.description);
            if (data.image) {
                var $img = $('.card-image').find('img');
                $img.attr('src', data.image);
                if ($img.get(0).naturalWidth < 500) {
                    $('.card-image').addClass('col s4');
                    $('.card-content').addClass('col s8');
                    $('.card-image .card-title').hide();
                } else {
                    $('.card-content .card-title').hide();
                    $('.card-image').removeClass('col s4');
                    $('.card-content').removeClass('col s8');
                }
                $('.card-image').show();
            }
            cb();
        },
    
        loadDataIntoDOM = function(data) {
            $('#title').val(data.title);
            $('#description').val(data.description);
            $('#text').val(data.text);
            $('#image').val(data.image);
            $('.btn-submit').attr('disabled', false);
            $('.btn-submit').get(0).focus();
            
            renderData(data, function() {
                $('#data-container').slideDown();
            });
            
        },
        
        requestInfo = function(url) {
            $('#data-container').slideUp();
            $.get('/inspect?url=' + url, function(data, status, jqXHR) {
                console.log(data);
                loadDataIntoDOM(data);
            }, 'json');
        };
    $('.btn-abort').click(function(ev) {
        window.close();
    });
    if ($('#url').val() !== '') {
	    requestInfo($('#url').val());
	}
    $('#url').change(function(ev) {
        requestInfo($(this).val());
    });
})(jQuery);
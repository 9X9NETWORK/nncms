$(function() {
    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
    if($('input.text').length > 0) {
        $('input.text').toggleVal();
    }

    $('.lightbox-upload-video .radio-list a').click(function() {
        $('.lightbox-upload-video .radio-list').children('span').removeClass('on');
        $(this).parent('span').addClass('on');
    });
    $('.lightbox-upload-video .radio-list a.radio-upload').click(function() {
        $('.lightbox-upload-video .upload-func p.upload').show();
        $('.lightbox-upload-video .upload-func p.img-url').hide();
    });
    $('.lightbox-upload-video .radio-list a.radio-url').click(function() {
        $('.lightbox-upload-video .upload-func p.img-url').show();
        $('.lightbox-upload-video .upload-func p.upload').hide();
    });

    $('#content-main-wrap .btn-upload-audio a, #title-func .upload-audio a').click(function() {
        $.blockUI({ 
            message: $('#lightbox-upload-video')
        });
        $('.blockOverlay').height($(window).height() - 45);
        return false;
    });
    
    $('.uploads a.video-edit').click(function() {    
        $.blockUI({ 
            message: $('#lightbox-edit-video')
        });
        return false;
    });
    
    $('.uploads a.video-play').click(function() {    
        $.blockUI({ 
            message: $('#lightbox-play-video')
        });
        return false;
    });

    $('.unblock, .btn-close').click(function() {
        $.unblockUI();
        return false;
    });
});
$(function() {
    $.blockUI.defaults.overlayCSS.opacity = '0.9';

    if($('#lightbox-create-channel').length > 0) {
        $.blockUI({ 
            message: $('#lightbox-create-channel')
        }); 
    }

    $('.switch-on').click(function() {
        $.blockUI({ 
            message: $('#lightbox-facebook')
        });
        $('.blockOverlay').height($(window).height() - 45 - 48);
    });
    
    $('#main-container .btn-upload-audio a, #title-func .upload-audio a').click(function() {
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
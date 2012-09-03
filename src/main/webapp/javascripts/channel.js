$(function() {
    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
    if($('#lightbox-create-channel').length > 0) {
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({ 
            message: $('#lightbox-create-channel')
        }); 
    }

    $('.switch-on').click(function() {
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({ 
            message: $('#lightbox-facebook')
        });
        $('.blockOverlay').height($(window).height() - 45 - 48);
    });

    $('.unblock, .btn-close').click(function() {
        $.unblockUI();
        return false;
    });

    $('#title-func .save a').click(function() {
        $('#process-notice').fadeIn();
        setTimeout(function() {
            $('#process-notice').hide();
            $('#process-notice').html('Changes were saved successfully');
            $('#process-notice').fadeIn().delay(3000).fadeOut();
        }, 3000);
        return false;
    });

    $('#process-notice').corner('bottom 5px');
});
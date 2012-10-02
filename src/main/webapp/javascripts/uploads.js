$(function () {
    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI.defaults.focusInput = false;
    setPosition();

    $('body').keyup(function (e) {
        if (e.keyCode === 27) {
            $.unblockUI();
        }
    });

    if ($('input.text').length > 0) {
        $('input.text').toggleVal();
    }

    $('.lightbox-upload-video .radio-list a').click(function () {
        $('.lightbox-upload-video .radio-list').children('span').removeClass('on');
        $(this).parent('span').addClass('on');
    });
    $('.lightbox-upload-video .radio-list a.radio-upload').click(function () {
        $('.lightbox-upload-video .upload-func p.upload').show();
        $('.lightbox-upload-video .upload-func p.img-url').hide();
        $(this).parent().parent().parent().parent().children('.notice').toggleClass('hide');
    });
    $('.lightbox-upload-video .radio-list a.radio-url').click(function () {
        $('.lightbox-upload-video .upload-func p.img-url').show();
        $('.lightbox-upload-video .upload-func p.upload').hide();
        $(this).parent().parent().parent().parent().children('.notice').toggleClass('hide');
    });

    $('#lightbox-upload-video .btn-save, #lightbox-edit-video .btn-save').click(function () {
        $.unblockUI();
        $('#overlay-s .overlay-middle').html('Saving...');
        $('#overlay-s').fadeIn();
        setTimeout(function () {
            $('#overlay-s').hide();
            location.href = 'uploads-list.html';
        }, 3000);
        return false;
    });

    $('#content-main-wrap .btn-upload-audio a, #title-func .upload-audio a').click(function () {
        $.blockUI({ 
            message: $('#lightbox-upload-video')
        });
        $('.blockOverlay').height($(window).height() - 45);
        return false;
    });

    $('.uploads a.video-edit').click(function () {    
        $.blockUI({ 
            message: $('#lightbox-edit-video')
        });
        return false;
    });

    $('.uploads a.video-play').click(function () {    
        $.blockUI({ 
            message: $('#lightbox-play-audio')
        });
        return false;
    });

    $('.uploads a.video-del').click(function () {
        $.blockUI({ 
            message: $('#delete-prompt')
        });
        $('.blockOverlay').height($(window).height() - 45);
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        $('#overlay-s .overlay-middle').html('Saving...');
        $('#overlay-s').fadeIn();
        setTimeout(function () {
            $('#overlay-s').hide();
            $('#overlay-s .overlay-middle').html('Changes were saved successfully');
            $('#overlay-s').fadeIn().delay(3000).fadeOut();
        }, 3000);
        return false;
    });

    $('.unblock, .btn-close, .btn-cancel, .btn-no').click(function () {
        $.unblockUI();
        return false;
    });

    $(window).resize(function () {
        setPosition();
        scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
    });
});

function setPosition() {
    var rowItem = parseInt($('.video-list').width() / 114, 10);
    var titleBtnPosition = rowItem * 114 - 14 - 130;
    $('#title-func p.upload-audio').css('left', titleBtnPosition + 'px');
}
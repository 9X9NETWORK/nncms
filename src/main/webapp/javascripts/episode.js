$(function () {
    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");

    // common unblock
    $('body').keyup(function (e) {
        if (e.keyCode === 27) {
            $.unblockUI();
            if ($(this).hasClass('has-error')) {
                location.replace('index.html');
            }
            return false;
        }
    });
    $(document).on('click', '.unblock, .btn-close, .fb-ok, .btn-no', function () {
        $.unblockUI();
        $('#ep-list ul li').removeClass('deleting');
        return false;
    });
    $('#system-error .btn-ok, #system-error .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            location.replace('index.html');
        }
        return false;
    });

    // episode list delete
    $(document).on('click', '#ep-list .enable a.del', function () {
        $(this).parent().parent().parent().parent().parent().parent('li').addClass('deleting').data('deleteId', $(this).attr('href'));
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#delete-prompt')
        });
        $('.blockOverlay').height($(window).height() - 45);
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#ep-list li.deleting').length > 0 && '' != $('#ep-list li.deleting').data('deleteId')) {
            $('#overlay-s .overlay-middle').html('Saving...');
            $('#overlay-s').fadeIn();
            $('#overlay-s .overlay-content').css('margin-left', '-43px');
            nn.api('DELETE', $('#ep-list li.deleting').data('deleteId'), null, function (data) {
                $('#overlay-s').hide();
                if ('OK' == data) {
                    $('#episode-counter').html($('#episode-counter').html() - 1);
                    $('#ep-list ul li.deleting').remove();
                    $('#content-main-wrap').height($('#content-main-wrap').height() - 71);  // 71: li height
                    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
                    $('#overlay-s .overlay-middle').html('Changes were saved successfully');
                    $('#overlay-s .overlay-content').css('margin-left', '-132px');
                    $('#overlay-s').fadeIn().delay(3000).fadeOut();
                } else {
                    alert('Delete error');
                }
            });
        } else {
            alert('Nothing to delete');
        }
        return false;
    });

    // episode first cycle
    $('#selected-episode p.episode-pager').html('');
    $('#selected-episode .wrapper ul.content').cycle({
        pager: '.episode-pager',
        activePagerClass: 'active',
        updateActivePagerLink: null,
        fx: 'scrollHorz',
        speed: 1000,
        timeout: 6000,
        pagerEvent: 'mouseover',
        pause: 1,
        cleartypeNoBg: true
    });

    $(window).resize(function () {
        scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
    });
});
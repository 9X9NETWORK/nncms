$(function () {
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    setEpisodeWidth();

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
        showDeletePromptOverlay();
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#ep-list li.deleting').length > 0 && '' != $('#ep-list li.deleting').data('deleteId')) {
            showSavingOverlay();
            nn.api('DELETE', $('#ep-list li.deleting').data('deleteId'), null, function (data) {
                if ('OK' == data) {
                    $('#overlay-s').fadeOut(1000, function () {
                        var cntEpisode = $('#episode-counter').html();
                        if (cntEpisode > 0) {
                            $('#episode-counter').html(cntEpisode - 1);
                        }
                        $('#ep-list ul li.deleting').remove();
                        $('#content-main-wrap').height($('#content-main-wrap').height() - 71);  // 71: li height
                        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                    });
                } else {
                    $('#overlay-s').fadeOut(0, function () {
                        alert('Delete error');
                    });
                }
            });
        } else {
            alert('Nothing to delete');
        }
        return false;
    });

    $(window).resize(function () {
        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        setEpisodeWidth();
    });
});

function setEpisodeWidth() {
    var wrapWidth = $('#content-main-wrap').width(),
        funcWidth = $('#ep-list ul li .episode-info').width();
    $('#ep-list ul li .episode').width(wrapWidth - funcWidth - 50);
    $('#ep-list ul li .episode h3').each(function (index) {
        $(this).html($(this).data('meta'));
    });
    $('#ep-list ul li .episode h3').addClass('ellipsis').ellipsis();
}
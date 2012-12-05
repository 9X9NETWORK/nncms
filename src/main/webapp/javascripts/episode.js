$(function () {
    setEpisodeWidth();
    autoHeight();
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');

    // common unblock
    $('body').keyup(function (e) {
        if (27 === e.which) { // Esc
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

    // leave and unsave
    function confirmExit() {
        if ($('body').hasClass('has-change')) {
            // Unsaved changes will be lost, are you sure you want to leave?
            return $('#unsave-prompt p.content').text();
        }
    }
    window.onbeforeunload = confirmExit;
    $('body').removeClass('has-change');
    $(document).on('click', '#header #logo, #header a, #studio-nav a, #content-nav a, #footer a, #title-func .curate, #episode-list a.edit', function (e) {
        if ($('body').hasClass('has-change')) {
            if (e && $(e.currentTarget).attr('href')) {
                $('body').data('leaveUrl', $(e.currentTarget).attr('href'));
            }
            if (e && $(e.currentTarget).attr('id')) {
                $('body').data('leaveId', $(e.currentTarget).attr('id'));
            }
            showUnsaveOverlay();
            return false;
        }
    });
    $('#unsave-prompt .btn-leave').click(function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        if ('' != $('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
            $('#' + $('body').data('leaveId')).trigger('click');
        } else {
            location.href = $('body').data('leaveUrl');
        }
        return false;
    });
    $('.unblock, .btn-close, .btn-no').click(function () {
        $.unblockUI();
        return false;
    });

    // episode list sorting
    $('#title-func').on('click', 'p.order a.reorder', function () {
        $(this).text(nn._([CMS_CONF.PAGE_ID, 'title-func', 'Save order'])).removeClass('reorder').addClass('save');
        $('#episode-list').sortable('enable');
        $('body').removeClass('has-change');
        return false;
    });
    $('#title-func').on('click', 'p.order a.save', function () {
        var parameter = null,
            episodes = [],
            $this = $(this);
        $('#episode-list > li').each(function () {
            if ($(this).data('meta') > 0) {
                episodes.push($(this).data('meta'));
            }
        });
        if (episodes.length > 0) {
            parameter = {
                episodes: episodes.join(',')
            };
        }
        if ($('body').hasClass('has-change') && null !== parameter) {
            showSavingOverlay();
            nn.api('PUT', CMS_CONF.API('/api/channels/{channelId}/episodes/sorting', {channelId: $this.attr('rel')}), parameter, function (data) {
                $('#overlay-s').fadeOut(1000, function () {
                    $this.text(nn._([CMS_CONF.PAGE_ID, 'title-func', 'Reorder episodes'])).removeClass('save').addClass('reorder');
                    $('#episode-list').sortable('disable');
                    $('body').removeClass('has-change');
                });
            });
        } else {
            $this.text(nn._([CMS_CONF.PAGE_ID, 'title-func', 'Reorder episodes'])).removeClass('save').addClass('reorder');
            $('#episode-list').sortable('disable');
            $('body').removeClass('has-change');
        }
        return false;
    });

    // episode list delete
    $(document).on('click', '#ep-list .enable a.del', function () {
        $(this).parents('li').addClass('deleting').data('deleteId', $(this).attr('rel'));
        showDeletePromptOverlay('Are you sure you want to delete this episode?');
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#ep-list li.deleting').length > 0 && '' != $('#ep-list li.deleting').data('deleteId')) {
            showSavingOverlay();
            nn.api('DELETE', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: $('#ep-list li.deleting').data('deleteId')}), null, function (data) {
                if ('OK' == data) {
                    $('#overlay-s').fadeOut(1000, function () {
                        var cntEpisode = $('#episode-counter').text();
                        if (cntEpisode > 0) {
                            $('#episode-counter').text(cntEpisode - 1);
                        }
                        $('#ep-list ul li.deleting').remove();
                        $('#content-main-wrap').height($('#content-main-wrap').height() - 82);  // 82: li height
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
        setEpisodeWidth();
        autoHeight();
        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    });
});

function setEpisodeWidth() {
    var wrapWidth = $('#content-main-wrap').width(),
        contentmainWidth = $('#content-main').width(),
        titleWidth = $('#title-func').width(),
        channelNameWidth = $('#channel-name').width(),
        crumbWidth = $('#title-func .title-crumb').width(),
        curateBtnWidth = $('#title-func .title-crumb a.curate').width(),
        titleBtnWidth = $('#title-func p.order').width(),
        scheduledWidth = $('#ep-list ul li .scheduled-time').width(),
        publishWidth = $('#ep-list ul li .publish-time').width(),
        viewsWidth = $('#ep-list ul li .views').width(),
        title = $('#ep-list ul li .episode h3').data('meta');
    $('#ep-list ul li .wrap, #title-func .caption').width(wrapWidth - 31 - 1);  // 1:border
    $('#ep-list ul li .episode, #title-func .caption  p.episode').width(wrapWidth - 31 - scheduledWidth - publishWidth - viewsWidth - 1);   // 1:border
    $('#ep-list ul li .episode h3').each(function (index) {
        $('a', this).text($(this).data('meta'));
    });
    $('#ep-list ul li .episode h3').addClass('ellipsis').ellipsis();
    if ($('#channel-name').data('width') + curateBtnWidth > $('#ep-list ul li .episode').width()) {
        $('#title-func h2').width($('#ep-list ul li .episode').width() - curateBtnWidth);
        $('#title-func h2').css('padding-right', parseInt(crumbWidth + 5, 10) + 'px');
        $('#channel-name').text($('#channel-name').data('meta')).addClass('ellipsis').ellipsis();
    }
    if ($('#channel-name').data('width') + curateBtnWidth <= $('#ep-list ul li .episode').width()) {
        $('#title-func h2').width('auto');
        $('#title-func h2').css('padding-right', parseInt(crumbWidth + 5, 10) + 'px');
        $('#channel-name').text($('#channel-name').data('meta')).removeClass('ellipsis');
    }
}
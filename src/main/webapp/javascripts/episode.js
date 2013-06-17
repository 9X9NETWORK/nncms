/*jslint browser: true, nomen: true, unparam: true, sloppy: true */
/*global $, nn, CMS_CONF, scrollbar, autoHeight, showSavingOverlay, showUnsaveOverlay, showDeletePromptOverlay, listEpisode */

function setEpisodeWidth() {
    var wrapWidth = $('#content-main-wrap').width(),
        contentmainWidth = $('#content-main').width(),
        crumbWidth = $('#title-func .title-crumb').width(),
        titleBtnsWidth = $('#title-func ul').width(),
        scheduledWidth = $('#ep-list ul li .scheduled-time').width(),
        publishWidth = $('#ep-list ul li .publish-time').width(),
        viewsWidth = $('#ep-list ul li .views').width(),
        numberWidth = $('#ep-list ul li .number').width() + 20; // 20 ix padding
    // set min size
    if (numberWidth < 50) {
        numberWidth = 50;
    }
    $('#ep-list ul li .wrap, #title-func .caption').width(wrapWidth - 31 - 1);  // 1:border
    $('#ep-list ul li .episode, #title-func .caption  p.episode').width(wrapWidth - 31 - numberWidth - scheduledWidth - publishWidth - viewsWidth - 1);   // 1:border
    $('#ep-list ul li .number').width(numberWidth - 20);    // 20 is padding
    if ($('#ep-list ul li .episode').length > 0 && $('#channel-name').data('width') + crumbWidth + 10 > contentmainWidth - titleBtnsWidth) {  // 10: title-func padding
        $('#title-func h2').width(contentmainWidth - titleBtnsWidth - 10 - 15);  // 10: title-func padding, 15: channel name and btns space
        $('#channel-name').width($('#title-func h2').width() - crumbWidth - 6);  // 6: channel name margin
    } else {
        $('#title-func h2').width('auto');
        $('#channel-name').width('auto');
    }
}

function setPageScroll(isDown) {
    var eplHeightBefore = $('#content-main-wrap').height(),
        sliderValue = $('#main-wrap-slider' + ' .slider-vertical').slider('value'),
        iPos = 0,
        eplHeightAfter = 0,
        newPos = 0,
        tmpPos = 0;
    // if haven't scroll bar need it to init sliderValue
    if (typeof sliderValue === 'object') {
        sliderValue = 100;
    }
    iPos = eplHeightBefore * (sliderValue / CMS_CONF.SLIDER_MAX);
    autoHeight();   // after this run the height will be update
    eplHeightAfter = $('#content-main-wrap').height();
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    if ('none' === $('#main-wrap-slider').css('display')) {
        $('#main-wrap-slider').hide();
        $('#content-main-wrap').css('top', '0');
    }
    newPos = CMS_CONF.SLIDER_MAX;
    // translate new postion
    if (eplHeightAfter > eplHeightBefore) {
        tmpPos = eplHeightAfter - eplHeightBefore;
        newPos = parseInt(((iPos + tmpPos) / eplHeightAfter) * CMS_CONF.SLIDER_MAX, 10);
    } else {
        // remove episode list
        tmpPos = eplHeightAfter - eplHeightBefore;
        if (isDown !== 'down') {
            iPos = iPos + tmpPos;
        }
        newPos = parseInt((iPos / eplHeightAfter) * CMS_CONF.SLIDER_MAX, 10);
    }
    $('#main-wrap-slider .slider-vertical').slider('value', newPos);
}

function afterDelete(inID) {
    $.each(CMS_CONF.EPISODES_PAGING, function (eKey, eValue) {
        $.each(eValue, function (eeKey, eeValue) {
            if (parseInt(inID, 10) === eeValue.id) {
                CMS_CONF.EPISODES_PAGING[eKey].splice(eeKey, 1);
                return false;
            }
        });
    });
}

$(function () {
    setEpisodeWidth();
    autoHeight();
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');

    // common unblock
    $('body').keyup(function (e) {
        if (27 === e.which) { // Esc
            $.unblockUI();
            $('#ep-list ul li').removeClass('deleting').removeData('deleteId');
            if ($(this).hasClass('has-error')) {
                location.replace('index.html');
            }
            return false;
        }
    });
    $(document).on('click', '.unblock, .btn-close, .btn-no', function () {
        $.unblockUI();
        $('#ep-list ul li').removeClass('deleting').removeData('deleteId');
        return false;
    });
    $('#system-error .btn-ok, #system-error .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            location.replace('index.html');
        }
        return false;
    });

    $(document).on('click', '.isFolderUpDown', function () {
        if ($('body').hasClass('in-reorder')) {
            // in reorder desable function
            return false;
        }
        var folderID = 0,
            tmpCnt = 0,
            tmpOut = '',
            iPageSize = 30,
            tmpStr = '';
        folderID = parseInt($(this).data('meta').toString().replace('up_paging_', '').replace('down_paging_', ''), 10);
        if (folderID > 0) {
            $('body').append('<div style="display: none;" id="tmpEPL"></div>');
            $('#episode-list-tmpl-folder').tmpl(CMS_CONF.EPISODES_PAGING_INFO[folderID]).appendTo('#tmpEPL');
            tmpOut = $('#tmpEPL').html();
            $('#tmpEPL').remove();
            $('.folder_up_' + folderID).remove(); // remove open folder button
            $('#folder_up_' + folderID).replaceWith(tmpOut); // replae open folder up to close floder
            $('.itemFolder_' + folderID).slideUp('slow', function () {
                tmpStr = '';
                if ($(this).data('meta').toString().indexOf('down_paging_') === 0) {
                    tmpStr = 'down';
                } else {
                    tmpStr = 'up';
                }
                $('.itemFolder_' + folderID).remove(); // episode in folder remove
                setTimeout(function () { // give some break for script
                    tmpCnt += 1;
                    if (tmpCnt === iPageSize) { // slidr up / down will call this func by page size times , so only last call this function
                        setPageScroll(tmpStr);
                    }
                }, 200);
            });
        }
    });

    $(document).on('click', '.isFolderOri', function () {
        if ($('body').hasClass('in-reorder')) {
            // in reorder desable function
            return false;
        }
        var folderID = 0,
            tmpOut = '';
        if ($(this).data('meta').toString().indexOf('paging_') === 0) {
            folderID = parseInt($(this).data('meta').toString().replace('paging_', ''), 10);
        }
        if (folderID > 0) {
            // has paging number
            // is folder add folder to this
            $('body').append('<div style="display: none;" id="tmpEPL"></div>');
            $('#episode-list-tmpl-folder-up').tmpl(CMS_CONF.EPISODES_PAGING_INFO[folderID]).appendTo('#tmpEPL');
            $('#episode-list-tmpl-item').tmpl(CMS_CONF.EPISODES_PAGING[folderID]).appendTo('#tmpEPL');
            $('#episode-list-tmpl-folder-down').tmpl(CMS_CONF.EPISODES_PAGING_INFO[folderID]).appendTo('#tmpEPL');

            // sharing url
            $('#tmpEPL div.get-url').each(function () {
                $(this).children().remove();
                $(this).append($('#tmpHtml').html());
            });

            $('#tmpEPL .isItem').addClass('itemFolder_' + folderID);
            tmpOut = $('#tmpEPL').html();
            $('#tmpEPL').remove();
            $('#folder_' + folderID).replaceWith(tmpOut);
            // paging scroll
            setPageScroll('');
            setEpisodeWidth();
            $('.itemFolder_' + folderID).hide();
            $('.itemFolder_' + folderID).slideDown('slow');
        }
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
    $(document).on('click', '#episode-list a.edit', function (e) {
        if ($('body').hasClass('in-reorder')) {
            // in reorder desable function
            return false;
        }
    });
    $(document).on('click', '#header #logo, #header a, #studio-nav a, #content-nav a, #footer a, #title-func .curate', function (e) {
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
        if ($('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
            $('#' + $('body').data('leaveId')).trigger('click');
        } else {
            location.href = $('body').data('leaveUrl');
        }
        return false;
    });

    // episode list sorting
    $('#title-func').on('click', 'p.order a.reorder', function () {
        $(this).text(nn._([CMS_CONF.PAGE_ID, 'title-func', 'Save order'])).removeClass('reorder').addClass('save');
        $('#episode-list').sortable('enable');
        $('body').removeClass('has-change');
        $('body').addClass('in-reorder');
        $('#ep-list ul li .episode .btns .btn-wrap ul li a.edit').addClass('disable');
        $('#ep-list ul li .episode .btns .btn-wrap ul li a.del').addClass('disable');
        return false;
    });
    $('#title-func').on('click', 'p.order a.save', function () {
        $('#ep-list ul li .episode .btns .btn-wrap ul li a.edit').removeClass('disable');
        $('#ep-list ul li .episode .btns .btn-wrap ul li a.del').removeClass('disable');
        $('body').removeClass('in-reorder');
        var parameter = null,
            episodes = [],
            $this = $(this),
            tmpMeta = '',
            folderID = 0,
            sizePage = 0,
            i = 0;
        $('#episode-list > li').each(function () {
            tmpMeta = $(this).data('meta').toString();
            if (tmpMeta.indexOf('paging_') === 0) {
                // folder or open folder get members id
                folderID = 0;
                tmpMeta = tmpMeta.replace('up_paging_', '');
                folderID = parseInt(tmpMeta.replace('paging_', ''), 10);
                if (!(CMS_CONF.EPISODES_PAGING[folderID].length === undefined)) {
                    sizePage = CMS_CONF.EPISODES_PAGING[folderID].length;
                    for (i = 0; i < sizePage; i += 1) {
                        episodes.push(CMS_CONF.EPISODES_PAGING[folderID][i].id);
                    }
                }
            } else if ($(this).data('meta') > 0) {
                // old part
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
            nn.api('PUT', CMS_CONF.API('/api/channels/{channelId}/episodes/sorting', {
                channelId: $this.attr('rel')
            }), parameter, function (data) {
                $('#overlay-s').fadeOut(1000, function () {
                    $this.text(nn._([CMS_CONF.PAGE_ID, 'title-func', 'Reorder episodes'])).removeClass('save').addClass('reorder');
                    $('#episode-list').sortable('disable');
                    $('body').removeClass('has-change');
                    listEpisode(CMS_CONF.PAGE_ID, CMS_CONF.USER_URL.param('id'));
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
    $('#content-main-wrap').on('click', '#ep-list .enable a.del', function () {
        if ($('body').hasClass('in-reorder')) {
            // in reorder desable function
            return false;
        }
        $(this).parents('li').addClass('deleting').data('deleteId', $(this).attr('rel'));
        showDeletePromptOverlay('Are you sure you want to delete this episode?');
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#ep-list li.deleting').length > 0 && $('#ep-list li.deleting').data('deleteId')) {
            showSavingOverlay();
            nn.api('DELETE', CMS_CONF.API('/api/episodes/{episodeId}', {
                episodeId: $('#ep-list li.deleting').data('deleteId')
            }), null, function (data) {
                if ('OK' === data) {
                    $('#overlay-s').fadeOut(1000, function () {
                        var cntEpisode = $('#episode-counter').text();
                        if (cntEpisode > 0) {
                            $('#episode-counter').text(cntEpisode - 1);
                        }
                        afterDelete($('#ep-list li.deleting').data('deleteId'));
                        $('#ep-list ul li.deleting').remove();
                        $('#content-main-wrap').height($('#content-main-wrap').height() - 82);  // 82: li height
                        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                        afterDelete($('#ep-list li.deleting').data('deleteId'));
                    });
                } else {
                    $('#overlay-s').fadeOut(0, function () {
                        nn.log('Delete error', 'error');
                    });
                }
            });
        } else {
            nn.log('Nothing to delete', 'error');
        }
        return false;
    });

    $(window).resize(function () {
        setEpisodeWidth();
        autoHeight();
        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        if ('none' === $('#main-wrap-slider').css('display')) {
            $('#main-wrap-slider').hide();
            $('#content-main-wrap').css('top', '0');
        }
    });
});

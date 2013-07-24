/*jslint browser: true, nomen: true, unparam: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['episode-list'],
        $common = cms.common;

    $page.setEpisodeWidth();
    // $common.autoHeight();
    // $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    $('#content-main-wrap').perfectScrollbar();
    // $('#content-main-wrap').perfectScrollbar('update');
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
            $('#episode-list-tmpl-folder').tmpl(cms.global.EPISODES_PAGING_INFO[folderID]).appendTo('#tmpEPL');
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
                        $page.setPageScroll(tmpStr);
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
            $('#episode-list-tmpl-folder-up').tmpl(cms.global.EPISODES_PAGING_INFO[folderID]).appendTo('#tmpEPL');
            $('#episode-list-tmpl-item').tmpl(cms.global.EPISODES_PAGING[folderID]).appendTo('#tmpEPL');
            $('#episode-list-tmpl-folder-down').tmpl(cms.global.EPISODES_PAGING_INFO[folderID]).appendTo('#tmpEPL');

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
            $page.setPageScroll('');
            $page.setEpisodeWidth();
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
            $common.showUnsaveOverlay();
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
        $(this).text(nn._([cms.global.PAGE_ID, 'title-func', 'Save order'])).removeClass('reorder').addClass('save');
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
                if (!(cms.global.EPISODES_PAGING[folderID].length === undefined)) {
                    sizePage = cms.global.EPISODES_PAGING[folderID].length;
                    for (i = 0; i < sizePage; i += 1) {
                        episodes.push(cms.global.EPISODES_PAGING[folderID][i].id);
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
            $common.showSavingOverlay();
            nn.api('PUT', cms.reapi('/api/channels/{channelId}/episodes/sorting', {
                channelId: $this.attr('rel')
            }), parameter, function (data) {
                $('#overlay-s').fadeOut(1000, function () {
                    $this.text(nn._([cms.global.PAGE_ID, 'title-func', 'Reorder episodes'])).removeClass('save').addClass('reorder');
                    $('#episode-list').sortable('disable');
                    $('body').removeClass('has-change');
                    $page.init();
                });
            });
        } else {
            $this.text(nn._([cms.global.PAGE_ID, 'title-func', 'Reorder episodes'])).removeClass('save').addClass('reorder');
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
        $common.showDeletePromptOverlay('Are you sure you want to delete this episode?');
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#ep-list li.deleting').length > 0 && $('#ep-list li.deleting').data('deleteId')) {
            $common.showSavingOverlay();
            nn.api('DELETE', cms.reapi('/api/episodes/{episodeId}', {
                episodeId: $('#ep-list li.deleting').data('deleteId')
            }), null, function (data) {
                if ('OK' === data) {
                    $('#overlay-s').fadeOut(1000, function () {
                        var cntEpisode = $('#episode-counter').text();
                        if (cntEpisode > 0) {
                            $('#episode-counter').text(cntEpisode - 1);
                        }
                        $page.afterDelete($('#ep-list li.deleting').data('deleteId'));
                        $('#ep-list ul li.deleting').remove();
                        // $('#content-main-wrap').height($('#content-main-wrap').height() - 82);  // 82: li height
                        // $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                        $('#content-main-wrap').perfectScrollbar('update');
                        $page.afterDelete($('#ep-list li.deleting').data('deleteId'));
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

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $page.setEpisodeWidth();
        // $common.autoHeight();
        // $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        $('#content-main-wrap').perfectScrollbar('update');
        // if ('none' === $('#main-wrap-slider').css('display')) {
        //     $('#main-wrap-slider .slider-vertical').slider('destroy');
        //     $('#main-wrap-slider .slider-vertical').slider();
        //     $('#main-wrap-slider').hide();
        //     $('#content-main-wrap').css('top', '0');
        // }
    });
});
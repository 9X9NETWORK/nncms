/*jslint browser: true, nomen: true, regexp: true, unparam: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['epcurate-curation'],
        $common = cms.common,
        videoDeleteIdList = [];

    // $page.setVideoMeasure();
    // $page.setSpace();
    // $common.scrollbarX('#storyboard-wrap', '#storyboard-list', '#storyboard-slider');
    $('#epcurate-nav ul li.curation').click(function () {
        return false;
    });

    // common unblock
    function hasErrorRedirect() {
        var gobackUrl = $('#form-btn-leave').data('gobackUrl');
        if (gobackUrl) {
            $('#form-btn-leave').removeData('gobackUrl');
            location.replace(gobackUrl);
        } else {
            location.replace($('#form-btn-leave').data('leaveUrl'));
        }
    }
    function firstSaveRedirect() {
        $('body').removeClass('first-save');
        var src = $('body').data('origin'),
            nextstep = 'epcurate-curation.html';
        if (!src || (src && 'form-btn-save' === $(src.target).attr('id'))) {
            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
            return false;
        }
        if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
            if ($(src.target).attr('href')) {
                nextstep = $(src.target).attr('href');
            }
            if ($(src.target).parents('a').attr('href')) {
                nextstep = $(src.target).parents('a').attr('href');
            }
        }
        location.href = nextstep;
    }
    $('body').keyup(function (e) {
        if (27 === e.which) { // Esc
            if ('block' === $('#poi-event-overlay').css('display')) {
                if ($('body').hasClass('has-poi-change')) {
                    $common.showUnsavePoiMask(e);
                    return false;
                }
            }
            if ('block' === $('#unsave-poi-mask-prompt').css('display')) {
                $('body').addClass('from-poi-overlay-edit-mode');
                $('#unsave-poi-mask-prompt').hide();
                $('#poi-event-overlay').show();
            } else {
                $.unblockUI();
                $('#poi-event-overlay .wrap').html('');
            }
            $('#poi-list-page ol li').removeClass('deleting').removeData('deleteId');
            if ($(this).hasClass('has-error')) {
                hasErrorRedirect();
            }
            if ($('body').hasClass('first-save')) {
                firstSaveRedirect();
            }
            return false;
        }
    });
    $('#system-error .btn-ok, #system-error .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            hasErrorRedirect();
        }
        return false;
    });
    $('#draft-notice .btn-ok, #draft-notice .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('first-save')) {
            firstSaveRedirect();
        }
        return false;
    });

    // leave and unsave
    function goLeave(url) {
        if ($('body').hasClass('has-change')) {
            $common.showUnsaveOverlay();
        } else {
            location.href = url;
        }
    }
    function confirmExit() {
        if ($('body').hasClass('has-change')) {
            // Unsaved changes will be lost, are you sure you want to leave?
            return $('#unsave-prompt p.content').text();
        }
    }
    window.onbeforeunload = confirmExit;
    $page.removeTotalChangeHook();
    $('#epcurateForm').change(function () {
        $('body').addClass('has-change');
    });
    $('#epcurate-nav-back').click(function (e) {
        if ($('body').hasClass('has-poi-change')) {
            $common.showUnsavePoiOverlay(e);
            return false;
        }
        goLeave($(this).attr('href'));
        return false;
    });
    $('#content-wrap').on('click', '#form-btn-leave', function () {
        goLeave($('#form-btn-leave').data('leaveUrl'));
        return false;
    });
    $(document).on('click', '#header #logo, #header a, #studio-nav a, #content-nav a, #footer a', function (e) {
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
        } else if ($('body').data('leaveUrl')) {
            location.href = $('body').data('leaveUrl');
        } else {
            location.href = $('#form-btn-leave').data('leaveUrl');
        }
        return false;
    });
    function leaveEditMode() {
        $.unblockUI();
        var origin = $('body').data('origin');
        if (origin) {
            if (origin.target && origin.target.id && 'epcurate-nav-back' === origin.target.id) {
                $('body').removeClass('has-change');
            }
            $('body').removeData('origin');
            $(origin.target).trigger('click');
        }
    }
    $('#unsave-trimtime-prompt .btn-leave').click(function () {
        $('body').removeClass('has-trimtime-change');
        leaveEditMode();
        return false;
    });
    $('#unsave-titlecard-prompt .btn-leave').click(function () {
        $('body').removeClass('has-titlecard-change');
        leaveEditMode();
        return false;
    });
    // POI unsave prompt
    $('#unsave-poi-prompt .overlay-btn-yes').click(function () {
        $('body').removeClass('has-poi-change');
        leaveEditMode();
        return false;
    });
    $('#unsave-poi-prompt .overlay-btn-no, #unsave-poi-prompt .overlay-btn-close').click(function () {
        $.unblockUI();
        return false;
    });
    // POI overlay unsave prompt
    $('#unsave-poi-mask-prompt .overlay-btn-yes').click(function () {
        $('body').removeClass('has-poi-change');
        $.unblockUI();
        $('#unsave-poi-mask-prompt').hide();
        $('#poi-event-overlay .wrap').html('');
        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
        return false;
    });
    $('#unsave-poi-mask-prompt .overlay-btn-no, #unsave-poi-mask-prompt .overlay-btn-close').click(function () {
        $('body').addClass('from-poi-overlay-edit-mode');
        $('#unsave-poi-mask-prompt').hide();
        $('#poi-event-overlay').show();
        return false;
    });

    // storyboard sortable
    $('#storyboard-listing').sortable({
        cursor: 'move',
        revert: true,
        tolerance: 'pointer',
        change: function (event, ui) {
            $('body').addClass('has-change');
        },
        update: function (event, ui) {
            $('#storyboard-listing li').removeClass('last last2');
            $('#storyboard-listing li').eq(48).addClass('last2');
            $('#storyboard-listing li').eq(49).addClass('last');
        }
    });

    // main tabs - Common
    $('#epcurate-curation ul.tabs li a:not(.cur-edit-poi)').click(function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            $common.showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-poi-change')) {
            $common.showUnsavePoiOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            $common.showUnsaveTitleCardOverlay(e);
            return false;
        }
        var showBlock = $(this).attr('href').split('#');
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $(this).parent().parent().addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#' + showBlock[1]).removeClass('hide');
        return false;
    });
    // main tabs - Add Video
    $('#epcurate-curation ul.tabs li a.cur-add').click(function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            $common.showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-poi-change')) {
            $common.showUnsavePoiOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            $common.showUnsaveTitleCardOverlay(e);
            return false;
        }
        $page.cancelTitleCard();
        $page.removeVideoPlayingHook();
        $page.removeTrimTimeEditHook();
        $page.removeTitleCardPlayingHook();
        $page.removeTitleCardEditHook();
        $('#epcurate-curation .tabs li').addClass('hide');
        $(this).parent().parent().removeClass('hide').addClass('last');
        $('#video-player .video').html('');
        $('#video-control').hide();
        $page.unblockPoiUI();
    });
    // main tabs - Edit Video
    $('#epcurate-curation ul.tabs li a.cur-edit').click(function (e) {
        if ($('body').hasClass('has-poi-change')) {
            $common.showUnsavePoiOverlay(e);
            return false;
        }
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#epcurate-curation ul.tabs li.poi').addClass('last');
        $('#epcurate-curation ul.tabs li.edit-poi').addClass('hide');
        $('#epcurate-curation ul.tabs li.edit-video').addClass('on');
        $page.unblockPoiUI();
        if ($('#youTubePlayer').length <= 0 || $('html').hasClass('youtube-chromeless')) {
            $page.loadYouTubeFlash($('#storyboard-listing li.playing').data('ytid'));
        }
    });
    // main tabs - POI list
    $('#epcurate-curation ul.tabs li a.cur-poi').click(function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            $common.showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-poi-change')) {
            $common.showUnsavePoiOverlay(e);
            return false;
        }
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-poi').removeClass('hide');
        $('#epcurate-curation ul.tabs li.poi').addClass('last on');
        $('#epcurate-curation ul.tabs li.edit-poi').addClass('hide');
        $('#epcurate-curation ul.tabs li.edit-video').removeClass('on');
        $page.unblockPoiUI();
        if ($('#youTubePlayer').length <= 0 || $('html').hasClass('youtube-chromeless')) {
            $page.loadYouTubeFlash($('#storyboard-listing li.playing').data('ytid'));
        }
        // NOTE: ON PURPOSE to truncate correctly after remove hide class
        $('.ellipsis').ellipsis();
    });
    $('#epcurate-curation ul.tabs li a.cur-edit-poi').click(function (e) {
        return false;
    });

    // Add Video
    $('#cur-add textarea').click(function () {
        $('#cur-add .notice').addClass('hide').hide();
    });
    $('#btn-add-videourl').click(function () {
        $('#cur-add .notice').addClass('hide').hide();
        var videoUrl = $.trim($('#videourl').val()),
            urlList = videoUrl.split('\n'),
            patternLong = /^http(?:s)?:\/\/www.youtube.com\/watch\?/,
            patternShort = /^http(?:s)?:\/\/youtu.be\//,
            matchKey = '',
            matchList = [],
            normalList = [],
            existList = [],
            invalidList = [],
            privateVideoList = [],
            embedLimitedList = [],
            ytData = null,
            ytItem = {},
            ytList = [],
            committedCnt = 0,
            videoNumberBase = $('#storyboard-list li').length,
            isPrivateVideo = null,
            isZoneLimited = null,
            hasSyndicateDenied = null,
            hasLimitedSyndication = null,
            isSyndicateLimited = null,
            isEmbedLimited = null,
            isUnplayableVideo = null;
        if ('' === videoUrl || nn._([cms.global.PAGE_ID, 'add-video', 'Paste YouTube video URLs to add (separate with different lines)']) === videoUrl) {
            $('#videourl').get(0).focus();
            $('#cur-add .notice').text(nn._([cms.global.PAGE_ID, 'add-video', 'Paste YouTube video URLs to add.'])).removeClass('hide').show();
            return false;
        }
        $('#storyboard-list li').each(function () {
            existList.push($(this).data('ytid'));
        });
        $.each(urlList, function (i, url) {
            url = $.trim(url);
            if ('' !== url) {
                if (patternLong.test(url)) {
                    matchKey = $.url(url).param('v');
                } else if (patternShort.test(url)) {
                    matchKey = $.url(url).segment(1);
                } else {
                    matchKey = '';
                }
                if (!matchKey || matchKey.length !== 11) {
                    matchKey = '';
                    invalidList.push(url);
                }
                if ('' !== matchKey) {
                    matchList.push(matchKey);
                }
            }
        });
        if (matchList.length > 0) {
            normalList = $.map(matchList, function (k, i) {
                return 'http://www.youtube.com/watch?v=' + k;
            });
            if ((existList.length + matchList.length) > cms.config.PROGRAM_MAX) {
                $('#videourl').val(normalList.join('\n'));
                $('#cur-add .notice').text(nn._([cms.global.PAGE_ID, 'add-video', 'You have reached the maximum amount of 50 videos.'])).removeClass('hide').show();
                return false;
            }
            $('body').addClass('has-change');
            $common.showProcessingOverlay();
            $.each(matchList, function (idx, key) {
                nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + key + '?alt=jsonc&v=2&callback=?', null, function (youtubes) {
                    committedCnt += 1;

                    var checkResult = cms.youtubeUtility.checkVideoValidity(youtubes);

                    if (true === checkResult.isEmbedLimited) {
                        embedLimitedList.push(normalList[idx]);
                    }
                    if (youtubes.data && false === checkResult.isEmbedLimited && checkResult.isProcessing === false) {
                        ytData = youtubes.data;
                        ytItem = {
                            poiList: [],
                            beginTitleCard: null,
                            endTitleCard: null,
                            id: 0,                          // fake program.id for rebuild identifiable url #!pid={program.id}&ytid={youtubeId}&tid={titlecardId}
                            ytId: ytData.id,
                            fileUrl: normalList[idx],
                            imageUrl: 'http://i.ytimg.com/vi/' + ytData.id + '/mqdefault.jpg',
                            duration: ytData.duration,      // keep trimmed duration from 9x9 API
                            ytDuration: ytData.duration,    // keep original duration from YouTube
                            startTime: 0,
                            endTime: ytData.duration,
                            name: ytData.title,
                            intro: ytData.description,
                            uploader: ytData.uploader,
                            uploadDate: ytData.uploaded
                        };
                        ytItem = $.extend(ytItem, checkResult);
                        ytList[idx] = ytItem;
                    } else {
                        if (youtubes.error) {
                            nn.log(youtubes.error, 'warning');
                            if (youtubes.error.code && 403 === youtubes.error.code) {
                                privateVideoList.push(normalList[idx]);
                            }
                        }
                        nn.log(normalList[idx], 'debug');
                        invalidList.push(normalList[idx]);
                        $('#videourl').val(invalidList.join('\n'));
                        if (true === checkResult.isEmbedLimited && 0 === privateVideoList.length && invalidList.length === embedLimitedList.length) {
                            $('#cur-add .notice').html(nn._([cms.global.PAGE_ID, 'add-video', 'Fail to add this video, please try another one.<br />[This video is not playable outside Youtube]'])).removeClass('hide').show();
                        } else if (true === checkResult.isPrivateVideo && 0 === embedLimitedList.length && invalidList.length === privateVideoList.length) {
                            $('#cur-add .notice').html(nn._([cms.global.PAGE_ID, 'add-video', 'Fail to add this video, please try another one.<br />[This is a private video]'])).removeClass('hide').show();
                        } else if (checkResult.isUnplayableVideo === true || checkResult.isProcessing === true) {
                            $('#cur-add .notice').html(nn._([cms.global.PAGE_ID, 'add-video', 'Unplayable video, please try again!'])).removeClass('hide').show();
                        } else {
                            $('#cur-add .notice').text(nn._([cms.global.PAGE_ID, 'add-video', 'Invalid URL, please try again!'])).removeClass('hide').show();
                        }
                    }
                    if (committedCnt === matchList.length) {
                        committedCnt = -1;   // reset to avoid collision
                        $page.animateStoryboard(ytList.length);
                        $('#storyboard-listing-tmpl-item').tmpl(ytList).hide().appendTo('#storyboard-listing').fadeIn(2000);
                        $page.sumStoryboardInfo();
                        $page.rebuildVideoNumber(videoNumberBase);
                        $('.ellipsis').ellipsis();
                        $('#overlay-s').fadeOut();
                    }
                }, 'jsonp');
            });
        }
        $('#videourl').val('');
        if (invalidList.length > 0) {
            $('#videourl').val(invalidList.join('\n'));
            $('#cur-add .notice').text(nn._([cms.global.PAGE_ID, 'add-video', 'Invalid URL, please try again.'])).removeClass('hide').show();
        }
        return false;
    });

    $('#cur-add .checkbox a').click(function () {
        $(this).toggleClass('on');
    });

    // video play
    $('#storyboard').on('click', '.storyboard-list ul li .hover-func a.video-play', function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            $common.showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            $common.showUnsaveTitleCardOverlay(e);
            return false;
        }
        $page.cancelTitleCard();
        $page.removeVideoPlayingHook();
        $page.removeTrimTimeEditHook();
        $page.disableTrimTimeEdit();
        $page.removeTitleCardPlayingHook();
        $page.removeTitleCardEditHook();

        // switch tab and content
        if ($('#epcurate-curation > .curation-content > ul.tabs > li.poi').hasClass('hide')) {
            $('#epcurate-curation ul.tabs li').removeClass('on');
            $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
            $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide last').addClass('on');
            $('#epcurate-curation ul.tabs li a.cur-poi').parent().parent().removeClass('hide');
            $('#epcurate-curation .tab-content').addClass('hide');
            $('#cur-edit').removeClass('hide');
            $('#cur-edit .edit-time').removeClass('hide');
            $('#cur-edit .edit-title').addClass('hide');
            $('#video-control').show();
            $('#btn-play').addClass('hide');
            $('#btn-pause').addClass('hide');
        }

        // video-info-tmpl (play action)
        var elemtli = $(this).parent().parent();
        $page.playTitleCardAndVideo(elemtli);

        return false;
    });

    // video del
    // if video have programId to keep DELETE programIds list
    $('#storyboard-list').on('click', 'li .hover-func a.video-del', function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            $common.showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            $common.showUnsaveTitleCardOverlay(e);
            return false;
        }
        $('body').addClass('has-change');
        $page.cancelTitleCard();
        //$page.removeVideoPlayingHook();   // ON PURPOSE to keep video playing hook in order to switch video-info automatically
        $page.removeTrimTimeEditHook();
        $page.removeTitleCardPlayingHook();
        $page.removeTitleCardEditHook();
        var length = $('#storyboard-list li').length,
            eq = $('#storyboard-list li.playing').index(),
            deleting = $(this).parent().parent(),
            tmplItemData = deleting.tmplItem().data,
            elemtli = null;
        if (deleting.hasClass('playing') && (length - eq - 1) > 0) {
            // video-info-tmpl (auto turn by del)
            elemtli = deleting.next('li');
            $page.playTitleCardAndVideo(elemtli);
            if (tmplItemData.id && tmplItemData.id > 0) {
                videoDeleteIdList.push(tmplItemData.id);
            }
            deleting.remove();
        } else {
            if (length > 1) {
                if (deleting.hasClass('playing') && (length - eq - 1) === 0) {
                    // video-info-tmpl (auto turn by del)
                    // return to first video
                    elemtli = $('#storyboard-list li:first');
                    $page.playTitleCardAndVideo(elemtli);
                }
                if (tmplItemData.id && tmplItemData.id > 0) {
                    videoDeleteIdList.push(tmplItemData.id);
                }
                deleting.remove();
            } else {
                $common.showSystemErrorOverlay('There must be at least one video in this episode.');
            }
        }
        nn.log({
            length: length,
            eq: eq,
            videoDeleteIdList: videoDeleteIdList
        }, 'debug');
        $page.sumStoryboardInfo();
        return false;
    });

    // Trim time - common
    $('#cur-edit').on('click change', '.set-time input.time', function () {
        $('body').addClass('has-trimtime-change');
        $('body').addClass('has-change');
        $('#cur-edit .edit-time .btn-wrap .notice').hide();
        return false;
    });

    // Trim time - Edit button
    $('#cur-edit').on('click', '.edit-time .btn-wrap .btn-edit', function () {
        if ($('#storyboard-list li.playing .title a.playing').length > 0) {
            $('body').addClass('from-trim-time-edit');
            $page.cancelTitleCard();
            $page.removeTitleCardPlayingHook();
            $page.loadYouTubeFlash($('#storyboard-listing li.playing').data('ytid'));
        } else if (cms.global.YOUTUBE_PLAYER !== undefined && cms.global.YOUTUBE_PLAYER !== null && 'object' === $.type(cms.global.YOUTUBE_PLAYER) && 'function' === $.type(cms.global.YOUTUBE_PLAYER.loadVideoById)) {
            //cms.global.YOUTUBE_PLAYER.seekTo(0, true);
            cms.global.YOUTUBE_PLAYER.pauseVideo();
        }
        $page.addTrimTimeEditHook();
        $page.enableTrimTimeEdit();
        return false;
    });

    // Trim time - Done button
    $('#cur-edit').on('click', '.edit-time .btn-wrap .btn-done', function () {
        var trimTime = $page.chkDuration(),
            trimDuration = [],
            itemData = null;
        if ($.isArray(trimTime) && 2 === trimTime.length) {
            $('body').addClass('has-change');
            $('body').removeClass('has-trimtime-change');
            $page.disableTrimTimeEdit();
            $('.start-time input.time, .end-time input.time').each(function () {
                $(this).parent().data('time', $(this).val());
            });
            // update trimmed duration
            trimDuration = $common.formatDuration((trimTime[1] - trimTime[0]), true).split(':');
            $('#totalH').val(trimDuration[0]);
            $('#totalM').val(trimDuration[1]);
            $('#totalS').val(trimDuration[2]);
            if (cms.global.YOUTUBE_PLAYER !== undefined && cms.global.YOUTUBE_PLAYER !== null && 'object' === $.type(cms.global.YOUTUBE_PLAYER) && 'function' === $.type(cms.global.YOUTUBE_PLAYER.loadVideoById)) {
                cms.global.YOUTUBE_PLAYER.loadVideoById({
                    'videoId': $('#storyboard-listing li.trim-time').data('ytid'),
                    'startSeconds': trimTime[0],
                    'endSeconds': (trimTime[1] === $('#storyboard-listing li.playing').data('ytduration')) ? 0 : trimTime[1]
                });
            }
            // update DOM
            $('#storyboard-listing li.trim-time').data('starttime', trimTime[0]);
            $('#storyboard-listing li.trim-time').data('endtime', trimTime[1]);
            itemData = $('#storyboard-listing li.trim-time').tmplItem().data;
            itemData.startTime = trimTime[0];
            itemData.endTime = trimTime[1];
            itemData.duration = trimTime[1] - trimTime[0];
            $('#storyboard-listing li.trim-time .img .time .time-middle').text($common.formatDuration(trimTime[1] - trimTime[0]));
            $page.sumStoryboardInfo();
            $page.removeTrimTimeEditHook();
            $page.buildVideoInfoTmpl($('#storyboard-listing li.playing'));
        }
        return false;
    });

    // Trim time - Cancel button
    $('#cur-edit').on('click', '.edit-time .btn-wrap .btn-cancel', function () {
        $('body').removeClass('has-trimtime-change');
        $page.removeTrimTimeEditHook();
        $page.disableTrimTimeEdit();
        $('.start-time input.time, .end-time input.time').each(function () {
            $(this).val($(this).parent().data('time'));
        });
        return false;
    });

    // Title Card - Edit/Preview Title (exist) => #storyboard-list li.edit p.title a.edit
    $('#storyboard-listing').on('click', 'li p.title .begin-title, li p.title .end-title', function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            $common.showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            $common.showUnsaveTitleCardOverlay(e);
            return false;
        }
        $page.cancelTitleCard();
        $page.removeVideoPlayingHook();
        $page.removeTrimTimeEditHook();
        $page.removeTitleCardPlayingHook();
        $page.removeTitleCardEditHook();
        $page.addTitleCardEditHook($(this));

        // switch tab and content
        $page.removePoiTab();
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on last');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#cur-edit .edit-time').addClass('hide');
        $('#cur-edit .edit-title').removeClass('hide');
        $('#cur-edit .edit-title').removeClass('disable');
        $('#video-control').show();
        $('#btn-play').addClass('hide');
        $('#btn-pause').removeClass('hide');

        var index = $(this).parent().parent().index(),
            hook = ($(this).hasClass('begin-title')) ? 'beginTitleCard' : 'endTitleCard',
            opts = $('#storyboard-list li:eq(' + index + ')').tmplItem().data[hook],
            isUpdateMode = true,
            isDisableEdit = false;
        if (opts && opts.message) {
            $page.buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
            $page.enableTitleCardEdit();

            $page.buildTitleCardTmpl(opts);
            $('#cur-edit .edit-title .btn-cancel').data('opts', opts);
            $('#btn-play').trigger('click');
        }
        return false;
    });

    // Title Card - Add Title (none) => #storyboard-list li.edit p.hover-func a.edit
    $('#storyboard-listing').on('click', 'li p.hover-func a.begin-title, li p.hover-func a.end-title', function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            $common.showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            $common.showUnsaveTitleCardOverlay(e);
            return false;
        }
        $page.cancelTitleCard();
        $page.removeVideoPlayingHook();
        $page.removeTrimTimeEditHook();
        $page.removeTitleCardPlayingHook();
        $page.removeTitleCardEditHook();
        $page.addTitleCardEditHook($(this));

        // switch tab and content
        $page.removePoiTab();
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on last');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#cur-edit .edit-time').addClass('hide');
        $('#cur-edit .edit-title').removeClass('hide');
        $('#cur-edit .edit-title').removeClass('disable');
        $('#video-control').show();
        $('#btn-play').removeClass('hide');
        $('#btn-pause').addClass('hide');

        var isUpdateMode = false,
            isDisableEdit = false;
        $page.buildTitleCardEditTmpl(cms.config.TITLECARD_DEFAULT_OPTION, isUpdateMode, isDisableEdit);
        $page.enableTitleCardEdit();

        $page.buildTitleCardTmpl(cms.config.TITLECARD_DEFAULT_OPTION);
        $('#cur-edit .edit-title .btn-cancel').data('opts', cms.config.TITLECARD_DEFAULT_OPTION);
        return false;
    });

    // Title Card - Play Title Card
    $('#btn-play').click(function () {
        $page.cancelTitleCard();
        var opts = null,
            isVideoPlayingMode = ($('#storyboard-list li.playing').length > 0) ? true : false,
            isTitleCardEnableEditMode = (!$('.edit-title').hasClass('disable')) ? true : false;
        if (isVideoPlayingMode) {
            if ($('#storyboard-list li.playing .title a.playing').hasClass('begin-title')) {
                $('#storyboard-list li.playing .hover-func .video-play').trigger('click');
            } else {
                opts = $('#storyboard-list li.playing').tmplItem().data.endTitleCard;
                $page.wrapTitleCardCanvas();
                $('#video-player .video .canvas').titlecard($page.adaptTitleCardOption(opts), function () {
                    if ($('#storyboard-list li.next-playing').length <= 0) {
                        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                    } else {
                        $('#storyboard-list li.next-playing .hover-func .video-play').trigger('click');
                    }
                });
                $page.animateTitleCardProgress(opts);
            }
        } else {
            if (isTitleCardEnableEditMode) {
                opts = $page.computeTitleCardEditOption();
            } else {
                opts = $('#titlecard-outer').tmplItem().data;
            }
            $page.wrapTitleCardCanvas();
            $('#video-player .video .canvas').titlecard($page.adaptTitleCardOption(opts), function () {
                $page.buildTitleCardTmpl(opts);
                $('#btn-play').removeClass('hide');
                $('#btn-pause').addClass('hide');
            });
            $page.animateTitleCardProgress(opts);
        }
    });

    // Title Card - Stop Title Card
    $('#btn-pause').click(function () {
        $page.cancelTitleCard();
        var opts = null,
            isVideoPlayingMode = ($('#storyboard-list li.playing').length > 0) ? true : false;
        if (isVideoPlayingMode) {
            if ($('#storyboard-list li.playing .title a.playing').hasClass('begin-title')) {
                opts = $('#storyboard-list li.playing').tmplItem().data.beginTitleCard;
            } else {
                opts = $('#storyboard-list li.playing').tmplItem().data.endTitleCard;
            }
        } else {
            opts = $page.computeTitleCardEditOption();
        }
        if (opts && opts.message) {
            $page.buildTitleCardTmpl(opts);
        }
    });

    // Title Card - Edit Title button - enter titlecard edit mode
    $('#cur-edit').on('click', '.edit-title .btn-edit', function () {
        var opts = $('#cur-edit .edit-title .btn-cancel').data('opts'),
            isUpdateMode = ($('#storyboard-list li.edit p.title a.edit').length > 0) ? true : false,
            isDisableEdit = false;
        $page.buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
        $page.enableTitleCardEdit();

        $page.cancelTitleCard();
        $page.buildTitleCardTmpl(opts);
        $('#cur-edit .edit-title .btn-cancel').data('opts', opts);
        return false;
    });

    // Title Card - Cancel button - leave titlecard edit mode
    $('#cur-edit').on('click', '.edit-title .btn-cancel', function () {
        // restore titlecard
        var opts = $('#cur-edit .edit-title .btn-cancel').data('opts'),
            isUpdateMode = ($('#storyboard-list li.edit p.title a.edit').length > 0) ? true : false,
            isDisableEdit = true;
        $page.buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
        $page.disableTitleCardEdit();

        $page.cancelTitleCard();
        $page.buildTitleCardTmpl(opts);
        $('#cur-edit .edit-title .btn-cancel').data('opts', opts);
        $('body').removeClass('has-titlecard-change');
        return false;
    });

    // Title Card - Done button - finish titlecard edit
    $('#cur-edit').on('click', '.edit-title .btn-done', function (e) {
        var message = $common.strip_tags($.trim($('#text').val())),
            isInsertMode = null,
            hook = '',
            tmplItem = null,
            itemData = null,
            opts = null,
            isUpdateMode = true,
            isDisableEdit = true;
        if ('' === message) {
            $common.showSystemErrorOverlay("Title text can't be empty!");
            return false;
        }
        isInsertMode = ($('#storyboard-list li.edit p.hover-func a.edit').length > 0) ? true : false;
        if (isInsertMode) {
            hook = ($('#storyboard-list li.edit p.hover-func a.edit').hasClass('begin-title')) ? 'beginTitleCard' : 'endTitleCard';
            if ($('#storyboard-listing li.edit .hover-func a.edit').hasClass('begin-title')) {
                $('#storyboard-listing li.edit .title').append('<a href="#" class="begin-title edit">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">' + nn._([cms.global.PAGE_ID, 'episode-storyboard', 'Edit Title']) + '</span></span></span></span></a>');
            } else {
                $('#storyboard-listing li.edit .title').append('<a href="#" class="end-title edit">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">' + nn._([cms.global.PAGE_ID, 'episode-storyboard', 'Edit Title']) + '</span></span></span></span></a>');
            }
            $('#storyboard-listing li.edit .hover-func a.edit').remove();
        } else {
            hook = ($('#storyboard-list li.edit p.title a.edit').hasClass('begin-title')) ? 'beginTitleCard' : 'endTitleCard';
        }

        // save to li DOM and update cancel data
        tmplItem = $('#storyboard-listing li.edit').tmplItem();
        itemData = tmplItem.data;
        if (null === itemData[hook]) {
            itemData[hook] = {};
        }
        itemData[hook].message = message;
        itemData[hook].align = $('#cur-edit .edit-title input[name=align]:checked').val();
        itemData[hook].effect = $('#effect').val();
        itemData[hook].duration = $('#duration').val();
        itemData[hook].size = $('#fontSize').val();
        itemData[hook].color = $('#fontColor').val();
        itemData[hook].style = ($('#cur-edit .edit-title input[name=fontStyle]:checked').length > 0) ? 'italic' : 'normal';
        itemData[hook].weight = ($('#cur-edit .edit-title input[name=fontWeight]:checked').length > 0) ? 'bold' : 'normal';
        itemData[hook].bgColor = $('#backgroundColor').val();
        itemData[hook].bgImage = ('image' === $('#cur-edit .edit-title input[name=bg]:checked').val() && '' !== $('#backgroundImage').val()) ? $('#backgroundImage').val() : '';
        // ON PURPOSE to mark update() to avoid lose edit hook
        //tmplItem.update();

        // and save to video DOM for titlecard play button
        $page.cancelTitleCard();
        opts = itemData[hook];
        $page.buildTitleCardTmpl(opts);
        $page.buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
        $page.disableTitleCardEdit();
        $('#cur-edit .edit-title .btn-cancel').data('opts', opts);

        $('body').addClass('has-change');
        $('body').removeClass('has-titlecard-change');
        $page.sumStoryboardInfo();
        // implement Done == Save?
        //$('#form-btn-save').trigger('click');
        return false;
    });

    // Title Card - Delete icon - titlecard
    $('#cur-edit').on('click', '.edit-title .btn-del', function () {
        $('#btn-pause').trigger('click');
        $common.showDeletePromptOverlay('Are you sure you want to delete this title?');
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#storyboard-list li.edit p.title a.edit').length > 0) {
            $common.showSavingOverlay();
            var deleteId = 0,
                tmplItem = $('#storyboard-listing li.edit').tmplItem(),
                itemData = tmplItem.data;
            if ($('#storyboard-listing li.edit .title a.edit').hasClass('begin-title')) {
                if (itemData.beginTitleCard.id && itemData.beginTitleCard.id > 0) {
                    deleteId = itemData.beginTitleCard.id;
                }
                itemData.beginTitleCard = null;
                tmplItem.update();
                $('#storyboard-listing li.edit .hover-func').append('<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">' + nn._([cms.global.PAGE_ID, 'episode-storyboard', 'Add Title']) + '</span></span></span></span></a>');
            } else {
                if (itemData.endTitleCard.id && itemData.endTitleCard.id > 0) {
                    deleteId = itemData.endTitleCard.id;
                }
                itemData.endTitleCard = null;
                tmplItem.update();
                $('#storyboard-listing li.edit .hover-func').append('<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">' + nn._([cms.global.PAGE_ID, 'episode-storyboard', 'Add Title']) + '</span></span></span></span></a>');
            }
            $('#storyboard-listing li .title a.edit').remove();

            // switch tab and content
            $page.removeTitleCardEditHook();
            $('#epcurate-curation .tabs li').addClass('hide');
            $('#epcurate-curation .tabs li.first').removeClass('hide').addClass('last').addClass('on');
            $('#cur-edit').addClass('hide');
            $('#cur-add').removeClass('hide');
            $('#video-player .video').html('');
            $('#video-control').hide();

            if (deleteId > 0) {
                nn.api('DELETE', cms.reapi('/api/title_card/{titlecardId}', {
                    titlecardId: deleteId
                }), null, function (data) {
                    $('#overlay-s').fadeOut(0);
                });
            } else {
                $('#overlay-s').fadeOut(0);
            }
            $('body').removeClass('has-titlecard-change');
            $page.sumStoryboardInfo();
        }
        return false;
    });

    // Title Card - Setting UI - common
    $('#cur-edit').on('change', '.text-container, .font-container, .effect-container, .background-container, .duration-container', function () {
        $('#btn-pause').trigger('click');
    });

    // Title Card - Setting UI - Text
    $('#cur-edit').on('click change', '.text-container textarea', function () {
        $('body').addClass('has-titlecard-change');
        var text = $common.strip_tags($.trim($(this).val()));
        $(this).val(text);
        $('#titlecard-inner').html($common.nl2br(text));
        $page.verticalAlignTitleCard();
    });

    // Title Card - Setting UI - Font (bold, italic, radix/size, align)
    $('#cur-edit').on('click', '#fontWeight', function () {
        $('body').addClass('has-titlecard-change');
        var weight = $(this).prop('checked') ? 'bold' : 'normal';
        $('#titlecard-inner').css('font-weight', weight);
    });
    $('#cur-edit').on('click', '#fontStyle', function () {
        $('body').addClass('has-titlecard-change');
        var style = $(this).prop('checked') ? 'italic' : 'normal';
        $('#titlecard-inner').css('font-style', style);
    });
    $page.switchFontRadix($('#fontSize').val());
    $('#cur-edit').on('click', '.font-container .font-l.enable', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        $page.setupFontRadix('up');
        return false;
    });
    $('#cur-edit').on('click', '.font-container .font-s.enable', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        $page.setupFontRadix('down');
        return false;
    });
    $page.switchFontAlign($('#cur-edit .edit-title input[name=align]:checked').val());
    $('#cur-edit').on('click', '.edit-title input[name=align]', function () {
        $('body').addClass('has-titlecard-change');
        $page.switchFontAlign($(this).val());
    });

    // Title Card - Setting UI - edit select dropdown (Effect, Duration)
    $('#cur-edit').on('click', '.enable .select-btn, .enable .select-txt', function () {
        $('.select-list').hide();
        var parent = $(this).parent();
        parent.siblings().children('.on').removeClass('on');
        parent.children('.select-btn').toggleClass('on');
        if (parent.children('.select-btn').hasClass('on')) {
            parent.children('.select-list').slideDown();
        } else {
            parent.children('.select-list').hide();
        }
        return false;
    });
    $('#cur-edit').on('click', '.select .select-list li', function () {
        var selectOption = $(this).text(),
            parent = $(this).parent();
        parent.parent().children('.select-btn').removeClass('on');
        parent.parent().children('.select-txt').children().text(selectOption);
        parent.hide();
        parent.next('input').val($(this).data('meta'));
        return false;
    });
    $('#cur-edit').on('click', '.edit-title .effect-container .select-list li', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        var element = $('#epcurate-curation #cur-edit .effect-container p.effect-demo'),
            effect = $(this).data('meta');
        $page.previewEffect(element, effect);
        $('#effect').val(effect);
        return false;
    });
    $('#cur-edit').on('click', '.effect-container p.effect-demo', function () {
        var element = $(this),
            effect = $('#effect').val();
        $page.previewEffect(element, effect);
        return false;
    });
    $('#cur-edit').on('click', '.edit-title .duration-container .select-list li', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        var selectedDuration = $(this).data('meta');
        $('#duration').val(selectedDuration);
        return false;
    });

    // Title Card - Setting UI - background switch (color or image)
    $page.switchBackground($('#cur-edit .edit-title input[name=bg]:checked').val(), $('#cur-edit .edit-title input[name=bg]:checked').attr('name'));
    $('#cur-edit').on('click', '.edit-title input[name=bg]', function () {
        $('body').addClass('has-titlecard-change');
        $page.switchBackground($(this).val(), $(this).attr('name'));
    });

    // Title Card - Setting UI - color picker (font color, background color)
    $('#cur-edit').on('click', '.edit-title .color-list li', function () {
        var colorCode = $(this).attr('class'),
            parent = $(this).parent();
        parent.prev('span').attr('class', 'color ' + colorCode);
        parent.parent().next('input').val($(this).data('meta'));
        return false;
    });
    $('#cur-edit').on('click', '.edit-title .background-container .color-list li', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        var colorCode = $(this).attr('class'),
            selectedBg = $(this).data('meta');
        $('#titlecard-outer').attr('class', colorCode);
        $('#backgroundColor').val(selectedBg);
        return false;
    });
    $('#cur-edit').on('click', '.edit-title .font-container .color-list li', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        var colorCode = $(this).attr('class'),
            selectedColor = $(this).data('meta');
        $('#titlecard-inner').attr('class', colorCode);
        $('#fontColor').val(selectedColor);
        return false;
    });

    // Delete POI
    $('#cur-poi').on('click', '#poi-list-page .btn-del', function () {
        $(this).parent().parent('li').addClass('deleting').data('deleteId', $(this).data('poiPointId'));
        $common.showDeletePoiPromptOverlay('Are you sure you want to delete this POI with interactive event?');
        return false;
    });
    $('#del-poi-notice .btn-del').click(function () {
        $.unblockUI();
        var poiPointId = $('#poi-list-page ol li.deleting').data('deleteId'),
            tmplItem = $('#storyboard-listing li.playing').tmplItem(),
            tmplItemData = tmplItem.data,
            poiList = tmplItemData.poiList,
            poiTemp = [];
        if ($('#poi-list-page ol li.deleting').length > 0 && poiPointId) {
            $common.showSavingOverlay();
            if (poiPointId > 0 && !isNaN(poiPointId)) {
                nn.api('DELETE', cms.reapi('/api/poi_points/{poiPointId}', {
                    poiPointId: poiPointId
                }), null, function (data) {
                    $('#overlay-s').fadeOut(0);
                });
            } else {
                $('#overlay-s').fadeOut(0);
            }
            $.each(poiList, function (i, poiItem) {
                if (poiItem.id === poiPointId) {
                    // NOTE: Returning non-false is the same as a continue statement in a for loop
                    return true;
                }
                poiTemp.push(poiItem);
            });
            tmplItemData.poiList = poiTemp;
            $page.buildPoiInfoTmpl($('#storyboard-listing li.playing'));
            $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
        }
        return false;
    });
    $('#del-poi-notice .btn-close, #del-poi-notice .btn-no').click(function () {
        $.unblockUI();
        $('#poi-list-page ol li').removeClass('deleting').removeData('deleteId');
        return false;
    });

    // Enter POI tab from POI list (Add or Edit button)
    $('#cur-poi').on('click', '.btn-add-poi a, .poi-list a.edit', function () {
        $('body').addClass('from-poi-edit-mode enter-poi-edit-mode');
        $page.loadYouTubeFlash($('#storyboard-listing li.playing').data('ytid'));
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-poi-edit').removeClass('hide edit');
        $('#epcurate-curation ul.tabs li.poi').removeClass('last on');
        $('#epcurate-curation ul.tabs li.edit-poi').removeClass('hide');
        $('#epcurate-curation ul.tabs li.edit-poi').addClass('on');
        $('#storyboard, #content-main-wrap .form-btn, #epcurate-nav ul li.publish').block({
            message: null
        });
        $('#epcurate-nav ul li.publish').addClass('mask');
        $('#cur-poi-edit .edit-form').removeClass('hide');
        $('#cur-poi-edit .edit-form .notice').addClass('hide');
        return false;
    });
    // POI Add button
    $('#cur-poi').on('click', '.btn-add-poi a', function () {
        $page.buildPoiPointEditTmpl();
        $('#cur-poi-edit').removeClass('edit');
        return false;
    });
    // POI Edit button
    $('#cur-poi').on('click', '.poi-list a.edit', function () {
        var poiPointId = $(this).data('poiPointId'),
            poiList = $('#storyboard-listing li.playing').tmplItem().data.poiList;
        if (poiPointId) {
            // enter edit mode
            $.each(poiList, function (i, poiItem) {
                if (poiItem.id === poiPointId) {
                    $page.buildPoiPointEditTmpl(poiItem);
                    // NOTE: return false here is break the $.each() loop
                    return false;
                }
            });
            $('#cur-poi-edit').addClass('edit');
        }
        return false;
    });

    // POI click notice reset
    $('#cur-poi-edit').on('click', '.edit-form input, .btn-reset', function () {
        $('#cur-poi-edit .edit-form .notice').addClass('hide');
    });
    // POI overlay notice reset
    $('#poi-event-overlay').on('click', 'input[type=text], textarea', function () {
        $('#poi-event-overlay .event .event-input .fminput .notice').hide();
        $('#poi-event-overlay .event .func ul li.notice').hide();
    });
    // POI hook has change
    $('#cur-poi-edit').on('change', '.edit-form input', function () {
        $('body').addClass('has-poi-change');
    });
    // POI overlay hook has change
    $('#poi-event-overlay').on('change', 'input[type=text], textarea', function () {
        $('body').addClass('has-poi-change');
        $('body').addClass('has-change');
    });

    // POI duration blur
    $('#cur-poi-edit').on('blur', '#poi-edit input.time', function () {
        if ('' === $.trim($(this).val())) {
            $(this).val('00');
        }
        return false;
    });

    // Reset POI duration
    $('#cur-poi-edit').on('click', '.btn-reset', function () {
        $('body').addClass('has-poi-change');
        var startTime = $common.formatDuration($('#storyboard-listing li.playing').data('starttime'), true).split(':'),
            endTime = $common.formatDuration($('#storyboard-listing li.playing').data('endtime'), true).split(':'),
            startH = startTime[0],
            startM = startTime[1],
            startS = startTime[2],
            endH = endTime[0],
            endM = endTime[1],
            endS = endTime[2];
        $('#poi-edit .start-time .time-h').val(startH);
        $('#poi-edit .start-time .time-m').val(startM);
        $('#poi-edit .start-time .time-s').val(startS);
        $('#poi-edit .end-time .time-h').val(endH);
        $('#poi-edit .end-time .time-m').val(endM);
        $('#poi-edit .end-time .time-s').val(endS);
        return false;
    });

    // Cancel POI editing
    $('#cur-poi-edit').on('click', '.btn-cancel', function (e) {
        if ($('body').hasClass('has-poi-change')) {
            $common.showUnsavePoiOverlay(e);
            return false;
        }
        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
        return false;
    });
    // POI overlay - cancel and close
    $('#poi-event-overlay').on('click', '.btn-cancel, .overlay-btn-close', function (e) {
        if ($('body').hasClass('has-poi-change')) {
            $common.showUnsavePoiMask(e);
            return false;
        }
        $.unblockUI();
        $('#poi-event-overlay .wrap').html('');
        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
        return false;
    });

    // POI point Next
    $('#cur-poi-edit').on('click', '#poi-edit .btn-next', function () {
        if ($page.chkPoiPointData(document.epcurateForm)) {
            var poiPointId = 0,
                poiEventId = 0,
                hasApiAccessCache = false,
                tmplItem = $('#storyboard-listing li.playing').tmplItem(),
                tmplItemData = tmplItem.data,
                poiList = tmplItemData.poiList,
                poiTemp = [],
                parameter = null,
                poiPointEventData = {},
                poiEventContext = null,
                poiEventData = {},
                poiPointData = {
                    name: $('#poiName').val(),
                    startTime: $('#poiStartTime').val(),
                    endTime: $('#poiEndTime').val(),
                    tag: $('#poiTag').val()
                };
            if ($('#cur-poi-edit').hasClass('edit')) {
                // update mode
                poiPointId = $('#poi-point-edit-wrap').data('poiPointId');
                if (poiPointId) {
                    $common.showProcessingOverlay();
                    if (poiPointId > 0 && !isNaN(poiPointId)) {
                        // real API access phase
                        $.each(poiList, function (i, poiItem) {
                            if (poiItem.id === poiPointId) {
                                if (poiItem.eventId && !isNaN(poiItem.eventId)) {
                                    hasApiAccessCache = true;
                                }
                                $.extend(poiItem, poiPointData);
                                poiPointEventData = poiItem;
                            }
                            poiTemp.push(poiItem);
                        });
                        if (hasApiAccessCache) {
                            nn.api('PUT', cms.reapi('/api/poi_points/{poiPointId}', {
                                poiPointId: poiPointId
                            }), poiPointData, function (poi_point) {
                                $('#overlay-s').fadeOut(0, function () {
                                    tmplItemData.poiList = poiTemp;
                                    $page.buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                                    $page.buildPoiEventOverlayTmpl(poiPointEventData);
                                });
                            });
                        } else {
                            // reset and real API access
                            poiTemp = [];
                            poiPointEventData = {};
                            nn.api('PUT', cms.reapi('/api/poi_points/{poiPointId}', {
                                poiPointId: poiPointId
                            }), poiPointData, function (poi_point) {
                                parameter = {
                                    poiPointId: poiPointId
                                };
                                nn.api('GET', cms.reapi('/api/poi_campaigns/{poiCampaignId}/pois', {
                                    poiCampaignId: cms.global.CAMPAIGN_ID
                                }), parameter, function (pois) {
                                    if (pois && pois.length > 0 && pois[0] && pois[0].eventId && !isNaN(pois[0].eventId)) {
                                        poiEventId = pois[0].eventId;
                                        nn.api('GET', cms.reapi('/api/poi_events/{poiEventId}', {
                                            poiEventId: poiEventId
                                        }), null, function (poi_event) {
                                            poiEventContext = $.parseJSON(poi_event.context);
                                            poiEventData = {
                                                eventId: poi_event.id,
                                                eventType: poi_event.type,
                                                message: poiEventContext.message,
                                                button: poiEventContext.button[0].text,
                                                link: poiEventContext.button[0].actionUrl,
                                                notifyMsg: poi_event.notifyMsg,
                                                notifyScheduler: poi_event.notifyScheduler
                                            };
                                            $('#overlay-s').fadeOut(0, function () {
                                                $.each(poiList, function (i, poiItem) {
                                                    if (poiItem.id === poiPointId) {
                                                        $.extend(poiItem, poiPointData, poiEventData);
                                                        poiPointEventData = poiItem;
                                                    }
                                                    poiTemp.push(poiItem);
                                                });
                                                tmplItemData.poiList = poiTemp;
                                                $page.buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                                                $page.buildPoiEventOverlayTmpl(poiPointEventData);
                                            });
                                        });
                                    } else {
                                        $('#overlay-s').fadeOut(0);
                                        nn.log('Can not fetch POI Event ID!', 'error');
                                    }
                                });
                            });
                        }
                    } else {
                        // fake DOM access phase
                        $('#overlay-s').fadeOut(0, function () {
                            $.each(poiList, function (i, poiItem) {
                                if (poiItem.id === poiPointId) {
                                    $.extend(poiItem, poiPointData);
                                    poiPointEventData = poiItem;
                                }
                                poiTemp.push(poiItem);
                            });
                            tmplItemData.poiList = poiTemp;
                            $page.buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                            $page.buildPoiEventOverlayTmpl(poiPointEventData);
                        });
                    }
                } else {
                    nn.log('Can not fetch POI Point ID!', 'error');
                }
            } else {
                // insert mode
                $page.buildPoiEventOverlayTmpl(poiPointData);
            }
        }
        return false;
    });

    // POI overlay - crumb switch
    $('#poi-event-overlay').on('click', '.event .crumb a', function () {
        // POI overlay notice reset
        $('#poi-event-overlay .event .event-input .fminput .notice').hide();
        $('#poi-event-overlay .event .func ul li.notice').hide();
    });
    // POI overlay - first crumb (close POI overlay)
    $('#poi-event-overlay').on('click', '.unblock', function (e) {
        if ($('#cur-poi-edit').hasClass('edit')) {
            // edit mode back must check and if pass then unblock poi overlay
            var poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey'),
                formId = cms.config.POI_TYPE_MAP[poiEventTypeKey].formId;
            $page.chkPoiEventData(document.forms[formId], function (result) {
                if (!result) {
                    e.stopImmediatePropagation();
                    return false;
                }
                $.unblockUI();
                return false;
            });
            return false;
        }
        // insert mode back no check and unblock poi overlay
        $.unblockUI();
        return false;
    });
    // POI overlay - crumb into event type
    $('#poi-event-overlay').on('click', '.event .crumb a.crumb-event', function () {
        // insert mode back no check and go to event-select (event type)
        var blockClass = $(this).attr('class'),
            block = blockClass.split(' ');
        $('#poi-event-overlay .event, #schedule-mobile, #instant-mobile').addClass('hide');
        $('#' + block[1] + ', #schedule-notify, #instant-notify').removeClass('hide');
        return false;
    });
    // POI overlay - crumb into preview video and POI plugin
    $('#poi-event-overlay').on('click', '#schedule-mobile .crumb .crumb-mobile', function (e) {
        if ($('#cur-poi-edit').hasClass('edit')) {
            // edit mode back must check and if pass then go to preview video and POI plugin
            $page.chkPoiEventData(document.eventScheduledForm, function (result) {
                if (!result) {
                    e.stopImmediatePropagation();
                    return false;
                }
                $('body').addClass('from-poi-overlay-edit-mode');
                $('#event-scheduled .schedule').addClass('hide');
                $('#schedule-notify').removeClass('hide');
                return false;
            });
            return false;
        }
        // insert mode back no check and go to preview video and POI plugin
        $('body').addClass('from-poi-overlay-edit-mode');
        $('#event-scheduled .schedule').addClass('hide');
        $('#schedule-notify').removeClass('hide');
        return false;
    });
    $('#poi-event-overlay').on('click', '#instant-mobile .crumb .crumb-mobile', function (e) {
        if ($('#cur-poi-edit').hasClass('edit')) {
            // edit mode back must check and if pass then go to preview video and POI plugin
            $page.chkPoiEventData(document.eventInstantForm, function (result) {
                if (!result) {
                    e.stopImmediatePropagation();
                    return false;
                }
                $('body').addClass('from-poi-overlay-edit-mode');
                $('#event-instant .instant').addClass('hide');
                $('#instant-notify').removeClass('hide');
                return false;
            });
            return false;
        }
        // insert mode back no check and go to preview video and POI plugin
        $('body').addClass('from-poi-overlay-edit-mode');
        $('#event-instant .instant').addClass('hide');
        $('#instant-notify').removeClass('hide');
        return false;
    });

    // POI overlay - Choose a type
    $('#poi-event-overlay').on('click', '#event-select ul.list li:not(.event-coming-soon)', function () {
        $('body').addClass('has-poi-change');
        $('body').addClass('has-change');
        var type = $(this).attr('class');
        $('#poi-event-overlay .event').addClass('hide');
        $('#' + type).removeClass('hide');
        $page.playPoiEventAndVideo(type);
    });

    // POI overlay - POI plugin realtime edit preview
    $('#poi-event-overlay').on('change keyup keydown', 'input[name=displayText]', function () {
        var val = $common.strip_tags($(this).val().replace(/\n/g, ''));
        $('#poi-event-overlay .event .video-wrap .poi-display').poi('displayText', val);
    });
    $('#poi-event-overlay').on('change keyup keydown', 'input[name=btnText]', function () {
        var val = $common.strip_tags($(this).val().replace(/\n/g, ''));
        $('#poi-event-overlay .event .video-wrap .poi-display').poi('buttonText', val);
    });
    $('#poi-event-overlay').on('blur', 'input[name=displayText]', function () {
        var val = $common.strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
    });
    $('#poi-event-overlay').on('blur', 'input[name=btnText]', function () {
        var val = $common.strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
    });

    // POI overlay - Scheduled Preview Video and POI Plugin Next
    $('#poi-event-overlay').on('click', '#schedule-notify .btn-next, #schedule-notify .crumb.edit .crumb-next', function () {
        $page.chkPoiEventData(document.eventScheduledForm, function (result) {
            if (result) {
                var stampList = [],
                    formatTemp = '',
                    dateTimeList = [],
                    dateList = [],
                    today = new Date(),
                    tomorrow = new Date((new Date()).getTime() + (24 * 60 * 60 * 1000)),
                    hour = 19,
                    min = '00',
                    selected = (today.getHours() > hour) ? tomorrow : today,
                    selectedDate = selected.getFullYear() + '/' + (selected.getMonth() + 1) + '/' + selected.getDate(),
                    selectedTime = hour + ':' + min + ':00',
                    selectedDateTime = selectedDate + ' ' + selectedTime;
                // parse multi schedule timestamp (ready for next step)
                if ('' !== $.trim($('#timestamp_selected').val())) {
                    stampList = $('#timestamp_selected').val().split(',');
                    $.each(stampList, function (i, stampItem) {
                        stampItem = stampItem - 1 + 1;
                        formatTemp = $common.formatTimestamp(stampItem, '/', ':');
                        dateTimeList.push(formatTemp);
                        formatTemp = formatTemp.split(' ');
                        dateList.push(formatTemp[0]);
                    });
                    if (formatTemp.length > 0 && formatTemp[1]) {
                        formatTemp = formatTemp[1].split(':');
                        if (formatTemp[0]) {
                            $('#time_hour').text(formatTemp[0]);
                        }
                        if (formatTemp[1]) {
                            $('#time_min').text(formatTemp[1]);
                        }
                    }
                    $('#datepicker_selected').val(dateList.join(','));
                    $('#schedule_selected').val(dateTimeList.join(','));
                    $('#poi-event-overlay .datepicker').datepick('setDate', dateList);
                    $('#poi-event-overlay .datepicker').datepick('performAction', 'today');
                } else {
                    // default schedule datetime
                    $('#time_hour').text(hour);
                    $('#time_min').text(min);
                    $('#datepicker_selected').val(selectedDate);
                    $('#schedule_selected').val(selectedDateTime);
                    $('#timestamp_selected').val(Date.parse(selectedDateTime));
                    $('#poi-event-overlay .datepicker').datepick('setDate', selectedDate);
                    $('#poi-event-overlay .datepicker').datepick('performAction', 'today');
                }
                $('#event-scheduled .schedule').addClass('hide');
                $('#schedule-mobile').removeClass('hide');
                // prevent layout broken
                $('#schedule-mobile .mobile-edit .mobile ul li:first-child').attr('class', 'ios on');
                $('#schedule-mobile .mobile-edit .mobile ul li:last-child').attr('class', 'android');
                $('#schedule-ios').attr('class', 'mobile-block mobile-active');
                $('#schedule-android').attr('class', 'mobile-block hide');
            }
        });
        return false;
    });
    // POI overlay - Instant Preview Video and POI Plugin Next
    $('#poi-event-overlay').on('click', '#instant-notify .btn-next, #instant-notify .crumb.edit .crumb-next', function () {
        $page.chkPoiEventData(document.eventInstantForm, function (result) {
            if (result) {
                $('#event-instant .instant').addClass('hide');
                $('#instant-mobile').removeClass('hide');
                // prevent layout broken
                $('#instant-mobile .mobile-edit .mobile ul li:first-child').attr('class', 'ios on');
                $('#instant-mobile .mobile-edit .mobile ul li:last-child').attr('class', 'android');
                $('#instant-ios').attr('class', 'mobile-block mobile-active');
                $('#instant-android').attr('class', 'mobile-block hide');
            }
        });
        return false;
    });

    // POI overlay - Mobile iOS and Android preview switch
    $('#poi-event-overlay').on('click', '#schedule-mobile .mobile-edit ul li a', function () {
        var block = $(this).attr('class');
        $('#schedule-mobile ul li').removeClass('on');
        $(this).parents('li').addClass('on');
        $('#schedule-mobile .mobile .mobile-block').addClass('hide').removeClass('mobile-active');
        $('#schedule-' + block).removeClass('hide').addClass('mobile-active');
        return false;
    });
    $('#poi-event-overlay').on('click', '#instant-mobile .mobile-edit ul li a', function () {
        var block = $(this).attr('class');
        $('#instant-mobile ul li').removeClass('on');
        $(this).parents('li').addClass('on');
        $('#instant-mobile .mobile .mobile-block').addClass('hide').removeClass('mobile-active');
        $('#instant-' + block).removeClass('hide').addClass('mobile-active');
        return false;
    });
    $('#poi-event-overlay').on('click', '.mobile-block .button a', function () {
        return false;
    });

    // POI overlay - Mobile notification message realtime edit preview
    $('#poi-event-overlay').on('change keyup keydown', '#schedule_msg', function () {
        var val = $common.strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
        $('#schedule-mobile .mobile-block p.msg').text(val);
    });
    $('#poi-event-overlay').on('change keyup keydown', '#instant_msg', function () {
        var val = $common.strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
        $('#instant-mobile .mobile-block p.msg').text(val);
    });
    $('#poi-event-overlay').on('blur', '#schedule_msg', function () {
        $('#schedule-ios p.msg').ellipsis();
    });
    $('#poi-event-overlay').on('blur', '#instant_msg', function () {
        $('#instant-ios p.msg').ellipsis();
    });

    // POI overlay - Scheduled Hour and Minute
    $('#poi-event-overlay').on('click', '.time .select .select-txt, .time .select .select-btn', function () {
        $('#poi-event-overlay .event .func ul li.notice').hide();
        $('#poi-event-overlay .select-list').hide();
        $(this).parent().children('.select-btn').toggleClass('on');
        if ($(this).parent().children('.select-btn').hasClass('on')) {
            $(this).parent().children('.select-list').slideDown();
        } else {
            $(this).parent().children('.select-list').hide();
        }
        return false;
    });
    $('#poi-event-overlay').on('click', '.select-list p', function () {
        $('body').addClass('has-poi-change');
        $('body').addClass('has-change');
        var selectOption = $(this).text(),
            selectedList = [],
            scheduleDate = '',
            scheduleList = [],
            timestampList = [];
        $(this).parent().parent().parent().children('.select-btn').removeClass('on');
        $(this).parent().parent().parent().children('.select-txt').children().text(selectOption);
        $(this).parents('.select-list').hide();
        // rebuild multi schedule timestamp
        if ('' !== $.trim($('#datepicker_selected').val())) {
            selectedList = $('#datepicker_selected').val().split(',');
            $.each(selectedList, function (i, selectedItem) {
                scheduleDate = selectedItem + ' ' + $('#time_hour').text() + ':' + $('#time_min').text() + ':00';
                scheduleList.push(scheduleDate);
                timestampList.push(Date.parse(scheduleDate));
            });
            $('#schedule_selected').val(scheduleList.join(','));
            $('#timestamp_selected').val(timestampList.join(','));
        }
        return false;
    });

    // Save POI event
    $('#poi-event-overlay').on('click', '#poi-event-overlay-wrap .btn-save', function () {
        var poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey'),
            formId = cms.config.POI_TYPE_MAP[poiEventTypeKey].formId,
            fm = document.forms[formId];
        $page.chkPoiEventData(fm, function (result) {
            if (result) {
                var displayText = $.trim(fm.displayText.value),
                    btnText = $.trim(fm.btnText.value),
                    channelUrl = $.trim(fm.channelUrl.value),
                    notifyMsg = $.trim(fm.notifyMsg.value),
                    notifyScheduler = $.trim(fm.notifyScheduler.value),
                    programId = $('#poi-event-overlay-wrap').data('programId'),
                    poiPointId = $('#poi-event-overlay-wrap').data('poiPointId'),
                    poiEventId = $('#poi-event-overlay-wrap').data('poiEventId'),
                    poiEventType = $('#poi-event-overlay-wrap').data('poiEventType'),
                    tmplItem = $('#storyboard-listing li.playing').tmplItem(),
                    tmplItemData = tmplItem.data,
                    poiList = tmplItemData.poiList,
                    poiTemp = [],
                    hasPushList = false,
                    poiData = {},
                    poiPointData = {
                        eventType: poiEventType,        // ready for fake api to change new point id
                        name: $('#poiName').val(),
                        startTime: $('#poiStartTime').val(),
                        endTime: $('#poiEndTime').val(),
                        tag: $('#poiTag').val()
                    },
                    poiEventContext = {
                        "message": displayText,
                        "button": [{
                            "text": btnText,
                            "actionUrl": channelUrl
                        }]
                    },
                    poiEventData = {
                        pointType: 5,                   // ready for fake api to change new event id
                        name: $('#poiName').val(),
                        type: poiEventType,
                        context: JSON.stringify(poiEventContext),
                        notifyMsg: notifyMsg,
                        notifyScheduler: notifyScheduler
                    },
                    poiEventDataExtend = {
                        eventId: poiEventId,
                        eventType: poiEventType,
                        message: displayText,
                        button: btnText,
                        link: channelUrl,
                        notifyMsg: notifyMsg,
                        notifyScheduler: notifyScheduler
                    };
                if ($('#cur-poi-edit').hasClass('edit') && poiPointId) {
                    // update mode
                    $common.showSavingOverlay();
                    if (poiPointId > 0 && !isNaN(poiPointId)) {
                        nn.api('PUT', cms.reapi('/api/poi_events/{poiEventId}', {
                            poiEventId: poiEventId
                        }), poiEventData, function (poi_event) {
                            $('#overlay-s').fadeOut(0);
                        });
                    } else {
                        $('#overlay-s').fadeOut(0);
                    }
                    $.each(poiList, function (i, poiItem) {
                        if (poiItem.id === poiPointId) {
                            $.extend(poiItem, poiPointData, poiEventDataExtend);
                        }
                        poiTemp.push(poiItem);
                    });
                    tmplItemData.poiList = poiTemp;
                    $page.buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                    $('body').removeClass('has-poi-change');
                    $('#poi-event-overlay .wrap').html('');
                    $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
                } else {
                    // insert mode
                    $common.showSavingOverlay();
                    if (programId > 0 && !isNaN(programId)) {
                        nn.api('POST', cms.reapi('/api/programs/{programId}/poi_points', {
                            programId: programId
                        }), poiPointData, function (poi_point) {
                            nn.api('POST', cms.reapi('/api/users/{userId}/poi_events', {
                                userId: cms.global.USER_DATA.id
                            }), poiEventData, function (poi_event) {
                                poiData = {
                                    pointId: poi_point.id,
                                    eventId: poi_event.id
                                };
                                nn.api('POST', cms.reapi('/api/poi_campaigns/{poiCampaignId}/pois', {
                                    poiCampaignId: cms.global.CAMPAIGN_ID
                                }), poiData, function (poi) {
                                    if (-1 !== $.inArray(cms.config.POI_TYPE_MAP[poi_event.type], ['event-scheduled', 'event-instant'])) {
                                        poiEventContext.button[0].actionUrl = cms.config.POI_ACTION_URL + poi.id;
                                        poiEventData.context = JSON.stringify(poiEventContext);
                                        poiEventDataExtend.link = cms.config.POI_ACTION_URL + poi.id;
                                    }
                                    nn.api('PUT', cms.reapi('/api/poi_events/{poiEventId}', {
                                        poiEventId: poi_event.id
                                    }), poiEventData, function (poi_event) {
                                        // update id
                                        poiPointData.id = poi_point.id;
                                        poiPointData.targetId = poi_point.targetId;
                                        poiPointData.type = poi_point.type;
                                        poiEventDataExtend.eventId = poi_event.id;
                                        poiPointData = $.extend(poiPointData, poiEventDataExtend);
                                        $.each(poiList, function (i, poiItem) {
                                            if (!hasPushList && parseInt(poiItem.startTime, 10) > parseInt(poiPointData.startTime, 10)) {
                                                poiTemp.push(poiPointData);
                                                hasPushList = true;
                                            }
                                            poiTemp.push(poiItem);
                                        });
                                        if (!hasPushList) {
                                            poiTemp.push(poiPointData);
                                        }
                                        tmplItemData.poiList = poiTemp;
                                        $page.buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                                        $('body').removeClass('has-poi-change');
                                        $('#poi-event-overlay .wrap').html('');
                                        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
                                        $('#overlay-s').fadeOut(0);
                                    });
                                });
                            });
                        });
                    } else {
                        // build timestamp id
                        poiPointData.id = 'temp-poi-point-id-' + $.now();
                        poiEventDataExtend.eventId = 'temp-poi-event-id-' + $.now();
                        poiPointData = $.extend(poiPointData, poiEventDataExtend);
                        $.each(poiList, function (i, poiItem) {
                            if (!hasPushList && parseInt(poiItem.startTime, 10) > parseInt(poiPointData.startTime, 10)) {
                                poiTemp.push(poiPointData);
                                hasPushList = true;
                            }
                            poiTemp.push(poiItem);
                        });
                        if (!hasPushList) {
                            poiTemp.push(poiPointData);
                        }
                        tmplItemData.poiList = poiTemp;
                        $page.buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                        $('body').removeClass('has-poi-change');
                        $('#poi-event-overlay .wrap').html('');
                        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
                        $('#overlay-s').fadeOut(0);
                    }
                }
            }
        });
        return false;
    });

    // Scroll storyboard horizontal video list with mouse wheel.
    $("#storyboard-wrap").mousewheel(function(event, delta) {

        this.scrollLeft -= (delta * 60);

        event.preventDefault();

    });

    // Save
    // NOTE: save titlecard always handle (insert and update) POST /api/programs/{programId}/title_cards
    // NOTE: improve api async order issue
    $('#epcurateForm').submit(function (e, src) {
        // Episode Curation - Curation
        if ($(e.target).hasClass('curation') && $page.chkCurationData(this, src)) {
            $common.showSavingOverlay();
            var isInsertMode = (!$('#id').val()) ? true : false,
                nextstep = 'epcurate-curation.html',
                totalDuration = 0,
                programLength = $('#storyboard-list li').length,
                firstImageUrl = $('#storyboard-list li:first').tmplItem().data.imageUrl,
                tmplItem = null,
                tmplItemData = {},
                programItem = {},
                programList = [],
                parameter = null,
                poiData = {},
                poiPointData = {},
                poiEventContext = {},
                poiEventData = {};
            $('#storyboard-list li').each(function (idx) {
                programItem = $(this).tmplItem().data;
                if (parseInt(programItem.ytDuration, 10) > 0) {
                    totalDuration += parseInt(programItem.duration, 10);
                }
                if (null !== programItem.beginTitleCard) {
                    totalDuration += parseInt(programItem.beginTitleCard.duration, 10);
                }
                if (null !== programItem.endTitleCard) {
                    totalDuration += parseInt(programItem.endTitleCard.duration, 10);
                }
                $.extend(programItem, {
                    channelId: $('#channelId').val(),   // api readonly
                    subSeq: idx + 1,
                    contentType: 1
                });
                programList.push(programItem);
            });
            nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                // nothing to do ON PURPOSE to turn off error handle from YouTube to 9x9 API
                nn.log({
                    jqXHR: jqXHR,
                    textStatus: textStatus
                }, 'debug');
            });
            if (isInsertMode) {
                // insert mode: insert episode --> insert programs --> update episode with total duration
                parameter = {
                    isPublic: false,
                    publishDate: '',
                    scheduleDate: '',
                    name: $('#name').val(),
                    intro: $('#intro').val(),
                    imageUrl: firstImageUrl,
                    duration: totalDuration     // api readonly
                };
                // insert episode
                nn.api('POST', cms.reapi('/api/channels/{channelId}/episodes', {
                    channelId: $('#channelId').val()
                }), parameter, function (episode) {
                    // from insert mode change to update mode
                    // rebuild cookie and hidden episode id
                    $common.rebuildCrumbAndParam($('#channelId').val(), episode.id);
                    $.each(programList, function (idx, programItem) {
                        // insert program
                        nn.api('POST', cms.reapi('/api/episodes/{episodeId}/programs', {
                            episodeId: episode.id
                        }), programItem, function (program) {
                            // update program.id to DOM
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            tmplItemData.id = program.id;
                            //tmplItem.update();

                            // insert poi
                            if (tmplItemData.poiList && tmplItemData.poiList.length > 0) {
                                $.each(tmplItemData.poiList, function (key, poiItem) {
                                    if (poiItem.id && '' !== poiItem.id && isNaN(poiItem.id)) {
                                        delete poiItem.id;
                                        delete poiItem.eventId;
                                        poiPointData = {
                                            name: poiItem.name,
                                            startTime: poiItem.startTime,
                                            endTime: poiItem.endTime,
                                            tag: poiItem.tag
                                        };
                                        nn.api('POST', cms.reapi('/api/programs/{programId}/poi_points', {
                                            programId: program.id
                                        }), poiPointData, function (poi_point) {
                                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                            tmplItemData = tmplItem.data;
                                            tmplItemData.poiList[key].id = poi_point.id;
                                            tmplItemData.poiList[key].targetId = poi_point.targetId;
                                            tmplItemData.poiList[key].type = poi_point.type;
                                            poiEventContext = {
                                                "message": tmplItemData.poiList[key].message,
                                                "button": [{
                                                    "text": tmplItemData.poiList[key].button,
                                                    "actionUrl": tmplItemData.poiList[key].link
                                                }]
                                            };
                                            poiEventData = {
                                                name: tmplItemData.poiList[key].name,
                                                type: tmplItemData.poiList[key].eventType,
                                                context: JSON.stringify(poiEventContext),
                                                notifyMsg: tmplItemData.poiList[key].notifyMsg,
                                                notifyScheduler: tmplItemData.poiList[key].notifyScheduler
                                            };
                                            nn.api('POST', cms.reapi('/api/users/{userId}/poi_events', {
                                                userId: cms.global.USER_DATA.id
                                            }), poiEventData, function (poi_event) {
                                                poiData = {
                                                    pointId: poi_point.id,
                                                    eventId: poi_event.id
                                                };
                                                nn.api('POST', cms.reapi('/api/poi_campaigns/{poiCampaignId}/pois', {
                                                    poiCampaignId: cms.global.CAMPAIGN_ID
                                                }), poiData, function (poi) {
                                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                                    tmplItemData = tmplItem.data;
                                                    poiEventContext = {
                                                        "message": tmplItemData.poiList[key].message,
                                                        "button": [{
                                                            "text": tmplItemData.poiList[key].button,
                                                            "actionUrl": tmplItemData.poiList[key].link
                                                        }]
                                                    };
                                                    poiEventData = {
                                                        name: tmplItemData.poiList[key].name,
                                                        type: tmplItemData.poiList[key].eventType,
                                                        context: JSON.stringify(poiEventContext),
                                                        notifyMsg: tmplItemData.poiList[key].notifyMsg,
                                                        notifyScheduler: tmplItemData.poiList[key].notifyScheduler
                                                    };
                                                    if (-1 !== $.inArray(cms.config.POI_TYPE_MAP[poi_event.type], ['event-scheduled', 'event-instant'])) {
                                                        poiEventContext.button[0].actionUrl = cms.config.POI_ACTION_URL + poi.id;
                                                        poiEventData.context = JSON.stringify(poiEventContext);
                                                        tmplItemData.poiList[key].link = cms.config.POI_ACTION_URL + poi.id;
                                                    }
                                                    nn.api('PUT', cms.reapi('/api/poi_events/{poiEventId}', {
                                                        poiEventId: poi_event.id
                                                    }), poiEventData, function (poi_event) {
                                                        // update poi to DOM
                                                        tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                                        tmplItemData = tmplItem.data;
                                                        tmplItemData.poiList[key].eventId = poi_event.id;
                                                        //tmplItem.update();
                                                    });
                                                });
                                            });
                                        });
                                    }
                                });
                            }

                            // insert titlecard
                            if (null !== tmplItemData.beginTitleCard && tmplItemData.beginTitleCard.message && '' !== $.trim(tmplItemData.beginTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.beginTitleCard, {
                                    message: $.trim(tmplItemData.beginTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 0
                                });
                                nn.api('POST', cms.reapi('/api/programs/{programId}/title_cards', {
                                    programId: program.id
                                }), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.beginTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }
                            if (null !== tmplItemData.endTitleCard && tmplItemData.endTitleCard.message && '' !== $.trim(tmplItemData.endTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.endTitleCard, {
                                    message: $.trim(tmplItemData.endTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 1
                                });
                                nn.api('POST', cms.reapi('/api/programs/{programId}/title_cards', {
                                    programId: program.id
                                }), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.endTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }

                            if (idx === (programList.length - 1)) {
                                // update episode with total duration
                                nn.api('PUT', cms.reapi('/api/episodes/{episodeId}', {
                                    episodeId: episode.id
                                }), {
                                    duration: totalDuration
                                }, function (episode) {
                                    $('#overlay-s').fadeOut('fast', function () {
                                        // redirect
                                        videoDeleteIdList = []; // clear video delete id list
                                        $page.removeTotalChangeHook();
                                        $page.rebuildVideoNumber();
                                        $common.showDraftNoticeOverlay(src);
                                    });
                                });
                            }
                        });
                    });
                });
            } else {
                // update mode
                // !important rule: first POST and PUT then DELETE
                if (!$('body').hasClass('has-change')) {
                    $('#overlay-s').fadeOut('fast', function () {
                        // redirect
                        $page.removeTotalChangeHook();
                        if (!src || (src && 'form-btn-save' === $(src.target).attr('id'))) {
                            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                            return false;
                        }
                        if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                            if ($(src.target).attr('href')) {
                                nextstep = $(src.target).attr('href');
                            }
                            if ($(src.target).parents('a').attr('href')) {
                                nextstep = $(src.target).parents('a').attr('href');
                            }
                        }
                        location.href = nextstep;
                    });
                    return false;
                }
                $('#storyboard-list li').each(function (idx) {
                    programItem = $(this).tmplItem().data;
                    if (programItem.id && programItem.id > 0) {
                        // update program
                        parameter = $.extend({}, programItem, {
                            subSeq: idx + 1
                        });
                        nn.api('PUT', cms.reapi('/api/programs/{programId}', {
                            programId: programItem.id
                        }), parameter, function (program) {
                            // insert titlecard
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            if (null !== tmplItemData.beginTitleCard && tmplItemData.beginTitleCard.message && '' !== $.trim(tmplItemData.beginTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.beginTitleCard, {
                                    message: $.trim(tmplItemData.beginTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 0
                                });
                                nn.api('POST', cms.reapi('/api/programs/{programId}/title_cards', {
                                    programId: program.id
                                }), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.beginTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }
                            if (null !== tmplItemData.endTitleCard && tmplItemData.endTitleCard.message && '' !== $.trim(tmplItemData.endTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.endTitleCard, {
                                    message: $.trim(tmplItemData.endTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 1
                                });
                                nn.api('POST', cms.reapi('/api/programs/{programId}/title_cards', {
                                    programId: program.id
                                }), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.endTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }
                        });
                    } else {
                        // insert program
                        parameter = $.extend({}, programItem, {
                            channelId: $('#channelId').val(),   // api readonly
                            subSeq: idx + 1,
                            contentType: 1
                        });
                        nn.api('POST', cms.reapi('/api/episodes/{episodeId}/programs', {
                            episodeId: $('#id').val()
                        }), parameter, function (program) {
                            // update program.id to DOM
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            tmplItemData.id = program.id;
                            //tmplItem.update();

                            // insert poi
                            if (tmplItemData.poiList && tmplItemData.poiList.length > 0) {
                                $.each(tmplItemData.poiList, function (key, poiItem) {
                                    if (poiItem.id && '' !== poiItem.id && isNaN(poiItem.id)) {
                                        delete poiItem.id;
                                        delete poiItem.eventId;
                                        poiPointData = {
                                            name: poiItem.name,
                                            startTime: poiItem.startTime,
                                            endTime: poiItem.endTime,
                                            tag: poiItem.tag
                                        };
                                        nn.api('POST', cms.reapi('/api/programs/{programId}/poi_points', {
                                            programId: program.id
                                        }), poiPointData, function (poi_point) {
                                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                            tmplItemData = tmplItem.data;
                                            tmplItemData.poiList[key].id = poi_point.id;
                                            tmplItemData.poiList[key].targetId = poi_point.targetId;
                                            tmplItemData.poiList[key].type = poi_point.type;
                                            poiEventContext = {
                                                "message": tmplItemData.poiList[key].message,
                                                "button": [{
                                                    "text": tmplItemData.poiList[key].button,
                                                    "actionUrl": tmplItemData.poiList[key].link
                                                }]
                                            };
                                            poiEventData = {
                                                name: tmplItemData.poiList[key].name,
                                                type: tmplItemData.poiList[key].eventType,
                                                context: JSON.stringify(poiEventContext),
                                                notifyMsg: tmplItemData.poiList[key].notifyMsg,
                                                notifyScheduler: tmplItemData.poiList[key].notifyScheduler
                                            };
                                            nn.api('POST', cms.reapi('/api/users/{userId}/poi_events', {
                                                userId: cms.global.USER_DATA.id
                                            }), poiEventData, function (poi_event) {
                                                poiData = {
                                                    pointId: poi_point.id,
                                                    eventId: poi_event.id
                                                };
                                                nn.api('POST', cms.reapi('/api/poi_campaigns/{poiCampaignId}/pois', {
                                                    poiCampaignId: cms.global.CAMPAIGN_ID
                                                }), poiData, function (poi) {
                                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                                    tmplItemData = tmplItem.data;
                                                    poiEventContext = {
                                                        "message": tmplItemData.poiList[key].message,
                                                        "button": [{
                                                            "text": tmplItemData.poiList[key].button,
                                                            "actionUrl": tmplItemData.poiList[key].link
                                                        }]
                                                    };
                                                    poiEventData = {
                                                        name: tmplItemData.poiList[key].name,
                                                        type: tmplItemData.poiList[key].eventType,
                                                        context: JSON.stringify(poiEventContext),
                                                        notifyMsg: tmplItemData.poiList[key].notifyMsg,
                                                        notifyScheduler: tmplItemData.poiList[key].notifyScheduler
                                                    };
                                                    if (-1 !== $.inArray(cms.config.POI_TYPE_MAP[poi_event.type], ['event-scheduled', 'event-instant'])) {
                                                        poiEventContext.button[0].actionUrl = cms.config.POI_ACTION_URL + poi.id;
                                                        poiEventData.context = JSON.stringify(poiEventContext);
                                                        tmplItemData.poiList[key].link = cms.config.POI_ACTION_URL + poi.id;
                                                    }
                                                    nn.api('PUT', cms.reapi('/api/poi_events/{poiEventId}', {
                                                        poiEventId: poi_event.id
                                                    }), poiEventData, function (poi_event) {
                                                        // update poi to DOM
                                                        tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                                        tmplItemData = tmplItem.data;
                                                        tmplItemData.poiList[key].eventId = poi_event.id;
                                                        //tmplItem.update();
                                                    });
                                                });
                                            });
                                        });
                                    }
                                });
                            }

                            // insert titlecard
                            if (null !== tmplItemData.beginTitleCard && tmplItemData.beginTitleCard.message && '' !== $.trim(tmplItemData.beginTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.beginTitleCard, {
                                    message: $.trim(tmplItemData.beginTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 0
                                });
                                nn.api('POST', cms.reapi('/api/programs/{programId}/title_cards', {
                                    programId: program.id
                                }), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.beginTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }
                            if (null !== tmplItemData.endTitleCard && tmplItemData.endTitleCard.message && '' !== $.trim(tmplItemData.endTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.endTitleCard, {
                                    message: $.trim(tmplItemData.endTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 1
                                });
                                nn.api('POST', cms.reapi('/api/programs/{programId}/title_cards', {
                                    programId: program.id
                                }), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.endTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }
                        });
                    }
                    if (idx === (programLength - 1)) {
                        // delete program
                        if (videoDeleteIdList.length > 0) {
                            nn.api('DELETE', cms.reapi('/api/episodes/{episodeId}/programs', {
                                episodeId: $('#id').val()
                            }), {
                                programs: videoDeleteIdList.join(',')
                            }, function (data) {
                                nn.api('PUT', cms.reapi('/api/episodes/{episodeId}', {
                                    episodeId: $('#id').val()
                                }), {
                                    duration: totalDuration
                                }, function (episode) {
                                    $('#overlay-s').fadeOut('fast', function () {
                                        // redirect
                                        videoDeleteIdList = []; // clear video delete id list
                                        $page.removeTotalChangeHook();
                                        $page.rebuildVideoNumber();
                                        if (!src || (src && 'form-btn-save' === $(src.target).attr('id'))) {
                                            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                                            return false;
                                        }
                                        if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                                            if ($(src.target).attr('href')) {
                                                nextstep = $(src.target).attr('href');
                                            }
                                            if ($(src.target).parents('a').attr('href')) {
                                                nextstep = $(src.target).parents('a').attr('href');
                                            }
                                        }
                                        // ON PURPOSE to wait api (async)
                                        setTimeout(function () {
                                            location.href = nextstep;
                                        }, 1000);
                                    });
                                });
                            });
                        } else {
                            nn.api('PUT', cms.reapi('/api/episodes/{episodeId}', {
                                episodeId: $('#id').val()
                            }), {
                                duration: totalDuration
                            }, function (episode) {
                                $('#overlay-s').fadeOut('fast', function () {
                                    // redirect
                                    $page.removeTotalChangeHook();
                                    $page.rebuildVideoNumber();
                                    if (!src || (src && 'form-btn-save' === $(src.target).attr('id'))) {
                                        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                                        return false;
                                    }
                                    if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                                        if ($(src.target).attr('href')) {
                                            nextstep = $(src.target).attr('href');
                                        }
                                        if ($(src.target).parents('a').attr('href')) {
                                            nextstep = $(src.target).parents('a').attr('href');
                                        }
                                    }
                                    // ON PURPOSE to wait api (async)
                                    setTimeout(function () {
                                        location.href = nextstep;
                                    }, 1000);
                                });
                            });
                        }
                    }
                });
            }
        }
        return false;
    });

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        // $page.setVideoMeasure();
        // $page.setSpace();
        if ($('#poi-list-page').length > 0 && $('#storyboard-list li.playing').length > 0) {
            $page.buildPoiInfoTmpl($('#storyboard-list li.playing'));
        }
        // $page.resizeTitleCard();
        // $page.resizeFromFontRadix();
        // $page.verticalAlignTitleCard();
        // $common.scrollbarX('#storyboard-wrap', '#storyboard-list', '#storyboard-slider');
        $('#storyboard-wrap').perfectScrollbar('update');
    });
});
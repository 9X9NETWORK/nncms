$(function () {
    setVideoMeasure();
    setSpace();
    scrollbar('#storyboard-wrap', '#storyboard-list', '#storyboard-slider');
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
        var src = $('body').data('origin');
        if (!src                                                                                        // from nature action
                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
            return false;
        } else {
            var nextstep = 'epcurate-curation.html';
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
    }
    $('body').keyup(function (e) {
        if (27 === e.which) { // Esc
            if ('block' === $('#poi-event-overlay').css('display')) {
                if ($('body').hasClass('has-poi-change')) {
                    showUnsavePoiMask(e);
                    return false;
                }
            }
            if ('block' === $('#unsave-poi-mask-prompt').css('display')) {
                $('#unsave-poi-mask-prompt').hide();
                $('#poi-event-overlay').show();
            } else {
                $.unblockUI();
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
            showUnsaveOverlay();
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
    removeTotalChangeHook();
    $('#epcurateForm').change(function () {
        $('body').addClass('has-change');
    });
    $('#epcurate-nav-back').click(function (e) {
        if ($('body').hasClass('has-poi-change')) {
            showUnsavePoiOverlay(e);
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
            showUnsaveOverlay();
            return false;
        }
    });
    $('#unsave-prompt .btn-leave').click(function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        if ('' != $('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
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
        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
        return false;
    });
    $('#unsave-poi-mask-prompt .overlay-btn-no, #unsave-poi-mask-prompt .overlay-btn-close').click(function () {
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
            showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-poi-change')) {
            showUnsavePoiOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
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
            showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-poi-change')) {
            showUnsavePoiOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        cancelTitleCard();
        removeVideoPlayingHook();
        removeTrimTimeEditHook();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();
        $('#epcurate-curation .tabs li').addClass('hide');
        $(this).parent().parent().removeClass('hide').addClass('last');
        $('#video-player .video').html('');
        $('#video-control').hide();
        unblockPoiUI();
    });
    // main tabs - Edit Video
    $('#epcurate-curation ul.tabs li a.cur-edit').click(function (e) {
        if ($('body').hasClass('has-poi-change')) {
            showUnsavePoiOverlay(e);
            return false;
        }
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#epcurate-curation ul.tabs li.poi').addClass('last');
        $('#epcurate-curation ul.tabs li.edit-poi').addClass('hide');
        $('#epcurate-curation ul.tabs li.edit-video').addClass('on');
        unblockPoiUI();
        if ($('#youTubePlayer').length <= 0 || $('html').hasClass('youtube-chromeless')) {
            loadYouTubeFlash($('#storyboard-listing li.playing').data('ytid'));
        }
    });
    // main tabs - POI list
    $('#epcurate-curation ul.tabs li a.cur-poi').click(function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-poi-change')) {
            showUnsavePoiOverlay(e);
            return false;
        }
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-poi').removeClass('hide');
        $('#epcurate-curation ul.tabs li.poi').addClass('last on');
        $('#epcurate-curation ul.tabs li.edit-poi').addClass('hide');
        $('#epcurate-curation ul.tabs li.edit-video').removeClass('on');
        unblockPoiUI();
        if ($('#youTubePlayer').length <= 0 || $('html').hasClass('youtube-chromeless')) {
            loadYouTubeFlash($('#storyboard-listing li.playing').data('ytid'));
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
            embedLimitedList = [];
        if ('' === videoUrl || nn._([CMS_CONF.PAGE_ID, 'add-video', 'Paste YouTube video URLs to add (separate with different lines)']) === videoUrl) {
            $('#videourl').get(0).focus();
            $('#cur-add .notice').text(nn._([CMS_CONF.PAGE_ID, 'add-video', 'Paste YouTube video URLs to add.'])).removeClass('hide').show();
            return false;
        }
        $('#storyboard-list li').each(function () {
            existList.push($(this).data('ytid'));
        });
        $.each(urlList, function (i, url) {
            url = $.trim(url);
            if ('' != url) {
                if (patternLong.test(url)) {
                    matchKey = $.url(url).param('v');
                } else if (patternShort.test(url)) {
                    matchKey = $.url(url).segment(1);
                } else {
                    matchKey = '';
                }
                if ('' == matchKey || matchKey.length !== 11) {
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
            if ((existList.length + matchList.length) > CMS_CONF.PROGRAM_MAX) {
                $('#videourl').val(normalList.join('\n'));
                $('#cur-add .notice').text(nn._([CMS_CONF.PAGE_ID, 'add-video', 'You have reached the maximum amount of 50 videos.'])).removeClass('hide').show();
                return false;
            }
            $('body').addClass('has-change');
            showProcessingOverlay();
            var ytData = null,
                ytItem = {},
                ytList = [],
                committedCnt = 0,
                videoNumberBase = $('#storyboard-list li').length,
                isPrivateVideo = null,
                isZoneLimited = null,
                isMobileLimited = null,
                isEmbedLimited = null;
            $.each(matchList, function (idx, key) {
                nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + key + '?alt=jsonc&v=2&callback=?', null, function (youtubes) {
                    committedCnt += 1;
                    if (youtubes.data) {
                        ytData = youtubes.data;
                        isPrivateVideo = false;
                        isZoneLimited = (ytData.restrictions) ? true : false;
                        isMobileLimited = ((ytData.accessControl && ytData.accessControl.syndicate && 'denied' === ytData.accessControl.syndicate) || (ytData.status && ytData.status.reason && 'limitedSyndication' === ytData.status.reason)) ? true : false;
                        isEmbedLimited = (ytData.accessControl && ytData.accessControl.embed && 'denied' === ytData.accessControl.embed) ? true : false;
                    } else {
                        ytData = null;
                        isPrivateVideo = (youtubes.error && youtubes.error.code && 403 == youtubes.error.code) ? true : false;
                        isZoneLimited = null;
                        isMobileLimited = null;
                        isEmbedLimited = null;
                    }
                    if (true === isEmbedLimited) {
                        embedLimitedList.push(normalList[idx]);
                    }
                    if (ytData && false === isEmbedLimited) {
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
                            uploadDate: ytData.uploaded,
                            isPrivateVideo: isPrivateVideo,
                            isZoneLimited: isZoneLimited,
                            isMobileLimited: isMobileLimited,
                            isEmbedLimited: isEmbedLimited
                        };
                        ytList[idx] = ytItem;
                    } else {
                        if (youtubes.error) {
                            nn.log(youtubes.error, 'warning');
                            if (youtubes.error.code && 403 == youtubes.error.code) {
                                privateVideoList.push(normalList[idx]);
                            }
                        }
                        nn.log(normalList[idx], 'debug');
                        invalidList.push(normalList[idx]);
                        $('#videourl').val(invalidList.join('\n'));
                        if (true === isEmbedLimited && 0 === privateVideoList.length && invalidList.length === embedLimitedList.length) {
                            $('#cur-add .notice').html(nn._([CMS_CONF.PAGE_ID, 'add-video', 'Fail to add this video, please try another one.<br />[This video is not playable outside Youtube]'])).removeClass('hide').show();
                        } else if (true === isPrivateVideo && 0 === embedLimitedList.length && invalidList.length === privateVideoList.length) {
                            $('#cur-add .notice').html(nn._([CMS_CONF.PAGE_ID, 'add-video', 'Fail to add this video, please try another one.<br />[This is a private video]'])).removeClass('hide').show();
                        } else {
                            $('#cur-add .notice').text(nn._([CMS_CONF.PAGE_ID, 'add-video', 'Invalid URL, please try again!'])).removeClass('hide').show();
                        }
                    }
                    if (committedCnt === matchList.length) {
                        committedCnt = -1;   // reset to avoid collision
                        animateStoryboard(ytList.length);
                        $('#storyboard-listing-tmpl-item').tmpl(ytList).hide().appendTo('#storyboard-listing').fadeIn(2000);
                        sumStoryboardInfo();
                        rebuildVideoNumber(videoNumberBase);
                        $('.ellipsis').ellipsis();
                        $('#overlay-s').fadeOut();
                    }
                }, 'jsonp');
            });
        }
        $('#videourl').val('');
        if (invalidList.length > 0) {
            $('#videourl').val(invalidList.join('\n'));
            $('#cur-add .notice').text(nn._([CMS_CONF.PAGE_ID, 'add-video', 'Invalid URL, please try again.'])).removeClass('hide').show();
        }
        return false;
    });
    $('#cur-add .checkbox a').click(function () {
        $(this).toggleClass('on');
    });

    // video play
    $('#storyboard').on('click', '.storyboard-list ul li .hover-func a.video-play', function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        cancelTitleCard();
        removeVideoPlayingHook();
        removeTrimTimeEditHook();
        disableTrimTimeEdit();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();

        // switch tab and content
        if ($('#epcurate-curation > ul.tabs > li.poi').hasClass('hide')) {
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
        playTitleCardAndVideo(elemtli);

        return false;
    });

    // video del
    // if video have programId to keep DELETE programIds list
    var videoDeleteIdList = [];
    $('#storyboard-list').on('click', 'li .hover-func a.video-del', function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        $('body').addClass('has-change');
        cancelTitleCard();
        //removeVideoPlayingHook();     // ON PURPOSE to keep video playing hook in order to switch video-info automatically
        removeTrimTimeEditHook();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();
        var length = $('#storyboard-list li').length,
            eq = $('#storyboard-list li.playing').index(),
            deleting = $(this).parent().parent(),
            tmplItemData = deleting.tmplItem().data,
            elemtli = null;
        if (deleting.hasClass('playing') && (length - eq - 1) > 0) {
            // video-info-tmpl (auto turn by del)
            elemtli = deleting.next('li');
            playTitleCardAndVideo(elemtli);
            if (tmplItemData.id && tmplItemData.id > 0) {
                videoDeleteIdList.push(tmplItemData.id);
            }
            deleting.remove();
        } else {
            if (length > 1) {
                if (deleting.hasClass('playing') && (length - eq - 1) == 0) {
                    // video-info-tmpl (auto turn by del)
                    // return to first video
                    elemtli = $('#storyboard-list li:first');
                    playTitleCardAndVideo(elemtli);
                }
                if (tmplItemData.id && tmplItemData.id > 0) {
                    videoDeleteIdList.push(tmplItemData.id);
                }
                deleting.remove();
            } else {
                showSystemErrorOverlay('There must be at least one video in this episode.');
            }
        }
        nn.log({
            length: length,
            eq: eq,
            videoDeleteIdList: videoDeleteIdList
        }, 'debug');
        sumStoryboardInfo();
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
            cancelTitleCard();
            removeTitleCardPlayingHook();
            loadYouTubeFlash($('#storyboard-listing li.playing').data('ytid'));
        } else if ('undefined' !== typeof youTubePlayerObj
                && 'object' === $.type(youTubePlayerObj)
                && 'function' === $.type(youTubePlayerObj.loadVideoById)) {
            //youTubePlayerObj.seekTo(0, true);
            youTubePlayerObj.pauseVideo();
        }
        addTrimTimeEditHook();
        enableTrimTimeEdit();
        return false;
    });

    // Trim time - Done button
    $('#cur-edit').on('click', '.edit-time .btn-wrap .btn-done', function () {
        var trimTime = chkDuration();
        if ($.isArray(trimTime) && 2 === trimTime.length) {
            $('body').addClass('has-change');
            $('body').removeClass('has-trimtime-change');
            disableTrimTimeEdit();
            $('.start-time input.time, .end-time input.time').each(function () {
                $(this).parent().data('time', $(this).val());
            });
            // update trimmed duration
            var trimDuration = formatDuration((trimTime[1] - trimTime[0]), true).split(':');
            $('#totalH').val(trimDuration[0]);
            $('#totalM').val(trimDuration[1]);
            $('#totalS').val(trimDuration[2]);
            if ('undefined' !== typeof youTubePlayerObj
                    && 'object' === $.type(youTubePlayerObj)
                    && 'function' === $.type(youTubePlayerObj.loadVideoById)) {
                youTubePlayerObj.loadVideoById({
                    'videoId': $('#storyboard-listing li.trim-time').data('ytid'),
                    'startSeconds': trimTime[0],
                    'endSeconds': (trimTime[1] == $('#storyboard-listing li.playing').data('ytduration')) ? 0 : trimTime[1]
                });
            }
            // update DOM
            $('#storyboard-listing li.trim-time').data('starttime', trimTime[0]);
            $('#storyboard-listing li.trim-time').data('endtime', trimTime[1]);
            var itemData = $('#storyboard-listing li.trim-time').tmplItem().data;
            itemData.startTime = trimTime[0];
            itemData.endTime = trimTime[1];
            itemData.duration = trimTime[1] - trimTime[0];
            $('#storyboard-listing li.trim-time .img .time .time-middle').text(formatDuration(trimTime[1] - trimTime[0]));
            sumStoryboardInfo();
            removeTrimTimeEditHook();
            buildVideoInfoTmpl($('#storyboard-listing li.playing'));
        }
        return false;
    });
    function chkDuration() {
        var duration = $('.set-time').data('originDuration'),
            startH = parseInt($('input[name=startH]').val(), 10) * 60 * 60,
            startM = parseInt($('input[name=startM]').val(), 10) * 60,
            startS = parseInt($('input[name=startS]').val(), 10),
            endH = parseInt($('input[name=endH]').val(), 10) * 60 * 60,
            endM = parseInt($('input[name=endM]').val(), 10) * 60,
            endS = parseInt($('input[name=endS]').val(), 10),
            startTime = parseInt(startH + startM + startS, 10),
            endTime = parseInt(endH + endM + endS, 10);
        if (0 == duration) {
            $('#cur-edit .edit-time .btn-wrap .notice').show();
            return false;
        }
        if ('' === $.trim($('input[name=startH]').val())
                || '' === $.trim($('input[name=startM]').val())
                || '' === $.trim($('input[name=startS]').val())
                || '' === $.trim($('input[name=endH]').val())
                || '' === $.trim($('input[name=endM]').val())
                || '' === $.trim($('input[name=endS]').val())) {
            $('#cur-edit .edit-time .btn-wrap .notice').show();
            return false;
        }
        if (startM >= 3600) {
            $('#cur-edit .edit-time .btn-wrap .notice').show();
            $('input[name=startM]').focus();
            return false;
        }
        if (startS >= 60) {
            $('#cur-edit .edit-time .btn-wrap .notice').show();
            $('input[name=startS]').focus();
            return false;
        }
        if (endM >= 3600) {
            $('#cur-edit .edit-time .btn-wrap .notice').show();
            $('input[name=endM]').focus();
            return false;
        }
        if (endS >= 60) {
            $('#cur-edit .edit-time .btn-wrap .notice').show();
            $('input[name=endS]').focus();
            return false;
        }
        if (startTime >= duration || endTime > duration) {
            $('#cur-edit .edit-time .btn-wrap .notice').show();
            return false;
        }
        if (startTime >= endTime) {
            $('#cur-edit .edit-time .btn-wrap .notice').show();
            return false;
        }
        return [startTime, endTime];
    }

    // Trim time - Cancel button
    $('#cur-edit').on('click', '.edit-time .btn-wrap .btn-cancel', function () {
        $('body').removeClass('has-trimtime-change');
        removeTrimTimeEditHook();
        disableTrimTimeEdit();
        $('.start-time input.time, .end-time input.time').each(function () {
            $(this).val($(this).parent().data('time'));
        });
        return false;
    });

    // Title Card - Edit/Preview Title (exist) => #storyboard-list li.edit p.title a.edit
    $('#storyboard-listing').on('click', 'li p.title .begin-title, li p.title .end-title', function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        cancelTitleCard();
        removeVideoPlayingHook();
        removeTrimTimeEditHook();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();
        addTitleCardEditHook($(this));

        // switch tab and content
        removePoiTab();
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
            opts = $('#storyboard-list li:eq(' + index + ')').tmplItem().data[hook];
        if (opts && opts.message) {
            var isUpdateMode = true,
                isDisableEdit = false;
            buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
            enableTitleCardEdit();

            buildTitleCardTmpl(opts);
            $('#cur-edit .edit-title .btn-cancel').data('opts', opts);
            $('#btn-play').trigger('click');
        }
        return false;
    });

    // Title Card - Add Title (none) => #storyboard-list li.edit p.hover-func a.edit
    $('#storyboard-listing').on('click', 'li p.hover-func a.begin-title, li p.hover-func a.end-title', function (e) {
        if ($('body').hasClass('has-trimtime-change')) {
            showUnsaveTrimTimeOverlay(e);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        cancelTitleCard();
        removeVideoPlayingHook();
        removeTrimTimeEditHook();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();
        addTitleCardEditHook($(this));

        // switch tab and content
        removePoiTab();
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
        buildTitleCardEditTmpl(CMS_CONF.TITLECARD_DEFAULT_OPTION, isUpdateMode, isDisableEdit);
        enableTitleCardEdit();

        buildTitleCardTmpl(CMS_CONF.TITLECARD_DEFAULT_OPTION);
        $('#cur-edit .edit-title .btn-cancel').data('opts', CMS_CONF.TITLECARD_DEFAULT_OPTION);
        return false;
    });

    // Title Card - Play Title Card
    $('#btn-play').click(function () {
        cancelTitleCard();
        var opts = null,
            isVideoPlayingMode = ($('#storyboard-list li.playing').length > 0) ? true : false,
            isTitleCardEnableEditMode = (!$('.edit-title').hasClass('disable')) ? true : false;
        if (isVideoPlayingMode) {
            if ($('#storyboard-list li.playing .title a.playing').hasClass('begin-title')) {
                $('#storyboard-list li.playing .hover-func .video-play').trigger('click');
            } else {
                opts = $('#storyboard-list li.playing').tmplItem().data.endTitleCard;
                wrapTitleCardCanvas();
                $('#video-player .video .canvas').titlecard(adaptTitleCardOption(opts), function () {
                    if ($('#storyboard-list li.next-playing').length <= 0) {
                        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                    } else {
                        $('#storyboard-list li.next-playing .hover-func .video-play').trigger('click');
                    }
                });
                animateTitleCardProgress(opts);
            }
        } else {
            if (isTitleCardEnableEditMode) {
                opts = computeTitleCardEditOption();
            } else {
                opts = $('#titlecard-outer').tmplItem().data;
            }
            wrapTitleCardCanvas();
            $('#video-player .video .canvas').titlecard(adaptTitleCardOption(opts), function () {
                buildTitleCardTmpl(opts);
                $('#btn-play').removeClass('hide');
                $('#btn-pause').addClass('hide');
            });
            animateTitleCardProgress(opts);
        }
    });

    // Title Card - Stop Title Card
    $('#btn-pause').click(function () {
        cancelTitleCard();
        var opts = null,
            isVideoPlayingMode = ($('#storyboard-list li.playing').length > 0) ? true : false;
        if (isVideoPlayingMode) {
            if ($('#storyboard-list li.playing .title a.playing').hasClass('begin-title')) {
                opts = $('#storyboard-list li.playing').tmplItem().data.beginTitleCard;
            } else {
                opts = $('#storyboard-list li.playing').tmplItem().data.endTitleCard;
            }
        } else {
            opts = computeTitleCardEditOption();
        }
        if (opts && opts.message) {
            buildTitleCardTmpl(opts);
        }
    });

    // Title Card - Edit Title button - enter titlecard edit mode
    $('#cur-edit').on('click', '.edit-title .btn-edit', function () {
        var opts = $('#cur-edit .edit-title .btn-cancel').data('opts'),
            isUpdateMode = ($('#storyboard-list li.edit p.title a.edit').length > 0) ? true : false,
            isDisableEdit = false;
        buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
        enableTitleCardEdit();

        cancelTitleCard();
        buildTitleCardTmpl(opts);
        $('#cur-edit .edit-title .btn-cancel').data('opts', opts);
        return false;
    });

    // Title Card - Cancel button - leave titlecard edit mode
    $('#cur-edit').on('click', '.edit-title .btn-cancel', function () {
        // restore titlecard
        var opts = $('#cur-edit .edit-title .btn-cancel').data('opts'),
            isUpdateMode = ($('#storyboard-list li.edit p.title a.edit').length > 0) ? true : false,
            isDisableEdit = true;
        buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
        disableTitleCardEdit();

        cancelTitleCard();
        buildTitleCardTmpl(opts);
        $('#cur-edit .edit-title .btn-cancel').data('opts', opts);
        $('body').removeClass('has-titlecard-change');
        return false;
    });

    // Title Card - Done button - finish titlecard edit
    $('#cur-edit').on('click', '.edit-title .btn-done', function (e) {
        var message = strip_tags($.trim($('#text').val()));
        if ('' == message) {
            showSystemErrorOverlay("Title text can't be empty!");
            return false;
        }
        var isInsertMode = ($('#storyboard-list li.edit p.hover-func a.edit').length > 0) ? true : false,
            hook = '';
        if (isInsertMode) {
            hook = ($('#storyboard-list li.edit p.hover-func a.edit').hasClass('begin-title')) ? 'beginTitleCard' : 'endTitleCard';
            if ($('#storyboard-listing li.edit .hover-func a.edit').hasClass('begin-title')) {
                $('#storyboard-listing li.edit .title').append('<a href="#" class="begin-title edit">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">' + nn._([CMS_CONF.PAGE_ID, 'episode-storyboard', 'Edit Title']) + '</span></span></span></span></a>');
            } else {
                $('#storyboard-listing li.edit .title').append('<a href="#" class="end-title edit">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">' + nn._([CMS_CONF.PAGE_ID, 'episode-storyboard', 'Edit Title']) + '</span></span></span></span></a>');
            }
            $('#storyboard-listing li.edit .hover-func a.edit').remove();
        } else {
            hook = ($('#storyboard-list li.edit p.title a.edit').hasClass('begin-title')) ? 'beginTitleCard' : 'endTitleCard';
        }

        // save to li DOM and update cancel data
        var tmplItem = $('#storyboard-listing li.edit').tmplItem(),
            itemData = tmplItem.data;
        if (null === itemData[hook]) { itemData[hook] = {}; }
        itemData[hook].message = message;
        itemData[hook].align = $('#cur-edit .edit-title input[name=align]:checked').val();
        itemData[hook].effect = $('#effect').val();
        itemData[hook].duration = $('#duration').val();
        itemData[hook].size = $('#fontSize').val();
        itemData[hook].color = $('#fontColor').val();
        itemData[hook].style = ($('#cur-edit .edit-title input[name=fontStyle]:checked').length > 0) ? 'italic' : 'normal';
        itemData[hook].weight = ($('#cur-edit .edit-title input[name=fontWeight]:checked').length > 0) ? 'bold' : 'normal';
        itemData[hook].bgColor = $('#backgroundColor').val();
        itemData[hook].bgImage = ('image' == $('#cur-edit .edit-title input[name=bg]:checked').val() && '' != $('#backgroundImage').val()) ? $('#backgroundImage').val() : '';
        // ON PURPOSE to mark update() to avoid lose edit hook
        //tmplItem.update();

        // and save to video DOM for titlecard play button
        cancelTitleCard();
        var opts = itemData[hook];
        buildTitleCardTmpl(opts);
        var isUpdateMode = true,
            isDisableEdit = true;
        buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
        disableTitleCardEdit();
        $('#cur-edit .edit-title .btn-cancel').data('opts', opts);

        $('body').addClass('has-change');
        $('body').removeClass('has-titlecard-change');
        sumStoryboardInfo();
        // TODO implement Done == Save?
        //$('#form-btn-save').trigger('click');
        return false;
    });

    // Title Card - Delete icon - titlecard
    $('#cur-edit').on('click', '.edit-title .btn-del', function () {
        $('#btn-pause').trigger('click');
        showDeletePromptOverlay('Are you sure you want to delete this title?');
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#storyboard-list li.edit p.title a.edit').length > 0) {
            showSavingOverlay();
            var deleteId = 0,
                tmplItem = $('#storyboard-listing li.edit').tmplItem(),
                itemData = tmplItem.data;
            if ($('#storyboard-listing li.edit .title a.edit').hasClass('begin-title')) {
                if (itemData.beginTitleCard.id && itemData.beginTitleCard.id > 0) {
                    deleteId = itemData.beginTitleCard.id;
                }
                itemData.beginTitleCard = null;
                tmplItem.update();
                $('#storyboard-listing li.edit .hover-func').append('<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">' + nn._([CMS_CONF.PAGE_ID, 'episode-storyboard', 'Add Title']) + '</span></span></span></span></a>');
            } else {
                if (itemData.endTitleCard.id && itemData.endTitleCard.id > 0) {
                    deleteId = itemData.endTitleCard.id;
                }
                itemData.endTitleCard = null;
                tmplItem.update();
                $('#storyboard-listing li.edit .hover-func').append('<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">' + nn._([CMS_CONF.PAGE_ID, 'episode-storyboard', 'Add Title']) + '</span></span></span></span></a>');
            }
            $('#storyboard-listing li .title a.edit').remove();

            // switch tab and content
            removeTitleCardEditHook();
            $('#epcurate-curation .tabs li').addClass('hide');
            $('#epcurate-curation .tabs li.first').removeClass('hide').addClass('last').addClass('on');
            $('#cur-edit').addClass('hide');
            $('#cur-add').removeClass('hide');
            $('#video-player .video').html('');
            $('#video-control').hide();

            if (deleteId > 0) {
                nn.api('DELETE', CMS_CONF.API('/api/title_card/{titlecardId}', {titlecardId: deleteId}), null, function (data) {
                    $('#overlay-s').fadeOut(0);
                });
            } else {
                $('#overlay-s').fadeOut(0);
            }
            $('body').removeClass('has-titlecard-change');
            sumStoryboardInfo();
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
        var text = strip_tags($.trim($(this).val()));
        $(this).val(text);
        $('#titlecard-inner').html(nl2br(text));
        verticalAlignTitleCard();
    });

    // Title Card - Setting UI - Font (bold, italic, radix/size, align)
    $('#cur-edit').on('click', '#fontWeight', function () {
        $('body').addClass('has-titlecard-change');
        var weight = $(this).attr('checked') ? 'bold' : 'normal';
        $('#titlecard-inner').css('font-weight', weight);
    });
    $('#cur-edit').on('click', '#fontStyle', function () {
        $('body').addClass('has-titlecard-change');
        var style = $(this).attr('checked') ? 'italic' : 'normal';
        $('#titlecard-inner').css('font-style', style);
    });
    switchFontRadix($('#fontSize').val());
    $('#cur-edit').on('click', '.font-container .font-l.enable', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        setupFontRadix('up');
        return false;
    });
    $('#cur-edit').on('click', '.font-container .font-s.enable', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        setupFontRadix('down');
        return false;
    });
    switchFontAlign($('#cur-edit .edit-title input[name=align]:checked').val());
    $('#cur-edit').on('click', '.edit-title input[name=align]', function () {
        $('body').addClass('has-titlecard-change');
        switchFontAlign($(this).val());
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
        previewEffect(element, effect);
        $('#effect').val(effect);
        return false;
    });
    $('#cur-edit').on('click', '.effect-container p.effect-demo', function () {
        var element = $(this),
            effect = $('#effect').val();
        previewEffect(element, effect);
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
    switchBackground($('#cur-edit .edit-title input[name=bg]:checked').val(), $('#cur-edit .edit-title input[name=bg]:checked').attr('name'));
    $('#cur-edit').on('click', '.edit-title input[name=bg]', function () {
        $('body').addClass('has-titlecard-change');
        switchBackground($(this).val(), $(this).attr('name'));
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
        showDeletePoiPromptOverlay('Are you sure you want to delete this POI with interactive event?');
        return false;
    });
    $('#del-poi-notice .btn-del').click(function () {
        $.unblockUI();
        var poiPointId = $('#poi-list-page ol li.deleting').data('deleteId'),
            tmplItem = $('#storyboard-listing li.playing').tmplItem(),
            tmplItemData = tmplItem.data,
            poiList = tmplItemData.poiList,
            poiTemp = [];
        if ($('#poi-list-page ol li.deleting').length > 0 && '' != poiPointId) {
            showSavingOverlay();
            if (poiPointId > 0 && !isNaN(poiPointId)) {
                nn.api('DELETE', CMS_CONF.API('/api/poi_points/{poiPointId}', {poiPointId: poiPointId}), null, function (data) {
                    $('#overlay-s').fadeOut(0);
                });
            } else {
                $('#overlay-s').fadeOut(0);
            }
            $.each(poiList, function (i, poiItem) {
                if (poiItem.id == poiPointId) {
                    // NOTE: Returning non-false is the same as a continue statement in a for loop
                    return true;
                }
                poiTemp.push(poiItem);
            });
            tmplItemData.poiList = poiTemp;
            buildPoiInfoTmpl($('#storyboard-listing li.playing'));
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
        loadYouTubeFlash($('#storyboard-listing li.playing').data('ytid'));
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-poi-edit').removeClass('hide edit');
        $('#epcurate-curation ul.tabs li.poi').removeClass('last on');
        $('#epcurate-curation ul.tabs li.edit-poi').removeClass('hide');
        $('#epcurate-curation ul.tabs li.edit-poi').addClass('on');
        $('#storyboard, #content-main-wrap .form-btn, #epcurate-nav ul li.publish').block({ message: null });
        $('#epcurate-nav ul li.publish').addClass('mask');
        $('#cur-poi-edit .edit-form').removeClass('hide');
        $('#cur-poi-edit .edit-form .notice').addClass('hide');
        return false;
    });
    $('#cur-poi').on('click', '.btn-add-poi a', function () {
        // Add button
        buildPoiPointEditTmpl();
        $('#cur-poi-edit').removeClass('edit');
        return false;
    });
    $('#cur-poi').on('click', '.poi-list a.edit', function () {
        // Edit button
        var poiPointId = $(this).data('poiPointId'),
            tmplItem = $('#storyboard-listing li.playing').tmplItem(),
            tmplItemData = tmplItem.data,
            poiList = tmplItemData.poiList;
        if ('' != poiPointId) {
            if (poiPointId > 0 && !isNaN(poiPointId)) {
                nn.api('GET', CMS_CONF.API('/api/poi_points/{poiPointId}', {poiPointId: poiPointId}), null, function (poi_point) {
                    buildPoiPointEditTmpl(poi_point);
                });
            } else {
                $.each(poiList, function (i, poiItem) {
                    if (poiItem.id == poiPointId) {
                        buildPoiPointEditTmpl(poiItem);
                        // NOTE: return false here is break the $.each() loop
                        return false;
                    }
                });
            }
            // enter edit mode
            $('#cur-poi-edit').addClass('edit');
        }
        return false;
    });

    // POI click notice reset
    $('#cur-poi-edit').on('click', '.edit-form input, .btn-reset', function () {
        $('#cur-poi-edit .edit-form .notice').addClass('hide');
    });
    $('#poi-event-overlay').on('click', 'input[type=text], textarea', function () {
        $('#poi-event-overlay .event .event-input .fminput .notice').hide();
        $('#poi-event-overlay .event .func ul li.notice').hide();
    });
    // POI hook has change
    $('#cur-poi-edit').on('change', '.edit-form input', function () {
        $('body').addClass('has-poi-change');
    });
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
        var startTime = formatDuration($('#storyboard-listing li.playing').data('starttime'), true).split(':'),
            endTime = formatDuration($('#storyboard-listing li.playing').data('endtime'), true).split(':'),
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
            showUnsavePoiOverlay(e);
            return false;
        }
        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
        return false;
    });
    // POI overlay - cancel and close
    $('#poi-event-overlay').on('click', '.btn-cancel, .overlay-btn-close', function (e) {
        if ($('body').hasClass('has-poi-change')) {
            showUnsavePoiMask(e);
            return false;
        }
        $.unblockUI();
        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
        return false;
    });
    // POI overlay - crumb root close
    $('#poi-event-overlay').on('click', '.unblock', function () {
        $.unblockUI();
        return false;
    });

    // POI point Next
    $('#cur-poi-edit').on('click', '#poi-edit .btn-next', function () {
        if (chkPoiData(document.epcurateForm)) {
            var poiPointId = 0,
                poiEventId = 0,
                hasPointEventCache = false;
                tmplItem = $('#storyboard-listing li.playing').tmplItem(),
                tmplItemData = tmplItem.data,
                poiList = tmplItemData.poiList,
                poiTemp = [],
                poiPointEventData = {},
                poiEventContext = '',
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
                if ('' != poiPointId) {
                    showProcessingOverlay();
                    if (poiPointId > 0 && !isNaN(poiPointId)) {
                        // real API access phase
                        $.each(poiList, function (i, poiItem) {
                            if (poiItem.id == poiPointId) {
                                if (poiItem.eventId && !isNaN(poiItem.eventId)) {
                                    hasPointEventCache = true;
                                }
                                $.extend(poiItem, poiPointData);
                                poiPointEventData = poiItem;
                            }
                            poiTemp.push(poiItem);
                        });
                        if (hasPointEventCache) {
                            nn.api('PUT', CMS_CONF.API('/api/poi_points/{poiPointId}', {poiPointId: poiPointId}), poiPointData, function (poi_point) {
                                $('#overlay-s').fadeOut(0, function () {
                                    tmplItemData.poiList = poiTemp;
                                    buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                                    buildPoiEventOverlayTmpl(poiPointEventData);
                                });
                            });
                        } else {
                            poiTemp = [];
                            poiPointEventData = {};
                            nn.api('PUT', CMS_CONF.API('/api/poi_points/{poiPointId}', {poiPointId: poiPointId}), poiPointData, function (poi_point) {
                                nn.api('GET', CMS_CONF.API('/api/poi_campaigns/{poiCampaignId}/pois', {poiCampaignId: CMS_CONF.CAMPAIGN_ID}), {poiPointId: poiPointId}, function (pois) {
                                    if (pois && pois.length > 0 && pois[0] && pois[0].eventId && !isNaN(pois[0].eventId)) {
                                        poiEventId = pois[0].eventId;
                                        nn.api('GET', CMS_CONF.API('/api/poi_events/{poiEventId}', {poiEventId: poiEventId}), null, function (poi_event) {
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
                                                    if (poiItem.id == poiPointId) {
                                                        $.extend(poiItem, poiPointData, poiEventData);
                                                        poiPointEventData = poiItem;
                                                    }
                                                    poiTemp.push(poiItem);
                                                });
                                                tmplItemData.poiList = poiTemp;
                                                buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                                                buildPoiEventOverlayTmpl(poiPointEventData);
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
                                if (poiItem.id == poiPointId) {
                                    $.extend(poiItem, poiPointData);
                                    poiPointEventData = poiItem;
                                }
                                poiTemp.push(poiItem);
                            });
                            tmplItemData.poiList = poiTemp;
                            buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                            buildPoiEventOverlayTmpl(poiPointEventData);
                        });
                    }
                } else {
                    nn.log('Can not fetch POI Point ID!', 'error');
                }
            } else {
                // insert mode
                buildPoiEventOverlayTmpl(poiPointData);
            }
        }
        return false;
    });

    // TODO
    // POI overlay - crumb switch
    $('#poi-event-overlay').on('click', '.event .crumb a.crumb-event', function () {
        var blockClass = $(this).attr('class'),
            block = blockClass.split(' ');
        $('#poi-event-overlay .event, #schedule-mobile, #instant-mobile').addClass('hide');
        $('#' + block[1] + ', #schedule-notify, #instant-notify').removeClass('hide');
        return false;
    });
    $('#poi-event-overlay').on('click', '#schedule-mobile .crumb .crumb-mobile', function () {
        $('#event-scheduled .schedule').addClass('hide');
        $('#schedule-notify').removeClass('hide');
        return false;
    });
    $('#poi-event-overlay').on('click', '#instant-mobile .crumb .crumb-mobile', function () {
        $('#event-instant .instant').addClass('hide');
        $('#instant-notify').removeClass('hide');
        return false;
    });

    // POI overlay - Choose a type
    $('#poi-event-overlay').on('click', '#event-select ul.list li', function () {
        $('body').addClass('has-poi-change');
        $('body').addClass('has-change');
        var type = $(this).attr('class');
        $('#poi-event-overlay .event').addClass('hide');
        $('#' + type).removeClass('hide');
        playPoiEventAndVideo(type);
    });
    $('#poi-event-overlay').on('change keyup keydown', 'input[name=displayText]', function () {
        var val = strip_tags($(this).val().replace(/\n/g, ''));
        $('#poi-event-overlay .event .video-wrap .poi-display').poi('displayText', val);
    });
    $('#poi-event-overlay').on('change keyup keydown', 'input[name=btnText]', function () {
        var val = strip_tags($(this).val().replace(/\n/g, ''));
        $('#poi-event-overlay .event .video-wrap .poi-display').poi('buttonText', val);
    });
    $('#poi-event-overlay').on('blur', 'input[name=displayText]', function () {
        var val = strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
    });
    $('#poi-event-overlay').on('blur', 'input[name=btnText]', function () {
        var val = strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
    });

    // POI overlay - Preview Video and POI Plugin Next
    $('#poi-event-overlay').on('click', '#schedule-notify .btn-next', function () {
        var dates = $('#datepicker_selected').val().split(',');
        $('#poi-event-overlay .datepicker').datepick('setDate', dates);
        $('#event-scheduled .schedule').addClass('hide');
        $('#schedule-mobile').removeClass('hide');
        // prevent layout broken
        $('#schedule-mobile .mobile-edit .mobile ul li:first-child').attr('class', 'ios on');
        $('#schedule-mobile .mobile-edit .mobile ul li:last-child').attr('class', 'android');
        $('#schedule-ios').attr('class', 'mobile-block mobile-active');
        $('#schedule-android').attr('class', 'mobile-block hide');
        return false;
    });
    $('#poi-event-overlay').on('click', '#instant-notify .btn-next', function () {
        $('#event-instant .instant').addClass('hide');
        $('#instant-mobile').removeClass('hide');
        // prevent layout broken
        $('#instant-mobile .mobile-edit .mobile ul li:first-child').attr('class', 'ios on');
        $('#instant-mobile .mobile-edit .mobile ul li:last-child').attr('class', 'android');
        $('#instant-ios').attr('class', 'mobile-block mobile-active');
        $('#instant-android').attr('class', 'mobile-block hide');
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

    // POI overlay - Mobile notification message
    $('#poi-event-overlay').on('change keyup keydown', '#schedule_msg', function () {
        var val = strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
        $('#schedule-mobile .mobile-block p.msg').text(val);
    });
    $('#poi-event-overlay').on('change keyup keydown', '#instant_msg', function () {
        var val = strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
        $('#instant-mobile .mobile-block p.msg').text(val);
    });

    // POI overlay - Scheduled Hour and Minute
    $('#poi-event-overlay').on('click', '.time .select .select-txt, .time .select .select-btn', function () {
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
        var selectOption = $(this).text();
        $(this).parent().parent().parent().children('.select-btn').removeClass('on');
        $(this).parent().parent().parent().children('.select-txt').children().text(selectOption);
        $(this).parents('.select-list').hide();
        return false;
    });

    // Save POI event
    $('#poi-event-overlay').on('click', '#poi-event-overlay-wrap .btn-save', function () {
        var poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey'),
            formId = CMS_CONF.POI_TYPE_MAP[poiEventTypeKey].formId;
        // TODO 3 type
        if (-1 !== $.inArray(poiEventTypeKey, ['event-scheduled', 'event-instant'])) {
            alert('TODO: under construction');
            return false;
        }
        chkPoiEventData(document.forms[formId], function (result) {
            if (result) {
                var programId = $('#poi-event-overlay-wrap').data('programId'),
                    poiPointId = $('#poi-event-overlay-wrap').data('poiPointId'),
                    poiEventId = $('#poi-event-overlay-wrap').data('poiEventId'),
                    poiEventType = $('#poi-event-overlay-wrap').data('poiEventType'),
                    tmplItem = $('#storyboard-listing li.playing').tmplItem(),
                    tmplItemData = tmplItem.data,
                    poiList = tmplItemData.poiList,
                    poiTemp = [],
                    hasPush = false,
                    poiData = {},
                    poiPointData = {
                        eventType: poiEventType,        // ready for fake api to change new point id
                        name: $('#poiName').val(),
                        startTime: $('#poiStartTime').val(),
                        endTime: $('#poiEndTime').val(),
                        tag: $('#poiTag').val()
                    },
                    // TODO actionUrl: http://www.9x9.tv/poiAction?poiId=9876
                    poiEventContext = {
                        "message": $('#' + formId + ' input[name=displayText]').val(),
                        "button": [{
                            "text": $('#' + formId + ' input[name=btnText]').val(),
                            "actionUrl": $('#' + formId + ' input[name=channelUrl]').val()
                        }]
                    },
                    poiEventData = {
                        pointType: 5,                   // ready for fake api to change new event id
                        name: $('#poiName').val(),
                        type: poiEventType,
                        context: JSON.stringify(poiEventContext),
                        notifyMsg: $('#' + formId + ' input[name=notifyMsg]').val(),
                        notifyScheduler: $('#' + formId + ' input[name=notifyScheduler]').val()
                    },
                    // TODO actionUrl: http://www.9x9.tv/poiAction?poiId=9876
                    poiEventDataExtend = {
                        eventId: poiEventId,
                        eventType: poiEventType,
                        message: $('#' + formId + ' input[name=displayText]').val(),
                        button: $('#' + formId + ' input[name=btnText]').val(),
                        link: $('#' + formId + ' input[name=channelUrl]').val(),
                        notifyMsg: $('#' + formId + ' input[name=notifyMsg]').val(),
                        notifyScheduler: $('#' + formId + ' input[name=notifyScheduler]').val()
                    };
                if ($('#cur-poi-edit').hasClass('edit') && '' != poiPointId) {
                    // update mode
                    showSavingOverlay();
                    if (poiPointId > 0 && !isNaN(poiPointId)) {
                        nn.api('PUT', CMS_CONF.API('/api/poi_events/{poiEventId}', {poiEventId: poiEventId}), poiEventData, function (poi_event) {
                            $('#overlay-s').fadeOut(0);
                        });
                    } else {
                        $('#overlay-s').fadeOut(0);
                    }
                    $.each(poiList, function (i, poiItem) {
                        if (poiItem.id == poiPointId) {
                            $.extend(poiItem, poiPointData, poiEventDataExtend);
                        }
                        poiTemp.push(poiItem);
                    });
                    tmplItemData.poiList = poiTemp;
                    buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                    $('body').removeClass('has-poi-change');
                    $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
                } else {
                    // insert mode
                    showSavingOverlay();
                    if (programId > 0 && !isNaN(programId)) {
                        nn.api('POST', CMS_CONF.API('/api/programs/{programId}/poi_points', {programId: programId}), poiPointData, function (poi_point) {
                            nn.api('POST', CMS_CONF.API('/api/users/{userId}/poi_events', {userId: CMS_CONF.USER_DATA.id}), poiEventData, function (poi_event) {
                                poiData = {
                                    pointId: poi_point.id,
                                    eventId: poi_event.id
                                };
                                nn.api('POST', CMS_CONF.API('/api/poi_campaigns/{poiCampaignId}/pois', {poiCampaignId: CMS_CONF.CAMPAIGN_ID}), poiData, function (poi) {
                                    // update id
                                    poiPointData.id = poi_point.id;
                                    poiPointData.targetId = poi_point.targetId;
                                    poiPointData.type = poi_point.type;
                                    poiEventDataExtend.eventId = poi_event.id;
                                    poiPointData = $.extend(poiPointData, poiEventDataExtend);
                                    $.each(poiList, function (i, poiItem) {
                                        if (!hasPush && parseInt(poiItem.startTime, 10) > parseInt(poiPointData.startTime, 10)) {
                                            poiTemp.push(poiPointData);
                                            hasPush = true;
                                        }
                                        poiTemp.push(poiItem);
                                    });
                                    if (!hasPush) {
                                        poiTemp.push(poiPointData);
                                    }
                                    tmplItemData.poiList = poiTemp;
                                    buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                                    $('body').removeClass('has-poi-change');
                                    $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
                                    $('#overlay-s').fadeOut(0);
                                });
                            });
                        });
                    } else {
                        // build timestamp id
                        poiPointData.id = 'temp-poi-point-id-' + $.now();
                        poiEventDataExtend.eventId = 'temp-poi-event-id-' + $.now();
                        poiPointData = $.extend(poiPointData, poiEventDataExtend);
                        $.each(poiList, function (i, poiItem) {
                            if (!hasPush && parseInt(poiItem.startTime, 10) > parseInt(poiPointData.startTime, 10)) {
                                poiTemp.push(poiPointData);
                                hasPush = true;
                            }
                            poiTemp.push(poiItem);
                        });
                        if (!hasPush) {
                            poiTemp.push(poiPointData);
                        }
                        tmplItemData.poiList = poiTemp;
                        buildPoiInfoTmpl($('#storyboard-listing li.playing'));
                        $('body').removeClass('has-poi-change');
                        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
                        $('#overlay-s').fadeOut(0);
                    }
                }
            }
        });
        return false;
    });

    // Save
    // NOTE: save titlecard always handle (insert and update) POST /api/programs/{programId}/title_cards
    // NOTE: improve api async order issue
    $('#epcurateForm').submit(function (e, src) {
        // Episode Curation - Curation
        if ($(e.target).hasClass('curation') && chkCurationData(this, src)) {
            showSavingOverlay();
            var isInsertMode = ('' == $('#id').val()),
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
                nn.api('POST', CMS_CONF.API('/api/channels/{channelId}/episodes', {channelId: $('#channelId').val()}), parameter, function (episode) {
                    // from insert mode change to update mode
                    // rebuild cookie and hidden episode id
                    rebuildCrumbAndParam($('#channelId').val(), episode.id);
                    $.each(programList, function (idx, programItem) {
                        // insert program
                        nn.api('POST', CMS_CONF.API('/api/episodes/{episodeId}/programs', {episodeId: episode.id}), programItem, function (program) {
                            // update program.id to DOM
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            tmplItemData.id = program.id;
                            //tmplItem.update();

                            // insert poi
                            if (tmplItemData.poiList && tmplItemData.poiList.length > 0) {
                                $.each(tmplItemData.poiList, function (key, poiItem) {
                                    if (poiItem.id && '' != poiItem.id && isNaN(poiItem.id)) {
                                        delete poiItem.id;
                                        delete poiItem.eventId;
                                        poiPointData = {
                                            name: poiItem.name,
                                            startTime: poiItem.startTime,
                                            endTime: poiItem.endTime,
                                            tag: poiItem.tag
                                        };
                                        // TODO actionUrl: http://www.9x9.tv/poiAction?poiId=9876
                                        poiEventContext = {
                                            "message": poiItem.message,
                                            "button": [{
                                                "text": poiItem.button,
                                                "actionUrl": poiItem.link
                                            }]
                                        };
                                        poiEventData = {
                                            name: poiItem.name,
                                            type: poiItem.eventType,
                                            context: JSON.stringify(poiEventContext),
                                            notifyMsg: poiItem.notifyMsg,
                                            notifyScheduler: poiItem.notifyScheduler
                                        };
                                        nn.api('POST', CMS_CONF.API('/api/programs/{programId}/poi_points', {programId: program.id}), poiPointData, function (poi_point) {
                                            nn.api('POST', CMS_CONF.API('/api/users/{userId}/poi_events', {userId: CMS_CONF.USER_DATA.id}), poiEventData, function (poi_event) {
                                                poiData = {
                                                    pointId: poi_point.id,
                                                    eventId: poi_event.id
                                                };
                                                nn.api('POST', CMS_CONF.API('/api/poi_campaigns/{poiCampaignId}/pois', {poiCampaignId: CMS_CONF.CAMPAIGN_ID}), poiData, function (poi) {
                                                    // update poi to DOM
                                                    poiItem.id = poi_point.id;
                                                    poiItem.targetId = poi_point.targetId;
                                                    poiItem.type = poi_point.type;
                                                    poiItem.eventId = poi_event.id;
                                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                                    tmplItemData = tmplItem.data;
                                                    tmplItemData.poiList[key] = poiItem;
                                                    //tmplItem.update();
                                                });
                                            });
                                        });
                                    }
                                });
                            }

                            // insert titlecard
                            if (null != tmplItemData.beginTitleCard && tmplItemData.beginTitleCard.message && '' != $.trim(tmplItemData.beginTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.beginTitleCard, {
                                    message: $.trim(tmplItemData.beginTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 0
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.beginTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }
                            if (null != tmplItemData.endTitleCard && tmplItemData.endTitleCard.message && '' != $.trim(tmplItemData.endTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.endTitleCard, {
                                    message: $.trim(tmplItemData.endTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 1
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.endTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }

                            if (idx === (programList.length - 1)) {
                                // update episode with total duration
                                nn.api('PUT', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: episode.id}), {duration: totalDuration}, function (episode) {
                                    $('#overlay-s').fadeOut('fast', function () {
                                        // redirect
                                        videoDeleteIdList = []; // clear video delete id list
                                        removeTotalChangeHook();
                                        rebuildVideoNumber();
                                        showDraftNoticeOverlay(src);
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
                        removeTotalChangeHook();
                        if (!src                                                                                        // from nature action
                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                            return false;
                        } else {
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
                        nn.api('PUT', CMS_CONF.API('/api/programs/{programId}', {programId: programItem.id}), parameter, function (program) {
                            // insert titlecard
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            if (null != tmplItemData.beginTitleCard && tmplItemData.beginTitleCard.message && '' != $.trim(tmplItemData.beginTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.beginTitleCard, {
                                    message: $.trim(tmplItemData.beginTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 0
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.beginTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }
                            if (null != tmplItemData.endTitleCard && tmplItemData.endTitleCard.message && '' != $.trim(tmplItemData.endTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.endTitleCard, {
                                    message: $.trim(tmplItemData.endTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 1
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
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
                        nn.api('POST', CMS_CONF.API('/api/episodes/{episodeId}/programs', {episodeId: $('#id').val()}), parameter, function (program) {
                            // update program.id to DOM
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            tmplItemData.id = program.id;
                            //tmplItem.update();

                            // insert poi
                            if (tmplItemData.poiList && tmplItemData.poiList.length > 0) {
                                $.each(tmplItemData.poiList, function (key, poiItem) {
                                    if (poiItem.id && '' != poiItem.id && isNaN(poiItem.id)) {
                                        delete poiItem.id;
                                        delete poiItem.eventId;
                                        poiPointData = {
                                            name: poiItem.name,
                                            startTime: poiItem.startTime,
                                            endTime: poiItem.endTime,
                                            tag: poiItem.tag
                                        };
                                        // TODO actionUrl: http://www.9x9.tv/poiAction?poiId=9876
                                        poiEventContext = {
                                            "message": poiItem.message,
                                            "button": [{
                                                "text": poiItem.button,
                                                "actionUrl": poiItem.link
                                            }]
                                        };
                                        poiEventData = {
                                            name: poiItem.name,
                                            type: poiItem.eventType,
                                            context: JSON.stringify(poiEventContext),
                                            notifyMsg: poiItem.notifyMsg,
                                            notifyScheduler: poiItem.notifyScheduler
                                        };
                                        nn.api('POST', CMS_CONF.API('/api/programs/{programId}/poi_points', {programId: program.id}), poiPointData, function (poi_point) {
                                            nn.api('POST', CMS_CONF.API('/api/users/{userId}/poi_events', {userId: CMS_CONF.USER_DATA.id}), poiEventData, function (poi_event) {
                                                poiData = {
                                                    pointId: poi_point.id,
                                                    eventId: poi_event.id
                                                };
                                                nn.api('POST', CMS_CONF.API('/api/poi_campaigns/{poiCampaignId}/pois', {poiCampaignId: CMS_CONF.CAMPAIGN_ID}), poiData, function (poi) {
                                                    // update poi to DOM
                                                    poiItem.id = poi_point.id;
                                                    poiItem.targetId = poi_point.targetId;
                                                    poiItem.type = poi_point.type;
                                                    poiItem.eventId = poi_event.id;
                                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                                    tmplItemData = tmplItem.data;
                                                    tmplItemData.poiList[key] = poiItem;
                                                    //tmplItem.update();
                                                });
                                            });
                                        });
                                    }
                                });
                            }

                            // insert titlecard
                            if (null != tmplItemData.beginTitleCard && tmplItemData.beginTitleCard.message && '' != $.trim(tmplItemData.beginTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.beginTitleCard, {
                                    message: $.trim(tmplItemData.beginTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 0
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.beginTitleCard.id = title_card.id;
                                    //tmplItem.update();
                                });
                            }
                            if (null != tmplItemData.endTitleCard && tmplItemData.endTitleCard.message && '' != $.trim(tmplItemData.endTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.endTitleCard, {
                                    message: $.trim(tmplItemData.endTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 1
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
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
                            nn.api('DELETE', CMS_CONF.API('/api/episodes/{episodeId}/programs', {episodeId: $('#id').val()}), {programs: videoDeleteIdList.join(',')}, function (data) {
                                nn.api('PUT', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: $('#id').val()}), {duration: totalDuration}, function (episode) {
                                    $('#overlay-s').fadeOut('fast', function () {
                                        // redirect
                                        videoDeleteIdList = []; // clear video delete id list
                                        removeTotalChangeHook();
                                        rebuildVideoNumber();
                                        if (!src                                                                                        // from nature action
                                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                                            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                                            return false;
                                        } else {
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
                                        }
                                    });
                                });
                            });
                        } else {
                            nn.api('PUT', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: $('#id').val()}), {duration: totalDuration}, function (episode) {
                                $('#overlay-s').fadeOut('fast', function () {
                                    // redirect
                                    removeTotalChangeHook();
                                    rebuildVideoNumber();
                                    if (!src                                                                                        // from nature action
                                            || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                                        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                                        return false;
                                    } else {
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
                                    }
                                });
                            });
                        }
                    }
                });
            }
        }
        return false;
    });

    $(window).resize(function () {
        setVideoMeasure();
        setSpace();
        if ($('#poi-list-page').length > 0 && $('#storyboard-list li.playing').length > 0) {
            buildPoiInfoTmpl($('#storyboard-list li.playing'));
        }
        resizeTitleCard();
        resizeFromFontRadix();
        verticalAlignTitleCard();
        scrollbar('#storyboard-wrap', '#storyboard-list', '#storyboard-slider');
    });
});

function chkCurationData(fm, src) {
    var cntProgram = $('#storyboard-list li').length,
        duration = 0,
        itemData = null;
    $('#storyboard-list li').each(function (i) {
        itemData = $(this).tmplItem().data;
        duration += parseInt(itemData.ytDuration, 10);
    });
    if ($('body').hasClass('has-trimtime-change')) {
        showUnsaveTrimTimeOverlay(src);
        return false;
    }
    if ($('body').hasClass('has-titlecard-change')) {
        showUnsaveTitleCardOverlay(src);
        return false;
    }
    if (cntProgram <= 0 || duration <= 0) {
        showSystemErrorOverlay('Please curate at least one valid video.');
        return false;
    }
    if (cntProgram > CMS_CONF.PROGRAM_MAX) {
        showSystemErrorOverlay('You have reached the maximum amount of 50 videos.');
        return false;
    }
    return true;
}

function chkPoiData(fm) {
    fm.poiName.value = $.trim(fm.poiName.value);
    fm.poiTag.value = $.trim(fm.poiTag.value);
    var poiList = $('#storyboard-list li.playing').tmplItem().data.poiList,
        poiPointId = $('#poi-point-edit-wrap').data('poiPointId'),
        duration = $('.set-time').data('originDuration'),
        videoStart = $('#storyboard-listing li.playing').data('starttime'),
        videoEnd = $('#storyboard-listing li.playing').data('endtime'),
        startH = parseInt($('input[name=poiStartH]').val(), 10) * 60 * 60,
        startM = parseInt($('input[name=poiStartM]').val(), 10) * 60,
        startS = parseInt($('input[name=poiStartS]').val(), 10),
        endH = parseInt($('input[name=poiEndH]').val(), 10) * 60 * 60,
        endM = parseInt($('input[name=poiEndM]').val(), 10) * 60,
        endS = parseInt($('input[name=poiEndS]').val(), 10),
        startTime = parseInt(startH + startM + startS, 10),
        endTime = parseInt(endH + endM + endS, 10);
    if ('' === fm.poiName.value) {
        $('#cur-poi-edit .btn-container').children('.notice').removeClass('hide');
        fm.poiName.focus();
        return false;
    }
    if ('' === $.trim($('input[name=poiStartH]').val())
            || '' === $.trim($('input[name=poiStartM]').val())
            || '' === $.trim($('input[name=poiStartS]').val())
            || '' === $.trim($('input[name=poiEndH]').val())
            || '' === $.trim($('input[name=poiEndM]').val())
            || '' === $.trim($('input[name=poiEndS]').val())) {
        $('#poi-edit .invalid-notice').removeClass('hide');
        return false;
    }
    if (isNaN($('input[name=poiStartH]').val())
            || isNaN($('input[name=poiStartM]').val())
            || isNaN($('input[name=poiStartS]').val())
            || isNaN($('input[name=poiEndH]').val())
            || isNaN($('input[name=poiEndM]').val())
            || isNaN($('input[name=poiEndS]').val())) {
        $('#poi-edit .invalid-notice').removeClass('hide');
        return false;
    }
    if (startH > 356400 || startH < 0) {
        $('#poi-edit .invalid-notice').removeClass('hide');
        $('input[name=poiStartH]').focus();
        return false;
    }
    if (startM >= 3600 || startM < 0) {
        $('#poi-edit .invalid-notice').removeClass('hide');
        $('input[name=poiStartM]').focus();
        return false;
    }
    if (startS >= 60 || startS < 0) {
        $('#poi-edit .invalid-notice').removeClass('hide');
        $('input[name=poiStartS]').focus();
        return false;
    }
    if (endH > 356400 || endH < 0) {
        $('#poi-edit .invalid-notice').removeClass('hide');
        $('input[name=poiEndH]').focus();
        return false;
    }
    if (endM >= 3600 || endM < 0) {
        $('#poi-edit .invalid-notice').removeClass('hide');
        $('input[name=poiEndM]').focus();
        return false;
    }
    if (endS >= 60 || endS < 0) {
        $('#poi-edit .invalid-notice').removeClass('hide');
        $('input[name=poiEndS]').focus();
        return false;
    }
    if (startTime >= endTime || startTime >= duration || endTime > duration || endTime <= 0) {
        $('#poi-edit .invalid-notice').removeClass('hide');
        return false;
    }
    if (startTime < videoStart || startTime > videoEnd || endTime > videoEnd || endTime < videoStart) {
        $('#poi-edit .playback-notice').removeClass('hide');
        return false;
    }
    $.each(poiList, function (i, poiItem) {
        if ($('#cur-poi-edit').hasClass('edit') && poiItem.id == poiPointId) {
            // NOTE: Returning non-false is the same as a continue statement in a for loop
            return true;
        }
        if (!(startTime > poiItem.endTime || poiItem.startTime > endTime)) {
            $('#poi-edit .overlap-notice #poi-name').text(poiItem.name);
            $('#poi-edit .overlap-notice .time').text('(' + formatDuration(poiItem.startTime, true) + ' to ' + formatDuration(poiItem.endTime, true) + ')');
            $('#poi-edit .overlap-notice').removeClass('hide');
            // NOTE: return false here is break the $.each() loop, not form return
            return false;
        }
    });
    if (!$('#poi-edit .overlap-notice').hasClass('hide')) {
        return false;
    }
    $('#poiStartTime').val(startTime);
    $('#poiEndTime').val(endTime);
    $('#poi-point-edit-wrap').data('starttime', startTime);
    if ('undefined' !== typeof youTubePlayerObj
            && 'object' === $.type(youTubePlayerObj)
            && 'function' === $.type(youTubePlayerObj.loadVideoById)) {
        youTubePlayerObj.seekTo(startTime, true);
        youTubePlayerObj.pauseVideo();
    }
    // notice reset
    $('#cur-poi-edit .edit-form .notice').addClass('hide');
    return true;
}

function chkPoiEventData(fm, callback) {
    fm.displayText.value = $.trim(fm.displayText.value);
    fm.btnText.value = $.trim(fm.btnText.value);
    if ('' === fm.displayText.value || '' === fm.btnText.value) {
        $('#poi-event-overlay .event .func ul li.notice').show();
        callback(false);
        return false;
    }
    if (!fm.channelUrl) {
        // notice and url reset
        $('#poi-event-overlay .event .func ul li.notice').hide();
        callback(true);
        return true;
    } else {
        fm.channelUrl.value = $.trim(fm.channelUrl.value);
        if ('' === fm.channelUrl.value) {
            $('#poi-event-overlay .event .func ul li.notice').show();
            callback(false);
            return false;
        }
        if (nn._([CMS_CONF.PAGE_ID, 'poi-event', 'Input 9x9 channel or episode URL']) === fm.channelUrl.value) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        var url = $.url(fm.channelUrl.value),
            hash = '',
            param = '',
            cid = '',
            eid = '',
            normalUrl = 'http://www.9x9.tv/view?';
            pathAllow = ['/', '/view', '/playback'],
            hostAllow = [
                'www.9x9.tv',
                'beagle.9x9.tv',
                'v3alpha.9x9.tv',
                'dev.teltel.com',
                'demo.doubleservice.com',
                'localhost'
            ];
        if (CMS_CONF.USER_URL && -1 === $.inArray(CMS_CONF.USER_URL.attr('host'), hostAllow)) {
            hostAllow.push(CMS_CONF.USER_URL.attr('host'));
        }
        if (-1 === $.inArray(url.attr('host'), hostAllow)) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        if (-1 === $.inArray(url.attr('path'), pathAllow)) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        if ('/' == url.attr('path') && '' == url.attr('fragment')) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        if ('/view' == url.attr('path') && '' == url.attr('query')) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        if ('/playback' == url.attr('path') && '' == url.attr('query')) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        if ('' != url.attr('fragment')) {
            hash = url.attr('fragment').substr(1).replace(/\!/g, '&');
            if (isNaN(hash)) {
                url = $.url('http://fake.url.dev.teltel.com/?' + hash);
            } else {
                cid = hash;
            }
        }
        if ('' != url.attr('query')) {
            param = url.param();
            if ((param.ch && '' != param.ch) || (param.channel && '' != param.channel)) {
                cid = (param.ch && '' != param.ch) ? param.ch : param.channel;
            }
            if ((param.ep && '' != param.ep) || (param.episode && '' != param.episode)) {
                eid = (param.ep && '' != param.ep) ? param.ep : param.episode;
                if (11 != eid.length) {
                    eid = eid.substr(1);
                }
            }
        }
        if ('' == cid) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
            nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        });
        if ('' == eid || 11 == eid.length) {
            nn.api('GET', CMS_CONF.API('/api/channels/{channelId}', {channelId: cid}), null, function (channel) {
                if (channel.id && cid == channel.id) {
                    if (11 == eid.length) {
                        nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + eid + '?alt=jsonc&v=2&callback=?', null, function (youtubes) {
                            if (youtubes.data) {
                                // notice and url reset
                                $('#poi-event-overlay .event .func ul li.notice').hide();
                                normalUrl = normalUrl + 'ch=' + cid + '&ep=' + eid;
                                fm.channelUrl.value = normalUrl;
                                callback(true);
                                return true;
                            } else {
                                $('#poi-event-overlay .event .event-input .fminput .notice').show();
                                callback(false);
                                return false;
                            }
                        }, 'jsonp');
                    } else {
                        // notice and url reset
                        $('#poi-event-overlay .event .func ul li.notice').hide();
                        normalUrl = normalUrl + 'ch=' + cid;
                        fm.channelUrl.value = normalUrl;
                        callback(true);
                        return true;
                    }
                } else {
                    $('#poi-event-overlay .event .event-input .fminput .notice').show();
                    callback(false);
                    return false;
                }
            });
        } else {
            nn.api('GET', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: eid}), null, function (episode) {
                if (episode.id && eid == episode.id && cid == episode.channelId) {
                    // notice and url reset
                    $('#poi-event-overlay .event .func ul li.notice').hide();
                    normalUrl = normalUrl + 'ch=' + cid + '&ep=e' + eid;
                    fm.channelUrl.value = normalUrl;
                    callback(true);
                    return true;
                } else {
                    $('#poi-event-overlay .event .event-input .fminput .notice').show();
                    callback(false);
                    return false;
                }
            });
        }
    }
}

function setVideoMeasure() {
    var windowHeight = $(window).height(),
        windowWidth = $(window).width(),
        epcurateNavHeight = 46,
        epcurateTabsHeight = 38,
        videoControlHeight = 44,
        storyboardHeight = 171,                             // exclude auto-height
        btnsHeight = 48,
        extraHeightMin = 18 * 4,
        videoWidthMin = 400,
        videoHeightMin = 269,                               // 225(400/16*9) + 44(videoControlHeight)
        remainHeight = windowHeight - epcurateNavHeight - epcurateTabsHeight - videoControlHeight - storyboardHeight - btnsHeight - extraHeightMin,
        remainBase = parseInt(remainHeight / 9),
        remainBaseWidth = remainBase * 16,
        remainBaseHeight = remainBase * 9,
        videoBase = parseInt((windowWidth - 616) / 16),     // 616: 1016-400 min window width - min video width
        videoBaseWidth = videoBase * 16,
        videoBaseHeight = videoBase * 9;
    if (windowWidth < 1016) {
        $('#epcurate-curation #video-player .video').height(videoHeightMin);
        $('#epcurate-curation #video-player .video').width(videoWidthMin);
        $('#epcurate-curation ul.tabs').css('padding-left', videoWidthMin + 'px');
    }
    if (windowWidth >= 1016) {
        if (remainHeight < videoHeightMin) {
            $('#epcurate-curation #video-player .video').height(videoHeightMin);
            $('#epcurate-curation #video-player .video').width(videoWidthMin);
            $('#epcurate-curation ul.tabs').css('padding-left', videoWidthMin + 'px');
        } else {
            if (remainHeight < videoBaseHeight) {
                $('#epcurate-curation #video-player .video').height(remainBaseHeight + videoControlHeight);
                $('#epcurate-curation #video-player .video').width(remainBaseWidth);
                $('#epcurate-curation ul.tabs').css('padding-left', remainBaseWidth + 'px');
            } else {
                $('#epcurate-curation #video-player .video').height(videoBaseHeight + videoControlHeight);
                $('#epcurate-curation #video-player .video').width(videoBaseWidth);
                $('#epcurate-curation ul.tabs').css('padding-left', videoBaseWidth + 'px');
            }
        }
    }
    $('#video-player').data('width', $('#video-player .video').width());
    $('#video-player').data('height', $('#video-player .video').height());
    $('#epcurate-curation .tab-content').height($('#video-player').data('height'));
}

function setSpace() {
    var windowHeight = $(window).height(),
        epcurateNavHeight = 46,
        epcurateTabsHeight = 38,
        videoHeight = $('#epcurate-curation #video-player .video').height(),
        videoHeightMin = 269,
        videoControlHeight = 44,
        storyboardHeight = 171,
        btnsHeight = 48,
        extraHeight = windowHeight - epcurateNavHeight - epcurateTabsHeight - videoHeight - storyboardHeight - btnsHeight,
        extraHeightSrc = extraHeight,
        extraHeightMin = 18 * 4,
        contentWrapHeight = epcurateTabsHeight + videoHeight + storyboardHeight + btnsHeight,
        contentWrapHeightMin = epcurateTabsHeight + videoHeightMin + storyboardHeight + btnsHeight + extraHeightMin,
        titlecardHeight = videoHeight - videoControlHeight,
        windowWidth = $(window).width(),
        videoWidth = $('#epcurate-curation #video-player .video').width(),
        curAddWidth = $('#epcurate-curation #cur-add').width(),
        curEditWidth = $('#epcurate-curation #cur-edit').width(),
        episodeInfoWidth = $('#storyboard .storyboard-info .episode-storyboard').width(),
        channelTitleWidth = $('#storyboard .storyboard-info .channel-name .title').width(),
        episodeTitleWidth = $('#storyboard .storyboard-info .episode-name .title').width();
    if (extraHeightSrc < extraHeightMin) {
        extraHeight = extraHeightMin;
    }
    contentWrapHeight = contentWrapHeight + extraHeight;
    $('p.auto-height').height(extraHeight / 4);
    $('#storyboard-slider').css('bottom', extraHeight / 4 + 'px');
    $('#storyboard-slider').width(windowWidth - 30);
    $('#storyboard-slider').attr('data-orig-slider-width', windowWidth - 30);
    $('.video .canvas').width('100%');
    $('.video .canvas').height(titlecardHeight);

    if (windowWidth > 1016) {
        $('#epcurate-curation #cur-add, #cur-poi, #cur-poi-edit').css('padding-left', (windowWidth - videoWidth - curAddWidth) / 2 + 'px');
        $('#epcurate-curation #cur-edit').css('padding-left', (windowWidth - videoWidth - curEditWidth) / 2 + 'px');
    } else {
        $('#epcurate-curation #cur-add, #cur-poi, #cur-poi-edit').css('padding-left', '32px');
        $('#epcurate-curation #cur-edit').css('padding-left', '32px');
    }
    // curation nav width
    if (windowWidth < 1024) {
        $('#epcurate-nav ul').css('width', '256px');
        $('#epcurate-nav ul li').css('width', '128px');
    }
    if (windowWidth >= 1024 && windowWidth <= 1252) {
        $('#epcurate-nav ul').css('width', (windowWidth - 768) + 'px');
        $('#epcurate-nav ul li').css('width', (windowWidth - 768) / 2 + 'px');
    }
    if (windowWidth > 1252) {
        $('#epcurate-nav ul').css('width', '484px');
        $('#epcurate-nav ul li').css('width', '242px');
    }
    if (contentWrapHeight <= contentWrapHeightMin) {
        $('#content-wrap').height(contentWrapHeightMin);
        $('body').css('overflow', 'auto');
    } else {
        $('#content-wrap').height(contentWrapHeight);
        if (extraHeightSrc < extraHeightMin && extraHeightSrc > 0) {
            $('body').css('overflow', 'auto');
        } else {
            $('body').css('overflow', 'hidden');
        }
    }
    $('#channel-name, #episode-name').width((windowWidth - episodeInfoWidth - 34 - 50 - channelTitleWidth - episodeTitleWidth - 10) / 2);
    $('#channel-name').text($('#channel-name').data('meta')).addClass('ellipsis').ellipsis();
    $('#episode-name').text($('#episode-name').data('meta')).addClass('ellipsis').ellipsis();
    $('#channel-name, #episode-name').width('auto');
}

function loadYouTubeFlash(videoId, isChromeless, videoWrap) {
    $('#poi-event-overlay .wrap .content .video-wrap .video').empty();
    removeTitleCardPlayingHook();
    if (videoId && '' != videoId) {
        var videoHook = '#video-player .video',
            videoDomId = 'youTubePlayer',
            videoWidth = $('#video-player .video').width(),
            videoHeight = $('#video-player .video').height(),
            videoUrl = 'http://www.youtube.com/v/' + videoId + '?version=3&enablejsapi=1&autohide=0&fs=0&playerapiid=player';
        if (isChromeless) {
            videoUrl = 'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=playerChrome';
            $('html').addClass('youtube-chromeless');
        } else {
            $('html').removeClass('youtube-chromeless');
        }
        if (videoWrap) {
            videoHook = videoWrap;
            videoDomId = 'youTubePlayerChrome';
            videoWidth = 590;
            videoHeight = 332;
        }
        $(videoHook).flash({
            id: videoDomId,
            swf: videoUrl,
            style: 'vertical-align: middle;',
            width: videoWidth,
            height: videoHeight,
            hasVersion: 9,
            allowScriptAccess: 'always',
            allowFullScreen: false,
            quality: 'high',
            menu: false,
            bgcolor: '#000000',
            //wmode: 'transparent',
            flashvars: false
        });
        $('#video-player #video-control').hide();
        $('#video-player .video').removeClass('transparent');
    }
}

function loadYouTubeChrome(videoId, videoWrap) {
    loadYouTubeFlash(videoId, true, videoWrap);
}

function loadVideo() {
    if ($('#storyboard-listing li.playing').length > 0
            && 'undefined' !== typeof youTubePlayerObj
            && 'object' === $.type(youTubePlayerObj)
            && 'function' === $.type(youTubePlayerObj.loadVideoById)) {
        youTubePlayerObj.loadVideoById({
            'videoId': $('#storyboard-listing li.playing').data('ytid'),
            'startSeconds': $('#storyboard-listing li.playing').data('starttime'),
            'endSeconds': ($('#storyboard-listing li.playing').data('endtime') == $('#storyboard-listing li.playing').data('ytduration')) ? 0 : $('#storyboard-listing li.playing').data('endtime')
        });
    }
}

function onYouTubePlayerReady(playerId) {
    // NO DECLARE var youTubePlayerObj ON PURPOSE to let it be global
    if (playerId == 'player') {
        youTubePlayerObj = document.getElementById('youTubePlayer');
    } else {
        youTubePlayerObj = document.getElementById('youTubePlayerChrome');
    }
    youTubePlayerObj.addEventListener('onStateChange', 'onYouTubePlayerStateChange');
    loadVideo();
}

function onYouTubePlayerStateChange(newState) {
    var playing = $('#storyboard-list li.playing'),
        nextPlaying = $('#storyboard-list li.next-playing'),
        videoId = nextPlaying.data('ytid'),
        opts = null,
        nextOpts = null,
        starttime = playing.data('starttime');
    // unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
    if (-1 == newState) {
        youTubePlayerObj.playVideo();
    }
    if (1 == newState && ($('body').hasClass('from-trim-time-edit')
            || $('body').hasClass('from-trim-time-edit-ending') 
            || $('body').hasClass('from-poi-edit-mode')
            || $('body').hasClass('from-poi-overlay-edit-mode'))) {
        $('body').removeClass('from-trim-time-edit');
        $('body').removeClass('from-trim-time-edit-ending');
        $('body').removeClass('from-poi-edit-mode');
        $('body').removeClass('from-poi-overlay-edit-mode');
        if ($('#cur-poi-edit').length > 0 && !$('#cur-poi-edit').hasClass('hide')) {
            starttime = $('#poi-point-edit-wrap').data('starttime');
        }
        youTubePlayerObj.seekTo(starttime, true);
        youTubePlayerObj.pauseVideo();
    }
    if (0 == newState) {
        if ($('#storyboard-listing li.trim-time').length > 0) {
            $('body').addClass('from-trim-time-edit-ending');
            loadYouTubeFlash($('#storyboard-listing li.trim-time').data('ytid'));
            return false;
        }
        if ($('body').hasClass('enter-poi-edit-mode')) {
            $('body').addClass('from-poi-edit-mode');
            loadYouTubeFlash(playing.data('ytid'));
            return false;
        }
        if ($('#storyboard-list li.playing').length <= 0 && $('#storyboard-list li.next-playing').length <= 0) {
            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
        } else {
            if (playing.children('.title').children('a.end-title').length > 0) {
                opts = playing.tmplItem().data.endTitleCard;
                removeTitleCardPlayingHook();
                addTitleCardPlayingHook(playing, 'end');
                cancelTitleCard();
                wrapTitleCardCanvas();
                $('#video-player .video .canvas').titlecard(adaptTitleCardOption(opts), function () {
                    if ($('#storyboard-list li.next-playing').length <= 0) {
                        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                    } else {
                        playTitleCardAndVideo(nextPlaying);
                    }
                });
                animateTitleCardProgress(opts);
            } else {
                if ($('#storyboard-list li.next-playing').length <= 0) {
                    $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                } else {
                    playTitleCardAndVideo(nextPlaying);
                }
            }
        }
    }
}

function buildVideoInfoTmpl(element) {
    // video-info-tmpl
    if (element && element.tmplItem() && element.tmplItem().data && element.tmplItem().data.name) {
        var videoInfoData = element.tmplItem().data,
            startTimeInt = videoInfoData.startTime,
            endTimeInt = (videoInfoData.endTime > 0) ? videoInfoData.endTime : videoInfoData.duration,
            trimStartTime = formatDuration(startTimeInt, true).split(':'),
            trimEndTime = formatDuration(endTimeInt, true).split(':'),
            trimDuration = formatDuration((endTimeInt - startTimeInt), true).split(':'),
            options = {
                startHMS: formatDuration(startTimeInt),
                startH: trimStartTime[0],
                startM: trimStartTime[1],
                startS: trimStartTime[2],
                endHMS: formatDuration(endTimeInt),
                endH: trimEndTime[0],
                endM: trimEndTime[1],
                endS: trimEndTime[2],
                totalH: trimDuration[0],
                totalM: trimDuration[1],
                totalS: trimDuration[2],
                uploadDateConverter: function (uploadDate) {
                    var datetemp = uploadDate.split('T');
                    return datetemp[0];
                }
            };
        $('#video-info').html('');
        $('#video-info-tmpl').tmpl(videoInfoData, options).prependTo('#video-info');
        $('.ellipsis').ellipsis();
        $('.set-time input.time').autotab({
            format: 'numeric'
        });
        buildPoiInfoTmpl(element);
    }
}

function buildPoiInfoTmpl(element) {
    // poi-info-tmpl
    if (element && element.tmplItem() && element.tmplItem().data && element.tmplItem().data.poiList) {
        var videoInfoData = element.tmplItem().data,
            startTimeInt = videoInfoData.startTime,
            endTimeInt = (videoInfoData.endTime > 0) ? videoInfoData.endTime : videoInfoData.duration,
            trimStartTime = formatDuration(startTimeInt, true).split(':'),
            trimEndTime = formatDuration(endTimeInt, true).split(':'),
            trimDuration = formatDuration((endTimeInt - startTimeInt), true).split(':'),
            itemSize = getPoiItemSize(),
            options = {
                itemSize: itemSize,
                startHMS: formatDuration(startTimeInt),
                startH: trimStartTime[0],
                startM: trimStartTime[1],
                startS: trimStartTime[2],
                endHMS: formatDuration(endTimeInt),
                endH: trimEndTime[0],
                endM: trimEndTime[1],
                endS: trimEndTime[2],
                totalH: trimDuration[0],
                totalM: trimDuration[1],
                totalS: trimDuration[2],
                uploadDateConverter: function (uploadDate) {
                    var datetemp = uploadDate.split('T');
                    return datetemp[0];
                }
            },
            poiList = videoInfoData.poiList,
            poiPage = [],
            poiItem = [];
        $('#cur-poi').html('');
        $('#poi-info-tmpl').tmpl(videoInfoData, options).prependTo('#cur-poi');
        $('.ellipsis').ellipsis();
        if (poiList && poiList.length > 0) {
            $.each(poiList, function (i, item) {
                if (poiItem.length > 0 && i % itemSize == 0) {
                    poiPage.push({poiItem: poiItem});
                    poiItem = [];
                }
                poiItem.push(item);
            });
            if (poiItem.length > 0) {
                poiPage.push({poiItem: poiItem});
                poiItem = [];
            }
        }
        $('#poi-list-page').html('');
        $('#poi-list-page-tmpl').tmpl(poiPage).prependTo('#poi-list-page');
        countPoiItem();
        // POI cycle
        $('#cur-poi .poi-list .prev, #cur-poi .poi-list .next').hide();
        $('#cur-poi .poi-list ul').cycle('destroy');
        $('#cur-poi .poi-list ul').cycle({
            activePagerClass: 'active',
            updateActivePagerLink: null,
            next: '#cur-poi .poi-list .next',
            prev: '#cur-poi .poi-list .prev',
            fx: 'scrollHorz',
            before: function () {
                $('#cur-poi .poi-list .prev, #cur-poi .poi-list .next').hide();
            },
            after: function (curr, next, opts) {
                var index = opts.currSlide;
                $('#cur-poi .poi-list .prev')[index == 0 ? 'hide' : 'show']();
                $('#cur-poi .poi-list .next')[index == opts.slideCount - 1 ? 'hide' : 'show']();
            },
            speed: 1000,
            timeout: 0,
            pause: 1,
            cleartypeNoBg: true
        });
    }
}

function buildPoiPointEditTmpl(poi_point) {
    var videoData = $('#storyboard-list li.playing').tmplItem().data,
        optionData = {},
        poiPointEventData = poi_point || {},
        videoStartTime = videoData.startTime,
        videoEndTime = (videoData.endTime > 0) ? videoData.endTime : videoData.duration,
        poiStartTime = videoStartTime,
        poiEndTime = videoEndTime;
    poiPointEventData = $.extend({
        id: 0,
        targetId: (videoData.id) ? videoData.id : 0,
        type: 5,
        name: '',
        startTime: poiStartTime,
        endTime: poiEndTime,
        tag: ''
    }, poiPointEventData);
    videoStartTime = formatDuration(videoStartTime, true).split(':');
    videoEndTime = formatDuration(videoEndTime, true).split(':');
    poiStartTime = formatDuration(poiPointEventData.startTime, true).split(':');
    poiEndTime = formatDuration(poiPointEventData.endTime, true).split(':');
    optionData = {
        poiStartH: poiStartTime[0],
        poiStartM: poiStartTime[1],
        poiStartS: poiStartTime[2],
        poiEndH: poiEndTime[0],
        poiEndM: poiEndTime[1],
        poiEndS: poiEndTime[2],
        videoName: videoData.name,
        startH: videoStartTime[0],
        startM: videoStartTime[1],
        startS: videoStartTime[2],
        endH: videoEndTime[0],
        endM: videoEndTime[1],
        endS: videoEndTime[2]
    };
    $('#cur-poi-edit').html('');
    $('#poi-point-edit-tmpl').tmpl(poiPointEventData, optionData).prependTo('#cur-poi-edit');
    $('#poi-edit').html('');
    $('#poi-point-tmpl').tmpl(poiPointEventData, optionData).prependTo('#poi-edit');
    $('#poi-edit input.time').autotab({
        format: 'numeric'
    });
}

function buildPoiEventOverlayTmpl(poi_event) {
    var videoData = $('#storyboard-list li.playing').tmplItem().data,
        poiPointEventData = poi_event || {},
        poiEventTypeKey = '';
    poiPointEventData = $.extend({
        id: 0,
        targetId: (videoData.id) ? videoData.id : 0,
        type: 5,
        eventId: 0,
        eventType: 0,
        message: '',
        button: '',
        link: '',
        notifyMsg: '',
        notifyScheduler: ''
    }, poiPointEventData);
    $('#poi-event-overlay .wrap').html('');
    $('#poi-event-overlay-tmpl').tmpl(poiPointEventData).prependTo('#poi-event-overlay .wrap');
    $.blockUI({
        message: $('#poi-event-overlay'),
        onBlock: function () {
            $('#poi-event-overlay .event').addClass('hide');
            if ($('#cur-poi-edit').hasClass('edit')) {
                $('#poi-event-overlay').addClass('edit');
                poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey');
                $('#' + poiEventTypeKey).removeClass('hide');
                playPoiEventAndVideo(poiEventTypeKey);
            } else {
                $('#poi-event-overlay').removeClass('edit');
                $('#event-select').removeClass('hide');
            }
            $('#poi-event-overlay .datepicker').datepick({
                changeMonth: false,
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                minDate: +0,
                multiSelect: 999,
                onSelect: function (dateText, inst) {
                    $('body').addClass('has-poi-change');
                    $('body').addClass('has-change');
                }
            });
            $('#schedule-mobile .notification .time .hour').perfectScrollbar();
        }
    });
}

function playPoiEventAndVideo(type) {
    if ('' != type && isNaN(type) && CMS_CONF.POI_TYPE_MAP[type]) {
        $('#poi-event-overlay-wrap').data('poiEventType', CMS_CONF.POI_TYPE_MAP[type]['code']);
        $('#poi-event-overlay-wrap').data('poiEventTypeKey', type);
        $('body').addClass('from-poi-overlay-edit-mode');
        $('#poi-event-overlay .wrap .content .video-wrap .video').empty();
        loadYouTubeChrome($('#storyboard-listing li.playing').data('ytid'), '#' + type + '-video');
        $('#poi-event-overlay .event .video-wrap .poi-display').empty();
        var displayText = strip_tags($.trim($('#poi-event-overlay #' + type + ' input[name=displayText]').val())),
            buttonsText = strip_tags($.trim($('#poi-event-overlay #' + type + ' input[name=btnText]').val()));
        if ('' == displayText) {
            displayText = 'Input display text';
        }
        if ('' == buttonsText) {
            buttonsText = 'Input button text';
        }
        $('#poi-event-overlay #' + type + ' .video-wrap .poi-display').poi({
            type: CMS_CONF.POI_TYPE_MAP[type]['plugin'],
            displayText: displayText,
            buttons: [buttonsText],
            duration: -1
        });
    } else {
        nn.log('POI type error!', 'error');
    }
}

function playTitleCardAndVideo(element) {
    if (element && element.children('.title').children('a.begin-title').length > 0) {
        var opts = element.tmplItem().data.beginTitleCard;
        if (opts && opts.message) {
            removeTitleCardPlayingHook();
            addTitleCardPlayingHook(element, 'begin');
            cancelTitleCard();
            buildVideoInfoTmpl(element);
            wrapTitleCardCanvas();
            $('#video-player .video .canvas').titlecard(adaptTitleCardOption(opts), function () {
                loadYouTubeFlash(element.data('ytid'));
            });
            animateTitleCardProgress(opts);
            removeVideoPlayingHook();
            addVideoPlayingHook(element);
        }
    } else if (element) {
        buildVideoInfoTmpl(element);
        loadYouTubeFlash(element.data('ytid'));
        removeVideoPlayingHook();
        addVideoPlayingHook(element);
    }
}

function animateTitleCardProgress(opts) {
    if (!opts || !opts.duration) {
        return;
    }
    var duration = opts.duration,
        width = $('#video-player .video').width();
    $('#video-control').show();
    $('#btn-play').addClass('hide');
    $('#btn-pause').removeClass('hide');
    //$('#btn-pause').data('opts', opts);
    $('#play-time .duration').text(formatDuration(duration));
    $('#play-dragger').animate({
        left: '+=' + parseInt(width - 18, 10)   // 18:drag icon width
    }, parseInt(duration * 1000, 10), function () {
        $('#play-dragger').css('left', '0');
    });
    $('#played').animate({
        width: '+=' + width
    }, parseInt(duration * 1000, 10), function () {
        $('#played').css('width', '0');
        $('#play-time .played').countdown('destroy');
        $('#play-time .played').text('00:00');
    });
    $('#play-time .played').countdown('destroy');
    $('#play-time .played').countdown({
        since: -1,
        compact: true,
        format: 'MS',
        description: ''
    });
}

function cancelTitleCard() {
    $('#video-player .video .canvas').titlecard('cancel');
    $('#play-time .played').countdown('destroy');
    $('#btn-play').removeClass('hide');
    $('#btn-pause').addClass('hide').removeData('opts');    // NOTE: removeData('opts')
    $('#play-dragger').clearQueue().stop().css('left', '0');
    $('#played').clearQueue().stop().css('width', '0');
}

function wrapTitleCardCanvas() {
    $('#video-player .video').html('<div class="canvas"></div>');
    $('#video-player .video .canvas').hide().css('height', $('#video-player').height() - 44).show();    // 44: $('#video-control')
}

function adaptTitleCardOption(opts) {
    if (!opts || !opts.message) {
        opts = CMS_CONF.TITLECARD_DEFAULT_OPTION;
    }
    var option = {
        text: opts.message,
        align: opts.align,
        effect: opts.effect,
        duration: opts.duration,
        fontSize: opts.size,
        fontColor: opts.color,
        fontStyle: opts.style,
        fontWeight: opts.weight,
        backgroundColor: opts.bgColor,
        backgroundImage: opts.bgImage
    };
    return option;
}

function computeTitleCardEditOption() {
    var option = {
        message: strip_tags($.trim($('#text').val())),
        align: $('#cur-edit .edit-title input[name=align]:checked').val(),
        effect: $('#effect').val(),
        duration: $('#duration').val(),
        size: $('#fontSize').val(),
        color: $('#fontColor').val(),
        style: ($('#cur-edit .edit-title input[name=fontStyle]:checked').length > 0) ? 'italic' : 'normal',
        weight: ($('#cur-edit .edit-title input[name=fontWeight]:checked').length > 0) ? 'bold' : 'normal',
        bgColor: $('#backgroundColor').val(),
        bgImage: ('image' == $('#cur-edit .edit-title input[name=bg]:checked').val() && '' != $('#backgroundImage').val()) ? $('#backgroundImage').val() : ''
    };
    return option;
}

function enableTitleCardEdit() {
    $('#cur-edit .edit-title').removeClass('disable');
    $('#cur-edit .select').attr('class', 'select enable');
    $('#cur-edit input, #cur-edit textarea').removeAttr('disabled');
    $.uniform.update('#cur-edit input, #cur-edit textarea');
    $('#cur-edit .font-container .font-l, #cur-edit .font-container .font-s').removeClass('disabled').addClass('enable');
}

function disableTitleCardEdit() {
    $('#cur-edit .edit-title').addClass('disable');
    $('#cur-edit .select').attr('class', 'select disable');
    $('#cur-edit input, #cur-edit textarea').attr('disabled', 'disabled');
    $.uniform.update('#cur-edit input, #cur-edit textarea');
    $('#cur-edit .font-container .font-l, #cur-edit .font-container .font-s').removeClass('enable').addClass('disabled');
}

function buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit) {
    $('.edit-title').html($('#titlecard-edit-tmpl').tmpl(opts, {
        isUpdateMode: isUpdateMode
    }));
    uploadImage(isDisableEdit);
    $('#cur-edit input, #cur-edit textarea, #cur-edit select').uniform();
    switchFontRadix($('#fontSize').val());
    switchFontAlign($('#cur-edit .edit-title input[name=align]:checked').val());
    switchBackground($('#cur-edit .edit-title input[name=bg]:checked').val(), $('#cur-edit .edit-title input[name=bg]:checked').attr('name'));
}

function buildTitleCardTmpl(opts) {
    if (opts && opts.message) {
        $('#video-player .video').html($('#titlecard-tmpl').tmpl(opts, {
            message: nl2br(strip_tags($.trim(opts.message))),
            outerHeight: ($('#epcurate-curation #video-player .video').height() - 44),  // 44: $('#video-control')
            fontSize: Math.round($('#epcurate-curation #video-player .video').width() / opts.size)
        }));
        $('#play-time .played').text('00:00');
        $('#play-time .duration').text(formatDuration(opts.duration));
        verticalAlignTitleCard();
    }
}

function addVideoPlayingHook(element) {
    element.addClass('playing');
    element.next().addClass('next-playing');
}

function removeVideoPlayingHook() {
    $('#storyboard li').removeClass('playing').removeClass('next-playing');
}

function addTrimTimeEditHook() {
    $('#storyboard-listing li.playing').addClass('trim-time');
}

function removeTrimTimeEditHook() {
    $('#storyboard li').removeClass('trim-time');
}

function enableTrimTimeEdit() {
    $('#cur-edit p.time').removeClass('disable');
    $('#cur-edit input.time').removeAttr('disabled');
    $('#cur-edit .set-time .total-time').addClass('hide');
    $('#cur-edit .btn-wrap .btns').removeClass('hide');
    $('#cur-edit .btn-wrap .btn-edit').addClass('hide');
}

function disableTrimTimeEdit() {
    $('#cur-edit p.time').addClass('disable');
    $('#cur-edit input.time').attr('disabled', 'disabled');
    $('#cur-edit .set-time .total-time').removeClass('hide');
    $('#cur-edit .btn-wrap .btns').addClass('hide');
    $('#cur-edit .btn-wrap .btn-edit').removeClass('hide');
    $('#cur-edit .edit-time .btn-wrap .notice').hide();
}

function addTitleCardPlayingHook(element, pos) {
    element.children('.title').children('a.' + pos + '-title').addClass('playing');
}

function removeTitleCardPlayingHook() {
    $('#storyboard li .title a').removeClass('playing');
}

function addTitleCardEditHook(element) {
    element.parent().parent().addClass('edit');                     // parent li
    element.addClass('edit');                                       // self a (begin-title or end-title)
}

function removeTitleCardEditHook() {
    $('#storyboard-list li').removeClass('edit');
    $('#storyboard-list li p.title a').removeClass('edit');
    $('#storyboard-list li p.hover-func a').removeClass('edit');
}

function removeTotalChangeHook() {
    $('body').removeClass('has-change');
    $('body').removeClass('has-trimtime-change');
    $('body').removeClass('has-poi-change');
    $('body').removeClass('has-titlecard-change');
}

function animateStoryboard(add) {
    var list = $('#storyboard-listing li').length,
        distance = (list + add) * 2,
        windowWidth = $(window).width(),
        storyboardMove = distance / 100 * (5700 - windowWidth + 17);
    if ((list + add) > 8) {
        $('.ui-slider-handle').animate({'left': '+' + distance + '%'}, 'slow');
        $('#storyboard-list').animate({'left': '-' + storyboardMove + 'px'}, 'slow');
    }
}

function sumStoryboardInfo() {
    var length = $('#storyboard-list li').length,
        leftLength = CMS_CONF.PROGRAM_MAX - length,
        duration = 0,
        itemData = null;
    if (isNaN(leftLength) || leftLength < 0) {
        leftLength = 0;
    }
    $('#storyboard-list li').each(function (i) {
        itemData = $(this).tmplItem().data;
        if (parseInt(itemData.ytDuration, 10) > 0) {
            duration += parseInt(itemData.duration, 10);
        }
        if (null !== itemData.beginTitleCard) {
            duration += parseInt(itemData.beginTitleCard.duration, 10);
        }
        if (null !== itemData.endTitleCard) {
            duration += parseInt(itemData.endTitleCard.duration, 10);
        }
    });
    var durationMin = parseInt(duration / 60, 10),
        durationSec = parseInt(duration % 60, 10),
        durationHou = parseInt(durationMin / 60, 10);
    if (durationHou.toString().length < 2) {
        durationHou = '0' + durationHou;
    }
    if (durationMin >= 60) {
        durationMin = parseInt(durationMin % 60, 10);
    }
    if (durationMin.toString().length < 2) {
        durationMin = '0' + durationMin;
    }
    if (durationSec.toString().length < 2) {
        durationSec = '0' + durationSec;
    }
    $('#storyboard-length').text(leftLength);
    $('#storyboard-duration').text(durationHou + ':' + durationMin + ':' + durationSec);
    $('#storyboard-list .notice').css('left', parseInt((114 * length) + 9, 10) + 'px');
    $('#storyboard-listing li').removeClass('last last2');
    $('#storyboard-listing li').eq(48).addClass('last2');
    $('#storyboard-listing li').eq(49).addClass('last');
}

function rebuildVideoNumber(base) {
    base = ('undefined' === typeof base) ? 0 : base;
    $('#storyboard-list li').each(function (i) {
        if ((i + 1) > base) {
            $(this).children('p.order').text(i + 1);
        }
    });
}

function resizeTitleCard() {
    var videoHeight = ($('#video-player').width() / 16) * 9,
        videoPlayerHeight = videoHeight + 44;   // 44: $('#video-control')
    $('#video-player').css('height', videoPlayerHeight + 'px');
    $('#video-player .video').css('height', videoPlayerHeight + 'px');
    $('#video-player .video .titlecard-outer').css('height', videoHeight + 'px');
}

function resizeFromFontRadix() {
    if ($('#titlecard-outer').length > 0) {
        var radix = $('#titlecard-outer').tmplItem().data.size;
        $('#titlecard-inner').css('font-size', Math.round($('#epcurate-curation #video-player .video').width() / radix) + 'pt');
    }
}

function verticalAlignTitleCard() {
    // vertical align
    var wrapWidth = $('#titlecard-outer').width(),
        wrapHeight = (wrapWidth / 16) * 9,
        selfWidth = $('#titlecard-outer').children('.titlecard-middle').children('.titlecard-inner').width(),
        selfHeight = $('#titlecard-outer').children('.titlecard-middle').children('.titlecard-inner').height(),
        selfLeft = 0,
        selfTop = 0;
    if (wrapWidth > selfWidth) {
        selfLeft = (wrapWidth - selfWidth) / 2;
    }
    if (wrapHeight > selfHeight) {
        selfTop = (wrapHeight - selfHeight) / 2;
    }
    $('#titlecard-outer').children('.titlecard-middle').children('.titlecard-inner').css({
        top: selfTop + 'px',
        left: selfLeft + 'px'
    });
}

function setupFontRadix(action) {
    var size = parseInt($('#fontSize').val(), 10),
        width = $('#epcurate-curation #video-player .video').width();
    if ('up' === action) {
        $('.font-container .font-s').removeClass('disable');
        if (size <= CMS_CONF.FONT_RADIX_MIN) {
            $('.font-container .font-l.enable').addClass('disable');
        } else {
            size = size - 1;
            $('#fontSize').val(size);
            $('#titlecard-inner').css('font-size', Math.round(width / size) + 'pt');
            verticalAlignTitleCard();
        }
    } else {
        $('.font-container .font-l').removeClass('disable');
        if (size >= CMS_CONF.FONT_RADIX_MAX) {
            $('.font-container .font-s.enable').addClass('disable');
        } else {
            size = size + 1;
            $('#fontSize').val(size);
            $('#titlecard-inner').css('font-size', Math.round(width / size) + 'pt');
            verticalAlignTitleCard();
        }
    }
}

function switchFontRadix(radix) {
    radix = parseInt(radix, 10);
    $('.font-container .font-l, .font-container .font-s').removeClass('disable');
    if (radix <= CMS_CONF.FONT_RADIX_MIN) {
        $('.font-container .font-l').addClass('disable');
    }
    if (radix >= CMS_CONF.FONT_RADIX_MAX) {
        $('.font-container .font-s').addClass('disable');
    }
}

function switchFontAlign(align) {
    $('#titlecard-inner').css('text-align', align);
}

function switchBackground(bg, name) {
    if ('image' == bg) {
        $('#cur-edit .background-container .bg-color').addClass('hide');
        $('#cur-edit .background-container .bg-img').removeClass('hide');
        $('#titlecard-outer img').show();
    } else {
        $('#cur-edit .background-container .bg-color').removeClass('hide');
        $('#cur-edit .background-container .bg-img').addClass('hide');
        $('#titlecard-outer img').hide();
    }
    $('input[name=' + name + ']').parents('label').removeClass('checked');
    $('input[name=' + name + ']:checked').parents('label').addClass('checked');
}

function cancelEffect(element) {
    element
        .clearQueue()
        .stop()
        .children('span')
            .clearQueue()
            .stop()
            .children('em')
                .clearQueue()
                .stop();
}

function previewEffect(element, effect) {
    var duration = 5000,
        startStandbySec = 500,
        endingStandbySec = 500,
        startSec = 1500,
        endingSec = 1500,
        delaySec = 1000;
    if (-1 !== $.inArray(effect, ['blind', 'clip', 'drop'])) {
        startSec = endingSec = 1000;
    }
    if ('none' === effect) {
        startStandbySec = endingStandbySec = startSec = endingSec = 0;
    }
    delaySec = (duration - startStandbySec - startSec - endingSec - endingStandbySec);
    cancelEffect(element);

    switch (effect) {
    case 'blind':
    case 'clip':
    case 'fold':
    case 'drop':
    case 'bounce':
    case 'explode':
    case 'highlight':
    case 'puff':
    case 'pulsate':
    case 'scale':
    case 'shake':
    case 'slide':
        element.show(startStandbySec).children('span').hide().show(effect, {}, startSec).delay(delaySec).hide(effect, {}, endingSec, function () {
            element.delay(endingStandbySec).show().children('span').show();
        });
        break;
    case 'fade':
        element.show(startStandbySec).children('span').hide().fadeIn(startSec).delay(delaySec).fadeOut(endingSec, function () {
            element.delay(endingStandbySec).show().children('span').show();
        });
        break;
    default:
        // none
        element.children('span').show(0).delay(duration).hide(0, function () {
            element.show().children('span').show();
        });
        break;
    }
}

function getPoiItemSize() {
    return parseInt(($('#video-player').data('height') - 104) / 33);    // 104: 269(video min height)-(33*5)
}

function countPoiItem() {
    $('#cur-poi .poi-list ul').data('item', getPoiItemSize());
    $('#cur-poi .poi-list ul').height($('#cur-poi .poi-list ul').data('item') * 33);
}

function unblockPoiUI() {
    $.unblockUI();  // ready for unblock POI event overlay
    $('body').removeClass('enter-poi-edit-mode');
    $('#storyboard, #content-main-wrap .form-btn, #epcurate-nav ul li.publish').unblock();
    $('#epcurate-nav ul li.publish').removeClass('mask');
    $('#video-player .video').removeClass('transparent');
}

function removePoiTab() {
    $('#epcurate-curation ul.tabs li.poi').addClass('hide');
    $('#epcurate-curation ul.tabs li.edit-poi').addClass('hide');
}

function uploadImage(isDisableEdit) {
    var parameter = {
        'prefix': 'cms',
        'type':   'image',
        'size':   20485760,
        'acl':    'public-read'
    };
    nn.api('GET', CMS_CONF.API('/api/s3/attributes'), parameter, function (s3attr) {
        var timestamp = (new Date()).getTime();
        var handlerSwfUploadLoaded = function () {
            if (isDisableEdit) {
                this.setButtonDisabled(true);
            } else {
                this.setButtonDisabled(false);
            }
        };
        var handlerFileDialogStart = function () {
            $('#btn-pause').trigger('click');
            $('.background-container .highlight').addClass('hide');
        };
        var handlerUploadProgress = function (file, completed /* completed bytes */, total /* total bytes */) {
            $('.background-container p.img .loading').show();
            swfu.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Uploading...']) + '</span>');
        };
        var handlerUploadSuccess = function (file, serverData, recievedResponse) {
            $('.background-container p.img .loading').hide();
            swfu.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
            if (!file.type) {
                file.type = nn.getFileTypeByName(file.name);
            }
            this.setButtonDisabled(false); // enable upload button again
            var url = 'http://' + s3attr['bucket'] + '.s3.amazonaws.com/' + parameter['prefix'] + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase();
            $('#thumbnail-backgroundImage').attr('src', url + '?n=' + Math.random());
            $('#backgroundImage').val(url);
            $('#titlecard-outer img').remove();
            $('#titlecard-outer').append('<img src="' + $('#thumbnail-backgroundImage').attr('src') + '" style="width: 100%; height: 100%; border: none;" />');
        };
        var handlerUploadError = function (file, code, message) {
            $('.background-container p.img .loading').hide();
            swfu.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
            this.setButtonDisabled(false);
            if (code == -280) { // user cancel upload
                alert(message); // show some error prompt
            } else {
                alert(message); // show some error prompt
            }
        };
        var handlerFileQueue = function (file) {
            if (!file.type) {
                file.type = nn.getFileTypeByName(file.name); // Mac Chrome compatible
            }
            var postParams = {
                "AWSAccessKeyId": s3attr['id'],
                "key":            parameter['prefix'] + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase(),
                "acl":            parameter['acl'],
                "policy":         s3attr['policy'],
                "signature":      s3attr['signature'],
                "content-type":   parameter['type'],
                "success_action_status": "201"
            };
            this.setPostParams(postParams);
            this.startUpload(file.id);
            this.setButtonDisabled(true);
        };
        var handlerFileQueueError = function (file, code, message) {
            if (code == -130) { // error file type
                $('.background-container .highlight').removeClass('hide');
            }
        };
        var settings = {
            flash_url:                  'javascripts/swfupload/swfupload.swf',
            upload_url:                 'http://' + s3attr['bucket'] + '.s3.amazonaws.com/', // http://9x9tmp-ds.s3.amazonaws.com/
            file_size_limit:            parameter['size'],
            file_types:                 '*.jpg; *.png; *.gif',
            file_types_description:     'Thumbnail',
            file_post_name:             'file',
            button_placeholder:         $('#uploadThumbnail').get(0),
            button_image_url:           'images/btn-load.png',
            button_width:               '129',
            button_height:              '29',
            button_text:                '<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>',
            button_text_style:          '.uploadstyle { color: #555555; font-family: Arial, Helvetica; font-size: 15px; text-align: center; } .uploadstyle:hover { color: #999999; }',
            button_text_top_padding:    1,
            button_action:              SWFUpload.BUTTON_ACTION.SELECT_FILE,
            button_cursor:              SWFUpload.CURSOR.HAND,
            button_window_mode :        SWFUpload.WINDOW_MODE.TRANSPARENT,
            http_success :              [ 201 ],
            swfupload_loaded_handler:   handlerSwfUploadLoaded,
            file_dialog_start_handler:  handlerFileDialogStart,
            upload_progress_handler:    handlerUploadProgress,
            upload_success_handler:     handlerUploadSuccess,
            upload_error_handler:       handlerUploadError,
            file_queued_handler:        handlerFileQueue,
            file_queue_error_handler:   handlerFileQueueError,
            debug:                      false
        };
        var swfu = new SWFUpload(settings);
    });
}
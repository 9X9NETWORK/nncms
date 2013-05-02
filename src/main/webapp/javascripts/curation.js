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
            $.unblockUI();
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
    $('#unsave-poi-prompt .btn-yes').click(function () {
        $('body').removeClass('has-poi-change');
        leaveEditMode();
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

    // common tabs
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
    // common tabs - Add Video
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
    // common tabs - Edit Video
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
    // common tabs - POI list
    $('#epcurate-curation ul.tabs li a.cur-poi').click(function (e) {
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

    // YouTube tab
    $('.yt-category li a').not('.yt-category li.last a').click(function () {
        var showBlock = $(this).attr('href').split('#');
        $('.yt-category li').removeClass('on');
        $(this).parent().addClass('on');
        $('#cur-youtube .result-list').addClass('hide');
        $('#' + showBlock[1]).removeClass('hide');
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
        if (nn._([CMS_CONF.PAGE_ID, 'add-video', 'Paste YouTube video URLs to add (separate with different lines)']) === videoUrl) {
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
                nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                    committedCnt += 1;
                    invalidList.push(normalList[idx]);
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
                    nn.log(normalList[idx], 'debug');
                    $('#videourl').val(invalidList.join('\n'));
                    $('#cur-add .notice').text(nn._([CMS_CONF.PAGE_ID, 'add-video', 'Invalid URL, please try again!'])).removeClass('hide').show();
                    if (committedCnt === matchList.length) {
                        committedCnt = -1;   // reset to avoid collision
                        animateStoryboard(ytList.length);
                            $('#storyboard-listing-tmpl-item').tmpl(ytList).hide().appendTo('#storyboard-listing').fadeIn(2000);
                            sumStoryboardInfo();
                        rebuildVideoNumber(videoNumberBase);
                            $('.ellipsis').ellipsis();
                            $('#overlay-s').fadeOut();
                    }
                });
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
        $('#cur-poi-edit .content ul li').removeClass('active');
        $('#cur-poi-edit .content ul li:first-child').addClass('active');
        $('#cur-poi-edit .edit-form').removeClass('hide');
        $('#cur-poi-edit #event-edit, #cur-poi-edit .edit-form .notice').addClass('hide');
        return false;
    });
    $('#cur-poi').on('click', '.btn-add-poi a', function () {
        // Add button
        buildPoiEventEditTmpl();
        return false;
    });
    $('#cur-poi').on('click', '.poi-list a.edit', function () {
        // Edit button
        var poiId = $(this).data('poiId'),
            tmplItem = $('#storyboard-listing li.playing').tmplItem(),
            tmplItemData = tmplItem.data,
            poiList = tmplItemData.poiList;
        if ('' != poiId) {
            if (poiId > 0 && !isNaN(poiId)) {
                nn.api('GET', CMS_CONF.API('/api/pois/{poiId}', {poiId: poiId}), null, function (poi) {
                    buildPoiEventEditTmpl(poi);
                });
            } else {
                $.each(poiList, function (i, poi) {
                    if (poi.id == poiId) {
                        buildPoiEventEditTmpl(poi);
                        // NOTE: return false here is break the $.each() loop, not form return
                        return false;
                    }
                });
            }
            // enter edit mode
            $('#cur-poi-edit').addClass('edit');
        }
        return false;
    });

    // Enter POI or event tab from POI | Interactive event tab
    $('#cur-poi-edit').on('click', 'ul li.active a', function (e) {
        e.stopImmediatePropagation();
        return false;
    });
    $('#cur-poi-edit').on('click', 'ul li.event-edit a', function (e) {
        if (!chkPoiData(document.epcurateForm)) {
            e.stopImmediatePropagation();
            return false;
        }
    });
    $('#cur-poi-edit').on('click', 'ul.edit li.poi-edit a', function (e) {
        chkPoiEventData(document.epcurateForm, function (result) {
            if (!result) {
                e.stopImmediatePropagation();
                return false;
            }
        });
    });
    $('#cur-poi-edit').on('click', 'ul li a', function () {
        $('body').addClass('from-poi-edit-mode enter-poi-edit-mode');
        $('#cur-poi-edit ul li').removeClass('active');
        $('#cur-poi-edit .edit-form').addClass('hide');
        $('#cur-poi-edit .edit-form .notice').addClass('hide');
        var showBlock = $(this).attr('href').split('#');
        if ('event-edit' == showBlock[1]) {
            $('#cur-poi-edit ul li.event-edit').addClass('active');
            loadYouTubeChrome($('#storyboard-listing li.playing').data('ytid'));
            $('#video-player .video').addClass('transparent');
            $('#video-player .video').append('<p class="btns btn-zoom"><span><a href="#"><img src="images/icon_zoom.png" alt="" />' + nn._([CMS_CONF.PAGE_ID, 'poi-event', 'Zoom in']) + '</a></span></p>');
        } else {
            $('#cur-poi-edit ul li.poi-edit').addClass('active');
            loadYouTubeFlash($('#storyboard-listing li.playing').data('ytid'));
            $('#video-player .video').removeClass('transparent');
            $('.btn-zoom').remove();
        }
        $('#' + showBlock[1]).removeClass('hide');
        return false;
    });

    // POI click notice reset
    $('#cur-poi-edit').on('click', '.edit-form input, .btn-reset', function () {
        $('#cur-poi-edit .edit-form .notice').addClass('hide');
    });
    $('#cur-poi-edit').on('change', '.edit-form input', function () {
        $('body').addClass('has-poi-change');
    });

    // POI zoom
    $('#video-player .video').on('click', '.btn-zoom', function () {
        $.blockUI({
            message: $('#poi-zoom')
        });
        return false;
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

    // Delete POI
    $('#cur-poi-edit').on('click', '.btn-del', function () {
        showDeletePoiPromptOverlay('Are you sure you want to delete this POI with interactive event?');
        return false;
    });
    $('#del-poi-notice .btn-del').click(function () {
        $.unblockUI();
        var poiId = $('#poi-event-edit-wrap').data('poiId'),
            tmplItem = $('#storyboard-listing li.playing').tmplItem(),
            tmplItemData = tmplItem.data,
            poiList = tmplItemData.poiList,
            poiTemp = [];
        if ('' != poiId) {
            showSavingOverlay();
            if (poiId > 0 && !isNaN(poiId)) {
                nn.api('DELETE', CMS_CONF.API('/api/pois/{poiId}', {poiId: poiId}), null, function (data) {
                    $('#overlay-s').fadeOut(0);
                });
            } else {
                $('#overlay-s').fadeOut(0);
            }
            $.each(poiList, function (i, poi) {
                if (poi.id == poiId) {
                    // NOTE: Returning non-false is the same as a continue statement in a for loop
                    return true;
                }
                poiTemp.push(poi);
            });
            tmplItemData.poiList = poiTemp;
            buildPoiEventInfoTmpl($('#storyboard-listing li.playing'));
            $('body').removeClass('has-poi-change');
            $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
        }
        return false;
    });

    // Save POI
    $('#cur-poi-edit').on('click', '#poi-edit .btn-next, #poi-edit .btn-save', function () {
        if (chkPoiData(document.epcurateForm)) {
            if ($('#cur-poi-edit').hasClass('edit')) {
                // update mode
                var poiId = $('#poi-event-edit-wrap').data('poiId'),
                    tmplItem = $('#storyboard-listing li.playing').tmplItem(),
                    tmplItemData = tmplItem.data,
                    poiList = tmplItemData.poiList,
                    poiTemp = [],
                    parameter = {
                        name: $('#poiName').val(),
                        startTime: $('#poiStartTime').val(),
                        endTime: $('#poiEndTime').val(),
                        tag: $('#poiTag').val(),
                        message: $('#displayText').val(),
                        button: $('#btnText').val(),
                        link: $('#channelUrl').val()
                    };
                if ('' != poiId) {
                    showSavingOverlay();
                    if (poiId > 0 && !isNaN(poiId)) {
                        nn.api('PUT', CMS_CONF.API('/api/pois/{poiId}', {poiId: poiId}), parameter, function (data) {
                            $('#overlay-s').fadeOut(0);
                        });
                    } else {
                        $('#overlay-s').fadeOut(0);
                    }
                    $.each(poiList, function (i, poi) {
                        if (poi.id == poiId) {
                            $.extend(poi, parameter);
                        }
                        poiTemp.push(poi);
                    });
                    tmplItemData.poiList = poiTemp;
                    buildPoiEventInfoTmpl($('#storyboard-listing li.playing'));
                    $('body').removeClass('has-poi-change');
                    $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
                }
            } else {
                // insert mode
                // switch to event-edit
                $('#cur-poi-edit ul li.event-edit a').trigger('click');
            }
        }
        return false;
    });

    // Save POI event
    $('#cur-poi-edit').on('click', '#event-edit .btn-add, #event-edit .btn-save', function () {
        chkPoiEventData(document.epcurateForm, function (result) {
            if (result) {
                var poiId = $('#poi-event-edit-wrap').data('poiId'),
                    programId = $('#poi-event-edit-wrap').data('programId'),
                    tmplItem = $('#storyboard-listing li.playing').tmplItem(),
                    tmplItemData = tmplItem.data,
                    poiList = tmplItemData.poiList,
                    poiTemp = [],
                    hasPush = false,
                    parameter = {
                        name: $('#poiName').val(),
                        startTime: $('#poiStartTime').val(),
                        endTime: $('#poiEndTime').val(),
                        tag: $('#poiTag').val(),
                        message: $('#displayText').val(),
                        button: $('#btnText').val(),
                        link: $('#channelUrl').val()
                    };
                if ($('#cur-poi-edit').hasClass('edit')) {
                    // update mode
                    if ('' != poiId) {
                        showSavingOverlay();
                        if (poiId > 0 && !isNaN(poiId)) {
                            nn.api('PUT', CMS_CONF.API('/api/pois/{poiId}', {poiId: poiId}), parameter, function (data) {
                                $('#overlay-s').fadeOut(0);
                            });
                        } else {
                            $('#overlay-s').fadeOut(0);
                        }
                        $.each(poiList, function (i, poi) {
                            if (poi.id == poiId) {
                                $.extend(poi, parameter);
                            }
                            poiTemp.push(poi);
                        });
                        tmplItemData.poiList = poiTemp;
                        buildPoiEventInfoTmpl($('#storyboard-listing li.playing'));
                        $('body').removeClass('has-poi-change');
                        $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
                    }
                } else {
                    // insert mode
                    showSavingOverlay();
                    if (programId > 0 && !isNaN(programId)) {
                        parameter.programId = programId;
                        nn.api('POST', CMS_CONF.API('/api/programs/{programId}/pois', {programId: programId}), parameter, function (data) {
                            // update id
                            parameter.id = data.id;
                            $.each(poiList, function (i, poi) {
                                if (!hasPush && parseInt(poi.startTime, 10) > parseInt(parameter.startTime, 10)) {
                                    poiTemp.push(parameter);
                                    hasPush = true;
                                }
                                poiTemp.push(poi);
                            });
                            if (!hasPush) {
                                poiTemp.push(parameter);
                            }
                            tmplItemData.poiList = poiTemp;
                            buildPoiEventInfoTmpl($('#storyboard-listing li.playing'));
                            $('body').removeClass('has-poi-change');
                            $('#epcurate-curation ul.tabs li a.cur-poi').trigger('click');
                            $('#overlay-s').fadeOut(0);
                        });
                    } else {
                        // build timestamp id
                        parameter.id = 'temp-poi-id-' + $.now();
                        $.each(poiList, function (i, poi) {
                            if (!hasPush && parseInt(poi.startTime, 10) > parseInt(parameter.startTime, 10)) {
                                poiTemp.push(parameter);
                                hasPush = true;
                            }
                            poiTemp.push(poi);
                        });
                        if (!hasPush) {
                            poiTemp.push(parameter);
                        }
                        tmplItemData.poiList = poiTemp;
                        buildPoiEventInfoTmpl($('#storyboard-listing li.playing'));
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
                parameter = null;
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
                    publishDate: "",
                    scheduleDate: "",
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
                                        poiItem.programId = program.id;
                                        nn.api('POST', CMS_CONF.API('/api/programs/{programId}/pois', {programId: program.id}), poiItem, function (poi) {
                                            // update poi to DOM
                                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                            tmplItemData = tmplItem.data;
                                            tmplItemData.poiList[key] = poi;
                                            //tmplItem.update();
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
                                        poiItem.programId = program.id;
                                        nn.api('POST', CMS_CONF.API('/api/programs/{programId}/pois', {programId: program.id}), poiItem, function (poi) {
                                            // update poi to DOM
                                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                            tmplItemData = tmplItem.data;
                                            tmplItemData.poiList[key] = poi;
                                            //tmplItem.update();
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
                            nn.api('DELETE', CMS_CONF.API('/api/episodes/{episodeId}/programs?programs=' + videoDeleteIdList.join(','), {episodeId: $('#id').val()}), null, function (data) {
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
        if ($('#poi-list-page').length > 0) {
            buildPoiEventInfoTmpl($('#storyboard-list li.playing'));
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
        poiId = $('#poi-event-edit-wrap').data('poiId'),
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
    $.each(poiList, function (i, poi) {
        if ($('#cur-poi-edit').hasClass('edit') && poi.id == poiId) {
            // NOTE: Returning non-false is the same as a continue statement in a for loop
            return true;
        }
        if (!(startTime > poi.endTime || poi.startTime > endTime)) {
            $('#poi-edit .overlap-notice #poi-name').text(poi.name);
            $('#poi-edit .overlap-notice .time').text('(' + formatDuration(poi.startTime, true) + ' to ' + formatDuration(poi.endTime, true) + ')');
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
    $('#poi-event-edit-wrap').data('starttime', startTime);
    if ('undefined' !== typeof youTubePlayerObj
            && 'object' === $.type(youTubePlayerObj)
            && 'function' === $.type(youTubePlayerObj.loadVideoById)) {
        youTubePlayerObj.seekTo(startTime, true);
    }
    // notice reset
    $('#cur-poi-edit .edit-form .notice').addClass('hide');
    return true;
}

function chkPoiEventData(fm, callback) {
    fm.displayText.value = $.trim(fm.displayText.value);
    fm.btnText.value = $.trim(fm.btnText.value);
    fm.channelUrl.value = $.trim(fm.channelUrl.value);
    if ('' === fm.displayText.value
            || '' === fm.btnText.value
            || '' === fm.channelUrl.value) {
        $('#cur-poi-edit .btn-container').children('.notice').removeClass('hide');
        callback(false);
        return false;
    }
    if (nn._([CMS_CONF.PAGE_ID, 'poi-event', 'Input 9x9 channel or episode URL']) === fm.channelUrl.value) {
        $('#event-edit .invalid-url-notice').removeClass('hide');
        callback(false);
        return false;
    }
    if ('' != fm.channelUrl.value) {
        var url = $.url(fm.channelUrl.value),
            hash = '',
            param = '',
            cid = '',
            eid = '',
            pathAllow = ['/view', '/'],
            hostAllow = [
                'www.9x9.tv',
                'beagle.9x9.tv',
                'dev.teltel.com',
                'demo.doubleservice.com',
                'localhost'
            ];
        if (CMS_CONF.USER_URL && -1 === $.inArray(CMS_CONF.USER_URL.attr('host'), hostAllow)) {
            hostAllow.push(CMS_CONF.USER_URL.attr('host'));
        }
        if (-1 === $.inArray(url.attr('host'), hostAllow)) {
            $('#event-edit .invalid-url-notice').removeClass('hide');
            callback(false);
            return false;
        }
        if (-1 === $.inArray(url.attr('path'), pathAllow)) {
            $('#event-edit .invalid-url-notice').removeClass('hide');
            callback(false);
            return false;
        }
        if ('/' == url.attr('path') && '' == url.attr('fragment')) {
            $('#event-edit .invalid-url-notice').removeClass('hide');
            callback(false);
            return false;
        }
        if ('/view' == url.attr('path') && '' == url.attr('query')) {
            $('#event-edit .invalid-url-notice').removeClass('hide');
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
            $('#event-edit .invalid-url-notice').removeClass('hide');
            callback(false);
            return false;
        }
        nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
            nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
            $('#event-edit .invalid-url-notice').removeClass('hide');
            callback(false);
            return false;
        });
        if ('' == eid || 11 == eid.length) {
            nn.api('GET', CMS_CONF.API('/api/channels/{channelId}', {channelId: cid}), null, function (channel) {
                if (channel.id && cid == channel.id) {
                    if (11 == eid.length) {
                        nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + eid + '?alt=jsonc&v=2&callback=?', null, function (youtubes) {
                            if (youtubes.data) {
                                // notice reset
                                $('#cur-poi-edit .edit-form .notice').addClass('hide');
                                callback(true);
                                return true;
                            } else {
                                $('#event-edit .invalid-url-notice').removeClass('hide');
                                callback(false);
                                return false;
                            }
                        }, 'jsonp');
                    } else {
                        // notice reset
                        $('#cur-poi-edit .edit-form .notice').addClass('hide');
                        callback(true);
                        return true;
                    }
                } else {
                    $('#event-edit .invalid-url-notice').removeClass('hide');
                    callback(false);
                    return false;
                }
            });
        } else {
            nn.api('GET', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: eid}), null, function (episode) {
                if (episode.id && eid == episode.id && cid == episode.channelId) {
                    // notice reset
                    $('#cur-poi-edit .edit-form .notice').addClass('hide');
                    callback(true);
                    return true;
                } else {
                    $('#event-edit .invalid-url-notice').removeClass('hide');
                    callback(false);
                    return false;
                }
            });
        }
    } else {
        callback(false);
        return false;
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

function loadYouTubeFlash(videoId, isChromeless) {
    removeTitleCardPlayingHook();
    if (videoId && '' != videoId) {
        var videoWidth = $('#video-player .video').width(),
            videoHeight = $('#video-player .video').height(),
            videoUrl = 'http://www.youtube.com/v/' + videoId + '?version=3&enablejsapi=1&autohide=0&fs=0';
        if (isChromeless) {
            videoUrl = 'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=player1';
            $('html').addClass('youtube-chromeless');
        } else {
            $('html').removeClass('youtube-chromeless');
        }
        $('#video-player .video').flash({
            id: 'youTubePlayer',
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

function loadYouTubeChrome(videoId) {
    loadYouTubeFlash(videoId, true);
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
    youTubePlayerObj = document.getElementById('youTubePlayer');
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
            || $('body').hasClass('from-poi-edit-mode'))) {
        $('body').removeClass('from-trim-time-edit');
        $('body').removeClass('from-trim-time-edit-ending');
        $('body').removeClass('from-poi-edit-mode');
        if ($('#cur-poi-edit').length > 0 && !$('#cur-poi-edit').hasClass('hide')) {
            starttime = $('#poi-event-edit-wrap').data('starttime');
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
        buildPoiEventInfoTmpl(element);
    }
}

function buildPoiEventInfoTmpl(element) {
    // poi-event-info-tmpl
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
        $('#poi-event-info-tmpl').tmpl(videoInfoData, options).prependTo('#cur-poi');
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

function buildPoiEventEditTmpl(poi) {
    var videoData = $('#storyboard-list li.playing').tmplItem().data,
        optionData = {},
        poiData = poi || {},
        videoStartTime = videoData.startTime,
        videoEndTime = (videoData.endTime > 0) ? videoData.endTime : videoData.duration,
        poiStartTime = videoStartTime,
        poiEndTime = videoEndTime;
    poiData = $.extend({
        id: 0,
        programId: (videoData.id) ? videoData.id : 0,
        name: '',
        intro: '',
        startTime: poiStartTime,
        endTime: poiEndTime,
        tag: '',
        message: nn._([CMS_CONF.PAGE_ID, 'poi-event', 'Hyper to related channel to watch more!']),
        button: nn._([CMS_CONF.PAGE_ID, 'poi-event', 'Watch now']),
        link: nn._([CMS_CONF.PAGE_ID, 'poi-event', 'Input 9x9 channel or episode URL'])
    }, poiData);
    videoStartTime = formatDuration(videoStartTime, true).split(':');
    videoEndTime = formatDuration(videoEndTime, true).split(':');
    poiStartTime = formatDuration(poiData.startTime, true).split(':');
    poiEndTime = formatDuration(poiData.endTime, true).split(':');
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
    $('#poi-event-edit-tmpl').tmpl(poiData, optionData).prependTo('#cur-poi-edit');
    $('#poi-edit').html('');
    $('#poi-edit-tmpl').tmpl(poiData, optionData).prependTo('#poi-edit');
    $('#poi-edit input.time').autotab({
        format: 'numeric'
    });
    $('#event-edit').html('');
    $('#event-edit-tmpl').tmpl(poiData, optionData).prependTo('#event-edit');
    if (poiData.link == nn._([CMS_CONF.PAGE_ID, 'poi-event', 'Input 9x9 channel or episode URL'])) {
        $('#event-edit input[name="channelUrl"]').toggleVal();
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
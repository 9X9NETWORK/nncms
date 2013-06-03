/*jslint browser: true, devel: true, nomen: true, regexp: true, unparam: true, sloppy: true */
/*global $, nn, CMS_CONF, showSavingOverlay, showProcessingOverlay, showUnsaveOverlay, showUnsavePoiOverlay, showUnsavePoiMask, showDeletePoiPromptOverlay, strip_tags, formatTimestamp */

function setFormHeight() {
    var windowHeight    = $(window).height(),
        windowWidth     = $(window).width(),
        titleFuncHeight = $('#title-func').height(),
        listEmWidth     = $('#title-func h2.poi-list em').width(),
        listSpanWidth   = $('#title-func h2.poi-list span').width(),
        createEmWidth   = $('#title-func h2.poi-create em').width(),
        createSpanWidth = $('#title-func h2.poi-create span').width(),
        editEmWidth     = $('#title-func h2.poi-edit em').width(),
        editSpanWidth   = $('#title-func h2.poi-edit span').width(),
        contentHeight   = windowHeight - titleFuncHeight - 94 - 48 - 38 - 10;   // 94:header+studio-nav 48:footer 38:title-func-padding
    if (windowWidth > 1220) {
        $('#channel-poi input.text').width(windowWidth - 734);
        $('#title-func h2').width(windowWidth - 584).data('width', $(this).width());
    } else {
        $('#channel-poi input.text').width(433);
        $('#title-func h2').width(583).data('width', '583');
    }
    $('#title-func').data('width', $('#title-func h2').width());

    if (listEmWidth > $('#title-func').data('width') - listSpanWidth) {
        $('#title-func h2.poi-list em').width($('#title-func').data('width') - $('#title-func h2.poi-list span').width());
    } else {
        $('#title-func h2.poi-list em').width('auto');
    }
    if (createEmWidth > $('#title-func').data('width') - createSpanWidth) {
        $('#title-func h2.poi-create em').width($('#title-func').data('width') - $('#title-func h2.poi-create span').width());
    } else {
        $('#title-func h2.poi-create em').width('auto');
    }
    if (editEmWidth > $('#title-func').data('width') - editSpanWidth) {
        $('#title-func h2.poi-edit em').width($('#title-func').data('width') - $('#title-func h2.poi-edit span').width());
    } else {
        $('#title-func h2.poi-edit em').width('auto');
    }
    $('#channel-poi .edit-block').height(contentHeight);
}

function chkPoiPointData(fm) {
    fm.poiName.value = $.trim(fm.poiName.value);
    fm.poiTag.value = $.trim(fm.poiTag.value);
    if ('' === fm.poiName.value) {
        $('#poiPointForm .form-btn .notice').removeClass('hide');
        fm.poiName.focus();
        return false;
    }
    // notice reset
    $('#poiPointForm .form-btn .notice').addClass('hide');
    return true;
}

function chkPoiEventData(fm, callback) {
    var poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey');
    fm.displayText.value = $.trim(fm.displayText.value);
    fm.btnText.value = $.trim(fm.btnText.value);
    fm.channelUrl.value = $.trim(fm.channelUrl.value);
    fm.notifyMsg.value = $.trim(fm.notifyMsg.value);
    fm.notifyScheduler.value = $.trim(fm.notifyScheduler.value);
    if ('' === fm.displayText.value || '' === fm.btnText.value) {
        $('#poi-event-overlay .event .func ul li.notice').show();
        callback(false);
        return false;
    }
    if (!$('#schedule-mobile').hasClass('hide') || !$('#instant-mobile').hasClass('hide')) {
        if ('' === fm.notifyMsg.value) {
            $('#poi-event-overlay .event .func ul li.notice').show();
            callback(false);
            return false;
        }
        if ('event-scheduled' === poiEventTypeKey && '' === fm.notifyScheduler.value) {
            $('#poi-event-overlay .event .func ul li.notice').show();
            callback(false);
            return false;
        }
    }
    // notice and url reset
    $('#poi-event-overlay .event .func ul li.notice').hide();
    callback(true);
    return true;
}

function loadYouTubeFlash(videoWrap) {
    var videoWidth = 590,
        videoHeight = 332;
    $('#poi-event-overlay .wrap .content .video-wrap .video').empty();
    if (videoWrap === '#preload-channel-video') {
        $('body').addClass('has-preload-video');
        $(videoWrap).removeClass('hide');
        videoWidth = 1;
        videoHeight = 1;
    }
    $(videoWrap).flash({
        id: 'youTubePlayerChrome',
        name: 'ytid-' + $('#channel-poi').data('ytid'),
        swf: 'http://www.youtube.com/apiplayer?version=3&enablejsapi=1&playerapiid=playerChrome',
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
}

function loadVideo() {
    var videoId = $('#channel-poi').data('ytid'),
        startSeconds = $('#channel-poi').data('starttime');
    startSeconds = startSeconds - 1 + 1;
    if (!videoId || videoId.length !== 11) {
        $('#poi-event-overlay .wrap .content .video-wrap .video').empty();
        $('#poi-event-overlay .wrap .content .video-wrap .no-video').removeClass('hide');
        return false;
    }
    if (CMS_CONF.YOUTUBE_PLAYER !== undefined
            && CMS_CONF.YOUTUBE_PLAYER !== null
            && 'object' === $.type(CMS_CONF.YOUTUBE_PLAYER)
            && 'function' === $.type(CMS_CONF.YOUTUBE_PLAYER.loadVideoById)) {
        CMS_CONF.YOUTUBE_PLAYER.loadVideoById({
            'videoId': videoId,
            'startSeconds': startSeconds
        });
    }
}

function onYouTubePlayerReady(playerId) {
    CMS_CONF.YOUTUBE_PLAYER = document.getElementById('youTubePlayerChrome');
    CMS_CONF.YOUTUBE_PLAYER.addEventListener('onStateChange', 'onYouTubePlayerStateChange');
    loadVideo();
}

function onYouTubePlayerStateChange(newState) {
    var startSeconds = $('#channel-poi').data('starttime');
    startSeconds = startSeconds - 1 + 1;
    // unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
    if (-1 === newState) {
        $('#poi-event-overlay .wrap .content .video-wrap .no-video').removeClass('hide');
        CMS_CONF.YOUTUBE_PLAYER.playVideo();
    }
    if (1 === newState) {
        $('#poi-event-overlay .wrap .content .video-wrap .no-video').addClass('hide');
        CMS_CONF.YOUTUBE_PLAYER.seekTo(startSeconds, true);
        CMS_CONF.YOUTUBE_PLAYER.pauseVideo();
        if ($('body').hasClass('has-preload-video')) {
            $('body').removeClass('has-preload-video');
            $('body').addClass('has-load-video');
            $('#preload-channel-video').addClass('hide');
            $('#youTubePlayerChrome').attr('width', 590).attr('height', 332);
        }
    }
    nn.log({
        newState: newState
    }, 'debug');
}

function playPoiEventAndVideo(type) {
    if (type && isNaN(type) && CMS_CONF.POI_TYPE_MAP[type]) {
        // load video
        $('#poi-event-overlay-wrap').data('poiEventType', CMS_CONF.POI_TYPE_MAP[type].code);
        $('#poi-event-overlay-wrap').data('poiEventTypeKey', type);
        if ($('#youTubePlayerChrome').length > 0 && $('body').hasClass('has-load-video')) {
            // cache from preload video to event type video
            $('#poi-event-overlay .wrap .content .video-wrap .no-video').addClass('hide');
            $('#youTubePlayerChrome').appendTo($('#' + type + '-video'));
        } else {
            $('#preload-channel-video').empty();
            loadYouTubeFlash('#' + type + '-video');
        }
        // load POI plugin
        $('#poi-event-overlay .event .video-wrap .poi-display').empty();
        var displayText = strip_tags($.trim($('#poi-event-overlay #' + type + ' input[name=displayText]').val())),
            buttonsText = strip_tags($.trim($('#poi-event-overlay #' + type + ' input[name=btnText]').val()));
        if ('' === displayText) {
            displayText = nn._([CMS_CONF.PAGE_ID, 'poi-event', 'Input display text']);
        }
        if ('' === buttonsText) {
            buttonsText = nn._([CMS_CONF.PAGE_ID, 'poi-event', 'Input button text']);
        }
        $('#poi-event-overlay #' + type + ' .video-wrap .poi-display').poi({
            type: CMS_CONF.POI_TYPE_MAP[type].plugin,
            displayText: displayText,
            buttons: [buttonsText],
            duration: -1
        });
    } else {
        nn.log('POI type error!', 'error');
    }
}

function preloadChannelVideo() {
    var videoId = $('#channel-poi').data('ytid'),
        preloadHook = '#preload-channel-video',
        epList = $('#channel-poi-wrap').tmplItem().data.epList,
        freezePosSec = 25,
        selectedEp = null,
        youTubeUrlPattern = /^http(?:s)?:\/\/www.youtube.com\/watch\?v=([^&]{11})/,
        ytData = null,
        //isZoneLimited = null, // unused
        isMobileLimited = null,
        isEmbedLimited = null,
        isSyndicateAllow = null,
        isUnplayableVideo = null;
    if (videoId && videoId.length === 11 && $('#youTubePlayerChrome').length === 0) {
        loadYouTubeFlash(preloadHook);
        return false;
    }
    if (!videoId && epList && epList.length > 0) {
        // shuffle random
        epList.sort(function () {
            return 0.5 - Math.random();
        });
        $.each(epList, function (i, epItem) {
            if (parseInt(epItem.duration, 10) > freezePosSec) {
                selectedEp = epItem;
                // NOTE: return false here is break the $.each() loop
                return false;
            }
        });
        if (selectedEp !== null) {
            nn.api('GET', CMS_CONF.API('/api/episodes/{episodeId}/programs', {
                episodeId: selectedEp.id
            }), null, function (programs) {
                // shuffle random
                programs.sort(function () {
                    return 0.5 - Math.random();
                });
                $.each(programs, function (idx, programItem) {
                    if (youTubeUrlPattern.test(programItem.fileUrl) && parseInt(programItem.duration, 10) > freezePosSec) {
                        nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + programItem.fileUrl.slice(-11) + '?alt=jsonc&v=2&callback=?', null, function (youtubes) {
                            videoId = $('#channel-poi').data('ytid');
                            if (!videoId) {
                                if (youtubes.data) {
                                    // https://developers.google.com/youtube/2.0/reference#youtube_data_api_tag_yt:state
                                    // The <yt:state> tag contains information that describes the status of a video that cannot be played.
                                    // Video entries that contain a <yt:state> tag are not playable.
                                    // The name and reasonCode attributes and the tag value provide insight into the reason why the video is not playable.
                                    ytData = youtubes.data;
                                    //isZoneLimited = (ytData.restrictions) ? true : false; // unused
                                    isMobileLimited = ((ytData.accessControl && ytData.accessControl.syndicate && 'denied' === ytData.accessControl.syndicate) || (ytData.status && ytData.status.reason && 'limitedSyndication' === ytData.status.reason)) ? true : false;
                                    isEmbedLimited = (ytData.accessControl && ytData.accessControl.embed && 'denied' === ytData.accessControl.embed) ? true : false;
                                    isSyndicateAllow = (isMobileLimited && ytData.accessControl && ytData.accessControl.syndicate && 'allowed' === ytData.accessControl.syndicate) ? true : false;
                                    isUnplayableVideo = (ytData.status && !isSyndicateAllow) ? true : false;
                                }
                                if (ytData && !isEmbedLimited && !isUnplayableVideo) {
                                    $('#channel-poi').data('ytid', ytData.id);
                                    $('#channel-poi').data('starttime', parseInt(programs[idx].startTime, 10) + freezePosSec);
                                    loadYouTubeFlash(preloadHook);
                                    // NOTE: return false here is break the $.each() loop
                                    //return false;
                                }
                            }
                        }, 'jsonp');
                    }
                });
            });
        }
    }
}

function buildPoiListPageTmpl() {
    var poiList = $('#channel-poi-wrap').tmplItem().data.poiList,
        poiPage = [];
    $('#poi-list .poi-info').addClass('hide');
    if (poiList && poiList.length > 0) {
        $('#poi-list .btn-create-poi').removeClass('enable').addClass('disable');
        $('#poi-list .has-poi').removeClass('hide');
        $('#poi-list .poi-info').removeClass('hide');
        poiPage.push({
            poiItem: poiList
        });
    }
    $('#poi-list-page').html('');
    $('#poi-list-page-tmpl').tmpl(poiPage).prependTo('#poi-list-page');
}

function buildPoiPointEditTmpl(poi_point) {
    var poiPointEventData = poi_point || {},
        channelData = $('#channel-poi-wrap').tmplItem().data,
        optionData = {};
    poiPointEventData = $.extend({
        id: 0,
        targetId: channelData.id || 0,
        type: 3,
        name: '',
        startTime: '',
        endTime: '',
        tag: ''
    }, poiPointEventData);
    optionData = {
        isEditMode: $('#poi-point-edit').hasClass('edit')
    };
    $('#poi-point-edit').html('');
    $('#poi-point-edit-tmpl').tmpl(poiPointEventData, optionData).prependTo('#poi-point-edit');
}

function buildPoiEventOverlayTmpl(poi_event) {
    var poiPointEventData = poi_event || {},
        channelData = $('#channel-poi-wrap').tmplItem().data,
        hasPoiEventCache = false,
        poiEventTypeKey = '';
    poiPointEventData = $.extend({
        id: 0,
        targetId: channelData.id || 0,
        type: 3,
        eventId: 0,
        eventType: 0,
        message: '',
        button: '',
        link: '',
        notifyMsg: '',
        notifyScheduler: ''
    }, poiPointEventData);
    if ($('#poi-event-overlay-wrap').length === 0) {
        hasPoiEventCache = false;
        $('#poi-event-overlay .wrap').html('');
        $('#poi-event-overlay-tmpl').tmpl(poiPointEventData).prependTo('#poi-event-overlay .wrap');
    } else {
        hasPoiEventCache = true;
        $('#poi-event-overlay-wrap').tmplItem().data = poiPointEventData;
    }
    poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey');
    $.blockUI({
        message: $('#poi-event-overlay'),
        onBlock: function () {
            $('#poi-event-overlay .event').addClass('hide');
            if ($('#poi-point-edit').hasClass('edit')) {
                // update mode
                $('#poi-event-overlay').addClass('edit');
                $('#' + poiEventTypeKey).removeClass('hide');
                if (false === hasPoiEventCache) {
                    playPoiEventAndVideo(poiEventTypeKey);
                }
            } else {
                // insert mode
                $('#poi-event-overlay').removeClass('edit');
                if (poiEventTypeKey && CMS_CONF.POI_TYPE_MAP[poiEventTypeKey]) {
                    $('#' + poiEventTypeKey).removeClass('hide');
                } else {
                    $('#event-select').removeClass('hide');
                }
            }
            $('#poi-event-overlay input[name=btnText]').charCounter(20, {
                container: '<span class="hide"><\/span>',
                format: '%1 characters to go!',
                delay: 0,
                multibyte: true
            });
            $('#poi-event-overlay .datepicker').datepick({
                changeMonth: false,
                dateFormat: 'yyyy/mm/dd',
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                minDate: +0,
                multiSelect: 999,
                onSelect: function (dates) {
                    $('body').addClass('has-poi-change');
                    $('body').addClass('has-change');
                    $('#poi-event-overlay .event .func ul li.notice').hide();
                    var selectedDate = '',
                        selectedList = [],
                        scheduleDate = '',
                        scheduleList = [],
                        timestampList = [];
                    $.each(dates, function (i, dateItem) {
                        selectedDate = $.datepick.formatDate('yyyy/mm/dd', dateItem);
                        selectedList.push(selectedDate);
                        scheduleDate = selectedDate + ' ' + $('#time_hour').text() + ':' + $('#time_min').text() + ':00';
                        scheduleList.push(scheduleDate);
                        timestampList.push(Date.parse(scheduleDate));
                    });
                    $('#datepicker_selected').val(selectedList.join(','));
                    $('#schedule_selected').val(scheduleList.join(','));
                    $('#timestamp_selected').val(timestampList.join(','));
                }
            });
            $('#schedule-mobile .notification .time .hour').perfectScrollbar();
        }
    });
}

function removeTotalChangeHook() {
    $('body').removeClass('has-change');
    $('body').removeClass('has-poi-change');
    $('body').removeClass('has-preload-video');
    $('body').removeClass('has-load-video');
}

function goBackPoiList(isSaveMode) {
    removeTotalChangeHook();
    $.unblockUI();
    // cache from event type video to preload video
    if ($('#preload-channel-video #youTubePlayerChrome').length === 0 && $('#youTubePlayerChrome').length > 0) {
        $('#youTubePlayerChrome').appendTo($('#preload-channel-video'));
        $('body').addClass('has-load-video');
    }
    $('#poi-event-overlay .wrap').html('');
    $('#poi-point-edit').html('');
    $('#channel-poi .edit-block').addClass('hide');
    $('#poi-list').removeClass('hide');
    $('#content-main').removeAttr('class');
    $('#content-main').addClass('poi-list');
    if (isSaveMode) {
        $('#poi-list .has-poi').removeClass('hide');
        $('#poi-list .btn-create-poi').removeClass('enable').addClass('disable');
        $('#poi-list .poi-info').removeClass('hide');
    }
    setFormHeight();
    preloadChannelVideo();
}

$(function () {
    // common unblock
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
                location.replace('index.html');
            }
            return false;
        }
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
        removeTotalChangeHook();
        $.unblockUI();
        if ($('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
            $('#' + $('body').data('leaveId')).trigger('click');
        } else if ($('body').data('leaveUrl')) {
            location.href = $('body').data('leaveUrl');
        } else {
            location.href = 'index.html';
        }
        return false;
    });
    // POI unsave prompt
    $('#unsave-poi-prompt .overlay-btn-yes').click(function () {
        removeTotalChangeHook();
        $.unblockUI();
        var origin = $('body').data('origin');
        if (origin) {
            $('body').removeData('origin');
            $(origin.target).trigger('click');
        }
        return false;
    });
    $('#unsave-poi-prompt .overlay-btn-no, #unsave-poi-prompt .overlay-btn-close').click(function () {
        $.unblockUI();
        return false;
    });
    // POI overlay unsave prompt
    $('#unsave-poi-mask-prompt .overlay-btn-yes').click(function () {
        $('#unsave-poi-mask-prompt').hide();
        goBackPoiList();
        return false;
    });
    $('#unsave-poi-mask-prompt .overlay-btn-no, #unsave-poi-mask-prompt .overlay-btn-close').click(function () {
        $('#unsave-poi-mask-prompt').hide();
        $('#poi-event-overlay').show();
        return false;
    });

    // Delete POI
    $('#content-main').on('click', '#poi-list-page .btn-del', function () {
        $(this).parent().parent('li').addClass('deleting').data('deleteId', $(this).data('poiPointId'));
        showDeletePoiPromptOverlay('Are you sure you want to delete this POI with interactive event?');
        return false;
    });
    $('#del-poi-notice .btn-del').click(function () {
        $.unblockUI();
        var poiPointId = $('#poi-list-page ol li.deleting').data('deleteId'),
            tmplItem = $('#channel-poi-wrap').tmplItem(),
            tmplItemData = tmplItem.data,
            poiList = tmplItemData.poiList,
            poiTemp = [];
        if ($('#poi-list-page ol li.deleting').length > 0 && poiPointId) {
            showSavingOverlay();
            if (poiPointId > 0 && !isNaN(poiPointId)) {
                nn.api('DELETE', CMS_CONF.API('/api/poi_points/{poiPointId}', {
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
            $('#poi-list .poi-info').addClass('hide');
            $('#poi-list-page').html('');
            $('#poi-list .has-poi').addClass('hide');
            if ($('#poi-list .no-episode').hasClass('hide')) {
                $('#poi-list .btn-create-poi').removeClass('disable').addClass('enable');
            }
        }
        return false;
    });
    $('#del-poi-notice .btn-close, #del-poi-notice .btn-no').click(function () {
        $.unblockUI();
        $('#poi-list-page ol li').removeClass('deleting').removeData('deleteId');
        return false;
    });

    // POI Add button
    $('#content-main').on('click', '#poi-list .add .enable', function () {
        $('#channel-poi .edit-block').addClass('hide');
        $('#poi-point-edit').removeClass('edit');
        buildPoiPointEditTmpl();
        $('#poi-point-edit').removeClass('hide');
        $('#content-main').removeAttr('class');
        $('#content-main').addClass('poi-create');
        setFormHeight();
        return false;
    });
    $('#content-main').on('click', '#poi-list .add .disable', function () {
        return false;
    });

    // POI Edit button
    $('#content-main').on('click', '#poi-list .poi-info .edit', function () {
        var poiPointId = $(this).data('poiPointId'),
            poiList = $('#channel-poi-wrap').tmplItem().data.poiList;
        if (poiPointId) {
            $('#channel-poi .edit-block').addClass('hide');
            $('#poi-point-edit').addClass('edit');
            $.each(poiList, function (i, poiItem) {
                if (poiItem.id === poiPointId) {
                    buildPoiPointEditTmpl(poiItem);
                    // NOTE: return false here is break the $.each() loop
                    return false;
                }
            });
            // enter edit mode
            $('#poi-point-edit').removeClass('hide');
            $('#content-main').removeAttr('class');
            $('#content-main').addClass('poi-edit');
            setFormHeight();
        }
        return false;
    });

    // POI click notice reset
    $('#content-main').on('click', '#poiPointForm input', function () {
        $('#poiPointForm .form-btn .notice').addClass('hide');
    });
    // POI overlay notice reset
    $('#poi-event-overlay').on('click', 'input[type=text], textarea', function () {
        $('#poi-event-overlay .event .event-input .fminput .notice').hide();
        $('#poi-event-overlay .event .func ul li.notice').hide();
    });
    // POI hook has change
    $('#content-main').on('change', '#poiPointForm input', function () {
        $('body').addClass('has-poi-change');
        $('body').addClass('has-change');
    });
    // POI overlay hook has change
    $('#poi-event-overlay').on('change', 'input[type=text], textarea', function () {
        $('body').addClass('has-poi-change');
        $('body').addClass('has-change');
    });

    // Cancel POI editing
    $('#content-main').on('click', '#poiPointForm .btn-cancel', function (e) {
        if ($('body').hasClass('has-poi-change')) {
            showUnsavePoiOverlay(e);
            return false;
        }
        goBackPoiList();
        return false;
    });
    // POI overlay - cancel and close
    $('#poi-event-overlay').on('click', '.btn-cancel, .overlay-btn-close', function (e) {
        if ($('body').hasClass('has-poi-change')) {
            showUnsavePoiMask(e);
            return false;
        }
        goBackPoiList();
        return false;
    });

    // POI point Next
    $('#content-main').on('click', '#poiPointForm .btn-next', function () {
        if (chkPoiPointData(document.poiPointForm)) {
            var poiPointId = 0,
                poiEventId = 0,
                hasApiAccessCache = false,
                tmplItem = $('#channel-poi-wrap').tmplItem(),
                tmplItemData = tmplItem.data,
                poiList = tmplItemData.poiList,
                poiTemp = [],
                parameter = null,
                poiPointEventData = {},
                poiEventContext = null,
                poiEventData = {},
                poiPointData = {
                    name: $('#poiName').val(),
                    startTime: '',
                    endTime: '',
                    tag: $('#poiTag').val()
                };
            if ($('#poi-point-edit').hasClass('edit')) {
                // update mode
                poiPointId = $('#poi-point-edit-wrap').data('poiPointId');
                if (poiPointId) {
                    showProcessingOverlay();
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
                            nn.api('PUT', CMS_CONF.API('/api/poi_points/{poiPointId}', {
                                poiPointId: poiPointId
                            }), poiPointData, function (poi_point) {
                                $('#overlay-s').fadeOut(0, function () {
                                    tmplItemData.poiList = poiTemp;
                                    buildPoiListPageTmpl();
                                    buildPoiEventOverlayTmpl(poiPointEventData);
                                });
                            });
                        } else {
                            // reset and real API access
                            poiTemp = [];
                            poiPointEventData = {};
                            nn.api('PUT', CMS_CONF.API('/api/poi_points/{poiPointId}', {
                                poiPointId: poiPointId
                            }), poiPointData, function (poi_point) {
                                parameter = {
                                    poiPointId: poiPointId
                                };
                                nn.api('GET', CMS_CONF.API('/api/poi_campaigns/{poiCampaignId}/pois', {
                                    poiCampaignId: CMS_CONF.CAMPAIGN_ID
                                }), parameter, function (pois) {
                                    if (pois && pois.length > 0 && pois[0] && pois[0].eventId && !isNaN(pois[0].eventId)) {
                                        poiEventId = pois[0].eventId;
                                        nn.api('GET', CMS_CONF.API('/api/poi_events/{poiEventId}', {
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
                                                buildPoiListPageTmpl();
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
                                if (poiItem.id === poiPointId) {
                                    $.extend(poiItem, poiPointData);
                                    poiPointEventData = poiItem;
                                }
                                poiTemp.push(poiItem);
                            });
                            tmplItemData.poiList = poiTemp;
                            buildPoiListPageTmpl();
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

    // POI overlay - crumb switch
    $('#poi-event-overlay').on('click', '.event .crumb a', function () {
        // POI overlay notice reset
        $('#poi-event-overlay .event .event-input .fminput .notice').hide();
        $('#poi-event-overlay .event .func ul li.notice').hide();
    });
    // POI overlay - first crumb (close POI overlay)
    $('#poi-event-overlay').on('click', '.unblock', function (e) {
        if ($('#poi-point-edit').hasClass('edit')) {
            // edit mode back must check and if pass then unblock poi overlay
            var poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey'),
                formId = CMS_CONF.POI_TYPE_MAP[poiEventTypeKey].formId;
            chkPoiEventData(document.forms[formId], function (result) {
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
        if ($('#poi-point-edit').hasClass('edit')) {
            // edit mode back must check and if pass then go to preview video and POI plugin
            chkPoiEventData(document.eventScheduledForm, function (result) {
                if (!result) {
                    e.stopImmediatePropagation();
                    return false;
                }
                $('#event-scheduled .schedule').addClass('hide');
                $('#schedule-notify').removeClass('hide');
                return false;
            });
            return false;
        }
        // insert mode back no check and go to preview video and POI plugin
        $('#event-scheduled .schedule').addClass('hide');
        $('#schedule-notify').removeClass('hide');
        return false;
    });
    $('#poi-event-overlay').on('click', '#instant-mobile .crumb .crumb-mobile', function (e) {
        if ($('#poi-point-edit').hasClass('edit')) {
            // edit mode back must check and if pass then go to preview video and POI plugin
            chkPoiEventData(document.eventInstantForm, function (result) {
                if (!result) {
                    e.stopImmediatePropagation();
                    return false;
                }
                $('#event-instant .instant').addClass('hide');
                $('#instant-notify').removeClass('hide');
                return false;
            });
            return false;
        }
        // insert mode back no check and go to preview video and POI plugin
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
        playPoiEventAndVideo(type);
    });

    // POI overlay - POI plugin realtime edit preview
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

    // POI overlay - Scheduled Preview Video and POI Plugin Next
    $('#poi-event-overlay').on('click', '#schedule-notify .btn-next, #schedule-notify .crumb.edit .crumb-next', function () {
        chkPoiEventData(document.eventScheduledForm, function (result) {
            if (result) {
                // parse multi schedule timestamp (ready for next step)
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
                if ('' !== $.trim($('#timestamp_selected').val())) {
                    stampList = $('#timestamp_selected').val().split(',');
                    $.each(stampList, function (i, stampItem) {
                        stampItem = stampItem - 1 + 1;
                        formatTemp = formatTimestamp(stampItem, '/', ':');
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
                } else {
                    // default schedule datetime
                    $('#time_hour').text(hour);
                    $('#time_min').text(min);
                    $('#datepicker_selected').val(selectedDate);
                    $('#schedule_selected').val(selectedDateTime);
                    $('#timestamp_selected').val(Date.parse(selectedDateTime));
                    $('#poi-event-overlay .datepicker').datepick('setDate', selectedDate);
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
        chkPoiEventData(document.eventInstantForm, function (result) {
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
        var val = strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
        $('#schedule-mobile .mobile-block p.msg').text(val);
    });
    $('#poi-event-overlay').on('change keyup keydown', '#instant_msg', function () {
        var val = strip_tags($(this).val().replace(/\n/g, ''));
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
            formId = CMS_CONF.POI_TYPE_MAP[poiEventTypeKey].formId,
            fm = document.forms[formId];
        chkPoiEventData(fm, function (result) {
            if (result) {
                var displayText = $.trim(fm.displayText.value),
                    btnText = $.trim(fm.btnText.value),
                    channelUrl = $.trim(fm.channelUrl.value),
                    notifyMsg = $.trim(fm.notifyMsg.value),
                    notifyScheduler = $.trim(fm.notifyScheduler.value),
                    channelId = $('#poi-event-overlay-wrap').data('channelId'),
                    poiPointId = $('#poi-event-overlay-wrap').data('poiPointId'),
                    poiEventId = $('#poi-event-overlay-wrap').data('poiEventId'),
                    poiEventType = $('#poi-event-overlay-wrap').data('poiEventType'),
                    tmplItem = $('#channel-poi-wrap').tmplItem(),
                    tmplItemData = tmplItem.data,
                    poiList = tmplItemData.poiList,
                    poiTemp = [],
                    hasPushList = false,
                    poiData = {},
                    poiPointData = {
                        eventType: poiEventType,        // ready for fake api to change new point id
                        name: $('#poiName').val(),
                        startTime: '',
                        endTime: '',
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
                        pointType: 3,                   // ready for fake api to change new event id
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
                if ($('#poi-point-edit').hasClass('edit') && poiPointId) {
                    // update mode
                    showSavingOverlay();
                    if (poiPointId > 0 && !isNaN(poiPointId)) {
                        nn.api('PUT', CMS_CONF.API('/api/poi_events/{poiEventId}', {
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
                    buildPoiListPageTmpl();
                    goBackPoiList(true);
                } else {
                    // insert mode
                    showSavingOverlay();
                    if (channelId > 0 && !isNaN(channelId)) {
                        nn.api('POST', CMS_CONF.API('/api/channels/{channelId}/poi_points', {
                            channelId: channelId
                        }), poiPointData, function (poi_point) {
                            nn.api('POST', CMS_CONF.API('/api/users/{userId}/poi_events', {
                                userId: CMS_CONF.USER_DATA.id
                            }), poiEventData, function (poi_event) {
                                poiData = {
                                    pointId: poi_point.id,
                                    eventId: poi_event.id
                                };
                                nn.api('POST', CMS_CONF.API('/api/poi_campaigns/{poiCampaignId}/pois', {
                                    poiCampaignId: CMS_CONF.CAMPAIGN_ID
                                }), poiData, function (poi) {
                                    if (-1 !== $.inArray(CMS_CONF.POI_TYPE_MAP[poi_event.type], ['event-scheduled', 'event-instant'])) {
                                        poiEventContext.button[0].actionUrl = CMS_CONF.POI_ACTION_URL + poi.id;
                                        poiEventData.context = JSON.stringify(poiEventContext);
                                        poiEventDataExtend.link = CMS_CONF.POI_ACTION_URL + poi.id;
                                    }
                                    nn.api('PUT', CMS_CONF.API('/api/poi_events/{poiEventId}', {
                                        poiEventId: poi_event.id
                                    }), poiEventData, function (poi_event) {
                                        // update id
                                        poiPointData.id = poi_point.id;
                                        poiPointData.targetId = poi_point.targetId;
                                        poiPointData.type = poi_point.type;
                                        poiEventDataExtend.eventId = poi_event.id;
                                        poiPointData = $.extend(poiPointData, poiEventDataExtend);
                                        $.each(poiList, function (i, poiItem) {
                                            // NOTE: must to change when channel POI list > 1
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
                                        buildPoiListPageTmpl();
                                        goBackPoiList(true);
                                        $('#overlay-s').fadeOut(0);
                                    });
                                });
                            });
                        });
                    }
                }
            }
        });
        return false;
    });

    $(window).resize(function () {
        setFormHeight();
    });
});

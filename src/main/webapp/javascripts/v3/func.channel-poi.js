/*jslint browser: true, nomen: true, regexp: true, unparam: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.setFormHeight = function () {
        var windowHeight    = $(window).height(),
            windowWidth     = $(window).width(),
            titleFuncHeight = $('#title-func').height(),
            listSpanWidth   = $('#title-func h2.poi-list span').width(),
            createSpanWidth = $('#title-func h2.poi-create span').width(),
            editSpanWidth   = $('#title-func h2.poi-edit span').width(),
            headerHeight = $('#header').height(),
            navHeight = $('#studio-nav').height(),
            contentHeight = windowHeight - titleFuncHeight - headerHeight - navHeight + 5 - 48 - 38 - 10;   // 5:header and studio-nav overlap 48:footer 38:title-func-padding
        if (windowWidth > 1220) {
            $('#channel-poi input.text').width(windowWidth - 734);
            $('#title-func h2').width(windowWidth - 584);
        } else {
            $('#channel-poi input.text').width(433);
            $('#title-func h2').width(583);
        }
        if ($('#title-func h2.poi-list em').data('width') > $('#title-func h2.poi-list').width() - listSpanWidth) {
            $('#title-func h2.poi-list em').width($('#title-func h2.poi-list').width() - listSpanWidth - 1);
        } else {
            $('#title-func h2.poi-list em').width('auto');
        }
        if ($('#title-func h2.poi-create em').data('width') > $('#title-func h2.poi-create').width() - createSpanWidth) {
            $('#title-func h2.poi-create em').width($('#title-func h2.poi-create').width() - createSpanWidth - 1);
        } else {
            $('#title-func h2.poi-create em').width('auto');
        }
        if ($('#title-func h2.poi-edit em').data('width') > $('#title-func h2.poi-edit').width() - editSpanWidth) {
            $('#title-func h2.poi-edit em').width($('#title-func h2.poi-edit').width() - editSpanWidth - 1);
        } else {
            $('#title-func h2.poi-edit em').width('auto');
        }
        $('#channel-poi .edit-block').height(contentHeight);
    };

    $page.chkPoiPointData = function (fm) {
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
    };

    $page.chkPoiEventData = function (fm, callback) {
        fm.displayText.value = $.trim(fm.displayText.value);
        fm.btnText.value = $.trim(fm.btnText.value);
        fm.channelUrl.value = $.trim(fm.channelUrl.value);
        fm.notifyMsg.value = $.trim(fm.notifyMsg.value);
        fm.notifyScheduler.value = $.trim(fm.notifyScheduler.value);

        var poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey'),
            todayTimestamp = Date.parse(new Date()),
            notifySchedulerList = [],
            validSchedulerList = [];

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
            if ('event-scheduled' === poiEventTypeKey) {
                if ('' !== fm.notifyScheduler.value) {
                    notifySchedulerList = fm.notifyScheduler.value.split(',');
                    validSchedulerList = $.grep(notifySchedulerList, function (n, i) {
                        return n > todayTimestamp;
                    });
                }
                if (validSchedulerList.length === 0) {
                    $('#poi-event-overlay .event .func ul li.notice').show();
                    callback(false);
                    return false;
                }
            }
        }

        // notice and url reset
        $('#poi-event-overlay .event .func ul li.notice').hide();
        callback(true);
        return true;
    };

    $page.loadYouTubeFlash = function (videoWrap) {
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
    };

    $page.loadVideo = function () {
        var videoId = $('#channel-poi').data('ytid'),
            startSeconds = $('#channel-poi').data('starttime');
        startSeconds = startSeconds - 1 + 1;
        if (!videoId || videoId.length !== 11) {
            $('#poi-event-overlay .wrap .content .video-wrap .video').empty();
            $('#poi-event-overlay .wrap .content .video-wrap .no-video').removeClass('hide');
            return false;
        }
        if (cms.global.YOUTUBE_PLAYER !== undefined && cms.global.YOUTUBE_PLAYER !== null && 'object' === $.type(cms.global.YOUTUBE_PLAYER) && 'function' === $.type(cms.global.YOUTUBE_PLAYER.loadVideoById)) {
            cms.global.YOUTUBE_PLAYER.loadVideoById({
                'videoId': videoId,
                'startSeconds': startSeconds
            });
        }
    };

    // NOTE: The onYouTubePlayerReady function needs to be in the window context
    // so that the ActionScript code can call it after it's loaded
    window.onYouTubePlayerReady = function (playerId) {
        cms.global.YOUTUBE_PLAYER = document.getElementById('youTubePlayerChrome');
        cms.global.YOUTUBE_PLAYER.addEventListener('onStateChange', 'onYouTubePlayerStateChange');
        $page.loadVideo();
    };

    window.onYouTubePlayerStateChange = function (newState) {
        var startSeconds = $('#channel-poi').data('starttime');
        startSeconds = startSeconds - 1 + 1;
        // unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
        if (-1 === newState) {
            //$('#poi-event-overlay .wrap .content .video-wrap .no-video').removeClass('hide');
            cms.global.YOUTUBE_PLAYER.playVideo();
        }
        if (1 === newState) {
            $('#poi-event-overlay .wrap .content .video-wrap .no-video').addClass('hide');
            cms.global.YOUTUBE_PLAYER.seekTo(startSeconds, true);
            cms.global.YOUTUBE_PLAYER.pauseVideo();
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
    };

    $page.playPoiEventAndVideo = function (type) {
        if (type && isNaN(type) && cms.config.POI_TYPE_MAP[type]) {
            // load video
            $('#poi-event-overlay-wrap').data('poiEventType', cms.config.POI_TYPE_MAP[type].code);
            $('#poi-event-overlay-wrap').data('poiEventTypeKey', type);
            if ($('#youTubePlayerChrome').length > 0 && $('body').hasClass('has-load-video')) {
                // cache from preload video to event type video
                $('#poi-event-overlay .wrap .content .video-wrap .no-video').addClass('hide');
                $('#youTubePlayerChrome').appendTo($('#' + type + '-video'));
            } else {
                $('#preload-channel-video').empty();
                $page.loadYouTubeFlash('#' + type + '-video');
            }
            // load POI plugin
            $('#poi-event-overlay .event .video-wrap .poi-display').empty();
            var displayText = $common.strip_tags($.trim($('#poi-event-overlay #' + type + ' input[name=displayText]').val())),
                buttonsText = $common.strip_tags($.trim($('#poi-event-overlay #' + type + ' input[name=btnText]').val()));
            if ('' === displayText) {
                displayText = nn._([cms.global.PAGE_ID, 'poi-event', 'Input display text']);
            }
            if ('' === buttonsText) {
                buttonsText = nn._([cms.global.PAGE_ID, 'poi-event', 'Input button text']);
            }
            $('#poi-event-overlay #' + type + ' .video-wrap .poi-display').poi({
                type: cms.config.POI_TYPE_MAP[type].plugin,
                displayText: displayText,
                buttons: [buttonsText],
                duration: -1
            });
        } else {
            nn.log('POI type error!', 'error');
        }
    };

    $page.preloadChannelVideo = function () {
        var videoId = $('#channel-poi').data('ytid'),
            preloadHook = '#preload-channel-video',
            epList = $('#channel-poi-wrap').tmplItem().data.epList,
            freezePosSec = 25,
            selectedEp = null,
            youTubeUrlPattern = /^http(?:s)?:\/\/www.youtube.com\/watch\?v=([^&]{11})/,
            ytData = null,
            //isZoneLimited = null,             // unused
            hasSyndicateDenied = null,
            hasLimitedSyndication = null,
            //isSyndicateLimited = null,        // unused
            isEmbedLimited = null,
            isUnplayableVideo = null;
        if (videoId && videoId.length === 11 && $('#youTubePlayerChrome').length === 0) {
            $page.loadYouTubeFlash(preloadHook);
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
                nn.api('GET', cms.reapi('/api/episodes/{episodeId}/programs', {
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
                                        hasSyndicateDenied = (ytData.accessControl && ytData.accessControl.syndicate && 'denied' === ytData.accessControl.syndicate) ? true : false;
                                        hasLimitedSyndication = (ytData.status && ytData.status.reason && 'limitedSyndication' === ytData.status.reason) ? true : false;
                                        //isSyndicateLimited = (hasSyndicateDenied || hasLimitedSyndication) ? true : false;
                                        isEmbedLimited = (ytData.accessControl && ytData.accessControl.embed && 'denied' === ytData.accessControl.embed) ? true : false;
                                        isUnplayableVideo = (isEmbedLimited || hasSyndicateDenied || (ytData.status && !hasLimitedSyndication)) ? true : false;
                                    }
                                    if (ytData && !isUnplayableVideo) {
                                        $('#channel-poi').data('ytid', ytData.id);
                                        $('#channel-poi').data('starttime', parseInt(programs[idx].startTime, 10) + freezePosSec);
                                        $page.loadYouTubeFlash(preloadHook);
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
    };

    $page.buildPoiListPageTmpl = function () {
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
        $page.setPoiIcon(poiPage[0].poiItem[0].id, poiPage[0].poiItem[0].eventId);
    };

    $page.buildPoiPointEditTmpl = function (poi_point) {
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
    };

    $page.buildPoiEventOverlayTmpl = function (poi_event) {
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
                var currentFrameMonth = '';
                $('#poi-event-overlay .event').addClass('hide');
                if ($('#poi-point-edit').hasClass('edit')) {
                    // update mode
                    $('#poi-event-overlay').addClass('edit');
                    $('#' + poiEventTypeKey).removeClass('hide');
                    if (false === hasPoiEventCache) {
                        $page.playPoiEventAndVideo(poiEventTypeKey);
                    }
                } else {
                    // insert mode
                    $('#poi-event-overlay').removeClass('edit');
                    if (poiEventTypeKey && cms.config.POI_TYPE_MAP[poiEventTypeKey]) {
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
                    multiSelect: 999,
                    onChangeMonthYear: function (year, month) {
                        currentFrameMonth = month;
                    },
                    onDate: function (date) {
                        var selectedList = $('#datepicker_selected').val().split(','),
                            currentDate = $.datepick.formatDate('yyyy/mm/dd', date),
                            currentMonth = date.getMonth() + 1;
                        return (date >= $.datepick.today()) ? {} : {
                            dateClass: ((-1 !== $.inArray(currentDate, selectedList) && currentMonth === currentFrameMonth) ? 'datepick-selected' : ''),
                            selectable: false
                        };
                    },
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
    };

    $page.removeTotalChangeHook = function () {
        $('body').removeClass('has-change');
        $('body').removeClass('has-poi-change');
        $('body').removeClass('has-preload-video');
        $('body').removeClass('has-load-video');
    };

    $page.goBackPoiList = function (isSaveMode) {
        $page.removeTotalChangeHook();
        $.unblockUI();
        // cache from event type video to preload video
        if ($('#preload-channel-video #youTubePlayerChrome').length === 0 && $('#youTubePlayerChrome').length > 0) {
            $('#preload-channel-video').addClass('hide');
            $('#youTubePlayerChrome').appendTo($('#preload-channel-video'));
            $('body').addClass('has-load-video');
            $('#youTubePlayerChrome').attr('width', 590).attr('height', 332);
        }
        $('#poi-event-overlay .wrap').html('');
        $('#poi-point-edit').html('');
        $('#channel-poi .edit-block').addClass('hide');
        $('#poi-list').removeClass('hide');
        $('#content-main').removeAttr('class');
        $('#title-func h2').hide();
        $('#content-main').addClass('poi-list');
        if (isSaveMode) {
            $('#poi-list .has-poi').removeClass('hide');
            $('#poi-list .btn-create-poi').removeClass('enable').addClass('disable');
            $('#poi-list .poi-info').removeClass('hide');
        }
        $page.setFormHeight();
        $page.preloadChannelVideo();

    };

    $page.setPoiIcon = function (pointId, eventId) {
        nn.api('GET', cms.reapi('/api/poi_events/{poiEventId}', {
            poiEventId: eventId
        }), null, function (poi_event) {
            var setClass = "",
                setText = "",
                modifyTargetDiv = "#poi_point_" + pointId,
                modifyTargetText = "#poi_point_" + pointId + " div.tip-white p.center";
            switch (poi_event.type) {
            case 2:
                setClass = "instant";
                setText = nn._([cms.global.PAGE_ID, 'poi-event', 'Instant Notification']);
                break;
            case 3:
                setClass = "schedule";
                setText = nn._([cms.global.PAGE_ID, 'poi-event', 'Scheduled Notification']);
                break;
            }
            $(modifyTargetDiv).removeClass("null-icon").addClass(setClass);
            $(modifyTargetText).text(setText);
            $(modifyTargetDiv).data("poi-event-id", eventId);
        });
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: channel-poi',
            options: options
        }, 'debug');

        var id = cms.global.USER_URL.param('id');
        if (id > 0 && !isNaN(id) && cms.global.USER_DATA.id) {
            nn.api('GET', cms.reapi('/api/users/{userId}/channels', {
                userId: cms.global.USER_DATA.id
            }), null, function (data) {
                var channelIds = [],
                    channelPoi = {},
                    poiPage = [],
                    poiItem = [];
                if (data.length > 0) {
                    $.each(data, function (i, list) {
                        channelIds.push(list.id);
                    });
                }
                if (-1 === $.inArray(parseInt(id, 10), channelIds)) {
                    $common.showSystemErrorOverlayAndHookError('You are not authorized to edit this channel.');
                    return;
                }
                nn.api('GET', cms.reapi('/api/channels/{channelId}', {
                    channelId: id
                }), null, function (channel) {
                    if (channel.contentType === cms.config.YOUR_FAVORITE) {
                        $common.showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                        return;
                    }
                    $common.showProcessingOverlay();
                    nn.api('GET', cms.reapi('/api/channels/{channelId}/episodes', {
                        channelId: id
                    }), null, function (epList) {
                        nn.api('GET', cms.reapi('/api/channels/{channelId}/poi_points', {
                            channelId: id
                        }), null, function (poiList) {
                            channelPoi = $.extend(channelPoi, channel);
                            channelPoi.epList = epList;
                            channelPoi.poiList = poiList;
                            $('#poi-event-overlay .wrap').html('');     // reset for language switch
                            $('#func-nav ul').html('');
                            $('#func-nav-tmpl').tmpl(channel).appendTo('#func-nav ul');
                            $('#content-main').html('');
                            $('#content-main-tmpl').tmpl(channelPoi).appendTo('#content-main');
                            if (epList && epList.length <= 0) {
                                $('#poi-list .btn-create-poi').removeClass('enable').addClass('disable');
                                $('#poi-list .no-episode').removeClass('hide');
                            }
                            if (poiList && poiList.length > 0) {
                                $('#poi-list .btn-create-poi').removeClass('enable').addClass('disable');
                                $('#poi-list .has-poi').removeClass('hide');
                                $('#poi-list .poi-info').removeClass('hide');
                                $.each(poiList, function (i, item) {
                                    poiItem.push(item);
                                });
                                if (poiItem.length > 0) {
                                    poiPage.push({
                                        poiItem: poiItem
                                    });
                                    poiItem = [];
                                }
                            }
                            $('#poi-list-page').html('');
                            $('#poi-list-page-tmpl').tmpl(poiPage).prependTo('#poi-list-page');
                            $.each(poiList, function (i, item) {
                                nn.api('GET', cms.reapi('/api/poi_campaigns/{poiCampaignId}/pois', {
                                    poiCampaignId: cms.global.CAMPAIGN_ID
                                }), {
                                    poiPointId: item.id
                                }, function (pois) {
                                    if (pois && pois.length > 0 && pois[0] && pois[0].eventId && !isNaN(pois[0].eventId)) {
                                        $page.setPoiIcon(pois[0].pointId, pois[0].eventId);
                                    } else {
                                        $('#overlay-s').fadeOut(0);
                                    }
                                });
                            });

                            $('#overlay-s').fadeOut('fast', function () {
                                $('#title-func h2.poi-list em').data('width', $('#title-func h2.poi-list em').width());
                                $('#title-func h2.poi-create em').data('width', $('#title-func h2.poi-create em').width());
                                $('#title-func h2.poi-edit em').data('width', $('#title-func h2.poi-edit em').width());
                                $('#title-func h2').hide();
                                $('#title-func h2.poi-list').show();
                                $page.setFormHeight();
                                $page.preloadChannelVideo();
                            });
                        });
                    });
                });
            });
        } else {
            $common.showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
            return;
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('channel-poi')));
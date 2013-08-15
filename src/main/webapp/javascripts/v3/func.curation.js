/*jslint browser: true, nomen: true, regexp: true, unparam: true */
/*global $, nn, cms, SWFUpload */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.chkDuration = function () {
        var duration = $('.set-time').data('originDuration'),
            startH = parseInt($('input[name=startH]').val(), 10) * 60 * 60,
            startM = parseInt($('input[name=startM]').val(), 10) * 60,
            startS = parseInt($('input[name=startS]').val(), 10),
            endH = parseInt($('input[name=endH]').val(), 10) * 60 * 60,
            endM = parseInt($('input[name=endM]').val(), 10) * 60,
            endS = parseInt($('input[name=endS]').val(), 10),
            startTime = parseInt(startH + startM + startS, 10),
            endTime = parseInt(endH + endM + endS, 10);
        if (!duration) {
            $('#cur-edit .edit-time .btn-wrap .notice').show();
            return false;
        }
        if ('' === $.trim($('input[name=startH]').val()) || '' === $.trim($('input[name=startM]').val()) || '' === $.trim($('input[name=startS]').val()) || '' === $.trim($('input[name=endH]').val()) || '' === $.trim($('input[name=endM]').val()) || '' === $.trim($('input[name=endS]').val())) {
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
    };

    $page.chkCurationData = function (fm, src) {
        var cntProgram = $('#storyboard-list li').length,
            duration = 0,
            itemData = null;
        $('#storyboard-list li').each(function (i) {
            itemData = $(this).tmplItem().data;
            duration += parseInt(itemData.ytDuration, 10);
        });
        if ($('body').hasClass('has-trimtime-change')) {
            $common.showUnsaveTrimTimeOverlay(src);
            return false;
        }
        if ($('body').hasClass('has-titlecard-change')) {
            $common.showUnsaveTitleCardOverlay(src);
            return false;
        }
        if (cntProgram <= 0 || duration <= 0) {
            $common.showSystemErrorOverlay('Please curate at least one valid video.');
            return false;
        }
        if (cntProgram > cms.config.PROGRAM_MAX) {
            $common.showSystemErrorOverlay('You have reached the maximum amount of 50 videos.');
            return false;
        }
        return true;
    };

    $page.chkPoiPointData = function (fm) {
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
        if ('' === $.trim($('input[name=poiStartH]').val()) || '' === $.trim($('input[name=poiStartM]').val()) || '' === $.trim($('input[name=poiStartS]').val()) || '' === $.trim($('input[name=poiEndH]').val()) || '' === $.trim($('input[name=poiEndM]').val()) || '' === $.trim($('input[name=poiEndS]').val())) {
            $('#poi-edit .invalid-notice').removeClass('hide');
            return false;
        }
        if (isNaN($('input[name=poiStartH]').val()) || isNaN($('input[name=poiStartM]').val()) || isNaN($('input[name=poiStartS]').val()) || isNaN($('input[name=poiEndH]').val()) || isNaN($('input[name=poiEndM]').val()) || isNaN($('input[name=poiEndS]').val())) {
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
            if ($('#cur-poi-edit').hasClass('edit') && poiItem.id === poiPointId) {
                // NOTE: Returning non-false is the same as a continue statement in a for loop
                return true;
            }
            if (!(startTime > poiItem.endTime || poiItem.startTime > endTime)) {
                $('#poi-edit .overlap-notice #poi-name').text(poiItem.name);
                $('#poi-edit .overlap-notice .time').text('(' + $common.formatDuration(poiItem.startTime, true) + ' to ' + $common.formatDuration(poiItem.endTime, true) + ')');
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
        if (cms.global.YOUTUBE_PLAYER !== undefined && cms.global.YOUTUBE_PLAYER !== null && 'object' === $.type(cms.global.YOUTUBE_PLAYER) && 'function' === $.type(cms.global.YOUTUBE_PLAYER.loadVideoById)) {
            cms.global.YOUTUBE_PLAYER.seekTo(startTime, true);
            cms.global.YOUTUBE_PLAYER.pauseVideo();
        }
        // notice reset
        $('#cur-poi-edit .edit-form .notice').addClass('hide');
        return true;
    };
    // POI event edit form data validation.
    $page.chkPoiEventData = function (fm, callback) {
        var poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey');

        fm.displayText.value = $.trim(fm.displayText.value);
        fm.channelUrl.value = $.trim(fm.channelUrl.value);
        fm.notifyMsg.value = $.trim(fm.notifyMsg.value);
        fm.notifyScheduler.value = $.trim(fm.notifyScheduler.value);

        // var poiEventTypeKey = $('#poi-event-overlay-wrap').data('poiEventTypeKey'),
        var todayTimestamp = Date.parse(new Date()),
            notifySchedulerList = [],
            validSchedulerList = [],
            url = $.url(fm.channelUrl.value),
            hash = '',
            param = '',
            cid = '',
            eid = '',
            normalUrl = 'http://www.9x9.tv/view?',
            pathAllow = ['/', '/view', '/playback'],
            hostAllow = [
                'www.9x9.tv',
                'beagle.9x9.tv',
                'v3alpha.9x9.tv',
                'dev.teltel.com',
                'demo.doubleservice.com',
                'localhost'
            ];
        // Check if any input field is empty.
        if ('' === fm.displayText.value) {
            $('#poi-event-overlay .event .func ul li.notice').show();
            callback(false);
            return false;
        }

        if (poiEventTypeKey === 'event-poll') {
            var isAllButtonFilled = true;
            $(fm).find('input.poll-button').each(function (index, element) {
                if ($.trim(element.value) === '') {     
                    isAllButtonFilled = false;               
                    $('#poi-event-overlay .event .func ul li.notice').show();
                    callback(false);
                    return false;
                }
            });
            
            // notice and url reset
            if (isAllButtonFilled) {
                $('#poi-event-overlay .event .func ul li.notice').hide();
                callback(true);
                return true;
            } else {
                return false;
            }
        } else {
            fm.btnText.value = $.trim(fm.btnText.value);
            if ('' === fm.btnText.value) {
                $('#poi-event-overlay .event .func ul li.notice').show();
                callback(false);
                return false;
            }
        }

        if (-1 !== $.inArray(poiEventTypeKey, ['event-scheduled', 'event-instant'])) {
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
        }

        if ('' === fm.channelUrl.value) {
            $('#poi-event-overlay .event .func ul li.notice').show();
            callback(false);
            return false;
        }
        // Check if channel or episode url field is unmodified.
        if (nn._([cms.global.PAGE_ID, 'poi-event', 'Input 9x9 channel or episode URL']) === fm.channelUrl.value) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        // Push current window.location.origin to the hostAllow array if it isn't in the array.
        if (cms.global.USER_URL && -1 === $.inArray(cms.global.USER_URL.attr('host'), hostAllow)) {
            hostAllow.push(cms.global.USER_URL.attr('host'));
        }
        // Check if the host domain of the channel url field is in the hostAllow array.
        if (-1 === $.inArray(url.attr('host'), hostAllow)) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        // Check if the file path of the channel url field is in the hostAllow array.
        if (-1 === $.inArray(url.attr('path'), pathAllow)) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        // CHeck if the file path of the channel url is '/' and it is empty after the # tag.
        if ('/' === url.attr('path') && !url.attr('fragment')) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        if ('/view' === url.attr('path') && !url.attr('query')) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        if ('/playback' === url.attr('path') && !url.attr('query')) {
            $('#poi-event-overlay .event .event-input .fminput .notice').show();
            callback(false);
            return false;
        }
        if ('' !== url.attr('fragment')) {
            hash = url.attr('fragment').substr(1).replace(/\!/g, '&');
            if (isNaN(hash)) {
                url = $.url('http://fake.url.dev.teltel.com/?' + hash);
            } else {
                cid = hash;
            }
        }
        if ('' !== url.attr('query')) {
            param = url.param();
            if ((param.ch && '' !== param.ch) || (param.channel && '' !== param.channel)) {
                cid = (param.ch && '' !== param.ch) ? param.ch : param.channel;
            }
            if ((param.ep && '' !== param.ep) || (param.episode && '' !== param.episode)) {
                eid = (param.ep && '' !== param.ep) ? param.ep : param.episode;
                if (11 !== eid.length) {
                    eid = eid.substr(1);
                }
            }
        }
        if (!cid) {
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
        if (!eid || 11 === eid.length) {
            nn.api('GET', cms.reapi('/api/channels/{channelId}', {
                channelId: cid
            }), null, function (channel) {
                if (channel.id) {
                    if (11 === eid.length) {
                        nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + eid + '?alt=jsonc&v=2&callback=?', null, function (youtubes) {
                            if (youtubes.data) {
                                // notice and url reset
                                $('#poi-event-overlay .event .func ul li.notice').hide();
                                normalUrl = normalUrl + 'ch=' + cid + '&ep=' + eid;
                                fm.channelUrl.value = normalUrl;
                                callback(true);
                                return true;
                            }
                            $('#poi-event-overlay .event .event-input .fminput .notice').show();
                            callback(false);
                            return false;
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
            nn.api('GET', cms.reapi('/api/episodes/{episodeId}', {
                episodeId: eid
            }), null, function (episode) {
                if (episode.id && parseInt(cid, 10) === parseInt(episode.channelId, 10)) {
                    // notice and url reset
                    $('#poi-event-overlay .event .func ul li.notice').hide();
                    normalUrl = normalUrl + 'ch=' + cid + '&ep=e' + eid;
                    fm.channelUrl.value = normalUrl;
                    callback(true);
                    return true;
                }
                $('#poi-event-overlay .event .event-input .fminput .notice').show();
                callback(false);
                return false;
            });
        }
    };

    $page.setVideoMeasure = function () {
        // var windowHeight = $(window).height(),
        //     windowWidth = $(window).width(),
        //     epcurateNavHeight = 46,
        //     epcurateTabsHeight = 38,
        //     videoControlHeight = 44,
        //     storyboardHeight = 171,                             // exclude auto-height
        //     btnsHeight = 48,
        //     extraHeightMin = 18 * 4,
        //     videoWidthMin = 400,
        //     videoHeightMin = 269,                               // 225(400/16*9) + 44(videoControlHeight)
        //     remainHeight = windowHeight - epcurateNavHeight - epcurateTabsHeight - videoControlHeight - storyboardHeight - btnsHeight - extraHeightMin,
        //     remainBase = parseInt(remainHeight / 9, 10),
        //     remainBaseWidth = remainBase * 16,
        //     remainBaseHeight = remainBase * 9,
        //     videoBase = parseInt((windowWidth - 616) / 16, 10), // 616: 1016-400 min window width - min video width
        //     videoBaseWidth = videoBase * 16,
        //     videoBaseHeight = videoBase * 9;
        // if (windowWidth < 1016) {
        //     $('#epcurate-curation #video-player .video').height(videoHeightMin);
        //     $('#epcurate-curation #video-player .video').width(videoWidthMin);
        //     $('#epcurate-curation ul.tabs').css('padding-left', videoWidthMin + 'px');
        // }
        // if (windowWidth >= 1016) {
        //     if (remainHeight < videoHeightMin) {
        //         $('#epcurate-curation #video-player .video').height(videoHeightMin);
        //         $('#epcurate-curation #video-player .video').width(videoWidthMin);
        //         $('#epcurate-curation ul.tabs').css('padding-left', videoWidthMin + 'px');
        //     } else {
        //         if (remainHeight < videoBaseHeight) {
        //             $('#epcurate-curation #video-player .video').height(remainBaseHeight + videoControlHeight);
        //             $('#epcurate-curation #video-player .video').width(remainBaseWidth);
        //             $('#epcurate-curation ul.tabs').css('padding-left', remainBaseWidth + 'px');
        //         } else {
        //             $('#epcurate-curation #video-player .video').height(videoBaseHeight + videoControlHeight);
        //             $('#epcurate-curation #video-player .video').width(videoBaseWidth);
        //             $('#epcurate-curation ul.tabs').css('padding-left', videoBaseWidth + 'px');
        //         }
        //     }
        // }
        // $('#video-player').data('width', $('#video-player .video').width());
        // $('#video-player').data('height', $('#video-player .video').height());
        // $('#epcurate-curation .tab-content').height($('#video-player').data('height'));

        // // Check video player area width/height ratio.
        // var player = $('#video-player'),
        //     tabs = $('#epcurate-curation .curation-content'),
        //     videoWidth = player.width(),
        //     videoHeight = player.height(),
        //     videoAreaWidth = tabs.offset().left,
        //     videoAreaHeight = $('#storyboard').offset().top - $('#epcurate-curation').offset().top - 37,
        //     maxWidth,
        //     topOffset;
        // // If width/(height + 44) < 400/269
        // if (videoAreaWidth/(videoAreaHeight-36-44) >= 16/9 && videoAreaWidth > 400 && $(window).width() > 1010) {
        // //     Set video player area max-width.
        //     maxWidth = (videoAreaHeight-36-44)/0.5625;
        //     player.css('max-width', maxWidth);
        //     tabs.width($(window).width()-maxWidth);

        //     player.css('padding-top', '');
        //     tabs.find('> div').css('padding-top', '');
        // }
        // else {
        //     // player.css('max-width', '');
        //     topOffset = (videoAreaHeight - videoHeight - 36)/2;
        //     tabs.width('');
        //     // player.css('top', '+=' + topOffset);
        //     player.css('padding-top', 18 + topOffset);
        //     tabs.find('> div').css('padding-top', 18 + topOffset);
        // }
        // // Set edit area height to equal video player
        // tabs.find('> div').height(videoHeight);
        // $('#cur-add p.textarea').height(videoHeight - 23 - 4 - 10 - 32);
    };

    $page.setSpace = function () {
        // var windowHeight = $(window).height(),
        //     epcurateNavHeight = 46,
        //     epcurateTabsHeight = 38,
        //     videoHeight = $('#epcurate-curation #video-player .video').height(),
        //     videoHeightMin = 269,
        //     videoControlHeight = 44,
        //     storyboardHeight = 171,
        //     btnsHeight = 48,
        //     extraHeight = windowHeight - epcurateNavHeight - epcurateTabsHeight - videoHeight - storyboardHeight - btnsHeight,
        //     extraHeightSrc = extraHeight,
        //     extraHeightMin = 18 * 4,
        //     contentWrapHeight = epcurateTabsHeight + videoHeight + storyboardHeight + btnsHeight,
        //     contentWrapHeightMin = epcurateTabsHeight + videoHeightMin + storyboardHeight + btnsHeight + extraHeightMin,
        //     titlecardHeight = videoHeight - videoControlHeight,
        //     windowWidth = $(window).width(),
        //     videoWidth = $('#epcurate-curation #video-player .video').width(),
        //     curAddWidth = $('#epcurate-curation #cur-add').width(),
        //     curEditWidth = $('#epcurate-curation #cur-edit').width(),
        //     episodeInfoWidth = $('#storyboard .storyboard-info .episode-storyboard').width(),
        //     channelTitleWidth = $('#storyboard .storyboard-info .channel-name .title').width(),
        //     episodeTitleWidth = $('#storyboard .storyboard-info .episode-name .title').width();
        // if (extraHeightSrc < extraHeightMin) {
        //     extraHeight = extraHeightMin;
        // }
        // contentWrapHeight = contentWrapHeight + extraHeight;
        // $('p.auto-height').height(extraHeight / 4);
        // $('#storyboard-slider').css('bottom', extraHeight / 4 + 'px');
        // $('#storyboard-slider').width(windowWidth - 30);
        // $('#storyboard-slider').attr('data-orig-slider-width', windowWidth - 30);
        // $('.video .canvas').width('100%');
        // $('.video .canvas').height(titlecardHeight);

        // if (windowWidth > 1016) {
        //     $('#epcurate-curation #cur-add, #cur-poi, #cur-poi-edit').css('padding-left', (windowWidth - videoWidth - curAddWidth) / 2 + 'px');
        //     $('#epcurate-curation #cur-edit').css('padding-left', (windowWidth - videoWidth - curEditWidth) / 2 + 'px');
        // } else {
        //     $('#epcurate-curation #cur-add, #cur-poi, #cur-poi-edit').css('padding-left', '32px');
        //     $('#epcurate-curation #cur-edit').css('padding-left', '32px');
        // }
        // // curation nav width
        // if (windowWidth < 1024) {
        //     $('#epcurate-nav ul').css('width', '256px');
        //     $('#epcurate-nav ul li').css('width', '128px');
        // }
        // if (windowWidth >= 1024 && windowWidth <= 1252) {
        //     $('#epcurate-nav ul').css('width', (windowWidth - 768) + 'px');
        //     $('#epcurate-nav ul li').css('width', (windowWidth - 768) / 2 + 'px');
        // }
        // if (windowWidth > 1252) {
        //     $('#epcurate-nav ul').css('width', '484px');
        //     $('#epcurate-nav ul li').css('width', '242px');
        // }
        // if (contentWrapHeight <= contentWrapHeightMin) {
        //     $('#content-wrap').height(contentWrapHeightMin);
        //     $('body').css('overflow', 'auto');
        // } else {
        //     $('#content-wrap').height(contentWrapHeight);
        //     if (extraHeightSrc < extraHeightMin && extraHeightSrc > 0) {
        //         $('body').css('overflow', 'auto');
        //     } else {
        //         $('body').css('overflow', 'hidden');
        //     }
        // }
        // $('#channel-name, #episode-name').width((windowWidth - episodeInfoWidth - 34 - 50 - channelTitleWidth - episodeTitleWidth - 10) / 2);
        // $('#channel-name').text($('#channel-name').data('meta')).addClass('ellipsis').ellipsis();
        // $('#episode-name').text($('#episode-name').data('meta')).addClass('ellipsis').ellipsis();
        // $('#channel-name, #episode-name').width('auto');
    };

    $page.animateTitleCardProgress = function (opts) {
        if (!opts || !opts.duration) {
            return;
        }
        var duration = opts.duration,
            width = $('#video-player .video').width();
        $('#video-control').show();
        $('#btn-play').addClass('hide');
        $('#btn-pause').removeClass('hide');
        //$('#btn-pause').data('opts', opts);
        $('#play-time .duration').text($common.formatDuration(duration));
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
    };

    $page.cancelTitleCard = function () {
        $('#video-player .video .canvas').titlecard('cancel');
        $('#play-time .played').countdown('destroy');
        $('#btn-play').removeClass('hide');
        $('#btn-pause').addClass('hide').removeData('opts');    // NOTE: removeData('opts')
        $('#play-dragger').clearQueue().stop().css('left', '0');
        $('#played').clearQueue().stop().css('width', '0');
    };

    $page.wrapTitleCardCanvas = function () {
        $('#video-player .video').html('<div class="canvas"></div>');
        $('#video-player .video .canvas').hide().css('height', $('#video-player').height() - 44).show();    // 44: $('#video-control')
    };

    $page.adaptTitleCardOption = function (opts) {
        if (!opts || !opts.message) {
            opts = cms.config.TITLECARD_DEFAULT_OPTION;
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
    };

    $page.computeTitleCardEditOption = function () {
        var option = {
            message: $common.strip_tags($.trim($('#text').val())),
            align: $('#cur-edit .edit-title input[name=align]:checked').val(),
            effect: $('#effect').val(),
            duration: $('#duration').val(),
            size: $('#fontSize').val(),
            color: $('#fontColor').val(),
            style: ($('#cur-edit .edit-title input[name=fontStyle]:checked').length > 0) ? 'italic' : 'normal',
            weight: ($('#cur-edit .edit-title input[name=fontWeight]:checked').length > 0) ? 'bold' : 'normal',
            bgColor: $('#backgroundColor').val(),
            bgImage: ('image' === $('#cur-edit .edit-title input[name=bg]:checked').val() && '' !== $('#backgroundImage').val()) ? $('#backgroundImage').val() : ''
        };
        return option;
    };

    $page.enableTitleCardEdit = function () {
        $('#cur-edit .edit-title').removeClass('disable');
        $('#cur-edit .select').attr('class', 'select enable');
        $('#cur-edit input, #cur-edit textarea').prop('disabled', false);
        $.uniform.update('#cur-edit input, #cur-edit textarea');
        $('#cur-edit .font-container .font-l, #cur-edit .font-container .font-s').removeClass('disabled').addClass('enable');
    };

    $page.disableTitleCardEdit = function () {
        $('#cur-edit .edit-title').addClass('disable');
        $('#cur-edit .select').attr('class', 'select disable');
        $('#cur-edit input, #cur-edit textarea').prop('disabled', true);
        $.uniform.update('#cur-edit input, #cur-edit textarea');
        $('#cur-edit .font-container .font-l, #cur-edit .font-container .font-s').removeClass('enable').addClass('disabled');
    };

    $page.addVideoPlayingHook = function (element) {
        element.addClass('playing').addClass('on');
        element.next().addClass('next-playing');
    };

    $page.removeVideoPlayingHook = function () {
        $('#storyboard li').removeClass('playing').removeClass('next-playing').removeClass('on');
    };

    $page.addTrimTimeEditHook = function () {
        $('#storyboard-listing li.playing').addClass('trim-time');
    };

    $page.removeTrimTimeEditHook = function () {
        $('#storyboard li').removeClass('trim-time');
    };

    $page.enableTrimTimeEdit = function () {
        $('#cur-edit p.time').removeClass('disable');
        $('#cur-edit input.time').prop('disabled', false);
        $('#cur-edit .set-time .total-time').addClass('hide');
        $('#cur-edit .btn-wrap .btns').removeClass('hide');
        $('#cur-edit .btn-wrap .btn-edit').addClass('hide');
    };

    $page.disableTrimTimeEdit = function () {
        $('#cur-edit p.time').addClass('disable');
        $('#cur-edit input.time').prop('disabled', true);
        $('#cur-edit .set-time .total-time').removeClass('hide');
        $('#cur-edit .btn-wrap .btns').addClass('hide');
        $('#cur-edit .btn-wrap .btn-edit').removeClass('hide');
        $('#cur-edit .edit-time .btn-wrap .notice').hide();
    };

    $page.addTitleCardPlayingHook = function (element, pos) {
        element.children('.title').children('a.' + pos + '-title').addClass('playing');
    };

    $page.removeTitleCardPlayingHook = function () {
        $('#storyboard li .title a').removeClass('playing');
    };

    $page.addTitleCardEditHook = function (element) {
        element.parent().parent().addClass('edit');                     // parent li
        element.addClass('edit');                                       // self a (begin-title or end-title)
    };

    $page.removeTitleCardEditHook = function () {
        $('#storyboard-list li').removeClass('edit');
        $('#storyboard-list li p.title a').removeClass('edit');
        $('#storyboard-list li p.hover-func a').removeClass('edit');
    };

    $page.removeTotalChangeHook = function () {
        $('body').removeClass('has-change');
        $('body').removeClass('has-trimtime-change');
        $('body').removeClass('has-poi-change');
        $('body').removeClass('has-titlecard-change');
    };

    $page.animateStoryboard = function (add) {
        var list = $('#storyboard-listing li').length,
            distance = (list + add) * 2,
            windowWidth = $(window).width(),
            storyboardMove = distance / 100 * (5700 - windowWidth + 17);
        if ((list + add) > 8) {
            $("#storyboard-wrap").scrollLeft(storyboardMove);
            $("#storyboard-wrap").perfectScrollbar('update');
        }
    };

    $page.sumStoryboardInfo = function () {
        var length = $('#storyboard-list li').length,
            leftLength = cms.config.PROGRAM_MAX - length,
            duration = 0,
            itemData = null,
            durationMin = 0,
            durationSec = 0,
            durationHou = 0;
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
        durationMin = parseInt(duration / 60, 10);
        durationSec = parseInt(duration % 60, 10);
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
        $('#storyboard-list .notice').css('left', parseInt((123 * length) + 9, 10) + 'px');
        $('#storyboard-listing li').removeClass('last last2');
        $('#storyboard-listing li').eq(48).addClass('last2');
        $('#storyboard-listing li').eq(49).addClass('last');
    };

    $page.rebuildVideoNumber = function (base) {
        base = base || 0;
        $('#storyboard-list li').each(function (i) {
            if ((i + 1) > base) {
                $(this).children('p.order').text(i + 1);
            }
        });
    };

    $page.resizeTitleCard = function () {
        // var videoHeight = ($('#video-player').width() / 16) * 9,
        //     videoPlayerHeight = videoHeight + 44;   // 44: $('#video-control')
        // $('#video-player').css('height', videoPlayerHeight + 'px');
        // $('#video-player .video').css('height', videoPlayerHeight + 'px');
        // $('#video-player .video .titlecard-outer').css('height', videoHeight + 'px');
    };

    $page.resizeFromFontRadix = function () {
        // if ($('#titlecard-outer').length > 0) {
        //     var radix = $('#titlecard-outer').tmplItem().data.size;
        //     $('#titlecard-inner').css('font-size', Math.round($('#epcurate-curation #video-player .video').width() / radix) + 'pt');
        // }
    };

    $page.verticalAlignTitleCard = function () {
        // vertical align
        // var wrapWidth = $('#titlecard-outer').width(),
        //     wrapHeight = (wrapWidth / 16) * 9,
        //     selfWidth = $('#titlecard-outer').children('.titlecard-middle').children('.titlecard-inner').width(),
        //     selfHeight = $('#titlecard-outer').children('.titlecard-middle').children('.titlecard-inner').height(),
        //     selfLeft = 0,
        //     selfTop = 0;
        // if (wrapWidth > selfWidth) {
        //     selfLeft = (wrapWidth - selfWidth) / 2;
        // }
        // if (wrapHeight > selfHeight) {
        //     selfTop = (wrapHeight - selfHeight) / 2;
        // }
        // $('#titlecard-outer').children('.titlecard-middle').children('.titlecard-inner').css({
        //     top: selfTop + 'px',
        //     left: selfLeft + 'px'
        // });
    };

    $page.setupFontRadix = function (action) {
        var size = parseInt($('#fontSize').val(), 10),
            width = $('#epcurate-curation #video-player .video').width();
        if ('up' === action) {
            $('.font-container .font-s').removeClass('disable');
            if (size <= cms.config.FONT_RADIX_MIN) {
                $('.font-container .font-l.enable').addClass('disable');
            } else {
                size = size - 1;
                $('#fontSize').val(size);
                $('#titlecard-inner').css('font-size', Math.round(width / size) + 'pt');
                $page.verticalAlignTitleCard();
            }
        } else {
            $('.font-container .font-l').removeClass('disable');
            if (size >= cms.config.FONT_RADIX_MAX) {
                $('.font-container .font-s.enable').addClass('disable');
            } else {
                size = size + 1;
                $('#fontSize').val(size);
                $('#titlecard-inner').css('font-size', Math.round(width / size) + 'pt');
                $page.verticalAlignTitleCard();
            }
        }
    };

    $page.switchFontRadix = function (radix) {
        radix = parseInt(radix, 10);
        $('.font-container .font-l, .font-container .font-s').removeClass('disable');
        if (radix <= cms.config.FONT_RADIX_MIN) {
            $('.font-container .font-l').addClass('disable');
        }
        if (radix >= cms.config.FONT_RADIX_MAX) {
            $('.font-container .font-s').addClass('disable');
        }
    };

    $page.switchFontAlign = function (align) {
        $('#titlecard-inner').css('text-align', align);
    };

    $page.switchBackground = function (bg, name) {
        if ('image' === bg) {
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
    };

    $page.cancelEffect = function (element) {
        element
            .clearQueue()
            .stop()
            .children('span')
                .clearQueue()
                .stop()
                .children('em')
                    .clearQueue()
                    .stop();
    };

    $page.previewEffect = function (element, effect) {
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
        $page.cancelEffect(element);

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
    };

    $page.getPoiItemSize = function () {
        return parseInt(($('#video-player').data('height') - 104) / 33, 10);    // 104: 269(video min height)-(33*5)
    };

    $page.countPoiItem = function () {
        $('#cur-poi .poi-list ul').data('item', $page.getPoiItemSize());
        // $('#cur-poi .poi-list ul').height($('#cur-poi .poi-list ul').data('item') * 33);
    };

    $page.unblockPoiUI = function () {
        $.unblockUI();  // ready for unblock POI event overlay
        $('body').removeClass('enter-poi-edit-mode');
        $('body').removeClass('from-poi-edit-mode');
        $('body').removeClass('from-poi-overlay-edit-mode');
        $('#storyboard, #content-main-wrap .form-btn, #epcurate-nav ul li.publish').unblock();
        $('#epcurate-nav ul li.publish').removeClass('mask');
        $('#video-player .video').removeClass('transparent');
        $('#poi-event-overlay .wrap').html('');
        $('#cur-poi-edit').html('');
    };

    $page.removePoiTab = function () {
        $('#epcurate-curation ul.tabs li.poi').addClass('hide');
        $('#epcurate-curation ul.tabs li.edit-poi').addClass('hide');
    };

    $page.uploadImage = function (isDisableEdit) {
        var parameter = {
            'prefix': 'cms',
            'type':   'image',
            'size':   20485760,
            'acl':    'public-read'
        };
        nn.api('GET', cms.reapi('/api/s3/attributes'), parameter, function (s3attr) {
            var timestamp = (new Date()).getTime(),
                handlerSwfUploadLoaded = function () {
                    if (isDisableEdit) {
                        this.setButtonDisabled(true);
                    } else {
                        this.setButtonDisabled(false);
                    }
                },
                handlerFileDialogStart = function () {
                    $('#btn-pause').trigger('click');
                    $('.background-container .highlight').addClass('hide');
                },
                handlerUploadProgress = function (file, completed, total) {
                    $('.background-container p.img .loading').show();
                    this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Uploading...']) + '</span>');
                },
                handlerUploadSuccess = function (file, serverData, recievedResponse) {
                    $('.background-container p.img .loading').hide();
                    this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
                    if (!file.type) {
                        file.type = nn.getFileTypeByName(file.name);
                    }
                    this.setButtonDisabled(false); // enable upload button again
                    var url = 'http://' + s3attr.bucket + '.s3.amazonaws.com/' + parameter.prefix + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase();
                    $('#thumbnail-backgroundImage').attr('src', url + '?n=' + Math.random());
                    $('#backgroundImage').val(url);
                    $('#titlecard-outer img').remove();
                    $('#titlecard-outer').append('<img src="' + $('#thumbnail-backgroundImage').attr('src') + '" style="width: 100%; height: 100%; border: none;" />');
                },
                handlerUploadError = function (file, code, message) {
                    $('.background-container p.img .loading').hide();
                    this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
                    this.setButtonDisabled(false);
                    if (code === -280) { // user cancel upload
                        nn.log(message, 'error'); // show some error prompt
                    } else {
                        nn.log(message, 'error'); // show some error prompt
                    }
                },
                handlerFileQueue = function (file) {
                    if (!file.type) {
                        file.type = nn.getFileTypeByName(file.name); // Mac Chrome compatible
                    }
                    var postParams = {
                        "AWSAccessKeyId": s3attr.id,
                        "key":            parameter.prefix + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase(),
                        "acl":            parameter.acl,
                        "policy":         s3attr.policy,
                        "signature":      s3attr.signature,
                        "content-type":   parameter.type,
                        "success_action_status": "201"
                    };
                    this.setPostParams(postParams);
                    this.startUpload(file.id);
                    this.setButtonDisabled(true);
                },
                handlerFileQueueError = function (file, code, message) {
                    if (code === -130) { // error file type
                        $('.background-container .highlight').removeClass('hide');
                    }
                },
                settings = {
                    flash_url:                  'javascripts/libs/swfupload/swfupload.swf',
                    upload_url:                 'http://' + s3attr.bucket + '.s3.amazonaws.com/', // http://9x9tmp-ds.s3.amazonaws.com/
                    file_size_limit:            parameter.size,
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
                    button_window_mode:         SWFUpload.WINDOW_MODE.TRANSPARENT,
                    http_success:               [ 201 ],
                    swfupload_loaded_handler:   handlerSwfUploadLoaded,
                    file_dialog_start_handler:  handlerFileDialogStart,
                    upload_progress_handler:    handlerUploadProgress,
                    upload_success_handler:     handlerUploadSuccess,
                    upload_error_handler:       handlerUploadError,
                    file_queued_handler:        handlerFileQueue,
                    file_queue_error_handler:   handlerFileQueueError,
                    debug:                      false
                },
                swfu = new SWFUpload(settings);
            swfu.debug = cms.config.IS_DEBUG;
        });
    };

    $page.buildTitleCardEditTmpl = function (opts, isUpdateMode, isDisableEdit) {
        $('.edit-title').html($('#titlecard-edit-tmpl').tmpl(opts, {
            isUpdateMode: isUpdateMode,
            hasBgImage: (('' !== opts.bgImage && '' === opts.bgColor) || ('' !== opts.bgImage && '' !== opts.bgColor && cms.config.TITLECARD_DEFAULT_IMAGE_BY_SYSTEM !== opts.bgImage))
        }));
        $page.uploadImage(isDisableEdit);
        $('#cur-edit input, #cur-edit textarea, #cur-edit select').uniform();
        $page.switchFontRadix($('#fontSize').val());
        $page.switchFontAlign($('#cur-edit .edit-title input[name=align]:checked').val());
        $page.switchBackground($('#cur-edit .edit-title input[name=bg]:checked').val(), $('#cur-edit .edit-title input[name=bg]:checked').attr('name'));
    };

    $page.buildTitleCardTmpl = function (opts) {
        if (opts && opts.message) {
            $('#video-player .video').html($('#titlecard-tmpl').tmpl(opts, {
                message: $common.nl2br($common.strip_tags($.trim(opts.message))),
                outerHeight: ($('#epcurate-curation #video-player .video').height() - 44),  // 44: $('#video-control')
                fontSize: Math.round($('#epcurate-curation #video-player .video').width() / opts.size),
                hasBgImage: (('' !== opts.bgImage && '' === opts.bgColor) || ('' !== opts.bgImage && '' !== opts.bgColor && cms.config.TITLECARD_DEFAULT_IMAGE_BY_SYSTEM !== opts.bgImage))
            }));
            $('#play-time .played').text('00:00');
            $('#play-time .duration').text($common.formatDuration(opts.duration));
            $page.verticalAlignTitleCard();
        }
    };

    $page.buildPoiInfoTmpl = function (element) {
        // poi-info-tmpl
        if (element && element.tmplItem() && element.tmplItem().data && element.tmplItem().data.poiList) {
            var videoInfoData = element.tmplItem().data,
                startTimeInt = videoInfoData.startTime,
                endTimeInt = (videoInfoData.endTime > 0) ? videoInfoData.endTime : videoInfoData.duration,
                trimStartTime = $common.formatDuration(startTimeInt, true).split(':'),
                trimEndTime = $common.formatDuration(endTimeInt, true).split(':'),
                trimDuration = $common.formatDuration((endTimeInt - startTimeInt), true).split(':'),
                itemSize = $page.getPoiItemSize(),
                options = {
                    itemSize: itemSize,
                    startHMS: $common.formatDuration(startTimeInt),
                    startH: trimStartTime[0],
                    startM: trimStartTime[1],
                    startS: trimStartTime[2],
                    endHMS: $common.formatDuration(endTimeInt),
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
                    if (poiItem.length > 0 && i % itemSize === 0) {
                        poiPage.push({
                            poiItem: poiItem
                        });
                        poiItem = [];
                    }
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
            $page.countPoiItem();
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
                    $('#cur-poi .poi-list .prev')[index === 0 ? 'hide' : 'show']();
                    $('#cur-poi .poi-list .next')[index === opts.slideCount - 1 ? 'hide' : 'show']();
                },
                speed: 1000,
                timeout: 0,
                pause: 1,
                cleartypeNoBg: true
            });
        }
    };

    $page.buildVideoInfoTmpl = function (element) {
        // video-info-tmpl
        if (element && element.tmplItem() && element.tmplItem().data && element.tmplItem().data.name) {
            var videoInfoData = element.tmplItem().data,
                startTimeInt = videoInfoData.startTime,
                endTimeInt = (videoInfoData.endTime > 0) ? videoInfoData.endTime : videoInfoData.duration,
                trimStartTime = $common.formatDuration(startTimeInt, true).split(':'),
                trimEndTime = $common.formatDuration(endTimeInt, true).split(':'),
                trimDuration = $common.formatDuration((endTimeInt - startTimeInt), true).split(':'),
                options = {
                    startHMS: $common.formatDuration(startTimeInt),
                    startH: trimStartTime[0],
                    startM: trimStartTime[1],
                    startS: trimStartTime[2],
                    endHMS: $common.formatDuration(endTimeInt),
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
            $page.buildPoiInfoTmpl(element);
        }
    };

    $page.buildPoiPointEditTmpl = function (poi_point) {
        var poiPointEventData = poi_point || {},
            videoData = $('#storyboard-list li.playing').tmplItem().data,
            videoStartTime = videoData.startTime,
            videoEndTime = (videoData.endTime > 0) ? videoData.endTime : videoData.duration,
            poiStartTime = videoStartTime,
            poiEndTime = videoEndTime,
            optionData = {};
        poiPointEventData = $.extend({
            id: 0,
            targetId: videoData.id || 0,
            type: 5,
            name: '',
            startTime: poiStartTime,
            endTime: poiEndTime,
            tag: ''
        }, poiPointEventData);
        videoStartTime = $common.formatDuration(videoStartTime, true).split(':');
        videoEndTime = $common.formatDuration(videoEndTime, true).split(':');
        poiStartTime = $common.formatDuration(poiPointEventData.startTime, true).split(':');
        poiEndTime = $common.formatDuration(poiPointEventData.endTime, true).split(':');
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
    };

    $page.loadYouTubeFlash = function (videoId, isChromeless, videoWrap) {
        $('#poi-event-overlay .wrap .content .video-wrap .video').empty();
        $page.removeTitleCardPlayingHook();
        if (videoId && '' !== videoId) {
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
                name: 'ytid-' + videoId,
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
    };

    $page.loadYouTubeChrome = function (videoId, videoWrap) {
        $page.loadYouTubeFlash(videoId, true, videoWrap);
    };

    $page.playTitleCardAndVideo = function (element) {
        if (element && element.children('.title').children('a.begin-title').length > 0) {
            var opts = element.tmplItem().data.beginTitleCard;
            if (opts && opts.message) {
                $page.removeTitleCardPlayingHook();
                $page.addTitleCardPlayingHook(element, 'begin');
                $page.cancelTitleCard();
                $page.buildVideoInfoTmpl(element);
                $page.wrapTitleCardCanvas();
                $('#video-player .video .canvas').titlecard($page.adaptTitleCardOption(opts), function () {
                    $page.loadYouTubeFlash(element.data('ytid'));
                });
                $page.animateTitleCardProgress(opts);
                $page.removeVideoPlayingHook();
                $page.addVideoPlayingHook(element);
            }
        } else if (element) {
            $page.buildVideoInfoTmpl(element);
            $page.loadYouTubeFlash(element.data('ytid'));
            $page.removeVideoPlayingHook();
            $page.addVideoPlayingHook(element);
        }
    };

    $page.playPoiEventAndVideo = function (type) {
        if (type && isNaN(type) && cms.config.POI_TYPE_MAP[type]) {
            // load video
            $('#poi-event-overlay-wrap').data('poiEventType', cms.config.POI_TYPE_MAP[type].code);
            $('#poi-event-overlay-wrap').data('poiEventTypeKey', type);
            $('body').addClass('from-poi-overlay-edit-mode');
            if ($('#poi-event-overlay .wrap .content .video-wrap .video #youTubePlayerChrome').length > 0) {
                // cache from the other event type video
                $('#poi-event-overlay .wrap .content .video-wrap .no-video').addClass('hide');
                $('#youTubePlayerChrome').appendTo($('#' + type + '-video'));
            } else {
                $page.loadYouTubeChrome($('#storyboard-listing li.playing').data('ytid'), '#' + type + '-video');
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

    $page.buildPoiEventOverlayTmpl = function (poi_event) {
        var poiPointEventData = poi_event || {},
            videoData = $('#storyboard-list li.playing').tmplItem().data,
            hasPoiEventCache = false,
            poiEventTypeKey = '';
        poiPointEventData = $.extend({
            id: 0,
            targetId: videoData.id || 0,
            type: 5,
            eventId: 0,
            eventType: 0,
            message: '',
            button: '',
            pollButtons: ['',''],
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
                $('body').addClass('from-poi-overlay-edit-mode');
                $('#poi-event-overlay .event').addClass('hide');
                if ($('#cur-poi-edit').hasClass('edit')) {
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

    $page.loadVideo = function () {
        if ($('#storyboard-listing li.playing').length > 0 && cms.global.YOUTUBE_PLAYER !== undefined && cms.global.YOUTUBE_PLAYER !== null && 'object' === $.type(cms.global.YOUTUBE_PLAYER) && 'function' === $.type(cms.global.YOUTUBE_PLAYER.loadVideoById)) {
            cms.global.YOUTUBE_PLAYER.loadVideoById({
                'videoId': $('#storyboard-listing li.playing').data('ytid'),
                'startSeconds': $('#storyboard-listing li.playing').data('starttime'),
                'endSeconds': ($('#storyboard-listing li.playing').data('endtime') === $('#storyboard-listing li.playing').data('ytduration')) ? 0 : $('#storyboard-listing li.playing').data('endtime')
            });
        }
    };

    $page.autoHidePlaceholder = function () {
        // Auto hide add video textarea placeholder text.
        $('#videourl').data('holder',$('#videourl').attr('placeholder'));

        $('#videourl').focusin(function(){
            $(this).attr('placeholder','');
        });
        $('#videourl').focusout(function(){
            $(this).attr('placeholder',$(this).data('holder'));
        });
    };

    // NOTE: The onYouTubePlayerReady function needs to be in the window context
    // so that the ActionScript code can call it after it's loaded
    window.onYouTubePlayerReady = function (playerId) {
        if (playerId === 'player') {
            cms.global.YOUTUBE_PLAYER = document.getElementById('youTubePlayer');
        } else {
            cms.global.YOUTUBE_PLAYER = document.getElementById('youTubePlayerChrome');
        }
        cms.global.YOUTUBE_PLAYER.addEventListener('onStateChange', 'onYouTubePlayerStateChange');
        $page.loadVideo();
    };

    window.onYouTubePlayerStateChange = function (newState) {
        var playing = $('#storyboard-list li.playing'),
            nextPlaying = $('#storyboard-list li.next-playing'),
            opts = null,
            starttime = playing.data('starttime');
        // unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
        if (-1 === newState) {
            cms.global.YOUTUBE_PLAYER.playVideo();
        }
        if (1 === newState && ($('body').hasClass('is_landing') || $('body').hasClass('from-trim-time-edit') || $('body').hasClass('from-trim-time-edit-ending') || $('body').hasClass('from-poi-edit-mode') || $('body').hasClass('from-poi-overlay-edit-mode'))) {
            $('body').removeClass('is_landing');
            $('body').removeClass('from-trim-time-edit');
            $('body').removeClass('from-trim-time-edit-ending');
            $('body').removeClass('from-poi-edit-mode');
            $('body').removeClass('from-poi-overlay-edit-mode');
            if ($('#cur-poi-edit').length > 0 && !$('#cur-poi-edit').hasClass('hide')) {
                starttime = $('#poi-point-edit-wrap').data('starttime');
            }
            cms.global.YOUTUBE_PLAYER.seekTo(starttime, true);
            cms.global.YOUTUBE_PLAYER.pauseVideo();
        }
        if (0 === newState) {
            if ($('#storyboard-listing li.trim-time').length > 0) {
                $('body').addClass('from-trim-time-edit-ending');
                $page.loadYouTubeFlash($('#storyboard-listing li.trim-time').data('ytid'));
                return false;
            }
            if ($('body').hasClass('enter-poi-edit-mode')) {
                $('body').addClass('from-poi-edit-mode');
                $page.loadYouTubeFlash(playing.data('ytid'));
                return false;
            }
            if ($('#storyboard-list li.playing').length <= 0 && $('#storyboard-list li.next-playing').length <= 0) {
                $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
            } else {
                if (playing.children('.title').children('a.end-title').length > 0) {
                    opts = playing.tmplItem().data.endTitleCard;
                    $page.removeTitleCardPlayingHook();
                    $page.addTitleCardPlayingHook(playing, 'end');
                    $page.cancelTitleCard();
                    $page.wrapTitleCardCanvas();
                    $('#video-player .video .canvas').titlecard($page.adaptTitleCardOption(opts), function () {
                        if ($('#storyboard-list li.next-playing').length <= 0) {
                            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                        } else {
                            $page.playTitleCardAndVideo(nextPlaying);
                        }
                    });
                    $page.animateTitleCardProgress(opts);
                } else {
                    if ($('#storyboard-list li.next-playing').length <= 0) {
                        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                    } else {
                        $page.playTitleCardAndVideo(nextPlaying);
                    }
                }
            }
        }
        nn.log({
            newState: newState
        }, 'debug');
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        // fetch and set user locale info
        var localePromise = cms.localeUtility.getLocale();

        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: epcurate-curation',
            options: options
        }, 'debug');

        $common.fadeEpcurateHeaderAndFooter();
        var crumb = $common.rebuildCrumbAndParam(),
            fm = document.epcurateForm,
            eid = fm.id.value,
            cid = fm.channelId.value;
        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
        $('#cur-add textarea').attr('placeholder', nn._([cms.global.PAGE_ID, 'add-video', 'Paste YouTube video URLs to add (separate with different lines)']));
        if (!eid && !cid) {
            $common.showSystemErrorOverlayAndHookError('Invalid channel ID and episode ID, please try again.');
            return;
        }
        if (!eid) {
            // insert mode: data from cookie
            if (!crumb.name || '' === $.trim(crumb.name)) {
                crumb.name = 'New episode';
            }
            if (cid > 0 && !isNaN(cid) && cms.global.USER_DATA.id) {
                nn.api('GET', cms.reapi('/api/users/{userId}/channels', {
                    userId: cms.global.USER_DATA.id
                }), null, function (data) {
                    var channelIds = [];
                    if (data.length > 0) {
                        $.each(data, function (i, list) {
                            channelIds.push(list.id);
                        });
                    }
                    if (-1 === $.inArray(parseInt(cid, 10), channelIds)) {
                        $common.showSystemErrorOverlayAndHookError('You are not authorized to edit episodes in this channel.');
                        return;
                    }
                    nn.api('GET', cms.reapi('/api/channels/{channelId}', {
                        channelId: cid
                    }), null, function (channel) {
                        if (channel.contentType === cms.config.YOUR_FAVORITE) {
                            $common.showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                            return;
                        }
                        $common.showProcessingOverlay();
                        $('#epcurate-info').remove();
                        $('#epcurate-info-tmpl').tmpl(crumb).prependTo('#epcurateForm');
                        $('.storyboard-info').html($('#storyboard-info-tmpl').tmpl({
                            chName: channel.name,
                            epName: crumb.name
                        }));
                        $('#epcurate-nav-publish, #form-btn-save, #form-btn-next').click(function (e) {
                            $(fm).trigger('submit', e);
                            return false;
                        });

                        $('#storyboard-wrap').perfectScrollbar(); 
                        $('#overlay-s').fadeOut();
                    });
                });
            } else {
                $common.showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
                return;
            }
        } else {
            // Refactor with jquery deferred object
            // var episode, data, channel, programs;   // Not ideal, temp workaround.
            $('body').addClass('is_landing');
            getEpisode($('#id').val())
                .then(getChannels)
                .then(getChannel)
                .then(getPrograms)
                .then(setPrograms);
        }

        function getEpisode(episodeId) {
            var deferred = $.Deferred();

            nn.api('GET', cms.reapi('/api/episodes/{episodeId}', {
                episodeId: $('#id').val()
            }), null, function (episode) {
                // episode = response;
                deferred.resolve(episode);
            });

            return deferred.promise();
        }

        function getChannels(episode) {
            var deferred = $.Deferred();

            if (cid > 0 && parseInt(cid, 10) !== episode.channelId) {
                $common.showSystemErrorOverlayAndHookError('You are not authorized to edit this episode.');
                // return;
                deferred.reject();
            } else {
                nn.api('GET', cms.reapi('/api/users/{userId}/channels', {
                    userId: cms.global.USER_DATA.id
                }), null, function (data) {
                    // data = response;
                    deferred.resolve(data, episode);
                });
            }

            return deferred.promise();
        }

        function getChannel(data, episode) {
            var deferred = $.Deferred();

            var channelIds = [];

            if (data.length > 0) {
                $.each(data, function (i, list) {
                    channelIds.push(list.id);
                });
            }

            if (-1 === $.inArray(parseInt(episode.channelId, 10), channelIds)) {
                $common.showSystemErrorOverlayAndHookError('You are not authorized to edit episodes in this channel.');
                // return;
                deferred.reject();
            } else {
                    nn.api('GET', cms.reapi('/api/channels/{channelId}', {
                        channelId: episode.channelId
                }), null, function (channel) {
                    // channel = response;
                    deferred.resolve(channel, episode);
                });
            }

            return deferred.promise();
        }

        function getPrograms(channel, episode) {
            var deferred = $.Deferred();

            if (channel.contentType === cms.config.YOUR_FAVORITE) {
                $common.showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                // return;
                deferred.reject();
            } else {
                $common.showProcessingOverlay();
                crumb = $.extend({}, crumb, episode);
                $('#epcurate-info').remove();
                $('#epcurate-info-tmpl').tmpl(crumb).prependTo('#epcurateForm');
                $('.storyboard-info').html($('#storyboard-info-tmpl').tmpl({
                    chName: channel.name,
                    epName: episode.name
                }));

                nn.api('GET', cms.reapi('/api/episodes/{episodeId}/programs', {
                    episodeId: $('#id').val()
                }), null, function (programs) {
                    // programs = response;
                    deferred.resolve(programs);
                });       

                $('#epcurate-nav-publish, #form-btn-save, #form-btn-next').click(function (e) {
                    $(fm).trigger('submit', e);
                    return false;
                });

                $page.autoHidePlaceholder();
                $('#storyboard-wrap').perfectScrollbar();                     
            }

            return deferred.promise();
        }

        function setPrograms(programs) {
            // merge 9x9 api and youtube api (ytId, ytDuration, uploader, uploadDate, isZoneLimited, isSyndicateLimited, isEmbedLimited, isUnplayableVideo)
            var normalPattern = /^http(?:s)?:\/\/www.youtube.com\/watch\?v=([^&]{11})/,
                preloadImage = [],
                programList = [],
                invalidList = [],
                committedCnt = 0,
                ytData = null,
                ytItem = {},
                ytList = [],
                beginTitleCard = null,
                endTitleCard = null;

            $.each(programs, function (idx, programItem) {
                if (normalPattern.test(programItem.fileUrl)) {
                    programList.push(programItem);
                }
            });

            $.each(programList, function (idx, programItem) {
                nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                    committedCnt += 1;
                    invalidList.push(programItem.fileUrl);
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
                    nn.log(programItem.fileUrl, 'debug');
                    $('#videourl').val(invalidList.join('\n'));
                    $('#cur-add .notice').text(nn._([cms.global.PAGE_ID, 'add-video', 'Invalid URL, please try again!'])).removeClass('hide').show();
                    if (committedCnt === programList.length) {
                        committedCnt = -1;   // reset to avoid collision
                        if (preloadImage.length > 0) {
                            $('#preload-image').html('');
                            $('#preload-image-tmpl-item').tmpl(preloadImage).prependTo('#preload-image');
                        }
                        $('#storyboard-listing').html('');
                        $('#storyboard-listing-tmpl-item').tmpl(ytList).prependTo('#storyboard-listing');
                        $page.sumStoryboardInfo();
                        $page.rebuildVideoNumber();
                        $('.ellipsis').ellipsis();
                        $('#overlay-s').fadeOut();
                    }
                });

                getYoutubes(programItem)
                .then(getTitleCard)
                .then(getPoiPoints)
                .then(function(programItem, youtubes, title_card, poi_points){
                    // $.when(localePromise).then(function() {
                    committedCnt += 1;
                    beginTitleCard = null;
                    endTitleCard = null;

                    if (title_card.length > 0) {
                        if (title_card[1]) {
                            if (1 === title_card[1].type) {
                                beginTitleCard = title_card[0];
                                endTitleCard = title_card[1];
                            } else {
                                beginTitleCard = title_card[1];
                                endTitleCard = title_card[0];
                            }
                        } else {
                            if (title_card[0]) {
                                if (0 === title_card[0].type) {
                                    beginTitleCard = title_card[0];
                                } else {
                                    endTitleCard = title_card[0];
                                }
                            }
                        }
                    }
                    if (beginTitleCard && beginTitleCard.message && '' !== $.trim(beginTitleCard.message)) {
                        beginTitleCard.message = $.trim(beginTitleCard.message).replace(/\{BR\}/g, '\n');
                        if (beginTitleCard.bgImage && '' !== $.trim(beginTitleCard.bgImage)) {
                            preloadImage.push({
                                image: beginTitleCard.bgImage
                            });
                        }
                    } else {
                        beginTitleCard = null;
                    }
                    if (endTitleCard && endTitleCard.message && '' !== $.trim(endTitleCard.message)) {
                        endTitleCard.message = $.trim(endTitleCard.message).replace(/\{BR\}/g, '\n');
                        if (endTitleCard.bgImage && '' !== $.trim(endTitleCard.bgImage)) {
                            preloadImage.push({
                                image: endTitleCard.bgImage
                            });
                        }
                    } else {
                        endTitleCard = null;
                    }

                    var checkResult = cms.youtubeUtility.checkVideoValidity(youtubes);

                    if (youtubes.data && false === checkResult.isEmbedLimited) {
                        ytData = youtubes.data;
                        ytItem = {
                            poiList: poi_points,
                            beginTitleCard: beginTitleCard,
                            endTitleCard: endTitleCard,
                            ytId: ytData.id,
                            fileUrl: programItem.fileUrl,
                            imageUrl: 'http://i.ytimg.com/vi/' + ytData.id + '/mqdefault.jpg',
                            //duration: ytData.duration,      // ON PURPOSE to mark this line to keep trimmed duration from 9x9 API
                            ytDuration: ytData.duration,    // keep original duration from YouTube
                            name: ytData.title,
                            intro: ytData.description,
                            uploader: ytData.uploader,
                            uploadDate: ytData.uploaded,
                        };
                    } else {
                        ytItem = {
                            poiList: poi_points,
                            beginTitleCard: beginTitleCard,
                            endTitleCard: endTitleCard,
                            ytId: programItem.fileUrl.slice(-11),
                            ytDuration: 0,                                                                      // fake origin duration (invalid video)
                            uploader: ((youtubes.error) ? youtubes.error.message : 'Unplayable-Video'),         // fake uploader (error message)
                            uploadDate: ((youtubes.error) ? (youtubes.error.code + 'T') : 'Unplayable-VideoT'), // fake uploadDate (error code)
                        };
                    }

                    ytItem = $.extend(ytItem, checkResult);

                    ytItem = $.extend(programItem, ytItem);
                    ytList[idx] = ytItem;
                    if (committedCnt === programList.length) {
                        committedCnt = -1;   // reset to avoid collision
                        if (preloadImage.length > 0) {
                            $('#preload-image').html('');
                            $('#preload-image-tmpl-item').tmpl(preloadImage).prependTo('#preload-image');
                        }
                        $('#storyboard-listing').html('');
                        $('#storyboard-listing-tmpl-item').tmpl(ytList).prependTo('#storyboard-listing');
                        $page.sumStoryboardInfo();
                        $page.rebuildVideoNumber();
                        $('.ellipsis').ellipsis();

                        var videoOkCnt = $('#storyboard-list li a.video_ok').length;
                        if (videoOkCnt > 0) {
                            var liIndex = $('#storyboard-list li a.video_ok').parent("li").index();
                            $('#storyboard-list li .hover-func a.video-play').eq(liIndex).trigger("click");
                            $("#storyboard-wrap").scrollLeft(123 * liIndex);
                        }

                        $('#overlay-s').fadeOut();
                    }
                });
                // });

            });
        }

        function getYoutubes(programItem) {
            var deferred = $.Deferred();

            nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + programItem.fileUrl.slice(-11) + '?alt=jsonc&v=2&callback=?', null, function (youtubes) {
                deferred.resolve(programItem, youtubes);
            }, 'jsonp');

            return deferred.promise();
        }

        function getTitleCard(programItem, youtubes) {
            var deferred = $.Deferred();

            nn.api('GET', cms.reapi('/api/programs/{programId}/title_cards', { programId: programItem.id }), null, function (title_card) {
                deferred.resolve(programItem, youtubes, title_card);
            });

            return deferred.promise();
        }

        function getPoiPoints(programItem, youtubes, title_card) {
            var deferred = $.Deferred();

            nn.api('GET', cms.reapi('/api/programs/{programId}/poi_points', { programId: programItem.id }), null, function (poi_points) {
                deferred.resolve(programItem, youtubes, title_card, poi_points);
            });

            return deferred.promise();
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('epcurate-curation')));
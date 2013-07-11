/*jslint browser: true, unparam: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['channel-poi'],
        $common = cms.common;

    // common unblock
    $('body').keyup(function (e) {
        if (27 === e.which) { // Esc
            if ('block' === $('#poi-event-overlay').css('display')) {
                if ($('body').hasClass('has-poi-change')) {
                    $common.showUnsavePoiMask(e);
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
            $common.showUnsaveOverlay();
            return false;
        }
    });
    $('#unsave-prompt .btn-leave').click(function () {
        $page.removeTotalChangeHook();
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
        $page.removeTotalChangeHook();
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
        $page.goBackPoiList();
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
        $common.showDeletePoiPromptOverlay('Are you sure you want to delete this POI with interactive event?');
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
        $page.buildPoiPointEditTmpl();
        $('#poi-point-edit').removeClass('hide');
        $('#content-main').removeAttr('class');
        $('#title-func h2').hide();
        $('#content-main').addClass('poi-create');
        $page.setFormHeight();
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
            // enter edit mode
            $('#channel-poi .edit-block').addClass('hide');
            $('#poi-point-edit').addClass('edit');
            $.each(poiList, function (i, poiItem) {
                if (poiItem.id === poiPointId) {
                    $page.buildPoiPointEditTmpl(poiItem);
                    // NOTE: return false here is break the $.each() loop
                    return false;
                }
            });
            $('#poi-point-edit').removeClass('hide');
            $('#content-main').removeAttr('class');
            $('#title-func h2').hide();
            $('#content-main').addClass('poi-edit');
            $page.setFormHeight();
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
            $common.showUnsavePoiOverlay(e);
            return false;
        }
        $page.goBackPoiList();
        return false;
    });
    // POI overlay - cancel and close
    $('#poi-event-overlay').on('click', '.btn-cancel, .overlay-btn-close', function (e) {
        if ($('body').hasClass('has-poi-change')) {
            $common.showUnsavePoiMask(e);
            return false;
        }
        $page.goBackPoiList();
        return false;
    });

    // POI point Next
    $('#content-main').on('click', '#poiPointForm .btn-next', function () {
        if ($page.chkPoiPointData(document.poiPointForm)) {
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
                                    $page.buildPoiListPageTmpl();
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
                                                $page.buildPoiListPageTmpl();
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
                            $page.buildPoiListPageTmpl();
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
        if ($('#poi-point-edit').hasClass('edit')) {
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
        if ($('#poi-point-edit').hasClass('edit')) {
            // edit mode back must check and if pass then go to preview video and POI plugin
            $page.chkPoiEventData(document.eventScheduledForm, function (result) {
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
            $page.chkPoiEventData(document.eventInstantForm, function (result) {
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
        $('#schedule-mobile .mobile-block p.msg').text($common.mb_strimwidth(val, 34, '...'));
    });
    $('#poi-event-overlay').on('change keyup keydown', '#instant_msg', function () {
        var val = $common.strip_tags($(this).val().replace(/\n/g, ''));
        $(this).val(val);
        $('#instant-mobile .mobile-block p.msg').text($common.mb_strimwidth(val, 34, '...'));
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
                    $page.buildPoiListPageTmpl();
                    $page.goBackPoiList(true);
                } else {
                    // insert mode
                    $common.showSavingOverlay();
                    if (channelId > 0 && !isNaN(channelId)) {
                        nn.api('POST', cms.reapi('/api/channels/{channelId}/poi_points', {
                            channelId: channelId
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
                                        $page.buildPoiListPageTmpl();
                                        $page.goBackPoiList(true);
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

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $page.setFormHeight();
    });
});
/*jslint browser: true, nomen: true, regexp: true, unparam: true */
/*global $, nn, cms, FB */

(function ($common) {
    'use strict';

    //-------------------------------------------------------------------------
    // Page Auto Width, Auto Height, Scrollbar...
    //-------------------------------------------------------------------------

    $common.autoWidth = function () {
        var contentNavWidth = 200,  // $('#content-nav')
            scrollbarWidth = 35;    // padding15 + slider5 + padding15

        $('#content-main').width($(window).width() - contentNavWidth - scrollbarWidth);
        $('.epcurate-curation #content-main').width($(window).width());
        $('#epcurate-curation .tab-content .result-list ul').width($(window).width() - $('#epcurate-curation #video-player .video').width() - 60);  // 60: previous:30 + next:30
        //$('#epcurate-curation .tab-content .result-list a.video-next').css('left', $(window).width() - 35 + 'px');
    };

    $common.autoHeight = function () {
        var windowHeight = $(window).height(),
            footerHeight = $('#footer').height(),
            titleFuncContentHeight = $('#title-func').height(),
            titleFuncPaddingTop = parseInt($('#title-func').css('padding-top'), 10),
            titleFuncPaddingBottom = parseInt($('#title-func').css('padding-bottom'), 10),
            titleFuncHeight = parseInt(titleFuncContentHeight + titleFuncPaddingTop + titleFuncPaddingBottom, 10),
            headerHeight = $('#header').height(),
            navHeight = $('#studio-nav').height(),
            sliderHeight = windowHeight - titleFuncHeight - headerHeight - navHeight - 58;                                  // 58: footer48 + space15 - (header and studio-nav overlap)5

        $('#content-wrap').height($(window).height() - headerHeight - navHeight + 5);                                       // 5: header and studio-nav overlap;
        $('#content-main').height($(window).height() - footerHeight - headerHeight - navHeight + 5);                        // 5: header and studio-nav overlap;
        $('.epcurate-curation#content-wrap, .epcurate-publish#content-wrap').height($(window).height() - 46);               // $('#epcurate-nav .epcurate-nav-wrap')
        $('.epcurate-curation #content-main, .epcurate-publish #content-main').height($(window).height() - 94);             // 94: epcurate-nav46 + form-btn48  
        $('#content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + titleFuncHeight + 15);     // 15: space between footer and content
        $('.epcurate-publish #content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + 270);    // 270: datepicker height + form-btn48 + space15
        $('.epcurate-curation #content-main-wrap').height($('#content-main-wrap').children('.constrain').height());
        $('#content-main-wrap:not(.curation)').css('margin-top', titleFuncHeight + 'px');
        $('#main-wrap-slider').css('top', titleFuncHeight + 'px');
        $('#main-wrap-slider').height(sliderHeight);
        $('#main-wrap-slider').attr('data-orig-slider-height', sliderHeight);

        if ($('#epcurate-nav.publish').length > 0) {
            $('#main-wrap-slider').height(windowHeight - 134);  // 134: epcurate-nav46 + content-main-wrap margin25 + form-btn48 + space between footer and content15
            $('#main-wrap-slider').attr('data-orig-slider-height', windowHeight - 134);
        }
        if ($('#store-slider').length > 0) {
            $('#store-slider').height(sliderHeight - $('#store-category').height());
            $('#store-slider').attr('data-orig-slider-height', sliderHeight - $('#store-category').height());
        }
    };

    // for vertical.slider
    $common.scrollbar = function (outer, inner, sliderwrap) {
        var difference = 0,
            proportion = 0,
            iRange = 0,
            handleHeight = 0,
            origSliderHeight = 0,
            sliderHeight = 0,
            sliderMargin = 0;

        // compare the height of the scroll content to the scroll pane to see if we need a scrollbar
        difference = $(inner).height() - $(outer).height();

        if (difference > 0) {
            $(sliderwrap).show();
            proportion = difference / $(inner).height();

            // this value can fix epislode over 200 scroll problem
            iRange = parseInt($(inner).height() / $(outer).height(), 10) * 8;
            if (iRange < 100) {
                // before default slider max / value
                iRange = 100;
            }

            // episode list has this global var and need it to paging
            cms.global.SLIDER_MAX = iRange;

            // set the proportional height - round it to make sure everything adds up correctly later on
            handleHeight = Math.round((1 - proportion) * $(outer).height());
            handleHeight -= handleHeight % 2;

            // set up the slider
            $(sliderwrap + ' .slider-vertical').slider({
                orientation: 'vertical',
                min: 0,
                max: iRange,
                value: iRange,
                slide: function (event, ui) {
                    // scroll content when slide is dragged
                    var topValue = -((iRange - ui.value) * difference / iRange);
                    // move the top up (negative value) by the percentage the slider has been moved times the difference in height
                    $(inner).css({
                        top: topValue
                    });
                },
                change: function (event, ui) {
                    // scroll content when the slider is changed by a click outside the handle or by the mousewheel
                    var topValue = -((iRange - ui.value) * difference / iRange);
                    // move the top up (negative value) by the percentage the slider has been moved times the difference in height
                    $(inner).css({
                        top: topValue
                    });
                }
            });

            // set the handle height and bottom margin so the middle of the handle is in line with the slider
            $(sliderwrap + ' .ui-slider-handle').css({
                height: handleHeight,
                'margin-bottom': -0.5 * handleHeight
            });

            // remember the original slider height ONCE, and always used the saved value
            origSliderHeight = $(sliderwrap).attr('data-orig-slider-height');
            if (!origSliderHeight) {
                origSliderHeight = $(sliderwrap + ' .slider-vertical').height();
                $(sliderwrap).attr('data-orig-slider-height', origSliderHeight);
            }

            // the height through which the handle can move needs to be the original height minus the handle height
            sliderHeight = origSliderHeight - handleHeight;

            // so the slider needs to have both top and bottom margins equal to half the difference
            sliderMargin = (origSliderHeight - sliderHeight) * 0.5;

            $(sliderwrap + ' .ui-slider').css({
                height: sliderHeight,
                'margin-top': sliderMargin
            });
        } else {
            $(sliderwrap + ' .slider-vertical').slider();
            $(sliderwrap).hide();
        }

        $(sliderwrap + ' .ui-slider').unbind('click');
        $(sliderwrap + ' .ui-slider').click(function (event) {
            event.stopPropagation();
        });
        $(outer + ', ' + sliderwrap + ' .slider-vertical').unbind('mousewheel');
        $(outer + ', ' + sliderwrap + ' .slider-vertical').mousewheel(function (event, delta) {
            var speed = 2,
                sliderVal = $(sliderwrap + ' .slider-vertical').slider('value');
            sliderVal += (delta * speed);
            $(sliderwrap + ' .slider-vertical').slider('value', sliderVal);
            event.preventDefault();
        });
    };

    // for horizontal-slider
    $common.scrollbarX = function (outer, inner, sliderwrap) {
        var difference = 0,
            handleWidth = 50,
            origSliderWidth = 0,
            sliderWidth = 0;

        // compare the height of the scroll content to the scroll pane to see if we need a scrollbar
        difference = $(inner).width() - $(outer).width();

        if (difference > 0) {
            $(sliderwrap).show();

            // set up the slider
            $(sliderwrap + ' .slider-h').slider({
                orientation: 'horizontal',
                min: 0,
                max: 100,
                value: 0,
                slide: function (event, ui) {
                    // scroll content when slide is dragged
                    var leftValue = -(ui.value / 100 * difference);
                    // move the top up (negative value) by the percentage the slider has been moved times the difference in height
                    $(inner).css({
                        left: leftValue
                    });
                },
                change: function (event, ui) {
                    // scroll content when the slider is changed by a click outside the handle or by the mousewheel
                    var leftValue = -(ui.value / 100 * difference);
                    // move the top up (negative value) by the percentage the slider has been moved times the difference in height
                    $(inner).css({
                        left: leftValue
                    });
                }
            });

            // set the handle height and bottom margin so the middle of the handle is in line with the slider
            $(sliderwrap + ' .ui-slider-handle').css({
                width: handleWidth
            });

            // remember the original slider height ONCE, and always used the saved value
            origSliderWidth = $(sliderwrap).attr('data-orig-slider-width');
            if (!origSliderWidth) {
                origSliderWidth = $(sliderwrap + ' .slider-h').width();
                $(sliderwrap).attr('data-orig-slider-width', origSliderWidth);
            }

            // the height through which the handle can move needs to be the original height minus the handle height
            sliderWidth = origSliderWidth - handleWidth;
            $(sliderwrap + ' .ui-slider').css({
                width: sliderWidth
            });
        } else {
            $(sliderwrap + ' .slider-h').slider();
            $(sliderwrap).hide();
        }

        $(sliderwrap + ' .ui-slider').unbind('click');
        $(sliderwrap + ' .ui-slider').click(function (event) {
            event.stopPropagation();
        });
        $(outer + ', ' + sliderwrap + ' .slider-h').unbind('mousewheel');
        $(outer + ', ' + sliderwrap + ' .slider-h').mousewheel(function (event, delta) {
            var speed = 5,
                sliderVal = $(sliderwrap + ' .slider-h').slider('value');
            sliderVal += (delta * speed);
            $(sliderwrap + ' .slider-h').slider('value', sliderVal);
            event.preventDefault();
        });
    };

    $common.hideFbPageList = function (options) {
        if ($('#settingForm').length > 0 && ($('#content-wrap').hasClass('channel-add') || $('#content-wrap').hasClass('channel-setting'))) {
            var $page = cms.global.PAGE_OBJECT,
                hasHideFbPageList = false,
                sliderPos = $('#main-wrap-slider .slider-vertical').slider('value');
            if (!options || !options.hidePageList || true === options.hidePageList) {
                $('#fb-page-list').hide();
                if ($('.page-list').hasClass('on')) {
                    $('.page-list').removeClass('on');
                    hasHideFbPageList = true;
                }
            }
            if ('none' !== $('#main-wrap-slider').css('display')) {
                $('#content-main-wrap form').height($('#content-main-wrap form').data('height'));
                $('#content-main-wrap').height($('#content-main-wrap form').height() + 137);
                $('#main-wrap-slider .slider-vertical').slider('destroy');
                $('#main-wrap-slider .slider-vertical').slider();
                $('#main-wrap-slider').hide();
                if (hasHideFbPageList) {
                    $common.autoHeight();
                    if ($page && typeof $page.setFormHeight === 'function') {
                        $page.setFormHeight();
                    }
                    $('#content-main-wrap').css('top', '0');
                    setTimeout(function () {
                        $common.hideFbPageList();
                    }, 200);
                }
                $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                $('#main-wrap-slider .slider-vertical').slider('value', sliderPos);
            }
        }
    };

    //-------------------------------------------------------------------------
    // Overlay: Error, Prompt, Notice, Processing, Saving, Unsave...
    //-------------------------------------------------------------------------

    $common.showSystemErrorOverlay = function (msg) {
        if ('' === $.trim(msg)) {
            msg = 'Unknown error.';
        }
        $('#system-error .content').text(nn._(['overlay', 'system-error', msg]));
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
    };

    $common.showSystemErrorOverlayAndHookError = function (msg) {
        $('body').addClass('has-error');
        $common.showSystemErrorOverlay(msg);
    };

    $common.showSystemNoticeOverlay = function (msg) {
        $('#system-notice .content').text(nn._(['overlay', 'notice', msg]));
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-notice')
        });
    };

    $common.showProcessingOverlay = function () {
        $('#overlay-s .overlay-middle').html('<img src="images/icon_load_l.gif" alt="" />' + nn._(['overlay', 'loading', 'Processing...']));
        $('#overlay-s').fadeIn().css('z-index', '1200');
    };

    $common.showSavingOverlay = function () {
        $('#overlay-s .overlay-middle').html('<img src="images/icon_load_l.gif" alt="" />' + nn._(['overlay', 'loading', 'Saving...']));
        $('#overlay-s').fadeIn().css('z-index', '1200');
    };

    $common.buildUnsaveOverlay = function (hook) {
        $(hook + ' .content').text(nn._(['overlay', 'prompt', 'Unsaved changes will be lost, are you sure you want to leave?']));
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $(hook)
        });
    };

    $common.showUnsaveOverlay = function () {
        $common.buildUnsaveOverlay('#unsave-prompt');
    };

    $common.showUnsaveTrimTimeOverlay = function (e) {
        $('body').data('origin', e);
        $common.buildUnsaveOverlay('#unsave-trimtime-prompt');
    };

    $common.showUnsaveTitleCardOverlay = function (e) {
        $('body').data('origin', e);
        $common.buildUnsaveOverlay('#unsave-titlecard-prompt');
    };

    $common.showUnsavePoiOverlay = function (e) {
        $('body').data('origin', e);
        $('#unsave-poi-prompt .content').text(nn._(['overlay', 'prompt', 'Unsaved changes will be lost, are you sure you want to cancel editing?']));
        $.blockUI({
            message: $('#unsave-poi-prompt')
        });
    };

    $common.showUnsavePoiMask = function (e) {
        $('body').data('origin', e);
        $('#unsave-poi-mask-prompt .content').text(nn._(['overlay', 'prompt', 'Unsaved changes will be lost, are you sure you want to cancel editing?']));
        $('#poi-event-overlay').hide();
        $('#unsave-poi-mask-prompt').show().css('z-index', '1100');
    };

    $common.showDeletePromptOverlay = function (msg) {
        $('#delete-prompt .content').text(nn._(['overlay', 'prompt', msg]));
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#delete-prompt')
        });
        $('.blockOverlay').height($(window).height() - 45);
    };

    $common.showDeletePoiPromptOverlay = function (msg) {
        $('#del-poi-notice .content').text(nn._(['overlay', 'prompt', msg]));
        $.blockUI({
            message: $('#del-poi-notice')
        });
    };

    $common.showDraftNoticeOverlay = function (e) {
        $('body').addClass('first-save');
        $('body').data('origin', e);
        $('#draft-notice h4').text(nn._(['overlay', 'notice', 'New episode has been created as a draft!']));
        $('#draft-notice .content').html(nn._(['overlay', 'notice', '<span>Publish this episode at the next step</span> whenever you finish editing.']));
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#draft-notice')
        });
    };

    $common.showPublishNoticeOverlay = function () {
        $('#publish-notice .content').text(nn._(['overlay', 'notice', 'This episode has been published.']));
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#publish-notice')
        });
    };

    $common.showUnpublishNoticeOverlay = function () {
        $('#unpublish-notice .content').text(nn._(['overlay', 'notice', 'This episode has been saved as an unpublished draft.']));
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#unpublish-notice')
        });
    };

    //-------------------------------------------------------------------------
    // Format (timestamp, duration, HTML)
    //-------------------------------------------------------------------------

    $common.formatTimestamp = function (timestamp, dateSeparator, timeSeparator) {
        if (dateSeparator === undefined) {
            dateSeparator = '-';
        }
        if (timeSeparator === undefined) {
            timeSeparator = ':';
        }

        var a = new Date(timestamp),
            year = a.getFullYear(),
            month = a.getMonth() + 1,
            date = a.getDate(),
            hour = a.getHours(),
            min = a.getMinutes(),
            time = year + dateSeparator + ((month >= 10) ? month : '0' + month) + dateSeparator + ((date >= 10) ? date : '0' + date) + ' ' + ((hour >= 10) ? hour : '0' + hour) + timeSeparator + ((min >= 10) ? min : '0' + min);

        return time;
    };

    $common.formatDuration = function (duration, autoPadding) {
        if ('' === $.trim(duration) || isNaN(duration)) {
            duration = 0;
        }

        var durationMin = parseInt(duration / 60, 10),
            durationSec = parseInt(duration % 60, 10),
            durationHou = parseInt(durationMin / 60, 10);

        if (durationHou > 0 && durationHou.toString().length < 2) {
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

        if (durationHou > 0) {
            return durationHou + ':' + durationMin + ':' + durationSec;
        }
        if (true === autoPadding) {
            return '00:' + durationMin + ':' + durationSec;
        }
        return durationMin + ':' + durationSec;
    };

    $common.nl2br = function (text) {
        return text.replace(/\n/g, '<br />');
    };

    $common.strip_tags = function (input, allowed) {
        // version: 1109.2015
        allowed = (((allowed || "").toString()).toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    };

    //-------------------------------------------------------------------------
    // Facebook Common
    //-------------------------------------------------------------------------

    $common.buildFacebookPagesMap = function (facebook) {
        var fb_pages_map = {};
        if (facebook && facebook.userId) {
            fb_pages_map[facebook.userId] = facebook.accessToken;
            if (facebook.pages && 'string' !== typeof facebook.pages && facebook.pages.length > 0) {
                $.each(facebook.pages, function (i, page) {
                    fb_pages_map[page.id] = page.access_token;
                });
            }
        }
        return fb_pages_map;
    };

    $common.checkRestartConnect = function (facebook, callback) {
        var isRestartConnect = false,
            parameter = null;
        if (facebook && facebook.userId && facebook.accessToken) {
            if (facebook.pages && 'string' === typeof facebook.pages) {
                // ON PURPOSE to keep deep nesting if/else level because async facebook API call
                // lose manage_pages permission or
                // user change facebook password or
                // facebook has changed the session for security reasons
                // to show restart connect UI
                isRestartConnect = true;
                if ('function' === typeof callback) {
                    callback(facebook, isRestartConnect);
                }
            } else {
                parameter = {
                    access_token: facebook.accessToken
                };
                // FB.api('/{facebook.userId}/permissions', { anticache: (new Date()).getTime() }, function (response) {
                // ON PURPOSE to pass {facebook.userId} to compose request uri (but not hard code "me"), because not sure user had login facebook
                nn.api('GET', 'https://graph.facebook.com/' + facebook.userId + '/permissions', parameter, function (response) {
                    var permList = null,
                        hasCriticalPerm = false;
                    if (response.data && response.data[0]) {
                        permList = response.data[0];
                        if (permList.manage_pages && permList.publish_stream) {
                            hasCriticalPerm = true;
                        }
                    }
                    // if false === hasCriticalPerm lose critical permissions (manage_pages & publish_stream) to show restart connect UI
                    isRestartConnect = (true === hasCriticalPerm) ? false : true;
                    if ('function' === typeof callback) {
                        callback(facebook, isRestartConnect);
                    }
                }, 'jsonp');
            }
        } else {
            // ON PURPOSE to keep deep nesting if/else level because async facebook API call
            // not yet connect facebook
            isRestartConnect = false;
            if ('function' === typeof callback) {
                callback(facebook, isRestartConnect);
            }
        }
    };

    $common.addFbAsyncInitEvent = function (func) {
        var oldFbAsyncInit = window.fbAsyncInit;
        window.fbAsyncInit = function () {
            if ('function' === typeof oldFbAsyncInit) {
                oldFbAsyncInit();
            }
            func();
        };
    };

    $common.initFacebookJavaScriptSdk = function () {
        if (null !== cms.global.USER_URL && null !== cms.global.USER_DATA) {
            var lang = cms.global.USER_DATA.lang;
            (function (d, debug) {
                var js,
                    id = 'facebook-jssdk',
                    ref = d.getElementsByTagName('script')[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement('script');
                js.id = id;
                js.async = true;
                js.src = location.protocol + '//connect.facebook.net/' + cms.config.LC_MAP[lang] + '/all' + (debug ? '/debug' : '') + '.js';
                ref.parentNode.insertBefore(js, ref);
            }(document, /*debug*/ false));

            $common.addFbAsyncInitEvent(function () {
                var url = cms.global.USER_URL.attr('source');
                url = url.substr(0, url.lastIndexOf('/'));
                // init the FB JS SDK
                FB.init({
                    appId: cms.config.FB_APP_ID,                                                                // App ID from the App Dashboard
                    channelUrl: url + '/lang/fb/' + lang + '/channel.html',                                     // Channel File for x-domain communication
                    status: true,                                                                               // check the login status upon init?
                    cookie: true,                                                                               // set sessions cookies to allow your server to access the session?
                    xfbml: true                                                                                 // parse XFBML tags on this page?
                });
            });

            nn.api('GET', cms.reapi('/api/users/{userId}/sns_auth/facebook', {
                userId: cms.global.USER_DATA.id
            }), null, function (facebook) {
                if (!facebook || !facebook.userId) {
                    // ready for connect facebook
                    // sync cms settings
                    cms.global.FB_RESTART_CONNECT = false;
                    $('#studio-nav .reconnect-notice').addClass('hide');
                    cms.global.FB_PAGES_MAP = null;
                    cms.global.USER_SNS_AUTH = null;
                    // sync connect switch
                    $('.setup-notice p.fb-connect a.switch-on').addClass('hide');
                    $('.setup-notice p.fb-connect a.switch-off').removeClass('hide');
                    // sync channel setting
                    if ($('#settingForm').length > 0 && ($('#content-wrap').hasClass('channel-add') || $('#content-wrap').hasClass('channel-setting'))) {
                        cms.channel.renderConnectFacebookUI();
                    }
                } else {
                    // ready for disconnect facebook
                    // ON PURPOSE to use callback design pattern to maintain async order issue (make sure have critical permissions)
                    $common.checkRestartConnect(facebook, function (facebook, isRestartConnect) {
                        // sync cms settings
                        cms.global.FB_RESTART_CONNECT = isRestartConnect;
                        if (true === isRestartConnect) {
                            $('#studio-nav .reconnect-notice').removeClass('hide');
                            $('#studio-nav .reconnect-notice .notice-left').stop(true).delay(2000).slideDown(100).delay(10000).fadeOut(1500);
                            $('#cms-setting .connect .notice, #cms-setting .connect .notify').removeClass('hide');
                        }
                        cms.global.FB_PAGES_MAP = $common.buildFacebookPagesMap(facebook);
                        cms.global.USER_SNS_AUTH = facebook;
                        // sync connect switch
                        $('.setup-notice p.fb-connect a.switch-on').removeClass('hide');
                        $('.setup-notice p.fb-connect a.switch-off').addClass('hide');
                        // sync channel setting
                        if ($('#settingForm').length > 0 && ($('#content-wrap').hasClass('channel-add') || $('#content-wrap').hasClass('channel-setting'))) {
                            var isAutoCheckedTimeline = ('channel-add.html' === cms.global.USER_URL.attr('file')) ? true : false;
                            cms.channel.renderAutoShareUI(facebook, isAutoCheckedTimeline);
                        }
                    });
                }
            });
        } else {
            nn.log('Can not init Facebook JavaScript SDK!', 'error');
        }
    };

    //-------------------------------------------------------------------------
    // Epcurate Common
    //-------------------------------------------------------------------------

    $common.fadeEpcurateHeaderAndFooter = function () {
        var cmsEpe = $.cookie('cms-epe'),
            referrer = document.referrer;

        if (!cmsEpe) {
            $('#header, #footer-control, #footer').removeClass('hide').fadeOut(3000);
            if (!referrer) {
                referrer = 'index.html';
            }
            $.cookie('cms-epe', referrer);
            $('#epcurate-nav-back').attr('href', referrer);
            $('#form-btn-leave').data('leaveUrl', referrer);
        } else {
            $('#header, #footer-control, #footer').addClass('hide');
            $('#epcurate-nav-back').attr('href', cmsEpe);
            $('#form-btn-leave').data('leaveUrl', cmsEpe);
        }
    };

    $common.rebuildCrumbAndParam = function (cid, eid) {
        var cmsCrumb = {},
            cidFromGet = 0,
            eidFromGet = 0,
            qrystr = {};

        if ($.cookie('cms-crumb')) {
            cmsCrumb = $.url('http://fake.url.dev.teltel.com/?' + $.cookie('cms-crumb')).param();
        }

        // ON PURPOSE by pass no check (GET or function param) for handle error by oneself
        if (undefined === cid) {
            cidFromGet = cms.global.USER_URL.param('cid');
            if (cidFromGet) {
                cmsCrumb.channelId = cidFromGet;
            } else {
                // make sure channel id passed by GET or function param, or else delete it
                if (cmsCrumb.channelId) {
                    delete cmsCrumb.channelId;
                }
            }
        } else {
            cmsCrumb.channelId = cid;
        }
        if (undefined === eid) {
            eidFromGet = cms.global.USER_URL.param('id');
            if (eidFromGet) {
                cmsCrumb.id = eidFromGet;
            } else {
                // make sure episode id passed by GET or function param, or else delete it
                if (cmsCrumb.id) {
                    delete cmsCrumb.id;
                }
            }
        } else {
            cmsCrumb.id = eid;
        }
        $.cookie('cms-crumb', $.param(cmsCrumb));

        // rebuild url param by first-time entry
        if (cmsCrumb.channelId && cmsCrumb.channelId > 0) {
            qrystr.cid = cmsCrumb.channelId;
        }
        if (cmsCrumb.id && cmsCrumb.id > 0) {
            qrystr.id = cmsCrumb.id;
        }
        qrystr = $.param(qrystr);
        if ('' !== qrystr) {
            qrystr = '?' + qrystr;
        }

        $('#epcurate-nav-curation').attr('href', 'epcurate-curation.html' + qrystr);
        $('#epcurate-nav-publish').attr('href', 'epcurate-publish.html' + qrystr);
        $('#form-btn-back').attr('href', $('#epcurate-nav-' + $('#form-btn-back').attr('rel')).attr('href'));
        $('#form-btn-next').attr('href', $('#epcurate-nav-' + $('#form-btn-next').attr('rel')).attr('href'));
        if (cmsCrumb.id) {
            $('#id').val(cmsCrumb.id);
        }
        if (cmsCrumb.channelId) {
            $('#channelId').val(cmsCrumb.channelId);
        }

        return cmsCrumb;
    };

    //-------------------------------------------------------------------------
    // POI Common
    //-------------------------------------------------------------------------

    $common.setupUserCampaignId = function () {
        if (null !== cms.global.USER_DATA) {
            if (cms.global.CAMPAIGN_ID && !isNaN(cms.global.CAMPAIGN_ID)) {
                return cms.global.CAMPAIGN_ID;
            }
            nn.api('GET', cms.reapi('/api/users/{userId}/poi_campaigns', {
                userId: cms.global.USER_DATA.id
            }), null, function (poi_campaign) {
                if (poi_campaign && poi_campaign.length > 0 && poi_campaign[0] && !isNaN(poi_campaign[0].id)) {
                    cms.global.CAMPAIGN_ID = poi_campaign[0].id;
                    return cms.global.CAMPAIGN_ID;
                }
                var parameter = {
                    name: cms.global.USER_DATA.name + "'s campaign"
                };
                nn.api('POST', cms.reapi('/api/users/{userId}/poi_campaigns', {
                    userId: cms.global.USER_DATA.id
                }), parameter, function (poi_campaign) {
                    cms.global.CAMPAIGN_ID = poi_campaign.id;
                    return cms.global.CAMPAIGN_ID;
                });
            });
        } else {
            nn.log('Can not invoke getUserCampaignId()!', 'error');
        }
    };

    //-------------------------------------------------------------------------
    // i18n Language Common
    //-------------------------------------------------------------------------

    $common.setupLanguageAndRenderPage = function (user, isStoreLangKey) {
        // fetch user lang
        cms.global.USER_DATA = user;
        var lang = cms.global.USER_DATA.lang;
        if (-1 === $.inArray(lang, cms.config.LANG_SUPPORT)) {
            lang = 'en';
            cms.global.USER_DATA.lang = lang;
        }
        $('html').removeClass(cms.config.LANG_SUPPORT.join(' ')).addClass(lang);
        $('html').attr('lang', lang);

        // setup user profile
        $('#selected-profile').text(cms.global.USER_DATA.name);

        nn.api('GET', cms.reapi('lang/{lang}.json', {
            lang: lang
        }), null, function (langPack) {
            var msie = /MSIE/.test(navigator.userAgent),
                userUrlFile = null,
                $page = null;

            // get url file
            userUrlFile = cms.global.USER_URL.attr('file');
            if ('' === userUrlFile) {
                userUrlFile = 'index.html';
            }

            // setup pageId
            if (-1 === $.inArray(userUrlFile, ['channel-add.html', 'channel-setting.html'])) {
                cms.global.PAGE_ID = userUrlFile.substr(0, userUrlFile.indexOf('.'));
            } else {
                cms.global.PAGE_ID = 'channel';
            }

            // setup page object
            $page = (function (pid) {
                var pageId = pid || cms.global.PAGE_ID,
                    keyword = $.merge($.merge([], cms.config.RESERVED_CORE), cms.config.RESERVED_FUNC),
                    object = cms.global.PAGE_OBJECT;
                if (object === null && pageId !== '' && -1 === $.inArray(pageId, keyword) && cms[pageId] && typeof cms[pageId].init === 'function') {
                    object = cms[pageId];
                    cms.global.PAGE_OBJECT = object;
                }
                return object;
            }(cms.global.PAGE_ID));

            nn.log({
                pageId: cms.global.PAGE_ID,
                page: $page
            }, 'debug');
            if ($page === null) {
                nn.log('Can not render page!', 'error');
                return;
            }

            // setup lang pack
            cms.config.LANG_MAP = langPack['lang-map'];
            cms.config.SPHERE_MAP = langPack['sphere-map'];
            cms.config.EFFECT_MAP = langPack['effect-map'];
            nn.i18n(langPack);

            // store lang key
            if (true === isStoreLangKey) {
                if (!msie) {
                    // avoid IE8 bug
                    $('title').data('langkey', $('title').text());
                }
                $('#title-func .langkey, #header a, #footer span, #footer a, .lightbox-content .btns a, #studio-nav a, #studio-nav .langkey, #func-nav a, #epcurate-nav .langkey, #epcurateForm .langkey').each(function () {
                    $(this).data('langkey', $(this).text());
                });
                $('.setup-notice h4, .setup-notice h5, .setup-notice .content').each(function () {
                    $(this).data('langkey', $(this).html());
                });
                $('#epcurateForm .langkey-val').each(function () {
                    $(this).data('langkey', $(this).val());
                });
                // portal manage
                $('#portal-layer .langkey, #portal-add-layer .langkey, #store-layer .langkey, #brand-layer .langkey').each(function () {
                    $(this).data('langkey', $(this).text());
                });
                $('#portal-add-layer .langkeyVal').each(function () {
                    $(this).data('langkey', $(this).val());
                });
                $('#portal-add-layer .langkeyH').each(function () {
                    $(this).data('langkey', $(this).html());
                });
            }

            // replace lang value
            // NOTE: get cms.global.PAGE_ID after render page
            if (!msie) {
                // avoid IE8 bug
                $('title').text(nn._([cms.global.PAGE_ID, 'html-title', $('title').data('langkey')]));
            }
            $('#header a').each(function () {
                $(this).text(nn._(['header', $(this).data('langkey')]));
            });
            $('#studio-nav a, #studio-nav .langkey').each(function () {
                $(this).html(nn._(['studio-nav', $(this).data('langkey')]));
            });
            $('#footer span, #footer a').each(function () {
                $(this).text(nn._(['footer', $(this).data('langkey')]));
            });
            $('.setup-notice h4, .setup-notice h5, .setup-notice .content').each(function () {
                $(this).html(nn._(['overlay', 'facebook', $(this).data('langkey')]));
            });
            $('.lightbox-content .btns a').each(function () {
                $(this).html(nn._(['overlay', 'button', $(this).data('langkey')]));
            });
            $('#func-nav a').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'func-nav', $(this).data('langkey')]));
            });
            $('#epcurate-nav .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'epcurate-nav', $(this).data('langkey')]));
            });
            $('#epcurateForm .langkey').each(function () {
                $(this).html(nn._([cms.global.PAGE_ID, 'epcurate-form', $(this).data('langkey')]));
            });
            $('#epcurateForm .langkey-val').each(function () {
                $(this).val(nn._([cms.global.PAGE_ID, 'epcurate-form', $(this).data('langkey')]));
            });
            $('#language').text($('#language-' + lang).text());
            $('#language-en, #language-zh').parent('li').removeClass('on');
            $('#language-' + lang).parent('li').addClass('on');

            // setup POI campaign Id
            if (-1 !== $.inArray(userUrlFile, ['epcurate-curation.html', 'channel-poi.html'])) {
                $common.setupUserCampaignId();
            }

            // remove cookie
            if (-1 === $.inArray(userUrlFile, ['epcurate-curation.html', 'epcurate-publish.html'])) {
                $.removeCookie('cms-epe');
                $.removeCookie('cms-crumb');
            }

            // render page
            if (-1 === $.inArray(userUrlFile, ['channel-add.html', 'channel-setting.html', 'epcurate-publish.html', 'epcurate-curation.html'])) {
                $common.initFacebookJavaScriptSdk();
            }
            $page.init({
                init: true
            });
        }, 'json');
    };

    // for signin
    $common.setupLanguagePage = function () {
        $common.showProcessingOverlay();
        // fetch user lang
        var lang = $.cookie('signLang');
        if (-1 === $.inArray(lang, cms.config.LANG_SUPPORT)) {
            lang = 'en';
        }
        $('#language').text($('#language-' + lang).text());
        $('#language-en, #language-zh').parent('li').removeClass('on');
        $('#language-' + lang).parent('li').addClass('on');
        $('html').removeClass(cms.config.LANG_SUPPORT.join(' ')).addClass(lang);
        $('html').attr('lang', lang);

        nn.api('GET', cms.reapi('lang/{lang}.json', {
            lang: lang
        }), null, function (langPack) {
            var msie = /MSIE/.test(navigator.userAgent),
                tmpStr = '';

            // setup lang pack
            cms.config.LANG_MAP = langPack['lang-map'];
            cms.config.SPHERE_MAP = langPack['sphere-map'];
            cms.config.EFFECT_MAP = langPack['effect-map'];
            nn.i18n(langPack);

            if (!msie) {
                if ($('title').data('langkey') === undefined) {
                    $('title').data('langkey', $('title').text());
                }
                $('title').text(nn._(['signin', 'html-title', $('title').data('langkey')]));
            }

            $('#header a').each(function () {
                if ($(this).data('langkey') === undefined) {
                    $(this).data('langkey', $(this).text());
                }
                $(this).text(nn._(['header', $(this).data('langkey')]));
            });

            $('#login-layer .langkey, #signup-layer .langkey, #forgot-password-layer .langkey, #reset-password-layer .langkey').each(function () {
                if ($(this).data('langkey') === undefined) {
                    $(this).data('langkey', $(this).text());
                }
                $(this).text(nn._(['signin', 'login-holder', $(this).data('langkey')]));
            });

            $('#signup-layer .langkeyH').each(function () {
                if ($(this).data('langkey') === undefined) {
                    $(this).data('langkey', $(this).html());
                }
                $(this).html(nn._(['signin', 'login-holder', $(this).data('langkey')]));
            });

            $('#login-layer .flangkey, #signup-layer .flangkey, #forgot-password-layer .flangkey, #reset-password-layer .flangkey').each(function () {
                if ($(this).data('langkey') === undefined) {
                    $(this).data('langkey', $(this).attr('defvalue'));
                }
                tmpStr = nn._(['signin', 'login-holder', $(this).data('langkey')]);
                $(this).attr('defvalue', tmpStr);
                $(this).attr('value', tmpStr);
            });

            cms.signin.init({
                init: true
            });
            $('#overlay-s').fadeOut();
        }, 'json');
    };

    // NOTE: remember to change page-key to match func-name
}(cms.namespace('common')));
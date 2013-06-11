/*jslint browser: true, devel: true, bitwise: true, nomen: true, regexp: true, unparam: true, sloppy: true */
/*global $, nn, CMS_CONF, FB, scrollbar, renderConnectFacebookUI, renderAutoShareUI, buildFacebookPagesMap, setupLanguageAndRenderPage, setupLanguagePage, setFormHeight */
function iniSharingList(inObj) {
    var strCid = "", strEid = "", strBrand = "", strBaseURL = "http://www.9x9.tv/view?", strSurl = "";
    var userUrlFile = CMS_CONF.USER_URL.attr('file');
    if ('' === userUrlFile) {
        userUrlFile = 'index.html';
    }
    strBrand = inObj.find(".select-txt-gray").text();
    strCid = inObj.data("metach");
    strEid = inObj.data("metaep");
    if (userUrlFile === 'index.html') {
        strSurl = strBaseURL + ["brand=" + strBrand, "ch=" + strCid].join("&");
    } else {
        strSurl = strBaseURL + ["brand=" + strBrand, "ch=" + strCid, "ep=e" + strEid].join("&");

    }
    return strSurl;
}

function autoWidth() {
    var contentNavWidth = 200,  // $('#content-nav')
        scrollbarWidth = 35;    // padding15 + slider5 + padding15
    $('#content-main').width($(window).width() - contentNavWidth - scrollbarWidth);
    $('.epcurate-curation #content-main').width($(window).width());
    $('#epcurate-curation .tab-content .result-list ul').width($(window).width() - $('#epcurate-curation #video-player .video').width() - 60);  // 60: previous:30 + next:30
    //$('#epcurate-curation .tab-content .result-list a.video-next').css('left', $(window).width() - 35 + 'px');
}

function autoHeight() {
    var windowHeight = $(window).height(),
        footerHeight = $('#footer').height(),
        titleFuncContentHeight = $('#title-func').height(),
        titleFuncPaddingTop = parseInt($('#title-func').css('padding-top'), 10),
        titleFuncPaddingBottom = parseInt($('#title-func').css('padding-bottom'), 10),
        titleFuncHeight = parseInt(titleFuncContentHeight + titleFuncPaddingTop + titleFuncPaddingBottom, 10),
        sliderHeight = windowHeight - titleFuncHeight - 157;            // 157: (header45 + studio-nav49)94 + footer48 + space15
    $('#content-wrap').height($(window).height() - 94);                 // 94: header45(50-5) + studio-nav49(36+13);
    $('#content-main').height($(window).height() - footerHeight - 94);  // 94: header45(50-5) + studio-nav49(36+13);
    $('.epcurate-curation#content-wrap, .epcurate-publish#content-wrap').height($(window).height() - 46);   // $('#epcurate-nav .epcurate-nav-wrap')
    $('.epcurate-curation #content-main, .epcurate-publish #content-main').height($(window).height() - 94); // 94: epcurate-nav46 + form-btn48  
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
}

function scrollToBottom() {
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    $('#content-main-wrap').css('top', '-' + parseInt($('#content-main-wrap').height() - $('#content-main').height(), 10) + 'px');
    $('#main-wrap-slider .ui-slider-handle').css('bottom', '0');
}

function hideFbPageList() {
    if ($('#settingForm').length > 0) {
        var hasHideFbPageList = false;
        $('#fb-page-list').hide();
        if ($('.page-list').hasClass('on')) {
            $('.page-list').removeClass('on');
            hasHideFbPageList = true;
        }
        if ('none' !== $('#main-wrap-slider').css('display')) {
            $('#content-main-wrap form').height('auto');
            $('#content-main-wrap').height($('#content-main-wrap form').height() + 70 + 65);
            $('#main-wrap-slider .slider-vertical').slider('destroy');
            if (hasHideFbPageList) {
                $('#content-main-wrap').css('top', '0');
            }
            scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        }
    }
}

function showSystemErrorOverlay(msg) {
    if ('' === $.trim(msg)) {
        msg = 'Unknown error.';
    }
    $('#system-error .content').text(nn._(['overlay', 'system-error', msg]));
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI({
        message: $('#system-error')
    });
}

function showSystemErrorOverlayAndHookError(msg) {
    $('body').addClass('has-error');
    showSystemErrorOverlay(msg);
}

function showProcessingOverlay() {
    $('#overlay-s .overlay-middle').html('<img src="images/icon_load_l.gif" alt="" />' + nn._(['overlay', 'loading', 'Processing...']));
    $('#overlay-s').fadeIn().css('z-index', '1200');
}

function showSavingOverlay() {
    $('#overlay-s .overlay-middle').html('<img src="images/icon_load_l.gif" alt="" />' + nn._(['overlay', 'loading', 'Saving...']));
    $('#overlay-s').fadeIn().css('z-index', '1200');
}

function buildUnsaveOverlay(hook) {
    $(hook + ' .content').text(nn._(['overlay', 'prompt', 'Unsaved changes will be lost, are you sure you want to leave?']));
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI({
        message: $(hook)
    });
}

function showUnsaveOverlay() {
    buildUnsaveOverlay('#unsave-prompt');
}

function showUnsaveTrimTimeOverlay(e) {
    $('body').data('origin', e);
    buildUnsaveOverlay('#unsave-trimtime-prompt');
}

function showUnsaveTitleCardOverlay(e) {
    $('body').data('origin', e);
    buildUnsaveOverlay('#unsave-titlecard-prompt');
}

function showUnsavePoiOverlay(e) {
    $('body').data('origin', e);
    $('#unsave-poi-prompt .content').text(nn._(['overlay', 'prompt', 'Unsaved changes will be lost, are you sure you want to cancel editing?']));
    $.blockUI({
        message: $('#unsave-poi-prompt')
    });
}

function showUnsavePoiMask(e) {
    $('body').data('origin', e);
    $('#unsave-poi-mask-prompt .content').text(nn._(['overlay', 'prompt', 'Unsaved changes will be lost, are you sure you want to cancel editing?']));
    $('#poi-event-overlay').hide();
    $('#unsave-poi-mask-prompt').show().css('z-index', '1100');
}

function showDeletePromptOverlay(msg) {
    $('#delete-prompt .content').text(nn._(['overlay', 'prompt', msg]));
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI({
        message: $('#delete-prompt')
    });
    $('.blockOverlay').height($(window).height() - 45);
}

function showDeletePoiPromptOverlay(msg) {
    $('#del-poi-notice .content').text(nn._(['overlay', 'prompt', msg]));
    $.blockUI({
        message: $('#del-poi-notice')
    });
}

function showDraftNoticeOverlay(e) {
    $('body').addClass('first-save');
    $('body').data('origin', e);
    $('#draft-notice h4').text(nn._(['overlay', 'notice', 'New episode has been created as a draft!']));
    $('#draft-notice .content').html(nn._(['overlay', 'notice', '<span>Publish this episode at the next step</span> whenever you finish editing.']));
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI({
        message: $('#draft-notice')
    });
}

function showPublishNoticeOverlay() {
    $('#publish-notice .content').text(nn._(['overlay', 'notice', 'This episode has been published.']));
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI({
        message: $('#publish-notice')
    });
}

function showUnpublishNoticeOverlay() {
    $('#unpublish-notice .content').text(nn._(['overlay', 'notice', 'This episode has been saved as an unpublished draft.']));
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI({
        message: $('#unpublish-notice')
    });
}

function formatTimestamp(timestamp, dateSeparator, timeSeparator) {
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
        time = year + dateSeparator
             + ((month >= 10) ? month : '0' + month) + dateSeparator
             + ((date >= 10) ? date : '0' + date) + ' '
             + ((hour >= 10) ? hour : '0' + hour) + timeSeparator
             + ((min >= 10) ? min : '0' + min);
    return time;
}

function formatDuration(duration, autoPadding) {
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
}

function nl2br(text) {
    return text.replace(/\n/g, '<br />');
}

function strip_tags(input, allowed) {
    // version: 1109.2015
    allowed = (((allowed || "").toString()).toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}

function str_replace(search, replace, subject, count) {
    // version: 1109.2015
    var i = 0,
        j = 0,
        temp = '',
        repl = '',
        sl = 0,
        fl = 0,
        f = [].concat(search),
        r = [].concat(replace),
        s = subject,
        ra = Object.prototype.toString.call(r) === '[object Array]',
        sa = Object.prototype.toString.call(s) === '[object Array]';
    s = [].concat(s);
    if (count) {
        this.window[count] = 0;
    }

    for (i = 0, sl = s.length; i < sl; i += 1) {
        if (s[i] !== '') {
            for (j = 0, fl = f.length; j < fl; j += 1) {
                temp = s[i].toString();
                repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
                s[i] = temp.split(f[j]).join(repl);
                if (count && s[i] !== temp) {
                    this.window[count] += (temp.length - s[i].length) / f[j].length;
                }
            }
        }
    }
    return sa ? s : s[0];
}

function htmlspecialchars(string, quote_style, charset, double_encode) {
    // version: 1109.2015
    var optTemp = 0,
        i = 0,
        noquotes = false,
        OPTS = {
            'ENT_NOQUOTES': 0,
            'ENT_HTML_QUOTE_SINGLE': 1,
            'ENT_HTML_QUOTE_DOUBLE': 2,
            'ENT_COMPAT': 2,
            'ENT_QUOTES': 3,
            'ENT_IGNORE': 4
        };
    if (quote_style === undefined || quote_style === null) {
        quote_style = 2;
    }
    if ('' === string || null === string) {
        string = '';
    }
    string = string.toString();
    if (double_encode !== false) { // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;');
    }
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (quote_style === 0) {
        noquotes = true;
    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i = 0; i < quote_style.length; i += 1) {
            // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
            if (OPTS[quote_style[i]] === 0) {
                noquotes = true;
            } else if (OPTS[quote_style[i]]) {
                optTemp = optTemp | OPTS[quote_style[i]];
            }
        }
        quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/'/g, '&#039;');
    }
    if (!noquotes) {
        string = string.replace(/"/g, '&quot;');
    }

    return string;
}

function htmlEscape(string, skipAmp) {
    var data = str_replace('&amp;#', '&#', htmlspecialchars(string, 'ENT_QUOTES', null, false));
    if (true === skipAmp) {
        data = str_replace('&amp;', '&', data);
    }
    return data;
}

function checkCriticalPerm(authResponse, callback) {
    if (authResponse && authResponse.accessToken) {
        var parameter = {
            access_token: authResponse.accessToken
        };
        // ON PURPOSE to wait facebook sync
        setTimeout(function () {
            // FB.api('/me/permissions', { anticache: (new Date()).getTime() }, function (response) {
            nn.api('GET', 'https://graph.facebook.com/me/permissions', parameter, function (response) {
                var permList = null,
                    hasCriticalPerm = false;
                if (response.data && response.data[0]) {
                    permList = response.data[0];
                    if (permList.manage_pages && permList.publish_stream) {
                        hasCriticalPerm = true;
                    }
                }
                // callback is handleRevokedPerm or handleAutoSharePerm
                if ('function' === typeof callback) {
                    callback(hasCriticalPerm, authResponse);
                }
            }, 'jsonp');
        }, 1000);
    }
}

$(function () {
    if (navigator.userAgent.indexOf('Mac') > 0) {
        $('body').addClass('mac');
    }
    autoWidth();
    autoHeight();

    // checkbox checked highlight (but radio customize by page)
    $(document).on('click', 'input[type=checkbox]', function () {
        $(this).parents('label').toggleClass('checked');
    });

    // studio setup (callback of checkCriticalPerm)
    function handleRevokedPerm(hasCriticalPerm, authResponse) {
        if (hasCriticalPerm && authResponse && authResponse.userID && authResponse.accessToken) {
            $.unblockUI();
            showProcessingOverlay();
            var parameter = {
                userId: authResponse.userID,
                accessToken: authResponse.accessToken
            };
            nn.api('POST', CMS_CONF.API('/api/users/{userId}/sns_auth/facebook', {
                userId: CMS_CONF.USER_DATA.id
            }), parameter, function (result) {
                if ('OK' === result) {
                    nn.api('GET', CMS_CONF.API('/api/users/{userId}/sns_auth/facebook', {
                        userId: CMS_CONF.USER_DATA.id
                    }), null, function (facebook) {
                        $('#overlay-s').fadeOut('slow', function () {
                            // ready for disconnect facebook
                            CMS_CONF.FB_RESTART_CONNECT = false;
                            $('#studio-nav .reconnect-notice').addClass('hide');
                            CMS_CONF.FB_PAGES_MAP = buildFacebookPagesMap(facebook);
                            CMS_CONF.USER_SNS_AUTH = facebook;
                            $('.setup-notice p.fb-connect a.switch-on').removeClass('hide');
                            $('.setup-notice p.fb-connect a.switch-off').addClass('hide');
                            // show studio setup (connect switch) again
                            $.blockUI({
                                message: $('#fb-connect')
                            });
                            // sync channel setting
                            if ($('#settingForm').length > 0) {
                                var isAutoCheckedTimeline = true;
                                renderAutoShareUI(facebook, isAutoCheckedTimeline);
                                setTimeout(function () {
                                    autoHeight();
                                    setFormHeight();
                                    scrollToBottom();
                                }, 1000);
                            }
                        });
                    });
                }
            });
        } else {
            // connected but has not critical permission!!
            $.blockUI({
                message: $('#fb-connect-failed')
            });
        }
    }
    $('#studio-nav .studio-setup .btn-left').click(function () {
        // studio setup
        // ON PURPOSE to skip unsave check
        var hook = (true === CMS_CONF.FB_RESTART_CONNECT) ? '#restart-connect' : '#fb-connect';
        $.blockUI({
            message: $(hook)
        });
        return false;
    });
    $('#fb-connect .switch-off, #restart-connect .btn-reconnect').click(function () {
        // connect facebook
        FB.login(function (response) {
            if (response.authResponse) {
                // connected but not sure have critical permission
                checkCriticalPerm(response.authResponse, handleRevokedPerm);
            } else {
                // cancel login nothing happens (maybe unknown or not_authorized)
                nn.log(response, 'debug');
            }
        }, {scope: CMS_CONF.FB_REQ_PERMS.join(',')});

        return false;
    });
    $('#fb-connect-failed .btn-failed-ok').click(function () {
        // continue to show studio setup
        var hook = (true === CMS_CONF.FB_RESTART_CONNECT) ? '#restart-connect' : '#fb-connect';
        $.blockUI({
            message: $(hook)
        });
        return false;
    });
    $('#fb-connect .switch-on').click(function () {
        // disconnect facebook
        $.blockUI({
            message: $('#confirm-disconnect')
        });
        return false;
    });
    $('#confirm-disconnect .btn-disconnect').click(function () {
        $.unblockUI();
        showProcessingOverlay();
        nn.api('DELETE', CMS_CONF.API('/api/users/{userId}/sns_auth/facebook', {
            userId: CMS_CONF.USER_DATA.id
        }), null, function (facebook) {
            $('#overlay-s').fadeOut('slow', function () {
                if ('OK' === facebook) {
                    CMS_CONF.FB_RESTART_CONNECT = false;
                    $('#studio-nav .reconnect-notice').addClass('hide');
                    CMS_CONF.FB_PAGES_MAP = null;
                    CMS_CONF.USER_SNS_AUTH = null;
                    $('.setup-notice p.fb-connect a.switch-on').addClass('hide');
                    $('.setup-notice p.fb-connect a.switch-off').removeClass('hide');
                    $.blockUI({
                        message: $('#disconnect-notice')
                    });
                    // sync channel setting
                    if ($('#settingForm').length > 0) {
                        renderConnectFacebookUI();
                    }
                }
            });
        });
        return false;
    });

    // common unblock
    $('.unblock, .btn-close, .btn-no, .setup-notice .btn-ok').click(function () {
        $.unblockUI();
        return false;
    });

    // header link
    $('#logo').click(function () {
        if (!$('body').hasClass('has-change')) {
            location.href = '../';
            return false;
        }
    });
    $('#profile-logout').click(function () {
        if (!$('body').hasClass('has-change')) {
            nn.api('DELETE', CMS_CONF.API('/api/login'), null, function (data) {
                location.href = 'signin.html';
            });
            return false;
        }
    });

    // change language
    $('#language-change li a').click(function () {
        if ('signin' === $(this).data('page')) {
            var sign_lang = $(this).data('meta');
            if (-1 === $.inArray(sign_lang, CMS_CONF.LANG_SUPPORT)) {
                sign_lang = 'en';
            }
            $.cookie('signLang', sign_lang, {
                expires: 30
            });
            setupLanguagePage();
            $(this).parents('.select-list').slideDown();
            return false;
        }
        if (null !== CMS_CONF.USER_DATA && !$('body').hasClass('has-change')) {
            nn.api('PUT', CMS_CONF.API('/api/users/{userId}', {
                userId: CMS_CONF.USER_DATA.id
            }), {
                lang: $(this).data('meta')
            }, function (user) {
                var isStoreLangKey = false;
                setupLanguageAndRenderPage(user, isStoreLangKey);
            });
            $(this).parents('.select-list').slideDown();
            return false;
        }
    });

    // common dropdown (share with header, footer, channel-add and channel-setting)
    function showDropdown(btn) {
        var str = '',
            id = '';
        hideFbPageList();
        $('.dropdown, .select-list').hide();
        $('.dropdown')
            .parents('li:not(' + btn + ')').removeClass('on')
            .children('.on:not(' + btn + ')').removeClass('on');
        $(btn).toggleClass('on');
        str = $(btn).attr('id');
        if (str.search('btn') === 0) {
            // slice(4) for btn-xxx
            str = $(btn).attr('id').slice(4);
        }
        id = '#' + str + '-dropdown';
        if ($(btn).hasClass('on')) {
            $(id).show();
        } else {
            $(id).hide();
        }
    }
    $('body').click(function () {
        $('.dropdown').hide();
        $('.dropdown').parents('li').removeClass('on').children('.on').removeClass('on');
        $('.select-list').hide();
        $('.select-list').parents().removeClass('on').children('.on').removeClass('on');
        hideFbPageList();
    });

    // header profile dropdown
    $('#btn-profile, #selected-profile').click(function (event) {
        showDropdown('#btn-profile');
        $('#footer p.select-btn').removeClass('on');
        event.stopPropagation();
    });
    $('#profile-dropdown li').click(function () {
        $('#btn-profile').removeClass('on');
        $('#profile-dropdown').hide();
    });

    // footer control
    $('#footer-control').click(function () {
        if ($(this).hasClass('on')) {
            $(this).removeClass('on');
            $('#footer').slideToggle();
        } else {
            $(this).addClass('on');
            $('#footer').slideToggle();
        }
    });

    // footer dropdown
    $('#footer-list li .select-btn, #footer-list li .select-txt').click(function (event) {
        hideFbPageList();
        $('.select-list, .dropdown').hide();
        $('#nav li, #btn-profile').removeClass('on');
        $(this).parent('li').siblings().children('.on').removeClass('on');
        $(this).parent().children('.select-btn').toggleClass('on');
        if ($(this).parent().children('.select-btn').hasClass('on')) {
            $(this).parent().children('.select-list').show();
        } else {
            $(this).parent().children('.select-list').hide();
        }
        event.stopPropagation();
    });
    $('#footer-list li .select-list li a').click(function () {
        $('#footer-list li .select-btn').removeClass('on');
        $(this).parents('.select-list').slideToggle();
    });

    // ellipsis
    function setEllipsis() {
        $('.ellipsis').ellipsis();
    }
    setEllipsis();

    $(window).resize(function () {
        autoWidth();
        autoHeight();
        setEllipsis();
    });
});

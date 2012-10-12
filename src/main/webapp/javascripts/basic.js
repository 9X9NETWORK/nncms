function autoWidth() {
    var contentNavWidth = 200,  // $('#content-nav')
        scrollbarWidth = 35;    // padding15 + slider5 + padding15
    $('#content-main').width($(window).width() - contentNavWidth - scrollbarWidth);
    $('.epcurate-curation #content-main').width($(window).width());
    $('#epcurate-curation .tab-content .result-list ul').width($(window).width() - $('#epcurate-curation #video-player .video').width() - 60);  // padding30 + padding30
    //$('#epcurate-curation .tab-content .result-list a.video-next').css('left', $(window).width() - 35 + 'px');
}

function autoHeight() {
    var windowHeight = $(window).height(),
        titleFuncHeight = $('#title-func').height() + 38,   // padding21 + padding17
        sliderHeight = windowHeight - titleFuncHeight - 156;    // header(+studio-nav)94 + footer48 + slide-padding-bottom14
    $('#content-wrap, #content-main').height($(window).height() - 94);  // 94: header45(50-5) + studio-nav49(36+13);
    $('.epcurate-info#content-wrap, .epcurate-curation#content-wrap, .epcurate-publish#content-wrap, .epcurate-shopping#content-wrap').height($(window).height() - 49);     // $('#epcurate-nav .epcurate-nav-wrap')
    $('.epcurate-info #content-main, .epcurate-curation #content-main, .epcurate-publish #content-main, .epcurate-shopping #content-main').height($(window).height() - 49);
    $('#content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + 131);                  // compute value: footer48 + slide-padding-bottom15
    $('.epcurate-curation #content-main-wrap').height($('#content-main-wrap').children('.constrain').height());
    $('.library-list #content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + 190);    // compute value
    $('#content-main-wrap:not(.curation)').css('margin-top', titleFuncHeight + 'px');
    $('#main-wrap-slider').css('top', titleFuncHeight + 'px');
    $('#main-wrap-slider').height(sliderHeight);
    $('#main-wrap-slider').attr('data-orig-slider-height', sliderHeight);
}

function showSystemErrorOverlay(msg) {
    if ('' == $.trim(msg)) { msg = 'Unknown error message.'; }
    $('#system-error .content').html(msg);
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
    $('#overlay-s .overlay-middle').html('Processing...');
    $('#overlay-s').fadeIn();
    $('#overlay-s .overlay-content').css('margin-left', '-65px');
}

function showSavingOverlay() {
    $('#overlay-s .overlay-middle').html('Saving...');
    $('#overlay-s').fadeIn();
    $('#overlay-s .overlay-content').css('margin-left', '-43px');
}

function showUnsaveOverlay() {
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI({
        message: $('#unsave-prompt')
    });
}

function showUnsaveTitleCardOverlay() {
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI({
        message: $('#unsave-titlecard-prompt')
    });
}

function showDeletePromptOverlay() {
    $.blockUI.defaults.overlayCSS.opacity = '0.9';
    $.blockUI({
        message: $('#delete-prompt')
    });
    $('.blockOverlay').height($(window).height() - 45);
}

function formatTimestamp(timestamp) {
    var a = new Date(timestamp),
        year = a.getFullYear(),
        month = a.getMonth() + 1,
        date = a.getDate(),
        hour = a.getHours(),
        min = a.getMinutes(),
        time = year + '-'
             + ((month >= 10) ? month : '0' + month) + '-'
             + ((date >= 10) ? date : '0' + date) + ' '
             + ((hour >= 10) ? hour : '0' + hour) + ':'
             + ((min >= 10) ? min : '0' + min);
    return time;
}

function formatDuration(duration) {
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
    } else {
        return durationMin + ':' + durationSec;
    }
}

function nl2br(text) {
    return text.replace(/\n/g, '<br />');
}

function strip_tags(input, allowed) {
    // version: 1109.2015
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
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

    for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
            continue;
        }
        for (j = 0, fl = f.length; j < fl; j++) {
            temp = s[i] + '';
            repl = ra ? (r[j] !== undefined ? r[j] : '') : r[0];
            s[i] = (temp).split(f[j]).join(repl);
            if (count && s[i] !== temp) {
                this.window[count] += (temp.length - s[i].length) / f[j].length;
            }
        }
    }
    return sa ? s : s[0];
}

function htmlspecialchars(string, quote_style, charset, double_encode) {
    // version: 1109.2015
    var optTemp = 0,
        i = 0,
        noquotes = false;
    if (typeof quote_style === 'undefined' || quote_style === null) {
        quote_style = 2;
    }
    if ('' == string || null == string) {
        string = '';
    }
    string = string.toString();
    if (double_encode !== false) { // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;');
    }
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE': 1,
        'ENT_HTML_QUOTE_DOUBLE': 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE': 4
    };
    if (quote_style === 0) {
        noquotes = true;
    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i = 0; i < quote_style.length; i++) {
            // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
            if (OPTS[quote_style[i]] === 0) {
                noquotes = true;
            }
            else if (OPTS[quote_style[i]]) {
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

$(function () {
    autoWidth();
    autoHeight();

    // Header link
    $('#logo').click(function () {
        if (!$('body').hasClass('has-change')) {
            location.href = '/';
            return false;
        }
    });
    $('#profile-logout').click(function () {
        if (!$('body').hasClass('has-change')) {
            nn.api('DELETE', '/api/login', null, function (data) {
                location.href = '/';
            });
            return false;            
        }
    });

    // common dropdown (share with header, footer, channel-add and channel-setting)
    function showDropdown(btn) {
        $('.dropdown, .select-list').hide();
        $('.dropdown')
            .parents('li:not(' + btn + ')').removeClass('on')
            .children('.on:not(' + btn + ')').removeClass('on');
        $(btn).toggleClass('on');
        var str = $(btn).attr('id');
        if (str.search('btn') == 0) {
            // slice(4) for btn-xxx
            str = $(btn).attr('id').slice(4);
        }
        var id = '#' + str + '-dropdown';
        if ($(btn).hasClass('on')) {
            $(id).show();
        } else {
            $(id).hide();
        }
    }
    $('body').click(function () {
        $('.dropdown').hide();
        $('.dropdown').parents('li').removeClass('on').children('.on').removeClass('on');
    });
    $('body').click(function () {
        $('.select-list').hide();
        $('.select-list').parents().removeClass('on').children('.on').removeClass('on');
    });

    // Header Profile Dropdown
    $('#btn-profile, #selected-profile').click(function (event) {
        showDropdown('#btn-profile');
        $('#footer p.select-btn').removeClass('on');
        event.stopPropagation();
    });
    $('#profile-dropdown li').click(function () {
        $('#btn-profile').removeClass('on');
        $('#profile-dropdown').hide();
    });

    // Header Search
    function setInput(hint, input) {
        field = input + ' .textfield';
        $(field).focus(function () {
            var txt = $(this).val();
            if (txt == hint) {
                $(this).val('');
            }
        }).blur(function () {
            txt = $(this).val();
            if (txt == '') {
                $(this).val(hint);
            }
        });
    }
    setInput('Search', '#search');
    function inputHilite() {
        $('.textfield').focus(function () {
            $(this).parent().addClass('on');
        }).blur(function () {
            $(this).parent().removeClass('on');
        });
    }
    inputHilite();

    // Footer Control
    $('#footer-control').click(function () {
        if ($(this).hasClass('on')) {
            $(this).removeClass('on');
            $('#footer').slideToggle();
        } else {
            $(this).addClass('on');
            $('#footer').slideToggle();
        }
    });

    // Footer Dropdown
    $('#footer-list li .select-btn, #footer-list li .select-txt').click(function (event) {
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
    $('#footer-list li .select-list li').click(function () {
        $('#footer-list li .select-btn').removeClass('on');
        $(this).parent('.select-list').slideToggle();
    });

    // Ellipsis
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
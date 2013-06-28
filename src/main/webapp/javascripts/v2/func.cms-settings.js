/*jslint browser: true, nomen: true, regexp: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.setFormHeight = function () {
        var windowHeight = $(window).height(),
            titleFuncHeight = $('#title-func').height(),
            headerHeight = $('#header').height(),
            navHeight = $('#studio-nav').height(),
            contentHeight = windowHeight - titleFuncHeight - headerHeight - navHeight - 48 - 38 - 10 + 5;   // 5:header and studio-nav overlap 48:footer 38:title-func-padding
        $('#cms-setting form').height(contentHeight - 56);  // 56: form padding-bottom
    };

    $page.chkData = function (fm) {
        var username = '',
            srclen = 0,
            wordlist = [],
            zholen = 0,
            multilen = 0,
            cntlen = 0,
            wordchar = '',
            min = 0,
            max = 0,
            patternString = '',
            patternUsername = null;

        fm.username.value = $.trim(fm.username.value);
        username = fm.username.value;
        srclen = username.length;
        wordlist = username.split(/[\u4e00-\u9a05]/);
        zholen = wordlist.length - 1;
        multilen = zholen * 2;
        cntlen = (srclen - zholen) + multilen;
        wordchar = $.trim(wordlist.join(''));
        min = ((6 - multilen) > 0) ? (6 - multilen) : 0;
        max = ((16 - multilen) > 0) ? (16 - multilen) : 1;
        patternString = '^[\\w]{' + min + ',' + max + '}$';
        patternUsername = new RegExp(patternString);

        nn.log({
            username: username,
            srclen: srclen,
            wordlist: wordlist,
            zholen: zholen,
            multilen: multilen,
            cntlen: cntlen,
            wordchar: wordchar,
            min: min,
            max: max,
            patternString: patternString,
            patternUsername: patternUsername
        }, 'debug');

        if (cms.global.USER_DATA.fbUser) {
            $('#cmsSettingForm .login-notice').stop(true).fadeOut('slow').fadeIn('slow');
            return false;
        }
        if ('' === username) {
            $('#cms-setting .form-btn .notice').removeClass('hide');
            return false;
        }
        if (cntlen < 6 || cntlen > 16) {
            $('#cms-setting .username .notice').addClass('hide');
            $('#cms-setting .username .count-notice').removeClass('hide');
            return false;
        }
        if ('' !== wordchar && !patternUsername.test(wordchar)) {
            $('#cms-setting .username .notice').addClass('hide');
            $('#cms-setting .username .letter-notice').removeClass('hide');
            return false;
        }

        // notice reset
        $('#cms-setting .username .notice').addClass('hide');
        $('#cms-setting .form-btn .notice').addClass('hide');
        return true;
    };

    $page.chkPwdData = function (fm) {
        var countUsername = /^.{6,16}$/;
        fm.pwd_old.value = $.trim(fm.pwd_old.value);
        fm.pwd_new.value = $.trim(fm.pwd_new.value);
        fm.pwd_confirm.value = $.trim(fm.pwd_confirm.value);
        if (cms.global.USER_DATA.fbUser) {
            return false;
        }
        if ('' === fm.pwd_old.value) {
            $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([cms.global.PAGE_ID, 'overlay', 'Please input your old password.']));
            fm.pwd_old.focus();
            return false;
        }
        if ('' === fm.pwd_new.value) {
            $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([cms.global.PAGE_ID, 'overlay', 'Please input your new password.']));
            fm.pwd_new.focus();
            return false;
        }
        if (!countUsername.test(fm.pwd_new.value)) {
            $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([cms.global.PAGE_ID, 'overlay', 'Please input 6-16 characters in password.']));
            fm.pwd_new.focus();
            return false;
        }
        if ('' === fm.pwd_confirm.value) {
            $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([cms.global.PAGE_ID, 'overlay', 'Please repeat your new password.']));
            fm.pwd_confirm.focus();
            return false;
        }
        if (fm.pwd_new.value !== fm.pwd_confirm.value) {
            $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([cms.global.PAGE_ID, 'overlay', "Two passwords don't match, please retype."]));
            fm.pwd_confirm.focus();
            return false;
        }
        // notice reset
        $('#change-pwd-overlay .change-pwd .notice').addClass('hide');
        return true;
    };

    $page.resetChangePwdForm = function () {
        var fm = document.changePwdForm;
        $('#change-pwd-overlay .change-pwd .notice').addClass('hide');
        fm.pwd_old.value = '';
        fm.pwd_new.value = '';
        fm.pwd_confirm.value = '';
    };

    $page.checkCriticalPerm = function (authResponse, callback) {
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
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: cms-settings',
            options: options
        }, 'debug');

        $common.showProcessingOverlay();
        $('#content-main').html('');
        $('#content-main-tmpl').tmpl().appendTo('#content-main');
        $('#change-pwd-overlay .overlay-container').html('');
        $('#change-pwd-overlay-tmpl').tmpl().appendTo('#change-pwd-overlay .overlay-container');
        $('#overlay-s').fadeOut('fast', function () {
            $('#username').charCounter(16, {
                container: '<span class="hide"><\/span>',
                format: '%1 characters to go!',
                delay: 0,
                multibyte: true
            });
            $page.setFormHeight();
            $(window).trigger('resize');
        });
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('cms-settings')));
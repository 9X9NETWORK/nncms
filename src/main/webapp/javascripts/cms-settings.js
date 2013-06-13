/*jslint browser: true, devel: true, nomen: true, regexp: true, sloppy: true */
/*global $, nn, CMS_CONF, FB, showProcessingOverlay, showSavingOverlay, showUnsaveOverlay, buildFacebookPagesMap */

function setFormHeight() {
    var windowHeight = $(window).height(),
        titleFuncHeight = $('#title-func').height(),
        headerHeight = $('#header').height(),
        navHeight = $('#studio-nav').height(),
        contentHeight = windowHeight - titleFuncHeight - headerHeight - navHeight - 48 - 38 - 10 + 5;   // 5:header and studio-nav overlap 48:footer 38:title-func-padding
    $('#cms-setting form').height(contentHeight - 56);  // 56: form padding-bottom
}

function chkData(fm) {
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

    if (CMS_CONF.USER_DATA.fbUser) {
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
}

function chkPwdData(fm) {
    var countUsername = /^.{6,16}$/;
    fm.pwd_old.value = $.trim(fm.pwd_old.value);
    fm.pwd_new.value = $.trim(fm.pwd_new.value);
    fm.pwd_confirm.value = $.trim(fm.pwd_confirm.value);
    if (CMS_CONF.USER_DATA.fbUser) {
        return false;
    }
    if ('' === fm.pwd_old.value) {
        $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([CMS_CONF.PAGE_ID, 'overlay', 'Please input your old password.']));
        fm.pwd_old.focus();
        return false;
    }
    if ('' === fm.pwd_new.value) {
        $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([CMS_CONF.PAGE_ID, 'overlay', 'Please input your new password.']));
        fm.pwd_new.focus();
        return false;
    }
    if (!countUsername.test(fm.pwd_new.value)) {
        $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([CMS_CONF.PAGE_ID, 'overlay', 'Please input 6-16 characters in password.']));
        fm.pwd_new.focus();
        return false;
    }
    if ('' === fm.pwd_confirm.value) {
        $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([CMS_CONF.PAGE_ID, 'overlay', 'Please repeat your new password.']));
        fm.pwd_confirm.focus();
        return false;
    }
    if (fm.pwd_new.value !== fm.pwd_confirm.value) {
        $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([CMS_CONF.PAGE_ID, 'overlay', "Two passwords don't match, please retype."]));
        fm.pwd_confirm.focus();
        return false;
    }
    // notice reset
    $('#change-pwd-overlay .change-pwd .notice').addClass('hide');
    return true;
}

function resetChangePwdForm() {
    var fm = document.changePwdForm;
    $('#change-pwd-overlay .change-pwd .notice').addClass('hide');
    fm.pwd_old.value = '';
    fm.pwd_new.value = '';
    fm.pwd_confirm.value = '';
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
    // common unblock
    $('body').keyup(function (e) {
        if (27 === e.which) { // Esc
            resetChangePwdForm();
            $.unblockUI();
            return false;
        }
    });

    // leave and unsave
    function confirmExit() {
        if ($('body').hasClass('has-change')) {
            // Unsaved changes will be lost, are you sure you want to leave?
            return $('#unsave-prompt p.content').text();
        }
    }
    window.onbeforeunload = confirmExit;
    $('body').removeClass('has-change');
    $('#content-main').on('change', '#cmsSettingForm', function () {
        $('body').addClass('has-change');
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
        if ($('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
            $('#' + $('body').data('leaveId')).trigger('click');
        } else if ($('body').data('leaveUrl')) {
            location.href = $('body').data('leaveUrl');
        } else {
            location.href = 'index.html';
        }
        return false;
    });

    // master form notice reset
    $('#content-main').on('click', '#username', function () {
        $('#cms-setting .username .notice').addClass('hide');
        $('#cms-setting .form-btn .notice').addClass('hide');
    });

    // CMS Settings Save
    $('#content-main').on('click', '#cms-setting .form-btn .btn-save', function () {
        $(document.cmsSettingForm).trigger('submit');
        return false;
    });
    $('#content-main').on('submit', '#cmsSettingForm', function () {
        if (CMS_CONF.USER_DATA.fbUser) {
            return false;
        }
        var parameter = null;
        if (chkData(this)) {
            showSavingOverlay();
            parameter = {
                name: this.username.value
            };
            nn.api('PUT', CMS_CONF.API('/api/users/{userId}', {
                userId: CMS_CONF.USER_DATA.id
            }), parameter, function (user) {
                $('#overlay-s').fadeOut('fast', function () {
                    $('body').removeClass('has-change');
                    CMS_CONF.USER_DATA = user;
                    $('#selected-profile').text(CMS_CONF.USER_DATA.name);
                });
            });
        }
        return false;
    });

    // Change password notice reset
    $('#change-pwd-overlay').on('click', '#change-pwd-overlay-wrap', function () {
        $('#change-pwd-overlay .change-pwd .notice').addClass('hide');
    });

    // Change password
    $('#content-main').on('click', '#cms-setting .btn-change-pwd.disable', function () {
        return false;
    });
    $('#content-main').on('click', '#cms-setting .btn-change-pwd.enable', function () {
        if (CMS_CONF.USER_DATA.fbUser) {
            return false;
        }
        resetChangePwdForm();
        $.blockUI({
            message: $('#change-pwd-overlay')
        });
        return false;
    });
    $('#change-pwd-overlay').on('click', '.btn-chg-pwd', function () {
        var fm = document.changePwdForm,
            parameter = null;
        if (CMS_CONF.USER_DATA.fbUser) {
            return false;
        }
        if (chkPwdData(fm)) {
            showSavingOverlay();
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').fadeOut(0, function () {
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
                    $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([CMS_CONF.PAGE_ID, 'overlay', 'Invalid old password, please try again.']));
                    fm.pwd_old.focus();
                    return false;
                });
            });
            parameter = {
                oldPassword: fm.pwd_old.value,
                newPassword: fm.pwd_new.value
            };
            nn.api('PUT', CMS_CONF.API('/api/users/{userId}', {
                userId: CMS_CONF.USER_DATA.id
            }), parameter, function () {
                $('#overlay-s').fadeOut('fast', function () {
                    resetChangePwdForm();
                    $.unblockUI();
                });
            });
        }
        return false;
    });
    $('#change-pwd-overlay').on('click', '.btn-cancel, .btn-close', function () {
        resetChangePwdForm();
        $.unblockUI();
        return false;
    });

    // Connect to Facebook (callback of checkCriticalPerm)
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
                            // sync cms settings
                            CMS_CONF.FB_RESTART_CONNECT = false;
                            $('#studio-nav .reconnect-notice').addClass('hide');
                            $('#cms-setting .connect .notice, #cms-setting .connect .notify').addClass('hide');
                            CMS_CONF.FB_PAGES_MAP = buildFacebookPagesMap(facebook);
                            CMS_CONF.USER_SNS_AUTH = facebook;
                            // sync connect switch
                            $('.setup-notice p.fb-connect a.switch-on').removeClass('hide');
                            $('.setup-notice p.fb-connect a.switch-off').addClass('hide');
                            // show connect switch again
                            $.blockUI({
                                message: $('#fb-connect')
                            });
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
    $('#content-main').on('click', '#cms-setting .btn-connect-fb', function () {
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
        // continue to show connect switch again
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
                    // sync cms settings
                    CMS_CONF.FB_RESTART_CONNECT = false;
                    $('#studio-nav .reconnect-notice').addClass('hide');
                    CMS_CONF.FB_PAGES_MAP = null;
                    CMS_CONF.USER_SNS_AUTH = null;
                    // sync connect switch
                    $('.setup-notice p.fb-connect a.switch-on').addClass('hide');
                    $('.setup-notice p.fb-connect a.switch-off').removeClass('hide');
                    $.blockUI({
                        message: $('#disconnect-notice')
                    });
                }
            });
        });
        return false;
    });

    $(window).resize(function () {
        setFormHeight();
    });
});

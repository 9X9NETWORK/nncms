/*jslint browser: true, nomen: true */
/*global $, nn, cms, FB */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['cms-settings'],
        $common = cms.common;

    // common unblock
    $('body').keyup(function (e) {
        if (27 === e.which) { // Esc
            $page.resetChangePwdForm();
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
            $common.showUnsaveOverlay();
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
        if (cms.global.USER_DATA.fbUser) {
            return false;
        }
        var parameter = null;
        if ($page.chkData(this)) {
            $common.showSavingOverlay();
            parameter = {
                name: this.username.value
            };
            nn.api('PUT', cms.reapi('/api/users/{userId}', {
                userId: cms.global.USER_DATA.id
            }), parameter, function (user) {
                $('#overlay-s').fadeOut('fast', function () {
                    $('body').removeClass('has-change');
                    cms.global.USER_DATA = user;
                    $('#selected-profile').text(cms.global.USER_DATA.name);
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
        if (cms.global.USER_DATA.fbUser) {
            return false;
        }
        $page.resetChangePwdForm();
        $.blockUI({
            message: $('#change-pwd-overlay')
        });
        return false;
    });
    $('#change-pwd-overlay').on('click', '.btn-chg-pwd', function () {
        var fm = document.changePwdForm,
            parameter = null;
        if (cms.global.USER_DATA.fbUser) {
            return false;
        }
        if ($page.chkPwdData(fm)) {
            $common.showSavingOverlay();
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').fadeOut(0, function () {
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
                    $('#change-pwd-overlay .change-pwd .notice').removeClass('hide').text(nn._([cms.global.PAGE_ID, 'overlay', 'Invalid old password, please try again.']));
                    fm.pwd_old.focus();
                    return false;
                });
            });
            parameter = {
                oldPassword: fm.pwd_old.value,
                newPassword: fm.pwd_new.value
            };
            nn.api('PUT', cms.reapi('/api/users/{userId}', {
                userId: cms.global.USER_DATA.id
            }), parameter, function () {
                $('#overlay-s').fadeOut('fast', function () {
                    $page.resetChangePwdForm();
                    $.unblockUI();
                });
            });
        }
        return false;
    });
    $('#change-pwd-overlay').on('click', '.btn-cancel, .btn-close', function () {
        $page.resetChangePwdForm();
        $.unblockUI();
        return false;
    });

    // Connect to Facebook (callback of checkCriticalPerm)
    function handleRevokedPerm(hasCriticalPerm, authResponse) {
        if (hasCriticalPerm && authResponse && authResponse.userID && authResponse.accessToken) {
            $.unblockUI();
            $common.showProcessingOverlay();
            var parameter = {
                userId: authResponse.userID,
                accessToken: authResponse.accessToken
            };
            nn.api('POST', cms.reapi('/api/users/{userId}/sns_auth/facebook', {
                userId: cms.global.USER_DATA.id
            }), parameter, function (result) {
                if ('OK' === result) {
                    nn.api('GET', cms.reapi('/api/users/{userId}/sns_auth/facebook', {
                        userId: cms.global.USER_DATA.id
                    }), null, function (facebook) {
                        $('#overlay-s').fadeOut('slow', function () {
                            // ready for disconnect facebook
                            // sync cms settings
                            cms.global.FB_RESTART_CONNECT = false;
                            $('#studio-nav .reconnect-notice').addClass('hide');
                            $('#cms-setting .connect .notice, #cms-setting .connect .notify').addClass('hide');
                            cms.global.FB_PAGES_MAP = $common.buildFacebookPagesMap(facebook);
                            cms.global.USER_SNS_AUTH = facebook;
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
        var hook = (true === cms.global.FB_RESTART_CONNECT) ? '#restart-connect' : '#fb-connect';
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
                $page.checkCriticalPerm(response.authResponse, handleRevokedPerm);
            } else {
                // cancel login nothing happens (maybe unknown or not_authorized)
                nn.log(response, 'debug');
                $.blockUI({
                    message: $('#fb-connect-failed')
                });
            }
        }, {
            scope: cms.config.FB_REQ_PERMS.join(',')
        });
        return false;
    });
    $('#fb-connect-failed .btn-failed-ok').click(function () {
        // continue to show connect switch again
        var hook = (true === cms.global.FB_RESTART_CONNECT) ? '#restart-connect' : '#fb-connect';
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
        $common.showProcessingOverlay();
        nn.api('DELETE', cms.reapi('/api/users/{userId}/sns_auth/facebook', {
            userId: cms.global.USER_DATA.id
        }), null, function (facebook) {
            $('#overlay-s').fadeOut('slow', function () {
                if ('OK' === facebook) {
                    // sync cms settings
                    cms.global.FB_RESTART_CONNECT = false;
                    $('#studio-nav .reconnect-notice').addClass('hide');
                    cms.global.FB_PAGES_MAP = null;
                    cms.global.USER_SNS_AUTH = null;
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

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $page.setFormHeight();
    });
});
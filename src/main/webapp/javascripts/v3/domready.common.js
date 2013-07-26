/*jslint browser: true, unparam: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    var $common = cms.common;

    //-------------------------------------------------------------------------
    // Setup Global Variable
    //-------------------------------------------------------------------------

    cms.global.USER_URL = $.url();

    //-------------------------------------------------------------------------
    // Page Entry Point
    //-------------------------------------------------------------------------

    nn.api('GET', cms.reapi('/api/login'), function (user) {
        var tmpUrl = $.url(location.href.replace('@', '%40')),
            tmpPriv = 0,
            isStoreLangKey = true;
        if (!user || !user.id) {
            if ('signin.html' !== tmpUrl.attr('file')) {
                location.href = 'signin.html';
            } else {
                $common.setupLanguagePage();
            }
        } else {
            if ('signin.html' === tmpUrl.attr('file')) {
                if (cms.config.CMS_ENV === 'prototype') {
                    $common.setupLanguagePage();
                } else {
                    location.href = 'index.html';
                }
            } else {
                tmpPriv = parseInt(user.priv, 10) / 1000 + 111;
                cms.global.MSO = 0;
                if (tmpPriv > 221 && user.msoId > 0) {
                    cms.global.MSO = user.msoId;
                    if (-1 !== $.inArray(tmpUrl.attr('file'), ['store-manage.html', 'portal-manage.html'])) {
                        // set mso info
                        nn.api('GET', cms.reapi('/api/mso/{msoId}', {
                            msoId: cms.global.MSO
                        }), null, function (msoInfo) {
                            cms.global.MSOINFO = msoInfo;
                        });
                    }
                }
                if (cms.global.MSO > 0) {
                    $('#studio-nav #my-portal').removeClass('hide');
                } else {
                    $('#studio-nav #my-portal').remove();
                }
                $common.setupLanguageAndRenderPage(user, isStoreLangKey);
            }
        }
    });

    //-------------------------------------------------------------------------
    // Common DOM Ready
    //-------------------------------------------------------------------------

    // HACK: for Mac style
    if (navigator.userAgent.indexOf('Mac') > 0) {
        $('body').addClass('mac');
    }

    // checkbox checked highlight (but radio customize by page)
    $(document).on('click', 'input[type=checkbox]', function () {
        $(this).parents('label').toggleClass('checked');
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
            nn.api('DELETE', cms.reapi('/api/login'), null, function (data) {
                location.href = 'signin.html';
            });
            return false;
        }
    });

    // change language
    $('#language-change li a').click(function () {
        if ('signin' === $(this).data('page')) {
            var sign_lang = $(this).data('meta');
            if (-1 === $.inArray(sign_lang, cms.config.LANG_SUPPORT)) {
                sign_lang = 'en';
            }
            $.cookie('signLang', sign_lang, {
                expires: 30
            });
            $common.setupLanguagePage();
            $(this).parents('.select-list').slideDown();
            return false;
        }
        if (null !== cms.global.USER_DATA && !$('body').hasClass('has-change')) {
            nn.api('PUT', cms.reapi('/api/users/{userId}', {
                userId: cms.global.USER_DATA.id
            }), {
                lang: $(this).data('meta')
            }, function (user) {
                var isStoreLangKey = false;
                $common.setupLanguageAndRenderPage(user, isStoreLangKey);
            });
            $(this).parents('.select-list').slideDown();
            return false;
        }
    });

    // common dropdown (share with header, footer, channel-add and channel-setting)
    function showDropdown(btn) {
        var str = '',
            id = '';
        $common.hideFbPageList();
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
        $('.select-list').parents().removeClass('on').children('.on:not(#footer-control)').removeClass('on');
        $common.hideFbPageList();
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
        $(this).toggleClass('on');
        $('#footer').slideToggle();
        $('#content-main-wrap').toggleClass('footer-on');
        $('#content-main-wrap').perfectScrollbar('update');
    });

    // footer dropdown
    $('#footer-list li .select-btn, #footer-list li .select-txt').click(function (event) {
        $common.hideFbPageList();
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

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        setEllipsis();
    });
});
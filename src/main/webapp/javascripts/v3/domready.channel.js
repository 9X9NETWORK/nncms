/*jslint browser: true, nomen: true, unparam: true */
/*global $, nn, cms, FB */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms.channel,
        $common = cms.common;

    $common.autoHeight();
    $page.setFormHeight();
    $page.setTaglistWidth();
    // $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider', $('#footer').offset().top - ( $('#title-func').offset().top + $('#title-func').outerHeight(true) ), $('#content-main-wrap').height());

    // common unblock
    $('body').keyup(function (e) {
        if (27 === e.which) { // Esc
            $.unblockUI();
            if ($(this).hasClass('has-error')) {
                location.replace('index.html');
            }
            return false;
        }
    });
    $(document).on('click', '.unblock, .btn-close, .btn-no', function () {
        $.unblockUI();
        return false;
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
    $('body').removeClass('has-change');
    $('#content-main').on('change', '#settingForm', function () {
        $('body').addClass('has-change');
    });
    $(document).on('click', '#header #logo, #header a, #studio-nav a, #content-nav a, #footer a', function (e) {
        if (document.settingForm) {
            var fm = document.settingForm;
            if (fm.imageUrl && fm.imageUrlOld && fm.imageUrl.value !== fm.imageUrlOld.value) {
                $('body').addClass('has-change');
            }
        }
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
    $('#content-main').on('click', '#settingForm .btn-cancel.enable', function () {
        if (document.settingForm) {
            var fm = document.settingForm;
            if (fm.imageUrl && fm.imageUrlOld && fm.imageUrl.value !== fm.imageUrlOld.value) {
                $('body').addClass('has-change');
            }
        }
        if ($('body').hasClass('has-change')) {
            $('body').data('leaveUrl', 'index.html');
            $common.showUnsaveOverlay();
        } else {
            location.href = 'index.html';
        }
        return false;
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

    // channel form selector
    $('#content-main').on('click', '#settingForm .enable .select-btn, #settingForm .enable .select-txt', function (event) {
        $common.hideFbPageList();
        $('.form-btn .notice').addClass('hide');
        $('.select-list').hide();
        $(this).parent('li').siblings().children('.on').removeClass('on');
        $(this).parent().children('.select-btn').toggleClass('on');
        if ($(this).parent().children('.select-btn').hasClass('on')) {
            $(this).parent().children('.select-list').slideDown();
        } else {
            $(this).parent().children('.select-list').hide();
        }
        event.stopPropagation();
        return false;
    });
    $('#content-main').on('click', '#settingForm .select .select-list li', function () {
        $('body').addClass('has-change');
        var selectOption = $(this).text(),
            metadata = $(this).data('meta'),
            srcname = '',
            sphere = '',
            rowNum = 0,
            modCatLen = 0,
            i = 0;
        // sharing url
        if ($(this).hasClass('surl-li')) {
            $('#surl-ul .surl-li').removeClass('on');
            $(this).addClass('on');
        }
        // region (sphere) relate to category
        if ('sphere-select-list' === $(this).parent().attr('id')) {
            srcname = $(this).parent().parent().children('.select-txt').children().text();
            if (srcname !== selectOption) {
                $('.category').removeClass('enable').addClass('disable');
                $('#categoryId').val(0);
                $('#browse-category').html('');
                sphere = metadata;
                if ('other' === sphere) {
                    sphere = 'en';
                }
                nn.api('GET', cms.reapi('/api/categories'), {
                    lang: sphere
                }, function (categories) {
                    $('#browse-category').data('realCateCnt', categories.length);
                    $.each(categories, function (i, list) {
                        cms.config.CATEGORY_MAP[list.id] = list.name;
                    });
                    rowNum = ($(window).width() > 1356) ? 4 : 3;
                    modCatLen = categories.length % rowNum;
                    if (modCatLen > 0) {
                        modCatLen = rowNum - modCatLen;
                        for (i = 0; i < modCatLen; i += 1) {
                            categories.push({
                                id: 0,
                                name: ''
                            });
                        }
                    }
                    $('#category-list-tmpl-item').tmpl(categories, {
                        dataArrayIndex: function (item) {
                            return $.inArray(item, categories);
                        }
                    }).appendTo('#browse-category');
                    $('#browse-category li[data-meta=0]').addClass('none');
                    $common.autoHeight();
                    $page.setFormHeight();
                    $page.scrollToBottom();
                    $('.category').removeClass('disable').addClass('enable');
                    $('#categoryId-select-txt').text(nn._([cms.global.PAGE_ID, 'setting-form', 'Select a category']));
                });
            }
        }
        // category relate to tags
        if ('browse-category' === $(this).parent().attr('id')) {
            nn.api('GET', cms.reapi('/api/tags'), {
                categoryId: metadata,
                lang: $('#sphere').val()
            }, function (tags) {
                $('#tag-list').html('');
                if (tags && tags.length > 0) {
                    $('.tag-list').removeClass('hide');
                    var currentTags = $('#tag').val();
                    currentTags = currentTags.split(',');
                    if (!currentTags) {
                        currentTags = [];
                    }
                    $('#tag-list-tmpl-item').tmpl({
                        tags: tags
                    }).appendTo('#tag-list');
                    if (currentTags.length > 0) {
                        $('#tag-list li span a').each(function () {
                            if (-1 !== $.inArray($(this).text(), currentTags)) {
                                $(this).parent().parent().addClass('on');
                            }
                        });
                    }
                } else {
                    $('.tag-list').addClass('hide');
                }
                $common.autoHeight();
                $page.setFormHeight();
                $page.setTaglistWidth();
                $page.scrollToBottom();
            });
        }
        $(this).parent().parent().children('.select-meta').val(metadata);
        $(this).parent().parent().children('.select-btn').removeClass('on');
        $(this).parent().parent().children('.select-txt').children().text(selectOption);
        $(this).parent().hide();
        return false;
    });

    // channel form tag
    $('#content-main').on('click', '#tag-list li span a', function () {
        $('body').addClass('has-change');
        var temp = [],
            currentTags = $('#tag').val(),
            clickedTag = $.trim($(this).text());
        currentTags = currentTags.split(',');
        if (!currentTags) {
            currentTags = [];
        }
        if (-1 === $.inArray(clickedTag, currentTags)) {
            $(this).parent().parent().addClass('on');
            currentTags.push(clickedTag);
        } else {
            $(this).parent().parent().removeClass('on');
            $.each(currentTags, function (i, n) {
                if (n !== clickedTag) {
                    temp.push(n);
                }
            });
            currentTags = temp;
        }
        temp = [];
        $.each(currentTags, function (i, n) {
            if (n !== '') {
                temp.push(n);
            }
        });
        $('#tag').val(temp.join(','));
        return false;
    });

    // channel form facebook auto share (callback of checkCriticalPerm)
    function handleAutoSharePerm(hasCriticalPerm, authResponse) {
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
                            // sync cms settings
                            cms.global.FB_RESTART_CONNECT = false;
                            $('#studio-nav .reconnect-notice').addClass('hide');
                            cms.global.FB_PAGES_MAP = $common.buildFacebookPagesMap(facebook);
                            cms.global.USER_SNS_AUTH = facebook;
                            // sync channel setting
                            if ($('#settingForm').length > 0) {
                                var isAutoCheckedTimeline = true;
                                $page.renderAutoShareUI(facebook, isAutoCheckedTimeline);
                                setTimeout(function () {
                                    $common.autoHeight();
                                    $page.setFormHeight();
                                    $page.scrollToBottom();
                                    $('#main-wrap-slider .slider-vertical').slider('value', 0);
                                }, 1000);
                            }
                        });
                    });
                }
            });
        } else {
            // connected but has not critical permission!!
            $.blockUI({
                message: $('#fb-connect-failed2')
            });
        }
    }
    $('#content-main').on('click', '.connect-switch .switch-off, .reconnected .btn-reconnected', function () {
        // connect facebook
        FB.login(function (response) {
            if (response.authResponse) {
                // connected but not sure have critical permission
                $page.checkCriticalPerm(response.authResponse, handleAutoSharePerm);
            } else {
                // cancel login nothing happens (maybe unknown or not_authorized)
                nn.log(response, 'debug');
                $.blockUI({
                    message: $('#fb-connect-failed2')
                });
            }
        }, {
            scope: cms.config.FB_REQ_PERMS.join(',')
        });

        return false;
    });
    // facebook page main checkbox
    $('#content-main').on('click', '.connected input[name=fbPage]', function () {
        if ($(this).prop('checked')) {
            $('.page-list').removeClass('disable').addClass('enable');
        } else {
            $('#fb-page-list').slideUp();
            $('#page-selected').text(nn._([cms.global.PAGE_ID, 'setting-form', 'Select facebook pages']));
            $('#fb-page-list li').removeClass('checked');
            $('.page-list').addClass('disable').removeClass('enable on');
            $('#pageId').val('');
        }
    });
    // facebook page dropdown multi checkbox ui
    $('#content-main').on('click', '.connected .share-item .page-list.enable .page-list-middle a.select-page', function () {

        var fbPageListHeight = $('#fb-page-list').height();

        $('.form-btn .notice').addClass('hide');
        $('.dropdown').hide();
        $('.dropdown').parents('li').removeClass('on').children('.on').removeClass('on');
        $('.select-list').hide();
        $('.select-list').parents().removeClass('on').children('.on').removeClass('on');
        // var formHeight = $('#content-main-wrap form').height(),
        //     formRealHeight = 0,
        //     list = $('#fb-page-list').data('list'),
        //     buttonSpace = 70,
        //     footerSpace = 65,
        //     expandHeight = parseInt(Math.round(list / 2) * 30, 10);
        // $('#settingForm > .fminput').each(function () {
        //     formRealHeight += $(this).outerHeight();
        // });
        $(this).next('ul').slideToggle({
            complete: function() {

                if ($('.connected .share-item .page-list').hasClass('on')) {

                    $page.scrollToBottom();
                    $('#content-main-wrap').perfectScrollbar('update');
                } else {

                    $('#content-main-wrap').scrollTop( $('#content-main-wrap').scrollTop()-fbPageListHeight );
                    $('#content-main-wrap').perfectScrollbar('update');
                }

            }
        });

        $(this).parents('.page-list').toggleClass('on');

        return false;
    });
    // facebook page select preview
    $('#content-main').on('click', '.connected #fb-page-list li a', function () {
        $('body').addClass('has-change');
        var temp = [],
            currentPages = [],
            defaultText = nn._([cms.global.PAGE_ID, 'setting-form', 'Select facebook pages']);
        $(this).parent().toggleClass('checked');
        $('#fb-page-list li.checked').each(function (i) {
            temp.push($.trim($(this).children('a').text()));
            currentPages.push($.trim($(this).children('a').data('id')));
        });
        if (0 === temp.length) {
            $('#page-selected').text(defaultText);
        } else {
            $('#page-selected').text(temp.join(', '));
        }
        $('#pageId').val(currentPages.join(','));
        return false;
    });

    // channel form button
    $('#content-main').on('click', '#settingForm .btn-save.enable', function () {
        // update mode
        if ($page.chkData(document.settingForm) && cms.global.USER_DATA.id && $(this).hasClass('enable') && cms.global.USER_URL.param('id') > 0) {
            $common.showSavingOverlay();
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').fadeOut(0, function () {
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'error');
                });
            });
            var qrystring = $('#settingForm').serialize(),
                parameter = $.url('http://fake.url.dev.teltel.com/?' + qrystring).param();
            // sharing url
            nn.api('GET', cms.reapi('/api/channels/{channelId}/autosharing/brand', {
                channelId: cms.global.USER_URL.param('id')
            }), null, function (cBrand) {
                var surlText = $('#surl-text').text();
                if (cBrand.brand !== surlText) {
                    nn.api('PUT', cms.reapi('/api/channels/{channelId}/autosharing/brand', {
                        channelId: cms.global.USER_URL.param('id')
                    }), {
                        brand: surlText
                    });
                }
            });
            nn.api('PUT', cms.reapi('/api/channels/{channelId}', {
                channelId: cms.global.USER_URL.param('id')
            }), parameter, function (channel) {
                if ($('.connect-switch.hide').length > 0 && $('.reconnected.hide').length > 0) {
                    var userIds = [],
                        accessTokens = [];
                    if ($('#fbPage').is(':checked') && '' !== $.trim($('#pageId').val())) {
                        userIds = $.trim($('#pageId').val()).split(',');
                        $.each(userIds, function (i, userId) {
                            accessTokens.push(cms.global.FB_PAGES_MAP[userId]);
                        });
                    }
                    if ($('#fbTimeline').is(':checked')) {
                        userIds.push(cms.global.USER_SNS_AUTH.userId);
                        accessTokens.push(cms.global.USER_SNS_AUTH.accessToken);
                    }
                    nn.api('DELETE', cms.reapi('/api/channels/{channelId}/autosharing/facebook', {
                        channelId: channel.id
                    }), null, function () {
                        if (userIds.length > 0) {
                            parameter = {
                                userId: userIds.join(','),
                                accessToken: accessTokens.join(',')
                            };
                            nn.api('POST', cms.reapi('/api/channels/{channelId}/autosharing/facebook', {
                                channelId: channel.id
                            }), parameter, function () {
                                $('#overlay-s').fadeOut(1000, function () {
                                    $('body').removeClass('has-change');
                                    $('#imageUrlOld').val(channel.imageUrl);
                                });
                            });
                        } else {
                            $('#overlay-s').fadeOut(1000, function () {
                                $('body').removeClass('has-change');
                                $('#imageUrlOld').val(channel.imageUrl);
                            });
                        }
                    });
                } else {
                    $('#overlay-s').fadeOut(1000, function () {
                        $('body').removeClass('has-change');
                        $('#imageUrlOld').val(channel.imageUrl);
                    });
                }
            });
        }
        return false;
    });
    $('#content-main').on('click', '#settingForm .btn-create.enable', function () {
        // insert mode
        if ($page.chkData(document.settingForm) && cms.global.USER_DATA.id && $(this).hasClass('enable')) {
            $common.showSavingOverlay();
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').fadeOut(0, function () {
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'error');
                });
            });
            // note: channel-add.html hard code hidden field isPublic=true
            var qrystring = $('#settingForm').serialize(),
                parameter = $.url('http://fake.url.dev.teltel.com/?' + qrystring).param();
            nn.api('POST', cms.reapi('/api/users/{userId}/channels', {
                userId: cms.global.USER_DATA.id
            }), parameter, function (channel) {
                if ($('.connect-switch.hide').length > 0 && $('.reconnected.hide').length > 0) {
                    var userIds = [],
                        accessTokens = [];
                    if ($('#fbPage').is(':checked') && '' !== $.trim($('#pageId').val())) {
                        userIds = $.trim($('#pageId').val()).split(',');
                        $.each(userIds, function (i, userId) {
                            accessTokens.push(cms.global.FB_PAGES_MAP[userId]);
                        });
                    }
                    if ($('#fbTimeline').is(':checked')) {
                        userIds.push(cms.global.USER_SNS_AUTH.userId);
                        accessTokens.push(cms.global.USER_SNS_AUTH.accessToken);
                    }
                    nn.api('DELETE', cms.reapi('/api/channels/{channelId}/autosharing/facebook', {
                        channelId: channel.id
                    }), null, function () {
                        if (userIds.length > 0) {
                            parameter = {
                                userId: userIds.join(','),
                                accessToken: accessTokens.join(',')
                            };
                            nn.api('POST', cms.reapi('/api/channels/{channelId}/autosharing/facebook', {
                                channelId: channel.id
                            }), parameter, function () {
                                $('#overlay-s').fadeOut(1000, function () {
                                    $('body').removeClass('has-change');
                                    $('#imageUrlOld').val(channel.imageUrl);
                                    location.href = 'index.html';
                                });
                            });
                        } else {
                            $('#overlay-s').fadeOut(1000, function () {
                                $('body').removeClass('has-change');
                                $('#imageUrlOld').val(channel.imageUrl);
                                location.href = 'index.html';
                            });
                        }
                    });
                } else {
                    $('#overlay-s').fadeOut(1000, function () {
                        $('body').removeClass('has-change');
                        $('#imageUrlOld').val(channel.imageUrl);
                        location.href = 'index.html';
                    });
                }
            });
        }
        return false;
    });
    $('#content-main').on('click', '.fminput', function () {
        $('.form-btn .notice').addClass('hide');
    });

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $page.ellipsisPage();
        $common.autoHeight();
        $page.setFormHeight();
        $page.setTaglistWidth();
        // $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider', $('#footer').offset().top - ( $('#title-func').offset().top + $('#title-func').outerHeight(true) ), $('#content-main-wrap').height());
        
        // Update perfect scrollbar.
        $('#content-main-wrap').perfectScrollbar('update');

        // $common.hideFbPageList();
        // if ('none' === $('#main-wrap-slider').css('display')) {
        //     $('#main-wrap-slider .slider-vertical').slider('destroy');
        //     $('#main-wrap-slider .slider-vertical').slider();
        //     $('#main-wrap-slider').hide();
        //     $('#content-main-wrap').css('top', '0');
        // }

        // Handle cancel/create buttons position according to scollbar displayed or not.
        if ($('#content-main-wrap').height()>=$('div.constrain').outerHeight()) {
            $('#content-main-wrap').addClass('fixed');
        } else {
            $('#content-main-wrap').removeClass('fixed');
        }

        // Handle category list items layout.
        var categoryList = $('#browse-category');
        var items = categoryList.find('li');
        var i;
        if ($(window).width()>=1237) {
            if (items.length % 4 !== 0) {
                for (i=items.length%4; i<4; i++) {
                    categoryList.append(document.createElement('li'));
                }
            }
        } else {
            if (items.length % 3 !== 0) {
                for (i=items.length%3; i<3; i++) {
                    categoryList.append(document.createElement('li'));
                }
            }
        }
    });
});
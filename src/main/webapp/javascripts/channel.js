$(function () {
    if ($('#settingForm').length > 0) {
        autoHeight();
        setFormHeight();
    } else {
        setFormHeight();
        autoHeight();
    }
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');

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
    $(document).on('click', '.unblock, .btn-close, .fb-ok, .btn-no', function () {
        $.unblockUI();
        $('#channel-list li').removeClass('deleting');
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
    $(document).on('click', '#header #logo, #header a, #studio-nav a, #content-nav a, #footer a, #channel-list a', function (e) {
        if (document.settingForm) {
            var fm = document.settingForm;
            if (fm.imageUrl && fm.imageUrlOld && fm.imageUrl.value != fm.imageUrlOld.value) {
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
            showUnsaveOverlay();
            return false;
        }
    });
    $('#content-main').on('click', '#settingForm .btn-cancel.enable', function () {
        if (document.settingForm) {
            var fm = document.settingForm;
            if (fm.imageUrl && fm.imageUrlOld && fm.imageUrl.value != fm.imageUrlOld.value) {
                $('body').addClass('has-change');
            }
        }
        if ($('body').hasClass('has-change')) {
            $('body').data('leaveUrl', 'index.html');
            showUnsaveOverlay();
        } else {
            location.href = 'index.html';
        }
        return false;
    });
    $('#unsave-prompt .btn-leave').click(function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        if ('' != $('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
            $('#' + $('body').data('leaveId')).trigger('click');
        } else {
            location.href = $('body').data('leaveUrl');
        }
        return false;
    });

    // channel list sorting
    $('#title-func').on('click', 'p.order a.reorder', function () {
        $(this).text(nn._([CMS_CONF.PAGE_ID, 'title-func', 'Save order'])).removeClass('reorder').addClass('save');
        $('#channel-list').sortable('enable');
        $('body').removeClass('has-change');
        return false;
    });
    $('#title-func').on('click', 'p.order a.save', function () {
        var parameter = null,
            channels = [],
            $this = $(this);
        $('#channel-list > li').each(function () {
            if ($(this).data('meta') > 0) {
                channels.push($(this).data('meta'));
            }
        });
        if (channels.length > 0) {
            parameter = {
                channels: channels.join(',')
            };
        }
        if ($('body').hasClass('has-change') && null !== parameter) {
            showSavingOverlay();
            nn.api('PUT', CMS_CONF.API('/api/users/{userId}/channels/sorting', {userId: CMS_CONF.USER_DATA.id}), parameter, function (data) {
                $('#overlay-s').fadeOut(1000, function () {
                    $this.text(nn._([CMS_CONF.PAGE_ID, 'title-func', 'Reorder channels'])).removeClass('save').addClass('reorder');
                    $('#channel-list').sortable('disable');
                    $('body').removeClass('has-change');
                });
            });
        } else {
            $this.text(nn._([CMS_CONF.PAGE_ID, 'title-func', 'Reorder channels'])).removeClass('save').addClass('reorder');
            $('#channel-list').sortable('disable');
            $('body').removeClass('has-change');
        }
        return false;
    });

    // channel list delete
    $('#channel-list').on('click', '.enable a.del', function () {
        $(this).parents('li').addClass('deleting').data('deleteId', $(this).attr('rel'));
        showDeletePromptOverlay('Are you sure you want to delete this channel? All data will be removed permanently.');
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#channel-list li.deleting').length > 0 && '' != $('#channel-list li.deleting').data('deleteId')) {
            showSavingOverlay();
            nn.api('DELETE', CMS_CONF.API('/api/users/{userId}/channels/{channelId}', {userId: CMS_CONF.USER_DATA.id, channelId: $('#channel-list li.deleting').data('deleteId')}), null, function (data) {
                if ('OK' == data) {
                    $('#overlay-s').fadeOut(1000, function () {
                        var cntChannel = $('#channel-counter').text();
                        if (cntChannel > 0) {
                            $('#channel-counter').text(cntChannel - 1);
                        }
                        $('#channel-list li.deleting').remove();
                        $('#content-main-wrap').height($('#content-main-wrap').height() - 105); // 105: li height
                        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                    });
                } else {
                    $('#overlay-s').fadeOut(0, function () {
                        alert('Delete error');
                    });
                }
            });
        } else {
            alert('Nothing to delete');
        }
        return false;
    });

    // channel form selector
    $('#content-main').on('click', '#settingForm .enable .select-btn, #settingForm .enable .select-txt', function (event) {
        $('.form-btn .notice').addClass('hide');
        $('#fb-page-list').hide();
        $('.page-list').removeClass('on');
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
            metadata = $(this).data('meta');
        // region (sphere) relate to category
        if ('sphere-select-list' === $(this).parent().attr('id')) {
            var srcname = $(this).parent().parent().children('.select-txt').children().text();
            if (srcname != selectOption) {
                $('.category').removeClass('enable').addClass('disable');
                $('#categoryId').val(0);
                $('#browse-category').html('');
                var sphere = metadata;
                if ('other' === sphere) { sphere = 'en'; }
                nn.api('GET', CMS_CONF.API('/api/categories'), { lang: sphere }, function (categories) {
                    $('#browse-category').data('realCateCnt', categories.length);
                    $.each(categories, function (i, list) {
                        CMS_CONF.CATEGORY_MAP[list.id] = list.name;
                    });
                    var rowNum = ($(window).width() >= 1358) ? 4 : 3,
                        modCatLen = categories.length % rowNum;
                    if (modCatLen > 0) {
                        modCatLen = rowNum - modCatLen;
                        for (var i = 0; i < modCatLen; i++) {
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
                    autoHeight();
                    setFormHeight();
                    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                    $('.category').removeClass('disable').addClass('enable');
                    $('#categoryId-select-txt').text(nn._([CMS_CONF.PAGE_ID, 'setting-form', 'Select a category']));
                });
            }
        }
        // category relate to tags
        if ('browse-category' === $(this).parent().attr('id')) {
            nn.api('GET', CMS_CONF.API('/api/tags'), { categoryId: metadata }, function (tags) {
                $('#tag-list').html('');
                if (tags && tags.length > 0) {
                    $('.tag-list').removeClass('hide');
                    var currentTags = $('#tag').val();
                    currentTags = currentTags.split(',');
                    if (!currentTags) { currentTags = []; }
                    $('#tag-list-tmpl-item').tmpl({ tags: tags }).appendTo('#tag-list');
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
                autoHeight();
                setFormHeight();
                scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
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
        if (!currentTags) { currentTags = []; }
        if (-1 === $.inArray(clickedTag, currentTags)) {
            $(this).parent().parent().addClass('on');
            currentTags.push(clickedTag);
        } else {
            $(this).parent().parent().removeClass('on');
            $.each(currentTags, function (i, n) {
                if (n != clickedTag) {
                    temp.push(n);
                }
            });
            currentTags = temp;
        }
        temp = [];
        $.each(currentTags, function (i, n) {
            if (n != '') {
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
            showProcessingOverlay();
            var parameter = {
                userId: authResponse.userID,
                accessToken: authResponse.accessToken
            };
            nn.api('POST', CMS_CONF.API('/api/users/{userId}/sns_auth/facebook', {userId: CMS_CONF.USER_DATA.id}), parameter, function (result) {
                if ('OK' === result) {
                    nn.api('GET', CMS_CONF.API('/api/users/{userId}/sns_auth/facebook', {userId: CMS_CONF.USER_DATA.id}), null, function (facebook) {
                        $('#overlay-s').fadeOut('slow', function () {
                            // sync setup studio
                            CMS_CONF.FB_RESTART_CONNECT = false;
                            $('#studio-nav .reconnect-notice').addClass('hide');
                            CMS_CONF.FB_PAGES_MAP = buildFacebookPagesMap(facebook);
                            CMS_CONF.USER_SNS_AUTH = facebook;
                            $('.setup-notice p.fb-connect a.switch-on').removeClass('hide');
                            $('.setup-notice p.fb-connect a.switch-off').addClass('hide');
                            // sync channel setting
                            if ($('#settingForm').length > 0) {
                                var isAutoCheckedTimeline = true;
                                renderAutoShareUI(facebook, isAutoCheckedTimeline);
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
    $('#content-main').on('click', '#content-main-wrap .switch-off, #content-main-wrap .btn-reconnected', function () {
        // connect facebook
        FB.login(function (response) {
            if (response.authResponse) {
                // connected but not sure have critical permission
                checkCriticalPerm(response.authResponse, handleAutoSharePerm);
            } else {
                // cancel login nothing happens (maybe unknown or not_authorized)
                nn.log(response, 'debug');
            }
        }, {scope: CMS_CONF.FB_REQ_PERMS.join(',')});

        return false;
    });
    // facebook page main checkbox
    $('#content-main').on('click', 'input[name=fbPage]', function () {
        if ($(this).attr('checked')) {
            $('.page-list').removeClass('disable').addClass('enable');
        } else {
            $('#fb-page-list').slideUp();
            $('#page-selected').text(nn._([CMS_CONF.PAGE_ID, 'setting-form', 'Select facebook pages']));
            $('#fb-page-list li').removeClass('checked');
            $('.page-list').addClass('disable').removeClass('enable on');
            $('#pageId').val('');
        }
    });
    // facebook page multi checkbox ui
    $('#content-main').on('click', '.connected .share-item .page-list.enable .page-list-middle a.select-page', function () {
        $('.form-btn .notice').addClass('hide');
        $('.dropdown').hide();
        $('.dropdown').parents('li').removeClass('on').children('.on').removeClass('on');
        $('.select-list').hide();
        $('.select-list').parents().removeClass('on').children('.on').removeClass('on');
        var formHeight = $('#content-main-wrap form').height(),
            list = $('#fb-page-list').data('list');
        $(this).next('ul').slideToggle();
        $(this).parents('.page-list').toggleClass('on');
        if ($('.connected .share-item .page-list').hasClass('on') && $('#main-wrap-slider .ui-slider-handle').length > 0 && false == $('#fb-page-list').hasClass('expand')) {
            $('#fb-page-list').addClass('expand');  // NOTE: only for first expand form height
            $('#content-main-wrap form').height(formHeight + parseInt(Math.round(list / 2) * 30, 10));
            $('#content-main-wrap').height($('#content-main-wrap .constrain').height() - 45 + parseInt(Math.round(list / 2) * 30, 10));
            scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
            $('#content-main-wrap').css('top', '-' + parseInt($('#content-main-wrap').height() - $('#content-main').height(), 10) + 'px');
            $('#main-wrap-slider .ui-slider-handle').css('bottom', '0');
        } else {
            $('#fb-page-list').removeClass('expand');
            $('#content-main-wrap form').height('auto');
            $('#content-main-wrap').height($('#content-main-wrap .constrain').height() + 75);
            scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
            $('#content-main-wrap').css('top', '-' + parseInt($('#content-main-wrap').height() - $('#content-main').height(), 10) + 'px');
            $('#main-wrap-slider .ui-slider-handle').css('bottom', '0');
        }
        ellipsisPage();
        return false;
    });
    // facebook page select preview
    $('#content-main').on('click', '#fb-page-list li a', function () {
        $('body').addClass('has-change');
        var temp = [],
            currentPages = [],
            defaultText = nn._([CMS_CONF.PAGE_ID, 'setting-form', 'Select facebook pages']);
        $(this).parent().toggleClass('checked');
        $('#fb-page-list li.checked').each(function (i) {
            temp.push($.trim($(this).children('a').text()));
            currentPages.push($.trim($(this).children('a').data('id')));
        });
        if (0 == temp.length) {
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
        if (chkData(document.settingForm) && CMS_CONF.USER_DATA.id && $(this).hasClass('enable') && CMS_CONF.USER_URL.param('id') > 0) {
            showSavingOverlay();
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').fadeOut(0, function () {
                    alert(textStatus + ': ' + jqXHR.responseText);
                });
            });
            var qrystring = $('#settingForm').serialize(),
                parameter = $.url('http://fake.url.dev.teltel.com/?' + qrystring).param();
            nn.api('PUT', CMS_CONF.API('/api/channels/{channelId}', {channelId: CMS_CONF.USER_URL.param('id')}), parameter, function (channel) {
                if ($('.connect-switch.hide').length > 0 && $('.reconnected.hide').length > 0) {
                    var userIds = [],
                        accessTokens = [];
                    if ($('#fbPage').is(':checked') && '' !== $.trim($('#pageId').val())) {
                        userIds = $.trim($('#pageId').val()).split(',');
                        $.each(userIds, function (i, userId) {
                            accessTokens.push(CMS_CONF.FB_PAGES_MAP[userId]);
                        });
                    }
                    if ($('#fbTimeline').is(':checked')) {
                        userIds.push(CMS_CONF.USER_SNS_AUTH.userId);
                        accessTokens.push(CMS_CONF.USER_SNS_AUTH.accessToken);
                    }
                    nn.api('DELETE', CMS_CONF.API('/api/channels/{channelId}/autosharing/facebook', {channelId: channel.id}), null, function () {
                        if (userIds.length > 0) {
                            parameter = {
                                userId: userIds.join(','),
                                accessToken: accessTokens.join(',')
                            };
                            nn.api('POST', CMS_CONF.API('/api/channels/{channelId}/autosharing/facebook', {channelId: channel.id}), parameter, function () {
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
        if (chkData(document.settingForm) && CMS_CONF.USER_DATA.id && $(this).hasClass('enable')) {
            showSavingOverlay();
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').fadeOut(0, function () {
                    alert(textStatus + ': ' + jqXHR.responseText);
                });
            });
            // note: channel-add.html hard code hidden field isPublic=true
            var qrystring = $('#settingForm').serialize(),
                parameter = $.url('http://fake.url.dev.teltel.com/?' + qrystring).param();
            nn.api('POST', CMS_CONF.API('/api/users/{userId}/channels', {userId: CMS_CONF.USER_DATA.id}), parameter, function (channel) {
                if ($('.connect-switch.hide').length > 0 && $('.reconnected.hide').length > 0) {
                    var userIds = [],
                        accessTokens = [];
                    if ($('#fbPage').is(':checked') && '' !== $.trim($('#pageId').val())) {
                        userIds = $.trim($('#pageId').val()).split(',');
                        $.each(userIds, function (i, userId) {
                            accessTokens.push(CMS_CONF.FB_PAGES_MAP[userId]);
                        });
                    }
                    if ($('#fbTimeline').is(':checked')) {
                        userIds.push(CMS_CONF.USER_SNS_AUTH.userId);
                        accessTokens.push(CMS_CONF.USER_SNS_AUTH.accessToken);
                    }
                    nn.api('DELETE', CMS_CONF.API('/api/channels/{channelId}/autosharing/facebook', {channelId: channel.id}), null, function () {
                        if (userIds.length > 0) {
                            parameter = {
                                userId: userIds.join(','),
                                accessToken: accessTokens.join(',')
                            };
                            nn.api('POST', CMS_CONF.API('/api/channels/{channelId}/autosharing/facebook', {channelId: channel.id}), parameter, function () {
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

    $(window).resize(function () {
        ellipsisPage();
        if ($('#settingForm').length > 0) {
            autoHeight();
            setFormHeight();
        } else {
            setFormHeight();
            autoHeight();
        }
        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        if ('none' == $('#main-wrap-slider').css('display')) {
            $('#main-wrap-slider .slider-vertical').slider('destroy');
            $('#content-main-wrap').css('top', '0');
        }
    });
});

function chkData(fm) {
    fm.name.value = $.trim(fm.name.value);
    fm.imageUrl.value = $.trim(fm.imageUrl.value);
    fm.intro.value = $.trim(fm.intro.value);
    fm.lang.value = $.trim(fm.lang.value);
    fm.sphere.value = $.trim(fm.sphere.value);
    fm.categoryId.value = $.trim(fm.categoryId.value);
    if (0 == fm.categoryId.value) { fm.categoryId.value = ''; }
    fm.tag.value = $.trim(fm.tag.value);
    if ($('#fbPage').is(':checked') && '' === $.trim($('#pageId').val())) {
        $('#fbPage').removeAttr('checked');
        $('#fbPage-label').removeClass('checked');
        $.uniform.update('#fbPage');
    }
    if ('' === fm.name.value || '' === fm.lang.value || '' === fm.sphere.value || '' === fm.categoryId.value) {
        $('.form-btn .notice').removeClass('hide');
        return false;
    }
    if ('' !== fm.lang.value && !CMS_CONF.LANG_MAP[fm.lang.value]) {
        $('.form-btn .notice').removeClass('hide');
        return false;
    }
    if ('' !== fm.sphere.value && !CMS_CONF.SPHERE_MAP[fm.sphere.value]) {
        $('.form-btn .notice').removeClass('hide');
        return false;
    }
    if ('' !== fm.categoryId.value && !CMS_CONF.CATEGORY_MAP[fm.categoryId.value]) {
        $('.form-btn .notice').removeClass('hide');
        return false;
    }
    return true;
}

function setFormHeight() {
    var rowNum = ($(window).width() >= 1358) ? 4 : 3,
        realCateCnt = $('#browse-category').data('realCateCnt'),
        modCatLen = realCateCnt % rowNum,
        windowHeight = $(window).height(),
        windowWidth = $(window).width(),
        channelListWidth = $('#channel-list').width(),
        channelNameWidth = $('#channel-name').width(),
        crumbWidth = $('#title-func .title-crumb').width(),
        imgsWidth = $('#channel-list li .wrap .photo-list').width(),
        funcWidth = $('#channel-list li .wrap .func-wrap').width(),
        titleFuncHeight = $('#title-func').height(),
        formHeight = $('#content-main-wrap form').height(),
        contentHeight = windowHeight - titleFuncHeight - 94 - 48 - 38 - 10;     // 94:header+studio-nav 48:footer 38:title-func-padding
    if (windowWidth > 1220) {
        $('input.text').width(windowWidth - 734);
        $('textarea.textarea').width(windowWidth - 738);
        $('.connected .share-item .page-list').width(windowWidth - 841);
    } else {
        $('input.text').width(435);
        $('textarea.textarea').width(431);
        $('.connected .share-item .page-list').width(328);
    }
    $('#browse-category li[data-meta=0]').remove();
    if (modCatLen > 0) {
        modCatLen = rowNum - modCatLen;
        for (var i = 0; i < modCatLen; i++) {
            $('<li data-meta="0"></li>').appendTo('#browse-category');
        }
    }
    if (1220 > windowWidth) {
        $('#content-main-wrap form .fminput .fmfield .category, #browse-category').width(438);
        $('#browse-category li').width(138);
        $('#browse-category li').eq(3).removeClass('first-row');
    }
    if (1220 <= windowWidth && windowWidth < 1358) {
        $('#content-main-wrap form .fminput .fmfield .category, #browse-category').width(windowWidth - 731);
        $('#browse-category li').width(((windowWidth - 731) / 3) - 8);
        $('#browse-category li').eq(3).removeClass('first-row');
    }
    if (windowWidth >= 1358) {
        $('#content-main-wrap form .fminput .fmfield .category, #browse-category').width(628);
        $('#browse-category li').width(149);
        $('#browse-category li').eq(3).addClass('first-row');
    }
    if ($('#channel-name').data('width') + crumbWidth > $('input.text').width() + 140) {
        $('#title-func h2').width($('input.text').width() + 140 - crumbWidth);
        $('#title-func h2').css('padding-right', parseInt(crumbWidth + 5, 10) + 'px');
        $('#channel-name').text($('#channel-name').data('meta')).addClass('ellipsis').ellipsis();
    } else {
        $('#title-func h2').width('auto');
        $('#title-func h2').css('padding-right', parseInt(crumbWidth + 5, 10) + 'px');
        $('#channel-name').text($('#channel-name').data('meta')).removeClass('ellipsis');
    }
    if (contentHeight <= formHeight) {
        $('#content-main-wrap form').height('auto');
    } else {
        $('#content-main-wrap form').height(contentHeight - 56);
    }
    $('#content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + titleFuncHeight + 48);
    $('#channel-list li .wrap').width(channelListWidth - 36);
    $('#channel-list li .wrap .info').width(channelListWidth - imgsWidth - funcWidth - 58);
    $('#channel-list li .wrap .info h3').each(function (index) {
        $('a', this).text($(this).data('meta'));
    });
    $('#channel-list li .wrap .info h3').addClass('ellipsis').ellipsis();
    $('#content-main-wrap form').data('height', $('#content-main-wrap form').height());
}

function ellipsisPage() {
    var windowWidth = $(window).width();
    if (windowWidth > 1220) {
        $('ul#fb-page-list').width(windowWidth - 842);
        $('ul#fb-page-list li').width((windowWidth - 842) / 2);
        $('#fb-page-list li a').each(function (index) {
            $(this).text($(this).data('meta'));
        }).addClass('ellipsis').ellipsis();
    } else {
        $('ul#fb-page-list').width(327);
        $('ul#fb-page-list li').width(162);
        $('#fb-page-list li a').each(function (index) {
            $(this).text($(this).data('meta'));
        }).addClass('ellipsis').ellipsis();
    }
}

function uploadImage() {
    var parameter = {
        'prefix': 'cms',
        'type':   'image',
        'size':   20485760,
        'acl':    'public-read'
    };
    nn.api('GET', CMS_CONF.API('/api/s3/attributes'), parameter, function (s3attr) {
        var timestamp = (new Date()).getTime();
        var handlerFileDialogStart = function () {
            $('.upload-img .upload-notice').addClass('hide');
        };
        var handlerUploadProgress = function (file, completed /* completed bytes */, total /* total bytes */) {
            $('.upload-img .loading').show();
             swfu.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Uploading...']) + '</span>');
        };
        var handlerUploadSuccess = function (file, serverData, recievedResponse) {
            $('.upload-img .loading').hide();
            swfu.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
            if (!file.type) {
                file.type = nn.getFileTypeByName(file.name);
            }
            this.setButtonDisabled(false); // enable upload button again
            var url = 'http://' + s3attr['bucket'] + '.s3.amazonaws.com/' + parameter['prefix'] + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase();
            $('#thumbnail-imageUrl').attr('src', url + '?n=' + Math.random());
            $('#imageUrl').val(url);
        };
        var handlerUploadError = function (file, code, message) {
            $('.upload-img .loading').hide();
            swfu.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
            this.setButtonDisabled(false);
            if (code == -280) { // user cancel upload
                alert(message); // show some error prompt
            } else {
                alert(message); // show some error prompt
            }
        };
        var handlerFileQueue = function (file) {
            if (!file.type) {
                file.type = nn.getFileTypeByName(file.name); // Mac Chrome compatible
            }
            var postParams = {
                "AWSAccessKeyId": s3attr['id'],
                "key":            parameter['prefix'] + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase(),
                "acl":            parameter['acl'],
                "policy":         s3attr['policy'],
                "signature":      s3attr['signature'],
                "content-type":   parameter['type'],
                "success_action_status": "201"
            };
            this.setPostParams(postParams);
            this.startUpload(file.id);
            this.setButtonDisabled(true);
        };
        var handlerFileQueueError = function (file, code, message) {
            if (code == -130) { // error file type
                $('.upload-img .upload-notice').removeClass('hide');
            }
        };
        var settings = {
            flash_url:                  'javascripts/swfupload/swfupload.swf',
            upload_url:                 'http://' + s3attr['bucket'] + '.s3.amazonaws.com/', // http://9x9tmp-ds.s3.amazonaws.com/
            file_size_limit:            parameter['size'],
            file_types:                 '*.jpg; *.png; *.gif',
            file_types_description:     'Thumbnail',
            file_post_name:             'file',
            button_placeholder:         $('#uploadThumbnail').get(0),
            button_image_url:           'images/btn-load.png',
            button_width:               '129',
            button_height:              '29',
            button_text:                '<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>',
            button_text_style:          '.uploadstyle { color: #777777; font-family: Arial, Helvetica; font-size: 15px; text-align: center; } .uploadstyle:hover { color: #999999; }',
            button_text_top_padding:    1,
            button_action:              SWFUpload.BUTTON_ACTION.SELECT_FILE,
            button_cursor:              SWFUpload.CURSOR.HAND,
            button_window_mode :        SWFUpload.WINDOW_MODE.TRANSPARENT,
            http_success :              [ 201 ],
            file_dialog_start_handler:  handlerFileDialogStart,
            upload_progress_handler:    handlerUploadProgress,
            upload_success_handler:     handlerUploadSuccess,
            upload_error_handler:       handlerUploadError,
            file_queued_handler:        handlerFileQueue,
            file_queue_error_handler:   handlerFileQueueError,
            debug:                      false
        };
        var swfu = new SWFUpload(settings);
    });
}
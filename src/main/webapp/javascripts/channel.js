/*jslint browser: true, devel: true, nomen: true, unparam: true, sloppy: true */
/*global $, nn, CMS_CONF, FB, SWFUpload, scrollbar, autoHeight, hideFbPageList, showProcessingOverlay, showSavingOverlay, showUnsaveOverlay, renderAutoShareUI, buildFacebookPagesMap */

function chkData(fm) {
    fm.name.value = $.trim(fm.name.value);
    fm.imageUrl.value = $.trim(fm.imageUrl.value);
    fm.intro.value = $.trim(fm.intro.value);
    fm.lang.value = $.trim(fm.lang.value);
    fm.sphere.value = $.trim(fm.sphere.value);
    fm.categoryId.value = $.trim(fm.categoryId.value);
    if (!fm.categoryId.value) {
        fm.categoryId.value = '';
    }
    fm.tag.value = $.trim(fm.tag.value);
    if ($('#fbPage').is(':checked') && '' === $.trim($('#pageId').val())) {
        $('#fbPage').prop('checked', false);
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

function truncateFormTitle() {
    var crumbWidth = $('#title-func .title-crumb').width();
    if ($('#channel-name').data('width') + crumbWidth > $('input.text').width() + 140) {
        $('#title-func h2').width($('input.text').width() + 140 - crumbWidth);
        $('#title-func h2').css('padding-right', parseInt(crumbWidth + 5, 10) + 'px');
    } else {
        $('#title-func h2').width('auto');
        $('#title-func h2').css('padding-right', parseInt(crumbWidth + 5, 10) + 'px');
    }
}

function setFormHeight() {
    $('#content-main-wrap, #content-main-wrap form').height('auto');
    var i = 0,
        rowNum = ($(window).width() > 1356) ? 4 : 3,
        realCateCnt = $('#browse-category').data('realCateCnt'),
        modCatLen = realCateCnt % rowNum,
        windowHeight = $(window).height(),
        windowWidth = $(window).width(),
        titleFuncHeight = $('#title-func').height(),
        formHeight = $('#content-main-wrap form').height(),
        headerHeight = $('#header').height(),
        navHeight = $('#studio-nav').height(),
        contentHeight = windowHeight - titleFuncHeight - headerHeight - navHeight + 5 - 48 - 38 - 10;   // 5:header and studio-nav overlap 48:footer 38:title-func-padding
    if (windowWidth > 1220) {
        $('input.text').width(windowWidth - 734);
        $('textarea.textarea').width(windowWidth - 735);
        $('.connected .share-item .page-list').width(windowWidth - 837);
        $('.reconnected .reconnect-notice').width(windowWidth - 734);
    } else {
        $('input.text').width(433);
        $('textarea.textarea').width(432);
        $('.connected .share-item .page-list').width(330);
        $('.reconnected .reconnect-notice').width(445);
    }
    $('#browse-category li[data-meta=0]').remove();
    if (modCatLen > 0) {
        modCatLen = rowNum - modCatLen;
        for (i = 0; i < modCatLen; i += 1) {
            $('<li data-meta="0" class="none"></li>').appendTo('#browse-category');
        }
    }
    if (1220 > windowWidth) {
        $('#content-main-wrap form .fminput .fmfield .category, #browse-category').width(441);
        $('#browse-category li').width(139);
        $('#browse-category li').eq(3).removeClass('first-row');
    }
    if (1220 <= windowWidth && windowWidth <= 1356) {
        $('#content-main-wrap form .fminput .fmfield .category, #browse-category').width(windowWidth - 726);
        $('#browse-category li').width(((windowWidth - 726) / 3) - 8);
        $('#browse-category li').eq(3).removeClass('first-row');
    }
    if (windowWidth > 1356) {
        $('#content-main-wrap form .fminput .fmfield .category, #browse-category').width(632);
        $('#browse-category li').width(150);
        $('#browse-category li').eq(3).addClass('first-row');
    }
    truncateFormTitle();
    if (contentHeight <= formHeight) {
        $('#content-main-wrap form').height('auto');
    } else {
        $('#content-main-wrap form').height(contentHeight - 56);
    }
    $('#content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + titleFuncHeight + 38); // 38: title-func padding
    $('#content-main-wrap form').data('height', $('#content-main-wrap form').height());
}

function setTaglistWidth() {
    var tagTitleWidth = $('.tag-list h4').width(),
        inputWidth = $('input.text').width();
    $('#tag-list').width(inputWidth - tagTitleWidth);
}

function ellipsisPage() {
    var windowWidth = $(window).width();
    if (windowWidth > 1220) {
        $('ul#fb-page-list').width(windowWidth - 838);
        $('ul#fb-page-list li').width((windowWidth - 838) / 2);
    } else {
        $('ul#fb-page-list').width(329);
        $('ul#fb-page-list li').width(164.5);
    }
}

function scrollToBottom() {
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    $('#content-main-wrap').css('top', '-' + parseInt($('#content-main-wrap').height() - $('#content-main').height(), 10) + 'px');
    $('#main-wrap-slider .ui-slider-handle').css('bottom', '0');
}

function uploadImage() {
    var parameter = {
        'prefix': 'cms',
        'type':   'image',
        'size':   20485760,
        'acl':    'public-read'
    };
    nn.api('GET', CMS_CONF.API('/api/s3/attributes'), parameter, function (s3attr) {
        var timestamp = (new Date()).getTime(),
            handlerFileDialogStart = function () {
                $('.upload-img .upload-notice').addClass('hide');
            },
            handlerUploadProgress = function (file, completed, total) {
                $('.upload-img .loading').show();
                this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Uploading...']) + '</span>');
            },
            handlerUploadSuccess = function (file, serverData, recievedResponse) {
                $('.upload-img .loading').hide();
                this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
                if (!file.type) {
                    file.type = nn.getFileTypeByName(file.name);
                }
                this.setButtonDisabled(false); // enable upload button again
                var url = 'http://' + s3attr.bucket + '.s3.amazonaws.com/' + parameter.prefix + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase();
                $('#thumbnail-imageUrl').attr('src', url + '?n=' + Math.random());
                $('#imageUrl').val(url);
            },
            handlerUploadError = function (file, code, message) {
                $('.upload-img .loading').hide();
                this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
                this.setButtonDisabled(false);
                if (code === -280) { // user cancel upload
                    nn.log(message, 'error'); // show some error prompt
                } else {
                    nn.log(message, 'error'); // show some error prompt
                }
            },
            handlerFileQueue = function (file) {
                if (!file.type) {
                    file.type = nn.getFileTypeByName(file.name); // Mac Chrome compatible
                }
                var postParams = {
                    "AWSAccessKeyId": s3attr.id,
                    "key":            parameter.prefix + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase(),
                    "acl":            parameter.acl,
                    "policy":         s3attr.policy,
                    "signature":      s3attr.signature,
                    "content-type":   parameter.type,
                    "success_action_status": "201"
                };
                this.setPostParams(postParams);
                this.startUpload(file.id);
                this.setButtonDisabled(true);
            },
            handlerFileQueueError = function (file, code, message) {
                if (code === -130) { // error file type
                    $('.upload-img .upload-notice').removeClass('hide');
                }
            },
            settings = {
                flash_url:                  'javascripts/libs/swfupload/swfupload.swf',
                upload_url:                 'http://' + s3attr.bucket + '.s3.amazonaws.com/', // http://9x9tmp-ds.s3.amazonaws.com/
                file_size_limit:            parameter.size,
                file_types:                 '*.jpg; *.png; *.gif',
                file_types_description:     'Thumbnail',
                file_post_name:             'file',
                button_placeholder:         $('#uploadThumbnail').get(0),
                button_image_url:           'images/btn-load.png',
                button_width:               '129',
                button_height:              '29',
                button_text:                '<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>',
                button_text_style:          '.uploadstyle { color: #555555; font-family: Arial, Helvetica; font-size: 15px; text-align: center; } .uploadstyle:hover { color: #999999; }',
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
            },
            swfu = new SWFUpload(settings);
        swfu.debug = CMS_CONF.IS_DEBUG;
    });
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
    autoHeight();
    setFormHeight();
    setTaglistWidth();
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
            showUnsaveOverlay();
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
            showUnsaveOverlay();
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
        hideFbPageList();
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
                nn.api('GET', CMS_CONF.API('/api/categories'), {
                    lang: sphere
                }, function (categories) {
                    $('#browse-category').data('realCateCnt', categories.length);
                    $.each(categories, function (i, list) {
                        CMS_CONF.CATEGORY_MAP[list.id] = list.name;
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
                    autoHeight();
                    setFormHeight();
                    scrollToBottom();
                    $('.category').removeClass('disable').addClass('enable');
                    $('#categoryId-select-txt').text(nn._([CMS_CONF.PAGE_ID, 'setting-form', 'Select a category']));
                });
            }
        }
        // category relate to tags
        if ('browse-category' === $(this).parent().attr('id')) {
            nn.api('GET', CMS_CONF.API('/api/tags'), {
                categoryId: metadata
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
                autoHeight();
                setFormHeight();
                setTaglistWidth();
                scrollToBottom();
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
                            // sync cms settings
                            CMS_CONF.FB_RESTART_CONNECT = false;
                            $('#studio-nav .reconnect-notice').addClass('hide');
                            CMS_CONF.FB_PAGES_MAP = buildFacebookPagesMap(facebook);
                            CMS_CONF.USER_SNS_AUTH = facebook;
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
                message: $('#fb-connect-failed2')
            });
        }
    }
    $('#content-main').on('click', '.connect-switch .switch-off, .reconnected .btn-reconnected', function () {
        // connect facebook
        FB.login(function (response) {
            if (response.authResponse) {
                // connected but not sure have critical permission
                checkCriticalPerm(response.authResponse, handleAutoSharePerm);
            } else {
                // cancel login nothing happens (maybe unknown or not_authorized)
                nn.log(response, 'debug');
                $.blockUI({
                    message: $('#fb-connect-failed2')
                });
            }
        }, {scope: CMS_CONF.FB_REQ_PERMS.join(',')});

        return false;
    });
    // facebook page main checkbox
    $('#content-main').on('click', '.connected input[name=fbPage]', function () {
        if ($(this).prop('checked')) {
            $('.page-list').removeClass('disable').addClass('enable');
        } else {
            $('#fb-page-list').slideUp();
            $('#page-selected').text(nn._([CMS_CONF.PAGE_ID, 'setting-form', 'Select facebook pages']));
            $('#fb-page-list li').removeClass('checked');
            $('.page-list').addClass('disable').removeClass('enable on');
            $('#pageId').val('');
        }
    });
    // facebook page dropdown multi checkbox ui
    $('#content-main').on('click', '.connected .share-item .page-list.enable .page-list-middle a.select-page', function () {
        $('.form-btn .notice').addClass('hide');
        $('.dropdown').hide();
        $('.dropdown').parents('li').removeClass('on').children('.on').removeClass('on');
        $('.select-list').hide();
        $('.select-list').parents().removeClass('on').children('.on').removeClass('on');
        var formHeight = $('#content-main-wrap form').height(),
            formRealHeight = 0,
            list = $('#fb-page-list').data('list'),
            buttonSpace = 70,
            footerSpace = 65,
            expandHeight = parseInt(Math.round(list / 2) * 30, 10);
        $('#settingForm > .fminput').each(function () {
            formRealHeight += $(this).outerHeight();
        });
        $(this).next('ul').slideToggle();
        $(this).parents('.page-list').toggleClass('on');
        if ($('.connected .share-item .page-list').hasClass('on') && $('#main-wrap-slider .ui-slider-handle').length > 0) {
            $('#content-main-wrap form').height(formHeight + expandHeight);
            $('#content-main-wrap').height(formHeight + expandHeight + buttonSpace + footerSpace);
            scrollToBottom();
        } else {
            if ('none' !== $('#main-wrap-slider').css('display')) {
                $('#content-main-wrap form').height('auto');
                $('#content-main-wrap').height(formRealHeight + 80 + buttonSpace + footerSpace);
                $('#main-wrap-slider .slider-vertical').slider('destroy');
                $('#content-main-wrap').css('top', '0');
            } else {
                $('#content-main-wrap form').height(formRealHeight + expandHeight + 56);
                $('#content-main-wrap').height(formRealHeight + expandHeight + buttonSpace + footerSpace + 56);
            }
            scrollToBottom();
        }
        ellipsisPage();
        return false;
    });
    // facebook page select preview
    $('#content-main').on('click', '.connected #fb-page-list li a', function () {
        $('body').addClass('has-change');
        var temp = [],
            currentPages = [],
            defaultText = nn._([CMS_CONF.PAGE_ID, 'setting-form', 'Select facebook pages']);
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
        if (chkData(document.settingForm) && CMS_CONF.USER_DATA.id && $(this).hasClass('enable') && CMS_CONF.USER_URL.param('id') > 0) {
            showSavingOverlay();
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').fadeOut(0, function () {
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'error');
                });
            });
            var qrystring = $('#settingForm').serialize(),
                parameter = $.url('http://fake.url.dev.teltel.com/?' + qrystring).param();
            // sharing url
            nn.api('GET', CMS_CONF.API('/api/channels/{channelId}/autosharing/brand', {
                channelId: CMS_CONF.USER_URL.param('id')
            }), null, function (cBrand) {
                var surlText = $('#surl-text').text();
                if (cBrand.brand !== surlText) {
                    nn.api('PUT', CMS_CONF.API('/api/channels/{channelId}/autosharing/brand', {
                        channelId: CMS_CONF.USER_URL.param('id')
                    }), {
                        brand: surlText
                    });
                }
            });
            nn.api('PUT', CMS_CONF.API('/api/channels/{channelId}', {
                channelId: CMS_CONF.USER_URL.param('id')
            }), parameter, function (channel) {
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
                    nn.api('DELETE', CMS_CONF.API('/api/channels/{channelId}/autosharing/facebook', {
                        channelId: channel.id
                    }), null, function () {
                        if (userIds.length > 0) {
                            parameter = {
                                userId: userIds.join(','),
                                accessToken: accessTokens.join(',')
                            };
                            nn.api('POST', CMS_CONF.API('/api/channels/{channelId}/autosharing/facebook', {
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
        if (chkData(document.settingForm) && CMS_CONF.USER_DATA.id && $(this).hasClass('enable')) {
            showSavingOverlay();
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').fadeOut(0, function () {
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'error');
                });
            });
            // note: channel-add.html hard code hidden field isPublic=true
            var qrystring = $('#settingForm').serialize(),
                parameter = $.url('http://fake.url.dev.teltel.com/?' + qrystring).param();
            nn.api('POST', CMS_CONF.API('/api/users/{userId}/channels', {
                userId: CMS_CONF.USER_DATA.id
            }), parameter, function (channel) {
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
                    nn.api('DELETE', CMS_CONF.API('/api/channels/{channelId}/autosharing/facebook', {
                        channelId: channel.id
                    }), null, function () {
                        if (userIds.length > 0) {
                            parameter = {
                                userId: userIds.join(','),
                                accessToken: accessTokens.join(',')
                            };
                            nn.api('POST', CMS_CONF.API('/api/channels/{channelId}/autosharing/facebook', {
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

    $(window).resize(function () {
        ellipsisPage();
        autoHeight();
        setFormHeight();
        setTaglistWidth();
        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        if ('none' === $('#main-wrap-slider').css('display')) {
            $('#main-wrap-slider .slider-vertical').slider('destroy');
            $('#content-main-wrap').css('top', '0');
        }
    });
});

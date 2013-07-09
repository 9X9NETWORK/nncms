/*jslint browser: true, nomen: true, unparam: true */
/*global $, nn, cms, SWFUpload */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.chkData = function (fm) {
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
        if ('' !== fm.lang.value && !cms.config.LANG_MAP[fm.lang.value]) {
            $('.form-btn .notice').removeClass('hide');
            return false;
        }
        if ('' !== fm.sphere.value && !cms.config.SPHERE_MAP[fm.sphere.value]) {
            $('.form-btn .notice').removeClass('hide');
            return false;
        }
        if ('' !== fm.categoryId.value && !cms.config.CATEGORY_MAP[fm.categoryId.value]) {
            $('.form-btn .notice').removeClass('hide');
            return false;
        }
        return true;
    };

    $page.truncateFormTitle = function () {
        var crumbWidth = $('#title-func .title-crumb').width();
        if ($('#channel-name').data('width') + crumbWidth > $('input.text').width() + 140) {
            $('#title-func h2').width($('input.text').width() + 140 - crumbWidth);
            $('#title-func h2').css('padding-right', parseInt(crumbWidth + 5, 10) + 'px');
        } else {
            $('#title-func h2').width('auto');
            $('#title-func h2').css('padding-right', parseInt(crumbWidth + 5, 10) + 'px');
        }
    };

    $page.setFormHeight = function () {
        // $('#content-main-wrap, #content-main-wrap form').height('auto');
        // var i = 0,
        //     rowNum = ($(window).width() > 1356) ? 4 : 3,
        //     realCateCnt = $('#browse-category').data('realCateCnt'),
        //     modCatLen = realCateCnt % rowNum,
        //     windowHeight = $(window).height(),
        //     windowWidth = $(window).width(),
        //     titleFuncHeight = $('#title-func').height(),
        //     formHeight = $('#content-main-wrap form').height(),
        //     headerHeight = $('#header').height(),
        //     navHeight = $('#studio-nav').height(),
        //     contentHeight = windowHeight - titleFuncHeight - headerHeight - navHeight + 5 - 48 - 38 - 10;   // 5:header and studio-nav overlap 48:footer 38:title-func-padding
        // if (windowWidth > 1220) {
        //     $('input.text').width(windowWidth - 734);
        //     $('textarea.textarea').width(windowWidth - 735);
        //     $('.connected .share-item .page-list').width(windowWidth - 837);
        //     $('.reconnected .reconnect-notice').width(windowWidth - 734);
        // } else {
        //     $('input.text').width(433);
        //     $('textarea.textarea').width(432);
        //     $('.connected .share-item .page-list').width(330);
        //     $('.reconnected .reconnect-notice').width(445);
        // }
        // $('#browse-category li[data-meta=0]').remove();
        // if (modCatLen > 0) {
        //     modCatLen = rowNum - modCatLen;
        //     for (i = 0; i < modCatLen; i += 1) {
        //         $('<li data-meta="0" class="none"></li>').appendTo('#browse-category');
        //     }
        // }
        // if (1220 > windowWidth) {
        //     $('#content-main-wrap form .fminput .fmfield .category, #browse-category').width(441);
        //     $('#browse-category li').width(139);
        //     $('#browse-category li').eq(3).removeClass('first-row');
        // }
        // if (1220 <= windowWidth && windowWidth <= 1356) {
        //     $('#content-main-wrap form .fminput .fmfield .category, #browse-category').width(windowWidth - 726);
        //     $('#browse-category li').width(((windowWidth - 726) / 3) - 8);
        //     $('#browse-category li').eq(3).removeClass('first-row');
        // }
        // if (windowWidth > 1356) {
        //     $('#content-main-wrap form .fminput .fmfield .category, #browse-category').width(632);
        //     $('#browse-category li').width(150);
        //     $('#browse-category li').eq(3).addClass('first-row');
        // }
        // $page.truncateFormTitle();
        // if (contentHeight <= formHeight) {
        //     $('#content-main-wrap form').height('auto');
        // } else {
        //     $('#content-main-wrap form').height(contentHeight - 56);
        // }
        // $('#content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + titleFuncHeight + 38); // 38: title-func padding
        // $('#content-main-wrap form').data('height', $('#content-main-wrap form').height());
    };

    $page.setTaglistWidth = function () {
        // var tagTitleWidth = $('.tag-list h4').width(),
        //     inputWidth = $('input.text').width();
        // $('#tag-list').width(inputWidth - tagTitleWidth);
    };

    $page.ellipsisPage = function () {
        var windowWidth = $(window).width();
        if (windowWidth > 1220) {
            $('ul#fb-page-list').width(windowWidth - 838);
            $('ul#fb-page-list li').width((windowWidth - 838) / 2);
        } else {
            $('ul#fb-page-list').width(329);
            $('ul#fb-page-list li').width(164.5);
        }
    };

    $page.scrollToBottom = function () {
        var sliderPos = $('#main-wrap-slider .slider-vertical').slider('value');

    $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider', $('#footer').offset().top - ( $('#title-func').offset().top + $('#title-func').outerHeight(true) ), $('#content-main-wrap').height());

        $('#main-wrap-slider .slider-vertical').slider('value', sliderPos);
        $common.hideFbPageList({
            hidePageList: false
        });
    };

    $page.uploadImage = function () {
        var parameter = {
            'prefix': 'cms',
            'type':   'image',
            'size':   20485760,
            'acl':    'public-read'
        };
        nn.api('GET', cms.reapi('/api/s3/attributes'), parameter, function (s3attr) {
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
                    button_window_mode:         SWFUpload.WINDOW_MODE.TRANSPARENT,
                    http_success:               [ 201 ],
                    file_dialog_start_handler:  handlerFileDialogStart,
                    upload_progress_handler:    handlerUploadProgress,
                    upload_success_handler:     handlerUploadSuccess,
                    upload_error_handler:       handlerUploadError,
                    file_queued_handler:        handlerFileQueue,
                    file_queue_error_handler:   handlerFileQueueError,
                    debug:                      false
                },
                swfu = new SWFUpload(settings);
            swfu.debug = cms.config.IS_DEBUG;
        });
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

    $page.renderConnectFacebookUI = function () {
        $('#settingForm .connect-switch').removeClass('hide');
        $('#settingForm .connected').addClass('hide');
        $('#settingForm .reconnected').addClass('hide');
        $('#fbTimeline').prop('checked', false);
        $('#fbTimeline-label').removeClass('checked');
        $.uniform.update('#fbTimeline');
        $('#fbPage').prop('disabled', false);
        $('#fbPage').prop('checked', false);
        $('#fbPage-label').removeClass('checked');
        $.uniform.update('#fbPage');
        $('#fb-page-list').remove();
        $('#page-selected').text(nn._(['channel', 'setting-form', 'Select facebook pages']));
        $('.page-list').addClass('disable').removeClass('enable on');
        $('#pageId').val('');
    };

    $page.renderAutoShareUI = function (facebook, isAutoCheckedTimeline) {
        $('#settingForm .connect-switch').addClass('hide');
        if (true === cms.global.FB_RESTART_CONNECT) {
            $('#settingForm .connected').addClass('hide');
            $('#settingForm .reconnected').removeClass('hide');
        } else {
            $('#settingForm .connected').removeClass('hide');
            $('#settingForm .reconnected').addClass('hide');
        }
        if (true === isAutoCheckedTimeline) {
            $('#fbTimeline').prop('checked', true);
            $('#fbTimeline-label').addClass('checked');
            $.uniform.update('#fbTimeline');
        }
        // disable facebook page or rebuild fb-page-list
        if (!facebook.pages || 'string' === typeof facebook.pages || 0 === facebook.pages.length) {
            $('#fbPage').prop('disabled', true);
            $.uniform.update('#fbPage');
        } else {
            $('#fbPage').prop('disabled', false);
            $.uniform.update('#fbPage');
            var pages = facebook.pages,
                rowNum = 2,
                modPageLen = pages.length % rowNum,
                i = 0;
            if (modPageLen > 0) {
                modPageLen = rowNum - modPageLen;
                for (i = 0; i < modPageLen; i += 1) {
                    pages.push({
                        id: 0,
                        name: ''
                    });
                }
            }
            $('#fb-page-list').remove();
            $('#fb-page-list-tmpl').tmpl({
                cntPage: pages.length
            }).appendTo('div.page-list-middle');
            $('#fb-page-list-tmpl-item').tmpl(pages).appendTo('#fb-page-list');
            $page.ellipsisPage();
        }
        // checked default fadebook page
        if ('channel-setting.html' === cms.global.USER_URL.attr('file') && cms.global.USER_URL.param('id') > 0) {
            nn.api('GET', cms.reapi('/api/channels/{channelId}/autosharing/facebook', {
                channelId: cms.global.USER_URL.param('id')
            }), null, function (autoshares) {
                if (autoshares && autoshares.length > 0) {
                    var isCheckedTimeline = false,
                        tempIds = [],
                        pageIds = [],
                        pageNames = [],
                        pageItem = null;
                    $.each(autoshares, function (i, autoshare) {
                        if (autoshare.userId === facebook.userId) {
                            isCheckedTimeline = true;
                        } else {
                            tempIds.push($.trim(autoshare.userId));
                        }
                    });
                    if (true === isCheckedTimeline) {
                        $('#fbTimeline').prop('checked', true);
                        $('#fbTimeline-label').addClass('checked');
                        $.uniform.update('#fbTimeline');
                    } else {
                        $('#fbTimeline').prop('checked', false);
                        $('#fbTimeline-label').removeClass('checked');
                        $.uniform.update('#fbTimeline');
                    }
                    if (tempIds.length > 0 && $('#fb-page-list li:has(a)').length > 0) {
                        $('#fb-page-list li:has(a)').each(function (i) {
                            pageItem = $(this).children('a');
                            if (-1 !== $.inArray($.trim(pageItem.data('id')), tempIds)) {
                                pageIds.push(pageItem.data('id'));
                                pageNames.push(pageItem.text());
                                $(this).addClass('checked');
                            }
                        });
                        if (pageNames.length > 0) {
                            $('#fbPage').prop('checked', true);
                            $('#fbPage-label').addClass('checked');
                            $.uniform.update('#fbPage');
                            $('.page-list').removeClass('disable').addClass('enable');
                            $('#pageId').val(pageIds.join(','));
                            $('#page-selected').text(pageNames.join(', '));
                        }
                    }
                    $common.autoHeight();
                    $page.setFormHeight();
                    $page.setTaglistWidth();

    $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider', $('#footer').offset().top - ( $('#title-func').offset().top + $('#title-func').outerHeight(true) ), $('#content-main-wrap').height());

                    $common.hideFbPageList();
                }
            });
        } else {
            $common.autoHeight();
            $page.setFormHeight();
            $page.setTaglistWidth();
            
    $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider', $('#footer').offset().top - ( $('#title-func').offset().top + $('#title-func').outerHeight(true) ), $('#content-main-wrap').height());

            $common.hideFbPageList();
        }
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        if (cms.global.USER_URL.attr('file') === 'channel-setting.html') {
            // update mode
            nn.log({
                // NOTE: remember to change page-key to match file-name
                subject: 'CMS.PAGE.INITIALIZED: channel-setting',
                options: options
            }, 'debug');

            var id = cms.global.USER_URL.param('id');
            if (id > 0 && !isNaN(id) && cms.global.USER_DATA.id) {
                nn.api('GET', cms.reapi('/api/users/{userId}/channels', {
                    userId: cms.global.USER_DATA.id
                }), null, function (data) {
                    var channelIds = [];
                    if (data.length > 0) {
                        $.each(data, function (i, list) {
                            channelIds.push(list.id);
                        });
                    }
                    if (-1 === $.inArray(parseInt(id, 10), channelIds)) {
                        $common.showSystemErrorOverlayAndHookError('You are not authorized to edit this channel.');
                        return;
                    }
                    nn.api('GET', cms.reapi('/api/channels/{channelId}', {
                        channelId: id
                    }), null, function (channel) {
                        if (channel.contentType === cms.config.YOUR_FAVORITE) {
                            $common.showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                            return;
                        }
                        $common.showProcessingOverlay();
                        $('#func-nav ul').html('');
                        $('#func-nav-tmpl').tmpl(channel).appendTo('#func-nav ul');
                        $('#content-main').html('');
                        $('#content-main-tmpl').tmpl(channel).appendTo('#content-main');

                        // sharing url
                        nn.api('GET', cms.reapi('/api/channels/{channelId}/autosharing/brand', {
                            channelId: id
                        }), null, function (cBrand) {
                            $("#surl-text").text(cBrand.brand);
                        }).then(function (ccBrand) {
                            nn.api('GET', cms.reapi('/api/channels/{channelId}/autosharing/validBrands', {
                                channelId: id
                            }), null, function (cBrands) {
                                $('#surl-ul').html('');
                                $('#surl-tmpl-item').tmpl(cBrands, {
                                    selBrand: ccBrand.brand
                                }).appendTo('#surl-ul');
                            });
                        });

                        $('#name').charCounter(20, {
                            container: '#name-charcounter',
                            format: '%1',
                            delay: 0,
                            clear: false
                        });
                        $('#intro').charCounter(70, {
                            container: '#intro-charcounter',
                            format: '%1',
                            delay: 0,
                            clear: false
                        });
                        if ($('#uploadThumbnail').length > 0) {
                            $page.uploadImage();
                        }
                        if ($('.connected input').length > 0) {
                            $('.connected input').uniform();
                        }
                        $common.initFacebookJavaScriptSdk();
                        $('#channel-name').data('width', $('#channel-name').width());
                        // setup channel data
                        if ('' !== $.trim(channel.imageUrl)) {
                            $('#thumbnail-imageUrl').attr('src', channel.imageUrl + '?n=' + Math.random());
                        }
                        if ('' !== channel.lang && cms.config.LANG_MAP[channel.lang]) {
                            $('#lang-select-txt').text(cms.config.LANG_MAP[channel.lang]);
                        }
                        if ('' !== channel.sphere && cms.config.SPHERE_MAP[channel.sphere]) {
                            $('#sphere-select-txt').text(cms.config.SPHERE_MAP[channel.sphere]);
                            $('.category').removeClass('disable').addClass('enable');
                            var sphere = channel.sphere;
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
                                var rowNum = ($(window).width() > 1356) ? 4 : 3,
                                    modCatLen = categories.length % rowNum,
                                    i = 0;
                                if (modCatLen > 0) {
                                    modCatLen = rowNum - modCatLen;
                                    for (i = 0; i < modCatLen; i += 1) {
                                        categories.push({
                                            id: 0,
                                            name: ''
                                        });
                                    }
                                }
                                $('#browse-category').html('');
                                $('#category-list-tmpl-item').tmpl(categories, {
                                    dataArrayIndex: function (item) {
                                        return $.inArray(item, categories);
                                    }
                                }).appendTo('#browse-category');
                                $('#browse-category li[data-meta=0]').addClass('none');
                                if ('' !== channel.categoryId && cms.config.CATEGORY_MAP[channel.categoryId]) {
                                    $('.tag-list').removeClass('hide');
                                    $('#categoryId-select-txt').text(cms.config.CATEGORY_MAP[channel.categoryId]);
                                    nn.api('GET', cms.reapi('/api/tags'), {
                                        categoryId: channel.categoryId,
                                        lang: sphere
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
                                    });
                                }
                            });
                        }
                        $page.truncateFormTitle();
                        // ON PURPOSE to wait api (async)
                        $('#overlay-s').fadeOut(5000, function () {
                            $common.autoHeight();
                            $page.setFormHeight();
                            $page.setTaglistWidth();

    $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider', $('#footer').offset().top - ( $('#title-func').offset().top + $('#title-func').outerHeight(true) ), $('#content-main-wrap').height());

                            $common.hideFbPageList();
                            $('#settingForm .btn-save').removeClass('disable').addClass('enable');
                        });
                    });
                });
            } else {
                $common.showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
                return;
            }
        } else {
            // insert mode
            nn.log({
                // NOTE: remember to change page-key to match file-name
                subject: 'CMS.PAGE.INITIALIZED: channel-add',
                options: options
            }, 'debug');

            $common.showProcessingOverlay();
            $('#content-main').html('');
            $('#content-main-tmpl').tmpl().appendTo('#content-main');
            $('#name').charCounter(20, {
                container: '#name-charcounter',
                format: '%1',
                delay: 0,
                clear: false
            });
            $('#intro').charCounter(70, {
                container: '#intro-charcounter',
                format: '%1',
                delay: 0,
                clear: false
            });
            if ($('#uploadThumbnail').length > 0) {
                $page.uploadImage();
            }
            if ($('.connected input').length > 0) {
                $('.connected input').uniform();
            }
            $common.initFacebookJavaScriptSdk();
            // ON PURPOSE to wait api (async)
            $('#overlay-s').fadeOut(3000, function () {
                $common.autoHeight();
                $page.setFormHeight();
                $page.setTaglistWidth();

    $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider', $('#footer').offset().top - ( $('#title-func').offset().top + $('#title-func').outerHeight(true) ), $('#content-main-wrap').height());

                $common.hideFbPageList();
                $('#settingForm .btn-cancel, #settingForm .btn-create').removeClass('disable').addClass('enable');
            });
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('channel')));
$(function () {
    autoHeight();
    setFormHeight();
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
    $('#settingForm').change(function () {
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
    $('#settingForm .btn-cancel').click(function () {
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
        if ('' != $('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout'])) {
            $('#' + $('body').data('leaveId')).trigger('click');
        } else {
            location.href = $('body').data('leaveUrl');
        }
        return false;
    });
    $('.unblock, .btn-close, .btn-no').click(function () {
        $.unblockUI();
        return false;
    });

    // channel list sorting
    $('#title-func').on('click', 'p.order a.reorder', function () {
        $(this).text('Save order').removeClass('reorder').addClass('save');
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
                    $this.text('Reorder channels').removeClass('save').addClass('reorder');
                    $('#channel-list').sortable('disable');
                    $('body').removeClass('has-change');
                });
            });
        } else {
            $this.text('Reorder channels').removeClass('save').addClass('reorder');
            $('#channel-list').sortable('disable');
            $('body').removeClass('has-change');
        }
        return false;
    });

    // channel list delete
    $('#channel-list').on('click', '.enable a.del', function () {
        $(this).parents('li').addClass('deleting').data('deleteId', $(this).attr('rel'));
        showDeletePromptOverlay();
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#channel-list li.deleting').length > 0 && '' != $('#channel-list li.deleting').data('deleteId')) {
            showSavingOverlay();
            nn.api('DELETE', CMS_CONF.API('/api/users/{userId}/channels/{channelId}', {userId: CMS_CONF.USER_DATA.id, channelId: $('#channel-list li.deleting').data('deleteId')}), null, function (data) {
                if ('OK' == data) {
                    $('#overlay-s').fadeOut(1000, function () {
                        var cntChannel = $('#channel-counter').html();
                        if (cntChannel > 0) {
                            $('#channel-counter').html(cntChannel - 1);
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

    // channel form facebook
    $('.switch-off').click(function () {
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#lightbox-facebook')
        });
        $(this).hide();
        $('.switch-on').show();
        $(this).parent().children('.select').removeClass('disable').addClass('enable');
        $(this).parent().children('.select').children('.select-btn').removeClass('on');
        return false;
    });
    $('.switch-on').click(function () {
        $(this).hide();
        $('.switch-off').show();
        $(this).parent().children('.select').addClass('disable').removeClass('enable');
        return false;
    });
    $('#lightbox-facebook').on('click', '.checkbox a', function () {
        $(this).parent().toggleClass('on');
    });

    // channel form charCounter
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

    // channel form selector
    $('#settingForm').on('click', '.enable .select-btn, .enable .select-txt', function (event) {
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
    $('#settingForm').on('click', '.select .select-list li', function () {
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
                    $.each(categories, function (i, list) {
                        CMS_CONF.CATEGORY_MAP[list.id] = list.name;
                    });
                    $('#category-list-tmpl-item').tmpl(categories, {
                        dataArrayIndex: function (item) {
                            return $.inArray(item, categories);
                        }
                    }).appendTo('#browse-category');
                    $('.category').removeClass('disable').addClass('enable');
                    $('#categoryId-select-txt').text('Select a category');
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
            });
        }
        $(this).parent().parent().children('.select-meta').val(metadata);
        $(this).parent().parent().children('.select-btn').removeClass('on');
        $(this).parent().parent().children('.select-txt').children().text(selectOption);
        $(this).parent().hide();
        return false;
    });

    // channel form tag
    $('#tag-list').on('click', 'li span a', function () {
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

    // channel form button
    $('#settingForm .btn-save').click(function () {
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
                $('#overlay-s').fadeOut(1000, function () {
                    $('body').removeClass('has-change');
                    $('#imageUrlOld').val(channel.imageUrl);
                });
            });
        }
        return false;
    });
    $('#settingForm .btn-create').click(function () {
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
                $('#overlay-s').fadeOut(1000, function () {
                    $('body').removeClass('has-change');
                    $('#imageUrlOld').val(channel.imageUrl);
                    location.href = 'index.html';
                });
            });
        }
        return false;
    });
    $('.fminput').click(function () {
        $('.form-btn .notice').addClass('hide');
    });

    $(window).resize(function () {
        autoHeight();
        setFormHeight();
        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    });

    // Amazon S3 upload
    if ($('#uploadThumbnail').length > 0) {
        uploadImage();
    }
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
    var windowHeight = $(window).height(),
        windowWidth  = $(window).width(),
        channelListWidth = $('#channel-list').width(),
        titleFuncHeight = $('#title-func').height(),
        formHeight = $('#content-main-wrap form').height(),
        contentHeight = windowHeight - titleFuncHeight - 94 - 48 - 38 - 10;    // 94:header+studio-nav 48:footer 38:title-func-padding
    if (windowWidth > 1220) {
        $('input.text').width(windowWidth - 734);
        $('textarea.textarea').width(windowWidth - 744);
    }
    if (windowWidth <= 1220) {
        $('input.text').width(460);
        $('textarea.textarea').width(455);
    }
    if (contentHeight < 417) {  // 417: formHeight + paddingbottom56
        $('#content-main-wrap form').height(361);
    } else {
        $('#content-main-wrap form').height(contentHeight - 56);
    }
    $('#channel-list li .wrap').width(channelListWidth - 36);
    $('#content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + titleFuncHeight + 48);
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
             swfu.setButtonText('<span class="uploadstyle">Uploading...</span>');
        };
        var handlerUploadSuccess = function (file, serverData, recievedResponse) {
            $('.upload-img .loading').hide();
            swfu.setButtonText('<span class="uploadstyle">Upload</span>');
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
            swfu.setButtonText('<span class="uploadstyle">Upload</span>');
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
            button_text:                '<span class="uploadstyle">Upload</span>',
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
$(function () {
    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
    setFormHeight();
    if ($('#uploadThumbnail').length > 0) {
        uploadImage();
    }

    // common unblock
    $('body').keyup(function (e) {
        if (e.keyCode === 27) {
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

    // channel list delete
    $('#channel-list').on('click', '.enable a.del', function () {
        $(this).parent().parent().parent().parent().parent().parent('li').addClass('deleting').data('deleteId', $(this).attr('href'));
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#delete-prompt')
        });
        $('.blockOverlay').height($(window).height() - 45);
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#channel-list li.deleting').length > 0 && '' != $('#channel-list li.deleting').data('deleteId')) {
            $('#overlay-s .overlay-middle').html('Saving...');
            $('#overlay-s').fadeIn();
            $('#overlay-s .overlay-content').css('margin-left', '-43px');
            nn.api('DELETE', $('#channel-list li.deleting').data('deleteId'), null, function (data) {
                $('#overlay-s').hide();
                if ('OK' == data) {
                    $('#channel-counter').html($('#channel-counter').html() - 1);
                    $('#channel-list li.deleting').remove();
                    $('#content-main-wrap').height($('#content-main-wrap').height() - 103); // 103: li height
                    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
                    $('#overlay-s .overlay-middle').html('Changes were saved successfully');
                    $('#overlay-s .overlay-content').css('margin-left', '-132px');
                    $('#overlay-s').fadeIn().delay(3000).fadeOut();
                } else {
                    alert('Delete error');
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
    $('#intro').charCounter(144, {
        container: '#intro-charcounter',
        format: '%1',
        delay: 0,
        clear: false
    });

    // channel form selector
    $('#settingForm').on('click', '.enable .select-btn, .enable .select-txt', function (event) {
        $('.select-list').hide();
        $(this).parent("li").siblings().children(".on").removeClass("on");
        $(this).parent().children('.select-btn').toggleClass("on");
        if ($(this).parent().children('.select-btn').hasClass('on')) {
            $(this).parent().children('.select-list').slideDown();
        } else {
            $(this).parent().children('.select-list').hide();
        }
        event.stopPropagation();
        return false;
    });
    $('#settingForm').on('click', '.select .select-list li', function () {
        var selectOption = $(this).text();
        var metadata = $(this).data('meta');
        // region (sphere) relate to category
        if ('sphere-select-list' === $(this).parent().attr('id')) {
            var srcname = $(this).parent().parent().children('.select-txt').children().text();
            if (srcname != selectOption) {
                $('.category').removeClass('enable').addClass('disable');
                $('#categoryId').val(0);
                $('#browse-category').html('');
                var sphere = metadata;
                if ('other' === sphere) { sphere = 'en'; }
                nn.api('GET', '/api/categories', { lang: sphere }, function (categories) {
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
            nn.api('GET', '/api/tags', { categoryId: metadata }, function (tags) {
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
        var temp = [];
        var currentTags = $('#tag').val();
        var clickedTag = $.trim($(this).text());
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
    $('#settingForm .btn-cancel').click(function () {
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#unsave-prompt')
        });
        return false;
    });
    $('#unsave-prompt .btn-leave').click(function () {
        $.unblockUI();
        location.href = 'index.html';
        return false;
    });
    $('.unblock, .btn-close, .btn-no').click(function () {
        $.unblockUI();
        return false;
    });
    $('#settingForm .btn-save').click(function () {
        if (chkData(document.settingForm) && CMS_CONF.USER_DATA.id && $(this).hasClass('enable') && CMS_CONF.USER_URL.param('id') > 0) {
            $('#overlay-s').fadeIn();
            $('#overlay-s .overlay-content').css('margin-left', '-43px');
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').hide(0, function () {
                    alert(textStatus + ': ' + jqXHR.responseText);
                });
            });
            var parameter = $('#settingForm').serialize();
            nn.api('PUT', '/api/channels/' + CMS_CONF.USER_URL.param('id'), parameter, function (data) {
                location.href = 'index.html';
            });
        }
        return false;
    });
    $('#settingForm .btn-create').click(function () {
        if (chkData(document.settingForm) && CMS_CONF.USER_DATA.id && $(this).hasClass('enable')) {
            $('#overlay-s').fadeIn();
            $('#overlay-s .overlay-content').css('margin-left', '-43px');
            nn.on(400, function (jqXHR, textStatus) {
                $('#overlay-s').hide(0, function () {
                    alert(textStatus + ': ' + jqXHR.responseText);
                });
            });
            var parameter = $('#settingForm').serialize();
            nn.api('POST', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels', parameter, function (data) {
                location.href = 'index.html';
            });
        }
        return false;
    });
    $('.fminput').click(function () {
        $('.form-btn .notice').addClass('hide');
    });

    $(window).resize(function () {
        setFormHeight();
        scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
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
    var windowHeight = $(window).height();
    var windowWidth  = $(window).width()
    var titleFuncHeight = $('#title-func').height();
    var formHeight = $('#content-main-wrap form').height();
    var contentHeight = windowHeight - titleFuncHeight - 94 - 48 - 38 - 10;    // 94：header + studio-nav; 48：footer; 38：title-func padding

    if (windowWidth > 1220) {
        $('input.text').width(windowWidth - 734);
        $('textarea.textarea').width(windowWidth - 744);
    }
    if (formHeight < contentHeight) {
        $('#content-main-wrap form').height(contentHeight - 40);
    }
}

function uploadImage() {
    var parameter = {
        'prefix': 'cms',
        'type':   'image',
        'size':   20485760,
        'acl':    'public-read'
    };
    nn.api('GET', '/api/s3/attributes', parameter, function (s3attr) {
        var timestamp = (new Date()).getTime(); // 產生 timestamp 作為上傳檔名
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
                "key":            parameter['prefix'] + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase(), // upload file name, TODO: need convention
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
            file_post_name:             'file', // hardcode
            button_placeholder:         $('#uploadThumbnail').get(0), // 按鈕放置處的 DOM
            button_image_url:           'images/btn-load.png', // 按鈕的圖檔，四幅式
            button_width:               '129',
            button_height:              '29',
            button_text:                '<span class="uploadstyle">Upload</span>',
            button_text_style:          '.uploadstyle { color: #777777; font-family: Helvetica; font-size: 15px; text-align: center; }',
            button_action:              SWFUpload.BUTTON_ACTION.SELECT_FILE, // hardcode
            button_cursor:              SWFUpload.CURSOR.HAND, // hardcode
            button_window_mode :        SWFUpload.WINDOW_MODE.TRANSPARENT, // hardcode
            http_success :              [ 201 ],
            // 名種 callback 函式 //
            file_dialog_start_handler:  handlerFileDialogStart,
            upload_progress_handler:    handlerUploadProgress,
            upload_success_handler:     handlerUploadSuccess,
            upload_error_handler:       handlerUploadError,
            file_queued_handler:        handlerFileQueue,
            file_queue_error_handler:   handlerFileQueueError,
            // Debug Mode //
            debug:                      false
        };
        var swfu = new SWFUpload(settings);
    });
}
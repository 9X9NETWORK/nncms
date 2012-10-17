$(function () {
    //scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    setFormWidth();

    // common unblock
    function hasErrorRedirect() {
        var gobackUrl = $('#form-btn-leave').data('gobackUrl');
        if (gobackUrl) {
            $('#form-btn-leave').removeData('gobackUrl');
            location.replace(gobackUrl);
        } else {
            location.replace($('#form-btn-leave').data('leaveUrl'));
        }
    }
    $('body').keyup(function (e) {
        if (27 === e.keyCode) { // Esc
            $.unblockUI();
            if ($(this).hasClass('has-error')) {
                hasErrorRedirect();
            }
            return false;
        }
    });
    $('#system-error .btn-ok, #system-error .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            hasErrorRedirect();
        }
        return false;
    });

    // leave and unsave
    function goLeave(url) {
        if (document.epcurateForm) {
            var fm = document.epcurateForm;
            if (fm.imageUrl && fm.imageUrlOld && fm.imageUrl.value != fm.imageUrlOld.value) {
                $('body').addClass('has-change');
            }
        }
        if ($('#name').length > 0 && '' != $('#name').val() && '' == $('#id').val()) {
            $('body').addClass('has-change');
        }
        if ($('body').hasClass('has-change')) {
            showUnsaveOverlay();
        } else {
            location.href = url;
        }
    }
    function confirmExit() {
        if ($('body').hasClass('has-change')) {
            // Unsaved changes will be lost, are you sure you want to leave?
            return $('#unsave-prompt p.content').text();
        }
    }
    window.onbeforeunload = confirmExit;
    $('body').removeClass('has-change');
    $('#epcurateForm').change(function () {
        $('body').addClass('has-change');
    });
    $('#epcurate-nav-back').click(function () {
        goLeave($(this).attr('href'));
        return false;
    });
    $('#content-wrap .form-btn').on('click', '#form-btn-leave', function () {
        goLeave($('#form-btn-leave').data('leaveUrl'));
        return false;
    });
    $('#unsave-prompt .btn-leave').click(function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        location.href = $('#form-btn-leave').data('leaveUrl');
        return false;
    });
    $('.unblock, .btn-close, .btn-no').click(function () {
        $.unblockUI();
        return false;
    });

    // save
    $('#epcurateForm').submit(function (e, src) {
        var isInsertMode = ('' == $('#id').val()),
            nextstep = 'epcurate-curation.html';
        // Episode Curation - Information
        if ($(e.target).hasClass('info') && chkInfoData(this, src)) {
            showSavingOverlay();
            // save
            if (isInsertMode) {
                // save to cookie
                $.cookie('cms-crumb', $(this).serialize());
                $('#overlay-s').fadeOut(1000, function () {
                    // redirect
                    $('body').removeClass('has-change');
                    if (!src                                                                                        // from nature action
                            || (src && 'form-btn-save' === $(src.target).attr('id'))                                // from btn-save
                            || (src && 'epcurate-nav-publish' === $(src.target).attr('id'))) {                      // from insert mode and nav-publish
                        if (src && 'epcurate-nav-publish' === $(src.target).attr('id')) {
                            showSystemErrorOverlay('Please curate some videos first.');
                        }
                        return false;
                    } else {
                        if (src && '' !== $(src.target).attr('href')) {
                            nextstep = $(src.target).attr('href');
                        }
                        location.href = nextstep;
                    }
                });
            } else {
                // save to api
                if (!$('body').hasClass('has-change')) {
                    $('#overlay-s').fadeOut(1000, function () {
                        // redirect
                        $('body').removeClass('has-change');
                        if (!src                                                                                        // from nature action
                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                            return false;
                        } else {
                            if (src && '' !== $(src.target).attr('href')) {
                                nextstep = $(src.target).attr('href');
                            }
                            location.href = nextstep;
                        }
                    });
                    return false;
                }
                var params = {
                    name: $('#name').val(),
                    intro: $('#intro').val()
                };
                nn.api('PUT', '/api/episodes/' + $('#id').val(), params, function (episode) {
                    $('#overlay-s').fadeOut(1000, function () {
                        // redirect
                        $('body').removeClass('has-change');
                        if (!src                                                                                        // from nature action
                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                            return false;
                        } else {
                            if (src && '' !== $(src.target).attr('href')) {
                                nextstep = $(src.target).attr('href');
                            }
                            location.href = nextstep;
                        }
                    });
                });
            }
        }
        // Episode Curation - Publish
        if ($(e.target).hasClass('publish') && chkPublishData(this, src)) {
            if ($('#id').val() > 0) {
                showSavingOverlay();
                // save to api
                if (!$('body').hasClass('has-change')) {
                    $('#overlay-s').fadeOut(1000, function () {
                        // redirect
                        $('body').removeClass('has-change');
                        if (!src                                                                                        // from nature action
                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                            return false;
                        } else {
                            if (src && '' !== $(src.target).attr('href')) {
                                nextstep = $(src.target).attr('href');
                            }
                            location.href = nextstep;
                        }
                    });
                    return false;
                }
                var params = {
                    imageUrl: $('#imageUrl').val()
                };
                nn.api('PUT', '/api/episodes/' + $('#id').val(), params, function (episode) {
                    $('#overlay-s').fadeOut(1000, function () {
                        // redirect
                        $('body').removeClass('has-change');
                        $('#imageUrlOld').val(episode.imageUrl);
                        if (!src                                                                                        // from nature action
                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                            return false;
                        } else {
                            if (src && '' !== $(src.target).attr('href')) {
                                nextstep = $(src.target).attr('href');
                            }
                            location.href = nextstep;
                        }
                    });
                });
            }
        }
        return false;
    });

    $(window).resize(function () {
        setFormWidth();
        //scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    });

    // Amazon S3 upload
    if ($('#uploadThumbnail').length > 0) {
        uploadImage();
    }
});

function chkPublishData(fm, src) {
    fm.imageUrl.value = $.trim(fm.imageUrl.value);
    return true;
}

function chkInfoData(fm, src) {
    fm.name.value = $.trim(fm.name.value);
    fm.intro.value = $.trim(fm.intro.value);
    if ('' === fm.name.value) {
        $('.fmfield .notice').removeClass('hide');
        fm.name.focus();
        return false;
    }
    if ('' == $('#id').val() && src && 'epcurate-nav-publish' === $(src.target).attr('id')) {
        showSystemErrorOverlay('Please curate some videos first.');
    }
    return true;
}

function setFormWidth() {
    var windowWidth = $(window).width();
    if (windowWidth > 1220) {
        $('input.text').width(windowWidth - 600);
        $('textarea.textarea').width(windowWidth - 610);
    }
}

function uploadImage() {
    var parameter = {
        'prefix': 'cms',
        'type':   'image',
        'size':   20485760,
        'acl':    'public-read'
    };
    nn.api('GET', '/api/s3/attributes?anticache=' + (new Date()).getTime(), parameter, function (s3attr) {
        var timestamp = (new Date()).getTime();
        var handlerFileDialogStart = function () {
            $('.img-upload-func .highlight').addClass('hide');
        };
        var handlerUploadProgress = function (file, completed /* completed bytes */, total /* total bytes */) {
            $('#thumbnail-list .loading').show();
             swfu.setButtonText('<span class="uploadstyle">Uploading...</span>');
        };
        var handlerUploadSuccess = function (file, serverData, recievedResponse) {
            $('#thumbnail-list .loading').hide();
            swfu.setButtonText('<span class="uploadstyle">Upload</span>');
            if (!file.type) {
                file.type = nn.getFileTypeByName(file.name);
            }
            this.setButtonDisabled(false); // enable upload button again
            var url = 'http://' + s3attr['bucket'] + '.s3.amazonaws.com/' + parameter['prefix'] + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase();
            $('#thumbnail-list ul li.new').remove();
            $('#thumbnail-list ul').prepend('<li class="new"><img src="' + url + '" alt="" /></li>');
            $('#thumbnail-list ul').cycle('destroy');
            $('#thumbnail-list ul').cycle({
                fx: 'scrollHorz',
                prev: '#thumbnail-list .img-prev',
                next: '#thumbnail-list .img-next',
                speed: 1000,
                timeout: 0,
                cleartypeNoBg: true,
                before: function () {
                    $('#imageUrl').val($('img', this).attr('src'));
                }
            });
        };
        var handlerUploadError = function (file, code, message) {
            $('#thumbnail-list .loading').hide();
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
                $('.img-upload-func .notice').removeClass('hide');
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
            button_text_style:          '.uploadstyle { color: #777777; font-family: Helvetica; font-size: 15px; text-align: center; } .uploadstyle:hover { color: #999999; }',
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
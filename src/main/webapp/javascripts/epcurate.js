$(function () {
    setFormWidth();
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');

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
            if ($('body').hasClass('publish-notice') || $('body').hasClass('unpublish-notice')) {
                location.href = $('body').data('noticeUrl');
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
    $('#publish-notice .btn-ok, #unpublish-notice .btn-ok').click(function () {
        $.unblockUI();
        location.href = $('body').data('noticeUrl');
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
                            // redirect to leavel url (episode list)
                            location.href = $('#epcurate-nav-back').attr('href');
                            return false;
                        } else {
                            if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                                if ($(src.target).attr('href')) {
                                    nextstep = $(src.target).attr('href');
                                }
                                if ($(src.target).parents('a').attr('href')) {
                                    nextstep = $(src.target).parents('a').attr('href');
                                }
                            }
                            location.href = nextstep;
                        }
                    });
                    return false;
                }
                var status_params = {},
                    origin_status = $('#origin_status').val();
                if ($('#status_draft').is(':checked')) {
                    // Draft (setDraft)
                    status_params = {
                        isPublic: false,
                        publishDate: "",
                        scheduleDate: ""
                    };
                    $('#origin_status').val('Draft');
                    if (-1 !== $.inArray(origin_status, ['Published', 'Scheduled to rerun'])) {
                        $('body').addClass('unpublish-notice');
                    }
                } else {
                    if ($('#status_scheduled').is(':checked') || $('#rerun_y').is(':checked')) {
                        // Scheduled to publish or Scheduled to rerun (setSchedule)
                        status_params = {
                            scheduleDate: Date.parse($('#publishDate').val() + ' ' + $('#publishHour').val())
                        };
                        if ($('#status_scheduled').is(':checked')) {
                            $('#origin_status').val('Scheduled to publish');
                        } else {
                            $('#origin_status').val('Scheduled to rerun');
                        }
                    }
                    if ($('#status_published').is(':checked') && -1 !== $.inArray(origin_status, ['Draft', 'Scheduled to publish'])) {
                        // Published from Draft or Scheduled to publish (setPublish)
                        status_params = {
                            isPublic: true,
                            publishDate: "NOW",
                            scheduleDate: ""
                        };
                        $('#origin_status').val('Published');
                        $('body').addClass('publish-notice');
                    }
                    if ($('#status_published').is(':checked') && 'Scheduled to rerun' === origin_status && !$('#rerun_y').is(':checked')) {
                        // Published from Scheduled to rerun (unsetSchedule)
                        status_params = {
                            scheduleDate: ""
                        };
                        $('#origin_status').val('Published');
                    }
                }
                var params = {
                    name: $('#name').val(),
                    intro: $('#intro').val(),
                    imageUrl: $('#imageUrl').val()
                };
                $.extend(params, status_params);
                nn.api('PUT', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: $('#id').val()}), params, function (episode) {
                    $('#overlay-s').fadeOut(1000, function () {
                        // redirect
                        $('body').removeClass('has-change');
                        $('#imageUrlOld').val(episode.imageUrl);
                        if (!src                                                                                        // from nature action
                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                            if ($('#status_published').is(':checked')) {
                                // UI for Published
                                $('p.radio-list').removeClass('draft');
                                $('#schedule-publish-label').addClass('hide');
                                $('#schedule-publish').addClass('hide');
                                $('#schedule-rerun-label').removeClass('hide');
                                $('#schedule-rerun').removeClass('hide');
                            }
                            if ($('#status_draft').is(':checked')) {
                                // UI for Draft
                                $('p.radio-list').addClass('draft');
                                $('#schedule-publish-label').removeClass('hide');
                                $('#schedule-publish').removeClass('hide');
                                $('#schedule-rerun-label').addClass('hide');
                                $('#schedule-rerun').addClass('hide');
                            }
                            if (!$('#status_scheduled').is(':checked') && !$('#rerun_y').is(':checked')) {
                                // default schedule
                                var tomorrow = new Date((new Date()).getTime() + (24 * 60 * 60 * 1000));
                                $('#publishDate').val(tomorrow.getFullYear() + '/' + (tomorrow.getMonth() + 1) + '/' + tomorrow.getDate());
                                $('#publishHour').val('20:00');
                            }
                            // redirect to leavel url (episode list)
                            $('body').data('noticeUrl', $('#epcurate-nav-back').attr('href'));
                            if ($('body').hasClass('publish-notice')) {
                                showPublishNoticeOverlay();
                            } else if ($('body').hasClass('unpublish-notice')) {
                                showUnpublishNoticeOverlay();
                            } else {
                                location.href = $('#epcurate-nav-back').attr('href');
                            }
                            return false;
                        } else {
                            if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                                if ($(src.target).attr('href')) {
                                    nextstep = $(src.target).attr('href');
                                }
                                if ($(src.target).parents('a').attr('href')) {
                                    nextstep = $(src.target).parents('a').attr('href');
                                }
                            }
                            $('body').data('noticeUrl', nextstep);
                            if ($('body').hasClass('publish-notice')) {
                                showPublishNoticeOverlay();
                            } else if ($('body').hasClass('unpublish-notice')) {
                                showUnpublishNoticeOverlay();
                            } else {
                                location.href = nextstep;
                            }
                        }
                    });
                });
            }
        }
        return false;
    });

    $(window).resize(function () {
        setFormWidth();
        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    });

    // Amazon S3 upload
    if ($('#uploadThumbnail').length > 0) {
        uploadImage();
    }

    // uniform
    $('p.radio-list input').uniform();
    $('input[name=status]').click(function () {
        switchPublishStatus($(this).val());
    });
    $('input[name=rerun]').click(function () {
        switchRerunCheckbox();
    });
    $('#date-time').on('click', '.time ul li.enable a', function () {
        $('body').addClass('has-change');
        $('#date-time .time ul li').removeClass('active');
        $(this).parent().addClass('active');
        $('#publishHour').val($(this).text());
        return false;
    });
    $('#epcurate-info').on('click', '#name', function () {
        $('.form-btn .notice').addClass('hide');
    });
});

function chkPublishData(fm, src) {
    fm.name.value = $.trim(fm.name.value);
    fm.intro.value = $.trim(fm.intro.value);
    fm.imageUrl.value = $.trim(fm.imageUrl.value);
    if (fm.imageUrl && fm.imageUrlOld && fm.imageUrl.value != fm.imageUrlOld.value) {
        $('body').addClass('has-change');
    }
    if ('' === fm.name.value
            || $('input[name=status]:checked').length <= 0
            || ('24:00' === $('#publishHour').val() && ($('#status_scheduled').is(':checked') || $('#rerun_y').is(':checked')))) {
        $('.form-btn .notice').removeClass('hide');
        return false;
    }
    $('.form-btn .notice').addClass('hide');
    $('.img-upload-func .upload-notice').addClass('hide');
    return true;
}

function setFormWidth() {
    var windowWidth = $(window).width();
    if (windowWidth > 1024) {
        $('input.text').width(windowWidth - 600);
        $('textarea.textarea').width(windowWidth - 605);
    }
    if (windowWidth <= 1024) {
        $('input.text').width(480);
        $('textarea.textarea').width(475);
    }
    if (windowWidth < 1024) {
        $('#epcurate-nav ul').css('width', '262px');
        $('#epcurate-nav ul li.publish').css('left', '130px');
        $('#epcurate-nav ul li.on, #epcurate-nav ul li a').css('width', '125px');
        $('#epcurate-nav span.nav-right, #epcurate-nav span.nav-middle').css('width', '125px');
    }
    if (windowWidth >= 1024 && windowWidth <= 1138) {
        $('#epcurate-nav ul').css('width', windowWidth - 762 + 'px');
        $('#epcurate-nav ul li.publish').css('left', windowWidth - 894 + 'px');
        $('#epcurate-nav ul li.on, #epcurate-nav ul li a').css('width', windowWidth - 899 + 'px');
        $('#epcurate-nav span.nav-right, #epcurate-nav span.nav-middle').css('width', windowWidth - 899 + 'px');
    }
    if (windowWidth > 1138) {
        $('#epcurate-nav ul').css('width', '484px');
        $('#epcurate-nav ul li.publish').css('left', '244px');
        $('#epcurate-nav ul li.on, #epcurate-nav ul li a').css('width', '239px');
        $('#epcurate-nav span.nav-right, #epcurate-nav span.nav-middle').css('width', '239px');
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
                    $('body').addClass('has-change');
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
                $('.img-upload-func .upload-notice').removeClass('hide');
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

function switchPublishStatus(flag) {
    if ('scheduled' == flag) {
        $('#date-time').removeClass('hide');
        updateHour();
    } else {
        if ($('#rerun_y').length > 0 && !$('#rerun_y').is(':checked')) {
            $('#date-time').addClass('hide');
        }
    }
    if ('draft' == flag) {
        $('#date-time').addClass('hide');
        $('.checker').children('span').removeClass('checked');
        $('input[name=rerun]').removeAttr('checked');
    }
}

function switchRerunCheckbox() {
    if (!$('#schedule-rerun-label').hasClass('hide')) {
        if ($('input[name=rerun]').is(':checked')) {
            $('input[name=status]').removeAttr('checked');
            $('input[name=status]').parent('span').removeClass('checked');
            $('#status_published').parent('span').addClass('checked');
            $('#status_published').attr('checked', 'checked');
            $('#date-time').removeClass('hide');
            updateHour();
        } else {
            $('#date-time').addClass('hide');
        }
    }
}

function updateHour() {
    var today = new Date(),
        todayDay = parseInt(today.getDate(), 10).toString(),
        todayMonth = parseInt(today.getMonth() + 1, 10).toString(), // January is 0!
        todayYear = today.getFullYear(),
        nowHour = today.getHours() + 1;

    if (todayDay.length < 2) {
        todayDay = '0' + todayDay;
    }
    if (todayMonth.length < 2) {
        todayMonth = '0' + todayMonth;
    }
    var todayDate = todayYear + '/' + todayMonth + '/' + todayDay;

    $('#date-time .datepicker').datepicker({
        monthNames: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        monthNamesShort: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        dayNames: ["S", "M", "T", "W", "T", "F", "S"],
        dayNamesMin: ["S", "M", "T", "W", "T", "F", "S"],
        minDate: 0,
        dateFormat: "yy/mm/dd",
        autoSize: true,
        onSelect: function (dateText, inst) {
            $('body').addClass('has-change');
            var selectDay   = parseInt(inst.currentDay, 10).toString(),
                selectMonth = parseInt(inst.currentMonth + 1, 10).toString(),
                activeHour  = $('#date-time .time ul li.active').index();
            if (selectDay.length < 2) {
                selectDay = '0' + selectDay;
            }
            if (selectMonth.length < 2) {
                selectMonth = '0' + selectMonth;
            }
            var date = inst.currentYear + '/' + selectMonth + '/' + selectDay;

            if (date == todayDate) {
                if (activeHour <= nowHour) {
                    $('#date-time .time ul li').removeAttr('class');
                    $('#date-time .time ul li:eq(' + nowHour + ')').addClass('active').addClass('enable');
                    $('#date-time .time ul li:eq(' + nowHour + ')').prevAll().addClass('disable');
                    $('#date-time .time ul li:eq(' + nowHour + ')').nextAll().addClass('enable');
                } else {
                    $('#date-time .time ul li').removeClass('enable').removeClass('disable');
                    $('#date-time .time ul li:eq(' + nowHour + ')').addClass('enable');
                    $('#date-time .time ul li:eq(' + nowHour + ')').prevAll().addClass('disable');
                    $('#date-time .time ul li:eq(' + nowHour + ')').nextAll().addClass('enable');
                }
            } else {
                $('#date-time .time ul li').removeClass('enable').removeClass('disable');
                $('#date-time .time ul li').addClass('enable');
            }
            $('#publishDate').val(date);
            $('#publishHour').val($('#date-time .time ul li.active').text());
        }
    });

    $('#date-time .time ul li').removeAttr('class');
    $('#date-time .time ul li:eq(' + nowHour + ')').addClass('active').addClass('enable');
    $('#date-time .time ul li:eq(' + nowHour + ')').prevAll().addClass('disable');
    $('#date-time .time ul li:eq(' + nowHour + ')').nextAll().addClass('enable');

    if ('' == $('#publishDate').val() || '' == $('#publishHour').val()) {
        $('#publishDate').val(todayDate);
        $('#publishHour').val($('#date-time .time ul li.active').text());
    } else {
        var time = $('#publishHour').val().split(':'),
            hour = time[0];
        if ($('#publishDate').val() == todayDate) {
            $('#date-time .time ul li').removeAttr('class');
            $('#date-time .time ul li:eq(' + hour + ')').addClass('active').addClass('enable');
            $('#date-time .time ul li:eq(' + nowHour + ')').prevAll().addClass('disable');
            $('#date-time .time ul li:eq(' + nowHour + ')').nextAll().addClass('enable');
            $('#date-time .time ul li:eq(' + nowHour + ')').addClass('enable');
        } else {
            $('#date-time .datepicker').datepicker('setDate', $('#publishDate').val());
            $('#date-time .time ul li').removeClass('active').removeClass('disable').removeClass('enable').addClass('enable');
            $('#date-time .time ul li:eq(' + hour + ')').addClass('active').addClass('enable');
        }
    }
}
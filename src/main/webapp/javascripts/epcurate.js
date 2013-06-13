/*jslint browser: true, devel: true, nomen: true, unparam: true, sloppy: true */
/*global $, nn, CMS_CONF, SWFUpload, scrollbar, showSavingOverlay, showUnsaveOverlay, showPublishNoticeOverlay, showUnpublishNoticeOverlay */

function chkPublishData(fm, src) {
    fm.name.value = $.trim(fm.name.value);
    fm.intro.value = $.trim(fm.intro.value);
    fm.imageUrl.value = $.trim(fm.imageUrl.value);
    if (fm.imageUrl && fm.imageUrlOld && fm.imageUrl.value !== fm.imageUrlOld.value) {
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
    // curation nav width
    if (windowWidth < 1024) {
        $('#epcurate-nav ul').css('width', '256px');
        $('#epcurate-nav ul li').css('width', '128px');
    }
    if (windowWidth >= 1024 && windowWidth <= 1252) {
        $('#epcurate-nav ul').css('width', (windowWidth - 768) + 'px');
        $('#epcurate-nav ul li').css('width', (windowWidth - 768) / 2 + 'px');
    }
    if (windowWidth > 1252) {
        $('#epcurate-nav ul').css('width', '484px');
        $('#epcurate-nav ul li').css('width', '242px');
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
        var timestamp = (new Date()).getTime(),
            handlerFileDialogStart = function () {
                $('.img-upload-func .highlight').addClass('hide');
            },
            handlerUploadProgress = function (file, completed, total) {
                $('#thumbnail-list .loading').show();
                this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Uploading...']) + '</span>');
            },
            handlerUploadSuccess = function (file, serverData, recievedResponse) {
                $('#thumbnail-list .loading').hide();
                this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
                if (!file.type) {
                    file.type = nn.getFileTypeByName(file.name);
                }
                this.setButtonDisabled(false); // enable upload button again
                var url = 'http://' + s3attr.bucket + '.s3.amazonaws.com/' + parameter.prefix + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase();
                $('#thumbnail-list ul li.new').remove();
                $('#thumbnail-list ul').prepend('<li class="new"><div class="img"><img src="' + url + '" alt="" /></div></li>');
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
            },
            handlerUploadError = function (file, code, message) {
                $('#thumbnail-list .loading').hide();
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
                    $('.img-upload-func .upload-notice').removeClass('hide');
                }
            },
            settings = {
                flash_url:                  'javascripts/swfupload/swfupload.swf',
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

function updateHour() {
    var today = new Date(),
        todayDay = parseInt(today.getDate(), 10).toString(),
        todayMonth = parseInt(today.getMonth() + 1, 10).toString(), // January is 0!
        todayYear = today.getFullYear(),
        nowHour = today.getHours() + 1,
        todayDate = '',
        time = [],
        hour = '';

    if (todayDay.length < 2) {
        todayDay = '0' + todayDay;
    }
    if (todayMonth.length < 2) {
        todayMonth = '0' + todayMonth;
    }
    todayDate = todayYear + '/' + todayMonth + '/' + todayDay;

    $('#date-time .datepicker').datepicker({
        firstDay: 0,
        minDate: 0,
        dateFormat: 'yy/mm/dd',
        autoSize: true,
        onSelect: function (dateText, inst) {
            $('body').addClass('has-change');
            var selectDay   = parseInt(inst.currentDay, 10).toString(),
                selectMonth = parseInt(inst.currentMonth + 1, 10).toString(),
                activeHour  = $('#date-time .time ul li.active').index(),
                date = '';
            if (selectDay.length < 2) {
                selectDay = '0' + selectDay;
            }
            if (selectMonth.length < 2) {
                selectMonth = '0' + selectMonth;
            }
            date = inst.currentYear + '/' + selectMonth + '/' + selectDay;

            if (date === todayDate) {
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
    $.datepicker.setDefaults($.datepicker.regional[CMS_CONF.USER_DATA.lang]);

    $('#date-time .time ul li').removeAttr('class');
    $('#date-time .time ul li:eq(' + nowHour + ')').addClass('active').addClass('enable');
    $('#date-time .time ul li:eq(' + nowHour + ')').prevAll().addClass('disable');
    $('#date-time .time ul li:eq(' + nowHour + ')').nextAll().addClass('enable');

    if ('' === $('#publishDate').val() || '' === $('#publishHour').val()) {
        $('#publishDate').val(todayDate);
        $('#publishHour').val($('#date-time .time ul li.active').text());
    } else {
        time = $('#publishHour').val().split(':');
        hour = time[0];
        if ($('#publishDate').val() === todayDate) {
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

function switchPublishStatus(flag, name) {
    if ('scheduled' === flag) {
        $('#date-time').removeClass('hide');
        updateHour();
    } else {
        if ($('#rerun_y').length > 0 && !$('#rerun_y').is(':checked')) {
            $('#date-time').addClass('hide');
        }
    }
    if ('draft' === flag) {
        $('#date-time').addClass('hide');
        $('input[name=rerun]').prop('checked', false);
        $('input[name=rerun]').parents('label').removeClass('checked');
        $.uniform.update('input[name=rerun]');
    }
    $('input[name=' + name + ']').parents('label').removeClass('checked');
    $('input[name=' + name + ']:checked').parents('label').addClass('checked');
}

function switchRerunCheckbox() {
    if (!$('#schedule-rerun-label').hasClass('hide')) {
        if ($('input[name=rerun]').is(':checked')) {
            $('input[name=status]').prop('checked', false);
            $('input[name=status]').parents('label').removeClass('checked');
            $.uniform.update('input[name=status]');
            $('#status_published').prop('checked', true);
            $('#status_published').parents('label').addClass('checked');
            $.uniform.update('#status_published');
            $('#date-time').removeClass('hide');
            updateHour();
        } else {
            $('#date-time').addClass('hide');
        }
    }
}

$(function () {
    setFormWidth();
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    $('#epcurate-nav ul li.publish').click(function () {
        return false;
    });

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
        if (27 === e.which) { // Esc
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
            if (fm.imageUrl && fm.imageUrlOld && fm.imageUrl.value !== fm.imageUrlOld.value) {
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
    $('#content-wrap').on('click', '#form-btn-leave', function () {
        goLeave($('#form-btn-leave').data('leaveUrl'));
        return false;
    });
    $(document).on('click', '#header #logo, #header a, #studio-nav a, #content-nav a, #footer a', function (e) {
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
    $('#unsave-prompt .btn-leave').click(function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        if ($('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
            $('#' + $('body').data('leaveId')).trigger('click');
        } else if ($('body').data('leaveUrl')) {
            location.href = $('body').data('leaveUrl');
        } else {
            location.href = $('#form-btn-leave').data('leaveUrl');
        }
        return false;
    });

    // save
    $('#epcurateForm').submit(function (e, src) {
        // Episode Curation - Publish
        if ($(e.target).hasClass('publish') && chkPublishData(this, src)) {
            if ($('#id').val() > 0) {
                var nextstep = 'episode-list.html?id=' + $('#channelId').val(),
                    status_params = {},
                    origin_status = $('#origin_status').val(),
                    params = null;
                showSavingOverlay();
                // save to api
                if (!$('body').hasClass('has-change')) {
                    $('#overlay-s').fadeOut('fast', function () {
                        // redirect
                        $('body').removeClass('has-change');
                        if (!src                                                                                        // from nature action
                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                            // redirect to leavel url (episode list)
                            location.href = $('#epcurate-nav-back').attr('href');
                            return false;
                        }
                        if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                            if ($(src.target).attr('href')) {
                                nextstep = $(src.target).attr('href');
                            }
                            if ($(src.target).parents('a').attr('href')) {
                                nextstep = $(src.target).parents('a').attr('href');
                            }
                        }
                        location.href = nextstep;
                    });
                    return false;
                }
                if ($('#status_draft').is(':checked')) {
                    // Draft (setDraft)
                    status_params = {
                        isPublic: false,
                        publishDate: '',
                        scheduleDate: ''
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
                            publishDate: 'NOW',
                            scheduleDate: ''
                        };
                        $('#origin_status').val('Published');
                        $('body').addClass('publish-notice');
                    }
                    if ($('#status_published').is(':checked') && 'Scheduled to rerun' === origin_status && !$('#rerun_y').is(':checked')) {
                        // Published from Scheduled to rerun (unsetSchedule)
                        status_params = {
                            scheduleDate: ''
                        };
                        $('#origin_status').val('Published');
                    }
                }
                params = {
                    name: $('#name').val(),
                    intro: $('#intro').val(),
                    imageUrl: $('#imageUrl').val()
                };
                $.extend(params, status_params);
                nn.api('PUT', CMS_CONF.API('/api/episodes/{episodeId}', {
                    episodeId: $('#id').val()
                }), params, function (episode) {
                    $('#overlay-s').fadeOut('fast', function () {
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
                                $('#publish-label').text(nn._([CMS_CONF.PAGE_ID, 'epcurate-form', 'Published']));
                            } else {
                                $('#publish-label').text(nn._([CMS_CONF.PAGE_ID, 'epcurate-form', 'Publish Now']));
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
                        }
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
                    });
                });
            }
        }
        return false;
    });

    $(window).resize(function () {
        setFormWidth();
        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        if ('none' === $('#main-wrap-slider').css('display')) {
            $('#main-wrap-slider .slider-vertical').slider('destroy');
            $('#content-main-wrap').css('top', '0');
        }
    });

    // uniform
    $('#content-wrap').on('click', 'input[name=status]', function () {
        switchPublishStatus($(this).val(), $(this).attr('name'));
    });
    $('#content-wrap').on('click', 'input[name=rerun]', function () {
        switchRerunCheckbox();
    });
    $('#content-wrap').on('click', '#date-time .time ul li.enable a', function () {
        $('body').addClass('has-change');
        $('#date-time .time ul li').removeClass('active');
        $(this).parent().addClass('active');
        $('#publishHour').val($(this).text());
        return false;
    });
    $('#content-wrap').on('click', '#epcurate-info #name', function () {
        $('.form-btn .notice').addClass('hide');
    });
});

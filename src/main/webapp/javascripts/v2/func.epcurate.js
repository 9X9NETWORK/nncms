/*jslint browser: true, nomen: true, unparam: true */
/*global $, nn, cms, SWFUpload */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.chkPublishData = function (fm, src) {
        fm.name.value = $.trim(fm.name.value);
        fm.intro.value = $.trim(fm.intro.value);
        fm.imageUrl.value = $.trim(fm.imageUrl.value);
        if (fm.imageUrl && fm.imageUrlOld && fm.imageUrl.value !== fm.imageUrlOld.value) {
            $('body').addClass('has-change');
        }
        if ('' === fm.name.value || $('input[name=status]:checked').length <= 0 || ('24:00' === $('#publishHour').val() && ($('#status_scheduled').is(':checked') || $('#rerun_y').is(':checked')))) {
            $('.form-btn .notice').removeClass('hide');
            return false;
        }
        $('.form-btn .notice').addClass('hide');
        $('.img-upload-func .upload-notice').addClass('hide');
        return true;
    };

    $page.setFormWidth = function () {
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
                    $('#img-list-new-tmpl-item').tmpl({
                        imageUrl: url,
                        name: ''
                    }).prependTo('#thumbnail-list ul');
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

    $page.updateHour = function () {
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
        $.datepicker.setDefaults($.datepicker.regional[cms.global.USER_DATA.lang]);

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
    };

    $page.switchPublishStatus = function (flag, name) {
        if ('scheduled' === flag) {
            $('#date-time').removeClass('hide');
            $page.updateHour();
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
    };

    $page.switchRerunCheckbox = function () {
        if (!$('#schedule-rerun-label').hasClass('hide')) {
            if ($('input[name=rerun]').is(':checked')) {
                $('input[name=status]').prop('checked', false);
                $('input[name=status]').parents('label').removeClass('checked');
                $.uniform.update('input[name=status]');
                $('#status_published').prop('checked', true);
                $('#status_published').parents('label').addClass('checked');
                $.uniform.update('#status_published');
                $('#date-time').removeClass('hide');
                $page.updateHour();
            } else {
                $('#date-time').addClass('hide');
            }
        }
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: epcurate-publish',
            options: options
        }, 'debug');

        $common.fadeEpcurateHeaderAndFooter();
        var crumb = $common.rebuildCrumbAndParam(),
            fm = document.epcurateForm,
            eid = fm.id.value,
            cid = fm.channelId.value,
            scheduleDateTime = '',
            tomorrow = '';
        if (!eid || !crumb.id) {
            if (crumb.channelId) {
                $('#form-btn-leave').data('gobackUrl', $('#epcurate-nav-curation').attr('href'));
            }
            $common.showSystemErrorOverlayAndHookError('Invalid episode ID, please try again.');
            return;
        }
        nn.api('GET', cms.reapi('/api/episodes/{episodeId}', {
            episodeId: $('#id').val()
        }), null, function (episode) {
            if (cid > 0 && parseInt(cid, 10) !== episode.channelId) {
                $common.showSystemErrorOverlayAndHookError('You are not authorized to edit this episode.');
                return;
            }
            $('#channelId').val(episode.channelId);
            nn.api('GET', cms.reapi('/api/users/{userId}/channels', {
                userId: cms.global.USER_DATA.id
            }), null, function (data) {
                var channelIds = [];
                if (data.length > 0) {
                    $.each(data, function (i, list) {
                        channelIds.push(list.id);
                    });
                }
                if (-1 === $.inArray(parseInt(episode.channelId, 10), channelIds)) {
                    $common.showSystemErrorOverlayAndHookError('You are not authorized to edit episodes in this channel.');
                    return;
                }
                nn.api('GET', cms.reapi('/api/channels/{channelId}', {
                    channelId: episode.channelId
                }), null, function (channel) {
                    if (channel.contentType === cms.config.YOUR_FAVORITE) {
                        $common.showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                        return;
                    }
                    $common.showProcessingOverlay();
                    $('#epcurateForm .constrain').html('');
                    $('#epcurate-form-tmpl').tmpl(episode, {
                        publishLabel: (true === episode.isPublic) ? 'Published' : 'Publish Now'
                    }).appendTo('#epcurateForm .constrain');
                    $page.setFormWidth();
                    if ($('#uploadThumbnail').length > 0) {
                        $page.uploadImage();
                    }
                    $('#origin_status').val('Draft');
                    $('#status_draft').prop('checked', true);
                    $('p.radio-list input').uniform();
                    if (true === episode.isPublic) {
                        $('#origin_status').val('Published');
                        $('p.radio-list').removeClass('draft');
                        $('#schedule-publish-label').addClass('hide');
                        $('#schedule-publish').addClass('hide');
                        $('#schedule-rerun-label').removeClass('hide');
                        $('#schedule-rerun').removeClass('hide');
                        $('#status_published').prop('checked', true);
                    } else {
                        $('p.radio-list').addClass('draft');
                        $('#schedule-publish-label').removeClass('hide');
                        $('#schedule-publish').removeClass('hide');
                        $('#schedule-rerun-label').addClass('hide');
                        $('#schedule-rerun').addClass('hide');
                    }
                    if (episode.scheduleDate) {
                        if (true === episode.isPublic) {
                            $('#origin_status').val('Scheduled to rerun');
                            $('#rerun_y').prop('checked', true);
                        } else {
                            $('#origin_status').val('Scheduled to publish');
                            $('#status_scheduled').prop('checked', true);
                        }
                        scheduleDateTime = $common.formatTimestamp(episode.scheduleDate, '/', ':').split(' ');
                        $('#publishDate').val(scheduleDateTime[0]);
                        $('#publishHour').val(scheduleDateTime[1]);
                    } else {
                        // default schedule
                        tomorrow = new Date((new Date()).getTime() + (24 * 60 * 60 * 1000));
                        $('#publishDate').val(tomorrow.getFullYear() + '/' + (tomorrow.getMonth() + 1) + '/' + tomorrow.getDate());
                        $('#publishHour').val('20:00');
                    }
                    $page.switchPublishStatus($('input[name=status]:checked').val(), $('input[name=status]:checked').attr('name'));
                    $page.switchRerunCheckbox();
                    $.uniform.update();
                    nn.api('GET', cms.reapi('/api/episodes/{episodeId}/programs', {
                        episodeId: $('#id').val()
                    }), null, function (programs) {
                        $('#img-list').html('');
                        $('#img-list-tmpl-item').tmpl(programs).appendTo('#img-list');
                        if ('' !== episode.imageUrl) {
                            var hasMatch = false;
                            $('#imageUrl').val(episode.imageUrl);
                            $('#imageUrlOld').val(episode.imageUrl);
                            $('#img-list li').each(function () {
                                if (episode.imageUrl === $(this).children('.img').children('img').attr('src')) {
                                    hasMatch = true;
                                    $(this).clone().prependTo('#img-list');
                                    $(this).remove();
                                }
                            });
                            if (!hasMatch) {
                                $('#img-list-new-tmpl-item').tmpl({
                                    imageUrl: episode.imageUrl,
                                    name: episode.name
                                }).prependTo('#img-list');
                            }
                        }
                        $('#thumbnail-list ul').cycle({
                            fx: 'scrollHorz',
                            prev: '#thumbnail-list .img-prev',
                            next: '#thumbnail-list .img-next',
                            speed: 1000,
                            timeout: 0,
                            cleartypeNoBg: true,
                            before: function () {
                                $('body').addClass('has-change');                   // NOTE: must to remove change hook after first load
                                $('#imageUrl').val($('img', this).attr('src'));
                            }
                        });
                        $('#epcurate-nav-curation, #form-btn-save, #form-btn-back').click(function (e) {
                            $(fm).trigger('submit', e);
                            return false;
                        });
                        $('body').removeClass('has-change');                        // NOTE: remove change hook after first load
                        $('#overlay-s').fadeOut();
                    });
                });
            });
        });
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('epcurate-publish')));
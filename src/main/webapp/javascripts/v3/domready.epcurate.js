/*jslint browser: true, nomen: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['epcurate-publish'],
        $common = cms.common;

    $page.setFormWidth();
    $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
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
            $common.showUnsaveOverlay();
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
            $common.showUnsaveOverlay();
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

    // uniform
    $('#content-wrap').on('click', 'input[name=status]', function () {
        $page.switchPublishStatus($(this).val(), $(this).attr('name'));
    });
    $('#content-wrap').on('click', 'input[name=rerun]', function () {
        $page.switchRerunCheckbox();
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

    // save
    $('#epcurateForm').submit(function (e, src) {
        // Episode Curation - Publish
        if ($(e.target).hasClass('publish') && $page.chkPublishData(this, src)) {
            if ($('#id').val() > 0) {
                var nextstep = 'episode-list.html?id=' + $('#channelId').val(),
                    status_params = {},
                    origin_status = $('#origin_status').val(),
                    params = null;
                $common.showSavingOverlay();
                // save to api
                if (!$('body').hasClass('has-change')) {
                    $('#overlay-s').fadeOut('fast', function () {
                        // redirect
                        $('body').removeClass('has-change');
                        if (!src || (src && 'form-btn-save' === $(src.target).attr('id'))) {
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
                nn.api('PUT', cms.reapi('/api/episodes/{episodeId}', {
                    episodeId: $('#id').val()
                }), params, function (episode) {
                    $('#overlay-s').fadeOut('fast', function () {
                        // redirect
                        $('body').removeClass('has-change');
                        $('#imageUrlOld').val(episode.imageUrl);
                        if (!src || (src && 'form-btn-save' === $(src.target).attr('id'))) {
                            if ($('#status_published').is(':checked')) {
                                // UI for Published
                                $('p.radio-list').removeClass('draft');
                                $('#schedule-publish-label').addClass('hide');
                                $('#schedule-publish').addClass('hide');
                                $('#schedule-rerun-label').removeClass('hide');
                                $('#schedule-rerun').removeClass('hide');
                                $('#publish-label').text(nn._([cms.global.PAGE_ID, 'epcurate-form', 'Published']));
                            } else {
                                $('#publish-label').text(nn._([cms.global.PAGE_ID, 'epcurate-form', 'Publish Now']));
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
                                $common.showPublishNoticeOverlay();
                            } else if ($('body').hasClass('unpublish-notice')) {
                                $common.showUnpublishNoticeOverlay();
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
                            $common.showPublishNoticeOverlay();
                        } else if ($('body').hasClass('unpublish-notice')) {
                            $common.showUnpublishNoticeOverlay();
                        } else {
                            location.href = nextstep;
                        }
                    });
                });
            }
        }
        return false;
    });

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $page.setFormWidth();
        $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        if ('none' === $('#main-wrap-slider').css('display')) {
            $('#main-wrap-slider .slider-vertical').slider('destroy');
            $('#main-wrap-slider .slider-vertical').slider();
            $('#main-wrap-slider').hide();
            $('#content-main-wrap').css('top', '0');
        }
    });
});
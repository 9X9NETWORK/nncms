/*jslint browser: true, nomen: true, unparam: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms.index,
        $common = cms.common;

    $page.setFormHeight();
    $common.autoHeight();
    $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');

    // common unblock
    $('body').keyup(function (e) {
        if (27 === e.which) { // Esc
            $.unblockUI();
            $('#channel-list li').removeClass('deleting').removeData('deleteId');
            return false;
        }
    });
    $(document).on('click', '.unblock, .btn-close, .btn-no', function () {
        $.unblockUI();
        $('#channel-list li').removeClass('deleting').removeData('deleteId');
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
    $(document).on('click', '#header #logo, #header a, #studio-nav a, #content-nav a, #footer a, #channel-list a', function (e) {
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
            location.href = 'index.html';
        }
        return false;
    });

    // channel list sorting
    $('#title-func').on('click', 'p.order a.reorder', function () {
        $(this).text(nn._([cms.global.PAGE_ID, 'title-func', 'Save order'])).removeClass('reorder').addClass('save');
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
            $common.showSavingOverlay();
            nn.api('PUT', cms.reapi('/api/users/{userId}/channels/sorting', {
                userId: cms.global.USER_DATA.id
            }), parameter, function (data) {
                $('#overlay-s').fadeOut(1000, function () {
                    $this.text(nn._([cms.global.PAGE_ID, 'title-func', 'Reorder channels'])).removeClass('save').addClass('reorder');
                    $('#channel-list').sortable('disable');
                    $('body').removeClass('has-change');
                });
            });
        } else {
            $this.text(nn._([cms.global.PAGE_ID, 'title-func', 'Reorder channels'])).removeClass('save').addClass('reorder');
            $('#channel-list').sortable('disable');
            $('body').removeClass('has-change');
        }
        return false;
    });

    // channel list delete
    $('#channel-list').on('click', '.enable a.del', function () {
        $(this).parents('li').addClass('deleting').data('deleteId', $(this).attr('rel'));
        $common.showDeletePromptOverlay('Are you sure you want to delete this channel? All data will be removed permanently.');
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#channel-list li.deleting').length > 0 && $('#channel-list li.deleting').data('deleteId')) {
            $common.showSavingOverlay();
            nn.api('DELETE', cms.reapi('/api/users/{userId}/channels/{channelId}', {
                userId: cms.global.USER_DATA.id,
                channelId: $('#channel-list li.deleting').data('deleteId')
            }), null, function (data) {
                if ('OK' === data) {
                    $('#overlay-s').fadeOut(1000, function () {
                        var cntChannel = $('#channel-counter').text();
                        if (cntChannel > 0) {
                            $('#channel-counter').text(cntChannel - 1);
                        }
                        $('#channel-list li.deleting').remove();
                        $('#content-main-wrap').height($('#content-main-wrap').height() - 105); // 105: li height
                        $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                    });
                } else {
                    $('#overlay-s').fadeOut(0, function () {
                        nn.log('Delete error', 'error');
                    });
                }
            });
        } else {
            nn.log('Nothing to delete', 'error');
        }
        return false;
    });

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $page.setFormHeight();
        $common.autoHeight();
        $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        if ('none' === $('#main-wrap-slider').css('display')) {
            $('#main-wrap-slider .slider-vertical').slider('destroy');
            $('#main-wrap-slider .slider-vertical').slider();
            $('#main-wrap-slider').hide();
            $('#content-main-wrap').css('top', '0');
        }
    });
});
/*jslint browser: true, nomen: true, unparam: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.setFormHeight = function () {
        $('#content-main-wrap').height('auto');

        var channelListWidth = $('#channel-list').width(),
            imgsWidth = $('#channel-list li .wrap .photo-list').width(),
            funcWidth = $('#channel-list li .wrap .func-wrap').width(),
            titleFuncHeight = $('#title-func').height();

        $('#content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + titleFuncHeight + 38); // 38: title-func padding
        $('#channel-list li .wrap').width(channelListWidth - 36);
        $('#channel-list li .wrap .info').width(channelListWidth - imgsWidth - funcWidth - 58 - 15);
    };

    $page.showCreateChannelTutorial = function () {
        $('#lightbox-create-channel').remove();
        $('#lightbox-create-channel-tmpl').tmpl().prependTo('body');
        $('.blockOverlay').height($(window).height() - 45);
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#lightbox-create-channel')
        });
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: index',
            options: options
        }, 'debug');

        var pageId = cms.global.PAGE_ID;
        if (cms.global.USER_DATA.id) {
            $common.showProcessingOverlay();
            nn.api('GET', cms.reapi('/api/users/{userId}/channels', {
                userId: cms.global.USER_DATA.id
            }), null, function (channels) {
                var cntChannel = channels.length,
                    hasFavoriteChannel = false,
                    items = [],
                    temp = [];
                $('#title-func').html('');
                $('#title-func-tmpl').tmpl(null, {
                    cntChannel: cntChannel
                }).appendTo('#title-func');
                if (cntChannel > 0) {
                    $.each(channels, function (i, channel) {
                        temp = [];
                        channel.moreImageUrl_1 = cms.config.CHANNEL_DEFAULT_IMAGE;
                        channel.moreImageUrl_2 = cms.config.CHANNEL_DEFAULT_IMAGE2;
                        channel.moreImageUrl_3 = cms.config.CHANNEL_DEFAULT_IMAGE2;
                        if (channel.contentType !== cms.config.YOUR_FAVORITE) {
                            if (channel.imageUrl && '' !== $.trim(channel.imageUrl) && channel.imageUrl !== cms.config.EPISODE_DEFAULT_IMAGE) {
                                channel.moreImageUrl_1 = channel.imageUrl;
                            }
                            if (cms.config.CHANNEL_DEFAULT_IMAGE === channel.moreImageUrl_1) {
                                channel.moreImageUrl_1 = 'images/ch_default.png';
                            }
                            if (channel.moreImageUrl && '' !== $.trim(channel.moreImageUrl)) {
                                temp = channel.moreImageUrl.split('|');
                                if (temp[0] && temp[0] !== cms.config.EPISODE_DEFAULT_IMAGE) {
                                    channel.moreImageUrl_2 = temp[0];
                                }
                            }
                            items.push(channel);
                        }
                    });
                    $('#channel-list').html('');
                    $('#channel-list-tmpl-item').tmpl(items, {
                        userId: cms.global.USER_DATA.id
                    }).appendTo('#channel-list');
                    // channel list sorting
                    $('#channel-list').sortable({
                        cursor: 'move',
                        revert: true,
                        change: function (event, ui) {
                            $('body').addClass('has-change');
                        }
                    });
                    $('#channel-list').sortable('disable');
                }
                if (cntChannel <= 0 || (1 === cntChannel && hasFavoriteChannel)) {
                    if (!$.cookie('cms-cct')) {
                        $.cookie('cms-cct', 'seen');
                        $page.showCreateChannelTutorial();
                    }
                }
                $page.setFormHeight();
                $common.autoHeight();
                $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                $('#overlay-s').fadeOut();
            });
        } else {
            location.href = '../';
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('index')));
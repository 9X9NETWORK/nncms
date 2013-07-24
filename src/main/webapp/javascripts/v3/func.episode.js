/*jslint nomen: true, unparam: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.setEpisodeWidth = function () {
        //var wrapWidth = $('#content-main-wrap').width(),
        //    contentmainWidth = $('#content-main').width(),
        //    crumbWidth = $('#title-func .title-crumb').width(),
        //    titleBtnsWidth = $('#title-func ul').width(),
        //    scheduledWidth = $('#ep-list ul li .scheduled-time').width(),
        //    publishWidth = $('#ep-list ul li .publish-time').width(),
        //    viewsWidth = $('#ep-list ul li .views').width(),
        //    numberWidth = $('#ep-list ul li .number').width() + 20; // 20 ix padding

        // set min size
        //if (numberWidth < 50) {
        //    numberWidth = 50;
        //}
        //$('#ep-list ul li .wrap, #title-func .caption').width(wrapWidth - 31 - 1);  // 1:border
        //$('#ep-list ul li .episode, #title-func .caption  p.episode').width(wrapWidth - 31 - numberWidth - scheduledWidth - publishWidth - viewsWidth - 1);   // 1:border
        //$('#ep-list ul li .number').width(numberWidth - 20);    // 20 is padding
        //if ($('#ep-list ul li .episode').length > 0 && $('#channel-name').data('width') + crumbWidth + 10 > contentmainWidth - titleBtnsWidth) {  // 10: title-func padding
        //    $('#title-func h2').width(contentmainWidth - titleBtnsWidth - 10 - 15);  // 10: title-func padding, 15: channel name and btns space
        //    $('#channel-name').width($('#title-func h2').width() - crumbWidth - 6);  // 6: channel name margin
        //} else {
        //    $('#title-func h2').width('auto');
        //    $('#channel-name').width('auto');
        //}
    };

    $page.setPageScroll = function (isDown) {
        var eplHeightBefore = $('#content-main-wrap').height(),
            sliderValue = $('#main-wrap-slider' + ' .slider-vertical').slider('value'),
            iPos = 0,
            eplHeightAfter = 0,
            newPos = 0,
            tmpPos = 0;

        // if haven't scroll bar need it to init sliderValue
        if (typeof sliderValue === 'object') {
            sliderValue = 100;
        }
        iPos = eplHeightBefore * (sliderValue / cms.global.SLIDER_MAX);
        $common.autoHeight();   // after this run the height will be update
        eplHeightAfter = $('#content-main-wrap').height();
        $('#content-main-wrap').perfectScrollbar('update');
        // $common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
        if ('none' === $('#main-wrap-slider').css('display')) {
            $('#main-wrap-slider .slider-vertical').slider('destroy');
            $('#main-wrap-slider .slider-vertical').slider();
            $('#main-wrap-slider').hide();
            $('#content-main-wrap').css('top', '0');
        }
        newPos = cms.global.SLIDER_MAX;
        // translate new postion
        if (eplHeightAfter > eplHeightBefore) {
            tmpPos = eplHeightAfter - eplHeightBefore;
            newPos = parseInt(((iPos + tmpPos) / eplHeightAfter) * cms.global.SLIDER_MAX, 10);
        } else {
            // remove episode list
            tmpPos = eplHeightAfter - eplHeightBefore;
            if (isDown !== 'down') {
                iPos = iPos + tmpPos;
            }
            newPos = parseInt((iPos / eplHeightAfter) * cms.global.SLIDER_MAX, 10);
        }
        $('#main-wrap-slider .slider-vertical').slider('value', newPos);
    };

    $page.afterDelete = function (inID) {
        $.each(cms.global.EPISODES_PAGING, function (eKey, eValue) {
            $.each(eValue, function (eeKey, eeValue) {
                if (parseInt(inID, 10) === eeValue.id) {
                    cms.global.EPISODES_PAGING[eKey].splice(eeKey, 1);
                    return false;
                }
            });
        });
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: episode-list',
            options: options
        }, 'debug');

        var pageId = cms.global.PAGE_ID,
            id = cms.global.USER_URL.param('id');
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
                    $common.showSystemErrorOverlayAndHookError('You are not authorized to edit episodes in this channel.');
                    return;
                }
                if (options && options.init) {
                    $common.showProcessingOverlay();
                }
                nn.api('GET', cms.reapi('/api/channels/{channelId}', {
                    channelId: id
                }), null, function (channel) {
                    $('#func-nav ul').html('');
                    $('#func-nav-tmpl').tmpl(channel).appendTo('#func-nav ul');
                    if (channel.contentType === cms.config.YOUR_FAVORITE) {
                        nn.api('GET', cms.reapi('/api/users/{userId}/my_favorites', {
                            userId: cms.global.USER_DATA.id
                        }), null, function (favorites) {
                            var cntEpisode = favorites.length;
                            channel.name = cms.global.USER_DATA.name + nn._([pageId, 'title-func', "'s Favorite"]);
                            $('#title-func').html('');
                            $('#title-func-tmpl').tmpl(channel, {
                                cntEpisode: cntEpisode
                            }).appendTo('#title-func');
                            $('#channel-name').data('width', $('#channel-name').width());
                            $('#content-main-wrap .constrain').html('');
                            if (cntEpisode > 0) {
                                $('#episode-favorite-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                                $('#episode-favorite-list-tmpl-item').tmpl(favorites).appendTo('#episode-list');
                            } else {
                                $('#episode-favorite-first-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                            }
                            $page.setEpisodeWidth();
                            $('#content-main-wrap').perfectScrollbar('update');
                            //$common.autoHeight();
                            //$common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                            $('#overlay-s').fadeOut();
                        });
                    } else {
                        nn.api('GET', cms.reapi('/api/channels/{channelId}/episodes', {
                            channelId: id
                        }), null, function (episodes) {
                            var cntEpisode = episodes.length,
                                tmpCntEpisode = cntEpisode,
                                tmpEpisodes = [],
                                i = 0,
                                cntPage = 0,
                                iPageSize = 30,
                                cntPageFirstEpisodes = 0,
                                tmpStart = 0,
                                tmpEnd = 0,
                                ii = 0;
                            $('#title-func').html('');
                            $('#title-func-tmpl').tmpl(channel, {
                                cntEpisode: cntEpisode
                            }).appendTo('#title-func');
                            $('#channel-name').data('width', $('#channel-name').width());
                            $('#content-main-wrap .constrain').html('');
                            cms.global.EPISODES_PAGING = [];
                            cms.global.EPISODES_PAGING_INFO = [];
                            if (cntEpisode > 0) {
                                // pagging
                                if (cntEpisode > iPageSize) {
                                    cntPage = parseInt((cntEpisode / iPageSize), 10);
                                    cntPageFirstEpisodes = cntEpisode % iPageSize;
                                    if (cntPage > 1 && cntPageFirstEpisodes === 0) {
                                        cntPage -= 1;
                                        cntPageFirstEpisodes = 30;
                                    }
                                    tmpEpisodes = [];
                                    for (i = 0; i < cntPageFirstEpisodes; i += 1) {
                                        episodes[i].seq = tmpCntEpisode - i;
                                        tmpEpisodes.push(episodes[i]);
                                    }
                                    cms.global.EPISODES_PAGING.push(tmpEpisodes);
                                    cms.global.EPISODES_PAGING_INFO.push({
                                        'pageID': 0,
                                        'pageStart': tmpCntEpisode,
                                        'pageEnd': (tmpCntEpisode - cntPageFirstEpisodes + 1)
                                    });
                                    for (i = 0; i < cntPage; i += 1) {
                                        tmpEpisodes = [];
                                        tmpStart = i * iPageSize + cntPageFirstEpisodes;
                                        tmpEnd = tmpStart + iPageSize;
                                        ii = 0;
                                        for (ii = tmpStart; ii < tmpEnd; ii += 1) {
                                            // serial DESC
                                            episodes[ii].seq = cntEpisode - ii;
                                            tmpEpisodes.push(episodes[ii]);
                                        }
                                        cms.global.EPISODES_PAGING.push(tmpEpisodes);
                                        cms.global.EPISODES_PAGING_INFO.push({
                                            'pageID': (i + 1),
                                            'pageStart': (tmpCntEpisode - tmpStart),
                                            'pageEnd': (tmpCntEpisode - tmpEnd + 1)
                                        });
                                    }
                                } else {
                                    tmpEpisodes = [];
                                    for (i = 0; i < cntEpisode; i += 1) {
                                        // the number srilal is DESC
                                        episodes[i].seq = cntEpisode - i;
                                        tmpEpisodes.push(episodes[i]);
                                    }
                                    cms.global.EPISODES_PAGING.push(tmpEpisodes);
                                }

                                $('#episode-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                                $('#episode-list-tmpl-item').tmpl(cms.global.EPISODES_PAGING[0]).appendTo('#episode-list');
                                // folder list
                                $('#episode-list-tmpl-folder').tmpl(cms.global.EPISODES_PAGING_INFO).appendTo('#episode-list');
                                // episode list sorting
                                $('#episode-list').sortable({
                                    cursor: 'move',
                                    revert: true,
                                    cancel: '.isFolder',
                                    change: function (event, ui) {
                                        $('body').addClass('has-change');
                                    }
                                });
                                $('#episode-list').sortable('disable');
                            } else {
                                $('#episode-first-tmpl').tmpl({
                                    id: id
                                }).appendTo('#content-main-wrap .constrain');
                                // episode first cycle
                                $('#selected-episode p.episode-pager').html('');
                                $('#selected-episode .wrapper ul.content').cycle({
                                    pager: '.episode-pager',
                                    activePagerClass: 'active',
                                    updateActivePagerLink: null,
                                    fx: 'scrollHorz',
                                    speed: 1000,
                                    timeout: 6000,
                                    pagerEvent: 'mouseover',
                                    pause: 1,
                                    cleartypeNoBg: true
                                });
                            }
                            $page.setEpisodeWidth();
                            $('#content-main-wrap').perfectScrollbar('update');
                            //$common.autoHeight();
                            //$common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                            $('#overlay-s').fadeOut();

                            // sharing url
                            nn.api('GET', cms.reapi('/api/channels/{channelId}/autosharing/validBrands', {
                                channelId: id
                            }), null, function (cBrands) {
                                var tmpBrand = [{
                                    brand: cBrands[0].brand
                                }];
                                $('#get-url-part-tmpl').tmpl(cBrands, {
                                    li_sel: cBrands[0].brand
                                }).appendTo('#tmpHtml2');
                                $('#tmpHtml').html('');
                                $('#get-url-tmpl').tmpl(tmpBrand, {
                                    li_items: $('#tmpHtml2').html()
                                }).appendTo('#tmpHtml');
                                $('div.get-url').each(function () {
                                    $(this).children().remove();
                                    $(this).append($('#tmpHtml').html());
                                });
                            });
                        });
                    }
                });
            });
        } else if ('' !== id && parseInt(id, 10) === 0 && cms.global.USER_DATA.id) {
            // for fake favorite channel
            if (options && options.init) {
                $common.showProcessingOverlay();
            }
            nn.api('GET', cms.reapi('/api/users/{userId}/my_favorites/fake', {
                userId: cms.global.USER_DATA.id
            }), null, function (favorites) {
                var cntEpisode = favorites.length,
                    channel = {
                        contentType: cms.config.YOUR_FAVORITE,
                        name: cms.global.USER_DATA.name + nn._([pageId, 'title-func', "'s Favorite"])
                    };
                $('#func-nav ul').html('');
                $('#func-nav-tmpl').tmpl(channel).appendTo('#func-nav ul');
                $('#title-func').html('');
                $('#title-func-tmpl').tmpl(channel, {
                    cntEpisode: cntEpisode
                }).appendTo('#title-func');
                $('#channel-name').data('width', $('#channel-name').width());
                $('#content-main-wrap .constrain').html('');
                if (cntEpisode > 0) {
                    $('#episode-favorite-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                    $('#episode-favorite-list-tmpl-item').tmpl(favorites).appendTo('#episode-list');
                } else {
                    $('#episode-favorite-first-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                }
                $page.setEpisodeWidth();
                $('#content-main-wrap').perfectScrollbar('update');
                //$common.autoHeight();
                //$common.scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                $('#overlay-s').fadeOut();
            });
        } else {
            $common.showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
            return;
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('episode-list')));
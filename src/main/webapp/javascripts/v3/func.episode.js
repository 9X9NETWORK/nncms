/*jslint nomen: true, unparam: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.epYoutubeCheck = function (inID) {

        function _getEpisodeProgram(episodeId) {
            var deferred = $.Deferred();

            nn.api('GET', cms.reapi('/api/episodes/{episodeId}/programs', {
                episodeId: episodeId
            }), null, function (programs) {
                deferred.resolve(programs);
            });
            return deferred.promise();
        }

        function _getYoutubes(ytVideo) {
            var deferred = $.Deferred();

            nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + ytVideo.slice(-11) + '?alt=jsonc&v=2&callback=?', null, function (youtubes) {
                deferred.resolve(youtubes);
            }, 'jsonp');
            return deferred.promise();
        }

        function _showResult(showData) {
            var errMsg = "",
                errIcon = "ok",
                errCount = showData.err + showData.warn;

            if (errCount > 0) {
                if (showData.err === 0 && showData.warn > 0) {
                    errIcon = "warn";
                } else {
                    errIcon = "error";
                }
                if (1 === errCount) {
                    errMsg += nn._([cms.global.PAGE_ID, 'episode-list', "Find ? video has problem."], [errCount]);
                } else {
                    errMsg += nn._([cms.global.PAGE_ID, 'episode-list', "Find ? videos have problem."], [errCount]);
                }
            }
            if ("ok" === errIcon) {
                errMsg += nn._([cms.global.PAGE_ID, 'episode-list', "No video has problem"]);
            }

            $("#yuchk-btn-" + inID).removeClass().addClass(errIcon);
            $("#yuchk-msg-" + inID).text(errMsg);

            $('#overlay-s').fadeOut();
        }

        function _chkProgramVideo(programs) {
            var deferred = $.Deferred(),
                videoList = [],
                chkResoult = {
                    cntList: 0,
                    nnCount: 0,
                    isOk: 0,
                    warn: 0,
                    err: 0
                },
                // isPrivateVideo = null,
                // isZoneLimited = null,
                // hasSyndicateDenied = null,
                // hasLimitedSyndication = null,
                // isSyndicateLimited = null,
                // isEmbedLimited = null,
                // isUnplayableVideo = null,
                invalidList = [],
                // committedCnt = 0,
                ytData = null;

            $.each(programs, function (eKey, eValue) {
                videoList.push(eValue.fileUrl);
            });

            chkResoult.cntList = videoList.length;

            $.each(videoList, function (idx, itemVideo) {
                nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                    // committedCnt += 1;
                    invalidList.push(itemVideo);
                });
                // if (idx === 0) { // 測試用
                //     itemVideo = "http://www.youtube.com/watch?v=WwY15T5EEpG";
                // }
                $.when(_getYoutubes(itemVideo))
                    .then(function (youtubes) {
                        var ytCheck = null;

                        if (youtubes.data) {
                             ytCheck = cms.youtubeUtility.checkVideoValidity(youtubes);
                            if (ytCheck.isZoneLimited || ytCheck.isEmbedLimited || ytCheck.isSyndicateLimited || ytCheck.isUnplayableVideo) {
                                // unplayable = true;
                                chkResoult.warn += 1;
                            } else {
                                // unplayable = false;
                                chkResoult.isOk += 1;
                            }

                        } else {
                            chkResoult.err += 1;
                        }
                        chkResoult.nnCount += 1;
                        if (chkResoult.nnCount === chkResoult.cntList) {
                            deferred.resolve(chkResoult);
                        }

                    });

            });
            return deferred.promise();
        }

        _getEpisodeProgram(inID)
            .then(_chkProgramVideo)
            .then(_showResult);

    };

    $page.setPageScroll = function (isDown) {
        $('#content-main-wrap').perfectScrollbar('update');
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

        var id = cms.global.USER_URL.param('id');
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
                    if (channel.contentType !== cms.config.YOUR_FAVORITE) {
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

                                $('#content-main-wrap').perfectScrollbar({marginTop: 50, marginBottom: 60});

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

                                $('#content-main-wrap').perfectScrollbar({marginTop: 20, marginBottom: 60});
                            }

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
        } else {
            $common.showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
            return;
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('episode-list')));
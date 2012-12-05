/* predefine global variables here: jQuery nn CMS_CONF $ alert location autoHeight scrollbar window document setTimeout sumStoryboardInfo setFormWidth setSpace setEpisodeWidth showProcessingOverlay showSystemErrorOverlayAndHookError formatTimestamp updateHour switchPublishStatus switchRerunCheckbox setFormHeight uploadImage */
/*jslint eqeq: true, regexp: true, unparam: true, sloppy: true, todo: true, vars: true, nomen: true */
nn.initialize();
nn.debug(CMS_CONF.IS_DEBUG);
nn.on(400, function (jqXHR, textStatus) {
    if (CMS_CONF.IS_DEBUG) {
        alert(textStatus + ': ' + jqXHR.responseText);
    }
    location.replace('index.html');
});
nn.on(401, function (jqXHR, textStatus) {
    location.href = '../';
});
nn.on(403, function (jqXHR, textStatus) {
    location.replace('index.html');
});
nn.on(404, function (jqXHR, textStatus) {
    // nothing to do
});
nn.on(500, function (jqXHR, textStatus) {
    if (CMS_CONF.IS_DEBUG) {
        alert(textStatus + ': ' + jqXHR.responseText);
    }
});

function buildEpcurateCuration(pageId, fm, crumb) {
    nn.log(crumb, 'debug');
    var eid = fm.id.value,
        cid = fm.channelId.value;
    $('#cur-add textarea').val(nn._([CMS_CONF.PAGE_ID, 'add-video', 'Paste YouTube video URLs to add (separate with different lines)']));
    $('#cur-add textarea').toggleVal();
    if ('' == eid && '' == cid) {
        showSystemErrorOverlayAndHookError('Invalid channel ID and episode ID, please try again.');
        return;
    }
    if ('' == eid) {
        // insert mode: data from cookie
        if (!crumb.name || '' == $.trim(crumb.name)) {
            crumb.name = 'New episode';
        }
        if (cid > 0 && !isNaN(cid) && CMS_CONF.USER_DATA.id) {
            nn.api('GET', CMS_CONF.API('/api/users/{userId}/channels', {userId: CMS_CONF.USER_DATA.id}), null, function (data) {
                var channelIds = [];
                if (data.length > 0) {
                    $.each(data, function (i, list) {
                        channelIds.push(list.id);
                    });
                }
                if (-1 === $.inArray(parseInt(cid, 10), channelIds)) {
                    showSystemErrorOverlayAndHookError('You are not authorized to edit episodes in this channel.');
                    return;
                }
                nn.api('GET', CMS_CONF.API('/api/channels/{channelId}', {channelId: cid}), null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                        return;
                    }
                    showProcessingOverlay();
                    $('#epcurate-info').remove();
                    $('#epcurate-info-tmpl').tmpl(crumb).prependTo('#epcurateForm');
                    $('.storyboard-info').html($('#storyboard-info-tmpl').tmpl({
                        chName: channel.name,
                        epName: crumb.name
                    }));
                    $('#epcurate-nav-publish, #form-btn-save, #form-btn-next').click(function (e) {
                        $(fm).trigger('submit', e);
                        return false;
                    });
                    setSpace();
                    scrollbar('#storyboard-wrap', '#storyboard-list', '#storyboard-slider');
                    $('#overlay-s').fadeOut();
                });
            });
        } else {
            showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
            return;
        }
    } else {
        // update mode: data from api
        nn.api('GET', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: $('#id').val()}), null, function (episode) {
            if ('' != cid && cid != episode.channelId) {
                showSystemErrorOverlayAndHookError('You are not authorized to edit this episode.');
                return;
            }
            nn.api('GET', CMS_CONF.API('/api/users/{userId}/channels', {userId: CMS_CONF.USER_DATA.id}), null, function (data) {
                var channelIds = [];
                if (data.length > 0) {
                    $.each(data, function (i, list) {
                        channelIds.push(list.id);
                    });
                }
                if (-1 === $.inArray(parseInt(episode.channelId, 10), channelIds)) {
                    showSystemErrorOverlayAndHookError('You are not authorized to edit episodes in this channel.');
                    return;
                }
                nn.api('GET', CMS_CONF.API('/api/channels/{channelId}', {channelId: episode.channelId}), null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                        return;
                    }
                    showProcessingOverlay();
                    crumb = $.extend({}, crumb, episode);
                    $('#epcurate-info').remove();
                    $('#epcurate-info-tmpl').tmpl(crumb).prependTo('#epcurateForm');
                    $('.storyboard-info').html($('#storyboard-info-tmpl').tmpl({
                        chName: channel.name,
                        epName: episode.name
                    }));
                    // merge 9x9 api and youtube api (ytId, ytDuration, uploader, uploadDate, isZoneLimited, isMobileLimited, isEmbedLimited)
                    var normalPattern = /^http(?:s)?:\/\/www.youtube.com\/watch\?v=([^&]{11})/,
                        preloadImage = [],
                        programList = [],
                        invalidList = [],
                        ytData = null,
                        ytItem = {},
                        ytList = [],
                        beginTitleCard = null,
                        endTitleCard = null,
                        isZoneLimited = null,
                        isMobileLimited = null,
                        isEmbedLimited = null;
                    nn.api('GET', CMS_CONF.API('/api/episodes/{episodeId}/programs', {episodeId: $('#id').val()}), null, function (programs) {
                        $.each(programs, function (idx, programItem) {
                            if (normalPattern.test(programItem.fileUrl)) {
                                programList.push(programItem);
                            }
                        });
                        $.each(programList, function (idx, programItem) {
                            nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                                invalidList.push(programItem.fileUrl);
                                nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
                                nn.log(programItem.fileUrl, 'debug');
                                $('#videourl').val(invalidList.join('\n'));
                                $('#cur-add .notice').text(nn._([CMS_CONF.PAGE_ID, 'add-video', 'Invalid URL, please try again!'])).removeClass('hide').show();
                                if (idx === (programList.length - 1)) {
                                    // ON PURPOSE to wait api (async)
                                    setTimeout(function () {
                                        if (preloadImage.length > 0) {
                                            $('#preload-image').html('');
                                            $('#preload-image-tmpl-item').tmpl(preloadImage).prependTo('#preload-image');
                                        }
                                        $('#storyboard-listing').html('');
                                        $('#storyboard-listing-tmpl-item').tmpl(ytList).prependTo('#storyboard-listing');
                                        sumStoryboardInfo();
                                        $('.ellipsis').ellipsis();
                                        $('#overlay-s').fadeOut();
                                    }, 1000);
                                }
                            });
                            nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + programItem.fileUrl.slice(-11) + '?alt=jsonc&v=2&callback=?', null, function (youtubes) {
                                nn.api('GET', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: programItem.id}), null, function (title_card) {
                                    beginTitleCard = null;
                                    endTitleCard = null;
                                    if (title_card.length > 0) {
                                        if (title_card[1]) {
                                            if (1 == title_card[1].type) {
                                                beginTitleCard = title_card[0];
                                                endTitleCard = title_card[1];
                                            } else {
                                                beginTitleCard = title_card[1];
                                                endTitleCard = title_card[0];
                                            }
                                        } else {
                                            if (title_card[0]) {
                                                if (0 == title_card[0].type) {
                                                    beginTitleCard = title_card[0];
                                                } else {
                                                    endTitleCard = title_card[0];
                                                }
                                            }
                                        }
                                    }
                                    if (beginTitleCard && beginTitleCard.message && '' != $.trim(beginTitleCard.message)) {
                                        beginTitleCard.message = $.trim(beginTitleCard.message).replace(/\{BR\}/g, '\n');
                                        if (beginTitleCard.bgImage && '' != $.trim(beginTitleCard.bgImage)) {
                                            preloadImage.push({
                                                image: beginTitleCard.bgImage
                                            });
                                        }
                                    } else {
                                        beginTitleCard = null;
                                    }
                                    if (endTitleCard && endTitleCard.message && '' != $.trim(endTitleCard.message)) {
                                        endTitleCard.message = $.trim(endTitleCard.message).replace(/\{BR\}/g, '\n');
                                        if (endTitleCard.bgImage && '' != $.trim(endTitleCard.bgImage)) {
                                            preloadImage.push({
                                                image: endTitleCard.bgImage
                                            });
                                        }
                                    } else {
                                        endTitleCard = null;
                                    }
                                    if (youtubes.data) {
                                        ytData = youtubes.data;
                                        isZoneLimited = (ytData.restrictions) ? true : false;
                                        isMobileLimited = ((ytData.accessControl && ytData.accessControl.syndicate && 'denied' === ytData.accessControl.syndicate) || (ytData.status && ytData.status.reason && 'limitedSyndication' === ytData.status.reason)) ? true : false;
                                        isEmbedLimited = (ytData.accessControl && ytData.accessControl.embed && 'denied' === ytData.accessControl.embed) ? true : false;
                                    } else {
                                        ytData = null;
                                        isZoneLimited = null;
                                        isMobileLimited = null;
                                        isEmbedLimited = null;
                                    }
                                    if (ytData) {
                                        ytItem = {
                                            beginTitleCard: beginTitleCard,
                                            endTitleCard: endTitleCard,
                                            ytId: ytData.id,
                                            fileUrl: programItem.fileUrl,
                                            imageUrl: 'http://i.ytimg.com/vi/' + ytData.id + '/mqdefault.jpg',
                                            //duration: ytData.duration,      // ON PURPOSE to mark this line to keep trimmed duration from 9x9 API
                                            ytDuration: ytData.duration,    // keep original duration from YouTube
                                            name: ytData.title,
                                            intro: ytData.description,
                                            uploader: ytData.uploader,
                                            uploadDate: ytData.uploaded,
                                            isZoneLimited: isZoneLimited,
                                            isMobileLimited: isMobileLimited,
                                            isEmbedLimited: isEmbedLimited
                                        };
                                    } else {
                                        ytItem = {
                                            beginTitleCard: beginTitleCard,
                                            endTitleCard: endTitleCard,
                                            ytId: programItem.fileUrl.slice(-11),
                                            ytDuration: 0,                                                          // fake origin duration (invalid video)
                                            uploader: ((youtubes.error) ? youtubes.error.message : ''),             // fake uploader (error message)
                                            uploadDate: ((youtubes.error) ? (youtubes.error.code + 'T') : ''),      // fake uploadDate (error code)
                                            isZoneLimited: isZoneLimited,
                                            isMobileLimited: isMobileLimited,
                                            isEmbedLimited: isEmbedLimited
                                        };
                                    }
                                    ytItem = $.extend(programItem, ytItem);
                                    ytList[idx] = ytItem;
                                    if (idx === (programList.length - 1)) {
                                        // ON PURPOSE to wait api (async)
                                        setTimeout(function () {
                                            if (preloadImage.length > 0) {
                                                $('#preload-image').html('');
                                                $('#preload-image-tmpl-item').tmpl(preloadImage).prependTo('#preload-image');
                                            }
                                            $('#storyboard-listing').html('');
                                            $('#storyboard-listing-tmpl-item').tmpl(ytList).prependTo('#storyboard-listing');
                                            sumStoryboardInfo();
                                            $('.ellipsis').ellipsis();
                                            $('#overlay-s').fadeOut();
                                        }, 1000);
                                    }
                                });
                            }, 'jsonp');
                        });
                    });
                    $('#epcurate-nav-publish, #form-btn-save, #form-btn-next').click(function (e) {
                        $(fm).trigger('submit', e);
                        return false;
                    });
                    setSpace();
                    scrollbar('#storyboard-wrap', '#storyboard-list', '#storyboard-slider');
                });
            });
        });
    }
}   // end of buildEpcurateCuration()

function buildEpcuratePublish(pageId, fm, crumb) {
    nn.log(crumb, 'debug');
    var eid = fm.id.value,
        cid = fm.channelId.value,
        scheduleDateTime = '',
        tomorrow = '';
    if ('' == eid || !crumb.id) {
        if (crumb.channelId) {
            $('#form-btn-leave').data('gobackUrl', $('#epcurate-nav-curation').attr('href'));
        }
        showSystemErrorOverlayAndHookError('Invalid episode ID, please try again.');
        return;
    }
    nn.api('GET', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: $('#id').val()}), null, function (episode) {
        if ('' != cid && cid != episode.channelId) {
            showSystemErrorOverlayAndHookError('You are not authorized to edit this episode.');
            return;
        }
        nn.api('GET', CMS_CONF.API('/api/users/{userId}/channels', {userId: CMS_CONF.USER_DATA.id}), null, function (data) {
            var channelIds = [];
            if (data.length > 0) {
                $.each(data, function (i, list) {
                    channelIds.push(list.id);
                });
            }
            if (-1 === $.inArray(parseInt(episode.channelId, 10), channelIds)) {
                showSystemErrorOverlayAndHookError('You are not authorized to edit episodes in this channel.');
                return;
            }
            nn.api('GET', CMS_CONF.API('/api/channels/{channelId}', {channelId: episode.channelId}), null, function (channel) {
                if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                    showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                    return;
                }
                showProcessingOverlay();
                $('#epcurateForm .constrain').html('');
                $('#epcurate-form-tmpl').tmpl(episode, {
                    publishLabel: (true === episode.isPublic) ? 'Published' : 'Publish Now'
                }).appendTo('#epcurateForm .constrain');
                setFormWidth();
                // Amazon S3 upload
                if ($('#uploadThumbnail').length > 0) {
                    uploadImage();
                }
                $('#origin_status').val('Draft');
                $('#status_draft').attr('checked', 'checked');
                $('p.radio-list input').uniform();
                if (true === episode.isPublic) {
                    $('#origin_status').val('Published');
                    $('p.radio-list').removeClass('draft');
                    $('#schedule-publish-label').addClass('hide');
                    $('#schedule-publish').addClass('hide');
                    $('#schedule-rerun-label').removeClass('hide');
                    $('#schedule-rerun').removeClass('hide');
                    $('#status_published').attr('checked', 'checked');
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
                        $('#rerun_y').attr('checked', 'checked');
                    } else {
                        $('#origin_status').val('Scheduled to publish');
                        $('#status_scheduled').attr('checked', 'checked');
                    }
                    scheduleDateTime = formatTimestamp(episode.scheduleDate, '/', ':').split(' ');
                    $('#publishDate').val(scheduleDateTime[0]);
                    $('#publishHour').val(scheduleDateTime[1]);
                } else {
                    // default schedule
                    tomorrow = new Date((new Date()).getTime() + (24 * 60 * 60 * 1000));
                    $('#publishDate').val(tomorrow.getFullYear() + '/' + (tomorrow.getMonth() + 1) + '/' + tomorrow.getDate());
                    $('#publishHour').val('20:00');
                }
                switchPublishStatus($('input[name=status]:checked').val());
                switchRerunCheckbox();
                $.uniform.update();
                nn.api('GET', CMS_CONF.API('/api/episodes/{episodeId}/programs', {episodeId: $('#id').val()}), null, function (programs) {
                    $('#img-list').html('');
                    $('#img-list-tmpl-item').tmpl(programs).appendTo('#img-list');
                    if ('' != episode.imageUrl) {
                        var hasMatch = false;
                        $('#imageUrl').val(episode.imageUrl);
                        $('#imageUrlOld').val(episode.imageUrl);
                        $('#img-list li').each(function () {
                            if (episode.imageUrl === $(this).children('img').attr('src')) {
                                hasMatch = true;
                                $(this).clone().prependTo('#img-list');
                                $(this).remove();
                            }
                        });
                        if (!hasMatch) {
                            $('#img-list').prepend('<li class="new"><img src="' + episode.imageUrl + '" alt="' + episode.name + '" /></li>');
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
}   // end of buildEpcuratePublish()

function listEpisode(pageId, id) {
    if (id > 0 && !isNaN(id) && CMS_CONF.USER_DATA.id) {
        nn.api('GET', CMS_CONF.API('/api/users/{userId}/channels', {userId: CMS_CONF.USER_DATA.id}), null, function (data) {
            var channelIds = [];
            if (data.length > 0) {
                $.each(data, function (i, list) {
                    channelIds.push(list.id);
                });
            }
            if (-1 === $.inArray(parseInt(id, 10), channelIds)) {
                showSystemErrorOverlayAndHookError('You are not authorized to edit episodes in this channel.');
                return;
            }
            showProcessingOverlay();
            nn.api('GET', CMS_CONF.API('/api/channels/{channelId}', {channelId: id}), null, function (channel) {
                $('#func-nav ul').html('');
                $('#episode-nav-tmpl').tmpl(channel).appendTo('#func-nav ul');
                if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                    nn.api('GET', CMS_CONF.API('/api/users/{userId}/my_favorites', {userId: CMS_CONF.USER_DATA.id}), null, function (favorites) {
                        var cntEpisode = favorites.length;
                        channel.name = CMS_CONF.USER_DATA.name + nn._([pageId, 'title-func', "'s Favorite"]);
                        $('#title-func').html('');
                        $('#title-func-tmpl').tmpl(channel, { cntEpisode: cntEpisode }).appendTo('#title-func');
                        $('#content-main-wrap .constrain').html('');
                        if (cntEpisode > 0) {
                            $('#episode-favorite-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                            $('#episode-favorite-list-tmpl-item').tmpl(favorites).appendTo('#episode-list');
                        } else {
                            $('#episode-favorite-first-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                        }
                        setEpisodeWidth();
                        autoHeight();
                        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                        $('#overlay-s').fadeOut();
                    });
                } else {
                    nn.api('GET', CMS_CONF.API('/api/channels/{channelId}/episodes', {channelId: id}), null, function (episodes) {
                        var cntEpisode = episodes.length;
                        $('#title-func').html('');
                        $('#title-func-tmpl').tmpl(channel, { cntEpisode: cntEpisode }).appendTo('#title-func');
                        $('#channel-name').data('width', $('#channel-name').width());
                        $('#content-main-wrap .constrain').html('');
                        if (cntEpisode > 0) {
                            $('#episode-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                            $('#episode-list-tmpl-item').tmpl(episodes).appendTo('#episode-list');
                            // episode list sorting
                            $('#episode-list').sortable({
                                cursor: 'move',
                                revert: true,
                                change: function (event, ui) {
                                    $('body').addClass('has-change');
                                }
                            });
                            $('#episode-list').sortable('disable');
                        } else {
                            $('#episode-first-tmpl').tmpl({ id: id }).appendTo('#content-main-wrap .constrain');
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
                        setEpisodeWidth();
                        autoHeight();
                        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                        $('#overlay-s').fadeOut();
                    });
                }
            });
        });
    } else if ('' !== id && id == 0 && !isNaN(id) && CMS_CONF.USER_DATA.id) {
        // for fake favorite channel
        showProcessingOverlay();
        nn.api('GET', CMS_CONF.API('/api/users/{userId}/my_favorites', {userId: CMS_CONF.USER_DATA.id}), null, function (favorites) {
            var cntEpisode = favorites.length;
            var channel = {
                contentType: CMS_CONF.YOUR_FAVORITE,
                name: CMS_CONF.USER_DATA.name + nn._([pageId, 'title-func', "'s Favorite"])
            };
            $('#func-nav ul').html('');
            $('#episode-nav-tmpl').tmpl(channel).appendTo('#func-nav ul');
            $('#title-func').html('');
            $('#title-func-tmpl').tmpl(channel, { cntEpisode: cntEpisode }).appendTo('#title-func');
            $('#content-main-wrap .constrain').html('');
            if (cntEpisode > 0) {
                $('#episode-favorite-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                $('#episode-favorite-list-tmpl-item').tmpl(favorites).appendTo('#episode-list');
            } else {
                $('#episode-favorite-first-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
            }
            setEpisodeWidth();
            autoHeight();
            scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
            $('#overlay-s').fadeOut();
        });
    } else {
        showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
        return;
    }
}   // end of listEpisode()

function updateChannel(pageId, id) {
    if (id > 0 && !isNaN(id) && CMS_CONF.USER_DATA.id) {
        nn.api('GET', CMS_CONF.API('/api/users/{userId}/channels', {userId: CMS_CONF.USER_DATA.id}), null, function (data) {
            var channelIds = [];
            if (data.length > 0) {
                $.each(data, function (i, list) {
                    channelIds.push(list.id);
                });
            }
            if (-1 === $.inArray(parseInt(id, 10), channelIds)) {
                showSystemErrorOverlayAndHookError('You are not authorized to edit this channel.');
                return;
            }
            nn.api('GET', CMS_CONF.API('/api/channels/{channelId}', {channelId: id}), null, function (channel) {
                if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                    showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                    return;
                }
                showProcessingOverlay();
                $('#content-main').html('');
                $('#content-main-tmpl').tmpl(channel).appendTo('#content-main');
                $('#channel-name').data('width', $('#channel-name').width());
                // setup channel data
                $('#func-nav .episode').attr('href', 'episode-list.html?id=' + id);
                $('#func-nav .setting').attr('href', 'channel-setting.html?id=' + id);
                if ('' != $.trim(channel.imageUrl)) {
                    $('#thumbnail-imageUrl').attr('src', channel.imageUrl + '?n=' + Math.random());
                }
                if ('' != channel.lang && CMS_CONF.LANG_MAP[channel.lang]) {
                    $('#lang-select-txt').text(CMS_CONF.LANG_MAP[channel.lang]);
                }
                if ('' != channel.sphere && CMS_CONF.SPHERE_MAP[channel.sphere]) {
                    $('#sphere-select-txt').text(CMS_CONF.SPHERE_MAP[channel.sphere]);
                    $('.category').removeClass('disable').addClass('enable');
                    var sphere = channel.sphere;
                    if ('other' === sphere) { sphere = 'en'; }
                    nn.api('GET', CMS_CONF.API('/api/categories'), { lang: sphere }, function (categories) {
                        $.each(categories, function (i, list) {
                            CMS_CONF.CATEGORY_MAP[list.id] = list.name;
                        });
                        var modCatLen = categories.length % 3;
                        if (modCatLen > 0) {
                            modCatLen = 3 - modCatLen;
                            for (var i = 0; i < modCatLen; i++) {
                                categories.push({
                                    id: 0,
                                    name: ''
                                });
                            }
                        }
                        $('#browse-category').html('');
                        $('#category-list-tmpl-item').tmpl(categories, {
                            dataArrayIndex: function (item) {
                                return $.inArray(item, categories);
                            }
                        }).appendTo('#browse-category');
                        if ('' != channel.categoryId && CMS_CONF.CATEGORY_MAP[channel.categoryId]) {
                            $('.tag-list').removeClass('hide');
                            $('#categoryId-select-txt').text(CMS_CONF.CATEGORY_MAP[channel.categoryId]);
                            nn.api('GET', CMS_CONF.API('/api/tags'), { categoryId: channel.categoryId }, function (tags) {
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
                    });
                }
                // channel form charCounter
                $('#name').charCounter(20, {
                    container: '#name-charcounter',
                    format: '%1',
                    delay: 0,
                    clear: false
                });
                $('#intro').charCounter(70, {
                    container: '#intro-charcounter',
                    format: '%1',
                    delay: 0,
                    clear: false
                });
                // Amazon S3 upload
                if ($('#uploadThumbnail').length > 0) {
                    uploadImage();
                }
                setFormHeight();
                autoHeight();
                scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                $('#settingForm .btn-save').removeClass('disable').addClass('enable');
                $('#overlay-s').fadeOut();
            });
        });
    } else {
        showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
        return;
    }
}   // end of updateChannel()

function createChannel(pageId) {
    $('#content-main').html('');
    $('#content-main-tmpl').tmpl().appendTo('#content-main');
    // channel form charCounter
    $('#name').charCounter(20, {
        container: '#name-charcounter',
        format: '%1',
        delay: 0,
        clear: false
    });
    $('#intro').charCounter(70, {
        container: '#intro-charcounter',
        format: '%1',
        delay: 0,
        clear: false
    });
    // Amazon S3 upload
    if ($('#uploadThumbnail').length > 0) {
        uploadImage();
    }
    setFormHeight();
    autoHeight();
    scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
    $('#settingForm .btn-cancel, #settingForm .btn-create').removeClass('disable').addClass('enable');
}

function listChannel(pageId) {
    if (CMS_CONF.USER_DATA.id) {
        showProcessingOverlay();
        nn.api('GET', CMS_CONF.API('/api/users/{userId}/channels', {userId: CMS_CONF.USER_DATA.id}), null, function (channels) {
            var cntChannel = channels.length,
                hasFavoriteChannel = false;
            $('#title-func').html('');
            $('#title-func-tmpl').tmpl(null, { cntChannel: cntChannel }).appendTo('#title-func');
            if (cntChannel > 0) {
                var items = [],
                    temp = [];
                $.each(channels, function (i, channel) {
                    temp = [];
                    channel.moreImageUrl_1 = CMS_CONF.CHANNEL_DEFAULT_IMAGE;
                    channel.moreImageUrl_2 = CMS_CONF.CHANNEL_DEFAULT_IMAGE2;
                    channel.moreImageUrl_3 = CMS_CONF.CHANNEL_DEFAULT_IMAGE2;
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        hasFavoriteChannel = true;
                        if (channel.moreImageUrl && '' !== $.trim(channel.moreImageUrl)) {
                            temp = channel.moreImageUrl.split('|');
                            if (temp[0] && temp[0] !== CMS_CONF.EPISODE_DEFAULT_IMAGE) { channel.moreImageUrl_1 = temp[0]; }
                            if (temp[1] && temp[1] !== CMS_CONF.EPISODE_DEFAULT_IMAGE) { channel.moreImageUrl_2 = temp[1]; }
                            if (temp[2] && temp[2] !== CMS_CONF.EPISODE_DEFAULT_IMAGE) { channel.moreImageUrl_3 = temp[2]; }
                        }
                        channel.name = CMS_CONF.USER_DATA.name + nn._([pageId, 'channel-list', "'s Favorite"]);
                    } else {
                        if (channel.imageUrl && '' !== $.trim(channel.imageUrl) && channel.imageUrl !== CMS_CONF.EPISODE_DEFAULT_IMAGE) {
                            channel.moreImageUrl_1 = channel.imageUrl;
                        }
                        if (channel.moreImageUrl && '' !== $.trim(channel.moreImageUrl)) {
                            temp = channel.moreImageUrl.split('|');
                            if (temp[0] && temp[0] !== CMS_CONF.EPISODE_DEFAULT_IMAGE) { channel.moreImageUrl_2 = temp[0]; }
                            if (temp[1] && temp[1] !== CMS_CONF.EPISODE_DEFAULT_IMAGE) { channel.moreImageUrl_3 = temp[1]; }
                        }
                    }
                    items.push(channel);
                });
                $('#channel-list').html('');
                $('#channel-list-tmpl-item').tmpl(items, {
                    userId: CMS_CONF.USER_DATA.id
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
                    $('#lightbox-create-channel').remove();
                    $('#lightbox-create-channel-tmpl').tmpl().prependTo('body');
                    $('.blockOverlay').height($(window).height() - 45);
                    $.blockUI.defaults.overlayCSS.opacity = '0.9';
                    $.blockUI({
                        message: $('#lightbox-create-channel')
                    });
                }
            }
            setFormHeight();
            autoHeight();
            scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
            $('#overlay-s').fadeOut();
        });
    } else {
        location.href = '../';
    }
}   // end of listChannel()

function fadeEpcurateHeaderAndFooter() {
    var cmsEpe = $.cookie('cms-epe');
    if (!cmsEpe) {
        $('#header, #footer-control, #footer').removeClass('hide').fadeOut(3000);
        var referrer = document.referrer;
        if ('' == referrer) {
            referrer = 'index.html';
        }
        $.cookie('cms-epe', referrer);
        $('#epcurate-nav-back').attr('href', referrer);
        $('#form-btn-leave').data('leaveUrl', referrer);
    } else {
        $('#header, #footer-control, #footer').addClass('hide');
        $('#epcurate-nav-back').attr('href', cmsEpe);
        $('#form-btn-leave').data('leaveUrl', cmsEpe);
    }
}

function rebuildCrumbAndParam(cid, eid) {
    var cmsCrumb = {},
        cidFromGet = 0,
        eidFromGet = 0;
    if ($.cookie('cms-crumb')) {
        cmsCrumb = $.url('http://fake.url.dev.teltel.com/?' + $.cookie('cms-crumb')).param();
    }
    // ON PURPOSE by pass no check (GET or function param) for handle error by oneself
    if ('undefined' === typeof cid) {
        cidFromGet = CMS_CONF.USER_URL.param('cid');
        if (cidFromGet) {
            cmsCrumb.channelId = cidFromGet;
        } else {
            // make sure channel id passed by GET or function param, or else delete it
            if (cmsCrumb.channelId) {
                delete cmsCrumb.channelId;
            }
        }
    } else {
        cmsCrumb.channelId = cid;
    }
    if ('undefined' === typeof eid) {
        eidFromGet = CMS_CONF.USER_URL.param('id');
        if (eidFromGet) {
            cmsCrumb.id = eidFromGet;
        } else {
            // make sure episode id passed by GET or function param, or else delete it
            if (cmsCrumb.id) {
                delete cmsCrumb.id;
            }
        }
    } else {
        cmsCrumb.id = eid;
    }
    $.cookie('cms-crumb', $.param(cmsCrumb));
    // rebuild url param by first-time entry
    var qrystr = {};
    if (cmsCrumb.channelId && '' != cmsCrumb.channelId) {
        qrystr.cid = cmsCrumb.channelId;
    }
    if (cmsCrumb.id && '' != cmsCrumb.id) {
        qrystr.id = cmsCrumb.id;
    }
    qrystr = $.param(qrystr);
    if ('' != qrystr) {
        qrystr = '?' + qrystr;
    }
    $('#epcurate-nav-curation').attr('href', 'epcurate-curation.html' + qrystr);
    $('#epcurate-nav-publish').attr('href', 'epcurate-publish.html' + qrystr);
    $('#form-btn-back').attr('href', $('#epcurate-nav-' + $('#form-btn-back').attr('rel')).attr('href'));
    $('#form-btn-next').attr('href', $('#epcurate-nav-' + $('#form-btn-next').attr('rel')).attr('href'));
    if (cmsCrumb.id) { $('#id').val(cmsCrumb.id); }
    if (cmsCrumb.channelId) { $('#channelId').val(cmsCrumb.channelId); }

    return cmsCrumb;
}   // end of rebuildCrumbAndParam()

function setupLanguageAndRenderPage(user, isStoreLangKey) {
    // fetch user lang
    CMS_CONF.USER_DATA = user;
    var lang = CMS_CONF.USER_DATA.lang;
    if (-1 === $.inArray(lang, CMS_CONF.LANG_SUPPORT)) {
        lang = 'en';
        CMS_CONF.USER_DATA.lang = lang;
    }
    $('html').removeClass(CMS_CONF.LANG_SUPPORT.join(' ')).addClass(lang);

    nn.api('GET', 'lang/' + lang + '.json', null, function (langPack) {
        // setup user profile
        $('#selected-profile').text(CMS_CONF.USER_DATA.name);
        $('#profile-mypage').attr('href', '/#!curator=' + CMS_CONF.USER_DATA.profileUrl);
        if (true == CMS_CONF.USER_DATA.fbUser) {
            $('#profile-settings').remove();
        }

        // setup lang pack
        CMS_CONF.LANG_MAP = langPack['lang-map'];
        CMS_CONF.SPHERE_MAP = langPack['sphere-map'];
        CMS_CONF.EFFECT_MAP = langPack['effect-map'];
        nn.i18n(langPack);

        // store lang key
        if (true === isStoreLangKey) {
            $('title').data('langkey', $('title').text());
            $('#header a, #footer a, .overlay-l .btns a, #studio-nav a, #func-nav a, #epcurate-nav .langkey, #epcurateForm .langkey').each(function () {
                $(this).data('langkey', $(this).text());
            });
            $('#epcurateForm .langkey-val').each(function () {
                $(this).data('langkey', $(this).val());
            });
        }

        // render page
        var userUrlFile = CMS_CONF.USER_URL.attr('file');
        if ('' === userUrlFile || 'index.html' === userUrlFile) {
            CMS_CONF.PAGE_ID = 'index';
            listChannel(CMS_CONF.PAGE_ID);
        }
        if ('channel-add.html' === userUrlFile) {
            CMS_CONF.PAGE_ID = 'channel';
            createChannel(CMS_CONF.PAGE_ID);
        }
        if ('channel-setting.html' === userUrlFile) {
            CMS_CONF.PAGE_ID = 'channel';
            updateChannel(CMS_CONF.PAGE_ID, CMS_CONF.USER_URL.param('id'));
        }
        if ('episode-list.html' === userUrlFile) {
            CMS_CONF.PAGE_ID = 'episode-list';
            listEpisode(CMS_CONF.PAGE_ID, CMS_CONF.USER_URL.param('id'));
        }
        if (-1 === $.inArray(userUrlFile, ['epcurate-curation.html', 'epcurate-publish.html'])) {
            $.removeCookie('cms-epe');
            $.removeCookie('cms-crumb');
        } else {
            fadeEpcurateHeaderAndFooter();
            var cmsCrumb = rebuildCrumbAndParam(),
                fm = document.epcurateForm;
            if ('epcurate-publish.html' === userUrlFile) {
                CMS_CONF.PAGE_ID = 'epcurate-publish';
                buildEpcuratePublish(CMS_CONF.PAGE_ID, fm, cmsCrumb);
            }
            if ('epcurate-curation.html' === userUrlFile) {
                CMS_CONF.PAGE_ID = 'epcurate-curation';
                $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                buildEpcurateCuration(CMS_CONF.PAGE_ID, fm, cmsCrumb);
            }
        }

        // replace lang value
        $('title').text(nn._([CMS_CONF.PAGE_ID, 'html-title', $('title').data('langkey')]));
        $('#header a').each(function () {
            $(this).text(nn._(['header', $(this).data('langkey')]));
        });
        $('#footer a').each(function () {
            $(this).text(nn._(['footer', $(this).data('langkey')]));
        });
        $('.overlay-l .btns a').each(function () {
            $(this).text(nn._(['overlay', 'button', $(this).data('langkey')]));
        });
        $('#studio-nav a').each(function () {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'studio-nav', $(this).data('langkey')]));
        });
        $('#func-nav a').each(function () {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'func-nav', $(this).data('langkey')]));
        });
        $('#epcurate-nav .langkey').each(function () {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'epcurate-nav', $(this).data('langkey')]));
        });
        $('#epcurateForm .langkey').each(function () {
            $(this).html(nn._([CMS_CONF.PAGE_ID, 'epcurate-form', $(this).data('langkey')]));
        });
        $('#epcurateForm .langkey-val').each(function () {
            $(this).val(nn._([CMS_CONF.PAGE_ID, 'epcurate-form', $(this).data('langkey')]));
        });
        $('#language').text(langPack['lang-map'][CMS_CONF.USER_DATA.lang]);
    }, 'json');
}   // end of setupLanguageAndRenderPage()

$(function () {
    if (!$.cookie('user')) {
        location.href = '../';
    } else {
        nn.api('POST', CMS_CONF.API('/api/login'), { token: $.cookie('user') }, function (user) {
            if (!user || !user.id) {
                location.href = '../';
            } else {
                CMS_CONF.USER_URL = $.url();
                var isStoreLangKey = true;
                setupLanguageAndRenderPage(user, isStoreLangKey);
            }
        });
    }
});
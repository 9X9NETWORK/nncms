/* predefine global variables here: jQuery nn CMS_CONF $ alert location autoHeight scrollbar window document setTimeout sumStoryboardInfo setFormWidth setSpace setEpisodeWidth htmlEscape showProcessingOverlay showSystemErrorOverlayAndHookError */
/*jslint eqeq: true, regexp: true, unparam: true, sloppy: true, todo: true, vars: true */
var CMS_CONF = {
    // TODO setup debug mode to false in production environment
    IS_DEBUG: true,
    YOUR_FAVORITE: 11,
    PROGRAM_MAX: 50,
    LANG_MAP: {
        'en': 'English',
        'zh': 'Chinese',
        'other': 'Others'
    },
    SPHERE_MAP: {
        'en': 'US',
        'zh': 'Taiwan',
        'other': 'Worldwide'
    },
    CATEGORY_MAP: {},
    EFFECT_MAP: {
        'none': 'None',
        'fade': 'Fade',
        'blind': 'Blind',
        'clip': 'Clip',
        'drop': 'Drop'
    },
    COLOR_MAP: {
        '#ffffff': 'c-fff',
        '#eeeeee': 'c-eee',
        '#bbbbbb': 'c-bbb',
        '#777777': 'c-777',
        '#333333': 'c-333',
        '#000000': 'c-000',
        '#ff0000': 'c-f00',
        '#ff6600': 'c-f60',
        '#ffff00': 'c-ff0',
        '#009900': 'c-090',
        '#0033ff': 'c-03f',
        '#6600ff': 'c-60f'
    },
    // NOTE: The naming is 9x9 API convention, not jquery.titlecard plugin convention
    TITLECARD_DEFAULT: {
        message: 'My video',
        align: 'center',
        effect: 'fade',
        duration: 7,
        size: 20,
        color: '#ffffff',
        style: 'normal',
        weight: 'normal',
        bgColor: '#000000',
        bgImage: ''
    },
    FONT_RADIX_MIN: 6,
    FONT_RADIX_MAX: 48,
    USER_URL: $.url(),
    USER_DATA: null
};

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

$(function () {
    if (!$.cookie('user')) {
        location.href = '../';
    } else {
        nn.api('POST', '/api/login', { token: $.cookie('user') }, function (user) {
            if (!user || !user.id) {
                location.href = '../';
            } else {
                CMS_CONF.USER_DATA = user;
                var userUrlFile = CMS_CONF.USER_URL.attr('file');
                $('#selected-profile').text(CMS_CONF.USER_DATA.name);
                $('#profile-mypage').attr('href', '/#!curator=' + CMS_CONF.USER_DATA.profileUrl);
                if ('' === userUrlFile || 'index.html' === userUrlFile) {
                    listChannel();
                }
                if ('channel-add.html' === userUrlFile) {
                    createChannel();
                }
                if ('channel-setting.html' === userUrlFile) {
                    updateChannel(CMS_CONF.USER_URL.param('id'));
                }
                if ('episode-list.html' === userUrlFile) {
                    listEpisode(CMS_CONF.USER_URL.param('id'));
                }
                if (-1 === $.inArray(userUrlFile, ['epcurate-info.html', 'epcurate-curation.html', 'epcurate-publish.html'])) {
                    $.removeCookie('cms-epe');
                    $.removeCookie('cms-crumb');
                } else {
                    fadeEpcurateHeaderAndFooter();
                    var cmsCrumb = rebuildCrumbAndParam(),
                        fm = document.epcurateForm;
                    if ('epcurate-info.html' === userUrlFile) {
                        buildEpcurateInfo(fm, cmsCrumb);
                    }
                    if ('epcurate-publish.html' === userUrlFile) {
                        buildEpcuratePublish(fm, cmsCrumb);
                    }
                    if ('epcurate-curation.html' === userUrlFile) {
                        buildEpcurateCuration(fm, cmsCrumb);
                    }
                }
            }
        });
    }
});

function buildEpcurateCuration(fm, crumb) {
    nn.log(crumb, 'debug');
    var eid = fm.id.value,
        cid = fm.channelId.value;
    if ('' == eid && '' == cid) {
        showSystemErrorOverlayAndHookError('Invalid channel ID and episode ID, please try again.');
        return;
    }
    if ('' == eid) {
        // insert mode: data from cookie
        if (!crumb.name || '' == $.trim(crumb.name)) {
            $('#form-btn-leave').data('gobackUrl', $('#epcurate-nav-info').attr('href'));
            showSystemErrorOverlayAndHookError('No episode title. Please go back to fill in episode information.');
            return;
        }
        if (cid > 0 && !isNaN(cid) && CMS_CONF.USER_DATA.id) {
            nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels?anticache=' + (new Date()).getTime(), null, function (data) {
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
                nn.api('GET', '/api/channels/' + cid, null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                        return;
                    }
                    showProcessingOverlay();
                    $('#epcurate-info-tmpl').tmpl(crumb).prependTo('#epcurateForm');
                    $('.form-btn .btn-save').addClass('disable');
                    $('#form-btn-save').attr('disabled', 'disabled');
                    $('#epcurate-nav-info, #epcurate-nav-publish, #form-btn-save, #form-btn-back, #form-btn-next').click(function (e) {
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
        nn.api('GET', '/api/episodes/' + $('#id').val(), null, function (episode) {
            if ('' != cid && cid != episode.channelId) {
                showSystemErrorOverlayAndHookError('You are not authorized to edit this episode.');
                return;
            }
            nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels?anticache=' + (new Date()).getTime(), null, function (data) {
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
                nn.api('GET', '/api/channels/' + episode.channelId, null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                        return;
                    }
                    showProcessingOverlay();
                    crumb = $.extend({}, crumb, episode);
                    $('#epcurate-info-tmpl').tmpl(crumb).prependTo('#epcurateForm');
                    // merge 9x9 api and youtube api (ytId, uploader, uploadDate, isZoneLimited, isMobileLimited, isEmbedLimited)
                    var normalPattern = /^http(?:s)?:\/\/www.youtube.com\/watch\?v=([^&]{11})/,
                        preloadImage = [],
                        programList = [],
                        invalidList = [],
                        ytData = null,
                        ytItem = {},
                        ytList = [],
                        beginTitleCard = null,
                        endTitleCard = null;
                    nn.api('GET', '/api/episodes/' + $('#id').val() + '/programs?anticache=' + (new Date()).getTime(), null, function (programs) {
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
                                $('#cur-add .notice').text('Invalid URL, please try again!').removeClass('hide').show();
                                if (idx === (programList.length - 1)) {
                                    // ON PURPOSE to wait api (async)
                                    setTimeout(function () {
                                        if (preloadImage.length > 0) {
                                            $('#preload-image-tmpl-item').tmpl(preloadImage).prependTo('#preload-image');
                                        }
                                        $('#storyboard-listing-tmpl-item').tmpl(ytList).prependTo('#storyboard-listing');
                                        if ($('#storyboard-list li').length > 0) {
                                            $('.form-btn .btn-save').removeClass('disable');
                                            $('#form-btn-save').removeAttr('disabled');
                                        }
                                        sumStoryboardInfo();
                                        $('.ellipsis').ellipsis();
                                        $('#overlay-s').fadeOut();
                                    }, 1000);
                                }
                            });
                            nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + programItem.fileUrl.substr(-11) + '?alt=jsonc&v=2', null, function (youtubes) {
                                nn.api('GET', '/api/programs/' + programItem.id + '/title_cards', null, function (title_card) {
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
                                    ytData = youtubes.data;
                                    ytItem = {
                                        beginTitleCard: beginTitleCard,
                                        endTitleCard: endTitleCard,
                                        ytId: ytData.id,
                                        fileUrl: programItem.fileUrl,
                                        imageUrl: 'http://i.ytimg.com/vi/' + ytData.id + '/mqdefault.jpg',
                                        duration: ytData.duration,
                                        name: ytData.title,
                                        intro: ytData.description,
                                        uploader: ytData.uploader,
                                        uploadDate: ytData.uploaded,    // TODO conver uploaded to timestamp
                                        isZoneLimited: ((ytData.restrictions) ? true : false),
                                        isMobileLimited: (((ytData.accessControl && ytData.accessControl.syndicate && 'denied' === ytData.accessControl.syndicate) || (ytData.status && ytData.status.reason && 'limitedSyndication' === ytData.status.reason)) ? true : false),
                                        isEmbedLimited: ((ytData.accessControl && ytData.accessControl.embed && 'denied' === ytData.accessControl.embed) ? true : false)
                                    };
                                    ytItem = $.extend(programItem, ytItem);
                                    ytList[idx] = ytItem;
                                    if (idx === (programList.length - 1)) {
                                        // ON PURPOSE to wait api (async)
                                        setTimeout(function () {
                                            if (preloadImage.length > 0) {
                                                $('#preload-image-tmpl-item').tmpl(preloadImage).prependTo('#preload-image');
                                            }
                                            $('#storyboard-listing-tmpl-item').tmpl(ytList).prependTo('#storyboard-listing');
                                            if ($('#storyboard-list li').length > 0) {
                                                $('.form-btn .btn-save').removeClass('disable');
                                                $('#form-btn-save').removeAttr('disabled');
                                            }
                                            sumStoryboardInfo();
                                            $('.ellipsis').ellipsis();
                                            $('#overlay-s').fadeOut();
                                        }, 1000);
                                    }
                                });
                            }, 'json');
                        });
                    });
                    $('#epcurate-nav-info, #epcurate-nav-publish, #form-btn-save, #form-btn-back, #form-btn-next').click(function (e) {
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

function buildEpcuratePublish(fm, crumb) {
    nn.log(crumb, 'debug');
    var eid = fm.id.value,
        cid = fm.channelId.value;
    if ('' == eid || !crumb.id) {
        if (crumb.channelId) {
            if (crumb.name) {
                $('#form-btn-leave').data('gobackUrl', $('#epcurate-nav-curation').attr('href'));
            } else {
                $('#form-btn-leave').data('gobackUrl', $('#epcurate-nav-info').attr('href'));
            }
        }
        showSystemErrorOverlayAndHookError('Invalid episode ID, please try again.');
        return;
    }
    nn.api('GET', '/api/episodes/' + $('#id').val(), null, function (episode) {
        if ('' != cid && cid != episode.channelId) {
            showSystemErrorOverlayAndHookError('You are not authorized to edit this episode.');
            return;
        }
        nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels?anticache=' + (new Date()).getTime(), null, function (data) {
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
            nn.api('GET', '/api/channels/' + episode.channelId, null, function (channel) {
                if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                    showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                    return;
                }
                showProcessingOverlay();
                nn.api('GET', '/api/episodes/' + $('#id').val() + '/programs?anticache=' + (new Date()).getTime(), null, function (programs) {
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
                    $('#epcurate-nav-info, #epcurate-nav-curation, #form-btn-save, #form-btn-back').click(function (e) {
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

function buildEpcurateInfo(fm, crumb) {
    nn.log(crumb, 'debug');
    var eid = fm.id.value,
        cid = fm.channelId.value;
    if ('' == eid && '' == cid) {
        showSystemErrorOverlayAndHookError('Invalid channel ID and episode ID, please try again.');
        return;
    }
    if ('' == eid) {
        // insert mode: data from cookie
        if (cid > 0 && !isNaN(cid) && CMS_CONF.USER_DATA.id) {
            nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels?anticache=' + (new Date()).getTime(), null, function (data) {
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
                nn.api('GET', '/api/channels/' + cid, null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                        return;
                    }
                    showProcessingOverlay();
                    $('#epcurate-info-tmpl').tmpl(crumb).appendTo('#epcurate-info');
                    $('.form-btn .btn-save').addClass('disable');
                    $('#form-btn-save').attr('disabled', 'disabled');
                    $('#epcurate-nav-curation, #epcurate-nav-publish, #form-btn-save, #form-btn-next').click(function (e) {
                        $(fm).trigger('submit', e);
                        return false;
                    });
                    setFormWidth();
                    $('#overlay-s').fadeOut();
                });
            });
        } else {
            showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
            return;
        }
    } else {
        // update mode: data from api
        nn.api('GET', '/api/episodes/' + $('#id').val(), null, function (episode) {
            if ('' != cid && cid != episode.channelId) {
                showSystemErrorOverlayAndHookError('You are not authorized to edit this episode.');
                return;
            }
            nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels?anticache=' + (new Date()).getTime(), null, function (data) {
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
                nn.api('GET', '/api/channels/' + episode.channelId, null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                        return;
                    }
                    showProcessingOverlay();
                    crumb = $.extend({}, crumb, episode);
                    $('#epcurate-info-tmpl').tmpl(crumb).appendTo('#epcurate-info');
                    $('#epcurate-nav-curation, #epcurate-nav-publish, #form-btn-save, #form-btn-next').click(function (e) {
                        $(fm).trigger('submit', e);
                        return false;
                    });
                    setFormWidth();
                    $('#overlay-s').fadeOut();
                });
            });
        });
    }
}   // end of buildEpcurateInfo()

function listEpisode(id) {
    if (id > 0 && !isNaN(id) && CMS_CONF.USER_DATA.id) {
        nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels?anticache=' + (new Date()).getTime(), null, function (data) {
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
            nn.api('GET', '/api/channels/' + id, null, function (channel) {
                $('#episode-nav-tmpl').tmpl(channel).appendTo('#func-nav ul');
                if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                    nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/my_favorites?anticache=' + (new Date()).getTime(), null, function (favorites) {
                        var cntEpisode = favorites.length;
                        $('#title-func-tmpl').tmpl(channel, { cntEpisode: cntEpisode }).appendTo('#title-func');
                        $('#content-main-wrap .constrain').html('');
                        if (cntEpisode > 0) {
                            $('#episode-favorite-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                            $('#episode-favorite-list-tmpl-item').tmpl(favorites).appendTo('#episode-list');
                        } else {
                            $('#episode-favorite-first-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                        }
                        autoHeight();
                        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                        setEpisodeWidth();
                        $('#overlay-s').fadeOut();
                    });
                } else {
                    nn.api('GET', '/api/channels/' + id + '/episodes?anticache=' + (new Date()).getTime(), null, function (episodes) {
                        var cntEpisode = episodes.length;
                        $('#title-func-tmpl').tmpl(channel, { cntEpisode: cntEpisode }).appendTo('#title-func');
                        $('#content-main-wrap .constrain').html('');
                        if (cntEpisode > 0) {
                            $('#episode-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                            $('#episode-list-tmpl-item').tmpl(episodes).appendTo('#episode-list');
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
                        autoHeight();
                        scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                        setEpisodeWidth();
                        $('#overlay-s').fadeOut();
                    });
                }
            });
        });
    } else if (id == 0 && !isNaN(id) && CMS_CONF.USER_DATA.id) {
        // for fake favorite channel
        showProcessingOverlay();
        nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/my_favorites?anticache=' + (new Date()).getTime(), null, function (favorites) {
            var cntEpisode = favorites.length;
            var channel = {
                contentType: CMS_CONF.YOUR_FAVORITE,
                name: CMS_CONF.USER_DATA.name + "'s favorite"
            };
            $('#episode-nav-tmpl').tmpl(channel).appendTo('#func-nav ul');
            $('#title-func-tmpl').tmpl(channel, { cntEpisode: cntEpisode }).appendTo('#title-func');
            $('#content-main-wrap .constrain').html('');
            if (cntEpisode > 0) {
                $('#episode-favorite-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                $('#episode-favorite-list-tmpl-item').tmpl(favorites).appendTo('#episode-list');
            } else {
                $('#episode-favorite-first-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
            }
            autoHeight();
            scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
            setEpisodeWidth();
            $('#overlay-s').fadeOut();
        });
    } else {
        showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
        return;
    }
}   // end of listEpisode()

function updateChannel(id) {
    if (id > 0 && !isNaN(id) && CMS_CONF.USER_DATA.id) {
        nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels?anticache=' + (new Date()).getTime(), null, function (data) {
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
            nn.api('GET', '/api/channels/' + id, null, function (channel) {
                if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                    showSystemErrorOverlayAndHookError('The favorites channel can not be edited.');
                    return;
                }
                showProcessingOverlay();
                // setup channel data
                $('#func-nav .episode').attr('href', 'episode-list.html?id=' + id);
                $('#func-nav .setting').attr('href', 'channel-setting.html?id=' + id);
                $('#channel-name').text(channel.name);
                $('#name').val(htmlEscape(channel.name));
                $('#imageUrl').val(channel.imageUrl);
                $('#imageUrlOld').val(channel.imageUrl);
                if ('' != $.trim(channel.imageUrl)) {
                    $('#thumbnail-imageUrl').attr('src', channel.imageUrl + '?n=' + Math.random());
                }
                $('#intro').val(htmlEscape(channel.intro));
                $('#tag').val(htmlEscape(channel.tag));
                $('#lang').val(channel.lang);
                if ('' != channel.lang && CMS_CONF.LANG_MAP[channel.lang]) {
                    $('#lang-select-txt').text(CMS_CONF.LANG_MAP[channel.lang]);
                }
                $('#sphere').val(channel.sphere);
                if ('' != channel.sphere && CMS_CONF.SPHERE_MAP[channel.sphere]) {
                    $('#sphere-select-txt').text(CMS_CONF.SPHERE_MAP[channel.sphere]);
                    $('.category').removeClass('disable').addClass('enable');
                    var sphere = channel.sphere;
                    if ('other' === sphere) { sphere = 'en'; }
                    nn.api('GET', '/api/categories?anticache=' + (new Date()).getTime(), { lang: sphere }, function (categories) {
                        $.each(categories, function (i, list) {
                            CMS_CONF.CATEGORY_MAP[list.id] = list.name;
                        });
                        $('#category-list-tmpl-item').tmpl(categories, {
                            dataArrayIndex: function (item) {
                                return $.inArray(item, categories);
                            }
                        }).appendTo('#browse-category');
                        $('#categoryId').val(channel.categoryId);
                        if ('' != channel.categoryId && CMS_CONF.CATEGORY_MAP[channel.categoryId]) {
                            $('.tag-list').removeClass('hide');
                            $('#categoryId-select-txt').text(CMS_CONF.CATEGORY_MAP[channel.categoryId]);
                            nn.api('GET', '/api/tags?anticache=' + (new Date()).getTime(), { categoryId: channel.categoryId }, function (tags) {
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
                $('#settingForm .btn-save').removeClass('disable').addClass('enable');
                $('#overlay-s').fadeOut();
            });
        });
    } else {
        showSystemErrorOverlayAndHookError('Invalid channel ID, please try again.');
        return;
    }
}   // end of updateChannel()

function createChannel() {
    $('#settingForm .btn-cancel, #settingForm .btn-create').removeClass('disable').addClass('enable');
}

function listChannel() {
    if (CMS_CONF.USER_DATA.id) {
        showProcessingOverlay();
        nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels?anticache=' + (new Date()).getTime(), null, function (channels) {
            var cntChannel = channels.length,
                hasFavoriteChannel = false;
            $('#channel-counter').html(cntChannel);
            if (cntChannel > 0) {
                var items = [],
                    temp = [];
                $.each(channels, function (i, list) {
                    if (list.contentType == CMS_CONF.YOUR_FAVORITE) {
                        hasFavoriteChannel = true;
                    }
                    list.moreImageUrl_1 = 'images/episode_default1.png';
                    list.moreImageUrl_2 = 'images/episode_default2.png';
                    list.moreImageUrl_3 = 'images/episode_default2.png';
                    if (list.moreImageUrl && '' !== $.trim(list.moreImageUrl)) {
                        temp = list.moreImageUrl.split('|');
                        if (temp[0]) { list.moreImageUrl_1 = temp[0]; }
                        if (temp[1]) { list.moreImageUrl_2 = temp[1]; }
                        if (temp[2]) { list.moreImageUrl_3 = temp[2]; }
                    }
                    items.push(list);
                });
                $('#channel-list-tmpl-item').tmpl(items, {
                    userId: CMS_CONF.USER_DATA.id
                }).appendTo('#channel-list');
            }
            if (cntChannel <= 0 || (1 === cntChannel && hasFavoriteChannel)) {
                if (!$.cookie('cms-cct')) {
                    $.cookie('cms-cct', 'seen');
                    $('#lightbox-create-channel-tmpl').tmpl().prependTo('body');
                    $('.blockOverlay').height($(window).height() - 45);
                    $.blockUI.defaults.overlayCSS.opacity = '0.9';
                    $.blockUI({
                        message: $('#lightbox-create-channel')
                    });
                }
            }
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
        }
    } else {
        cmsCrumb.channelId = cid;
    }
    if ('undefined' === typeof eid) {
        eidFromGet = CMS_CONF.USER_URL.param('id');
        if (eidFromGet) {
            cmsCrumb.id = eidFromGet;
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
    $('#epcurate-nav-info').attr('href', 'epcurate-info.html' + qrystr);
    $('#epcurate-nav-curation').attr('href', 'epcurate-curation.html' + qrystr);
    $('#epcurate-nav-publish').attr('href', 'epcurate-publish.html' + qrystr);
    $('#form-btn-back').attr('href', $('#epcurate-nav-' + $('#form-btn-back').attr('rel')).attr('href'));
    $('#form-btn-next').attr('href', $('#epcurate-nav-' + $('#form-btn-next').attr('rel')).attr('href'));
    if (cmsCrumb.id) { $('#id').val(cmsCrumb.id); }
    if (cmsCrumb.channelId) { $('#channelId').val(cmsCrumb.channelId); }

    return cmsCrumb;
}   // end of rebuildCrumbAndParam()
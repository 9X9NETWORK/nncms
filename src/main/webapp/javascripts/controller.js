/* predefine global variables here: jQuery nn CMS_CONF $ alert location autoHeight scrollbar window document */
/* jslint eqeq: true, unparam: true, sloppy: true, todo: true, vars: true */
var CMS_CONF = {
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
        'fold': 'Fold',
        'drop': 'Drop'
    },
    USER_URL: $.url(),
    USER_DATA: null
};

nn.initialize();
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
                    var cmsCrumb = rebuildCrumbAndParam();
                    if ('epcurate-info.html' === userUrlFile) {
                        buildEpcurateInfo(document.epcurateForm, cmsCrumb);
                    }
                    if ('epcurate-publish.html' === userUrlFile) {
                        buildEpcuratePublish(document.epcurateForm, cmsCrumb);
                    }
                    if ('epcurate-curation.html' === userUrlFile) {
                        buildEpcurateCuration(document.epcurateForm, cmsCrumb);
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
        $('body').addClass('has-error');
        $('#system-error .content').html('Invalid channel ID and episode ID, please try again.');
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
        return;
    }
    if ('' == eid) {
        // insert mode: data from cookie
        if (!crumb.name || '' == crumb.name) {
            $('#form-btn-leave').data('leaveUrl', $('#epcurate-nav-info').attr('href'));
            $('body').addClass('has-error');
            $('#system-error .content').html('No episode title. Please go back to fill in episode information.');
            $.blockUI.defaults.overlayCSS.opacity = '0.9';
            $.blockUI({
                message: $('#system-error')
            });
            return;
        }
        if (cid > 0 && !isNaN(cid) && CMS_CONF.USER_DATA.id) {
            nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels', null, function (data) {
                var channelIds = [];
                if (data.length > 0) {
                    $.each(data, function (i, list) {
                        channelIds.push(list.id);
                    });
                }
                if (-1 === $.inArray(parseInt(cid, 10), channelIds)) {
                    $('body').addClass('has-error');
                    $('#system-error .content').html('You are not authorized to edit episodes in this channel.');
                    $.blockUI.defaults.overlayCSS.opacity = '0.9';
                    $.blockUI({
                        message: $('#system-error')
                    });
                    return;
                }
                nn.api('GET', '/api/channels/' + cid, null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        $('body').addClass('has-error');
                        $('#system-error .content').html('The favorites channel can not be edited.');
                        $.blockUI.defaults.overlayCSS.opacity = '0.9';
                        $.blockUI({
                            message: $('#system-error')
                        });
                        return;
                    }
                    $('#epcurate-nav-publish-tmpl').tmpl().appendTo('#epcurate-nav-publish');
                    $('#epcurate-info-tmpl').tmpl(crumb).prependTo('#epcurateForm');
                    $('.form-btn .btn-save').addClass('disable');
                    $('#form-btn-save').attr('disabled', 'disabled');
                    $('#epcurate-nav-info, #epcurate-nav-publish, #form-btn-save, #form-btn-back, #form-btn-next').click(function (e) {
                        $(fm).trigger('submit', e);
                        return false;
                    });
                });
            });
        } else {
            $('body').addClass('has-error');
            $('#system-error .content').html('Invalid channel ID, please try again.');
            $.blockUI.defaults.overlayCSS.opacity = '0.9';
            $.blockUI({
                message: $('#system-error')
            });
            return;
        }
    } else {
        // update mode: data from api
        nn.api('GET', '/api/episodes/' + $('#id').val(), null, function (episode) {
            if ('' != cid && cid != episode.channelId) {
                $('body').addClass('has-error');
                $('#system-error .content').html('You are not authorized to edit this episode.');
                $.blockUI.defaults.overlayCSS.opacity = '0.9';
                $.blockUI({
                    message: $('#system-error')
                });
                return;
            }
            nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels', null, function (data) {
                var channelIds = [];
                if (data.length > 0) {
                    $.each(data, function (i, list) {
                        channelIds.push(list.id);
                    });
                }
                if (-1 === $.inArray(parseInt(episode.channelId, 10), channelIds)) {
                    $('body').addClass('has-error');
                    $('#system-error .content').html('You are not authorized to edit episodes in this channel.');
                    $.blockUI.defaults.overlayCSS.opacity = '0.9';
                    $.blockUI({
                        message: $('#system-error')
                    });
                    return;
                }
                nn.api('GET', '/api/channels/' + episode.channelId, null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        $('body').addClass('has-error');
                        $('#system-error .content').html('The favorites channel can not be edited.');
                        $.blockUI.defaults.overlayCSS.opacity = '0.9';
                        $.blockUI({
                            message: $('#system-error')
                        });
                        return;
                    }
                    crumb = $.extend({}, crumb, episode);
                    $('#epcurate-info-tmpl').tmpl(crumb).prependTo('#epcurateForm');
                    // merge 9x9 api and youtube api (ytId, uploader, uploadDate, isZoneLimited, isMobileLimited, isEmbedLimited)
                    // TODO async order bug subSeq
                    // TODO GET /api/programs/{programId}/title_cards or GET /api/episodes/{episodeId}/title_cards
                    var normalPattern = /^http(?:s)?:\/\/www.youtube.com\/watch\?v=([^&]{11})/,
                        programItem = {},
                        programList = [],
                        ytData = null,
                        ytItem = {},
                        ytList = [];
                    nn.api('GET', '/api/episodes/' + $('#id').val() + '/programs', null, function (programs) {
                        $.each(programs, function (idx, programItem) {
                            if (normalPattern.test(programItem.fileUrl)) {
                                programList.push(programItem);
                            }
                        });
                        $.each(programList, function (idx, programItem) {
                            $.ajax({
                                type: 'GET',
                                url: 'http://gdata.youtube.com/feeds/api/videos/' + programItem.fileUrl.substr(-11) + '?alt=jsonc&v=2',
                                data: null,
                                dataType: 'json',
                                success: function (youtubes) {
                                    ytData = youtubes.data;
                                    ytItem = {
                                        ytId: ytData.id,
                                        fileUrl: programItem.fileUrl,
                                        imageUrl: 'http://i.ytimg.com/vi/' + ytData.id + '/mqdefault.jpg',
                                        duration: ytData.duration,
                                        name: ytData.title,
                                        intro: ytData.description,
                                        uploader: ytData.uploader,
                                        uploadDate: ytData.uploaded,    // TODO conver uploaded to timestamp
                                        isZoneLimited: ((ytData.restrictions) ? true : false),
                                        isMobileLimited: ((ytData.accessControl && ytData.accessControl.syndicate && 'denied' === ytData.accessControl.syndicate) ? true : false),
                                        isEmbedLimited: ((ytData.accessControl && ytData.accessControl.embed && 'denied' === ytData.accessControl.embed) ? true : false)
                                    };
                                    ytItem = $.extend(programItem, ytItem);
                                    ytList.push(ytItem);
                                    if (idx === (programList.length - 1)) {
                                        // setTimeout ON PURPOSE to wait api (async)
                                        setTimeout(function () {
                                            $('#storyboard-list-tmpl-item').tmpl(ytList, {
                                                durationConverter: function (duration) {
                                                    var durationMin = parseInt(duration / 60, 10).toString(),
                                                        durationSec = parseInt(duration % 60, 10).toString();
                                                    if (durationMin.length < 2) {
                                                        durationMin = '0' + durationMin;
                                                    }
                                                    if (durationSec.length < 2) {
                                                        durationSec = '0' + durationSec;
                                                    }
                                                    return durationMin + ':' + durationSec;
                                                }
                                            }).prependTo('#storyboard-list');
                                            $('.form-btn .btn-save').removeClass('disable');
                                            $('#form-btn-save').removeAttr('disabled');
                                            sumStoryboardInfo();
                                        }, 1000);
                                    }
                                }
                            });
                        });
                    });
                    $('#epcurate-nav-info, #epcurate-nav-publish, #form-btn-save, #form-btn-back, #form-btn-next').click(function (e) {
                        $(fm).trigger('submit', e);
                        return false;
                    });
                });
            });
        });
    }
}

function buildEpcuratePublish(fm, crumb) {
    nn.log(crumb, 'debug');
    var eid = fm.id.value,
        cid = fm.channelId.value;
    if ('' == eid || !crumb.id) {
        if (crumb.channelId) {
            if (crumb.name) {
                $('#form-btn-leave').data('leaveUrl', $('#epcurate-nav-curation').attr('href'));
            } else {
                $('#form-btn-leave').data('leaveUrl', $('#epcurate-nav-info').attr('href'));
            }
        }
        $('body').addClass('has-error');
        $('#system-error .content').html('Invalid episode ID, please try again.');
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
        return;
    }
    nn.api('GET', '/api/episodes/' + $('#id').val(), null, function (episode) {
        if ('' != cid && cid != episode.channelId) {
            $('body').addClass('has-error');
            $('#system-error .content').html('You are not authorized to edit this episode.');
            $.blockUI.defaults.overlayCSS.opacity = '0.9';
            $.blockUI({
                message: $('#system-error')
            });
            return;
        }
        nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels', null, function (data) {
            var channelIds = [];
            if (data.length > 0) {
                $.each(data, function (i, list) {
                    channelIds.push(list.id);
                });
            }
            if (-1 === $.inArray(parseInt(episode.channelId, 10), channelIds)) {
                $('body').addClass('has-error');
                $('#system-error .content').html('You are not authorized to edit episodes in this channel.');
                $.blockUI.defaults.overlayCSS.opacity = '0.9';
                $.blockUI({
                    message: $('#system-error')
                });
                return;
            }
            nn.api('GET', '/api/channels/' + episode.channelId, null, function (channel) {
                if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                    $('body').addClass('has-error');
                    $('#system-error .content').html('The favorites channel can not be edited.');
                    $.blockUI.defaults.overlayCSS.opacity = '0.9';
                    $.blockUI({
                        message: $('#system-error')
                    });
                    return;
                }
                nn.api('GET', '/api/episodes/' + $('#id').val() + '/programs', null, function (programs) {
                    $('#img-list-tmpl-item').tmpl(programs).appendTo('#img-list');
                    if ('' != episode.imageUrl) {
                        var hasMatch = false;
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
                            $('#imageUrl').val($('img', this).attr('src'));
                        }
                    });
                    $('#epcurate-nav-info, #epcurate-nav-curation, #form-btn-save, #form-btn-back').click(function (e) {
                        $(fm).trigger('submit', e);
                        return false;
                    });
                });
            });
        });
    });
}

function buildEpcurateInfo(fm, crumb) {
    nn.log(crumb, 'debug');
    var eid = fm.id.value,
        cid = fm.channelId.value;
    if ('' == eid && '' == cid) {
        $('body').addClass('has-error');
        $('#system-error .content').html('Invalid channel ID and episode ID, please try again.');
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
        return;
    }
    if ('' == eid) {
        // insert mode: data from cookie
        if (cid > 0 && !isNaN(cid) && CMS_CONF.USER_DATA.id) {
            nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels', null, function (data) {
                var channelIds = [];
                if (data.length > 0) {
                    $.each(data, function (i, list) {
                        channelIds.push(list.id);
                    });
                }
                if (-1 === $.inArray(parseInt(cid, 10), channelIds)) {
                    $('body').addClass('has-error');
                    $('#system-error .content').html('You are not authorized to edit episodes in this channel.');
                    $.blockUI.defaults.overlayCSS.opacity = '0.9';
                    $.blockUI({
                        message: $('#system-error')
                    });
                    return;
                }
                nn.api('GET', '/api/channels/' + cid, null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        $('body').addClass('has-error');
                        $('#system-error .content').html('The favorites channel can not be edited.');
                        $.blockUI.defaults.overlayCSS.opacity = '0.9';
                        $.blockUI({
                            message: $('#system-error')
                        });
                        return;
                    }
                    $('#epcurate-nav-publish-tmpl').tmpl().appendTo('#epcurate-nav-publish');
                    $('#epcurate-info-tmpl').tmpl(crumb).appendTo('#epcurate-info');
                    $('.form-btn .btn-save').addClass('disable');
                    $('#form-btn-save').attr('disabled', 'disabled');
                    $('#epcurate-nav-curation, #epcurate-nav-publish, #form-btn-save, #form-btn-next').click(function (e) {
                        $(fm).trigger('submit', e);
                        return false;
                    });
                });
            });
        } else {
            $('body').addClass('has-error');
            $('#system-error .content').html('Invalid channel ID, please try again.');
            $.blockUI.defaults.overlayCSS.opacity = '0.9';
            $.blockUI({
                message: $('#system-error')
            });
            return;
        }
    } else {
        // update mode: data from api
        nn.api('GET', '/api/episodes/' + $('#id').val(), null, function (episode) {
            if ('' != cid && cid != episode.channelId) {
                $('body').addClass('has-error');
                $('#system-error .content').html('You are not authorized to edit this episode.');
                $.blockUI.defaults.overlayCSS.opacity = '0.9';
                $.blockUI({
                    message: $('#system-error')
                });
                return;
            }
            nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels', null, function (data) {
                var channelIds = [];
                if (data.length > 0) {
                    $.each(data, function (i, list) {
                        channelIds.push(list.id);
                    });
                }
                if (-1 === $.inArray(parseInt(episode.channelId, 10), channelIds)) {
                    $('body').addClass('has-error');
                    $('#system-error .content').html('You are not authorized to edit episodes in this channel.');
                    $.blockUI.defaults.overlayCSS.opacity = '0.9';
                    $.blockUI({
                        message: $('#system-error')
                    });
                    return;
                }
                nn.api('GET', '/api/channels/' + episode.channelId, null, function (channel) {
                    if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                        $('body').addClass('has-error');
                        $('#system-error .content').html('The favorites channel can not be edited.');
                        $.blockUI.defaults.overlayCSS.opacity = '0.9';
                        $.blockUI({
                            message: $('#system-error')
                        });
                        return;
                    }
                    crumb = $.extend({}, crumb, episode);
                    $('#epcurate-info-tmpl').tmpl(crumb).appendTo('#epcurate-info');
                    $('#epcurate-nav-curation, #epcurate-nav-publish, #form-btn-save, #form-btn-next').click(function (e) {
                        $(fm).trigger('submit', e);
                        return false;
                    });
                });
            });
        });
    }
}

function listEpisode(id) {
    if (id > 0 && !isNaN(id) && CMS_CONF.USER_DATA.id) {
        nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels', null, function (data) {
            var channelIds = [];
            if (data.length > 0) {
                $.each(data, function (i, list) {
                    channelIds.push(list.id);
                });
            }
            if (-1 === $.inArray(parseInt(id, 10), channelIds)) {
                $('body').addClass('has-error');
                $('#system-error .content').html('You are not authorized to edit episodes in this channel.');
                $.blockUI.defaults.overlayCSS.opacity = '0.9';
                $.blockUI({
                    message: $('#system-error')
                });
                return;
            }
            nn.api('GET', '/api/channels/' + id, null, function (channel) {
                // setup channel data
                $('#episode-nav-tmpl').tmpl(channel).appendTo('#content-nav');
                $('#channel-name').text(channel.name);
                $('#episode-curate').attr('href', 'epcurate-info.html?cid=' + id);
                if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                    $('#title-func p').remove();
                    nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/my_favorites', null, function (favorites) {
                        var cntEpisode = favorites.length;
                        $('#episode-counter').html(cntEpisode);
                        $('#content-main-wrap .constrain').html('');
                        if (cntEpisode > 0) {
                            $('#episode-favorite-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                            $('#episode-favorite-list-tmpl-item').tmpl(favorites, {
                                timeConverter: function (timestamp) {
                                    var a = new Date(timestamp),
                                        year = a.getFullYear(),
                                        month = a.getMonth() + 1,
                                        date = a.getDate(),
                                        hour = a.getHours(),
                                        min = a.getMinutes(),
                                        time = year + '-'
                                             + ((month >= 10) ? month : '0' + month) + '-'
                                             + ((date >= 10) ? date : '0' + date) + ' '
                                             + ((hour >= 10) ? hour : '0' + hour) + ':'
                                             + ((min >= 10) ? min : '0' + min);
                                    return time;
                                }
                            }).appendTo('#episode-list');
                            autoHeight();
                            scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
                        } else {
                            $('#episode-favorite-first-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                        }
                    });
                } else {
                    nn.api('GET', '/api/channels/' + id + '/episodes', null, function (episodes) {
                        var cntEpisode = episodes.length;
                        $('#episode-counter').html(cntEpisode);
                        $('#content-main-wrap .constrain').html('');
                        if (cntEpisode > 0) {
                            $('#episode-list-tmpl').tmpl().appendTo('#content-main-wrap .constrain');
                            $('#episode-list-tmpl-item').tmpl(episodes, {
                                timeConverter: function (timestamp) {
                                    var a = new Date(timestamp),
                                        year = a.getFullYear(),
                                        month = a.getMonth() + 1,
                                        date = a.getDate(),
                                        hour = a.getHours(),
                                        min = a.getMinutes(),
                                        time = year + '-'
                                             + ((month >= 10) ? month : '0' + month) + '-'
                                             + ((date >= 10) ? date : '0' + date) + ' '
                                             + ((hour >= 10) ? hour : '0' + hour) + ':'
                                             + ((min >= 10) ? min : '0' + min);
                                    return time;
                                }
                            }).appendTo('#episode-list');
                            autoHeight();
                            scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
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
                    });
                }
            });
        });
    } else {
        $('body').addClass('has-error');
        $('#system-error .content').html('Invalid channel ID, please try again.');
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
        return;
    }
}

function updateChannel(id) {
    if (id > 0 && !isNaN(id) && CMS_CONF.USER_DATA.id) {
        nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels', null, function (data) {
            var channelIds = [];
            if (data.length > 0) {
                $.each(data, function (i, list) {
                    channelIds.push(list.id);
                });
            }
            if (-1 === $.inArray(parseInt(id, 10), channelIds)) {
                $('body').addClass('has-error');
                $('#system-error .content').html('You are not authorized to edit this channel.');
                $.blockUI.defaults.overlayCSS.opacity = '0.9';
                $.blockUI({
                    message: $('#system-error')
                });
                return;
            }
            nn.api('GET', '/api/channels/' + id, null, function (channel) {
                if (channel.contentType == CMS_CONF.YOUR_FAVORITE) {
                    $('body').addClass('has-error');
                    $('#system-error .content').html('The favorites channel can not be edited.');
                    $.blockUI.defaults.overlayCSS.opacity = '0.9';
                    $.blockUI({
                        message: $('#system-error')
                    });
                    return;
                }
                // setup channel data
                $('#func-nav .episode').attr('href', 'episode-list.html?id=' + id);
                $('#func-nav .setting').attr('href', 'channel-setting.html?id=' + id);
                $('#channel-name').text(channel.name);
                $('#name').val(channel.name);
                $('#imageUrl').val(channel.imageUrl);
                if ('' != $.trim(channel.imageUrl)) {
                    $('#thumbnail-imageUrl').attr('src', channel.imageUrl + '?n=' + Math.random());
                }
                $('#intro').val(channel.intro);
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
                    nn.api('GET', '/api/categories', { lang: sphere }, function (categories) {
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
                            nn.api('GET', '/api/tags', { categoryId: channel.categoryId }, function (tags) {
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
                $('#tag').val(channel.tag);
                $('#settingForm .btn-save').removeClass('disable').addClass('enable');
            });
        });
    } else {
        $('body').addClass('has-error');
        $('#system-error .content').html('Invalid channel ID, please try again.');
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
        return;
    }
}

function createChannel() {
    $('#settingForm .btn-cancel, #settingForm .btn-create').removeClass('disable').addClass('enable');
}

function listChannel() {
    if (CMS_CONF.USER_DATA.id) {
        nn.api('GET', '/api/users/' + CMS_CONF.USER_DATA.id + '/channels', null, function (channels) {
            var cntChannel = channels.length;
            $('#channel-counter').html(cntChannel);
            if (cntChannel > 0) {
                var items = [],
                    temp = [];
                $.each(channels, function (i, list) {
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
                    userId: CMS_CONF.USER_DATA.id,
                    timeConverter: function (timestamp) {
                        var a = new Date(timestamp),
                            year = a.getFullYear(),
                            month = a.getMonth() + 1,
                            date = a.getDate(),
                            hour = a.getHours(),
                            min = a.getMinutes(),
                            time = year + '-'
                                 + ((month >= 10) ? month : '0' + month) + '-'
                                 + ((date >= 10) ? date : '0' + date) + ' '
                                 + ((hour >= 10) ? hour : '0' + hour) + ':'
                                 + ((min >= 10) ? min : '0' + min);
                        return time;
                    }
                }).appendTo('#channel-list');
                autoHeight();
                scrollbar('#content-main', '#content-main-wrap', '#main-wrap-slider');
            } else {
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
        });
    } else {
        location.href = '../';
    }
}

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
    var cmsCrumb = {};
    if ($.cookie('cms-crumb')) {
        cmsCrumb = $.url('http://fake.url.dev.teltel.com/?' + $.cookie('cms-crumb')).param();
    }
    if ('undefined' === typeof cid) {
        if (!cmsCrumb.channelId && CMS_CONF.USER_URL.param('cid')) {
            cmsCrumb.channelId = CMS_CONF.USER_URL.param('cid');
        }
    } else {
        cmsCrumb.channelId = cid;
    }
    if ('undefined' === typeof eid) {
        if (!cmsCrumb.id && CMS_CONF.USER_URL.param('id')) {
            cmsCrumb.id = CMS_CONF.USER_URL.param('id');
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
    $('#form-btn-back').attr('href', $('#form-btn-back').attr('href') + qrystr);
    $('#form-btn-next').attr('href', $('#form-btn-next').attr('href') + qrystr);
    if (cmsCrumb.id) { $('#id').val(cmsCrumb.id); }
    if (cmsCrumb.channelId) { $('#channelId').val(cmsCrumb.channelId); }

    return cmsCrumb;
}
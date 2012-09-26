$(function () {
    function setSpace() {
        var epcurateNavHeight = $('#epcurate-nav').height();
        var autoHeight = $('p.auto-height:first').height();
        var windowHeight = $(window).height();
        var curationHeight = $('#epcurate-curation').height() - (autoHeight * 2);
        var storyboardHeight = $('#storyboard').height() - (autoHeight * 2);
        var btnsHeight = $('#content-main .form-btn').height();
        var extraHeight = windowHeight - curationHeight - storyboardHeight - btnsHeight - epcurateNavHeight;
        var windowWidth = $(window).width();
        var videoWidth = $('#epcurate-curation #video-player .video').width();
        var curAddWidth = $('#epcurate-curation #cur-add').width();
        var curEditWidth = $('#epcurate-curation #cur-edit').width();
        $('p.auto-height').height(extraHeight / 4);
        if (windowWidth > 1016) {
            $('#epcurate-curation #cur-add').css('padding-left', (windowWidth - videoWidth - curAddWidth) / 2 + 'px');
            $('#epcurate-curation #cur-edit').css('padding-left', (windowWidth - videoWidth - curEditWidth) / 2 + 'px');
        }
        // TODO check
        nn.log({
            epcurateNavHeight: epcurateNavHeight,
            autoHeight: autoHeight,
            windowHeight: windowHeight,
            curationHeight: curationHeight,
            storyboardHeight: storyboardHeight,
            btnsHeight: btnsHeight,
            extraHeight: extraHeight,
            windowWidth: windowWidth,
            videoWidth: videoWidth,
            curAddWidth: curAddWidth,
            curEditWidth: curEditWidth
        });
    }
    setSpace();
    scrollbar("#storyboard-wrap", "#storyboard-list", "#storyboard-slider");

    // uniform
    $('#cur-edit input, #cur-edit textarea, #cur-edit select').uniform();

    // storyboard sortable
    $('#storyboard-list').sortable({
        cursor: 'move',
        revert: true
    });

    // common unblock
    $('body').keyup(function (e) {
        if (e.keyCode === 27) {
            $.unblockUI();
            if ($(this).hasClass('has-error')) {
                location.replace($('#form-btn-leave').data('leaveUrl'));
            }
            return false;
        }
    });
    $('#system-error .btn-ok, #system-error .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            location.replace($('#form-btn-leave').data('leaveUrl'));
        }
        return false;
    });

    // leave and unsave
    var hasFormChange = false;
    $('#epcurateForm').change(function () {
        hasFormChange = true;
    });
    $('#epcurate-nav-back').click(function () {
        if (hasFormChange) {
            $.blockUI.defaults.overlayCSS.opacity = '0.9';
            $.blockUI({
                message: $('#unsave-prompt')
            });
            return false;
        } else {
            location.href = $(this).attr('href');
            return false;
        }
    });
    $('#content-wrap .form-btn').on('click', '#form-btn-leave', function () {
        if (hasFormChange) {
            $.blockUI.defaults.overlayCSS.opacity = '0.9';
            $.blockUI({
                message: $('#unsave-prompt')
            });
            return false;
        } else {
            location.href = $('#form-btn-leave').data('leaveUrl');
            return false;
        }
    });
    $('#unsave-prompt .btn-leave').click(function () {
        $.unblockUI();
        location.href = $('#form-btn-leave').data('leaveUrl');
        return false;
    });
    $('.unblock, .btn-close, .btn-no').click(function () {
        $.unblockUI();
        return false;
    });

    // common tabs
    $('#epcurate-curation ul.tabs li a').click(function () {
        var showBlock = $(this).attr('href').split('#');
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $(this).parent().parent().addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#' + showBlock[1]).removeClass('hide');
        return false;
    });

    // YouTube tab
    $('.yt-category li a').not('.yt-category li.last a').click(function () {
        var showBlock = $(this).attr('href').split('#');
        $('.yt-category li').removeClass('on');
        $(this).parent().addClass('on');
        $('#cur-youtube .result-list').addClass('hide');
        $('#' + showBlock[1]).removeClass('hide');
        return false;
    });

    // Add Video
    $('#cur-add textarea').toggleVal();
    $('#cur-add textarea').click(function () {
        $('#cur-add .notice').fadeOut();
    });
    $('#btn-add-videourl').click(function () {
        // TODO total video left and total duration
        // TODO You have reached the maximum amount of 50 videos.
        var videoUrl = $.trim($('#videourl').val()),
            urlList = videoUrl.split('\n'),
            patternLong = /^http(?:s)?:\/\/www.youtube.com\/watch\?/,
            patternShort = /^http(?:s)?:\/\/youtu.be\//,
            matchKey = '',
            matchList = [],
            normalList = [],
            existList = [],
            invalidList = [];
        if ('Paste YouTube video URLs to add (separate with different lines)' === videoUrl) {
            $('#videourl').get(0).focus();
            return false;
        }
        $('#storyboard-list li').each(function () {
            existList.push($(this).data('ytid'));
        });
        $.each(urlList, function (i, url) {
            if (patternLong.test(url)) {
                matchKey = $.url(url).param('v');
            } else if (patternShort.test(url)) {
                matchKey = $.url(url).segment(1);
            } else {
                matchKey = '';
            }
            if ('' == matchKey || matchKey.length !== 11) {
                matchKey = '';
                invalidList.push(url);
            }
            if ('' !== matchKey && -1 === $.inArray(matchKey, existList) && -1 === $.inArray(matchKey, matchList)) {
                matchList.push(matchKey);
            }
        });
        if (matchList.length > 0) {
            normalList = jQuery.map(matchList, function (k, i) {
                return 'http://www.youtube.com/watch?v=' + k;
            });
            var ytData = null,
                ytItem = {},
                ytList = [];
            $.each(matchList, function (idx, key) {
                nn.on(400, function (jqXHR, textStatus) {
                    invalidList.push(normalList[idx]);
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
                    nn.log(normalList[idx], 'debug');
                    $('#videourl').val(invalidList.join('\n'));
                    $('#cur-add .notice').text('Invalid URL, please try again.').show();
                    if (idx === (matchList.length - 1)) {
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
                        }, 1000);
                    }
                });
                nn.on(404, function (jqXHR, textStatus) {
                    invalidList.push(normalList[idx]);
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
                    nn.log(normalList[idx], 'debug');
                    $('#videourl').val(invalidList.join('\n'));
                    $('#cur-add .notice').text('Invalid URL, please try again.').show();
                    if (idx === (matchList.length - 1)) {
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
                        }, 1000);
                    }
                });
                nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + key + '?alt=jsonc&v=2', null, function (youtubes) {
                    ytData = $.parseJSON(youtubes).data;
                    ytItem = {
                        ytId: ytData.id,
                        fileUrl: normalList[idx],
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
                    ytList.push(ytItem);
                    if (idx === (matchList.length - 1)) {
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
                        }, 1000);
                    }
                });
            });
        }
        $('#videourl').val('');
        if (invalidList.length > 0) {
            $('#videourl').val(invalidList.join('\n'));
            $('#cur-add .notice').text('Invalid URL, please try again.').show();
        }
        return false;
    });
    $('#cur-add .checkbox a').click(function () {
        $(this).toggleClass('on');
    });

    // video play
    $('#storyboard').on('click', '.storyboard-list ul li .hover-func a.video-play', function () {
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#cur-edit .edit-title').addClass('hide');
        $('#cur-edit .edit-time').removeClass('hide');
        $('#video-control').hide();

        // video-info-tmpl (play action)
        var elemtli = $(this).parent().parent();
        buildVideoInfo(elemtli);
        playVideoAndTitlecard(elemtli);

        $('#storyboard li').removeClass('playing').removeClass('next-playing');
        elemtli.addClass('playing');
        elemtli.next().addClass('next-playing');
        return false;
    });

    // video del
    // TODO if video have programId to keep DELETE programIds list
    // TODO update total video left and total duration after del
    $('#storyboard-list').on('click', 'li .hover-func a.video-del', function () {
        var length = $('#storyboard-list li').length;
        var eq = $('#storyboard-list li.playing').index();
        var deleting = $(this).parent().parent();
        if (deleting.hasClass('playing') && (length - eq - 1) > 0) {
            // video-info-tmpl (auto turn by del)
            var elemtli = deleting.next('li');
            buildVideoInfo(elemtli);
            playVideoAndTitlecard(elemtli);

            $('#storyboard li').removeClass('playing').removeClass('next-playing');
            elemtli.addClass('playing');
            elemtli.next().addClass('next-playing');
            deleting.remove();
        } else {
            if (length > 1) {
                if (deleting.hasClass('playing') && (length - eq - 1) == 0) {
                    // TODO return to first video OR close Edit tab and active Add Video tab
                    $('#video-player .video').html('');
                    $('#video-info').html('');
                }
                deleting.remove();
            } else {
                $('#system-error .content').html('There must be at least one video in this episode.');
                $.blockUI.defaults.overlayCSS.opacity = '0.9';
                $.blockUI({
                    message: $('#system-error')
                });
            }
        }
        return false;
    });

    // edit and preview titlecard (exist)
    $('#storyboard .storyboard-list ul li .title a').click(function () {
        $('#storyboard-list li').removeClass('edit');
        $(this).parent().parent().addClass('edit');
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#cur-edit .edit-time').addClass('hide');
        $('#cur-edit .edit-title').removeClass('hide').removeClass('disable');
        $('#cur-edit .select').attr('class', 'select enable');
        $('#cur-edit input, #cur-edit textarea').removeAttr('disabled');
        $('#cur-edit .radio, #cur-edit .checker').removeClass('disabled');
        $('#video-control').show();

        var index = $(this).parent().parent().index(),
            elemt = $('#storyboard-list li:gt(' + index + ')').data('title');
        if (elemt && elemt.text) {
            //var tmpl = $('#titlecard-tmpl').tmpl(elemt);
            //$('#video-player .video').html(tmpl);
            $('#video-player .video').titlecard(elemt, function () {
                // call back after title card played
            });
        }
        return false;
    });

    // add titlecard (none)
    $('#storyboard .storyboard-list ul li .hover-func a.begin-title, #storyboard .storyboard-list ul li .hover-func a.end-title').click(function () {
        $('#storyboard-list li').removeClass('edit');
        $(this).parent().parent().addClass('edit');
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#cur-edit .edit-time').addClass('hide');
        $('#cur-edit .edit-title').removeClass('hide');
        $('#cur-edit .edit-title').addClass('disable');
        $('#cur-edit input, #cur-edit textarea').attr('disabled', 'disabled');
        $('#cur-edit .radio, #cur-edit .checker').addClass('disabled');
        $('#video-control').show();
        $('#video-player .video').html('');
        return false;
    });

    // titlecard control
    $('#btn-play').click(function () {
        var index = $('#storyboard-list li.edit').index(),
            elemt = $('#storyboard-list li:gt(' + index + ')').data('title');
        $(this).addClass('hide');
        $('#btn-pause').removeClass('hide');
        $('#video-player .video').titlecard(elemt);
    });
    $('#btn-pause').click(function () {
        $(this).addClass('hide');
        $('#btn-play').removeClass('hide');
        $('#video-player .video').titlecard('cancel');
        $('#video-player .video .wrapper-outer, #video-player .video .wrapper-inner').show();
    });

    // enter titlecard edit mode
    $('#cur-edit .edit-title .btn-edit').click(function () {
        $('#cur-edit .edit-title').removeClass('disable');
        $('#cur-edit .select').attr('class', 'select enable');
        $('#cur-edit input, #cur-edit textarea').removeAttr('disabled');
        $('#cur-edit .radio, #cur-edit .checker').removeClass('disabled');
        return false;
    });

    // leave titlecard edit mode
    $('#cur-edit .edit-title .btn-cancel, #cur-edit .edit-title .btn-done, #cur-edit .edit-title .btn-del').click(function () {
        $('#cur-edit .edit-title').addClass('disable');
        $('#cur-edit .select').attr('class', 'select disable');
        $('#cur-edit input, #cur-edit textarea').attr('disabled', 'disabled');
        $('#cur-edit .radio, #cur-edit .checker').addClass('disabled');
        return false;
    });

    // edit select dropdown
    $('#cur-edit').on('click', '.enable .select-btn, .enable .select-txt', function (event) {
        $('.select-list').hide();
        $(this).parent().siblings().children(".on").removeClass("on");
        $(this).parent().children('.select-btn').toggleClass("on");
        if ($(this).parent().children('.select-btn').hasClass('on')) {
            $(this).parent().children('.select-list').slideDown();
        } else {
            $(this).parent().children('.select-list').hide();
        }
        event.stopPropagation();
    });
    $('#cur-edit .select .select-list li').click(function () {
        var selectOption = $(this).text();
        $(this).parent().parent().children('.select-btn').removeClass('on');
        $(this).parent().parent().children('.select-txt').children().text(selectOption);
        $(this).parent().hide();
        $(this).parent().next('input').val($(this).data('meta'));
        return false;
    });
    $('#cur-edit .edit-title .effect-container .select-list li').click(function () {
        var selectedEffect = $(this).data('meta');
        $('#epcurate-curation #cur-edit .effect-container p.effect-demo span').effect(selectedEffect, 2000);
        setTimeout(function () {
            $('#epcurate-curation #cur-edit .effect-container p.effect-demo span').removeAttr('style').hide().fadeIn();
        }, 2000);
    });

    // background switch
    function switchBackground(flag) {
        if ('image' == flag) {
            $('#cur-edit .background-container .bg-color').addClass('hide');
            $('#cur-edit .background-container .bg-img').removeClass('hide');
        } else {
            $('#cur-edit .background-container .bg-color').removeClass('hide');
            $('#cur-edit .background-container .bg-img').addClass('hide');
        }
    }
    switchBackground($('input[name=bg]:checked').val());
    $('input[name=bg]').click(function () {
        switchBackground($(this).val());
    });

    // color picker
    $('.color-list li').click(function() {
        var colorCode = $(this).attr('class');
        $(this).parent().prev('span').attr('class', colorCode);
        $(this).parent().parent().next('input').val($(this).data('meta'));
    });

    // save
    $('#epcurateForm').submit(function (e, src) {
        var isInsertMode = ('' == $('#id').val());
        // Episode Curation - Curation
        if ($(e.target).hasClass('curation') && chkCurationData(this)) {
            $('#overlay-s .overlay-middle').html('Saving...');
            $('#overlay-s').fadeIn();
            $('#overlay-s .overlay-content').css('margin-left', '-43px');
            var totalDuration = 0,
                firstImageUrl = $('#storyboard-list li:first').tmplItem().data.imageUrl,
                tmplItem = null,
                tmplItemData = {},
                programItem = {},
                programList = [];
            $('#storyboard-list li').each(function (i) {
                tmplItemData = $(this).tmplItem().data;
                totalDuration += tmplItemData.duration;
                programItem = {
                    channelId: $('#channelId').val(),
                    subSeq: i + 1,
                    intro: tmplItemData.intro,
                    name: tmplItemData.name,
                    imageUrl: tmplItemData.imageUrl,
                    duration: tmplItemData.duration,
                    fileUrl: tmplItemData.fileUrl,
                    contentType: 1
                };
                programList.push(programItem);
            });
            if (isInsertMode) {
                // create episode --> create programs --> update episode with rerun
                var parameter = {
                    name: $('#name').val(),
                    intro: $('#intro').val(),
                    duration: totalDuration,
                    imageUrl: firstImageUrl
                };
                // create episode
                nn.api('POST', '/api/channels/' + $('#channelId').val() + '/episodes', parameter, function (episode) {
                    // from insert mode change to update mode
                    // rebuild cookie and hidden episode id
                    rebuildCrumbAndParam($('#channelId').val(), episode.id);
                    $.each(programList, function (idx, programItem) {
                        // create programs
                        nn.api('POST', '/api/episodes/' + episode.id + '/programs', programItem, function (program) {
                            // update program.id
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            tmplItemData.id = program.id;
                            tmplItem.update();
                            if (idx === (programList.length - 1)) {
                                // update episode with rerun
                                nn.api('PUT', '/api/episodes/' + episode.id, { rerun: true }, function (episode) {
                                    $('#overlay-s').hide();
                                    $('#overlay-s .overlay-middle').html('Changes were saved successfully');
                                    $('#overlay-s .overlay-content').css('margin-left', '-132px');
                                    $('#overlay-s').fadeIn().delay(3000).fadeOut(0, function () {
                                        // redirect
                                        if (!src                                                                                        // from nature action
                                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                                            return false;
                                        } else {
                                            var nextstep = 'epcurate-curation.html';
                                            if (src && '' !== $(src.target).attr('href')) {
                                                nextstep = $(src.target).attr('href');
                                            }
                                            location.href = nextstep;
                                        }
                                    });
                                });
                            }
                        });
                    });
                });
            } else {
                alert('TODO update.');
                // TODO PUT /api/episodes/{episodesId}
                // TODO duration
                // TODO first POST and PUT then DELETE
                // TODO insert programs POST /api/episodes/{episodeId}/programs
                // TODO update programs PUT /api/programs/{programId}
                // TODO DELETE /api/programs/{programId} if any DELETE programIds list
            }
        }
        return false;
    });

    $(window).resize(function () {
        setSpace();
        scrollbar("#storyboard-wrap", "#storyboard-list", "#storyboard-slider");
    });
});

function chkCurationData(fm) {
    var cntEpisode = $('#storyboard-list li').length;
    if (cntEpisode <= 0) {
        $('#system-error .content').html('There must be at least one video in this episode.');
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
        return false;
    }
    if (cntEpisode > 50) {
        $('#system-error .content').html('You have reached the maximum amount of 50 videos.');
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
        return false;
    }
    return true;
}

function loadVideo(videoID) {
    var videoWidth = $('#video-player .video').width();
    var videoHeight = $('#video-player .video').height();
    $('#video-player .video').flash({
        id: 'youTubePlayer',
        swf: 'http://www.youtube.com/v/' + videoID + '?version=3&enablejsapi=1&playerapiid=player1&autohide=0',
        style: 'vertical-align: middle;',
        width: videoWidth,
        height: videoHeight,
        hasVersion: 9,
        allowScriptAccess: 'always',
        allowFullScreen: false,
        quality: 'high',
        menu: false,
        bgcolor: '#000000',
        wmode: 'transparent',
        flashvars: false
    });
    $('#video-player #video-control').hide();
}

function onYouTubePlayerReady(playerId) {
    // NO DECLARE VAR youTubePlayerObj ON PURPOSE to let it be global
    youTubePlayerObj = document.getElementById("youTubePlayer");
    youTubePlayerObj.playVideo();
    youTubePlayerObj.addEventListener("onStateChange", "onYouTubePlayerStateChange");
}

function onYouTubePlayerStateChange(newState) {
    var length = $('#storyboard-list li').length;
    var eq = $('#storyboard-list li.playing').index();
    // unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
    if (-1 == newState) {
        youTubePlayerObj.playVideo();
    }
    if (0 == newState && (length - eq - 1) > 0) {
        // video-info-tmpl (auto turn by play)
        var activeID = $('#storyboard-list li.playing').children('.video-id').val();
        var elemtli = $('#storyboard-list li.next-playing');
        buildVideoInfo(elemtli);
        playVideoAndTitlecard(elemtli);

        $('#storyboard-list li').removeClass('playing');
        $('.next-playing').attr('class', 'playing');
        $('.playing').next().addClass('next-playing');
    }
}

function buildVideoInfo(elemt) {
    // video-info-tmpl
    $('#video-info').html('');
    $('#video-info-tmpl').tmpl(elemt.tmplItem().data, {
        // TODO conver uploaded from timestamp
        uploadDateConverter: function (uploadDate) {
            var datetemp = uploadDate.split('T');
            return datetemp[0];
        },
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
    }).prependTo('#video-info');
}

function playVideoAndTitlecard(elemtli) {
    if (elemtli.children('.title').length > 0) {
        var index = elemtli.index(),
            elemt = $('#storyboard-list li:gt(' + index + ')').data('title');
        if (elemt && elemt.text) {
            $('#video-player .video').titlecard(elemt, function () {
                setTimeout(function() {
                    loadVideo(elemtli.data('ytid'));
                }, elemt.duration);
            });
        }
    } else {
        loadVideo(elemtli.data('ytid'));
    }
}
$(function () {
    setSpace();
    scrollbar("#storyboard-wrap", "#storyboard-list", "#storyboard-slider");

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
    function confirmExit() {
        if ($('body').hasClass('has-change')) {
            return 'Unsaved changes will be lost, are you sure you want to leave?';
        }
    }
    window.onbeforeunload = confirmExit;
    $('body').removeClass('has-change');
    $('#epcurateForm').change(function () {
        $('body').addClass('has-change');
    });
    $('#epcurate-nav-back').click(function () {
        if ($('#name').length > 0 && '' != $('#name').val() && '' == $('#id').val()) {
            $('body').addClass('has-change');
        }
        if ($('body').hasClass('has-change')) {
            $.blockUI.defaults.overlayCSS.opacity = '0.9';
            $.blockUI({
                message: $('#unsave-prompt')
            });
        } else {
            location.href = $(this).attr('href');
        }
        return false;
    });
    $('#content-wrap .form-btn').on('click', '#form-btn-leave', function () {
        if ($('#name').length > 0 && '' != $('#name').val() && '' == $('#id').val()) {
            $('body').addClass('has-change');
        }
        if ($('body').hasClass('has-change')) {
            $.blockUI.defaults.overlayCSS.opacity = '0.9';
            $.blockUI({
                message: $('#unsave-prompt')
            });
        } else {
            location.href = $('#form-btn-leave').data('leaveUrl');
        }
        return false;
    });
    $('#unsave-prompt .btn-leave').click(function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        location.href = $('#form-btn-leave').data('leaveUrl');
        return false;
    });
    $('.unblock, .btn-close, .btn-no').click(function () {
        $.unblockUI();
        return false;
    });

    // uniform
    $('#cur-edit input, #cur-edit textarea, #cur-edit select').uniform();

    // storyboard sortable
    $('#storyboard-listing').sortable({
        cursor: 'move',
        revert: true,
        change: function (event, ui) {
            $('body').addClass('has-change');
        }
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
    $('#epcurate-curation ul.tabs li a.cur-add').click(function () {
        $('#epcurate-curation .tabs li').addClass('hide');
        $(this).parent().parent().removeClass('hide').addClass('last');
        $('#video-player .video').html('');
        $('#storyboard-list li').attr('class', '');
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
        $('#cur-add .notice').addClass('hide').hide();
    });
    $('#btn-add-videourl').click(function () {
        $('#cur-add .notice').addClass('hide').hide();
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
            $('#cur-add .notice').text('Paste YouTube video URLs to add (separate with different lines).').removeClass('hide').show();
            return false;
        }
        $('#storyboard-list li').each(function () {
            existList.push($(this).data('ytid'));
        });
        $.each(urlList, function (i, url) {
            url = $.trim(url);
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
            if ('' !== matchKey) {
                matchList.push(matchKey);
            }
        });
        if (matchList.length > 0) {
            normalList = jQuery.map(matchList, function (k, i) {
                return 'http://www.youtube.com/watch?v=' + k;
            });
            if ((existList.length + matchList.length) > CMS_CONF.PROGRAM_MAX) {
                $('#videourl').val(normalList.join('\n'));
                $('#cur-add .notice').text('You have reached the maximum amount of 50 videos.').removeClass('hide').show();
                return false;
            }
            $('body').addClass('has-change');
            $('#overlay-s .overlay-middle').html('Processing...');
            $('#overlay-s').fadeIn();
            $('#overlay-s .overlay-content').css('margin-left', '-65px');
            var ytData = null,
                ytItem = {},
                ytList = [];
            $.each(matchList, function (idx, key) {
                nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                    invalidList.push(normalList[idx]);
                    nn.log(textStatus + ': ' + jqXHR.responseText, 'warning');
                    nn.log(normalList[idx], 'debug');
                    $('#videourl').val(invalidList.join('\n'));
                    $('#cur-add .notice').text('Invalid URL, please try again!').removeClass('hide').show();
                    if (idx === (matchList.length - 1)) {
                        // ON PURPOSE to wait api (async)
                        setTimeout(function () {
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
                nn.api('GET', 'http://gdata.youtube.com/feeds/api/videos/' + key + '?alt=jsonc&v=2', null, function (youtubes) {
                    ytData = youtubes.data;
                    ytItem = {
                        beginTitleCard: null,
                        endTitleCard: null,
                        id: 0,
                        ytId: ytData.id,
                        fileUrl: normalList[idx],
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
                    ytList[idx] = ytItem;
                    if (idx === (matchList.length - 1)) {
                        // ON PURPOSE to wait api (async)
                        setTimeout(function () {
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
                }, 'json');
            });
        }
        $('#videourl').val('');
        if (invalidList.length > 0) {
            $('#videourl').val(invalidList.join('\n'));
            $('#cur-add .notice').text('Invalid URL, please try again.').removeClass('hide').show();
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
        elemtli.prev().addClass('prev-playing');
        return false;
    });

    // video del
    // if video have programId to keep DELETE programIds list
    var deleteIdList = [];
    $('#storyboard-list').on('click', 'li .hover-func a.video-del', function () {
        $('body').addClass('has-change');
        var length = $('#storyboard-list li').length,
            eq = $('#storyboard-list li.playing').index(),
            deleting = $(this).parent().parent(),
            tmplItemData = deleting.tmplItem().data;
        if (deleting.hasClass('playing') && (length - eq - 1) > 0) {
            // video-info-tmpl (auto turn by del)
            var elemtli = deleting.next('li');
            buildVideoInfo(elemtli);
            playVideoAndTitlecard(elemtli);

            $('#storyboard li').removeClass('playing').removeClass('next-playing');
            elemtli.addClass('playing');
            elemtli.next().addClass('next-playing');
            if (tmplItemData.id && tmplItemData.id > 0) {
                deleteIdList.push(tmplItemData.id);
            }
            deleting.remove();
        } else {
            if (length > 1) {
                if (deleting.hasClass('playing') && (length - eq - 1) == 0) {
                    // video-info-tmpl (auto turn by del)
                    // return to first video
                    var elemtli = $('#storyboard-list li:first');
                    buildVideoInfo(elemtli);
                    playVideoAndTitlecard(elemtli);

                    $('#storyboard li').removeClass('playing').removeClass('next-playing');
                    elemtli.addClass('playing');
                    elemtli.next().addClass('next-playing');
                }
                if (tmplItemData.id && tmplItemData.id > 0) {
                    deleteIdList.push(tmplItemData.id);
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
        nn.log(deleteIdList, 'debug');
        sumStoryboardInfo();
        return false;
    });

    // edit and preview titlecard (exist)
    $('#storyboard-listing li .title').on('click', '.begin-title, .end-title', function () {
        $('#storyboard-list li').removeClass('edit');
        $(this).parent().parent().addClass('edit');
        $(this).addClass('edit');
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
            elemt = $('#storyboard-list li:eq(' + index + ')').data('title');
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
    $('#storyboard-listing li .hover-func').on('click', 'a.begin-title, a.end-title', function () {
        $('#storyboard-list li').removeClass('edit');
        $(this).parent().parent().addClass('edit');
        $(this).addClass('edit');
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
        var width = $('#video-player').width();
        var index = $('#storyboard-list li.edit').index(),
            elemt = $('#storyboard-list li:eq(' + index + ')').data('title');
        var tmpl = $('#titlecard-tmpl').tmpl(elemt);

        $(this).addClass('hide');
        $('#btn-pause').removeClass('hide');
        $('#video-player .video').titlecard(elemt);
        $('#play-dragger').animate({
            left: '+=' + parseInt(width - 18, 10)   // 18:drag icon width
        }, parseInt(elemt.duration * 1000, 10), function () {
            $('#video-player .video').html(tmpl);
            $('#play-dragger').css('left', '0');
            $('#btn-play').removeClass('hide');
            $('#btn-pause').addClass('hide');
        });
        $('#played').animate({
            width: '+=' + width
        }, parseInt(elemt.duration * 1000, 10), function () {
            $('#played').css('width', '0');
        });
    });
    $('#btn-pause').click(function () {
        var index = $('#storyboard-list li.edit').index(),
            elemt = $('#storyboard-list li:eq(' + index + ')').data('title');
        var tmpl = $('#titlecard-tmpl').tmpl(elemt);
        $(this).addClass('hide');
        $('#btn-play').removeClass('hide');
        $('#video-player .video').titlecard('cancel');
        $('#video-player .video').html(tmpl);
        $('#play-dragger').stop().css('left', '0');
        $('#played').stop().css('width', '0');
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
    $('#cur-edit .edit-title .btn-cancel, #cur-edit .edit-title .btn-done').click(function () {
        $('#cur-edit .edit-title').addClass('disable');
        $('#cur-edit .select').attr('class', 'select disable');
        $('#cur-edit input, #cur-edit textarea').attr('disabled', 'disabled');
        $('#cur-edit .radio, #cur-edit .checker').addClass('disabled');
        return false;
    });

    // finish titlecard edit
    $('#cur-edit .edit-title .btn-done').click(function () {
        if ($('#storyboard-listing li.edit .hover-func a.edit').hasClass('begin-title')) {
            $('#storyboard-listing li.edit .title').append('<a href="#" class="begin-title edit">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Preview Title</span></span></span></span></a>');
        } else {
            $('#storyboard-listing li.edit .title').append('<a href="#" class="end-title edit">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Preview Title</span></span></span></span></a>');
        }
        $('#storyboard-listing li.edit .hover-func a.edit').remove();
        $('#epcurate-curation .tabs li').addClass('hide');
        $('#epcurate-curation .tabs li.first').removeClass('hide').addClass('last');
        $('#cur-edit').addClass('hide');
        $('#cur-add').removeClass('hide');
        $('#video-player .video').html('');
        $('#storyboard-list li').attr('class', '');
    });

    // del titlecard
    $('#cur-edit .edit-title .btn-del').click(function () {
        if ($('#storyboard-listing li.edit .title a.edit').hasClass('begin-title')) {
            $('#storyboard-listing li.edit .hover-func').append('<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>');
        } else {
            $('#storyboard-listing li.edit .hover-func').append('<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>');
        }
        $('#storyboard-listing li .title a.edit').remove();
        $('#epcurate-curation .tabs li').addClass('hide');
        $('#epcurate-curation .tabs li.first').removeClass('hide').addClass('last');
        $('#cur-edit').addClass('hide');
        $('#cur-add').removeClass('hide');
        $('#video-player .video').html('');
        $('#storyboard-list li').attr('class', '');
    });

    // font
    $('.font-container .font-l').click(function () {
        $('.font-container .font-s').removeClass('disable');
        var size = parseInt($('#fontSize').val(), 10);
        if (size >= 48) {
            $(this).addClass('disable');
        } else {
            $('#fontSize').val(size += 1);
            $('#titlecard-inner').css('font-size', size + 'pt');
        }
    });
    $('.font-container .font-s').click(function () {
        $('.font-container .font-l').removeClass('disable');
        var size = parseInt($('#fontSize').val(), 10);
        if (size <= 6) {
            $(this).addClass('disable');
        } else {
            $('#fontSize').val(size -= 1);
            $('#titlecard-inner').css('font-size', size + 'pt');
        }
    });
    function switchFontAlign(flag) {
        if ('left' == flag) {
            $('#titlecard-inner').css('text-align', 'left');
        }
        if ('center' == flag) {
            $('#titlecard-inner').css('text-align', 'center');
        }
        if ('right' == flag) {
            $('#titlecard-inner').css('text-align', 'right');
        }
    }
    switchFontAlign($('input[name=align]:checked').val());
    $('input[name=align]').click(function () {
        switchFontAlign($(this).val());
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
        $('#effect').val(selectedEffect);
        setTimeout(function () {
            $('#epcurate-curation #cur-edit .effect-container p.effect-demo span').removeAttr('style').hide().fadeIn();
        }, 2000);
    });
    $('#cur-edit .edit-title .duration-container .select-list li').click(function () {
        var selectedDuration = $(this).data('meta');
        $('#duration').val(selectedDuration);
    });

    // background switch
    function switchBackground(flag) {
        if ('image' == flag) {
            $('#cur-edit .background-container .bg-color').addClass('hide');
            $('#cur-edit .background-container .bg-img').removeClass('hide');
            $('#titlecard-outer img').show();
        } else {
            $('#cur-edit .background-container .bg-color').removeClass('hide');
            $('#cur-edit .background-container .bg-img').addClass('hide');
            $('#titlecard-outer img').hide();
        }
    }
    switchBackground($('input[name=bg]:checked').val());
    $('input[name=bg]').click(function () {
        switchBackground($(this).val());
    });

    // color picker
    $('.color-list li').click(function () {
        var colorCode = $(this).attr('class');
        $(this).parent().prev('span').attr('class', colorCode);
        $(this).parent().parent().next('input').val($(this).data('meta'));
    });
    $('.background-container .color-list li').click(function () {
        var colorCode = $(this).attr('class');
        var selectedBg = $(this).data('meta');
        $('#titlecard-outer').attr('class', colorCode);
        $('#backgroundColor').val(selectedBg);
    });
    $('.font-container .color-list li').click(function () {
        var colorCode = $(this).attr('class');
        var selectedColor = $(this).data('meta');
        $('#titlecard-inner').attr('class', colorCode);
        $('#fontColor').val(selectedColor);
    });

    // save
    $('#epcurateForm').submit(function (e, src) {
        var isInsertMode = ('' == $('#id').val()),
            nextstep = 'epcurate-curation.html';
        // Episode Curation - Curation
        if ($(e.target).hasClass('curation') && chkCurationData(this, src)) {
            $('#overlay-s .overlay-middle').html('Saving...');
            $('#overlay-s').fadeIn();
            $('#overlay-s .overlay-content').css('margin-left', '-43px');
            var totalDuration = 0,
                programLength = $('#storyboard-list li').length,
                firstImageUrl = $('#storyboard-list li:first').tmplItem().data.imageUrl,
                tmplItem = null,
                tmplItemData = {},
                programItem = {},
                programList = [];
            $('#storyboard-list li').each(function (i) {
                programItem = $(this).tmplItem().data;
                totalDuration += programItem.duration;
                $.extend(programItem, {
                    channelId: $('#channelId').val(),   // api readonly
                    subSeq: i + 1,
                    contentType: 1
                });
                programList.push(programItem);
            });
            if (isInsertMode) {
                nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                    // nothing to do ON PURPOSE to turn off error handle from YouTube to 9x9 API
                });
                // insert mode: insert episode --> insert programs --> update episode with rerun
                var parameter = {
                    name: $('#name').val(),
                    intro: $('#intro').val(),
                    imageUrl: firstImageUrl,
                    duration: totalDuration     // api readonly
                };
                // insert episode
                nn.api('POST', '/api/channels/' + $('#channelId').val() + '/episodes', parameter, function (episode) {
                    // from insert mode change to update mode
                    // rebuild cookie and hidden episode id
                    rebuildCrumbAndParam($('#channelId').val(), episode.id);
                    $.each(programList, function (idx, programItem) {
                        // insert program
                        nn.api('POST', '/api/episodes/' + episode.id + '/programs', programItem, function (program) {
                            // update program.id to DOM
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            tmplItemData.id = program.id;
                            tmplItem.update();
                            if (idx === (programList.length - 1)) {
                                // update episode with rerun
                                nn.api('PUT', '/api/episodes/' + episode.id, { rerun: true }, function (episode) {
                                    $('#overlay-s').fadeOut(1000, function () {
                                        // redirect
                                        deleteIdList = [];
                                        $('body').removeClass('has-change');
                                        if (!src                                                                                        // from nature action
                                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                                            return false;
                                        } else {
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
                // update mode
                // !important rule: first POST and PUT then DELETE
                if (!$('body').hasClass('has-change')) {
                    $('#overlay-s').fadeOut(1000, function () {
                        // redirect
                        $('body').removeClass('has-change');
                        if (!src                                                                                        // from nature action
                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                            return false;
                        } else {
                            if (src && '' !== $(src.target).attr('href')) {
                                nextstep = $(src.target).attr('href');
                            }
                            location.href = nextstep;
                        }
                    });
                    return false;
                }
                nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                    // nothing to do ON PURPOSE to turn off error handle from YouTube to 9x9 API
                });
                $('#storyboard-list li').each(function (i) {
                    programItem = $(this).tmplItem().data;
                    if (programItem.id && programItem.id > 0) {
                        // update program
                        $.extend(programItem, {
                            subSeq: i + 1
                        });
                        nn.api('PUT', '/api/programs/' + programItem.id, programItem, function (program) {
                            // nothing to do
                        });
                    } else {
                        // insert program
                        $.extend(programItem, {
                            channelId: $('#channelId').val(),   // api readonly
                            subSeq: i + 1,
                            contentType: 1
                        });
                        nn.api('POST', '/api/episodes/' + $('#id').val() + '/programs', programItem, function (program) {
                            // update program.id to DOM
                            tmplItem = $('#storyboard-list li:eq(' + i + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            tmplItemData.id = program.id;
                            tmplItem.update();
                        });
                    }
                    if (i === (programLength - 1)) {
                        // delete program
                        if (deleteIdList.length > 0) {
                            nn.api('DELETE', '/api/episodes/' + $('#id').val() + '/programs?programs=' + deleteIdList.join(','), null, function (data) {
                                $('#overlay-s').fadeOut(1000, function () {
                                    // redirect
                                    deleteIdList = [];
                                    $('body').removeClass('has-change');
                                    if (!src                                                                                        // from nature action
                                            || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                                        return false;
                                    } else {
                                        if (src && '' !== $(src.target).attr('href')) {
                                            nextstep = $(src.target).attr('href');
                                        }
                                        location.href = nextstep;
                                    }
                                });
                            });
                        } else {
                            $('#overlay-s').fadeOut(1000, function () {
                                // redirect
                                $('body').removeClass('has-change');
                                if (!src                                                                                        // from nature action
                                        || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                                    return false;
                                } else {
                                    if (src && '' !== $(src.target).attr('href')) {
                                        nextstep = $(src.target).attr('href');
                                    }
                                    location.href = nextstep;
                                }
                            });
                        }
                    }
                });
            }
        }
        return false;
    });

    $(window).resize(function () {
        setSpace();
        scrollbar("#storyboard-wrap", "#storyboard-list", "#storyboard-slider");
    });

    // Amazon S3 upload
    if ($('#uploadThumbnail').length > 0) {
        uploadImage();
    }
});

function chkCurationData(fm, src) {
    var cntProgram = $('#storyboard-list li').length;
    if (cntProgram <= 0) {
        if ('' == $('#id').val() && src && ('epcurate-nav-info' === $(src.target).attr('id') || 'form-btn-back' === $(src.target).attr('id'))) {
            $('body').removeClass('has-change');
            var nextstep = 'epcurate-info.html';
            if (src && '' !== $(src.target).attr('href')) {
                nextstep = $(src.target).attr('href');
            }
            location.href = nextstep;
            return false;
        }
        $('#system-error .content').html('Please curate some videos first.');
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
        return false;
    }
    if (cntProgram > CMS_CONF.PROGRAM_MAX) {
        $('#system-error .content').html('You have reached the maximum amount of 50 videos.');
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({
            message: $('#system-error')
        });
        return false;
    }
    return true;
}

function setSpace() {
    var epcurateNavHeight = $('#epcurate-nav').height(),
        autoHeight = $('p.auto-height:first').height(),
        windowHeight = $(window).height(),
        curationHeight = $('#epcurate-curation').height() - (autoHeight * 2),
        storyboardHeight = $('#storyboard').height() - (autoHeight * 2),
        btnsHeight = $('#content-main .form-btn').height(),
        extraHeight = windowHeight - curationHeight - storyboardHeight - btnsHeight - epcurateNavHeight,
        windowWidth = $(window).width(),
        videoWidth = $('#epcurate-curation #video-player .video').width(),
        curAddWidth = $('#epcurate-curation #cur-add').width(),
        curEditWidth = $('#epcurate-curation #cur-edit').width();
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
    }, 'debug');
}

function loadVideo(videoID) {
    var videoWidth = $('#video-player .video').width(),
        videoHeight = $('#video-player .video').height();
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
    var length = $('#storyboard-list li').length,
        eq = $('#storyboard-list li.playing').index();
    // unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
    if (-1 == newState) {
        youTubePlayerObj.playVideo();
    }
    if (0 == newState && (length - eq - 1) > 0) {
        // video-info-tmpl (auto turn by play)
        var activeID = $('#storyboard-list li.playing').children('.video-id').val(),
            elemtli = $('#storyboard-list li.next-playing');
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
        }
    }).prependTo('#video-info');
    $('.ellipsis').ellipsis();
}

function playVideoAndTitlecard(elemtli) {
    if (elemtli.children('.title').length > 0) {
        var index = elemtli.index(),
            elemt = $('#storyboard-list li:eq(' + index + ')').data('title');
        if (elemt && elemt.text) {
            $('#video-player .video').titlecard(elemt, function () {
                setTimeout(function () {
                    loadVideo(elemtli.data('ytid'));
                }, elemt.duration);
            });
            $('#play-dragger').animate({
                left: '+=' + parseInt(width - 18, 10)   // 18:drag icon width
            }, parseInt(elemt.duration * 1000, 10), function () {
                $('#play-dragger').css('left', '0');
            });
            $('#played').animate({
                width: '+=' + width
            }, parseInt(elemt.duration * 1000, 10), function () {
                $('#played').css('width', '0');
            });
        }
    } else {
        loadVideo(elemtli.data('ytid'));
    }
}

function sumStoryboardInfo() {
    var length = $('#storyboard-list li').length,
        leftLength = CMS_CONF.PROGRAM_MAX - length,
        duration = 0;
    if (isNaN(leftLength) || leftLength < 0) {
        leftLength = 0;
    }
    $('#storyboard-list li').each(function (i) {
        duration += $(this).tmplItem().data.duration;
    });
    var durationMin = parseInt(duration / 60, 10),
        durationSec = parseInt(duration % 60, 10),
        durationHou = parseInt(durationMin / 60, 10);
    if (durationHou.toString().length < 2) {
        durationHou = '0' + durationHou;
    }
    if (durationMin >= 60) {
        durationMin = parseInt(durationMin % 60, 10);
    }
    if (durationMin.toString().length < 2) {
        durationMin = '0' + durationMin;
    }
    if (durationSec.toString().length < 2) {
        durationSec = '0' + durationSec;
    }
    $('#storyboard-length').html(leftLength);
    $('#storyboard-duration').html(durationHou + ':' + durationMin + ':' + durationSec);
    $('#storyboard-list .notice').css('left', parseInt((114 * length) + 9, 10) + 'px');
}

function uploadImage() {
    var parameter = {
        'prefix': 'cms',
        'type':   'image',
        'size':   20485760,
        'acl':    'public-read'
    };
    nn.api('GET', '/api/s3/attributes?anticache=' + (new Date()).getTime(), parameter, function (s3attr) {
        var timestamp = (new Date()).getTime();
        var handlerFileDialogStart = function () {
            $('.background-container .highlight').addClass('hide');
        };
        var handlerUploadProgress = function (file, completed /* completed bytes */, total /* total bytes */) {
            $('.background-container p.img .loading').show();
             swfu.setButtonText('<span class="uploadstyle">Uploading...</span>');
        };
        var handlerUploadSuccess = function (file, serverData, recievedResponse) {
            $('.background-container p.img .loading').hide();
            swfu.setButtonText('<span class="uploadstyle">Upload</span>');
            if (!file.type) {
                file.type = nn.getFileTypeByName(file.name);
            }
            this.setButtonDisabled(false); // enable upload button again
            var url = 'http://' + s3attr['bucket'] + '.s3.amazonaws.com/' + parameter['prefix'] + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase();
            $('#thumbnail-backgroundImage').attr('src', url + '?n=' + Math.random());
            $('#backgroundImage').val(url);
        };
        var handlerUploadError = function (file, code, message) {
            $('.background-container p.img .loading').hide();
            swfu.setButtonText('<span class="uploadstyle">Upload</span>');
            this.setButtonDisabled(false);
            if (code == -280) { // user cancel upload
                alert(message); // show some error prompt
            } else {
                alert(message); // show some error prompt
            }
        };
        var handlerFileQueue = function (file) {
            if (!file.type) {
                file.type = nn.getFileTypeByName(file.name); // Mac Chrome compatible
            }
            var postParams = {
                "AWSAccessKeyId": s3attr['id'],
                "key":            parameter['prefix'] + '-thumbnail-' + timestamp + '-' + file.size + file.type.toLowerCase(),
                "acl":            parameter['acl'],
                "policy":         s3attr['policy'],
                "signature":      s3attr['signature'],
                "content-type":   parameter['type'],
                "success_action_status": "201"
            };
            this.setPostParams(postParams);
            this.startUpload(file.id);
            this.setButtonDisabled(true);
        };
        var handlerFileQueueError = function (file, code, message) {
            if (code == -130) { // error file type
                $('.background-container .highlight').removeClass('hide');
            }
        };
        var settings = {
            flash_url:                  'javascripts/swfupload/swfupload.swf',
            upload_url:                 'http://' + s3attr['bucket'] + '.s3.amazonaws.com/', // http://9x9tmp-ds.s3.amazonaws.com/
            file_size_limit:            parameter['size'],
            file_types:                 '*.jpg; *.png; *.gif',
            file_types_description:     'Thumbnail',
            file_post_name:             'file',
            button_placeholder:         $('#uploadThumbnail').get(0),
            button_image_url:           'images/btn-load.png',
            button_width:               '129',
            button_height:              '29',
            button_text:                '<span class="uploadstyle">Upload</span>',
            button_text_style:          '.uploadstyle { color: #777777; font-family: Helvetica; font-size: 15px; text-align: center; } .uploadstyle:hover { color: #999999; }',
            button_action:              SWFUpload.BUTTON_ACTION.SELECT_FILE,
            button_cursor:              SWFUpload.CURSOR.HAND,
            button_window_mode :        SWFUpload.WINDOW_MODE.TRANSPARENT,
            http_success :              [ 201 ],
            file_dialog_start_handler:  handlerFileDialogStart,
            upload_progress_handler:    handlerUploadProgress,
            upload_success_handler:     handlerUploadSuccess,
            upload_error_handler:       handlerUploadError,
            file_queued_handler:        handlerFileQueue,
            file_queue_error_handler:   handlerFileQueueError,
            debug:                      false
        };
        var swfu = new SWFUpload(settings);
    });
}
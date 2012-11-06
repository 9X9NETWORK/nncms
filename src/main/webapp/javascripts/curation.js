$(function () {
    setSpace();
    scrollbar('#storyboard-wrap', '#storyboard-list', '#storyboard-slider');

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
    function firstSaveRedirect() {
        $('body').removeClass('first-save');
        var src = $('body').data('origin');
        if (!src                                                                                        // from nature action
                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
            return false;
        } else {
            var nextstep = 'epcurate-curation.html';
            if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                if ($(src.target).attr('href')) {
                    nextstep = $(src.target).attr('href');
                }
                if ($(src.target).parents('a').attr('href')) {
                    nextstep = $(src.target).parents('a').attr('href');
                }
            }
            // ON PURPOSE to wait api (async)
            setTimeout(function () {
                location.href = nextstep;
            }, 3000);
        }
    }
    $('body').keyup(function (e) {
        if (27 === e.keyCode) { // Esc
            $.unblockUI();
            if ($(this).hasClass('has-error')) {
                hasErrorRedirect();
            }
            if ($('body').hasClass('first-save')) {
                firstSaveRedirect();
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
    $('#draft-notice .btn-ok, #draft-notice .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('first-save')) {
            firstSaveRedirect();
        }
        return false;
    });

    // leave and unsave
    function goLeave(url) {
        if ($('body').hasClass('has-change')) {
            showUnsaveOverlay();
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
    $('#content-wrap .form-btn').on('click', '#form-btn-leave', function () {
        goLeave($('#form-btn-leave').data('leaveUrl'));
        return false;
    });
    $('#unsave-prompt .btn-leave').click(function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        location.href = $('#form-btn-leave').data('leaveUrl');
        return false;
    });
    $('#unsave-titlecard-prompt .btn-leave').click(function () {
        $('body').removeClass('has-titlecard-change');
        $.unblockUI();
        var origin = $('body').data('origin');
        if (origin) {
            $('body').removeData('origin');
            $(origin.target).trigger('click');
        }
        return false;
    });
    $('.unblock, .btn-close, .btn-no').click(function () {
        $.unblockUI();
        return false;
    });

    // storyboard sortable
    $('#storyboard-listing').sortable({
        cursor: 'move',
        revert: true,
        tolerance: 'pointer',
        change: function (event, ui) {
            $('body').addClass('has-change');
        }
    });

    // common tabs
    $('#epcurate-curation ul.tabs li a').click(function (e) {
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        var showBlock = $(this).attr('href').split('#');
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $(this).parent().parent().addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#' + showBlock[1]).removeClass('hide');
        return false;
    });
    // common tabs - Add Video
    $('#epcurate-curation ul.tabs li a.cur-add').click(function (e) {
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        cancelTitleCard();
        removeVideoPlayingHook();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();
        $('#epcurate-curation .tabs li').addClass('hide');
        $(this).parent().parent().removeClass('hide').addClass('last');
        $('#video-player .video').html('');
        $('#storyboard-list li').attr('class', '');
        $('#video-control').hide();
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
            if ('' != url) {
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
            }
        });
        if (matchList.length > 0) {
            normalList = $.map(matchList, function (k, i) {
                return 'http://www.youtube.com/watch?v=' + k;
            });
            if ((existList.length + matchList.length) > CMS_CONF.PROGRAM_MAX) {
                $('#videourl').val(normalList.join('\n'));
                $('#cur-add .notice').text('You have reached the maximum amount of 50 videos.').removeClass('hide').show();
                return false;
            }
            $('body').addClass('has-change');
            showProcessingOverlay();
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
                        id: 0,                          // fake program.id for rebuild identifiable url #!pid={program.id}&ytid={youtubeId}&tid={titlecardId}
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
    $('#storyboard').on('click', '.storyboard-list ul li .hover-func a.video-play', function (e) {
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        cancelTitleCard();
        removeVideoPlayingHook();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();

        // switch tab and content
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#cur-edit .edit-time').removeClass('hide');
        $('#cur-edit .edit-title').addClass('hide');
        $('#video-control').show();
        $('#btn-play').addClass('hide');
        $('#btn-pause').addClass('hide');

        // video-info-tmpl (play action)
        var elemtli = $(this).parent().parent();
        playTitleCardAndVideo(elemtli);

        return false;
    });

    // video del
    // if video have programId to keep DELETE programIds list
    var videoDeleteIdList = [];
    $('#storyboard-list').on('click', 'li .hover-func a.video-del', function (e) {
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        $('body').addClass('has-change');
        cancelTitleCard();
        removeVideoPlayingHook();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();
        var length = $('#storyboard-list li').length,
            eq = $('#storyboard-list li.playing').index(),
            deleting = $(this).parent().parent(),
            tmplItemData = deleting.tmplItem().data,
            elemtli = null;
        if (deleting.hasClass('playing') && (length - eq - 1) > 0) {
            // video-info-tmpl (auto turn by del)
            elemtli = deleting.next('li');
            playTitleCardAndVideo(elemtli);

            if (tmplItemData.id && tmplItemData.id > 0) {
                videoDeleteIdList.push(tmplItemData.id);
            }
            deleting.remove();
        } else {
            if (length > 1) {
                if (deleting.hasClass('playing') && (length - eq - 1) == 0) {
                    // video-info-tmpl (auto turn by del)
                    // return to first video
                    elemtli = $('#storyboard-list li:first');
                    playTitleCardAndVideo(elemtli);
                }
                if (tmplItemData.id && tmplItemData.id > 0) {
                    videoDeleteIdList.push(tmplItemData.id);
                }
                deleting.remove();
            } else {
                showSystemErrorOverlay('There must be at least one video in this episode.');
            }
        }
        nn.log(videoDeleteIdList, 'debug');
        sumStoryboardInfo();
        return false;
    });

    // Edit/Preview Title (exist) => #storyboard-list li.edit p.title a.edit
    $('#storyboard-listing').on('click', 'li p.title .begin-title, li p.title .end-title', function (e) {
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        cancelTitleCard();
        removeVideoPlayingHook();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();
        addTitleCardEditHook($(this));

        // switch tab and content
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#cur-edit .edit-time').addClass('hide');
        $('#cur-edit .edit-title').removeClass('hide');
        $('#cur-edit .edit-title').removeClass('disable');
        $('#video-control').show();
        $('#btn-play').addClass('hide');
        $('#btn-pause').removeClass('hide');

        var index = $(this).parent().parent().index(),
            hook = ($(this).hasClass('begin-title')) ? 'beginTitleCard' : 'endTitleCard',
            opts = $('#storyboard-list li:eq(' + index + ')').tmplItem().data[hook];
        if (opts && opts.message) {
            var isUpdateMode = true,
                isDisableEdit = false;
            buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
            enableTitleCardEdit();

            buildTitleCardTmpl(opts);
            $('#cur-edit .edit-title .btn-cancel').data('opts', opts);
            $('#btn-play').trigger('click');
        }
        return false;
    });

    // Add Title (none) => #storyboard-list li.edit p.hover-func a.edit
    $('#storyboard-listing').on('click', 'li p.hover-func a.begin-title, li p.hover-func a.end-title', function (e) {
        if ($('body').hasClass('has-titlecard-change')) {
            showUnsaveTitleCardOverlay(e);
            return false;
        }
        cancelTitleCard();
        removeVideoPlayingHook();
        removeTitleCardPlayingHook();
        removeTitleCardEditHook();
        addTitleCardEditHook($(this));

        // switch tab and content
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
        $('#cur-edit .edit-time').addClass('hide');
        $('#cur-edit .edit-title').removeClass('hide');
        $('#cur-edit .edit-title').removeClass('disable');
        $('#video-control').show();
        $('#btn-play').removeClass('hide');
        $('#btn-pause').addClass('hide');

        var isUpdateMode = false,
            isDisableEdit = false;
        buildTitleCardEditTmpl(CMS_CONF.TITLECARD_DEFAULT_OPTION, isUpdateMode, isDisableEdit);
        enableTitleCardEdit();

        buildTitleCardTmpl(CMS_CONF.TITLECARD_DEFAULT_OPTION);
        $('#cur-edit .edit-title .btn-cancel').data('opts', CMS_CONF.TITLECARD_DEFAULT_OPTION);
        return false;
    });

    // Play Title Card
    $('#btn-play').click(function () {
        cancelTitleCard();
        var opts = null,
            isVideoPlayingMode = ($('#storyboard-list li.playing').length > 0) ? true : false,
            isTitleCardEnableEditMode = (!$('.edit-title').hasClass('disable')) ? true : false;
        if (isVideoPlayingMode) {
            if ($('#storyboard-list li.playing .title a.playing').hasClass('begin-title')) {
                $('#storyboard-list li.playing .hover-func .video-play').trigger('click');
            } else {
                opts = $('#storyboard-list li.playing').tmplItem().data.endTitleCard;
                wrapTitleCardCanvas();
                $('#video-player .video .canvas').titlecard(adaptTitleCardOption(opts), function () {
                    if ($('#storyboard-list li.next-playing').length <= 0) {
                        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                    } else {
                        $('#storyboard-list li.next-playing .hover-func .video-play').trigger('click');
                    }
                });
                animateTitleCardProgress(opts);
            }
        } else {
            if (isTitleCardEnableEditMode) {
                opts = computeTitleCardEditOption();
            } else {
                opts = $('#titlecard-outer').tmplItem().data;
            }
            wrapTitleCardCanvas();
            $('#video-player .video .canvas').titlecard(adaptTitleCardOption(opts), function () {
                buildTitleCardTmpl(opts);
                $('#btn-play').removeClass('hide');
                $('#btn-pause').addClass('hide');
            });
            animateTitleCardProgress(opts);
        }
    });

    // Stop Title Card
    $('#btn-pause').click(function () {
        cancelTitleCard();
        var opts = null,
            isVideoPlayingMode = ($('#storyboard-list li.playing').length > 0) ? true : false;
        if (isVideoPlayingMode) {
            if ($('#storyboard-list li.playing .title a.playing').hasClass('begin-title')) {
                opts = $('#storyboard-list li.playing').tmplItem().data.beginTitleCard;
            } else {
                opts = $('#storyboard-list li.playing').tmplItem().data.endTitleCard;
            }
        } else {
            opts = computeTitleCardEditOption();
        }
        if (opts && opts.message) {
            buildTitleCardTmpl(opts);
        }
    });

    // Edit Title button - enter titlecard edit mode
    $('#cur-edit').on('click', '.edit-title .btn-edit', function () {
        var opts = $('#cur-edit .edit-title .btn-cancel').data('opts'),
            isUpdateMode = ($('#storyboard-list li.edit p.title a.edit').length > 0) ? true : false,
            isDisableEdit = false;
        buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
        enableTitleCardEdit();

        cancelTitleCard();
        buildTitleCardTmpl(opts);
        $('#cur-edit .edit-title .btn-cancel').data('opts', opts);
        return false;
    });

    // Cancel button - leave titlecard edit mode
    $('#cur-edit').on('click', '.edit-title .btn-cancel', function () {
        // restore titlecard
        var opts = $('#cur-edit .edit-title .btn-cancel').data('opts'),
            isUpdateMode = ($('#storyboard-list li.edit p.title a.edit').length > 0) ? true : false,
            isDisableEdit = true;
        buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
        disableTitleCardEdit();

        cancelTitleCard();
        buildTitleCardTmpl(opts);
        $('#cur-edit .edit-title .btn-cancel').data('opts', opts);
        $('body').removeClass('has-titlecard-change');
        return false;
    });

    // Done button - finish titlecard edit
    $('#cur-edit').on('click', '.edit-title .btn-done', function (e) {
        var message = strip_tags($.trim($('#text').val()));
        if ('' == message) {
            showSystemErrorOverlay("Title text can't be empty!");
            return false;
        }
        var isInsertMode = ($('#storyboard-list li.edit p.hover-func a.edit').length > 0) ? true : false,
            hook = '';
        if (isInsertMode) {
            hook = ($('#storyboard-list li.edit p.hover-func a.edit').hasClass('begin-title')) ? 'beginTitleCard' : 'endTitleCard';
            if ($('#storyboard-listing li.edit .hover-func a.edit').hasClass('begin-title')) {
                $('#storyboard-listing li.edit .title').append('<a href="#" class="begin-title edit">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Edit Title</span></span></span></span></a>');
            } else {
                $('#storyboard-listing li.edit .title').append('<a href="#" class="end-title edit">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Edit Title</span></span></span></span></a>');
            }
            $('#storyboard-listing li.edit .hover-func a.edit').remove();
        } else {
            hook = ($('#storyboard-list li.edit p.title a.edit').hasClass('begin-title')) ? 'beginTitleCard' : 'endTitleCard';
        }

        // save to li DOM and update cancel data
        var tmplItem = $('#storyboard-listing li.edit').tmplItem(),
            itemData = tmplItem.data;
        if (null === itemData[hook]) { itemData[hook] = {}; }
        itemData[hook].message = message;
        itemData[hook].align = $('#cur-edit .edit-title input[name=align]:checked').val();
        itemData[hook].effect = $('#effect').val();
        itemData[hook].duration = $('#duration').val();
        itemData[hook].size = $('#fontSize').val();
        itemData[hook].color = $('#fontColor').val();
        itemData[hook].style = ($('#cur-edit .edit-title input[name=fontStyle]:checked').length > 0) ? 'italic' : 'normal';
        itemData[hook].weight = ($('#cur-edit .edit-title input[name=fontWeight]:checked').length > 0) ? 'bold' : 'normal';
        itemData[hook].bgColor = $('#backgroundColor').val();
        itemData[hook].bgImage = ('image' == $('#cur-edit .edit-title input[name=bg]:checked').val() && '' != $('#backgroundImage').val()) ? $('#backgroundImage').val() : '';
        // ON PURPOSE to mark update() to avoid lose edit hook
        //tmplItem.update();

        // and save to video DOM for titlecard play button
        cancelTitleCard();
        var opts = itemData[hook];
        buildTitleCardTmpl(opts);
        var isUpdateMode = true,
            isDisableEdit = true;
        buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit);
        disableTitleCardEdit();
        $('#cur-edit .edit-title .btn-cancel').data('opts', opts);

        $('body').addClass('has-change');
        $('body').removeClass('has-titlecard-change');
        sumStoryboardInfo();
        // TODO implement Done == Save?
        //$('#form-btn-save').trigger('click');
        return false;
    });

    // Delete icon - titlecard
    $('#cur-edit').on('click', '.edit-title .btn-del', function () {
        $('#btn-pause').trigger('click');
        showDeletePromptOverlay();
        return false;
    });
    $('#delete-prompt .btn-del').click(function () {
        $.unblockUI();
        if ($('#storyboard-list li.edit p.title a.edit').length > 0) {
            showSavingOverlay();
            var deleteId = 0,
                tmplItem = $('#storyboard-listing li.edit').tmplItem(),
                itemData = tmplItem.data;
            if ($('#storyboard-listing li.edit .title a.edit').hasClass('begin-title')) {
                if (itemData.beginTitleCard.id && itemData.beginTitleCard.id > 0) {
                    deleteId = itemData.beginTitleCard.id;
                }
                itemData.beginTitleCard = null;
                tmplItem.update();
                $('#storyboard-listing li.edit .hover-func').append('<a href="#" class="begin-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>');
            } else {
                if (itemData.endTitleCard.id && itemData.endTitleCard.id > 0) {
                    deleteId = itemData.endTitleCard.id;
                }
                itemData.endTitleCard = null;
                tmplItem.update();
                $('#storyboard-listing li.edit .hover-func').append('<a href="#" class="end-title">Edit<span class="tip"><span class="tip-left"><span class="tip-right"><span class="tip-middle">Add Title</span></span></span></span></a>');
            }
            $('#storyboard-listing li .title a.edit').remove();

            // switch tab and content
            $('#epcurate-curation .tabs li').addClass('hide');
            $('#epcurate-curation .tabs li.first').removeClass('hide').addClass('last').addClass('on');
            $('#cur-edit').addClass('hide');
            $('#cur-add').removeClass('hide');
            $('#video-player .video').html('');
            $('#storyboard-list li').attr('class', '');
            $('#video-control').hide();

            if (deleteId > 0) {
                nn.api('DELETE', CMS_CONF.API('/api/title_card/{titlecardId}', {titlecardId: deleteId}), null, function (data) {
                    $('#overlay-s').fadeOut(0);
                });
            } else {
                $('#overlay-s').fadeOut(0);
            }
            $('body').removeClass('has-titlecard-change');
            sumStoryboardInfo();
        }
        return false;
    });

    // Text
    $('#cur-edit').on('click change', '.text-container textarea', function () {
        $('body').addClass('has-titlecard-change');
        var text = strip_tags($.trim($(this).val()));
        $(this).val(text);
        $('#titlecard-inner').html(nl2br(text));
        verticalAlignTitleCard();
    });

    // Font (bold, italic, radix, align)
    $('#cur-edit').on('click', '#fontWeight', function () {
        $('body').addClass('has-titlecard-change');
        var weight = $(this).attr('checked') ? 'bold' : 'normal';
        $('#titlecard-inner').css('font-weight', weight);
    });
    $('#cur-edit').on('click', '#fontStyle', function () {
        $('body').addClass('has-titlecard-change');
        var style = $(this).attr('checked') ? 'italic' : 'normal';
        $('#titlecard-inner').css('font-style', style);
    });
    switchFontRadix($('#fontSize').val());
    $('#cur-edit').on('click', '.font-container .font-l.enable', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        setupFontRadix('up');
        return false;
    });
    $('#cur-edit').on('click', '.font-container .font-s.enable', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        setupFontRadix('down');
        return false;
    });
    switchFontAlign($('#cur-edit .edit-title input[name=align]:checked').val());
    $('#cur-edit').on('click', '.edit-title input[name=align]', function () {
        $('body').addClass('has-titlecard-change');
        switchFontAlign($(this).val());
    });

    // edit select dropdown (Effect, Duration)
    $('#cur-edit').on('click', '.enable .select-btn, .enable .select-txt', function () {
        $('.select-list').hide();
        var parent = $(this).parent();
        parent.siblings().children('.on').removeClass('on');
        parent.children('.select-btn').toggleClass('on');
        if (parent.children('.select-btn').hasClass('on')) {
            parent.children('.select-list').slideDown();
        } else {
            parent.children('.select-list').hide();
        }
        return false;
    });
    $('#cur-edit').on('click', '.select .select-list li', function () {
        var selectOption = $(this).text(),
            parent = $(this).parent();
        parent.parent().children('.select-btn').removeClass('on');
        parent.parent().children('.select-txt').children().text(selectOption);
        parent.hide();
        parent.next('input').val($(this).data('meta'));
        return false;
    });
    $('#cur-edit').on('click', '.edit-title .effect-container .select-list li', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        var element = $('#epcurate-curation #cur-edit .effect-container p.effect-demo'),
            effect = $(this).data('meta');
        previewEffect(element, effect);
        $('#effect').val(effect);
        return false;
    });
    $('#cur-edit').on('click', '.effect-container p.effect-demo', function () {
        var element = $(this),
            effect = $('#effect').val();
        previewEffect(element, effect);
        return false;
    });
    $('#cur-edit').on('click', '.edit-title .duration-container .select-list li', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        var selectedDuration = $(this).data('meta');
        $('#duration').val(selectedDuration);
        return false;
    });

    // background switch (color or image)
    switchBackground($('#cur-edit .edit-title input[name=bg]:checked').val());
    $('#cur-edit').on('click', '.edit-title input[name=bg]', function () {
        $('body').addClass('has-titlecard-change');
        switchBackground($(this).val());
    });

    // color picker (font color, background color)
    $('#cur-edit').on('click', '.edit-title .color-list li', function () {
        var colorCode = $(this).attr('class'),
            parent = $(this).parent();
        parent.prev('span').attr('class', colorCode);
        parent.parent().next('input').val($(this).data('meta'));
        return false;
    });
    $('#cur-edit').on('click', '.edit-title .background-container .color-list li', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        var colorCode = $(this).attr('class'),
            selectedBg = $(this).data('meta');
        $('#titlecard-outer').attr('class', colorCode);
        $('#backgroundColor').val(selectedBg);
        return false;
    });
    $('#cur-edit').on('click', '.edit-title .font-container .color-list li', function () {
        $('#btn-pause').trigger('click');
        $('body').addClass('has-titlecard-change');
        $('body').addClass('has-change');
        var colorCode = $(this).attr('class'),
            selectedColor = $(this).data('meta');
        $('#titlecard-inner').attr('class', colorCode);
        $('#fontColor').val(selectedColor);
        return false;
    });
    $('#cur-edit').on('change', '.text-container, .font-container, .effect-container, .background-container, .duration-container', function () {
        $('#btn-pause').trigger('click');
    });

    // Save
    // NOTE: save titlecard always handle POST /api/programs/{programId}/title_cards
    // TODO improve api async order issue
    $('#epcurateForm').submit(function (e, src) {
        // Episode Curation - Curation
        if ($(e.target).hasClass('curation') && chkCurationData(this, src)) {
            showSavingOverlay();
            var isInsertMode = ('' == $('#id').val()),
                nextstep = 'epcurate-curation.html',
                totalDuration = 0,
                programLength = $('#storyboard-list li').length,
                firstImageUrl = $('#storyboard-list li:first').tmplItem().data.imageUrl,
                tmplItem = null,
                tmplItemData = {},
                programItem = {},
                programList = [],
                parameter = null;
            $('#storyboard-list li').each(function (idx) {
                programItem = $(this).tmplItem().data;
                totalDuration += parseInt(programItem.duration, 10);
                if (null !== programItem.beginTitleCard) {
                    totalDuration += parseInt(programItem.beginTitleCard.duration, 10);
                }
                if (null !== programItem.endTitleCard) {
                    totalDuration += parseInt(programItem.endTitleCard.duration, 10);
                }
                $.extend(programItem, {
                    channelId: $('#channelId').val(),   // api readonly
                    subSeq: idx + 1,
                    contentType: 1
                });
                programList.push(programItem);
            });
            if (isInsertMode) {
                nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                    // nothing to do ON PURPOSE to turn off error handle from YouTube to 9x9 API
                });
                // insert mode: insert episode --> insert programs --> update episode with null
                parameter = {
                    isPublic: false,
                    publishDate: "",
                    scheduleDate: "",
                    name: $('#name').val(),
                    intro: $('#intro').val(),
                    imageUrl: firstImageUrl,
                    duration: totalDuration     // api readonly
                };
                // insert episode
                nn.api('POST', CMS_CONF.API('/api/channels/{channelId}/episodes', {channelId: $('#channelId').val()}), parameter, function (episode) {
                    // from insert mode change to update mode
                    // rebuild cookie and hidden episode id
                    rebuildCrumbAndParam($('#channelId').val(), episode.id);
                    $.each(programList, function (idx, programItem) {
                        // insert program
                        nn.api('POST', CMS_CONF.API('/api/episodes/{episodeId}/programs', {episodeId: episode.id}), programItem, function (program) {
                            // update program.id to DOM
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            tmplItemData.id = program.id;
                            tmplItem.update();

                            // insert titlecard
                            if (null != tmplItemData.beginTitleCard && tmplItemData.beginTitleCard.message && '' != $.trim(tmplItemData.beginTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.beginTitleCard, {
                                    message: $.trim(tmplItemData.beginTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 0
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.beginTitleCard.id = title_card.id;
                                    tmplItem.update();
                                });
                            }
                            if (null != tmplItemData.endTitleCard && tmplItemData.endTitleCard.message && '' != $.trim(tmplItemData.endTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.endTitleCard, {
                                    message: $.trim(tmplItemData.endTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 1
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.endTitleCard.id = title_card.id;
                                    tmplItem.update();
                                });
                            }

                            if (idx === (programList.length - 1)) {
                                // update episode with null
                                nn.api('PUT', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: episode.id}), null, function (episode) {
                                    $('#overlay-s').fadeOut(1000, function () {
                                        // redirect
                                        videoDeleteIdList = []; // clear video delete id list
                                        $('body').removeClass('has-change');
                                        $('body').removeClass('has-titlecard-change');
                                        showDraftNoticeOverlay(src);
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
                        $('body').removeClass('has-titlecard-change');
                        if (!src                                                                                        // from nature action
                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                            return false;
                        } else {
                            if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                                if ($(src.target).attr('href')) {
                                    nextstep = $(src.target).attr('href');
                                }
                                if ($(src.target).parents('a').attr('href')) {
                                    nextstep = $(src.target).parents('a').attr('href');
                                }
                            }
                            location.href = nextstep;
                        }
                    });
                    return false;
                }
                nn.on([400, 401, 403, 404], function (jqXHR, textStatus) {
                    // nothing to do ON PURPOSE to turn off error handle from YouTube to 9x9 API
                });
                $('#storyboard-list li').each(function (idx) {
                    programItem = $(this).tmplItem().data;
                    if (programItem.id && programItem.id > 0) {
                        // update program
                        parameter = $.extend({}, programItem, {
                            subSeq: idx + 1
                        });
                        nn.api('PUT', CMS_CONF.API('/api/programs/{programId}', {programId: programItem.id}), parameter, function (program) {
                            // insert titlecard
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            if (null != tmplItemData.beginTitleCard && tmplItemData.beginTitleCard.message && '' != $.trim(tmplItemData.beginTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.beginTitleCard, {
                                    message: $.trim(tmplItemData.beginTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 0
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.beginTitleCard.id = title_card.id;
                                    tmplItem.update();
                                });
                            }
                            if (null != tmplItemData.endTitleCard && tmplItemData.endTitleCard.message && '' != $.trim(tmplItemData.endTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.endTitleCard, {
                                    message: $.trim(tmplItemData.endTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 1
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.endTitleCard.id = title_card.id;
                                    tmplItem.update();
                                });
                            }
                        });
                    } else {
                        // insert program
                        parameter = $.extend({}, programItem, {
                            channelId: $('#channelId').val(),   // api readonly
                            subSeq: idx + 1,
                            contentType: 1
                        });
                        nn.api('POST', CMS_CONF.API('/api/episodes/{episodeId}/programs', {episodeId: $('#id').val()}), parameter, function (program) {
                            // update program.id to DOM
                            tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                            tmplItemData = tmplItem.data;
                            tmplItemData.id = program.id;
                            tmplItem.update();

                            // insert titlecard
                            if (null != tmplItemData.beginTitleCard && tmplItemData.beginTitleCard.message && '' != $.trim(tmplItemData.beginTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.beginTitleCard, {
                                    message: $.trim(tmplItemData.beginTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 0
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.beginTitleCard.id = title_card.id;
                                    tmplItem.update();
                                });
                            }
                            if (null != tmplItemData.endTitleCard && tmplItemData.endTitleCard.message && '' != $.trim(tmplItemData.endTitleCard.message)) {
                                parameter = $.extend({}, tmplItemData.endTitleCard, {
                                    message: $.trim(tmplItemData.endTitleCard.message).replace(/\n/g, '{BR}'),
                                    type: 1
                                });
                                nn.api('POST', CMS_CONF.API('/api/programs/{programId}/title_cards', {programId: program.id}), parameter, function (title_card) {
                                    // update title_card.id to DOM
                                    tmplItem = $('#storyboard-list li:eq(' + idx + ')').tmplItem();
                                    tmplItemData = tmplItem.data;
                                    tmplItemData.endTitleCard.id = title_card.id;
                                    tmplItem.update();
                                });
                            }
                        });
                    }
                    if (idx === (programLength - 1)) {
                        // delete program
                        if (videoDeleteIdList.length > 0) {
                            nn.api('DELETE', CMS_CONF.API('/api/episodes/{episodeId}/programs?programs=' + videoDeleteIdList.join(','), {episodeId: $('#id').val()}), null, function (data) {
                                nn.api('PUT', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: $('#id').val()}), null, function (episode) {
                                    $('#overlay-s').fadeOut(1000, function () {
                                        // redirect
                                        videoDeleteIdList = []; // clear video delete id list
                                        $('body').removeClass('has-change');
                                        $('body').removeClass('has-titlecard-change');
                                        if (!src                                                                                        // from nature action
                                                || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                                            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                                            return false;
                                        } else {
                                            if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                                                if ($(src.target).attr('href')) {
                                                    nextstep = $(src.target).attr('href');
                                                }
                                                if ($(src.target).parents('a').attr('href')) {
                                                    nextstep = $(src.target).parents('a').attr('href');
                                                }
                                            }
                                            // ON PURPOSE to wait api (async)
                                            setTimeout(function () {
                                                location.href = nextstep;
                                            }, 3000);
                                        }
                                    });
                                });
                            });
                        } else {
                            nn.api('PUT', CMS_CONF.API('/api/episodes/{episodeId}', {episodeId: $('#id').val()}), null, function (episode) {
                                $('#overlay-s').fadeOut(1000, function () {
                                    // redirect
                                    $('body').removeClass('has-change');
                                    $('body').removeClass('has-titlecard-change');
                                    if (!src                                                                                        // from nature action
                                            || (src && 'form-btn-save' === $(src.target).attr('id'))) {                             // from btn-save
                                        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                                        return false;
                                    } else {
                                        if (src && ($(src.target).attr('href') || $(src.target).parents('a').attr('href'))) {
                                            if ($(src.target).attr('href')) {
                                                nextstep = $(src.target).attr('href');
                                            }
                                            if ($(src.target).parents('a').attr('href')) {
                                                nextstep = $(src.target).parents('a').attr('href');
                                            }
                                        }
                                        // ON PURPOSE to wait api (async)
                                        setTimeout(function () {
                                            location.href = nextstep;
                                        }, 3000);
                                    }
                                });
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
        resizeTitleCard();
        resizeFromFontRadix();
        verticalAlignTitleCard();
        scrollbar('#storyboard-wrap', '#storyboard-list', '#storyboard-slider');
    });
});

function chkCurationData(fm, src) {
    if ($('body').hasClass('has-titlecard-change')) {
        showUnsaveTitleCardOverlay(src);
        return false;
    }
    var cntProgram = $('#storyboard-list li').length;
    if (cntProgram <= 0) {
        showSystemErrorOverlay('Please curate some videos first.');
        return false;
    }
    if (cntProgram > CMS_CONF.PROGRAM_MAX) {
        showSystemErrorOverlay('You have reached the maximum amount of 50 videos.');
        return false;
    }
    return true;
}

function setSpace() {
    var windowHeight = $(window).height(),
        autoHeight = $('p.auto-height:first').height(),
        epcurateNavHeight = $('#epcurate-nav').height(),
        curationHeight = $('#epcurate-curation').height() - (autoHeight * 2),
        storyboardHeight = $('#storyboard').height() - (autoHeight * 2),
        btnsHeight = $('#content-main .form-btn').height(),
        extraHeight = windowHeight - epcurateNavHeight - curationHeight - storyboardHeight - btnsHeight,
        windowWidth = $(window).width(),
        videoWidth = $('#epcurate-curation #video-player .video').width(),
        curAddWidth = $('#epcurate-curation #cur-add').width(),
        curEditWidth = $('#epcurate-curation #cur-edit').width();
    $('p.auto-height').height(extraHeight / 4);
    $('#epcurate-curation #cur-add').css('padding-left', (windowWidth - videoWidth - curAddWidth) / 2 + 'px');
    $('#epcurate-curation #cur-edit').css('padding-left', (windowWidth - videoWidth - curEditWidth) / 2 + 'px');
    if (windowWidth >= 1200) {
        $('#epcurate-nav ul li.publish').css('left', '239px');
        $('#epcurate-nav ul').css('width', '484px');
        $('#epcurate-nav ul li.on, #epcurate-nav ul li a').css('width', '239px');
        $('#epcurate-nav span.nav-right, #epcurate-nav span.nav-middle').css('width', '236px');
    } else {
        $('#epcurate-nav ul li.publish').css('left', '130px');
        $('#epcurate-nav ul').css('width', '262px');
        $('#epcurate-nav ul li.on, #epcurate-nav ul li a').css('width', '125px');
        $('#epcurate-nav span.nav-right, #epcurate-nav span.nav-middle').css('width', '125px');
    }
}

function onYouTubePlayerReady(playerId) {
    // NO DECLARE var youTubePlayerObj ON PURPOSE to let it be global
    youTubePlayerObj = document.getElementById('youTubePlayer');
    youTubePlayerObj.playVideo();
    youTubePlayerObj.addEventListener('onStateChange', 'onYouTubePlayerStateChange');
}

function onYouTubePlayerStateChange(newState) {
    var playing = $('#storyboard-list li.playing'),
        nextPlaying = $('#storyboard-list li.next-playing'),
        videoId = nextPlaying.data('ytid'),
        opts = null,
        nextOpts = null;
    // unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5)
    if (-1 == newState) {
        youTubePlayerObj.playVideo();
    }
    if (0 == newState) {
        if ($('#storyboard-list li.playing').length <= 0 && $('#storyboard-list li.next-playing').length <= 0) {
            $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
        } else {
            if (playing.children('.title').children('a.end-title').length > 0) {
                opts = playing.tmplItem().data.endTitleCard;
                removeTitleCardPlayingHook();
                addTitleCardPlayingHook(playing, 'end');
                cancelTitleCard();
                wrapTitleCardCanvas();
                $('#video-player .video .canvas').titlecard(adaptTitleCardOption(opts), function () {
                    if ($('#storyboard-list li.next-playing').length <= 0) {
                        $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                    } else {
                        playTitleCardAndVideo(nextPlaying);
                    }
                });
                animateTitleCardProgress(opts);
            } else {
                if ($('#storyboard-list li.next-playing').length <= 0) {
                    $('#epcurate-curation ul.tabs li a.cur-add').trigger('click');
                } else {
                    playTitleCardAndVideo(nextPlaying);
                }
            }
        }
    }
}

function buildVideoInfoTmpl(element) {
    // video-info-tmpl
    if (element && element.tmplItem() && element.tmplItem().data && element.tmplItem().data.name) {
        $('#video-info').html('');
        $('#video-info-tmpl').tmpl(element.tmplItem().data, {
            // TODO conver uploaded from timestamp
            uploadDateConverter: function (uploadDate) {
                var datetemp = uploadDate.split('T');
                return datetemp[0];
            }
        }).prependTo('#video-info');
        $('.ellipsis').ellipsis();
    }
}

function loadVideo(videoId) {
    removeTitleCardPlayingHook();
    if (videoId && '' != videoId) {
        var videoWidth = $('#video-player .video').width(),
            videoHeight = $('#video-player .video').height();
        $('#video-player .video').flash({
            id: 'youTubePlayer',
            swf: 'http://www.youtube.com/v/' + videoId + '?version=3&enablejsapi=1&playerapiid=player1&autohide=0',
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
}

function playTitleCardAndVideo(element) {
    if (element && element.children('.title').children('a.begin-title').length > 0) {
        var opts = element.tmplItem().data.beginTitleCard;
        if (opts && opts.message) {
            removeTitleCardPlayingHook();
            addTitleCardPlayingHook(element, 'begin');
            cancelTitleCard();
            buildVideoInfoTmpl(element);
            wrapTitleCardCanvas();
            $('#video-player .video .canvas').titlecard(adaptTitleCardOption(opts), function () {
                loadVideo(element.data('ytid'));
            });
            animateTitleCardProgress(opts);
            removeVideoPlayingHook();
            addVideoPlayingHook(element);
        }
    } else if (element) {
        buildVideoInfoTmpl(element);
        loadVideo(element.data('ytid'));
        removeVideoPlayingHook();
        addVideoPlayingHook(element);
    }
}

function animateTitleCardProgress(opts) {
    if (!opts || !opts.duration) {
        return;
    }
    var duration = opts.duration,
        width = $('#video-player .video').width();
    $('#video-control').show();
    $('#btn-play').addClass('hide');
    $('#btn-pause').removeClass('hide');
    //$('#btn-pause').data('opts', opts);
    $('#play-time .duration').text(formatDuration(duration));
    $('#play-dragger').animate({
        left: '+=' + parseInt(width - 18, 10)   // 18:drag icon width
    }, parseInt(duration * 1000, 10), function () {
        $('#play-dragger').css('left', '0');
    });
    $('#played').animate({
        width: '+=' + width
    }, parseInt(duration * 1000, 10), function () {
        $('#played').css('width', '0');
        $('#play-time .played').countdown('destroy');
        $('#play-time .played').text('00:00');
    });
    $('#play-time .played').countdown('destroy');
    $('#play-time .played').countdown({
        since: -1,
        compact: true,
        format: 'MS',
        description: ''
    });
}

function cancelTitleCard() {
    $('#video-player .video .canvas').titlecard('cancel');
    $('#play-time .played').countdown('destroy');
    $('#btn-play').removeClass('hide');
    $('#btn-pause').addClass('hide').removeData('opts');    // NOTE: removeData('opts')
    $('#play-dragger').clearQueue().stop().css('left', '0');
    $('#played').clearQueue().stop().css('width', '0');
}

function wrapTitleCardCanvas() {
    $('#video-player .video').html('<div class="canvas"></div>');
    $('#video-player .video .canvas').hide().css('height', $('#video-player').height() - 44).show();    // 44: $('#video-control')
}

function adaptTitleCardOption(opts) {
    if (!opts || !opts.message) {
        opts = CMS_CONF.TITLECARD_DEFAULT_OPTION;
    }
    var option = {
        text: opts.message,
        align: opts.align,
        effect: opts.effect,
        duration: opts.duration,
        fontSize: opts.size,
        fontColor: opts.color,
        fontStyle: opts.style,
        fontWeight: opts.weight,
        backgroundColor: opts.bgColor,
        backgroundImage: opts.bgImage
    };
    return option;
}

function computeTitleCardEditOption() {
    var option = {
        message: strip_tags($.trim($('#text').val())),
        align: $('#cur-edit .edit-title input[name=align]:checked').val(),
        effect: $('#effect').val(),
        duration: $('#duration').val(),
        size: $('#fontSize').val(),
        color: $('#fontColor').val(),
        style: ($('#cur-edit .edit-title input[name=fontStyle]:checked').length > 0) ? 'italic' : 'normal',
        weight: ($('#cur-edit .edit-title input[name=fontWeight]:checked').length > 0) ? 'bold' : 'normal',
        bgColor: $('#backgroundColor').val(),
        bgImage: ('image' == $('#cur-edit .edit-title input[name=bg]:checked').val() && '' != $('#backgroundImage').val()) ? $('#backgroundImage').val() : ''
    };
    return option;
}

function enableTitleCardEdit() {
    $('#cur-edit .edit-title').removeClass('disable');
    $('#cur-edit .select').attr('class', 'select enable');
    $('#cur-edit input, #cur-edit textarea').removeAttr('disabled');
    $('#cur-edit .radio, #cur-edit .checker').removeClass('disabled');
    $('#cur-edit .font-container .font-l, #cur-edit .font-container .font-s').removeClass('disabled').addClass('enable');
}

function disableTitleCardEdit() {
    $('#cur-edit .edit-title').addClass('disable');
    $('#cur-edit .select').attr('class', 'select disable');
    $('#cur-edit input, #cur-edit textarea').attr('disabled', 'disabled');
    $('#cur-edit .radio, #cur-edit .checker').addClass('disabled');
    $('#cur-edit .font-container .font-l, #cur-edit .font-container .font-s').removeClass('enable').addClass('disabled');
}

function buildTitleCardEditTmpl(opts, isUpdateMode, isDisableEdit) {
    $('.edit-title').html($('#titlecard-edit-tmpl').tmpl(opts, {
        isUpdateMode: isUpdateMode
    }));
    uploadImage(isDisableEdit);
    $('#cur-edit input, #cur-edit textarea, #cur-edit select').uniform();
    switchFontRadix($('#fontSize').val());
    switchFontAlign($('#cur-edit .edit-title input[name=align]:checked').val());
    switchBackground($('#cur-edit .edit-title input[name=bg]:checked').val());
}

function buildTitleCardTmpl(opts) {
    if (opts && opts.message) {
        $('#video-player .video').html($('#titlecard-tmpl').tmpl(opts, {
            message: nl2br(strip_tags($.trim(opts.message))),
            outerHeight: ($('#epcurate-curation #video-player .video').height() - 44),  // 44: $('#video-control')
            fontSize: Math.round($('#epcurate-curation #video-player .video').width() / opts.size)
        }));
        $('#play-time .played').text('00:00');
        $('#play-time .duration').text(formatDuration(opts.duration));
        verticalAlignTitleCard();
    }
}

function addVideoPlayingHook(element) {
    element.addClass('playing');
    element.next().addClass('next-playing');
}

function removeVideoPlayingHook() {
    $('#storyboard li').removeClass('playing').removeClass('next-playing');
}

function addTitleCardPlayingHook(element, pos) {
    element.children('.title').children('a.' + pos + '-title').addClass('playing');
}

function removeTitleCardPlayingHook() {
    $('#storyboard li .title a').removeClass('playing');
}

function addTitleCardEditHook(element) {
    element.parent().parent().addClass('edit');                     // parent li
    element.addClass('edit');                                       // self a (begin-title or end-title)
}

function removeTitleCardEditHook() {
    $('#storyboard-list li').removeClass('edit');
    $('#storyboard-list li p.title a').removeClass('edit');
    $('#storyboard-list li p.hover-func a').removeClass('edit');
}

function sumStoryboardInfo() {
    var length = $('#storyboard-list li').length,
        leftLength = CMS_CONF.PROGRAM_MAX - length,
        duration = 0,
        itemData = null;
    if (isNaN(leftLength) || leftLength < 0) {
        leftLength = 0;
    }
    $('#storyboard-list li').each(function (i) {
        itemData = $(this).tmplItem().data;
        duration += parseInt(itemData.duration, 10);
        if (null !== itemData.beginTitleCard) {
            duration += parseInt(itemData.beginTitleCard.duration, 10);
        }
        if (null !== itemData.endTitleCard) {
            duration += parseInt(itemData.endTitleCard.duration, 10);
        }
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

function resizeTitleCard() {
    var videoHeight = ($('#video-player').width() / 16) * 9,
        videoPlayerHeight = videoHeight + 44;   // 44: $('#video-control')
    $('#video-player').css('height', videoPlayerHeight + 'px');
    $('#video-player .video').css('height', videoPlayerHeight + 'px');
    $('#video-player .video .titlecard-outer').css('height', videoHeight + 'px');
}

function resizeFromFontRadix() {
    if ($('#titlecard-outer').length > 0) {
        var radix = $('#titlecard-outer').tmplItem().data.size;
        $('#titlecard-inner').css('font-size', Math.round($('#epcurate-curation #video-player .video').width() / radix) + 'pt');
    }
}

function verticalAlignTitleCard() {
    // vertical align
    var wrapWidth = $('#titlecard-outer').width(),
        wrapHeight = (wrapWidth / 16) * 9,
        selfWidth = $('#titlecard-outer').children('.titlecard-middle').children('.titlecard-inner').width(),
        selfHeight = $('#titlecard-outer').children('.titlecard-middle').children('.titlecard-inner').height(),
        selfLeft = 0,
        selfTop = 0;
    if (wrapWidth > selfWidth) {
        selfLeft = (wrapWidth - selfWidth) / 2;
    }
    if (wrapHeight > selfHeight) {
        selfTop = (wrapHeight - selfHeight) / 2;
    }
    $('#titlecard-outer').children('.titlecard-middle').children('.titlecard-inner').css({
        top: selfTop + 'px',
        left: selfLeft + 'px'
    });
}

function setupFontRadix(action) {
    var size = parseInt($('#fontSize').val(), 10),
        width = $('#epcurate-curation #video-player .video').width();
    if ('up' === action) {
        $('.font-container .font-s').removeClass('disable');
        if (size <= CMS_CONF.FONT_RADIX_MIN) {
            $('.font-container .font-l.enable').addClass('disable');
        } else {
            size = size - 1;
            $('#fontSize').val(size);
            $('#titlecard-inner').css('font-size', Math.round(width / size) + 'pt');
            verticalAlignTitleCard();
        }
    } else {
        $('.font-container .font-l').removeClass('disable');
        if (size >= CMS_CONF.FONT_RADIX_MAX) {
            $('.font-container .font-s.enable').addClass('disable');
        } else {
            size = size + 1;
            $('#fontSize').val(size);
            $('#titlecard-inner').css('font-size', Math.round(width / size) + 'pt');
            verticalAlignTitleCard();
        }
    }
}

function switchFontRadix(radix) {
    radix = parseInt(radix, 10);
    $('.font-container .font-l, .font-container .font-s').removeClass('disable');
    if (radix <= CMS_CONF.FONT_RADIX_MIN) {
        $('.font-container .font-l').addClass('disable');
    }
    if (radix >= CMS_CONF.FONT_RADIX_MAX) {
        $('.font-container .font-s').addClass('disable');
    }
}

function switchFontAlign(align) {
    $('#titlecard-inner').css('text-align', align);
}

function switchBackground(bg) {
    if ('image' == bg) {
        $('#cur-edit .background-container .bg-color').addClass('hide');
        $('#cur-edit .background-container .bg-img').removeClass('hide');
        $('#titlecard-outer img').show();
    } else {
        $('#cur-edit .background-container .bg-color').removeClass('hide');
        $('#cur-edit .background-container .bg-img').addClass('hide');
        $('#titlecard-outer img').hide();
    }
}

function cancelEffect(element) {
    element
        .clearQueue()
        .stop()
        .children('span')
            .clearQueue()
            .stop()
            .children('em')
                .clearQueue()
                .stop();
}

function previewEffect(element, effect) {
    var duration = 5000,
        startStandbySec = 500,
        endingStandbySec = 500,
        startSec = 1500,
        endingSec = 1500,
        delaySec = 1000;
    if (-1 !== $.inArray(effect, ['blind', 'clip', 'drop'])) {
        startSec = endingSec = 1000;
    }
    if ('none' === effect) {
        startStandbySec = endingStandbySec = startSec = endingSec = 0;
    }
    delaySec = (duration - startStandbySec - startSec - endingSec - endingStandbySec);
    cancelEffect(element);

    switch (effect) {
    case 'blind':
    case 'clip':
    case 'fold':
    case 'drop':
    case 'bounce':
    case 'explode':
    case 'highlight':
    case 'puff':
    case 'pulsate':
    case 'scale':
    case 'shake':
    case 'slide':
        element.show(startStandbySec).children('span').hide().show(effect, {}, startSec).delay(delaySec).hide(effect, {}, endingSec, function () {
            element.delay(endingStandbySec).show().children('span').show();
        });
        break;
    case 'fade':
        element.show(startStandbySec).children('span').hide().fadeIn(startSec).delay(delaySec).fadeOut(endingSec, function () {
            element.delay(endingStandbySec).show().children('span').show();
        });
        break;
    default:
        // none
        element.children('span').show(0).delay(duration).hide(0, function () {
            element.show().children('span').show();
        });
        break;
    }
}

function uploadImage(isDisableEdit) {
    var parameter = {
        'prefix': 'cms',
        'type':   'image',
        'size':   20485760,
        'acl':    'public-read'
    };
    nn.api('GET', CMS_CONF.API('/api/s3/attributes'), parameter, function (s3attr) {
        var timestamp = (new Date()).getTime();
        var handlerSwfUploadLoaded = function () {
            if (isDisableEdit) {
                this.setButtonDisabled(true);
            } else {
                this.setButtonDisabled(false);
            }
        };
        var handlerFileDialogStart = function () {
            $('#btn-pause').trigger('click');
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
            $('#titlecard-outer img').remove();
            $('#titlecard-outer').append('<img src="' + $('#thumbnail-backgroundImage').attr('src') + '" style="width: 100%; height: 100%; border: none;" />');
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
            button_text_top_padding:    1,
            button_action:              SWFUpload.BUTTON_ACTION.SELECT_FILE,
            button_cursor:              SWFUpload.CURSOR.HAND,
            button_window_mode :        SWFUpload.WINDOW_MODE.TRANSPARENT,
            http_success :              [ 201 ],
            swfupload_loaded_handler:   handlerSwfUploadLoaded,
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
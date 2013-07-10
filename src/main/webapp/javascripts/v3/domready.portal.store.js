/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, sub: true, vars: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['store-manage'],
        $common = cms.common;

    $(document).on("click", ".btn-minus", function (e) {
        var thisDiv = $(this);
        var upLi = $(this).parents("li");
        var channelId = parseInt(upLi.attr("id").replace("channel_", ""), 10);

        var inCurrent = false,
            inAdd = false,
            inRemove = false;

        if (-1 !== $.inArray(channelId, cms.global.USER_DATA["msoCurrent"])) {
            inCurrent = true;
        }
        if (-1 !== $.inArray(channelId, cms.global.USER_DATA["msoAdd"])) {
            inAdd = true;
        }
        if (-1 !== $.inArray(channelId, cms.global.USER_DATA["msoRemove"])) {
            inRemove = true;
        }

        if ($(this).hasClass("on")) {
            // add channel
            if (inCurrent === false && inRemove === false) {
                cms.global.USER_DATA["msoAdd"].push(channelId);
            } else if (inCurrent === true && inRemove === true) {
                cms.global.USER_DATA["msoRemove"].splice($.inArray(channelId, cms.global.USER_DATA["msoRemove"]), 1);
            }
            thisDiv.removeClass("on");
            upLi.removeClass("minus");
            thisDiv.find("p.center").text(nn._([cms.global.PAGE_ID, 'channel-list', 'Remove channel']));
            $('body').addClass('has-change');
        } else {
            // remove channle
            if (inCurrent === true && inAdd === false) {
                cms.global.USER_DATA["msoRemove"].push(channelId);
            } else if (inCurrent === false && inAdd === true) {
                cms.global.USER_DATA["msoAdd"].splice($.inArray(channelId, cms.global.USER_DATA["msoAdd"]), 1);
            }
            $('body').addClass('has-change');
            thisDiv.addClass("on");
            upLi.addClass("minus");
            thisDiv.find("p.center").text(nn._([cms.global.PAGE_ID, 'channel-list', 'Add channel']));
        }
    });

    // $(document).on("click", ".load", function (event) {
    //     var pageTotal = 0,
    //         pageNext = 0;
    //     pageTotal = cms.global.USER_DATA["pageInfo"].pageTotal;
    //     pageNext = cms.global.USER_DATA["pageInfo"].pageNext;

    //     if (pageNext == pageTotal) {
    //         $(".load").hide();
    //     }
    //     $common.showProcessingOverlay();
    //     cms.global.USER_DATA["pageInfo"].pageCurrent = cms.global.USER_DATA["pageInfo"].pageNext;
    //     cms.global.USER_DATA["pageInfo"].pageNext += 1;
    //     $page._drawChannels($page.channelPageSize, true);
    // });

    $('#store-list').scroll(function (event) {
        var $storeList = $('#store-list');

        if ($storeList.scrollTop() + $storeList.height() >= $storeList[0].scrollHeight && cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
            $storeList.find('.load').fadeIn('slow');
            $page.getMoreChannels();
        }
    });

    $(document).on("click", "#set-save", function (event) {
        var msoId = 0;
        msoId = cms.global.MSO;
        var tmpMsoAdd = cms.global.USER_DATA["msoAdd"],
            tmpMsoRemove = cms.global.USER_DATA["msoRemove"];
        $common.showProcessingOverlay();

        if (tmpMsoAdd.length > 0) {
            nn.api('POST', cms.reapi('/api/mso/{msoId}/store', {
                msoId: msoId
            }), {
                channels: tmpMsoAdd.join(",")
            }, function (channel) {
                // Add AL to WL and empty AL
                cms.global.USER_DATA["msoCurrent"] = cms.global.USER_DATA["msoCurrent"].concat(tmpMsoAdd);
                cms.global.USER_DATA["msoAdd"] = [];
            });
        }

        if (tmpMsoRemove.length > 0) {
            nn.api('DELETE', cms.reapi('/api/mso/{msoId}/store', {
                msoId: msoId
            }), {
                channels: tmpMsoRemove.join(",")
            }, function (channel) {
                // Remove RL from WL empty RL
                $.each(tmpMsoRemove, function (eKey, eValue) {
                    cms.global.USER_DATA["msoCurrent"].splice($.inArray(eValue, cms.global.USER_DATA["msoCurrent"]), 1);
                });
                cms.global.USER_DATA["msoRemove"] = [];

            });
        }
        $('#overlay-s').fadeOut("slow");
        $('body').removeClass('has-change');
    });

    $(document).on("click", ".catLi", function (event) {
        if ($('body').hasClass('has-change')) {
            // Unsaved changes will be lost, are you sure you want to leave?
            $(".btn-leave").data("meta", $(this).data("meta"));
            $common.showUnsaveOverlay();
        } else {
            $page.catLiClick($(this).data("meta"));
        }
    });

    $(document).on('click', '#unsave-prompt .btn-leave', function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        if (null !== $('body').data('leaveUrl') && $('body').data('leaveUrl') !== "") {
            location.href = $('body').data('leaveUrl');
        } else {
            $page.catLiClick($(".btn-leave").data("meta"));
        }
        return false;
    });

    $('.unblock, .btn-close, .btn-no, .setup-notice .btn-ok').click(function () {
        $.unblockUI();
        $('body').data('leaveUrl', "");
        return false;
    });

    $(document).on('click', '#content-nav a, .select-list li a, .studio-nav-wrap a, #profile-dropdown a', function (e) {
        if ($('body').hasClass('has-change')) {
            if (e && $(e.currentTarget).attr('href')) {
                $('body').data('leaveUrl', $(e.currentTarget).attr('href'));
            }
            $common.showUnsaveOverlay();
            return false;
        }
    });

    $(document).on("click", "#store-category .btn-gray", function (event) {
        if ($("#store-layer").hasClass("collapse")) {
            $("#store-category ul").slideDown(400);
            $('#store-constrain').animate({top:'+=90'}, 400);
        } else {
            $("#store-category ul").slideUp(400);
            $('#store-constrain').animate({top:'-=90'}, {
                complete: function() {
                    // If the page isn't filled with channels (no scrollbar && pageCurrent < pageTotal)
                    if ($('#store-list').height() >= $('#store-list')[0].scrollHeight - $('#store-list .load').height() && 
                        cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
                        $('#store-list .load').fadeIn('slow');
                        $page.getMoreChannels();
                    }                    
                }
            });
        }
        $("#store-layer").toggleClass("collapse");
        // $common.autoHeight();
        // $common.scrollbar("#store-constrain", "#store-list", "#store-slider");
    });

    $('#system-error .btn-ok, #system-error .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            location.replace('index.html');
        }
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
    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        var $storeList = $('#store-list');

        // Scroll to the exact bottom of the new window size.
        if ($storeList.scrollTop() + $storeList.height() > $storeList.find('.channel-list').height()) {
            $storeList.scrollTop($storeList.find('.channel-list').height() - $storeList.height());
        }

        $('#store-list').perfectScrollbar('update');

        if ($storeList.scrollTop() + $storeList.height() >= $storeList[0].scrollHeight && cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
            $storeList.find('.load').fadeIn('slow');
            $page.getMoreChannels();
        }
    });
});
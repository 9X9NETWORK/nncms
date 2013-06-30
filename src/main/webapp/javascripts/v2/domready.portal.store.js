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
        var channelId = upLi.attr("id").replace("channel_", "");
        var msoId = 0;

        msoId = cms.global.MSO;
        // $(this).find("p").eq(1).html();

        if ($(this).hasClass("on")) {
            // add channel
            $common.showProcessingOverlay();
            nn.api('POST', cms.reapi('/api/mso/{msoId}/store', {
                msoId: msoId
            }), {
                channels: channelId
            }, function (channelsMso) {
                thisDiv.removeClass("on");
                upLi.removeClass("minus");
                thisDiv.find("p.center").text(nn._([cms.global.PAGE_ID, 'channel-list', 'Remove channel']));
                $('#overlay-s').fadeOut("slow");
            });
        } else {
            // remove channle
            $common.showProcessingOverlay();
            nn.api('DELETE', cms.reapi('/api/mso/{msoId}/store', {
                msoId: msoId
            }), {
                channels: channelId
            }, function (channelsMso) {
                thisDiv.addClass("on");
                upLi.addClass("minus");
                thisDiv.find("p.center").text(nn._([cms.global.PAGE_ID, 'channel-list', 'Add channel']));
                $('#overlay-s').fadeOut("slow");
                //console.log( thisDiv.text() );
            });
        }
    });

    $(document).on("click", ".load", function (event) {
        var pageTotal = 0,
            pageNext = 0;
        pageTotal = cms.global.USER_DATA["pageInfo"].pageTotal;
        pageNext = cms.global.USER_DATA["pageInfo"].pageNext;

        if (pageNext == pageTotal) {
            $(".load").hide();
        }
        $common.showProcessingOverlay();
        cms.global.USER_DATA["pageInfo"].pageCurrent = cms.global.USER_DATA["pageInfo"].pageNext;
        cms.global.USER_DATA["pageInfo"].pageNext += 1;
        $page._drawChannels($page.channelPageSize, true);
    });

    $(document).on("click", "#set-save", function (event) {
        $common.showProcessingOverlay();
        setTimeout(function () {
            $("#overlay-s").fadeOut("slow");
        }, 600);
    });

    $(document).on("click", ".catLi", function (event) {
        var msoId = 0;

        msoId = cms.global.MSO;
        $common.showProcessingOverlay();
        $(".catLi ").removeClass("on");
        $(this).addClass("on");
        $(".func_name").text($(this).text());
        $('.channel-list li').remove();

        if ('none' !== $('#store-slider').css('display')) {
            $('#store-slider .slider-vertical').slider('value', 100);
            $('#store-slider .slider-vertical').slider('destroy');
            $common.autoHeight();
            $common.scrollbar("#store-constrain", "#store-list", "#store-slider");
        }
        $page.listCatChannel(msoId, $(this).data("meta"), $page.channelPageSize);
    });

    $(document).on("click", "#store-category .btn-gray", function (event) {
        if ($("#store-layer").hasClass("collapse")) {
            $("#store-category ul").slideDown(400);
        } else {
            $("#store-category ul").slideUp(400);
        }
        $("#store-layer").toggleClass("collapse");
        $common.autoHeight();
        $common.scrollbar("#store-constrain", "#store-list", "#store-slider");
    });

    $('#system-error .btn-ok, #system-error .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            location.replace('index.html');
        }
        return false;
    });

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $common.autoHeight();
        $common.scrollbar("#store-constrain", "#store-list", "#store-slider");
    });
});
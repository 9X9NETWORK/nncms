/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, sub: true, vars: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['store-manage'],
        $common = cms.common;

    $(document).on("click", ".catLi .btn-minus", function (e) {
        var upLi = $(this).parents("li");

        if ($(upLi).hasClass("minus")) {
            // add channel
            $(upLi).removeClass("minus");
        } else {
            // remove channle
            $(upLi).hasClass("minus");
        }
        e.stopPropagation();
    });

    $(document).on("click", ".btn-minus", function (e) {
        var thisDiv = $(this),
            upLi = $(this).parents("li"),
            channelId = parseInt(upLi.attr("id").replace("channel_", ""), 10),

            inCurrent = false,
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
            thisDiv.find("p.center").text(nn._([cms.global.PAGE_ID, 'channel-list', 'Remove program']));
            // $('body').addClass('has-change');
            // $("#set-save p.btns").removeClass("disable");
            $page.setSaveButton("on");
        } else {
            // remove channle
            if (inCurrent === true && inAdd === false) {
                cms.global.USER_DATA["msoRemove"].push(channelId);
            } else if (inCurrent === false && inAdd === true) {
                cms.global.USER_DATA["msoAdd"].splice($.inArray(channelId, cms.global.USER_DATA["msoAdd"]), 1);
            }
            // $('body').addClass('has-change');
            // $("#set-save p.btns").removeClass("disable");
            $page.setSaveButton("on");
            thisDiv.addClass("on");
            upLi.addClass("minus");
            thisDiv.find("p.center").text(nn._([cms.global.PAGE_ID, 'channel-list', 'Add program']));
        }
    });

    // system catetory on to off
    $(document).on("click", ".intro a.switch-on", function (event) {
        if (!$("#store-layer").hasClass("collapse")) {
            $page._categoryBlockSlide("up");
        }
        if ($('body').hasClass('has-change')) {
            $("#unsave-prompt .btn-leave").addClass("switch-on-off");
            $common.showUnsaveOverlay();
        } else {
            cms.global.USER_DATA["pageInfo"] = [];
            cms.global.USER_DATA["msoSource"] = [];
            cms.global.USER_DATA["msoCurrent"] = [];
            // $('body').addClass('has-change');
            // $("#set-save p.btns").removeClass("disable");
            $common.showProcessingOverlay();
            $('#store-layer').hide();
            $('.intro a.switch-off').removeClass("hide");
            $('.intro a.switch-on').addClass("hide");
            $('.intro .msg-error').removeClass("hide");
            $('.intro .msg-error').show();
            $('#overlay-s').fadeOut("slow");
            $("#store-list .channel-list").empty();
        }
        // $("#set-save p.btns").removeClass("disable");
        $page.setSaveButton("on");
    });

    // system catetory off to on 
    $(document).on("click", ".intro a.switch-off", function (event) {
        var lang = cms.global.USER_DATA.lang,
            msoId = cms.global.MSO;

        $common.showProcessingOverlay();
        $('#store-layer').show();
        $('.intro a.switch-off').addClass("hide");
        $('.intro a.switch-on').removeClass("hide");
        $('.intro .msg-error').addClass("hide");

        $page.drawCategory(msoId, lang);
        // $("#set-save p.btns").removeClass("disable");
        $page.setSaveButton("on");
    });

    $('#store-list').scroll(function (event) {
        var $storeList = $('#store-list');

        if ($storeList.scrollTop() + $storeList.outerHeight() >= $storeList[0].scrollHeight && cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
            $storeList.find('.load').fadeIn('slow');
            $page.getMoreChannels();
        }
    });

    $(document).on("click", "#set-save", function (event) {
        if (!$("#set-save p.btns").hasClass("disableBB")) {
            var msoId = cms.global.MSO,
                stSwitchOn = !$(".switch-on").hasClass("hide"),
                stSwitchOff = !$(".switch-off").hasClass("hide"),
                catMinus = $("#store-category-ul li.minus"),
                catMinusList = [],
                tmpMsoAdd = cms.global.USER_DATA["msoAdd"],
                tmpMsoRemove = cms.global.USER_DATA["msoRemove"];
            $common.showProcessingOverlay();
            if (stSwitchOff && !stSwitchOn) {
                // system category off
                nn.api('GET', cms.reapi('/api/mso/{msoId}/store/categoryLocks', {
                    msoId: msoId
                }), null, function (categoryLocks) {
                    if ($.inArray('ALL', categoryLocks) === -1) {
                        categoryLocks.push('ALL');
                        nn.api('PUT', cms.reapi('/api/mso/{msoId}/store/categoryLocks', {
                            msoId: msoId
                        }), {categories: categoryLocks.join(",")}, null);
                    }

                });
            } else {
                var tmpStr = "";
                $.each(catMinus, function (eKey, eValue) {
                    catMinusList.push($(eValue).data("meta"));
                });
                if (catMinusList.length > 0) {
                    tmpStr = catMinusList.join(",");
                }
                nn.api('PUT', cms.reapi('/api/mso/{msoId}/store/categoryLocks', {
                    msoId: msoId
                }), {
                    categories: tmpStr
                }, null);
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

            }
            $('#overlay-s').fadeOut("slow");
            // $('body').removeClass('has-change');
            // $("#set-save p.btns").addClass("disable");
            $page.setSaveButton("off");
        }
    });
    $(document).on("click", ".catLi, .catLi a", function (event) {
        var thisMeta = $(this).data("meta") || $(this).parent().parent().data("meta");
        cms.global.USER_DATA["pageInfo"] = [];
        cms.global.USER_DATA["msoSource"] = [];
        cms.global.USER_DATA["msoCurrent"] = [];

        nn.log("catLi id is :[" + thisMeta + "]");
        if ($('body').hasClass('has-change')) {
            // Unsaved changes will be lost, are you sure you want to leave?
            $(".btn-leave").data("meta", thisMeta);
            $common.showUnsaveOverlay();
        } else {
            if (!$("#store-layer").hasClass("collapse")) {
                $page._categoryBlockSlide("up");
            }
            $page.catLiClick(thisMeta);
        }
        event.stopPropagation();
    });

    $(document).on('click', '#unsave-prompt .btn-leave', function () {
        if ($("#unsave-prompt .btn-leave").hasClass("switch-on-off")) {
            cms.global.USER_DATA["pageInfo"] = [];
            cms.global.USER_DATA["msoSource"] = [];
            cms.global.USER_DATA["msoCurrent"] = [];
            $("#unsave-prompt .btn-leave").removeClass("switch-on-off");
            $('body').removeClass('has-change');
            $.unblockUI();
            $common.showProcessingOverlay();
            $('#store-layer').hide();
            $('.intro a.switch-off').removeClass("hide");
            $('.intro a.switch-on').addClass("hide");
            $('.intro .msg-error').removeClass("hide");
            $(".channel-list").html("");
            if (!$("#store-layer").hasClass("collapse")) {
                $page._categoryBlockSlide("up");
            }
            $('#overlay-s').fadeOut("slow");
        } else {
            var tmpLeaveUrl = $('body').data('leaveUrl');
            if (undefined === tmpLeaveUrl) {
                tmpLeaveUrl = "";
            }
            $('body').removeClass('has-change');
            $.unblockUI();
            if (null !== tmpLeaveUrl && tmpLeaveUrl !== "") {
                location.href = $('body').data('leaveUrl');
            } else {
                $page._categoryBlockSlide("up");
                $page.catLiClick($(".btn-leave").data("meta"));
            }
        }
        return false;
    });

    $('.unblock, .btn-close, .btn-no, .setup-notice .btn-ok').click(function () {
        $.unblockUI();
        $('body').data('leaveUrl', "");
        $("#unsave-prompt .btn-leave").removeClass("switch-on-off");
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
        // alert("test");
        if ($("#store-layer").hasClass("collapse")) {
            $page._categoryBlockSlide("down");
        } else {
            $page._categoryBlockSlide("up");
        }
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

        if ($storeList.scrollTop() + $storeList.outerHeight() >= $storeList[0].scrollHeight && cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
            $storeList.find('.load').fadeIn('slow');
            $page.getMoreChannels();
        }
    });
});
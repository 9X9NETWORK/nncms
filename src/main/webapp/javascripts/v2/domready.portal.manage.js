/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, vars: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['portal-manage'],
        $common = cms.common;

    $(document).on("click", "#set-preview", function (event) {
        // 2013/06/20 remove tv from URL
        var setId = cms.global.USER_URL.param('id');
        var preUrl = $.url().attr('host') + "/#/streaming/";
        var msoId = cms.global.MSO;
        var thisA = $(this);

        nn.api('GET', cms.reapi('/api/sets/{setId}', {
            setId: setId
        })).then(function (ccSetInfo) {
            nn.api('GET', cms.reapi('/api/mso/{msoId}', {
                msoId: msoId
            }), null, function (mso) {
                var tmpMsoName = mso.name + ".";
                preUrl += ccSetInfo.displayId + "-" + setId;
                if (msoId === 1) {
                    if (preUrl.indexOf("www.") === 0) {
                        preUrl = preUrl.replace("www.", "player.");
                    } else {
                        preUrl = "player." + preUrl;
                    }
                } else {
                    if (preUrl.indexOf("www.") === 0) {
                        preUrl = preUrl.replace("www.", tmpMsoName);
                    } else {
                        preUrl = tmpMsoName + preUrl;
                    }
                }
                preUrl = "http://" + preUrl;
                thisA.attr("href", preUrl);
            });
        });
        return false;
    });

    $(document).on("click", "#set-save", function (event) {
        // protal set save
        //var btnOn = $("#sortingType").val();
        var setId = cms.global.USER_URL.param('id');
        $("#setName").val($.trim($("#setName").val()));
        var inSetName = $("#setName").val();
        var inSortingType = $("#sortingType").val();

        $("#msg-portal").text("");
        $("#msg-portal").hide();
        if ("" !== inSetName && setId > 0) {
            $common.showProcessingOverlay();
            nn.api('PUT', cms.reapi('/api/sets/{setId}', {
                setId: setId
            }), {
                name: inSetName,
                sortingType: inSortingType
            }, function (set) {
                var channels = [],
                    this_id = 0,
                    channelOrder = "";

                if (inSortingType == 1) {
                    $(".btn-top").hide();
                    $("#channel-list  li.itemList").each(function () {
                        //alert( channel.html() );
                        this_id = $(this).attr("id").replace("set_", "");
                        //cms.config.CATEGORY_MAP[list.id] = list.name;
                        if (this_id > 0) {
                            channels.push(this_id);
                        }
                    });
                    channelOrder = channels.join(',');
                    if ("" !== channelOrder) {
                        // need reorder
                        nn.api('PUT', cms.reapi('/api/sets/{setId}/channels/sorting', {
                            setId: setId
                        }), {
                            channels: channelOrder
                        }, function (set) {
                            //alert("排序 ok!");
                            $('#overlay-s').fadeOut("slow");
                        });
                    } else {
                        $('#overlay-s').fadeOut("slow");
                    }
                } else {
                    $("#channel-list li.itemList").each(function () {
                        //alert( channel.html() );
                        this_id = $(this).attr("id").replace("set_", "");
                        //cms.config.CATEGORY_MAP[list.id] = list.name;
                        if (this_id > 0) {
                            channels.push(this_id);
                        }
                    });
                    channelOrder = channels.join(',');
                    //alert( channelOrder );
                    if ("" !== channelOrder) {
                        // need reorder
                        nn.api('PUT', cms.reapi('/api/sets/{setId}/channels/sorting', {
                            setId: setId
                        }), {
                            channels: channelOrder
                        }, function (set) {
                            //alert("排序 ok!");
                            $page.init();
                            //$('#overlay-s').fadeOut("slow");
                        });
                    } else {
                        $page.init();
                        //$('#overlay-s').fadeOut("slow");
                    }
                }
            });
            $("body").removeClass("has-change");
        } else {
            // err msg
            $("#msg-portal").text(nn._([cms.global.PAGE_ID, 'channel-list', "Please fill in your set name."]));
            $("#msg-portal").show();
            //$common.showSystemErrorOverlay(nn._([cms.global.PAGE_ID, 'channel-list', "Please fill in your set name."]));
            //alert("頻道組名稱不可以是空白");
        }
        return false;
    });

    $(document).on("keyup", "#input-portal-ch", function (event) {
        if (event.which == 13) {
            $("#portal_search_channel").click();
            //event.preventDefault();
        }
    });

    $(document).on("keyup", "#setName", function (event) {
        $("#name-charcounter").text($("#setName").val().length);
    });

    $(document).on('change', '#setName', function () {
        $(".clearfix .msg-portal").hide();
        $("#name-charcounter").text($("#setName").val().length);
        $('body').addClass('has-change');
    });

    // search layout
    $(document).on("click", "#empty_channel", function (event) {
        var cntChannel = $("#channelCnt").text();
        if (cntChannel < 27) {
            $("#search-title").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Add channels into your “<span>Set 2</span>”"], [$("#setName").val()]));
            $("#portal-add-layer").fadeIn();
        }
    });

    $(document).on("click", "#searchNext", function (event) {
        // search channel list next page
        var pageChannel = Math.floor($(".list-holder").width() / 117) * 2;
        var cntLi = $("#search-channel-list li");
        var countOff = 0,
            cntLiLength = cntLi.length;
        var offS = 0,
            offE = pageChannel;
        var i = 0;

        for (i = 0; i < cntLiLength; i += 1) {
            if (cntLi.eq(i).hasClass("soff")) {
                countOff += 1;
            }
        }
        offS += countOff;
        offE += countOff;

        for (i = offS; i < offE; i += 1) {
            cntLi.eq(i).addClass("soff").hide();
        }
        $("#searchPrev").show();
        if ((cntLiLength - countOff - pageChannel) < (pageChannel + 1)) {
            $("#searchNext").hide();
        }
    });

    $(document).on("click", "#searchPrev", function (event) {
        // search channel list next page
        var pageChannel = Math.floor($(".list-holder").width() / 117) * 2;
        var cntLi = $("#search-channel-list li");
        var countOff = 0,
            cntLiLength = cntLi.length;
        var offS = 0,
            offE = pageChannel;
        var i = 0;

        for (i = 0; i < cntLiLength; i += 1) {
            if (cntLi.eq(i).hasClass("soff")) {
                countOff += 1;
            }
        }
        offS = countOff - pageChannel;
        offE = countOff;

        for (i = offS; i < offE; i += 1) {
            cntLi.eq(i).removeClass("soff").show();
        }
        $("#searchNext").show();
        if (offS < 1) {
            $("#searchPrev").hide();
        }
    });

    // button search
    $(document).on("click", "#portal_search_channel", function (event) {
        $("#input-portal-ch").val($.trim($("#input-portal-ch").val()));
        var strInput = $("#input-portal-ch").val(),
            searchType = $("#dropdown-portal-ch").attr("kvale");
        var msgErr = "";
        $("#sRusult").data("canAdd", (27 - $("#channelCnt").text()));
        //alert(searchType);
        $('#search-channel-list').html('');
        $("#searchNext").hide();
        $("#searchPrev").hide();

        $("#msg-search").text("");
        $("#msg-search").hide();

        if ($("#input-portal-ch").data("tmpIn") == strInput) {
            switch (searchType) {
            case "url":
                msgErr = "Please fill in the channel url to search.";
                break;
            case "keywords":
                msgErr = "Please fill in the keywords to search.";
                break;
            }

            msgErr = nn._([cms.global.PAGE_ID, 'portal-add-layer', msgErr]);
            //$("#msg-search").text(msgErr);
            //$("#msg-search").show();
            $("#sRusult").text(msgErr);
        } else {
            $("#portal-add-layer").fadeOut();
            $common.showProcessingOverlay();
            switch (searchType) {
            case "url":
                var inURL = $.url(strInput);
                var allPaths = ["/view", "/playback"];
                var tmpChannel = inURL.param('ch');
                if (tmpChannel > 0 && $.inArray(inURL.attr('path'), allPaths) != -1) {
                    nn.api('GET', cms.reapi('/api/channels'), {
                        channels: tmpChannel
                    }, function (channels) {
                        var cntChannel = channels.length;
                        var canChannel = 27 - $("#channelCnt").text();

                        //alert($("#sRusult").data("canAdd"));
                        var items = [],
                            temp = [];
                        $.each(channels, function (i, channel) {
                            temp = [];

                            if (channel.imageUrl == '') {
                                channel.imageUrl = 'images/ch_default.png';
                                if (channel.moreImageUrl && '' !== $.trim(channel.moreImageUrl)) {
                                    temp = channel.moreImageUrl.split('|');
                                    if (temp[0] && temp[0] !== cms.config.EPISODE_DEFAULT_IMAGE) {
                                        channel.imageUrl = temp[0];
                                    }
                                }
                            }
                            items.push(channel);
                        });
                        cntChannel = items.length;
                        if (cntChannel > 0) {
                            nn.api('GET', cms.reapi('/api/channels/{channelId}/autosharing/validBrands', {
                                channelId: items[0].id
                            }), null, function (cBrands) {
                                var isValid = false,
                                    i = 0,
                                    iCount = cBrands.length;
                                for (i = 0; i < iCount; i += 1) {
                                    if (cms.global.MSOINFO.name === cBrands[i].brand) {
                                        isValid = true;
                                        break;
                                    }
                                }
                                if (isValid === true) {
                                    $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Find [<span>?</span>] channels."], [cntChannel, canChannel]));
                                    $('#portal-search-item-tmpl').tmpl(items).appendTo('#search-channel-list');
                                } else {
                                    $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Your search - [xxx] didn't match any channels."], [strInput]));
                                }
                            });
                        } else {
                            $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Your search - [xxx] didn't match any channels."], [strInput]));
                        }

                        var pageChannel = Math.floor($(".list-holder").width() / 117) * 2;
                        if (cntChannel > pageChannel) {
                            $("#searchNext").show();
                        }
                    });
                } else {
                    //$("#msg-search").text(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Please fill in the correct url."])).show();
                    $("#sRusult").text(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Please fill in the correct url."])).show();
                }
                $("#portal-add-layer").fadeIn();
                $('#overlay-s').fadeOut("slow");
                break;
            case "keywords":
                nn.api('GET', cms.reapi('/api/channels'), {
                    keyword: strInput,
                    mso: cms.global.MSOINFO.name
                }, function (channels) {
                    var cntChannel = channels.length;
                    var canChannel = 27 - $("#channelCnt").text();

                    var items = [],
                        temp = [];
                    $.each(channels, function (i, channel) {
                        temp = [];
                        if (channel.imageUrl == '') {
                            channel.imageUrl = 'images/ch_default.png';
                            if (channel.moreImageUrl && '' !== $.trim(channel.moreImageUrl)) {
                                temp = channel.moreImageUrl.split('|');
                                if (temp[0] && temp[0] !== cms.config.EPISODE_DEFAULT_IMAGE) {
                                    channel.imageUrl = temp[0];
                                }
                            }
                        }
                        items.push(channel);
                    });

                    cntChannel = items.length;
                    if (cntChannel > 0) {
                        $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Find [<span>?</span>] channels."], [cntChannel, canChannel]));
                    } else {
                        $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Your search - [xxx] didn't match any channels."], [strInput]));
                    }

                    $('#portal-search-item-tmpl').tmpl(items).appendTo('#search-channel-list');

                    var pageChannel = Math.floor($(".list-holder").width() / 117) * 2;
                    if (cntChannel > pageChannel) {
                        $("#searchNext").show();
                    }
                    $("#portal-add-layer").fadeIn();
                    $('#overlay-s').fadeOut("slow");
                });
                break;
            }
        }
    });

    // add chanel
    $(document).on("click", "#portal_add_channel", function (event) {
        var lis = $("#search-channel-list li .on");
        var cntLis = lis.length;
        var setId = cms.global.USER_URL.param('id');
        //alert(lis.html());

        if (cntLis > 0) {
            $common.showProcessingOverlay();
            var this_id = null,
                committedCnt = 0;
            $.each(lis, function (idx, lisItem) {
                this_id = $(lisItem).attr("id").replace("schk_", "");
                nn.api('POST', cms.reapi('/api/sets/{setId}/channels', {
                    setId: setId
                }), {
                    channelId: this_id
                }, function (msg) {
                    committedCnt += 1;
                    if (committedCnt === cntLis) {
                        committedCnt = -1;   // reset to avoid collision
                        // put resource for update set count
                        nn.api('PUT', cms.reapi('/api/sets/{setId}', {
                            setId: setId
                        }), null, function (set) {
                            $page.init();
                            $("#portal-add-layer").fadeOut("slow");
                            $page._search_channel_clean();
                            $('#overlay-s').fadeOut("slow");
                        });
                    }
                });
            });
        }
        //alert(lis.length);
    });

    $(document).on("click", "#search-channel-list .checkbox", function (event) {
        /*
         $(".sType").removeClass("on");
         $(this).addClass("on");
         $("#sortingType").val($(this).attr("tvalue"));
         */
        var canAdd = $("#sRusult").data("canAdd");
        var li_on = 0;
        var this_li = $(this);

        if (this_li.hasClass("on")) {
            this_li.removeClass("on");
            canAdd += 1;
        } else {
            if (canAdd > 0) {
                this_li.addClass("on");
                canAdd -= 1;
            }
        }

        $("#sRusult").data("canAdd", canAdd);
        //$("#searchCanChannel").text(canAdd);
        li_on = $("#search-channel-list li .on").length;
        if (li_on > 0) {
            $("#searchAdd").show();
        } else {
            $("#searchAdd").hide();
        }
        //console.log("li on: " + li_on + "**** cnaAdd :" + canAdd);
    });

    $(document).on("click", ".sort-list .sType", function (event) {
        //$("#channel-list").sortable("destroy");
        var expSort = ".empty, .isSortable";

        if ($("#sortingType").val() == 2) {
            $("body").addClass("has-change");
            $(".sType").removeClass("on");
            $(this).addClass("on");
            $("#sortingType").val($(this).attr("tvalue"));

            expSort = ".empty";
            $(".btn-top").hide();
            $('body').addClass('has-change');
            $(".isSortable").css("cursor", "move");
            $('#channel-list').sortable({
                cursor: 'move',
                revert: true,
                cancel: expSort,
                change: function (event, ui) {
                    $('body').addClass('has-change');
                }
            });
        } else {
            $.blockUI({
                message: $('#yes-no-prompt')
            });
        }
    });

    $(document).on("click", "#yes-no-prompt .btn-yes", function (event) {
        $("body").removeClass("has-change");
        var setId = cms.global.USER_URL.param('id');

        //$("#channel-list").sortable("destroy");
        $(".sType").removeClass("on");
        $(this).addClass("on");
        $("#sortingType").val($(this).attr("tvalue"));

        $.unblockUI({
            message: $('#yes-no-prompt')
        });

        $common.showProcessingOverlay();
        nn.api('PUT', cms.reapi('/api/sets/{setId}', {
            setId: setId
        }), {
            sortingType: 2
        }, function (set) {
            $page.init();
        });
    });

    $(document).on("click", ".btn-top", function (event) {
        // protal manage remove channel from channel set
        var btnOn = $("#channel-list div.on");
        //alert(btnOn.length);
        var this_li = $(this);
        var up_li = this_li.parents("li");
        var this_id = up_li.attr("id").replace("set_", "");
        var setId = cms.global.USER_URL.param('id');
        // /api/sets/{setId}/channels
        var strTF = "true";
        if (btnOn.length < 4 || this_li.hasClass("on")) {
            if (this_li.hasClass("on")) {
                strTF = "false";
            }

            var parameter = {
                channelId: this_id,
                alwaysOnTop: strTF
            };

            $common.showProcessingOverlay();
            nn.api('POST', cms.reapi('/api/sets/{setId}/channels', {
                setId: setId
            }), parameter, function (msg) {
                // put resource for update set count
                nn.api('PUT', cms.reapi('/api/sets/{setId}', {
                    setId: setId
                }), null, function (set) {
                    $page.init();
                    //$('#overlay-s').fadeOut("slow");
                });
            });
        } else {
            $common.showSystemErrorOverlay(nn._([cms.global.PAGE_ID, 'channel-list', 'You can only set 4 channels on top']));
        }
    });

    $(document).on("click", ".btn-remove", function (event) {
        // protal manage remove channel from channel set
        var this_li = $(this);
        var up_li = this_li.parents("li");
        var this_id = up_li.attr("id").replace("set_", "");
        var setId = cms.global.USER_URL.param('id');
        // /api/sets/{setId}/channels

        var parameter = {
            channelId: this_id
        };

        $common.showProcessingOverlay();
        nn.api('DELETE', cms.reapi('/api/sets/{setId}/channels', {
            setId: setId
        }), parameter, function (msg) {
            // put resource for update set count
            nn.api('PUT', cms.reapi('/api/sets/{setId}', {
                setId: setId
            }), null, function (set) {
                $("#channelCnt").text($("#channelCnt").text() - 1);
                up_li.remove();
                if ($("#channelCnt").text() == 0) {
                    $("#cntChannelEmpty").show();
                }
                $("#empty_channel").removeClass("disable");
                $('#overlay-s').fadeOut("slow");
            });
        });
    });

    $(document).on('click', '#content-nav a, .select-list li a, .studio-nav-wrap a, #profile-dropdown a', function (e) {
        if ($('body').hasClass('has-change')) {
            if (e && $(e.currentTarget).attr('href')) {
                $('body').data('leaveUrl', $(e.currentTarget).attr('href'));
            }
            if (e && $(e.currentTarget).attr('id')) {
                $('body').data('leaveId', $(e.currentTarget).attr('id'));
            }
            $common.showUnsaveOverlay();
            return false;
        }
    });

    $(document).on('click', '#unsave-prompt .btn-leave', function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        if ($('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
            $('#' + $('body').data('leaveId')).trigger('click');
        } else if ($('body').data('leaveUrl')) {
            location.href = $('body').data('leaveUrl');
        } else {
            location.href = 'index.html';
        }
        return false;
    });

    /* Manage */
    $("#portal-layer .channel-list li  .btn-remove").click(function () {
        $(this).parents(".thumb").parents("li").hide();
    });

    /* Message */
    $(".btn-msg-close").click(function () {
        $page._search_channel_clean();
        $(".msg-layer").hide();
    });

    $(document).keyup(function (e) {
        if (e.keyCode == 27) {
            $(".msg-layer").hide();
        }
    });

    /* Add */
    $("#portal-layer .channel-list li.empty").click(function () {
        $("#portal-add-layer").fadeIn(400);
    });

    /* Checkbox */
    $(".checkbox").click(function () {
        $(this).toggleClass("on");
    });

    $("html").click(function () {
        $(".select-gray").find(".select-dropdown").removeClass("on");
        $(".select-gray").find(".select-btn").removeClass("on");
    });

    $(".select-gray").click(function (event) {
        event.stopPropagation();
    });

    $("#btn-portal-ch").on("click", function () {
        $("#dropdown-portal-ch").toggleClass("on");
        $(this).toggleClass("on");
    });

    $("#dropdown-portal-ch li").on("click", function (event) {
        $("#input-portal-ch").data("langkey", $(this).data("tvalue"));
        $("#input-portal-ch").val(nn._([cms.global.PAGE_ID, 'channel-list', $("#input-portal-ch").data("langkey")]));
        $("#input-portal-ch").data("tmpIn", $("#input-portal-ch").val());

        $("#txt-portal-ch").data("langkey", $(this).data("langkey"));
        $("#txt-portal-ch").text($(this).text());

        $("#dropdown-portal-ch").attr("kvale", $(this).attr("kvale"));
        $("#dropdown-portal-ch li").removeClass("on");
        $(this).toggleClass("on");
        $("#dropdown-portal-ch").removeClass("on");
    });

    $("#input-portal-ch").focus(function () {
        //console.log($("#input-portal-ch").data("tmpIn")+"*****"+$(this).val());
        if ($("#input-portal-ch").data("tmpIn") == $(this).val()) {
            $(this).val("");
        }
        //alert("in");
        // $(this).next("span").css('display','inline').fadeOut(1000);
    });

    $("#input-portal-ch").focusout(function () {
        $(this).val($.trim($(this).val()));
        if ($(this).val() == "") {
            $(this).val($("#input-portal-ch").data("tmpIn"));
        }
    });

    $('#system-error .btn-ok, #system-error .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            location.replace('index.html');
        }
        return false;
    });

    function confirmExit() {
        if ($('body').hasClass('has-change')) {
            // Unsaved changes will be lost, are you sure you want to leave?
            return $('#unsave-prompt p.content').text();
        }
    }
    window.onbeforeunload = confirmExit;

    setTimeout(function () {
        // set preview info
        $("#set-preview").click();
    }, 3000);

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $common.scrollbar("#portal-constrain", "#portal-list", "#portal-slider");
        $('#portal-slider .slider-vertical').slider('value', 100);
    });
});
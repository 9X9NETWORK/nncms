/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, sub: true, vars: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['store-promotion'],
        $common = cms.common;

    // add promotion category
    $(document).on("click", ".addPromotionCategory", function(event) {
        // 用到
        var overLayInfo = {
            actType: "add",
            overLayTitle: nn._([cms.global.PAGE_ID, 'overlay', "Add Category"]),
            actButton: nn._([cms.global.PAGE_ID, 'overlay', "Add Category"]),
            valEnName: "",
            valZhName: ""
        };

        if (!$(this).hasClass("disable")) {
            $('#change-category-overlay .overlay-container').empty();
            $('#change-category-overlay-tmpl').tmpl(overLayInfo).appendTo('#change-category-overlay .overlay-container');

            $.blockUI({
                message: $('#change-category-overlay')
            });
        }
        return false;
    });

    // add promotion category - cancel button
    $(document).on("click", "#change-category-overlay .btn-close, #change-category-overlay .btn-cancel", function(event) {
        // 用到
        // add promotion category
        // $('#change-category-overlay').fadeOut("slow");
        $.unblockUI();
        return false;
    });

    // change promotion category
    $(document).on("click", "#store-category-ul .catLi", function(event) {
        // 用到
        var thisLi = $(this),
            catId = parseInt(thisLi.attr("id").replace("catLi_", ""), 10);

        if ($('body').hasClass('has-change') && $('body').hasClass('channel-change')) {
            nn.log("$$has-change .catLi::" + catId);
            // confirmExit();
            $('#confirm-prompt').data("actli", catId);
            $('#confirm-prompt').data("actCat", "change");

            $('#confirm-prompt .content').text(nn._([cms.global.PAGE_ID, 'overlay', "Unsaved changes will be lost, are you sure you want to leave?"]));
            $.blockUI({
                message: $('#confirm-prompt')
            });

        } else {
            $page.catLiClick(catId);
            nn.log("#store-category-ul .catLi::" + catId);

        }
        return false;
    });
    // edit promotion category - show prompt window
    $(document).on("click", ".catLi .btn-edit", function(event) {
        // 用到
        // var thisLi = $(this).parent().parent("li").data("meta");
        var thisLi = $(this).parent("li"),
            overLayInfo = {
                actType: "edit",
                catId:  parseInt(thisLi.attr("id").replace("catLi_", ""), 10),
                overLayTitle: nn._([cms.global.PAGE_ID, 'overlay', "Edit Category"]),
                actButton: nn._([cms.global.PAGE_ID, 'overlay', "Yes"]),
                valEnName: $(thisLi).data("enname"),
                valZhName: $(thisLi).data("zhname")
            };

        $('#change-category-overlay .overlay-container').empty();
        $('#change-category-overlay-tmpl').tmpl(overLayInfo).appendTo('#change-category-overlay .overlay-container');
        $.blockUI({
            message: $('#change-category-overlay')
        });
        return false;
    });


    // add / edit promotion category - action button
    $(document).on("click", "#change-category-overlay .btn-chg-category", function(event) {
        // 用到
        var actType = $(this).data("acttype"),
            inEnName = $("#proCatEnName").val(),
            inZhName = $("#proCatZhName").val(),
            catId = $(this).data("catid"),
            actLi = $("#catLi_"+catId);

        switch (actType) {
            case "add":
                // add promotion category
                if ("" !== inEnName && "" !== inZhName) {
                    var newId = new Date().getTime();
                    $('#store-category-li-tmpl').tmpl({
                        enName: inEnName,
                        zhName: inZhName,
                        id: newId
                    }, {
                        isNew: "new"
                    }).appendTo('#store-category-ul');
                    $page.emptyCategoryDisabled($("#store-category-ul .catLi").length);

                    $('#store-category-ul li').show();

                    if (!$('body').hasClass('channel-change')) {
                        $page.catLiClick(newId);
                    }

                    $page.setSaveButton("on");
                }
                break;

            case "edit":
                // edit promotion category
            if (catId > 0 && "" !== inEnName && "" !== inZhName && (actLi.data("enname") != inEnName || actLi.data("zhname") != inZhName)) {

                actLi.data("enname", inEnName);
                actLi.data("zhname", inZhName);

                actLi.find("span a").text(inZhName);
                actLi.addClass('has-change');

                $page.setSaveButton("on");

            }
            break;
        }
        // add promotion category
        // $('#change-category-overlay').fadeOut("slow");
        // alert(actType);
        $.unblockUI();
        return false;
    });



//// add channel search - start


    $(document).on("click", "#empty_channel", function (event) {
        // search layout
        var cntChannel = $("#channelCnt").text();
        if (cntChannel < $page.setCanChannel) {
            $("#search-title").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Add programs into your “<span>Set 2</span>”"], [$("#store-category-ul .catLi.on").data("zhname")]));
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

    $(document).on("click", "#portal_search_channel", function (event) {
        // button search
        $("#input-portal-ch").val($.trim($("#input-portal-ch").val()));
        var strInput = $("#input-portal-ch").val(),
            searchType = $("#dropdown-portal-ch").attr("kvale"),
            msgErr = "";
        //$("#sRusult").data("canAdd", (27 - $("#channelCnt").text()));
        $("#sRusult").data("canAdd", $page.setCanChannel);
        $('#search-channel-list').html('');
        $("#searchNext").hide();
        $("#searchPrev").hide();

        $("#msg-search").text("");
        $("#msg-search").hide();

        if ($("#input-portal-ch").data("tmpIn") == strInput) {
            switch (searchType) {
            case "url":
                msgErr = "Please fill in the program url to search.";
                break;
            case "keywords":
                msgErr = "Please fill in the keywords to search.";
                break;
            }

            msgErr = nn._([cms.global.PAGE_ID, 'portal-add-layer', msgErr]);
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
                        var cntChannel = channels.length,
                            items = [];

                        items = $page.prepareChannels(channels);
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
                                    $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Find [<span>?</span>] programs."], [cntChannel]));
                                    $('#portal-search-item-tmpl').tmpl(items).appendTo('#search-channel-list');
                                } else {
                                    $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Your search - [xxx] didn't match any programs."], [strInput]));
                                }
                            });
                        } else {
                            $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Your search - [xxx] didn't match any programs."], [strInput]));
                        }

                        var pageChannel = Math.floor($(".list-holder").width() / 117) * 2;
                        if (cntChannel > pageChannel) {
                            $("#searchNext").show();
                        }
                    });
                } else {
                    $("#sRusult").text(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Please fill in the correct url."])).show();
                }
                $("#portal-add-layer").fadeIn();
                $('#overlay-s').fadeOut("slow");
                break;
            case "keywords":

            // search_keyword();
                nn.api('GET', cms.reapi('/api/channels'), {
                    keyword: strInput,
                    mso: cms.global.MSOINFO.name
                }, function (channels) {
                    var cntChannel = channels.length,
                        items = [];

                    items = $page.prepareChannels(channels);
                    cntChannel = items.length;
                    if (cntChannel > 0) {
                        $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Find [<span>?</span>] programs."], [cntChannel]));
                    } else {
                        $("#sRusult").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Your search - [xxx] didn't match any programs."], [strInput]));
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


    $(document).on("click", "#portal_add_channel", function (event) {
        // add chanel
        var lis = $("#search-channel-list li .on"),
            cntLis = lis.length,
            tmpList = [];

        if (cntLis > 0) {
            $common.showProcessingOverlay();
            $('body').addClass('channel-change');
            var this_id = null;
            $.each(lis, function (idx, lisItem) {

                this_id =  parseInt($(lisItem).attr("id").replace("schk_", ""), 10);
                if (-1 === $.inArray(this_id, $page.currentList)) {
                    if ($.inArray(this_id, $page.removeList) > -1) {
                        $page.removeList.splice($.inArray(this_id, $page.removeList), 1);
                    } else {
                        $page.addList.push(this_id);
                    }

                    tmpList.push(this_id);
                }

            });

            if (tmpList.length > 0) {
                nn.api('GET', cms.reapi('/api/channels'), {
                    channels: tmpList.join(',')
                }, function (channels) {
                    var tmpSeq = 0;

                    tmpSeq -= channels.length;
                    $.each(channels, function (idx, channel) {

                        channel.seq = tmpSeq;
                        tmpSeq += 1;
                        $page.nomoList.push(channel);
                        $page.currentList.push(channel.id);

                    });
                    $("#channelCnt").text(parseInt($("#channelCnt").text(), 10) + tmpList.length);
                    $page._drawChannelLis();
                    $page.setSaveButton("on");
                    $("#portal-add-layer").fadeOut("slow");
                    $page._search_channel_clean();
                    $('#overlay-s').fadeOut("slow");
                });
            }

        }
    });

    $(document).on("click", "#search-channel-list .checkbox", function (event) {
        var canAdd = $page.setCanChannel;//$("#sRusult").data("canAdd");
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
        li_on = $("#search-channel-list li .on").length;
        if (li_on > 0) {
            $("#searchAdd").show();
        } else {
            $("#searchAdd").hide();
        }
    });

    $(document).on("click", ".btn-msg-close", function(event) {
        $page._search_channel_clean();
        $(".msg-layer").hide();
    });

    $(document).on("click", "#btn-portal-ch", function(event) {
        $("#dropdown-portal-ch").toggleClass("on");
        $(this).toggleClass("on");
    });

    $("#dropdown-portal-ch li").on("click", function(event) {
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

    $("#input-portal-ch").focus(function() {
        if ($("#input-portal-ch").data("tmpIn") == $(this).val()) {
            $(this).val("");
        }
    });

    $("#input-portal-ch").focusout(function() {
        $(this).val($.trim($(this).val()));
        if ($(this).val() == "") {
            $(this).val($("#input-portal-ch").data("tmpIn"));
        }
    });

    $("html").click(function () {
        $(".select-gray").find(".select-dropdown").removeClass("on");
        $(".select-gray").find(".select-btn").removeClass("on");
    });


//// add channel search - end

    // channel set on top
    $(document).on("click", ".channel-list .btn-top", function(event) {
        // 用到

        var btnOn = $("#store-list .channel-list div.on");
        var this_li = $(this);
        var up_li = this_li.parents("li");
        var this_id = parseInt(up_li.attr("id").replace("channel_", ""), 10);

        if (btnOn.length < $page.onTopLimit || this_li.hasClass("on")) {
            $common.showProcessingOverlay();
            if (this_li.hasClass("on")) {
                this_li.removeClass("on");
            } else {
                this_li.addClass("on");
            }
            $page._setOnTop(this_id);
            $('body').addClass('channel-change');
            $('#overlay-s').fadeOut("slow");
        } else {
            $common.showSystemErrorOverlay(nn._([cms.global.PAGE_ID, 'channel-list', 'You can only set 4 programs on top']));
        }
    });

    // remove channel from promotion category channel list
    $(document).on("click", ".channel-list .btn-remove", function(event) {
        // 用到
        // protal manage remove channel from channel set
        var this_li = $(this);
        var up_li = this_li.parents("li");
        var this_id = parseInt(up_li.attr("id").replace("channel_", ""), 10);

        var inCurrent = false,
            inAdd = false;

        $('body').addClass('has-change');

        if (-1 !== $.inArray(this_id, $page.currentList)) {
            inCurrent = true;
        }
        if (-1 !== $.inArray(this_id, $page.addList)) {
            inAdd = true;
        }

        if (inCurrent === true && inAdd === false) {
            $page.removeList.push(this_id);
            $page.currentList.splice($.inArray(this_id, $page.currentList), 1);

        } else if (inCurrent === false && inAdd === true) {
            $page.addList.splice($.inArray(this_id, $page.addList), 1);
        }
        $page._removeChannelFromList(this_id);

        $page.onTopAddList.splice($.inArray(this_id, $page.onTopAddList), 1);
        $page.onTopRemoveList.splice($.inArray(this_id, $page.onTopRemoveList), 1);

        // up_li.remove();
         $page._drawChannelLis();
        $page.setSaveButton("on");
        // $("#channelCnt").text($("#channelCnt").text() - 1);
        // if ($("#channelCnt").text() == 0) {
        //     $("#cntChannelEmpty").show();
        // }
        // $("#empty_channel").removeClass("disable");
    });

    // delete promotion category - show prompt window
    $(document).on("click", ".catLi .btn-remove", function(event) {
        // 用到
        var thisLi = $(this).parent("li"),
            catId = parseInt(thisLi.attr("id").replace("catLi_", ""), 10);

        $('#confirm-prompt').data("actli", catId);
        $('#confirm-prompt').data("actCat", "delete");

        $('#confirm-prompt .content').text(nn._([cms.global.PAGE_ID, 'overlay', "Are you sure to remove this promotion Category?"]));
        $.blockUI({
            message: $('#confirm-prompt')
        });

        return false;
    });

    // delete promotion category - confirm to delete
    // confirm prompt - unsave change promotion category
    $('#confirm-prompt .btn-leave').click(function(event) {
        // 用到
        var catId = $('#confirm-prompt').data("actli"),
            catAction = $('#confirm-prompt').data("actCat"),
            thisLi = $("#catLi_" + catId),
            isNew = thisLi.hasClass("newCat"),
            isOn = thisLi.hasClass("on"),
            nonNewCat = 0;

        $('#confirm-prompt').data("actli", "");
        $('#confirm-prompt').data("actCat", "");

        // when it's a new promotion category leave it, don't push into delete list , because it didn't real exist
        // $page.emptyChannel();
        if (catId > 0 && !isNew) {
            // delete promotion category
            if ("delete" === catAction) {
                $page.promoCatRemoveList.push(catId);
                thisLi.remove();
                $page.emptyCategoryDisabled($("#store-category-ul .catLi").length);
                $page.setSaveButton("on");
                $.unblockUI();
                if (isOn) {
                    nonNewCat = $page.catGetNonNew();
                    $page.emptyChannel();
                    if (nonNewCat > 0) {
                        $page.catLiClick(nonNewCat);
                    }
                }
            } else {
                // change category
                $.unblockUI();
                $page.drawPromotionCategory(cms.global.MSO, catId);
                $('body').removeClass('has-change');
            }
        } else {
            if ("delete" === catAction) {
                thisLi.remove();
                $page.emptyCategoryDisabled($("#store-category-ul .catLi").length);
                $page.setSaveButton("on");
                $.unblockUI();
                if (isOn) {
                    nonNewCat = $page.catGetNonNew();
                    $page.emptyChannel();
                    if (nonNewCat > 0) {
                        $page.catLiClick(nonNewCat);
                    }
                }
            }
        }
        return false;

    });


    // promotion category save funtion
    // todo: 
    // done 1. process promotion category 
    // done   a. each li to generate update and new promotion category infomation
    // done   b. $page.promoCatRemoveList to generate delete promotion category information 
    // 2. process promotion category channels
    $(document).on("click", "#set-save", function(event) {
        // 用到
        if (!$("#set-save p.btns").hasClass("disableBB")) {
            var msoId = cms.global.MSO,
                catLiLists = $("#store-category-ul li.catLi"),
                tmpSeq = 0,
                tmpHasChange = false,
                theSeq = 0,
                procList = [],
                tmpItem = {},
                newCatList = [], newCatCount = 0,
                stSwitchOn = !$(".switch-on").hasClass("hide"),
                stSwitchOff = !$(".switch-off").hasClass("hide"),
                catMinus = $("#store-category-ul li.minus"),
                catMinusList = [],
                tmpMsoAdd = cms.global.USER_DATA["msoAdd"],
                tmpMsoRemove = cms.global.USER_DATA["msoRemove"],currentCategoryId = parseInt($("#store-category-ul .catLi.on").attr("id").replace("catLi_", ""), 10);

            $common.showProcessingOverlay();

            $.each(catLiLists, function(eKey, eValue) {
                tmpItem = {};
                tmpHasChange = false;
                theSeq = eKey + 1;
                tmpSeq = $(eValue).data("seq");
                tmpHasChange = $(eValue).hasClass("has-change");


                if (theSeq != tmpSeq || tmpHasChange) {

                    tmpItem["msoId"] = msoId;
                    tmpItem["seq"] = theSeq;
                    tmpItem["zhName"] = $(eValue).data("zhname");
                    tmpItem["enName"] = $(eValue).data("enname");
                    tmpItem["name"] = $(eValue).data("zhname");
                    tmpItem["id"] = $(eValue).data("meta");
                    tmpItem["newId"] = $(eValue).data("meta");
                    if ($(eValue).hasClass("newCat")) {
                        tmpItem["id"] = 0;
                        newCatCount ++ ;
                    }
                    procList.push(tmpItem);
                }

            });


            procPromotionCat(procList)
                .then(setChannelsOnTop)
                .then(addChannels)
                .then(removeChannels)
                .then(procEnd);


        }
        // currentCategoryId = parseInt($("#store-category-ul .catLi.on").attr("id").replace("catLi_", ""), 10);
        function procPromotionCat(procList) {
            var deferred = $.Deferred(),
                tmpItem,
                catDelLists = $page.promoCatRemoveList;
            nn.log("1: now in addChannels");
            $.each(procList, function(eKey, eValue) {
                if (eValue.id > 0) {
                    // promotion category update
                    nn.api('PUT', cms.reapi('/api/category/{categoryId}', {
                        categoryId: eValue.id
                    }), {
                        seq: eValue.seq,
                        enName: eValue.enName,
                        zhName: eValue.zhName
                    }, null);
                } else {
                    // promotion category add
                    newCatList[eValue.seq] = eValue.newId;
                    nn.api('POST', cms.reapi('/api/mso/{msoId}/categories', {
                        msoId: eValue.msoId
                    }), {
                        name: eValue.name,
                        seq: eValue.seq,
                        enName: eValue.enName,
                        zhName: eValue.zhName
                    }, function(addChannel) {
                        // todo new category on fucus
                        // todo new category new id
                        newCatCount--;
                        var newId = addChannel.id, newCat = $("#catLi_" + newCatList[addChannel.seq]);

                        // var aa = newCatList;

                        // var aa_id = newCatList[addChannel.seq];
                        newCat.attr("id", "catLi_" + newId).attr("data-meta", newId);
                        if (newCatCount === 0) {
                            currentCategoryId = parseInt($("#store-category-ul .catLi.on").attr("id").replace("catLi_", ""), 10);
                            deferred.resolve();
                        }
                    });
                }
            });
            $("#store-category-ul .catLi").removeClass("newCat");
            // promotion category delete
            $.each(catDelLists, function(eKey, eValue) {

                nn.api('DELETE', cms.reapi('/api/category/{categoryId}', {
                    categoryId: eValue
                }), null, function(category) {
                    nn.log(category);
                });

            });
            $page.promoCatRemoveList = [];

            if (newCatCount === 0) {
                nn.log("newCatCount yes::"+newCatCount);
                deferred.resolve();
            }
            else
            {
                nn.log("newCatCount no::"+newCatCount);
            }

            return deferred.promise();
        }

        function procEnd() {
            var deferred = $.Deferred();
            nn.log("4: now in removeChannels");
            $page.listCatChannel(msoId, currentCategoryId, $page.channelPageSize);

            $('#overlay-s').fadeOut("slow");
            $page.setSaveButton("off");
            $('body').removeClass('channel-change')
            deferred.resolve();

            return deferred.promise();
        }


        function addChannels() {
            var deferred = $.Deferred();
            nn.log("3: now in addChannels");
            if ($page.addList.length > 0) {
                nn.api('POST', cms.reapi('/api/category/{categoryId}/channels', {
                    categoryId: currentCategoryId
                }), {
                    channels: $page.addList.join(',')

                }, function(msg) {
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
            }

            return deferred.promise();
            // return deferred.promise();
        }

        function removeChannels() {
            var deferred = $.Deferred();
            nn.log("4: now in removeChannels");
            if ($page.removeList.length > 0) {
                nn.api('DELETE', cms.reapi('/api/category/{categoryId}/channels', {
                    categoryId: currentCategoryId
                }), {
                    channels: $page.removeList.join(',')

                }, function(msg) {
                    deferred.resolve();
                });

            } else {
                deferred.resolve();
            }
            return deferred.promise();
            // return deferred.promise();
        }
        // todo
        // get now on top list
        // check if old ontop list if 
        function setChannelsOnTop() {
            var deferred = $.Deferred();
            nn.log("2: now in setChannelsOnTop["+newCatCount+"]");
            var testing = 0;
            // while (newCatCount > 0){
            //     testing ++;
            //     nn.log("2 - while:: "+ newCatCount);
            // }
            // currentCategoryId = parseInt($("#store-category-ul .catLi.on").attr("id").replace("catLi_", ""), 10);
            nn.api('GET', cms.reapi('/api/category/{categoryId}/channels', {
                categoryId: currentCategoryId
            }), null, function(channels) {

                var oldOnTop = $page.procOnTopList(channels, $page.sortingType),
                    oldOnTopList = [],
                    nowOnTopList = [],
                    tmpSeq = 0,
                    cntTotal = oldOnTop.length + $page.onTopList.length;


                nn.log("1 : on top remove");
                if (cntTotal != 0) {
                    $.each(oldOnTop, function(eKey, eValue) {

                        nn.api('POST', cms.reapi('/api/category/{categoryId}/channels', {
                            categoryId: currentCategoryId
                        }), {
                            channelId: eValue.id,
                            alwaysOnTop: false
                        }, function(msg) {
                            cntTotal--;
                            nn.log("1::0 ::" + cntTotal + "::" + msg);
                            if (cntTotal < 1) {
                                deferred.resolve();
                            } else {
                                // nn.log("1::0 ::" + cntTotal + "::" +  msg);
                            }
                        });

                        // oldOnTopList.push(eValue.id);
                    });

                    nn.log("2 : on top add");
                    $.each($page.onTopList, function(eKey, eValue) {
                        tmpSeq = eKey + 1;
                        nn.api('POST', cms.reapi('/api/category/{categoryId}/channels', {
                            categoryId: currentCategoryId
                        }), {
                            channelId: eValue.id,
                            seq: tmpSeq,
                            alwaysOnTop: true
                        }, function(msg) {
                            cntTotal--;
                            nn.log("2::0 ::" + cntTotal + "::" + msg);
                            if (cntTotal < 1) {

                                deferred.resolve();
                            }

                        });
                    });
                } else {
                    deferred.resolve();
                }

            });

            return deferred.promise();
        }

    });


    $(document).on("click", ".catLi .btn-minus", function(e) {
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

        $('body').addClass('channel-change');

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
            $page.setSaveButton("on");
        } else {
            // remove channle
            if (inCurrent === true && inAdd === false) {
                cms.global.USER_DATA["msoRemove"].push(channelId);
            } else if (inCurrent === false && inAdd === true) {
                cms.global.USER_DATA["msoAdd"].splice($.inArray(channelId, cms.global.USER_DATA["msoAdd"]), 1);
            }
            $page.setSaveButton("on");
            thisDiv.addClass("on");
            upLi.addClass("minus");
            thisDiv.find("p.center").text(nn._([cms.global.PAGE_ID, 'channel-list', 'Add channel']));
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
            $page.setSaveButton("on");
            $common.showProcessingOverlay();
            $('#store-layer').hide();
            $('.intro a.switch-off').removeClass("hide");
            $('.intro a.switch-on').addClass("hide");
            $('.intro .msg-error').removeClass("hide");
            $('.intro .msg-error').show();
            $('#overlay-s').fadeOut("slow");
            $("#store-list .channel-list").empty();
        }
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
        $page.setSaveButton("on");
    });

    $('#store-list').scroll(function (event) {
        var $storeList = $('#store-list');

        if ($storeList.scrollTop() + $storeList.outerHeight() >= $storeList[0].scrollHeight && cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
            $storeList.find('.load').fadeIn('slow');
            $page.getMoreChannels();
        }
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
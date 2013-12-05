/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, vars: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['portal-manage'],
        $common = cms.common;

    // add / edit channel set - action button
    $(document).on("click", "#change-category-overlay .btn-chg-category", function (event) {
        // 用到
        var actType = $(this).data("acttype"),
            inSetName = $("#setName").val(),
            setId = $(this).data("setid"),
            actLi = $("#catLi_" + setId);

        switch (actType) {
        case "add":
            // add channel set
            if ("" !== inSetName) {
                var newId = new Date().getTime();
                $('#store-category-li-tmpl').tmpl({
                    name: inSetName,
                    sortingType: 2,
                    id: newId
                }, {
                    isNew: "new"
                }).appendTo('#store-category-ul');

                $('#store-category-ul li').show();

                if (!$('body').hasClass('channel-change')) {
                    $page.catLiClick(newId);
                }
            }
            break;

        case "edit":
            // edit channel set
            if (setId > 0 && "" !== inSetName && (actLi.data("name") != inSetName)) {
                actLi.data("name", inSetName);
                actLi.find("span a").text(inSetName);
                actLi.addClass('has-change');
            }
            break;
        }
        $.unblockUI();
        return false;
    });

    // channel set add/edit close button
    $(document).on("click", "#change-category-overlay .btn-cancel, #change-category-overlay .btn-close, #message-prompt .btn-ok", function (event) {
        $.unblockUI();
        return false;
    });

    // add channel set
    $(document).on("click", ".addChannelSet", function (event) {
        var overLayInfo = {
            actType: "add",
            overLayTitle: nn._([cms.global.PAGE_ID, 'overlay', "Add Channel Set"]),
            actButton: nn._([cms.global.PAGE_ID, 'overlay', "Add Channel Set"]),
            setName: ""
        };
        if ($page.isChannelSetAdd()) {
            $('#change-category-overlay .overlay-container').empty();
            $('#change-category-overlay-tmpl').tmpl(overLayInfo).appendTo('#change-category-overlay .overlay-container');

            $.blockUI({
                message: $('#change-category-overlay')
            });
        } else {

            $('#message-prompt .content').text(nn._([cms.global.PAGE_ID, 'prompt', "You channel set Quota was used."]));
            $.blockUI({
                message: $('#message-prompt')
            });
        }
        return false;
    });

    // edit channel set
    $(document).on("click", ".catLi .btn-edit", function (event) {
        // 用到
        var thisLi = $(this).parent("li"),
            overLayInfo = {
                actType: "edit",
                setId:  parseInt(thisLi.attr("id").replace("catLi_", ""), 10),
                overLayTitle: nn._([cms.global.PAGE_ID, 'overlay', "Edit Channel Set"]),
                actButton: nn._([cms.global.PAGE_ID, 'overlay', "Yes"]),
                setName: $(thisLi).data("name")
            };
        $('#change-category-overlay .overlay-container').empty();
        $('#change-category-overlay-tmpl').tmpl(overLayInfo).appendTo('#change-category-overlay .overlay-container');
        $.blockUI({
            message: $('#change-category-overlay')
        });
        return false;
    });

    // delete channel set - show prompt window
    $(document).on("click", ".catLi .btn-remove", function (event) {
        // 用到
        var thisLi = $(this).parent("li"),
            catId = parseInt(thisLi.attr("id").replace("catLi_", ""), 10);

        $('#confirm-prompt').addClass("btn2remove");
        $('#confirm-prompt').removeClass("btn2change");

        $('#confirm-prompt').data("actli", catId);
        $('#confirm-prompt').data("actCat", "delete");

        $('#confirm-prompt .content').text(nn._([cms.global.PAGE_ID, 'overlay', "Are you sure to remove this channel set?"]));
        $.blockUI({
            message: $('#confirm-prompt')
        });

        return false;
    });

    // unsave delete / change channel set - confirm to delete / change
    $(document).on("click", "#confirm-prompt .btn-leave", function (event) {
        // 用到
        var catId = $('#confirm-prompt').data("actli"),
            thisLi = $("#catLi_" + catId),
            isNew = thisLi.hasClass("newCat"),
            isOn = thisLi.hasClass("on"),
            nonNewCat = 0,
            isRemove = $('#confirm-prompt').hasClass("btn2remove"),
            isChange = $('#confirm-prompt').hasClass("btn2change");

        $('#confirm-prompt').data("actli", "");
        $('#confirm-prompt').data("actCat", "");

        if (isChange) {
            // unsave - change channel set
            $page.emptyChannel();
            $page.sortingType = thisLi.data("sortingtype");
            $page.catLiClick(catId);
            $.unblockUI();
        } else if (isRemove) {
            // remove channel set
            if (!isNew) {
                $page.ChannelSetRemoveList.push(catId);
            }
            thisLi.remove();
            if (isOn) {
                $page.emptyChannel();
                nonNewCat = $page.catGetNonNew();
                if (nonNewCat > 0) {
                    $page.catLiClick(nonNewCat);
                }
            }
            if ($(".catLi").length < 1) {
                $page.emptySet();
            }
            $.unblockUI();
        }
        $("body").addClass("has-change");

        $('#confirm-prompt').removeClass("btn2change").removeClass("btn2remove");
        return false;
    });


    // change channel set
    $(document).on("click", "#store-category-ul .catLi", function (event) {
        // 用到
        var thisLi = $(this),
            catId = parseInt(thisLi.attr("id").replace("catLi_", ""), 10);
        if ($('body').hasClass('has-change')) {

            $('#confirm-prompt').addClass("btn2change");
            $('#confirm-prompt').removeClass("btn2remove");
            // confirmExit();
            $('#confirm-prompt').data("actli", catId);
            $('#confirm-prompt').data("actCat", "change");

            $('#confirm-prompt .content').text(nn._([cms.global.PAGE_ID, 'overlay', "Unsaved changes will be lost, are you sure you want to leave?"]));
            $.blockUI({
                message: $('#confirm-prompt')
            });
        } else {
            $page.sortingType = thisLi.data("sortingtype");
            $page.catLiClick(catId);
        }
        return false;
    });

    $(document).on("click", "#set-preview", function (event) {
        // 2013/06/20 remove tv from URL
        var setId = cms.global.USER_URL.param('id'),
            preUrl = $.url().attr('host') + "/#/streaming/",
            msoId = cms.global.MSO,
            thisA = $(this),
            thisMeta = null;

        thisMeta = thisA.data("meta");
        if ("isLoad" !== thisMeta) {
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
                    thisA.data("meta", "isLoad");
                });
            });
            return false;
        }
    });

    $(document).on("click", "#set-save", function (event) {
        var msoId = cms.global.MSO,
            catLiLists = $("#store-category-ul li.catLi"),
            theSeq = 0,
            procList = [],
            tmpItem = {},
            newCatList = [],
            currentSetId = 0,
            tmpCat = $("#store-category-ul .catLi.on");
        nn.log("000: save.....");
        currentSetId = parseInt(tmpCat.data("meta"), 10);
        // set Channel set
        $.each(catLiLists, function (eKey, eValue) {
            theSeq = eKey + 1;
            $(eValue).data("seq", theSeq);

            tmpItem = {};
            tmpItem.msoId = msoId;
            tmpItem.id = $(eValue).data("meta");
            tmpItem.seq = theSeq;
            tmpItem.name = $(eValue).data("name");
            tmpItem.sortingType = $(eValue).data("sortingtype");

            if ($(eValue).hasClass("newCat")) {
                tmpItem.id = 0;
                newCatList.push(tmpItem);
            } else {
                procList.push(tmpItem);
            }
        });

        // channel set delete
        function channelSetDelete() {
            var deferred = $.Deferred(),
                cntRemove = $page.ChannelSetRemoveList.length;
            nn.log("2: channel set delete");
            if (cntRemove > 0) {
                $.each($page.ChannelSetRemoveList, function (eKey, eValue) {
                    nn.api('DELETE', cms.reapi('/api/sets/{setId}', {
                        setId: eValue
                    }), null, function (msg) {
                        // nn.log(msg);
                        cntRemove -= 1;
                        if (cntRemove === 0) {
                            $page.ChannelSetRemoveList = [];
                            deferred.resolve();
                        }
                    });
                });
            } else {
                deferred.resolve();
            }
            return deferred.promise();
        }

        // channel set add
        function channelSetAdd() {
            var deferred = $.Deferred(),
                cntAdd = newCatList.length;
            nn.log("3: channel set add");
            if (cntAdd > 0) {

                $.each(newCatList, function (eKey, eValue) {
                    nn.api('POST', cms.reapi('/api/mso/{msoId}/sets', {
                        msoId: msoId
                    }), {
                        name: eValue.name,
                        sortingType: eValue.sortingType,
                        seq: eValue.seq
                    }, function (set) {
                        var setLocate = set.seq - 1,
                            tmpObj = catLiLists[setLocate],
                            objId = "";
                        cntAdd -= 1;
                        objId = "catLi_" + set.id;
                        $(tmpObj).attr("id", objId);
                        $("#" + objId).data("meta", set.id);
                        $("#" + objId).data("seq", set.seq);
                        $(tmpObj).removeClass("newCat");
                        if ($(tmpObj).hasClass("on")) {
                            currentSetId = set.id;
                        }
                        if (cntAdd === 0) {
                            newCatList = [];
                            deferred.resolve();
                        }
                    });
                });

            } else {
                deferred.resolve();
            }
            return deferred.promise();
        }

        // channel set update
        function channelSetUpdate() {
            var deferred = $.Deferred(),
                cntUpdate = procList.length;
            nn.log("4: channel set Update--" + cntUpdate);
            if (cntUpdate > 0) {

                $.each(procList, function (eKey, eValue) {
                    nn.api('PUT', cms.reapi('/api/sets/{setId}', {
                        setId: eValue.id
                    }), {
                        name: eValue.name,
                        sortingType: eValue.sortingType,
                        seq: eValue.seq
                    }, function (set) {
                        cntUpdate -= 1;
                        nn.log("cntUpdate::::" + cntUpdate);
                        if (cntUpdate === 0) {
                            procList = [];
                            deferred.resolve();
                        }
                    });
                });

            } else {
                deferred.resolve();
            }
            return deferred.promise();
        }

        // channel set programs process
        function channelSetPrograms() {
            var deferred = $.Deferred(),
                actChannelCount = 0,
                actChannel = [],
                setId = currentSetId;

            nn.log("5: channelSetPrograms");
            if (setId > 0) {
                $.each($page.removeList, function (i, channel) {
                    if (channel > 0) {
                        actChannel.push({
                            chAction: "DELETE",
                            chId: channel
                        });
                    }
                });

                $.each($page.addList, function (i, channel) {
                    if (channel > 0) {
                        actChannel.push({
                            chAction: "POST",
                            chId: channel
                        });
                    }
                });

                $page.removeList = [];
                $page.addList = [];

                actChannelCount = actChannel.length;

                if (actChannelCount > 0) {
                    $.each(actChannel, function (i, channel) {

                        nn.api(channel.chAction, cms.reapi('/api/sets/{setId}/channels', {
                            setId: setId
                        }), {
                            channelId: channel.chId
                        }, function (msg) {
                            actChannelCount = actChannelCount - 1;
                            if (actChannelCount === 0) {
                                // update channelCnt
                                nn.api('PUT', cms.reapi('/api/sets/{setId}', {
                                    setId: setId
                                }), null, null);
                                deferred.resolve();
                            }
                        });

                    });
                } else {
                    deferred.resolve();
                }
            } else {
                $page.removeList = [];
                $page.addList = [];

                deferred.resolve();
            }
            return deferred.promise();
        }

        // channel set update
        function channelSetProgramsSort() {
            var deferred = $.Deferred(),
                tmpDiv,
                channels = [],
                nowTopList = [],
                this_id = 0,
                setId = currentSetId;
            nn.log("6: channelSetProgramsSort");
            $("#channel-list li.itemList").each(function () {
                this_id = $(this).attr("id").replace("set_", "");
                if (this_id > 0) {
                    channels.push(this_id);
                }
                tmpDiv = $(this).find(".btn-top");

                if ($(tmpDiv[0]).hasClass("on")) {
                    nowTopList.push(this_id);
                }
            });

            if (channels.length > 0) {
                nn.api('PUT', cms.reapi('/api/sets/{setId}/channels/sorting', {
                    setId: setId
                }), {
                    channels: channels.join(',')
                }, function (set) {

                    if (2 === $page.sortingType) {
                        nn.api('GET', cms.reapi('/api/sets/{setId}/channels', {
                            setId: setId
                        }), null, function (chanels) {
                            var cntChanels = chanels.length,
                                dbTopList = [],
                                procListSort = [],
                                tmpId = 0,
                                actChannelCount2 = 0;

                            if (cntChanels > 0) {
                                dbTopList = $page._getItemIdArray($page.procOnTopList(chanels, $page.sortingType));
                            }

                            $.each(nowTopList, function (i, chId) {
                                tmpId = parseInt(chId, 10);
                                if ($.inArray(tmpId, dbTopList) > -1) {
                                    dbTopList.splice($.inArray(tmpId, dbTopList), 1);
                                } else {
                                    procListSort.push({
                                        onTop: true,
                                        chId: tmpId
                                    });
                                }

                            });

                            $.each(dbTopList, function (i, chId) {
                                tmpId = parseInt(chId, 10);
                                if (tmpId > 0) {
                                    procListSort.push({
                                        onTop: false,
                                        chId: tmpId
                                    });
                                }
                            });
                            actChannelCount2 = procListSort.length;

                            if (actChannelCount2 > 0) {
                                $.each(procListSort, function (i, channel) {
                                    nn.api("POST", cms.reapi('/api/sets/{setId}/channels', {
                                        setId: setId
                                    }), {
                                        channelId: channel.chId,
                                        alwaysOnTop: channel.onTop
                                    }, function (retValue) {
                                        actChannelCount2 -= 1;
                                        if (actChannelCount2 === 0) {

                                            deferred.resolve();
                                        }
                                    });
                                });
                            } else {
                                deferred.resolve();
                            }
                        });

                    } else {
                        deferred.resolve();
                    }

                });
            } else {
                deferred.resolve();
            }
            return deferred.promise();
            // return deferred.promise();
        }

        // channel set sort
        function procEnd() {
            var deferred = $.Deferred();
            nn.log("7: procEnd");
            $('#overlay-s').fadeOut("slow");
            $('body').removeClass('has-change');
            deferred.resolve();
            return deferred.promise();
        }

        // channel set update
        function procStart() {
            var deferred = $.Deferred();
            nn.log("1: procStart");
            $common.showProcessingOverlay();
            deferred.resolve();
            return deferred.promise();
            // return deferred.promise();
        }

        if ($('body').hasClass('has-change')) {
            procStart()
                .then(channelSetDelete)
                .then(channelSetAdd)
                .then(channelSetUpdate)
                .then(channelSetPrograms)
                .then(channelSetProgramsSort)
                .then(procEnd);
            return false;
        }
    });

    $(document).on("keyup", "#input-portal-ch", function (event) {
        if (event.which == 13) {
            $("#portal_search_channel").click();
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

    $(document).on("click", "#empty_channel", function (event) {
        // search layout
        if ($page.isProgramAdd()) {
            $("#search-title").html(nn._([cms.global.PAGE_ID, 'portal-add-layer', "Add programs into your “<span>Set 2</span>”"], [$("#store-category-ul .catLi.on").data("name")]));
            $("#portal-add-layer").fadeIn();
        } else {

            $('#message-prompt .content').text(nn._([cms.global.PAGE_ID, 'prompt', "You program Quota was used."]));
            $.blockUI({
                message: $('#message-prompt')
            });
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
                var objUrl = $common.playerUrlParser(strInput);
                if (objUrl.chId > 0 && objUrl.isAllow) {
                    nn.api('GET', cms.reapi('/api/channels'), {
                        channels: objUrl.chId
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
            tmpList = [],
            tmpMsoName = cms.global.MSOINFO.name || "9x9";

        if (cntLis > 0) {
            $common.showProcessingOverlay();
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
                        channel.msoName = tmpMsoName;
                        tmpSeq += 1;
                        $page.nomoList.push(channel);
                        $page.currentList.push(channel.id);

                    });
                    $("body").addClass("has-change");
                    $("div.info .form-title").html(nn._([cms.global.PAGE_ID, 'channel-list', "Program List : ? Programs"], [$("#channel-list .itemList").length + tmpList.length]));
                    $page._drawChannelLis();
                    $("#portal-add-layer").fadeOut("slow");
                    $page._search_channel_clean();
                    $('#overlay-s').fadeOut("slow");
                });
            }

        }
    });

    $(document).on("click", "#search-channel-list .checkbox", function (event) {
        var canAdd = $page.setCanChannel;
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
        $page.setCanChannel = canAdd;
        li_on = $("#search-channel-list li .on").length;
        if (li_on > 0) {
            $("#searchAdd").show();
        } else {
            $("#searchAdd").hide();
        }
    });

    // sorting type
    $(document).on("click", "span.sType", function (event) {

        var tmpStrValue = "",
            tmpValue = 0,
            thisLi = $(".catLi.on"),
            expSort = ".empty, .isSortable";

        tmpStrValue = $(this).attr("tvalue");
        tmpValue = parseInt(tmpStrValue, 10);

        if (tmpValue !== $page.sortingType) {
            $common.showProcessingOverlay();
            $("body").addClass("has-change");
            $(".sType").removeClass("on");
            $(this).addClass("on");
            $page.sortingType = tmpValue;
            // $("#sortingType").val(tmpValue);
            thisLi.data("sortingtype", tmpValue);

            if (1 === tmpValue) {
                $page.nomoList = $page.onTopList.concat($page.nomoList);
                $page.onTopList = [];
                expSort = ".empty";
                $(".btn-top").addClass("hide");
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

                $page.onTopList = $page.procOnTopList($page.nomoList, $page.sortingType);
                $page.nomoList = $page.procNomoList($page.nomoList, $page.sortingType);

                $page._drawChannelLis();
                $page._reListSeq();

                $(".btn-top").removeClass("hide");

                $(".isSortable").css("cursor", "pointer");
                $('#channel-list').sortable({
                    cursor: 'move',
                    revert: true,
                    cancel: expSort,
                    change: function (event, ui) {
                        $('body').addClass('has-change');
                    }
                });
            }
            $('#overlay-s').fadeOut("slow");
        }
        return false;
    });

    $(document).on("click", "#yes-no-prompt .btn-yes", function (event) {
        $("body").removeClass("has-change");
        var setId = $page.setId;

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
        var this_li = $(this);
        var up_li = this_li.parents("li");
        var this_id = parseInt(up_li.attr("id").replace("set_", ""), 10);

        if (btnOn.length < $page.onTopLimit || this_li.hasClass("on")) {
            $common.showProcessingOverlay();
            if (this_li.hasClass("on")) {
                this_li.removeClass("on");
            } else {
                this_li.addClass("on");
            }

            $page._setOnTop(this_id);
            $("body").addClass("has-change");
            $('#overlay-s').fadeOut("slow");
        } else {
            $common.showSystemErrorOverlay(nn._([cms.global.PAGE_ID, 'channel-list', 'You can only set 4 programs on top']));
        }
    });

    $(document).on("click", "#channel-list .btn-remove", function (event) {
        // protal manage remove channel from channel set
        var this_li = $(this);
        var up_li = this_li.parents("li");
        var this_id = parseInt(up_li.attr("id").replace("set_", ""), 10);

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

        $("#channelCnt").text($("#channelCnt").text() - 1);
        up_li.remove();
        if ($("#channelCnt").text() == 0) {
            $("#cntChannelEmpty").show();
        }
        $("#empty_channel").removeClass("disable");
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
        if ($("#input-portal-ch").data("tmpIn") == $(this).val()) {
            $(this).val("");
        }
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
    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $('#store-list').perfectScrollbar('update');
    });
});
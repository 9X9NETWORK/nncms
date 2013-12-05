/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, vars: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;
    $page.sortingType = 1;
    $page.onTopLimit = 4;
    $page.setId = 0;
    $page.setCanChannel = 0;
    $page.onTopList = [];
    $page.nomoList = [];
    $page.currentList = [];
    $page.addList = [];
    $page.removeList = [];
    $page.onTopAddList = [];
    $page.onTopRemoveList = [];
    $page.chSetLimit = 3;
    $page.chSetProgramLimit = 27;
    $page.chSetProgramLess = 0;

    $page.ChannelSetRemoveList = [];

    $page.catGetNonNew = function () {
        var retValue = 0,
            catList = $("#store-category-ul .catLi"),
            tmpCat,
            i,
            j;

        for (i = 0, j = catList.length; i < j; i += 1) {
            tmpCat = catList[i];
            if (!$(tmpCat).hasClass("newCat")) {
                retValue = $(tmpCat).data("meta");
                return retValue;
            }

        }
        return retValue;
    };

    $page.isProgramAdd = function () {
        var cuntProgram = $("#channel-list .itemList").length,
            limitProgram = parseInt(cms.global.MSOINFO.maxChPerSet, 10);

        if (isNaN(cms.global.MSOINFO.maxChPerSet)) {
            limitProgram = $page.chSetProgramLimit;
        }
        $page.setCanChannel = limitProgram - cuntProgram;
        return limitProgram > cuntProgram;
    };

    $page.isChannelSetAdd = function () {
        var cuntChannelSet = $("#store-category-ul .catLi").length,
            limitChannelSet = parseInt(cms.global.MSOINFO.maxSets, 10);

        if (isNaN(cms.global.MSOINFO.maxSets)) {
            limitChannelSet = $page.chSetLimit;
        }
        return limitChannelSet > cuntChannelSet;
    };

    $page._search_channel_clean = function () {
        $("#msg-search").hide();
        $("#sRusult").html("");
        $("#search-channel-list").html("");
        $("#searchAdd").hide();
        $("#searchPrev").hide();
        $("#searchNext").hide();
        $("#input-portal-ch").val($("#input-portal-ch").data("tmpIn"));
    };

    $page.procPartList = function (inList, partType) {

        var retValue = [],
            tmpOnTop = [],
            tmpNomo = [];

        $.each(inList, function (i, channel) {
            if (channel.alwaysOnTop === true) {
                tmpOnTop.push(channel);
            } else {
                tmpNomo.push(channel);
            }
        });

        if ("onTop" === partType) {
            retValue = tmpOnTop;
        } else {
            retValue = tmpNomo;
        }
        return retValue;
    };

    $page._getItemIdArray = function (inList) {
        var retValue = [];

        $.each(inList, function (i, channel) {
            retValue.push(channel.id);
        });
        return retValue;
    };

    $page.procNomoList = function (inList, sortingType) {
        // 
        var retValue = [];
        if (1 === sortingType) {
            retValue = inList;
        } else {
            retValue = $page.procPartList(inList, "");
        }
        return retValue;
    };

    $page.procOnTopList = function (inList, sortingType) {
        var retValue = [];
        if (2 === sortingType) {
            retValue = $page.procPartList(inList, "onTop");
        }
        return retValue;
    };

    $page.prepareChannels = function (inList) {
        var retValue = [], temp = [], tmpId = 0, tmpMsoName = cms.global.MSOINFO.name || "9x9";

        $.each(inList, function (i, channel) {
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
            tmpId = parseInt(channel.id, 10);
            if (-1 === $.inArray(tmpId, $page.currentList)) {
                channel.alreadyAdd = false;
            } else {
                channel.alreadyAdd = true;
            }
            channel.msoName = tmpMsoName;
            retValue.push(channel);
        });
        return retValue;
    };

    $page._getNowOrder = function () {
        var this_id = 0,
            tmpDiv = null,
            arrChannels = [],
            arrChannelOnTop = [],
            arrChannelNonOnTop = [];

        $("#channel-list  li.itemList").each(function () {
            this_id = parseInt($(this).attr("id").replace("set_", ""), 10);
            tmpDiv = $(this).find(".btn-top");

            if ($(tmpDiv[0]).hasClass("on")) {
                arrChannelOnTop.push(this_id);
            } else {
                arrChannelNonOnTop.push(this_id);
            }
            arrChannels.push(this_id);
        });

        return [arrChannels, arrChannelOnTop, arrChannelNonOnTop];
    };

    $page._setOnTop = function (inObj) {
        var tmpArr = [];
        if (1 === $page.sortingType) {
            tmpArr = $page.nomoList;
        } else {
            tmpArr = $page.onTopList.concat($page.nomoList);
        }

        $.each(tmpArr, function (i, channel) {
            if (undefined !== channel) {
                if (inObj == channel.id) {
                    if (tmpArr[i].alwaysOnTop === true) {
                        tmpArr[i].alwaysOnTop = false;
                    } else {
                        tmpArr[i].alwaysOnTop = true;
                    }
                }
            }
        });

        $page.nomoList = $page.procNomoList(tmpArr, $page.sortingType);
        $page.onTopList = $page.procOnTopList(tmpArr, $page.sortingType);
        $page._drawChannelLis();
    };

    $page._removeChannelFromList = function (inObj) {
        $.each($page.nomoList, function (i, channel) {
            if (undefined !== channel) {
                if (inObj == channel.id) {
                    $page.nomoList.splice(i, 1);
                }
            }
        });

        if (2 === $page.sortingType) {
            $.each($page.onTopList, function (i, channel) {
                if (undefined !== channel) {
                    if (inObj == channel.id) {
                        $page.onTopList.splice(i, 1);
                    }
                }
            });

        }

    };

    $page._reListSeq = function () {
        var nowOrderList = [],
            arrChannels = [],
            arrChannelOnTop = [];

        nowOrderList = $page._getNowOrder();
        arrChannels = nowOrderList[0];
        arrChannelOnTop = nowOrderList[1];

        if (1 === $page.sortingType) {
            $.each($page.onTopAddList, function (i, channel) {
                $page.onTopAddList[i].seq = $.inArray(channel.id, arrChannels) + 1;
            });
            $page.nomoList.sort(function (a, b) {
                return a.seq - b.seq;
            });
        } else if (2 === $page.sortingType) {
            $.each($page.onTopList, function (i, channel) {
                $page.onTopList[i].seq = $.inArray(channel.id, arrChannelOnTop) + 1;
            });
            $page.onTopList.sort(function (a, b) {
                return a.seq - b.seq;
            });
        }

    };

    $page._drawChannelLis = function () {

        $('#channel-list').empty();
        $('#portal-set-empty-chanels-tmpl').tmpl([{
            cntChanels: 1
        }]).appendTo('#channel-list');

        if (1 === $page.sortingType) {
            $page.nomoList.sort(function (a, b) {
                return a.seq - b.seq;
            });
        } else if (2 === $page.sortingType) {
            $page.onTopList.sort(function (a, b) {
                return a.seq - b.seq;
            });
            $page.nomoList.sort(function (a, b) {
                return b.updateDate - a.updateDate;
            });
        }
        $('#portal-set-chanels-tmpl').tmpl($page.onTopList).appendTo('#channel-list');
        $('#portal-set-chanels-tmpl').tmpl($page.nomoList).appendTo('#channel-list');
        if ($page.sortingType === 1) {
            $(".btn-top").hide();
        }

    };

    $page._arrsort = function (a, b) {
        if (a.alwaysOnTop !== true && b.alwaysOnTop !== true) {
            return a.updateDate < b.updateDate;
        }
        return a.seq - b.seq;
    };

    $page.drawChannelPrograms = function (msoId, inSet) {
        // 用到
        nn.api('GET', cms.reapi('/api/mso/{msoId}/sets', {
            msoId: msoId
        }), null, function (sets) {
            var cntSet = sets.length,
                setId = 0;
            if (cntSet > 0) {
                setId = setId[0].id;
            }
            if (inSet > 0) {
                setId = inSet;
            }
            if (cntSet > 0 && setId != undefined && setId > 0) {
                // $page.listCategory(categories, catId);
                $page.catLiClick(setId);
                if (cntSet > 11) {
                    $("#store-category-ul").height(96);
                }
                $("#store-category-ul li").show();

            } else {
                $("#store-category-ul li").show();
                $('#overlay-s').fadeOut("slow");
            }
        });
    };

    $page.emptyChannel = function () {
        $page.currentList = [];
        $page.nomoList = [];
        $page.onTopList = [];

        $('.channel-list').empty();

        $page._drawChannelLis();
    };

    $page.emptySet = function () {
        $page.currentList = [];
        $page.nomoList = [];
        $page.onTopList = [];

        $('.set_name').empty();
        $('.channel-list').empty();
        $('.info .form-title').empty();
        $('.info .form-content ').empty();
    };

    $page.listSetProgram = function (inMsoId, inSetId) {
        var cntChanels = 0;
        if ($("#catLi_" + inSetId).hasClass("newCat")) {
            $page.sortingType = $("#catLi_" + inSetId).data("sortingtype");
            $page.emptyChannel();
            cntChanels = $(".itemList").length;
            $("div.info .form-title").html(nn._([cms.global.PAGE_ID, 'channel-list', "Program List : ? Programs"], [cntChanels]));
            $("div.info .form-content").empty();
            $('#channel-set-sorting-tmpl').tmpl([{
                sortingType: $page.sortingType
            }]).appendTo("div.info .form-content");
            $('#overlay-s').fadeOut("slow");
        } else {
            if (inSetId > 0) {
                // nn.log("abc::" + inCatId);
                nn.api('GET', cms.reapi('/api/sets/{setId}/channels', {
                    setId: inSetId
                }), null, function (chanels) {
                    cntChanels = chanels.length;
                    $('#channel-list').empty();
                    if (cntChanels > 0) {
                        var tmpMsoName = cms.global.MSOINFO.name || "9x9";
                        $.each(chanels, function (i, channel) {
                            if ('' === channel.imageUrl) {
                                channel.imageUrl = "images/ch_default.png";
                            }
                            channel.msoName = tmpMsoName;
                            $page.currentList.push(channel.id);
                        });
                    }

                    $page.nomoList = $page.procNomoList(chanels, $page.sortingType);
                    $page.onTopList = $page.procOnTopList(chanels, $page.sortingType);
                    $page._drawChannelLis();

                    var expSort = ".empty, .isSortable",
                        setSortingType = $page.sortingType;

                    if (1 === setSortingType) {
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
                    //$common.scrollbar("#portal-constrain", "#portal-list", "#portal-slider");
                    $(".info").show();
                    // $(".form-content").show();

                    $("div.info .form-title").html(nn._([cms.global.PAGE_ID, 'channel-list', "Program List : ? Programs"], [cntChanels]));
                    $("div.info .form-content").empty();
                    $('#channel-set-sorting-tmpl').tmpl([{
                        sortingType: $page.sortingType
                    }]).appendTo("div.info .form-content");
                    $('#store-list').perfectScrollbar({
                        marginTop: 25,
                        marginBottom: 63
                    });
                    $('#overlay-s').fadeOut("slow");
                });
            } else {
                $page.currentList = [];
                $page.nomoList = [];
                $page.onTopList = [];
                $('.channel-list').empty();
                $page._drawChannelLis();
                $('#overlay-s').fadeOut("slow");
            }
        }
    };

    $page.catLiClick = function (inObj) {
        var msoId = 0;
        msoId = cms.global.MSO;
        $page.addList = [];
        $page.removeList = [];
        $common.showProcessingOverlay();
        $(".catLi").removeClass("on");
        $("#catLi_" + inObj).addClass("on");
        var tmpCategoryName = $("#catLi_" + inObj + " span a").text();
        $("#title-func .set_name").text(tmpCategoryName);
        $('#channel-list').empty();
        $('#store-list').scrollTop(0);
        $page.listSetProgram(msoId, inObj);
        $('#store-list').perfectScrollbar('update');
    };

    $page.availableSetAdd = function (inCount) {
        // 用到
        if ($page.chSetLimit > inCount) {
            $("#store-category-ul .addPromotionCategory").removeClass("disable");
        } else {
            $("#store-category-ul .addPromotionCategory").addClass("disable");
        }
    };

    $page.listSet = function (inSet, inSetId) {
        // 用到
        $('#store-category-ul').empty();

        $('#store-empty-category-li-tmpl').tmpl().appendTo('#store-category-ul');
        $page.availableSetAdd(inSet.length);
        $('#store-category-li-tmpl').tmpl(inSet, {
            actCat: inSetId
        }).appendTo('#store-category-ul');
        //$(".func_name").text($("#store-category-ul li.on").text());
    };

    $page.getSortingType = function (inSets, inSetId) {
        var retValue = 0,
            tmpId = 0,
            tmpSortingType = 0;
        $.each(inSets, function (eKye, eValue) {
            tmpId = eValue.id;
            tmpSortingType = eValue.sortingType;
            if (tmpId === inSetId) {
                retValue = tmpSortingType;
            }
        });
        return retValue;
    };

    $page.drawChannelSets = function (msoId, inSet) {
        // 用到
        nn.api('GET', cms.reapi('/api/mso/{msoId}/sets', {
            msoId: msoId
        }), null, function (sets) {
            var cntSet = sets.length,
                setId = 0;
            if (cntSet > 0) {
                setId = sets[0].id;
            }
            if (inSet > 0) {
                setId = inSet;
            }
            if (cntSet > 0 && setId != undefined && setId > 0) {
                $page.listSet(sets, setId);
                $page.sortingType = $page.getSortingType(sets, setId);
                // $page.catLiClick(setId);
                // if (cntCategories > 11) {
                //     $("#store-category-ul").height(96);
                // }
                $("#store-category-ul").show();
                $("#store-category-ul li").show();

                $page.catLiClick(setId);
                // $('#overlay-s').fadeOut("slow");
            } else {
                // $page.listCategory(sets, setId);
                $("#store-category-ul").show();
                $("#store-category-ul li").show();
                $('#overlay-s').fadeOut("slow");
                // location.href = "./";
            }
        });
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: portal-manage',
            options: options
        }, 'debug');

        if (options && options.init) {
            $common.showProcessingOverlay();
            $('#yes-no-prompt .content').text(nn._([cms.global.PAGE_ID, 'channel-list', "You will change the order of program list to \"update time\", it will sort by update time of programs automatically so you can't change the order manually except set on top programs."]));
        }
        var setId = 0,
            msoId = cms.global.MSO;

        if (!isNaN(parseInt(cms.global.USER_URL.param('id'), 10))) {
            setId = parseInt(cms.global.USER_URL.param('id'), 10);
        }

        $page.drawChannelSets(msoId, setId);

        // portal manage
        $('#portal-add-layer .langkey').each(function () {
            $(this).text(nn._([cms.global.PAGE_ID, 'portal-add-layer', $(this).data('langkey')]));
        });
        $('#portal-layer .langkey').each(function () {
            $(this).text(nn._([cms.global.PAGE_ID, 'portal-layer', $(this).data('langkey')]));
        });
        $('#portal-add-layer .langkeyH').each(function () {
            $(this).html(nn._([cms.global.PAGE_ID, 'portal-add-layer', $(this).data('langkey')]));
        });
        $('#portal-add-layer .langkeyVal').each(function () {
            $(this).val(nn._([cms.global.PAGE_ID, 'channel-list', $(this).data('langkey')]));
            $(this).data("tmpIn", $(this).val());
        });
        $('#func-nav .langkey').each(function () {
            $(this).text(nn._([cms.global.PAGE_ID, 'func-nav', $(this).data('langkey')]));
        });
        $('#title-func .langkey').each(function () {
            $(this).text(nn._([cms.global.PAGE_ID, 'title-func', $(this).data('langkey')]));
        });
        $('.intro .langkey').each(function () {
            $(this).text(nn._([cms.global.PAGE_ID, 'title-func', $(this).data('langkey')]));
        });
        $('#store-list').perfectScrollbar({ marginTop: 25, marginBottom: 63 });
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('portal-manage')));
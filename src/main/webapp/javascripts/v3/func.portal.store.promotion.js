/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, sub: true, vars: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.channelPageSize = 28;

    $page.promoCatRemoveList = [];
    $page.promoCatLimit = 6;

    $page.sortingType = 2;
    $page.onTopLimit = 4;
    $page.setId = 0;
    $page.setCanChannel = 999999;
    $page.onTopList = [];
    $page.nomoList = [];
    $page.currentList = [];
    $page.addList = [];
    $page.removeList = [];
    $page.onTopAddList = [];
    $page.onTopRemoveList = [];

    // set save button on or off
    $page.setSaveButton = function(inAction) {
        if (inAction === "on") {
            $('body').addClass('has-change');
            $("#set-save p.btns").removeClass("disableBB");
        } else {
            $('body').removeClass('has-change');
            $("#set-save p.btns").addClass("disableBB");
        }
    }

    $page._search_channel_clean = function() {
        // 用到
        $("#msg-search").hide();
        $("#sRusult").html("");
        $("#search-channel-list").html("");
        $("#searchAdd").hide();
        $("#searchPrev").hide();
        $("#searchNext").hide();
        $("#input-portal-ch").val($("#input-portal-ch").data("tmpIn"));
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


    $page.procPartList = function (inList, partType) {
        // 用到
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


    // filter nomo channel list
    $page.procNomoList = function (inList, sortingType) {
        // 用到
        var retValue = [];
        if (1 === sortingType) {
            retValue = inList;
        } else {
            retValue = $page.procPartList(inList, "");
        }
        return retValue;
    };

    // filter allways on top channel list
    $page.procOnTopList = function (inList, sortingType) {
        // 用到
        var retValue = [];
        if (2 === sortingType) {
            retValue = $page.procPartList(inList, "onTop");
        }
        return retValue;
    };

    // draw channels list
    $page._drawChannelLis = function() {
        // 用到

        var cntChanels = $page.onTopList.length + $page.nomoList.length;

        $('#store-list .channel-list').empty();
        $("#cntChannelEmpty").addClass("hide")


        $('#store-empty-chanels-tmpl').tmpl([{
            cntChanels: 1
        }]).appendTo('#store-list .channel-list');

        $('#store-chanels-li-tmpl').tmpl($page.onTopList).appendTo('#store-list .channel-list');
        $('#store-chanels-li-tmpl').tmpl($page.nomoList).appendTo('#store-list .channel-list');

        // if has more then 1 set on top , sortable
        if ($page.onTopList.length > 1) {
            var expSort = ".empty, .notSortable";
            $('#store-list .channel-list').sortable({
                cursor: 'move',
                revert: true,
                cancel: expSort,
                change: function(event, ui) {
                    $page.setSaveButton("on");
                    $('body').addClass('channel-change');
                }
            });
            $("#store-list .channel-list .Sortable").css("cursor", "move");
        }
        if (cntChanels < 1) {
            $("#cntChannelEmpty").removeClass("hide");
        }
        else{
            $("div.info .form-title").html(nn._([cms.global.PAGE_ID, 'channel-list', "Program List : ? Programs"], [cntChanels]));
        }
        $("#store-constrain").show();
        $('#overlay-s').fadeOut("slow");
        $(".load").hide();
    };

    $page.categoryLocks = function (listCategory, listLock) {
        var retValue = [];

        $.each(listCategory, function (i, tampItem) {
            tampItem["msoMinus"] = "";
            if ($.inArray(tampItem["id"].toString(), listLock) > -1) {
                tampItem["msoMinus"] = "on";
            }

            retValue.push(tampItem);
        });
        return retValue;
    };

    $page._categoryBlockSlide = function (inAction) {
        if ("down" === inAction) {
            $("#store-category ul").slideDown(400);
            
                        nn.log("#store-category.height(down)::"+$("#store-category-ul").height());

            $('#store-constrain').animate({
                top: '+=80'
            }, {
                complete: function () {
                    var ulHeight = $("#store-category").height();
                    // ulHeight += 8;
                    nn.log("#store-category.height(down)::"+ulHeight);
                    $('#store-constrain').animate({
                        top: ulHeight
                    });
                    $("#store-layer").toggleClass("collapse");
                }
            });
        } else {
            $("#store-category ul").slideUp(400);
                                    nn.log("#store-category.height(down)::"+$("#store-category-ul").height());

            $('#store-constrain').animate({
                top: '-=80'
            }, {
                complete: function () {
                    // If the page isn't filled with channels (no scrollbar && pageCurrent < pageTotal)
                    // $('#store-constrain').animate({
                    //     top: ulHeight
                    // }, 100);
            var ulHeight = $("#store-category").height();
            nn.log("#store-category.height(up)::"+ulHeight);
            // ulHeight += 12;
            $('#store-constrain').animate({
                        top: ulHeight
                    });
                    if ($('#store-list').height() >= $('#store-list')[0].scrollHeight - $('#store-list .load').height() && cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
                        $('#store-list .load').fadeIn('slow');
                        $page.getMoreChannels();
                    }
                }
            }, 100);
            $("#store-layer").toggleClass("collapse");
        }
    };

    $page._drawChannels = function (inPageSize, isEnd, callback) {
        // /api/channels
        var cntStart = 0,
            cntEnd = 0,
            cntTotal = 0,
            pageCurrent = 0,
            tmpArr = [],
            tmpArr2 = [],
            strChannels = "",
            i = 0;

        cntTotal = cms.global.USER_DATA["msoSource"].length;
        pageCurrent = cms.global.USER_DATA["pageInfo"].pageCurrent;

        cntStart = pageCurrent * inPageSize - inPageSize;
        cntEnd = pageCurrent * inPageSize;

        if (cntEnd > cntTotal) {
            cntEnd = cntTotal;
        }
        tmpArr = cms.global.USER_DATA["msoSource"];

        for (i = cntStart; i < cntEnd; i += 1) {
            tmpArr2.push(tmpArr[i]);
        }

        strChannels = tmpArr2.join(',');

        nn.api('GET', cms.reapi('/api/channels'), {
            channels: strChannels
        }, function (itemChannel) {
            var cntitemChannel = itemChannel.length,
                outChannels = [],
                strMinus = "",
                tmpMsoName = cms.global.MSOINFO.name || "9x9";

            i = 0;
            tmpArr = [];

            for (i = 0; i < cntitemChannel; i += 1) {
                tmpArr = [];
                strMinus = "";
                tmpArr = itemChannel[i];
                if (-1 === $.inArray(tmpArr.id, cms.global.USER_DATA["msoCurrent"])) {
                    strMinus = "on";
                }

                if ('' === tmpArr.imageUrl) {
                    tmpArr.imageUrl = "images/ch_default.png";
                }
                tmpArr.imageUrl = tmpArr.imageUrl.split('|')[0];

                tmpArr.msoMinus = strMinus;
                tmpArr.msoName = tmpMsoName;
                outChannels.push(tmpArr);
            }
            $('#store-chanels-li-tmpl').tmpl(outChannels).appendTo('.channel-list');
            $('#store-list').perfectScrollbar('update');
            $('#overlay-s').fadeOut("slow");
            $(".load").hide();

            if (typeof callback === 'function') {
                callback();
            }
            // If the page isn't filled with channels (no scrollbar && pageCurrent < pageTotal)
            if ($('#store-list').outerHeight() >= $('#store-list')[0].scrollHeight - $('#store-list .load').height() && cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
                $('#store-list .load').fadeIn('slow');
                $page.getMoreChannels();
            }
        });
    };

    $page.getMoreChannels = function () {
        cms.global.USER_DATA["pageInfo"].pageCurrent = cms.global.USER_DATA["pageInfo"].pageNext;
        cms.global.USER_DATA["pageInfo"].pageNext += 1;
        $page._drawChannels($page.channelPageSize, true);
    };

    $page.emptyCategoryDisabled = function(inCatCount) {
        // 用到
        if ($page.promoCatLimit > inCatCount) {
            $("#store-category-ul .addPromotionCategory").removeClass("disable");
        } else {
            $("#store-category-ul .addPromotionCategory").addClass("disable");
        }
    };

    $page.listCategory = function (inCategory, inCatId) {
        // 用到
        $("#store-category-ul").html('');
        
        $('#store-empty-category-li-tmpl').tmpl().appendTo('#store-category-ul');
        $page.emptyCategoryDisabled(inCategory.length);
        $('#store-category-li-tmpl').tmpl(inCategory, {
            actCat: inCatId
        }).appendTo('#store-category-ul');
        $(".func_name").text($("#store-category-ul li.on").text());
    };

    $page.drawCategory = function (msoId, lang) {
        nn.api('GET', cms.reapi('/api/mso/{msoId}/store/categoryLocks', {
            msoId: msoId
        }), null, function (categoryLocks) {
            nn.api('GET', cms.reapi('/api/categories'), {
                lang: lang
            }, function (categories) {
                var cntCategories = categories.length,
                    catId = categories[0].id;
                if (cntCategories > 0 && catId != undefined && catId > 0) {
                    categories = $page.categoryLocks(categories, categoryLocks);
                    $page.listCategory($page.categoryLocks(categories, categoryLocks), catId);
                    $page.catLiClick(catId);
                    $("#store-category-ul").show();
                    $("#store-category-ul li").show();
                } else {
                    location.href = "./";
                }
            });

        });
    };


    $page.drawPromotionCategory = function(msoId, inCat) {
        // 用到
        nn.api('GET', cms.reapi('/api/mso/{msoId}/categories', {
            msoId: msoId
        }), null, function(categories) {
            var cntCategories = categories.length,
                catId = categories[0].id;
            if (inCat > 0) {
                catId = inCat;
            }
            if (cntCategories > 0 && catId != undefined && catId > 0) {
                $page.listCategory(categories, catId);
                $page.catLiClick(catId);
                if (cntCategories > 11) {
                    $("#store-category-ul").height(96);
                }
                // $("#store-category-ul").show();
                $("#store-category-ul li").show();
                // $('#overlay-s').fadeOut("slow");

            } else {
                location.href = "./";
            }
        });
    };

    $page.listCatChannelNon = function () {
        $('#store-layer').hide();
        $('.intro a.switch-off.hide').removeClass('hide').show();
        $('.intro .msg-error').show();
        $('#overlay-s').fadeOut("slow");
    };

    $page.emptyChannel = function() {
        $page.currentList = [];
        $page.nomoList = [];
        $page.onTopList = [];

        $('.channel-list').empty();
        $page._drawChannelLis();
    };

    $page.listCatChannel = function (inMsoId, inCatId, inPageSize) {
        // 用到
        if ($("#catLi_" + inCatId).hasClass("newCat")) {
            $page.emptyChannel();
            $('#overlay-s').fadeOut("slow");
        } else {
            nn.api('GET', cms.reapi('/api/category/{categoryId}/channels', {
                categoryId: inCatId
            }), null, function(channels) {
                var pageInfo = [];
                var cntChannelSource = channels.length;
                $page.currentList = [];
                $page.nomoList = [];
                $page.onTopList = [];

                $('.channel-list').empty();

                if (cntChannelSource > 0) {

                    var tmpMsoName = tmpMsoName = cms.global.MSOINFO.name || "9x9";
                    $.each(channels, function(i, channel) {
                        if ('' === channel.imageUrl) {
                            channel.imageUrl = "images/ch_default.png";
                        }
                        channel.msoName = tmpMsoName;
                        $page.currentList.push(channel.id);
                    });
                    nn.log("+++++ Channels:::" + channels.length);

                    $page.nomoList = $page.procNomoList(channels, $page.sortingType);
                    $page.onTopList = $page.procOnTopList(channels, $page.sortingType);
                    $page._drawChannelLis();
                } else {
                    $page._drawChannelLis();
                    $('#overlay-s').fadeOut("slow");
                }
            });
        }
    };

    $page.catGetNonNew = function() {
        var retValue = 0 ,catList=$("#store-category-ul .catLi"),tmpCat;

        for (var i = 0,j=catList.length; i < j; i++) {
            tmpCat = catList[i];
            if(!$(tmpCat).hasClass("newCat")){
                retValue = $(tmpCat).data("meta");
                return retValue;
            }
            
        };
        return retValue;
    }

    $page.catLiClick = function(inObj) {
        // 用到
        var msoId = 0,
            isNewCat = $("#catLi_" + inObj).hasClass("newCat");
        msoId = cms.global.MSO;
        $common.showProcessingOverlay();
        $(".catLi").removeClass("on");
        $("#catLi_" + inObj).addClass("on");
        var tmpCategoryName = $("#catLi_" + inObj + " span a").text();
        $("#store-layer .cat_name").text(tmpCategoryName);
        $('.channel-list li').remove();
        $('#store-list').scrollTop(0);
        $page.listCatChannel(msoId, inObj, $page.channelPageSize);
        $('#store-list').perfectScrollbar('update');
    };


    $page._setOnTop = function(inObj) {
        var tmpArr = [];
        // if (1 === $page.sortingType) {
        //     tmpArr = $page.nomoList;
        // } else {
        //     tmpArr = $page.onTopList.concat($page.nomoList);
        // }
        tmpArr = $page.onTopList.concat($page.nomoList);
        $.each(tmpArr, function(i, channel) {
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

        $page.setSaveButton("on");
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



    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {

        $common.showProcessingOverlay();

        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: store-promotion',
            options: options
        }, 'debug');
        var pageInfo = [],
            msoSource = [],
            msoCurrent = [],
            msoId = 0;
        pageInfo["pageTotal"] = pageInfo["pageCurrent"] = pageInfo["pageNext"] = 0;

        cms.global.USER_DATA["pageInfo"] = pageInfo;
        cms.global.USER_DATA["msoSource"] = msoSource;
        cms.global.USER_DATA["msoCurrent"] = msoCurrent;

        var lang = cms.global.USER_DATA.lang;
        
        nn.log("page id["+cms.global.PAGE_ID+"]");
        
        // /api/mso/{msoId}/store
        msoId = cms.global.MSO;

        // $("#content-wrap").addClass("system"); // system category need add this class, promotion without it.

        if (msoId < 1) {
            location.href = "./";
        } else {

            $page.drawPromotionCategory(msoId, 0);

            $("#store-category .info").show();

             
            $('#store-category-ul').sortable({
                cancel: '.empty',
                change: function(event, ui) {
                    $page.setSaveButton("on");
                }
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
            $('#portal-add-layer .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'portal-add-layer', $(this).data('langkey')]));
            });
            $('#portal-add-layer .langkeyH').each(function() {
                $(this).html(nn._([cms.global.PAGE_ID, 'portal-add-layer', $(this).data('langkey')]));
            });
            $('#portal-add-layer .langkeyVal').each(function() {
                $(this).val(nn._([cms.global.PAGE_ID, 'channel-list', $(this).data('langkey')]));
                $(this).data("tmpIn", $(this).val());
            });
            $('#store-layer .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'store-layer', $(this).data('langkey')]));
            });
            // $common.autoHeight();
            // $common.scrollbar("#store-constrain", "#store-list", "#store-slider");
            $('#store-list').perfectScrollbar({ marginTop: 25, marginBottom: 63 });
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('store-promotion')));
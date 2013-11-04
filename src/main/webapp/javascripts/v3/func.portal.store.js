/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, sub: true, vars: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.channelPageSize = 28;
    $page.inLiClick = false;

    // set save button on or off
    $page.setSaveButton = function (inAction) {
        if (inAction === "on") {
            $('body').addClass('has-change');
            $("#set-save p.btns").removeClass("disableBB");
        } else {
            $('body').removeClass('has-change');
            $("#set-save p.btns").addClass("disableBB");
        }
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
            $('#store-constrain').animate({
                top: '+=90'
            }, {
                complete: function () {
                    var ulHeight = $("#store-category-ul").height();
                    ulHeight += 68;
                    $('#store-constrain').animate({
                        top: ulHeight
                    }, 100);
                    $("#store-layer").toggleClass("collapse");
                }
            });
        } else {
            $("#store-category ul").slideUp(400);
            var ulHeight = $("#store-category-ul").height();
            $('#store-constrain').animate({
                top: '-=' + ulHeight
            }, {
                complete: function () {
                    // If the page isn't filled with channels (no scrollbar && pageCurrent < pageTotal)
                    if (!$page.inLiClick) {
                        if ($('#store-list').height() >= $('#store-list')[0].scrollHeight - $('#store-list .load').height() && cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
                            $('#store-list .load').fadeIn('slow');
                            $page.getMoreChannels();
                        }
                    }
                }
            }, 100);
            $("#store-layer").toggleClass("collapse");
        }
    };

    $page._drawChannels = function (inPageSize) {
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

            if ($('#store-list').outerHeight() >= $('#store-list')[0].scrollHeight - $('#store-list .load').height() && cms.global.USER_DATA["pageInfo"].pageCurrent < cms.global.USER_DATA["pageInfo"].pageTotal) {
                $('#store-list .load').fadeIn('slow');
                $page.getMoreChannels();
            }
        });
    };

    $page.getMoreChannels = function () {
        cms.global.USER_DATA["pageInfo"].pageCurrent = cms.global.USER_DATA["pageInfo"].pageNext;
        cms.global.USER_DATA["pageInfo"].pageNext += 1;
        if (cms.global.USER_DATA["pageInfo"].pageNext > cms.global.USER_DATA["pageInfo"].pageTotal) {
            cms.global.USER_DATA["pageInfo"].pageNext = cms.global.USER_DATA["pageInfo"].pageTotal;
        }
        $page._drawChannels($page.channelPageSize);
    };

    $page.listCategory = function (inCategory, inCatId) {
        $("#store-category-ul").html('');
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
                } else {
                    location.href = "./";
                }
            });

        });
    };

    $page.listCatChannelNon = function () {
        $('#store-layer').hide();
        $('.intro a.switch-off.hide').removeClass('hide').show();
        $('.intro .msg-error').show();
        $('#overlay-s').fadeOut("slow");
    };

    $page.listCatChannel = function (inMsoId, inCatId, inPageSize) {
        // base
        nn.api('GET', cms.reapi('/api/store'), {
            categoryId: inCatId,
            sphere: cms.global.MSOINFO.supportedRegion
        }, function (channels) {
            var pageInfo = [];
            var cntChannelSource = channels.length;
            $('#portal-manage').html('');
            if (cntChannelSource > 0) {
                $(".form-title").text(nn._([cms.global.PAGE_ID, 'store-layer', "xxx programs in category:"], [cntChannelSource]));

                pageInfo["pageTotal"] = Math.ceil(cntChannelSource / inPageSize);
                pageInfo["pageCurrent"] = 0;
                if (pageInfo["pageTotal"] == 1) {
                    pageInfo["pageNext"] = 1;
                } else {
                    pageInfo["pageNext"] = 1;
                }

                cms.global.USER_DATA["pageInfo"] = pageInfo;
                cms.global.USER_DATA["msoSource"] = channels;
                cms.global.USER_DATA["msoAdd"] = [];
                cms.global.USER_DATA["msoRemove"] = [];
                nn.api('GET', cms.reapi('/api/mso/{msoId}/store', {
                    msoId: inMsoId
                }), {
                    categoryId: inCatId
                }, function (channelsMso) {
                    var cntChannelsMso = channelsMso.length;
                    if (cntChannelsMso > 0) {
                        cms.global.USER_DATA["msoCurrent"] = channelsMso;
                    } else {
                        cms.global.USER_DATA["msoCurrent"] = [];
                    }
                    $('.channel-list').html("");

                    $page.getMoreChannels();
                });
            } else {
                $('#overlay-s').fadeOut("slow");
            }
        });
    };

    $page.catLiClick = function (inObj) {
        var msoId = 0;
        msoId = cms.global.MSO;
        $common.showProcessingOverlay();
        $(".catLi ").removeClass("on");
        $("#catLi_" + inObj).addClass("on");
        var tmpCategoryName = $("#catLi_" + inObj + " span a").text(),
            pageInfo = [];

        pageInfo["pageTotal"] = pageInfo["pageCurrent"] = pageInfo["pageNext"] = 0;

        cms.global.USER_DATA["pageInfo"] = pageInfo;
        cms.global.USER_DATA["msoSource"] = [];
        cms.global.USER_DATA["msoCurrent"] = [];

        $("#store-layer .cat_name").text(tmpCategoryName);
        $('.channel-list li').remove();
        $('#store-list').scrollTop(0);
        $page.listCatChannel(msoId, inObj, $page.channelPageSize);
        $('#store-list').perfectScrollbar('update');
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {

        $common.showProcessingOverlay();

        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: store-manage',
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
        // /api/mso/{msoId}/store
        msoId = cms.global.MSO;

        $("#content-wrap").addClass("system"); // system category need add this class, promotion without it.

        if (msoId < 1) {
            location.href = "./";
        } else {

            nn.api('GET', cms.reapi('/api/mso/{msoId}/store/categoryLocks', {
                msoId: msoId
            }), null, function (categoryLocks) {
                if (-1 === $.inArray('ALL', categoryLocks)) {
                    // system category on
                    $page.drawCategory(msoId, lang);
                    $(".switch-on").removeClass("hide");
                } else {
                    $page.listCatChannelNon();
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
            $('#store-layer .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'store-layer', $(this).data('langkey')]));
            });

            // $common.autoHeight();
            // $common.scrollbar("#store-constrain", "#store-list", "#store-slider");
            $('#store-list').perfectScrollbar({ marginTop: 25, marginBottom: 63 });
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('store-manage')));
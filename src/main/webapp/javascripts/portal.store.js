var channelPageSize = 28;

$(document).on("click", ".btn-minus", function(e) {
    var thisDiv = $(this);
    var upLi = $(this).parents("li");
    var channelId = upLi.attr("id").replace("channel_", "");
    var isMinus = false, msoId = 0;

    msoId = CMS_CONF.MSO;

    // $(this).find("p").eq(1).html();

    if ($(this).hasClass("on")) {
        // add channel
        showProcessingOverlay();
        nn.api('POST', CMS_CONF.API('/api/mso/{msoId}/store', {
            msoId : msoId
        }), {
            channels : channelId
        }, function(channelsMso) {
            thisDiv.removeClass("on");
            upLi.removeClass("minus");
            thisDiv.find("p.center").text(nn._([CMS_CONF.PAGE_ID, 'channel-list', 'Remove channel']));
            $('#overlay-s').fadeOut("slow");
        });
        isMinus = true;
    } else {
        // remove channle
        showProcessingOverlay();
        nn.api('DELETE', CMS_CONF.API('/api/mso/{msoId}/store?channels=' + channelId, {
            msoId : msoId
        }), {
            channels : channelId
        }, function(channelsMso) {
            thisDiv.addClass("on");
            upLi.addClass("minus");
            thisDiv.find("p.center").text(nn._([CMS_CONF.PAGE_ID, 'channel-list', 'Add channel']));
            $('#overlay-s').fadeOut("slow");

            //console.log( thisDiv.text() );

        });
    }
});

$(document).on("click", ".load", function(event) {
    var pageTotal = pageNext = pageCurrent = 0;
    pageTotal = CMS_CONF.USER_DATA["pageInfo"].pageTotal;
    pageCurrent = CMS_CONF.USER_DATA["pageInfo"].pageCurrent;
    pageNext = CMS_CONF.USER_DATA["pageInfo"].pageNext;

    if (pageNext == pageTotal) {
        $(".load").hide();
    }
    showProcessingOverlay();
    CMS_CONF.USER_DATA["pageInfo"].pageCurrent = CMS_CONF.USER_DATA["pageInfo"].pageNext++;
    _drawChannels(channelPageSize, true);

});

$(document).on("click", "#set-save", function(event) {
    showProcessingOverlay();
    setTimeout('$("#overlay-s").fadeOut("slow")', 600);
});

$(document).on("click", ".catLi", function(event) {
    var msoId = 0;

    msoId = CMS_CONF.MSO;
    showProcessingOverlay();
    $(".catLi ").removeClass("on");
    $(this).addClass("on");
    $(".func_name").text($(this).text());
    $('.channel-list li').remove();
    $('#store-slider .slider-vertical').slider('destroy');
    scrollbar("#store-constrain", "#store-list", "#store-slider");
    $('#store-slider .slider-vertical').slider('value', 100);
    listCatChannel(msoId, $(this).data("meta"), channelPageSize);

});

$(document).on("click", "#store-category .btn-gray", function(event) {

    if ($("#store-layer").hasClass("collapse")) {
        $("#store-category ul").slideDown(400);
    } else {
        $("#store-category ul").slideUp(400);
    }

    $("#store-layer").toggleClass("collapse");
    scrollbar("#store-constrain", "#store-list", "#store-slider");
});

function listCatChannel(inMsoId, inCatId, inPageSize) {
    console.log("inMsoId : " + inMsoId);
    nn.api('GET', CMS_CONF.API('/api/mso/{msoId}/store', {
        msoId : 1
    }), {
        categoryId : inCatId
    }, function(channels) {
        var pageInfo = [];
        var cntChannelSource = channels.length;
        $('#portal-manage').html('');
        if (cntChannelSource > 0) {

            $(".form-title").text(nn._([CMS_CONF.PAGE_ID, 'store-layer', "xxx channels in category:"], [cntChannelSource]));

            pageInfo["pageTotal"] = Math.ceil(cntChannelSource / inPageSize);
            pageInfo["pageCurrent"] = 1;
            if (pageInfo["pageTotal"] == 1) {
                pageInfo["pageNext"] = 1;
            } else {
                pageInfo["pageNext"] = 2;
            }

            CMS_CONF.USER_DATA["pageInfo"] = pageInfo;
            CMS_CONF.USER_DATA["msoSource"] = channels;
            console.log("cntChannelSource : " + cntChannelSource);
            nn.api('GET', CMS_CONF.API('/api/mso/{msoId}/store', {
                msoId : inMsoId
            }), {
                categoryId : inCatId
            }, function(channelsMso) {
                var cntChannelsMso = channelsMso.length;
                if (cntChannelsMso > 0) {
                    CMS_CONF.USER_DATA["mosCurrent"] = channelsMso;

                } else {
                    CMS_CONF.USER_DATA["mosCurrent"] = [];
                }
                $('.channel-list').html("");
                _drawChannels(inPageSize, false);
                //alert(cntChanels);

            });
        } else {
            $('#overlay-s').fadeOut("slow");
        }

    });
}

function _drawChannels(inPageSize, isEnd) {
    // /api/channels
    var cntStart = 0, cntEnd = 0, cntTotal = 0, pageCurrent = 0, tmpArr = [], tmpArr2 = [], strChannels = "";
    cntTotal = CMS_CONF.USER_DATA["msoSource"].length;
    pageCurrent = CMS_CONF.USER_DATA["pageInfo"].pageCurrent;

    cntStart = pageCurrent * inPageSize - inPageSize;
    cntEnd = pageCurrent * inPageSize;

    if (cntEnd > cntTotal) {
        cntEnd = cntTotal;
    }
    tmpArr = CMS_CONF.USER_DATA["msoSource"];

    for ( i = cntStart; i < cntEnd; i++) {
        tmpArr2.push(tmpArr[i]);

    }

    strChannels = tmpArr2.join(',');
    if (CMS_CONF.USER_DATA["pageInfo"].pageCurrent == CMS_CONF.USER_DATA["pageInfo"].pageTotal) {
        $(".load").hide();
    } else {
        $(".load").show();
    }

    nn.api('GET', CMS_CONF.API('/api/channels'), {
        channels : strChannels
    }, function(itemChannel) {
        var cntitemChannel = itemChannel.length;
        var outChannels = [], tmpArr = [], strMinus = "";
        for ( i = 0; i < cntitemChannel; i++) {
            tmpArr = [];
            strMinus = "";
            tmpArr = itemChannel[i];
            if (-1 === $.inArray(tmpArr.id, CMS_CONF.USER_DATA["mosCurrent"])) {
                strMinus = "on";
            }

            if ('' === tmpArr.imageUrl) {
                tmpArr.imageUrl = "images/ch_default.png";
            }
            tmpArr.msoMinus = strMinus;
            outChannels.push(tmpArr);
        }
        $('#store-chanels-li-tmpl').tmpl(outChannels).appendTo('.channel-list');

        scrollbar("#store-constrain", "#store-list", "#store-slider");
        if (isEnd) {
            $('#store-slider .slider-vertical').slider('value', 0);
        }

        $('#overlay-s').fadeOut("slow");

        //console.log("scrollbar**" + $('#store-slider .slider-vertical').slider('value'));
    });

}

function listCategory(inCategory, inCatId) {
    $("#store-category-ul").html('');
    $('#store-category-li-tmpl').tmpl(inCategory, {
        actCat : inCatId
    }).appendTo('#store-category-ul');

    $(".func_name").text($("#store-category-ul li.on").text());

}

function storeManage() {
    var pageInfo = [], msoSource = [], mosCurrent = [], msoId = 0, catId = 0;
    pageInfo["pageTotal"] = pageInfo["pageCurrent"] = pageInfo["pageNext"] = 0;

    CMS_CONF.USER_DATA["pageInfo"] = pageInfo;
    CMS_CONF.USER_DATA["msoSource"] = msoSource;
    CMS_CONF.USER_DATA["mosCurrent"] = mosCurrent;

    var lang = CMS_CONF.USER_DATA.lang;
    ///api/mso/{msoId}/store
    msoId = CMS_CONF.MSO;

    if (msoId < 1) {
        location.href = "./";

    } else {
        //alert(lang);
        nn.api('GET', CMS_CONF.API('/api/categories'), {
            lang : lang
        }, function(categories) {

            var cntCategories = categories.length;
            catId = categories[0].id;
            //$('#portal-manage').html('');
            if (cntCategories > 0 && catId != undefined && catId > 0) {
                listCategory(categories, catId);
                listCatChannel(msoId, catId, channelPageSize);

            } else {
                location.href = "./";
            }

        });

        $('#func-nav .langkey').each(function() {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'func-nav', $(this).data('langkey')]));
        });
        $('#title-func .langkey').each(function() {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'title-func', $(this).data('langkey')]));
        });

        $('#store-layer .langkey').each(function() {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'store-layer', $(this).data('langkey')]));
        });

        scrollbar("#store-constrain", "#store-list", "#store-slider");
    }
}

$(function() {
    $('#system-error .btn-ok, #system-error .btn-close').click(function() {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            location.replace('index.html');
        }
        return false;
    });

    $(window).resize(function() {
        scrollbar("#store-constrain", "#store-list", "#store-slider");
    });

});

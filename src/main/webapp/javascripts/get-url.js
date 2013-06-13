/* Get URL */
$(document).on("click", ".url", function(event) {
    var userUrlFile = CMS_CONF.USER_URL.attr('file');
    if ('' === userUrlFile) {
        userUrlFile = 'index.html';
    }
    if (!$(this).hasClass("disable")) {
        var obj_get_url = $(this).parents('li').find('.get-url');

        if (userUrlFile === 'index.html') {
            var strMetaCh = obj_get_url.data("metach"), strMetaIn = obj_get_url.data("metain");
            // sharing url
            if (strMetaIn != "1") {
                nn.api('GET', CMS_CONF.API('/api/channels/{channelId}/autosharing/validBrands', {
                    channelId : strMetaCh
                }), null, function(cBrands) {
                    //alert(strMetaCh);
                    var surl_html = "", tmpBrand = [];
                    tmpBrand = [{
                        brand : cBrands[0].brand
                    }];
                    $("#tmpHtml2").empty();
                    $("#get-url-part-tmpl").tmpl(cBrands, {
                        li_sel : cBrands[0].brand
                    }).appendTo("#tmpHtml2");
                    $("#tmpHtml").empty();
                    $("#get-url-tmpl").tmpl(tmpBrand, {
                        li_items : $("#tmpHtml2").html()
                    }).appendTo("#tmpHtml");

                    obj_get_url.children().remove();
                    obj_get_url.append($("#tmpHtml").html());
                    obj_get_url.find("input.srul-text").val(iniSharingList(obj_get_url));
                    obj_get_url.data("metain", 1);
                });
            }
        }

        $('.get-url').hide();
        obj_get_url.find("input.srul-text").val(iniSharingList(obj_get_url));

        $(this).parents('li').find('.tip').hide();
        obj_get_url.fadeIn(400);
    }
});

$(document).on("click", "html", function(event) {
    $('.get-url').hide();
});

$(document).on("click", ".get-url, .url", function(event) {
    event.stopPropagation();
});

/* Dropdown Gray */
$(document).on("click", ".select-gray", function(event) {
    event.stopPropagation();
});

$(document).on("click", ".select-gray .select-btn", function(event) {
    $(this).parents('div').find('.select-dropdown').toggleClass('on');
    $(this).toggleClass("on");
});

$(document).on("click", ".select-gray .select-dropdown li", function(event) {
    var obj_get_url = $(this).parents('li').find('.get-url');
    var urlText = $(this).parent('ul').parent("div").parent("div").parent("div").find('.srul-text');
    $(this).parent('ul').parent("div").find('.select-txt-gray').text($(this).data('meta'));
    $(this).parent('ul').find("li").removeClass("on");
    $(this).addClass("on");
    obj_get_url.find("input.srul-text").val(iniSharingList(obj_get_url));
    $(this).parents('div').find('.select-dropdown').toggleClass('on');
    $(this).parents('div').find('.select-btn').toggleClass('on');
});

$(document).on("click", "html, .get-url", function(event) {
    $('.select-gray .select-dropdown, .select-gray .select-btn').removeClass("on");
});

function iniSharingList(inObj) {
    var strCid = "", strEid = "", strBrand = "", strBaseURL = "http://www.9x9.tv/view?", strSurl = "";
    var userUrlFile = CMS_CONF.USER_URL.attr('file');
    if ('' === userUrlFile) {
        userUrlFile = 'index.html';
    }
    strBrand = inObj.find(".select-txt-gray").text();
    strCid = inObj.data("metach");
    strEid = inObj.data("metaep");
    if (userUrlFile === 'index.html') {
        strSurl = strBaseURL + ["brand=" + strBrand, "ch=" + strCid].join("&");
    } else {
        strSurl = strBaseURL + ["brand=" + strBrand, "ch=" + strCid, "ep=e" + strEid].join("&");
    }
    return strSurl;
}

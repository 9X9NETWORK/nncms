$(document).on("click", "#set-preview", function(event) {
    if ("javascript:void(0)" === $(this).attr("href")) {
        var preUrl = $.url().attr('host') + "/tv#/streaming/" + CMS_CONF.USER_URL.param('id');
        var msoId = CMS_CONF.MSO;
        var thisA = $(this);

        if (msoId === 1) {
            preUrl = "http://" + preUrl;
            thisA.attr("href", preUrl);
        } else {
            nn.api('GET', CMS_CONF.API('/api/mso/{msoId}', {
                msoId : msoId
            }), null, function(mso) {
                var tmpMsoName = mso.name + ".";
                if (preUrl.indexOf("www.") === 0) {
                    preUrl = preUrl.replace("www.", tmpMsoName);
                } else {
                    preUrl = tmpMsoName + preUrl;
                }
                preUrl = "http://" + preUrl;
                thisA.attr("href", preUrl);
            });
            return false;
        }
    }
});

$(document).on("click", "#set-save", function(event) {
    // protal set save
    //var btnOn = $("#sortingType").val();
    var setId = CMS_CONF.USER_URL.param('id');
    $("#setName").val($.trim($("#setName").val()));
    var inSetName = $("#setName").val();
    var inSortingType = $("#sortingType").val();

    $("#msg-portal").text("");
    $("#msg-portal").hide();
    if ("" !== inSetName && setId > 0) {
        showProcessingOverlay();
        nn.api('PUT', CMS_CONF.API('/api/sets/{setId}', {
            setId : setId
        }), {
            name : inSetName,
            sortingType : inSortingType
        }, function(set) {
            var liList = $("#channel-list li.itemList"), channels = [], this_id = 0, channelOrder = "";

            if (inSortingType == 1) {
                $(".btn-top").hide();
                $("#channel-list  li.itemList").each(function() {
                    //alert( channel.html() );
                    this_id = $(this).attr("id").replace("set_", "");
                    //CMS_CONF.CATEGORY_MAP[list.id] = list.name;
                    if (this_id > 0) {
                        channels.push(this_id);
                    }
                });
                channelOrder = channels.join(',');
                if ("" !== channelOrder) {
                    // need reorder
                    nn.api('PUT', CMS_CONF.API('/api/sets/{setId}/channels/sorting', {
                        setId : setId
                    }), {
                        channels : channelOrder
                    }, function(set) {
                        //alert("排序 ok!");
                        $('#overlay-s').fadeOut("slow");
                    });
                } else {

                    $('#overlay-s').fadeOut("slow");
                }

            } else {
                //liList = $("#channel-list div.on");
                $("#channel-list li.itemList").each(function() {
                    //alert( channel.html() );
                    this_id = $(this).attr("id").replace("set_", "");
                    //CMS_CONF.CATEGORY_MAP[list.id] = list.name;
                    if (this_id > 0) {
                        channels.push(this_id);
                    }
                });
                channelOrder = channels.join(',');
                //alert( channelOrder );
                if ("" !== channelOrder) {
                    // need reorder
                    nn.api('PUT', CMS_CONF.API('/api/sets/{setId}/channels/sorting', {
                        setId : setId
                    }), {
                        channels : channelOrder
                    }, function(set) {
                        //alert("排序 ok!");
                        portalManage();
                        //$('#overlay-s').fadeOut("slow");
                    });
                } else {
                    portalManage();
                    //$('#overlay-s').fadeOut("slow");
                }

            }
        });
        $("body").removeClass("has-change");
    } else {
        // err msg
        $("#msg-portal").text(nn._([CMS_CONF.PAGE_ID, 'channel-list', "Please fill in your set name."]));
        $("#msg-portal").show();
        //showSystemErrorOverlay(nn._([CMS_CONF.PAGE_ID, 'channel-list', "Please fill in your set name."]));
        //alert("頻道組名稱不可以是空白");

    }

});

$(document).on("keyup", "#input-portal-ch", function(event) {
    if (event.which == 13) {
        $("#portal_search_channel").click();
        //event.preventDefault();
    }
});

$(document).on("keyup", "#setName", function(event) {
    $("#name-charcounter").text($("#setName").val().length);
});

$(document).on('change', '#setName', function() {
    $(".clearfix .msg-portal").hide();
    $("#name-charcounter").text($("#setName").val().length);
    $('body').addClass('has-change');
});

$(document).on("click", "#portal-set li", function(event) {
    var nextUrl = "portal-manage.html?id=" + $(this).data("meta");
    location.href = nextUrl;
});

// search layout
$(document).on("click", "#empty_channel", function(event) {
    var cntChannel = $("#channelCnt").text();
    if (cntChannel < 27) {
        $("#search-title").html(nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', "Add channels into your “<span>Set 2</span>”"], [$("#setName").val()]));
        $("#portal-add-layer").fadeIn();
    }
});

$(document).on("click", "#searchNext", function(event) {
    // search channel list next page
    var pageChannel = Math.floor($(".list-holder").width() / 117) * 2;

    var cntLi = $("#search-channel-list li");
    var countOff = 0, cntLiLength = cntLi.length;

    var offS = 0, offE = pageChannel;

    for ( i = 0; i < cntLiLength; i++) {
        if (cntLi.eq(i).hasClass("soff")) {
            countOff++;
        }

    }
    offS += countOff;
    offE += countOff;

    for ( i = offS; i < offE; i++) {
        cntLi.eq(i).addClass("soff").hide();
    }
    $("#searchPrev").show();
    if ((cntLiLength - countOff - pageChannel) < (pageChannel + 1)) {
        $("#searchNext").hide();
    }
});

$(document).on("click", "#searchPrev", function(event) {
    // search channel list next page
    var pageChannel = Math.floor($(".list-holder").width() / 117) * 2;

    var cntLi = $("#search-channel-list li");
    var countOff = 0, cntLiLength = cntLi.length;

    var offS = 0, offE = pageChannel;

    for ( i = 0; i < cntLiLength; i++) {
        if (cntLi.eq(i).hasClass("soff")) {
            countOff++;
        }

    }
    offS = countOff - pageChannel;
    offE = countOff;

    for ( i = offS; i < offE; i++) {
        cntLi.eq(i).removeClass("soff").show();
    }
    $("#searchNext").show();
    if (offS < 1) {
        $("#searchPrev").hide();
    }
});

// button search
$(document).on("click", "#portal_search_channel", function(event) {

    $("#input-portal-ch").val($.trim($("#input-portal-ch").val()));
    var strInput = $("#input-portal-ch").val(), searchType = $("#dropdown-portal-ch").attr("kvale");
    var msgErr = "";
    $("#sRusult").data("canAdd", (27 - $("#channelCnt").text()));
    //alert(searchType);
    $('#search-channel-list').html('');
    $("#searchNext").hide();
    $("#searchPrev").hide();

    $("#msg-search").text("");
    $("#msg-search").hide();

    if ($("#input-portal-ch").data("tmpIn") == strInput) {
        switch(searchType) {
            case "url":
                msgErr = "Please fill in the channel url to search.";
                break;
            case "keywords":
                msgErr = "Please fill in the keywords to search.";
                break;
        }

        msgErr = nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', msgErr]);
        //$("#msg-search").text(msgErr);
        //$("#msg-search").show();
        $("#sRusult").text(msgErr);
    } else {
        $("#portal-add-layer").fadeOut();
        showProcessingOverlay();
        switch(searchType) {
            case "url":
                var inURL = $.url(strInput);

                var allPaths = ["/view", "/playback"];
                var tmpChannel = inURL.param('ch');
                if (tmpChannel > 0 && $.inArray(inURL.attr('path'), allPaths) != -1) {

                    nn.api('GET', CMS_CONF.API('/api/channels'), {
                        channels : tmpChannel
                    }, function(channels) {
                        cntChannel = channels.length;

                        var canChannel = 27 - $("#channelCnt").text();
                        $("#sRusult").html(nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', "Find [<span>?</span>] channels."], [cntChannel, canChannel]));

                        //alert($("#sRusult").data("canAdd"));
                        var items = [], temp = [];
                        $.each(channels, function(i, channel) {
                            temp = [];

                            if (channel.imageUrl == '') {
                                channel.imageUrl = 'images/ch_default.png';
                                if (channel.moreImageUrl && '' !== $.trim(channel.moreImageUrl)) {
                                    temp = channel.moreImageUrl.split('|');
                                    if (temp[0] && temp[0] !== CMS_CONF.EPISODE_DEFAULT_IMAGE) {
                                        channel.imageUrl = temp[0];
                                    }
                                }

                            }

                            items.push(channel);
                        });

                        //$('#search-channel-list').html('');

                        $('#portal-search-item-tmpl').tmpl(items).appendTo('#search-channel-list');

                        var pageChannel = Math.floor($(".list-holder").width() / 117) * 2;
                        if (cntChannel > pageChannel) {
                            $("#searchNext").show();
                        }

                    });

                } else {
                    //$("#msg-search").text(nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', "Please fill in the correct url."])).show();
                    $("#sRusult").text(nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', "Please fill in the correct url."])).show();
                }
                $("#portal-add-layer").fadeIn();
                $('#overlay-s').fadeOut("slow");
                break;
            case "keywords":
                var api_fix = "?keyword=" + strInput;
                nn.api('GET', CMS_CONF.API('/api/channels'), {
                    keyword : strInput
                }, function(channels) {
                    cntChannel = channels.length;

                    var canChannel = 27 - $("#channelCnt").text();
                    
                    if( cntChannel > 0 ){
                        $("#sRusult").html(nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', "Find [<span>?</span>] channels."], [cntChannel, canChannel]));
                    }else{
                        $("#sRusult").html(nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', "Your search - [xxx] didn't match any channels."], [strInput]));                        
                    }

                    

                    var items = [], temp = [];
                    $.each(channels, function(i, channel) {
                        temp = [];

                        if (channel.imageUrl == '') {
                            channel.imageUrl = 'images/ch_default.png';
                            if (channel.moreImageUrl && '' !== $.trim(channel.moreImageUrl)) {
                                temp = channel.moreImageUrl.split('|');
                                if (temp[0] && temp[0] !== CMS_CONF.EPISODE_DEFAULT_IMAGE) {
                                    channel.imageUrl = temp[0];
                                }
                            }
                        }
                        items.push(channel);
                    });
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
$(document).on("click", "#portal_add_channel", function(event) {

    var lis = $("#search-channel-list li .on");
    var cntLis = lis.length;
    var setId = CMS_CONF.USER_URL.param('id');
    //alert(lis.html());

    if (cntLis > 0) {
        showProcessingOverlay();
        var up_li = null, this_id = null;
        for ( i = 0; i < cntLis; i++) {
            this_id = lis.eq(i).attr("id").replace("schk_", "");

            nn.api('POST', CMS_CONF.API('/api/sets/{setId}/channels', {
                setId : setId
            }), {
                channelId : this_id
            }, function(msg) {
                cntLis--;

                if (cntLis == 0) {
                    // put resource for update set count
                    nn.api('PUT', CMS_CONF.API('/api/sets/{setId}', {
                        setId : setId
                    }), null, function(set) {
                        portalManage();
                        $("#portal-add-layer").fadeOut("slow");
                        _search_channel_clean();
                        $('#overlay-s').fadeOut("slow");
                        //                    alert("完成");
                    });

                }

            });

        }

    }

    //alert(lis.length);
});

$(document).on("click", "#search-channel-list .checkbox", function(event) {
    /*
     $(".sType").removeClass("on");
     $(this).addClass("on");
     $("#sortingType").val($(this).attr("tvalue"));
     */
    var canAdd = $("#sRusult").data("canAdd");
    var li_on = 0;

    var this_li = $(this);
    var up_li = this_li.parents("li");
    var this_id = up_li.attr("id").replace("sch_", "");
    if (this_li.hasClass("on")) {

        this_li.removeClass("on");
        canAdd++;
    } else {
        if (canAdd > 0) {
            this_li.addClass("on");
            canAdd--;
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

$(document).on("click", ".sort-list .sType", function(event) {
    var setId = CMS_CONF.USER_URL.param('id');

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
            cursor : 'move',
            revert : true,
            cancel : expSort,
            change : function(event, ui) {
                $('body').addClass('has-change');
            }
        });

    } else {
        $.blockUI({
            message : $('#yes-no-prompt')
        });

    }
});

$(document).on("click", "#yes-no-prompt .btn-yes", function(event) {

    $("body").removeClass("has-change");
    var setId = CMS_CONF.USER_URL.param('id');

    //$("#channel-list").sortable("destroy");
    $(".sType").removeClass("on");
    $(this).addClass("on");
    $("#sortingType").val($(this).attr("tvalue"));

    $.unblockUI({
        message : $('#yes-no-prompt')
    });

    showProcessingOverlay();
    nn.api('PUT', CMS_CONF.API('/api/sets/{setId}', {
        setId : setId
    }), {
        sortingType : 2
    }, function(set) {

        portalManage();
    });
});

$(document).on("click", ".btn-top", function(event) {
    // protal manage remove channel from channel set
    var btnOn = $("#channel-list div.on");
    //alert(btnOn.length);
    var this_li = $(this);
    var up_li = this_li.parents("li");
    var this_id = up_li.attr("id").replace("set_", "");
    var setId = CMS_CONF.USER_URL.param('id');
    // /api/sets/{setId}/channels
    var strTF = "true";
    if (btnOn.length < 4 || this_li.hasClass("on")) {
        if (this_li.hasClass("on")) {
            strTF = "false";
        }

        var parameter = {
            channelId : this_id,
            alwaysOnTop : strTF
        };

        var api_fix = "?channelId=" + parameter.channelId;
        showProcessingOverlay();
        nn.api('POST', CMS_CONF.API('/api/sets/{setId}/channels', {
            setId : setId
        }), parameter, function(msg) {

            // put resource for update set count
            nn.api('PUT', CMS_CONF.API('/api/sets/{setId}', {
                setId : setId
            }), null, function(set) {
                portalManage();
                //$('#overlay-s').fadeOut("slow");
            });

        });
    } else {
        showSystemErrorOverlay(nn._([CMS_CONF.PAGE_ID, 'channel-list', 'You can only set 4 channels on top']));
    }
});

$(document).on("click", ".btn-remove", function(event) {
    // protal manage remove channel from channel set
    var this_li = $(this);
    var up_li = this_li.parents("li");
    var this_id = up_li.attr("id").replace("set_", "");
    var setId = CMS_CONF.USER_URL.param('id');
    // /api/sets/{setId}/channels

    var parameter = {
        channelId : this_id
    };

    var api_fix = "?channelId=" + parameter.channelId;
    showProcessingOverlay();
    nn.api('DELETE', CMS_CONF.API('/api/sets/{setId}/channels' + api_fix, {
        setId : setId
    }), parameter, function(msg) {

        // put resource for update set count
        nn.api('PUT', CMS_CONF.API('/api/sets/{setId}', {
            setId : setId
        }), null, function(set) {
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

$(document).on('click', '#content-nav a, .select-list li a, .studio-nav-wrap a, #profile-dropdown a', function(e) {
    if ($('body').hasClass('has-change')) {
        if (e && $(e.currentTarget).attr('href')) {
            $('body').data('leaveUrl', $(e.currentTarget).attr('href'));
        }
        if (e && $(e.currentTarget).attr('id')) {
            $('body').data('leaveId', $(e.currentTarget).attr('id'));
        }
        showUnsaveOverlay();
        return false;
    }
});

$(document).on('click', '#unsave-prompt .btn-leave', function() {
    $('body').removeClass('has-change');

    $.unblockUI();
    if ('' != $('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
        $('#' + $('body').data('leaveId')).trigger('click');
    } else {
        location.href = $('body').data('leaveUrl');
    }
    return false;
});

function _search_channel_clean() {
    $("#msg-search").hide();
    $("#sRusult").html("");
    $("#search-channel-list").html("");
    $("#searchPrev").hide();
    $("#searchNext").hide();
    $("#input-portal-ch").val($("#input-portal-ch").data("tmpIn"));
}

function portalManage() {
    var setId = CMS_CONF.USER_URL.param('id');
    //console.log("portalManage out set id");
    var msoId = CMS_CONF.MSO;
    if (msoId < 1) {
        location.href = "./";
    } else if (setId != undefined && setId > 0) {
        $("#cntChannelEmpty").hide();
        nn.api('GET', CMS_CONF.API('/api/sets/{setId}', {
            setId : setId
        }), null, function(set) {

            var cntSet = set.length;
            $('#portal-manage').html('');
            if (set.id > 0) {

                nn.api('GET', CMS_CONF.API('/api/mso/{msoId}/sets', {
                    msoId : set.msoId
                }), {
                    lang : "zh"
                }, function(sets) {
                    var cntSetsItem = sets.length;
                    //alert(cntChanels);
                    // maybe modify
                    if (cntSetsItem > 0) {
                        var setItems = [], temp = [];
                        $.each(sets, function(i, channel) {
                            temp = [];
                            channel["isActive"] = 0;
                            if (channel.id == setId) {
                                channel["isActive"] = 1;
                                //   channel.push(temp);
                            }
                            if (i < 3) {
                                setItems.push(channel);
                            }
                        });

                        $('#func-nav .sub-nav').html('');

                        $('#portal-func-nav-sub-tmpl').tmpl(setItems).appendTo('#func-nav .sub-nav');

                    }

                });

                $('#portal-set-form-tmpl').tmpl(set).appendTo('#portal-manage');
                $('#title-func .set_name').html(set.name);
            }

            if (set.channelCnt > 0) {

                nn.api('GET', CMS_CONF.API('/api/sets/{setId}/channels', {
                    setId : set.id
                }), null, function(chanels) {
                    var cntChanels = chanels.length;
                    //alert(cntChanels);

                    $('#channel-list').html('');
                    $('#portal-set-empty-chanels-tmpl').tmpl([{
                        cntChanels : cntChanels
                    }]).appendTo('#channel-list');
                    if (cntChanels > 0) {
                        for (i in chanels ) {
                            if ('' === chanels[i].imageUrl) {
                                chanels[i].imageUrl = "images/ch_default.png";
                            }
                        }
                        $('#portal-set-chanels-tmpl').tmpl(chanels).appendTo('#channel-list');
                        if (set.sortingType == 1) {
                            $(".btn-top").hide();
                        }
                    }
                    console.log("isSortable");

                    var expSort = ".empty, .isSortable";
                    if (set.sortingType == 1) {
                        expSort = ".empty";
                    } else {
                        $(".isSortable").css("cursor", "pointer");
                    }

                    $('#channel-list').sortable({
                        cursor : 'move',
                        revert : true,
                        cancel : expSort,
                        change : function(event, ui) {
                            $('body').addClass('has-change');
                        }
                    });
                    scrollbar("#portal-constrain", "#portal-list", "#portal-slider");

                });

            } else {
                // no channels
                $("#cntChannelEmpty").show();
                $('#channel-list').html('');
                $('#portal-set-empty-chanels-tmpl').tmpl([{
                    cntChanels : set.channelCnt
                }]).appendTo('#channel-list');
            }

        });

    } else {
        location.href = 'portal-set.html';
    }
    //console.log("portalManage END set id");

    // portal manage
    $('#portal-add-layer .langkey').each(function() {
        $(this).text(nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', $(this).data('langkey')]));
    });

    $('#portal-layer .langkey').each(function() {
        $(this).text(nn._([CMS_CONF.PAGE_ID, 'portal-layer', $(this).data('langkey')]));
    });

    $('#portal-add-layer .langkeyH').each(function() {
        $(this).html(nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', $(this).data('langkey')]));
    });
    $('#portal-add-layer .langkeyVal').each(function() {
        $(this).val(nn._([CMS_CONF.PAGE_ID, 'channel-list', $(this).data('langkey')]));
        $(this).data("tmpIn", $(this).val());
    });

    $('#func-nav .langkey').each(function() {
        $(this).text(nn._([CMS_CONF.PAGE_ID, 'func-nav', $(this).data('langkey')]));
    });
    $('#title-func .langkey').each(function() {
        $(this).text(nn._([CMS_CONF.PAGE_ID, 'title-func', $(this).data('langkey')]));
    });

    //scrollbar("#portal-constrain", "#portal-list", "#portal-slider");
    $('#overlay-s').fadeOut("slow");
}

function portalSet() {
    var msoId = CMS_CONF.MSO;
    if (msoId < 1) {
        location.href = "./";
    } else {
        nn.api('GET', CMS_CONF.API('/api/mso/{msoId}/sets', {
            msoId : msoId
        }), {
            lang : "zh"
        }, function(sets) {
            var cntSets = sets.length, sliceStart = 0, sliceEnd = 3, procSets = [];
            if (sliceEnd > cntSets) {
                sliceEnd = cntSets;
            }
            procSets = sets.slice(sliceStart, sliceEnd);
            var outStr = "";
            $('#portal-set').html('');
            $('#portal-sets-tmpl').tmpl(procSets).appendTo('#portal-set');

            var strCh = "", strEp = "", mroeImg = [], moreImgUrl = "";
            var cntChannel = 0;
            outStr += sets[0]["name"] + '\n';
            $.each(procSets, function(i, set) {
                //console.log("********iii****[" + i + "]");
                //outStr += set.id + "*";
                console.log("********iii****[" + i + "] \n set id :" + set.id);
                nn.api('GET', CMS_CONF.API('/api/sets/{setId}/channels', {
                    setId : set.id
                }), null, function(channels) {
                    cntChannel = channels.length;
                    strCh = "#chset_" + set.id;
                    strEp = "#epset_" + set.id;

                    if (cntChannel > 0) {
                        mroeImg = [];
                        moreImgUrl = CMS_CONF.EPISODE_DEFAULT_IMAGE
                        mroeImg = channels[0].moreImageUrl.split('|');
                        if (mroeImg[0] && mroeImg[0] !== CMS_CONF.EPISODE_DEFAULT_IMAGE) {
                            moreImgUrl = mroeImg[0];
                        }
                        if ('' === channels[0].imageUrl) {
                            channels[0].imageUrl = "images/ch_default.png";
                        }
                        $(strCh).attr("src", channels[0].imageUrl);
                        $(strEp).attr("src", moreImgUrl);
                        //console.log(channels[0].imageUrl);
                        //console.log(strCh + moreImgUrl);
                    }
                });

            });
            //alert("gg");
            //console.log("out str:\n" + outStr);
        });
    }
    $('#title-func .langkey').each(function() {
        $(this).text(nn._([CMS_CONF.PAGE_ID, 'title-func', $(this).data('langkey')]));
    });
    scrollbar("#portal-constrain", "#portal-list", "#portal-slider");
    $('#overlay-s').fadeOut("slow");
}

$(function() {

    //function ddocReady() {
    /* Sign in */
    $("#sign-up").click(function() {
        $("#signup-layer").fadeIn(400);
    });

    $("#btn-signup-close, #signup-cancel").click(function() {
        $("#signup-layer").hide();
    });

    $("#signup-checkbox").click(function() {
        $(this).toggleClass("on");
    });

    $("#btn-forgot-password").click(function() {
        $("#forgot-password-layer").fadeIn(400);
        $(".forgot-password-form").show();
        $(".forgot-password-msg").hide();
    });

    $("#btn-forgot-password-close").click(function() {
        $("#forgot-password-layer").hide();
    });

    $(".back-to-sign").click(function() {
        $("#forgot-password-layer").hide();
    });

    $("#btn-reset-password").click(function() {
        $("#forgot-password-form").hide();
        $("#forgot-password-msg").show();
    });

    $("#btn-reset-password-close, #reset-password-cancel").click(function() {
        $("#reset-password-layer").hide();
    });

    /* Sort List */

    /* Manage */
    $("#portal-layer .channel-list li  .btn-remove").click(function() {
        $(this).parents(".thumb").parents("li").hide();
    });

    /* Message */
    $(".btn-msg-close").click(function() {
        _search_channel_clean()

        $(".msg-layer").hide();
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            $(".msg-layer").hide();
        }
    });

    /* Add */
    $("#portal-layer .channel-list li.empty").click(function() {
        $("#portal-add-layer").fadeIn(400);
    });

    /* Checkbox */
    $(".checkbox").click(function() {
        $(this).toggleClass("on");
    });

    $("html").click(function() {
        $(".select-gray").find(".select-dropdown").removeClass("on");
        $(".select-gray").find(".select-btn").removeClass("on");
    });

    $(".select-gray").click(function(event) {
        event.stopPropagation();
    });

    $("#btn-portal-ch").on("click", function() {
        $("#dropdown-portal-ch").toggleClass("on");
        $(this).toggleClass("on");
    });

    $("#dropdown-portal-ch li").on("click", function(event) {

        $("#input-portal-ch").data("langkey", $(this).data("tvalue"));
        $("#input-portal-ch").val(nn._([CMS_CONF.PAGE_ID, 'channel-list', $("#input-portal-ch").data("langkey")]));
        $("#input-portal-ch").data("tmpIn", $("#input-portal-ch").val());

        $("#txt-portal-ch").data("langkey", $(this).data("langkey"));
        $("#txt-portal-ch").text($(this).text());

        $("#dropdown-portal-ch").attr("kvale", $(this).attr("kvale"));
        $("#dropdown-portal-ch li").removeClass("on");
        $(this).toggleClass("on");
        $("#dropdown-portal-ch").removeClass("on");
    });

    $("#input-portal-ch").focus(function() {
        //console.log($("#input-portal-ch").data("tmpIn")+"*****"+$(this).val());
        if ($("#input-portal-ch").data("tmpIn") == $(this).val()) {
            $(this).val("");
        }
        //alert("in");
        // $(this).next("span").css('display','inline').fadeOut(1000);
    });

    $("#input-portal-ch").focusout(function() {
        $(this).val($.trim($(this).val()));
        if ($(this).val() == "") {
            $(this).val($("#input-portal-ch").data("tmpIn"));
        }
    });

    $(window).resize(function() {

        scrollbar("#portal-constrain", "#portal-list", "#portal-slider");
        $('#portal-slider .slider-vertical').slider('value', 100);
    });

    $('#system-error .btn-ok, #system-error .btn-close').click(function() {
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
    
    setTimeout(function(){$("#set-preview").click();}, 3000);
    
});

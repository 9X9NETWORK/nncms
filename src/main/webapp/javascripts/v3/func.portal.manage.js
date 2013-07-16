/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, vars: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;
    $page.sortingType = 1;
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

    $page._procSort = function (inObj) {

        var tmpDiv,
            channels = [],
            nowTopList = [],
            this_id = 0;

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
                setId: inObj
            }), {
                channels: channels.join(',')
            }, function (set) {

                if (2 === $page.sortingType) {
                    nn.api('GET', cms.reapi('/api/sets/{setId}/channels', {
                        setId: inObj
                    }), null, function (chanels) {
                        var cntChanels = chanels.length,
                            dbTopList = [],
                            procList = [],
                            tmpId = 0,
                            actChannelCount2 = 0;

                        if (cntChanels > 0) {

                            dbTopList = $page.procOnTopList(chanels, $page.sortingType);
                        }

                        $.each(nowTopList, function (i, chId) {
                            tmpId = parseInt(chId, 10);
                            if ($.inArray(tmpId, dbTopList) > -1) {
                                dbTopList.splice($.inArray(tmpId, dbTopList), 1);
                            } else {
                                procList.push({
                                    onTop: true,
                                    chId: tmpId
                                });
                            }

                        });

                        $.each(dbTopList, function (i, chId) {
                            tmpId = parseInt(chId, 10);
                            if (tmpId > 0) {
                                procList.push({
                                    onTop: false,
                                    chId: tmpId
                                });
                            }
                        });
                        actChannelCount2 = procList.length;

                        if (actChannelCount2 > 0) {

                            $.each(procList, function (i, channel) {
                                nn.api("POST", cms.reapi('/api/sets/{setId}/channels', {
                                    setId: inObj
                                }), {
                                    channelId: channel.chId,
                                    alwaysOnTop: channel.onTop
                                }, function (retValue) {
                                    actChannelCount2 = actChannelCount2 - 1;
                                    if (actChannelCount2 === 0) {

                                        $('#overlay-s').fadeOut("slow");
                                    }
                                });
                            });
                        } else {
                            $('#overlay-s').fadeOut("slow");
                        }

                    });

                } else {
                    $('#overlay-s').fadeOut("slow");
                }

            });
        } else {
            $('#overlay-s').fadeOut("slow");
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
            return b.updateDate - a.updateDate;
        }
        return a.seq - b.seq;
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
            $('#yes-no-prompt .content').text(nn._([cms.global.PAGE_ID, 'channel-list', "You will change the order of channel list to \"update time\", it will sort by update time of channels automatically so you can't change the order manually except set on top channels."]));
        }
        var setId = 0;//cms.global.USER_URL.param('id');
        var msoId = cms.global.MSO;

        nn.on(404, function (jqXHR, textStatus) {
            var tmpTxt = $.trim(jqXHR.responseText);
            if (tmpTxt === "Mso Not Found") {
                location.href = "./";
            }
        });
        nn.api('GET', cms.reapi('/api/mso/{msoId}/sets', {
            msoId: msoId
        }), {
            lang: "zh"
        }, function (sets) {
            var cntSetsItem = sets.length;
            if (cntSetsItem > 0) {
                $page.setId = sets[0].id;
                setId = $page.setId;
                var setItems = [];
                $.each(sets, function (i, channel) {
                    channel.isActive = 0;
                    if (channel.id == setId) {
                        channel.isActive = 1;
                    }
                    if (i < 1) {
                        setItems.push(channel);
                    }
                });
                $('#func-nav .sub-nav').html('');
                $('#portal-func-nav-sub-tmpl').tmpl(setItems).appendTo('#func-nav .sub-nav');

                nn.api('GET', cms.reapi('/api/sets/{setId}', {
                    setId: setId
                }), null, function (set) {
                    $('#portal-manage').html('');
                    // sets info

                    $('#portal-set-form-tmpl').tmpl(set).appendTo('#portal-manage');
                    $('#title-func .set_name').html(set.name);

                    $page.sortingType = set.sortingType;
                    $page.currentList = [];

                    // sets channel list
                    if (set.channelCnt > 0) {
                        nn.api('GET', cms.reapi('/api/sets/{setId}/channels', {
                            setId: set.id
                        }), null, function (chanels) {
                            var cntChanels = chanels.length;
                            $('#channel-list').empty();
                            if (cntChanels > 0) {
                                $.each(chanels, function (i, channel) {
                                    if ('' === channel.imageUrl) {
                                        channel.imageUrl = "images/ch_default.png";
                                    }
                                    $page.currentList.push(channel.id);
                                });

                                $page.nomoList = $page.procNomoList(chanels, $page.sortingType);
                                $page.onTopList = $page.procOnTopList(chanels, $page.sortingType);
                                $page._drawChannelLis();
                            }

                            var expSort = ".empty, .isSortable";
                            if (set.sortingType === 1) {
                                expSort = ".empty";
                            } else {
                                $(".isSortable").css("cursor", "pointer");
                            }
                            $('#channel-list').sortable({
                                cursor: 'move',
                                revert: true,
                                cancel: expSort,
                                change: function (event, ui) {
                                    $('body').addClass('has-change');
                                }
                            });
                            //$common.scrollbar("#portal-constrain", "#portal-list", "#portal-slider");
                            $('#portal-list').perfectScrollbar();
                            $('#overlay-s').fadeOut("slow");
                        });
                    } else {
                        // no channels
                        $("#cntChannelEmpty").show();
                        $('#channel-list').html('');
                        $('#portal-set-empty-chanels-tmpl').tmpl([{
                            cntChanels: set.channelCnt
                        }]).appendTo('#channel-list');
                        $('#overlay-s').fadeOut("slow");
                    }
                });
            } else {
                location.href = "./";
            }
        });

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
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('portal-manage')));
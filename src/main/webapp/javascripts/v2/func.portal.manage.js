/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, vars: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page._search_channel_clean = function () {
        $("#msg-search").hide();
        $("#sRusult").html("");
        $("#search-channel-list").html("");
        $("#searchAdd").hide();
        $("#searchPrev").hide();
        $("#searchNext").hide();
        $("#input-portal-ch").val($("#input-portal-ch").data("tmpIn"));
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
        var setId = cms.global.USER_URL.param('id');
        var msoId = cms.global.MSO;
        if (msoId < 1) {
            location.href = "./";
        } else if (setId != undefined && setId > 0) {
            $("#cntChannelEmpty").hide();
            nn.api('GET', cms.reapi('/api/sets/{setId}', {
                setId: setId
            }), null, function (set) {
                $('#portal-manage').html('');
                if (set.id > 0) {
                    nn.api('GET', cms.reapi('/api/mso/{msoId}/sets', {
                        msoId: set.msoId
                    }), {
                        lang: "zh"
                    }, function (sets) {
                        var cntSetsItem = sets.length;
                        if (cntSetsItem > 0) {
                            var setItems = [];
                            $.each(sets, function (i, channel) {
                                channel.isActive = 0;
                                if (channel.id == setId) {
                                    channel.isActive = 1;
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
                    nn.api('GET', cms.reapi('/api/sets/{setId}/channels', {
                        setId: set.id
                    }), null, function (chanels) {
                        var cntChanels = chanels.length;
                        $('#channel-list').html('');
                        $('#portal-set-empty-chanels-tmpl').tmpl([{
                            cntChanels: cntChanels
                        }]).appendTo('#channel-list');
                        if (cntChanels > 0) {
                            $.each(chanels, function (i, channel) {
                                if ('' === channel.imageUrl) {
                                    channel.imageUrl = "images/ch_default.png";
                                }
                            });
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
                            cursor: 'move',
                            revert: true,
                            cancel: expSort,
                            change: function (event, ui) {
                                $('body').addClass('has-change');
                            }
                        });
                        $common.scrollbar("#portal-constrain", "#portal-list", "#portal-slider");
                    });
                } else {
                    // no channels
                    $("#cntChannelEmpty").show();
                    $('#channel-list').html('');
                    $('#portal-set-empty-chanels-tmpl').tmpl([{
                        cntChanels: set.channelCnt
                    }]).appendTo('#channel-list');
                }
                $('#overlay-s').fadeOut("slow");
            });
        } else {
            location.href = 'portal-set.html';
        }

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
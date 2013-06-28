/*jslint browser: true, devel: true, nomen: true, unparam: true, vars: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: portal-set',
            options: options
        }, 'debug');

        $common.showProcessingOverlay();
        var msoId = cms.global.MSO;
        if (msoId < 1) {
            location.href = "./";
        } else {
            nn.api('GET', cms.reapi('/api/mso/{msoId}/sets', {
                msoId: msoId
            }), {
                lang: "zh"
            }, function (sets) {
                var cntSets = sets.length,
                    sliceStart = 0,
                    sliceEnd = 3,
                    procSets = [];
                if (sliceEnd > cntSets) {
                    sliceEnd = cntSets;
                }
                procSets = sets.slice(sliceStart, sliceEnd);
                $('#portal-set').html('');
                $('#portal-sets-tmpl').tmpl(procSets).appendTo('#portal-set');

                var strCh = "",
                    strEp = "",
                    mroeImg = [],
                    moreImgUrl = "";
                var cntChannel = 0;
                $.each(procSets, function (i, set) {
                    console.log("********iii****[" + i + "] \n set id :" + set.id);
                    nn.api('GET', cms.reapi('/api/sets/{setId}/channels', {
                        setId: set.id
                    }), null, function (channels) {
                        cntChannel = channels.length;
                        strCh = "#chset_" + set.id;
                        strEp = "#epset_" + set.id;

                        if (cntChannel > 0) {
                            mroeImg = [];
                            moreImgUrl = cms.config.EPISODE_DEFAULT_IMAGE;
                            mroeImg = channels[0].moreImageUrl.split('|');
                            if (mroeImg[0] && mroeImg[0] !== cms.config.EPISODE_DEFAULT_IMAGE) {
                                moreImgUrl = mroeImg[0];
                            }
                            if ('' === channels[0].imageUrl) {
                                channels[0].imageUrl = "images/ch_default.png";
                            }
                            $(strCh).attr("src", channels[0].imageUrl);
                            $(strEp).attr("src", moreImgUrl);
                        }
                    });
                });
                $('#overlay-s').fadeOut("slow");
            });
        }
        $('#title-func .langkey').each(function () {
            $(this).text(nn._([cms.global.PAGE_ID, 'title-func', $(this).data('langkey')]));
        });
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('portal-set')));
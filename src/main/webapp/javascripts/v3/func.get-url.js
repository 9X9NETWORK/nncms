/*global cms */
/*global $, nn, cms */
(function ($geturl) {
    'use strict';

    $geturl.iniSharingList = function (inObj) {
        var strCid = '',
            strEid = '',
            strBrand = '',
            strBaseURL = cms.config.API_BASE + '/view?',
            strSurl = '',
            userUrlFile = cms.global.USER_URL.attr('file');

        if ('' === userUrlFile) {
            userUrlFile = 'index.html';
        }
        strBrand = inObj.find('.select-txt-gray').text();
        strCid = inObj.data('metach');
        strEid = inObj.data('metaep');
        if (userUrlFile === 'index.html') {
            strSurl = strBaseURL + ['mso=' + strBrand, 'ch=' + strCid].join('&');
        } else {
            strSurl = strBaseURL + ['mso=' + strBrand, 'ch=' + strCid, 'ep=e' + strEid].join('&');
        }
        if (cms.global.IS_REMARK) {
            $(".tip-bottom").css("right", 42);
        }
        return strSurl;
    };

    // NOTE: remember to change page-key to match func-name
}(cms.namespace('get-url')));
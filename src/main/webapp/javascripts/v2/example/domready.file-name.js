/*jslint browser: true, nomen: true, regexp: true, unparam: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['file-name'],
        $common = cms.common,
        yourPrivateVariable = 'Remember to remove this sample';

    // TODO: some private function
    function yourPrivateFunc() {
        nn.log($page.globalVariable, 'debug');
        nn.log('private function testing...', 'debug');
        nn.log(cms.config.IS_DEBUG, 'debug');
        nn.log(yourPrivateVariable, 'debug');
    }

    // TODO: some event register
    $('#content-main').on('click', '#your-block-id .your-block-class', function () {
        $common.showProcessingOverlay();
        $page.yourPageFuncOne();
        $page.yourPageFuncTwo();
        yourPrivateFunc();
        return false;
    });

    // TODO: some window resize
    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        $page.yourPageFuncOne();
        yourPrivateFunc();
    });
});
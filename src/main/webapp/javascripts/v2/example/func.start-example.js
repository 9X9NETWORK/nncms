/*jslint browser: true, nomen: true, regexp: true, unparam: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: start-example',
            options: options
        }, 'debug');

        $common.showProcessingOverlay();
        var id = cms.global.USER_URL.param('id');

        // TODO
        $('#overlay-s').fadeOut('slow', function () {
            nn.log({
                urlParamId: id
            }, 'debug');
        });
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('start-example')));
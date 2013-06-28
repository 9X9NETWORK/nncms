/*jslint browser: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: signin',
            options: options
        }, 'debug');

        var tmpUrl = $.url(location.href.replace('@', '%40')),
            inAction = tmpUrl.param('ac'),
            inEmail = tmpUrl.param('e'),
            inPass = tmpUrl.param('pass');

        if ('resetpwd' === inAction) {
            if (inEmail && inPass) {
                $('#reset-password-layer').show();
            } else {
                location.href = 'signin.html';
            }
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('signin')));
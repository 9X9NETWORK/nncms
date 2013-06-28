/*jslint browser: true, nomen: true, regexp: true, unparam: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $page = cms['start-example'],
        $common = cms.common;

    // TODO: some window resize
    // NOTE: Keep Window Resize Event at the bottom of this file
    $(window).resize(function () {
        nn.log('window.resize!!!', 'debug');
    });
});
/*jslint browser: true, nomen: true, regexp: true, unparam: true */
/*global $, nn, cms */

(function ($page) {
    'use strict';

    var $common = cms.common;

    // TODO: some page global variable
    $page.globalVariable = 'Remember to remove this sample';

    // TODO: some private function
    function yourPrivateMethod() {
        nn.log($page.globalVariable, 'debug');
        nn.log('private function testing...', 'debug');
        nn.log(cms.config.IS_DEBUG, 'debug');
    }

    // TODO: some page public function
    $page.yourPageFuncOne = function () {
        nn.log('page function one testing...', 'debug');
        nn.log(cms.config.IS_DEBUG, 'debug');
        yourPrivateMethod();
    };

    // TODO: some page public function
    $page.yourPageFuncTwo = function () {
        nn.log('page function two testing...', 'debug');
    };

    // NOTE: The onYouTubePlayerReady function needs to be in the window context
    // so that the ActionScript code can call it after it's loaded
    window.onYouTubePlayerReady = function (playerId) {
        cms.global.YOUTUBE_PLAYER = document.getElementById('youTubePlayer');
        cms.global.YOUTUBE_PLAYER.addEventListener('onStateChange', 'onYouTubePlayerStateChange');
    };
    window.onYouTubePlayerStateChange = function (newState) {
        nn.log({
            newState: newState
        }, 'debug');
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: file-name',
            options: options
        }, 'debug');

        $common.showProcessingOverlay();
        var id = cms.global.USER_URL.param('id');

        // TODO
        $page.yourPageFuncTwo();
        yourPrivateMethod();
        $('#overlay-s').fadeOut('slow', function () {
            nn.log({
                urlParamId: id
            }, 'debug');
        });
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('file-name')));
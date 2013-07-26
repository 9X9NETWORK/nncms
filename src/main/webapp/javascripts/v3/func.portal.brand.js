/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, vars: true */
/*global $, nn, cms, SWFUpload */

(function ($page) {
    'use strict';

    var $common = cms.common;

    $page.uploadImage = function () {
        var parameter = {
            'prefix': 'pcs',
            'type': 'image',
            'size': 512000,
            'acl': 'public-read'
        };
        nn.api('GET', cms.reapi('/api/s3/attributes'), parameter, function (s3attr) {
            var timestamp = (new Date()).getTime(),
                handlerUploadProgress = function (file, completed, total) {
                    $('#brand-logo').addClass('hide');
                    $('.img .loading').show();
                    this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Uploading...']) + '</span>');
                },
                handlerUploadSuccess = function (file, serverData, recievedResponse) {
                    this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
                    if (!file.type) {
                        file.type = nn.getFileTypeByName(file.name);
                    }
                    this.setButtonDisabled(false);
                    // enable upload button again
                    var url = 'http://' + s3attr.bucket + '.s3.amazonaws.com/' + parameter.prefix + '-logo-' + timestamp + '-' + file.size + file.type.toLowerCase();
                    //fadeIn(400);
                    //$('#brand-logo').attr("src", "");
                    $('body').addClass("has-change");
                    $('#brand-logo').attr("src", url);
                    setTimeout(function () {
                        $('.img .loading').hide();
                        $('#brand-logo').removeClass('hide');
                    }, 500);
                },
                handlerUploadError = function (file, code, message) {
                    $('#brand-logo').removeClass('hide');
                    $('.img .loading').hide();
                    this.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
                    this.setButtonDisabled(false);
                    if (code === -280) { // user cancel upload
                        alert(message);
                        // show some error prompt
                    } else {
                        alert(message);
                        // show some error prompt
                    }
                },
                handlerFileQueue = function (file) {
                    if (file.size > parameter.size) {
                        $common.showSystemErrorOverlay(nn._([cms.global.PAGE_ID, 'brand-layer', 'your upload file is large than 500KB, please reupload file.']));
                        return false;
                    }
                    if (!file.type) {
                        file.type = nn.getFileTypeByName(file.name);
                        // Mac Chrome compatible
                    }
                    var postParams = {
                        "AWSAccessKeyId": s3attr.id,
                        "key": parameter.prefix + '-logo-' + timestamp + '-' + file.size + file.type.toLowerCase(),
                        "acl": parameter.acl,
                        "policy": s3attr.policy,
                        "signature": s3attr.signature,
                        "content-type": parameter.type,
                        "success_action_status": "201"
                    };
                    this.setPostParams(postParams);
                    this.startUpload(file.id);
                    this.setButtonDisabled(true);
                },
                handlerFileQueueError = function (file, code, message) {
                    if (code === -130) { // error file type
                        $('#brand-logo').removeClass('hide');
                        $('.img .loading').hide();
                    }
                },
                settings = {
                    flash_url: 'javascripts/libs/swfupload/swfupload.swf',
                    upload_url: 'http://' + s3attr.bucket + '.s3.amazonaws.com/', // http://9x9tmp-ds.s3.amazonaws.com/
                    file_size_limit: parameter.size,
                    file_types: '*.png',
                    file_types_description: 'Thumbnail',
                    file_post_name: 'file',
                    button_placeholder: $('#uploadThumbnail').get(0),
                    button_image_url: 'images/btn-load.png',
                    button_width: '129',
                    button_height: '29',
                    button_text: '<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>',
                    button_text_style: '.uploadstyle { color: #777777; font-family: Arial, Helvetica; font-size: 15px; text-align: center; } .uploadstyle:hover { color: #999999; }',
                    button_text_top_padding: 1,
                    button_action: SWFUpload.BUTTON_ACTION.SELECT_FILE,
                    button_cursor: SWFUpload.CURSOR.HAND,
                    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                    http_success: [201],
                    upload_progress_handler: handlerUploadProgress,
                    upload_success_handler: handlerUploadSuccess,
                    upload_error_handler: handlerUploadError,
                    file_queued_handler: handlerFileQueue,
                    file_queue_error_handler: handlerFileQueueError,
                    debug: false
                },
                swfu = new SWFUpload(settings);
            swfu.debug = cms.config.IS_DEBUG;
        });
    };

    // NOTE: page entry point (keep at the bottom of this file)
    $page.init = function (options) {
        nn.log({
            // NOTE: remember to change page-key to match file-name
            subject: 'CMS.PAGE.INITIALIZED: brand-setting',
            options: options
        }, 'debug');

        $common.showProcessingOverlay();
        var msoId = cms.global.MSO;
        if (msoId < 1) {
            location.href = "./";
        } else {
            //alert(lang);
            nn.api('GET', cms.reapi('/api/mso/{msoId}', {
                msoId: msoId
            }), null, function (msoInfo) {
                //$('#portal-manage').html('');
                if (undefined != msoInfo.id && msoInfo.id > 0) {
                    $("#brand-title-val").val(msoInfo.title);
                    $("#name-charcounter").text(msoInfo.title.length);
                    $("#brand-logo").attr("src", msoInfo.logoUrl);
                    $("#brand-logo").data("src", msoInfo.logoUrl);
                } else {
                    location.href = "./";
                }
            });

            $('#brand-layer .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'brand-layer', $(this).data('langkey')]));
            });
            $('#func-nav .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'func-nav', $(this).data('langkey')]));
            });
            $('#title-func .langkey').each(function () {
                $(this).text(nn._([cms.global.PAGE_ID, 'title-func', $(this).data('langkey')]));
            });

            $page.uploadImage();
            $('#overlay-s').fadeOut("slow");
        }
    };

    // NOTE: remember to change page-key to match file-name
}(cms.namespace('brand-setting')));
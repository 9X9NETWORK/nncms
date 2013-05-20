$(document).on("keyup", "#brand-title-val", function(event) {
    $(".clearfix .msg-error").hide();
    $("#name-charcounter").text($("#brand-title-val").val().length);
});

$(document).on('click', '#content-nav a, .select-list li a, .studio-nav-wrap a, #profile-dropdown a', function(e) {
    if ($('body').hasClass('has-change')) {
        if (e && $(e.currentTarget).attr('href')) {
            $('body').data('leaveUrl', $(e.currentTarget).attr('href'));
        }
        if (e && $(e.currentTarget).attr('id')) {
            $('body').data('leaveId', $(e.currentTarget).attr('id'));
        }
        showUnsaveOverlay();
        return false;
    }
});

$(document).on('click', '#unsave-prompt .btn-leave', function() {
    $('body').removeClass('has-change');

    $.unblockUI();
    if ('' != $('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
        $('#' + $('body').data('leaveId')).trigger('click');
    } else {
        location.href = $('body').data('leaveUrl');
    }
    return false;
});

$(document).on("click", "#btn-brand-save", function(event) {
    var inBrandTitle = $("#brand-title-val").val(), msoId = CMS_CONF.MSO, logoChange = false;
    var logoSrc = $("#brand-logo").data("src"), logoNow = $("#brand-logo").attr("src");

    if ("" !== logoNow && logoNow != logoSrc) {
        logoChange = true;

    }

    if (inBrandTitle.length > 0) {
        showProcessingOverlay();
        nn.api('PUT', CMS_CONF.API('/api/mso/{msoId}', {
            msoId : msoId
        }), {
            title : inBrandTitle,
            logoUrl : logoNow
        }, function(msg) {

            $('#overlay-s').fadeOut("slow");
            $('body').removeClass("has-change");
        });
    } else {
        $(".clearfix .msg-error").show();
    }
});

function brandSeting() {

    var msoId = CMS_CONF.MSO;

    if (msoId < 1) {
        location.href = "./";

    } else {
        //alert(lang);
        nn.api('GET', CMS_CONF.API('/api/mso/{msoId}', {
            msoId : msoId
        }), null, function(msoInfo) {

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

        $('#brand-constrain .langkey').each(function() {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'portal-add-layer', $(this).data('langkey')]));
        });
        $('#brand-layer .langkey').each(function() {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'brand-layer', $(this).data('langkey')]));
        });
        $('#func-nav .langkey').each(function() {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'func-nav', $(this).data('langkey')]));
        });
        $('#title-func .langkey').each(function() {
            $(this).text(nn._([CMS_CONF.PAGE_ID, 'title-func', $(this).data('langkey')]));
        });

        uploadImage();
        $('#overlay-s').fadeOut("slow");
    }
}

function uploadImage() {
    var parameter = {
        'prefix' : 'pcs',
        'type' : 'image',
        'size' : 20485760,
        'acl' : 'public-read'
    };
    nn.api('GET', CMS_CONF.API('/api/s3/attributes'), parameter, function(s3attr) {
        var timestamp = (new Date()).getTime();
        var handlerFileDialogStart = function() {
            //$('#brand-logo').addClass('hide');
            //$('.img .loading').show();
        };
        var handlerUploadProgress = function(file, completed/* completed bytes */, total /* total bytes */) {
            $('#brand-logo').addClass('hide');
            $('.img .loading').show();
            swfu.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Uploading...']) + '</span>');
        };
        var handlerUploadSuccess = function(file, serverData, recievedResponse) {

            swfu.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
            if (!file.type) {
                file.type = nn.getFileTypeByName(file.name);
            }
            this.setButtonDisabled(false);
            // enable upload button again
            var url = 'http://' + s3attr['bucket'] + '.s3.amazonaws.com/' + parameter['prefix'] + '-logo-' + timestamp + '-' + file.size + file.type.toLowerCase();
            //fadeIn(400);
            //$('#brand-logo').attr("src", "");
            $('body').addClass("has-change");
            $('#brand-logo').attr("src", url);
            setTimeout(function() {
                $('.img .loading').hide();
                $('#brand-logo').removeClass('hide');
            }, 500);

        };
        var handlerUploadError = function(file, code, message) {
            $('#brand-logo').removeClass('hide');
            $('.img .loading').hide();
            swfu.setButtonText('<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>');
            this.setButtonDisabled(false);
            if (code == -280) {// user cancel upload
                alert(message);
                // show some error prompt
            } else {
                alert(message);
                // show some error prompt
            }
        };
        var handlerFileQueue = function(file) {
            if (!file.type) {
                file.type = nn.getFileTypeByName(file.name);
                // Mac Chrome compatible
            }
            var postParams = {
                "AWSAccessKeyId" : s3attr['id'],
                "key" : parameter['prefix'] + '-logo-' + timestamp + '-' + file.size + file.type.toLowerCase(),
                "acl" : parameter['acl'],
                "policy" : s3attr['policy'],
                "signature" : s3attr['signature'],
                "content-type" : parameter['type'],
                "success_action_status" : "201"
            };
            this.setPostParams(postParams);
            this.startUpload(file.id);
            this.setButtonDisabled(true);
        };
        var handlerFileQueueError = function(file, code, message) {
            if (code == -130) {// error file type
                $('#brand-logo').removeClass('hide');
                $('.img .loading').hide();
            }
        };
        var settings = {
            flash_url : 'javascripts/swfupload/swfupload.swf',
            upload_url : 'http://' + s3attr['bucket'] + '.s3.amazonaws.com/', // http://9x9tmp-ds.s3.amazonaws.com/
            file_size_limit : parameter['size'],
            file_types : '*.png',
            file_types_description : 'Thumbnail',
            file_post_name : 'file',
            button_placeholder : $('#uploadThumbnail').get(0),
            button_image_url : 'images/btn-load.png',
            button_width : '129',
            button_height : '29',
            button_text : '<span class="uploadstyle">' + nn._(['upload', 'Upload']) + '</span>',
            button_text_style : '.uploadstyle { color: #777777; font-family: Arial, Helvetica; font-size: 15px; text-align: center; } .uploadstyle:hover { color: #999999; }',
            button_text_top_padding : 1,
            button_action : SWFUpload.BUTTON_ACTION.SELECT_FILE,
            button_cursor : SWFUpload.CURSOR.HAND,
            button_window_mode : SWFUpload.WINDOW_MODE.TRANSPARENT,
            http_success : [201],
            file_dialog_start_handler : handlerFileDialogStart,
            upload_progress_handler : handlerUploadProgress,
            upload_success_handler : handlerUploadSuccess,
            upload_error_handler : handlerUploadError,
            file_queued_handler : handlerFileQueue,
            file_queue_error_handler : handlerFileQueueError,
            debug : false
        };
        var swfu = new SWFUpload(settings);
    });
}

$(function() {
    $('#system-error .btn-ok, #system-error .btn-close').click(function() {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            location.replace('index.html?' + CMS_CONF.USER_DATA.id);
        }
        return false;
    });

    function confirmExit() {
        if ($('body').hasClass('has-change')) {
            // Unsaved changes will be lost, are you sure you want to leave?
            return $('#unsave-prompt p.content').text();
        }
    }


    window.onbeforeunload = confirmExit;

});

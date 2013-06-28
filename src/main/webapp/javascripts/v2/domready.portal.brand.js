/*jslint browser: true, devel: true, eqeq: true, nomen: true, unparam: true, vars: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    // NOTE: remember to change page-key to match file-name
    var $common = cms.common;

    $(document).on("keyup", "#brand-title-val", function (event) {
        $(".clearfix .msg-error").hide();
        $('body').addClass('has-change');
        $("#name-charcounter").text($("#brand-title-val").val().length);
    });

    $(document).on('change', '#brand-title-val', function () {
        $(".clearfix .msg-error").hide();
        $("#name-charcounter").text($("#brand-title-val").val().length);
        $('body').addClass('has-change');
    });

    $(document).on('click', '#content-nav a, .select-list li a, .studio-nav-wrap a, #profile-dropdown a', function (e) {
        if ($('body').hasClass('has-change')) {
            if (e && $(e.currentTarget).attr('href')) {
                $('body').data('leaveUrl', $(e.currentTarget).attr('href'));
            }
            if (e && $(e.currentTarget).attr('id')) {
                $('body').data('leaveId', $(e.currentTarget).attr('id'));
            }
            $common.showUnsaveOverlay();
            return false;
        }
    });

    $(document).on('click', '#unsave-prompt .btn-leave', function () {
        $('body').removeClass('has-change');
        $.unblockUI();
        if ($('body').data('leaveId') && -1 !== $.inArray($('body').data('leaveId'), ['logo', 'profile-logout', 'language-en', 'language-zh'])) {
            $('#' + $('body').data('leaveId')).trigger('click');
        } else if ($('body').data('leaveUrl')) {
            location.href = $('body').data('leaveUrl');
        } else {
            location.href = 'index.html';
        }
        return false;
    });

    $(document).on("click", "#btn-brand-save", function (event) {
        var inBrandTitle = $("#brand-title-val").val(),
            msoId = cms.global.MSO;
        var logoNow = $("#brand-logo").attr("src");

        if (inBrandTitle.length > 0) {
            $common.showProcessingOverlay();
            nn.api('PUT', cms.reapi('/api/mso/{msoId}', {
                msoId: msoId
            }), {
                title: inBrandTitle,
                logoUrl: logoNow
            }, function (msg) {
                $('#overlay-s').fadeOut("slow");
                $('body').removeClass("has-change");
            });
        } else {
            $(".clearfix .msg-error").show();
        }
    });

    $('#system-error .btn-ok, #system-error .btn-close').click(function () {
        $.unblockUI();
        if ($('body').hasClass('has-error')) {
            location.replace('index.html?' + cms.global.USER_DATA.id);
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
/*jslint browser: true, unparam: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    var $geturl = cms['get-url'];

    $(document).on('click', '.url', function (event) {
        var userUrlFile = cms.global.USER_URL.attr('file'),
            obj_get_url = null,
            strMetaCh = '',
            strMetaIn = '';

        if ('' === userUrlFile) {
            userUrlFile = 'index.html';
        }
        if (!$(this).hasClass('disable')) {
            $('.url').removeClass("selected");
            obj_get_url = $(this).parents('li').find('.get-url');
            $(this).addClass("selected");
            if (userUrlFile === 'index.html') {
                strMetaCh = obj_get_url.data('metach');
                strMetaIn = obj_get_url.data('metain');
                // sharing url
                if (strMetaIn !== 1) {
                    nn.api('GET', cms.reapi('/api/channels/{channelId}/autosharing/validBrands', {
                        channelId: strMetaCh
                    }), null, function (cBrands) {
                        var tmpBrand = [{
                                brand: cBrands[0].brand
                            }];
                        $('#tmpHtml2').empty();
                        $('#get-url-part-tmpl').tmpl(cBrands, {
                            li_sel: cBrands[0].brand
                        }).appendTo('#tmpHtml2');
                        $('#tmpHtml').empty();
                        $('#get-url-tmpl').tmpl(tmpBrand, {
                            li_items: $('#tmpHtml2').html()
                        }).appendTo('#tmpHtml');

                        obj_get_url.children().remove();
                        obj_get_url.append($('#tmpHtml').html());
                        obj_get_url.find('input.srul-text').val($geturl.iniSharingList(obj_get_url));
                        obj_get_url.data('metain', 1);
                    });
                }
            }

            $('.get-url').hide();
            obj_get_url.find('input.srul-text').val($geturl.iniSharingList(obj_get_url));

            $(this).parents('li').find('.tip').hide();
            obj_get_url.fadeIn(400);
        }
    });

    $(document).on('click', 'html', function (event) {
        $('.get-url').hide();
        $('.url').removeClass("selected");
    });

    $('#content-main-wrap').scroll(function () {
        $('.get-url').hide();
        $('.url').removeClass("selected");
    });

    $(document).on('click', '.get-url, .url', function (event) {
        event.stopPropagation();
    });

    /* Dropdown Gray */
    $(document).on('click', '.select-gray', function (event) {
        event.stopPropagation();
    });

    $(document).on('click', '.select-gray .select-btn', function (event) {
        $(this).parents('div').find('.select-dropdown').toggleClass('on');
        $(this).toggleClass('on');
    });

    $(document).on('click', '.select-gray .select-dropdown li', function (event) {
        var obj_get_url = $(this).parents('li').find('.get-url');
        $(this).parent('ul').parent('div').find('.select-txt-gray').text($(this).data('meta'));
        $(this).parent('ul').find('li').removeClass('on');
        $(this).addClass('on');
        obj_get_url.find('input.srul-text').val($geturl.iniSharingList(obj_get_url));
        $(this).parents('div').find('.select-dropdown').toggleClass('on');
        $(this).parents('div').find('.select-btn').toggleClass('on');
    });

    // NOTE: Keep Window Resize Event at the bottom of this file
    $(document).on('click', 'html, .get-url', function (event) {
        $('.select-gray .select-dropdown, .select-gray .select-btn').removeClass('on');
    });
});
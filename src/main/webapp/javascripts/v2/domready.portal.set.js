/*jslint browser: true, nomen: true, unparam: true */
/*global $, nn, cms */

$(function () {
    'use strict';

    $(document).on("click", "#portal-set li", function (event) {
        var nextUrl = "portal-manage.html?id=" + $(this).data("meta");
        location.href = nextUrl;
    });
});
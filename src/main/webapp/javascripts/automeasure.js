function autoWidth() {
    $('#content-main').width($(window).width() - 210 - 40);      //210: 左側選單寬度    40: scrollbar 寬度
    $('.epcurate-curation #content-main').width($(window).width());
}

function autoHeight() {
    var windowHeight = $(window).height();
    var titleFuncHeight = $('#title-func').height() + 38;
    var sliderHeight = windowHeight - titleFuncHeight - 146;

    $('#content-wrap, #content-main').height($(window).height() - 94);    //94: header + studio-nav;
    $('.epcurate-info#content-wrap, .epcurate-curation#content-wrap, .epcurate-publish#content-wrap').height($(window).height() - 45);    //94: header + studio-nav;
    $('#content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + 120);
    $('.library-list #content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + 190);
    $('#content-main-wrap').css('margin-top', titleFuncHeight + 'px');
    $('#main-wrap-slider').css('top', titleFuncHeight + 'px');
    $('#main-wrap-slider').height(sliderHeight);
    $('#main-wrap-slider').attr('data-orig-slider-height', sliderHeight);
}
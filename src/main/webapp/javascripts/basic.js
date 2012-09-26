function autoWidth() {
    var contentNavWidth = 200;
    var scrollbarWidth = 35;
    $('#content-main').width($(window).width() - contentNavWidth - scrollbarWidth);
    $('.epcurate-curation #content-main').width($(window).width());
    $('#epcurate-curation .tab-content .result-list ul').width($(window).width() - $('#epcurate-curation #video-player .video').width() - 60);
    //$('#epcurate-curation .tab-content .result-list a.video-next').css('left', $(window).width() - 35 + 'px');
}

function autoHeight() {
    var windowHeight = $(window).height();
    var titleFuncHeight = $('#title-func').height() + 38; // 21 + 17
    var sliderHeight = windowHeight - titleFuncHeight - 156; // 94 + 48 + padding
    $('#content-wrap, #content-main').height($(window).height() - 94);  // 94: header45 + studio-nav49;
    $('.epcurate-info#content-wrap, .epcurate-curation#content-wrap, .epcurate-publish#content-wrap, .epcurate-shopping#content-wrap').height($(window).height() - 49);
    $('.epcurate-info #content-main, .epcurate-curation #content-main, .epcurate-publish #content-main, .epcurate-shopping #content-main').height($(window).height() - 49);
    $('#content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + 131); // 48 + 20
    $('.epcurate-curation #content-main-wrap').height($('#content-main-wrap').children('.constrain').height());
    $('.library-list #content-main-wrap').height($('#content-main-wrap').children('.constrain').height() + 190);
    $('#content-main-wrap:not(.curation)').css('margin-top', titleFuncHeight + 'px');
    $('#main-wrap-slider').css('top', titleFuncHeight + 'px');
    $('#main-wrap-slider').height(sliderHeight);
    $('#main-wrap-slider').attr('data-orig-slider-height', sliderHeight);
}

$(function () {
    /* Auto Measure */
    autoWidth();
    autoHeight();

    /* Dropdown Menu */
    function showDropdown(btn) {
        $(".dropdown, .select-list").hide();
        $(".dropdown")
            .parents("li:not(" + btn + ")").removeClass("on")
            .children(".on:not(" + btn + ")").removeClass("on");
        $(btn).toggleClass("on");
        var str = $(btn).attr("id");
        if (str.search("btn") == 0) {
            // for btn-xxx
            str = $(btn).attr("id").slice(4);
        }
        var id = "#" + str + "-dropdown";
        if ($(btn).hasClass('on')) {
            $(id).show();
        } else {
            $(id).hide();
        }
    }
    $("body").click(function () {
        $(".dropdown").hide();
        $(".dropdown").parents("li").removeClass("on").children(".on").removeClass("on");
    });

    /* Header Browse Dropdown */
    $("#browse").click(function (event) {
        showDropdown("#browse");
        $('#footer p.select-btn').removeClass('on');
        event.stopPropagation();
    });
    $("#browse-dropdown li").click(function () {
        $("#browse").removeClass("on");
        $("#browse-dropdown").hide();
    });

    // Header Profile Dropdown
    $("#btn-profile, #selected-profile").click(function (event) {
        showDropdown("#btn-profile");
        $('#footer p.select-btn').removeClass('on');
        event.stopPropagation();
    });
    $("#profile-dropdown li").click(function () {
        $("#btn-profile").removeClass("on");
        $("#profile-dropdown").hide();
    });

    /* Footer Control */
    $("#footer-control").click(function () {
        if ($(this).hasClass("on")) {
            $(this).removeClass("on");
            $("#footer").slideToggle();
        } else {
            $(this).addClass("on");
            $("#footer").slideToggle();
        }
    });

    /* Footer Dropdown(可與 channel-add共用) */
    $("body").click(function () {
        $(".select-list").hide();
        $(".select-list").parents().removeClass("on").children(".on").removeClass("on");
    });
    $('#footer-list li .select-btn, #footer-list li .select-txt').click(function (event) {
        $('.select-list, .dropdown').hide();
        $('#nav li, #btn-profile').removeClass('on');
        $(this).parent("li").siblings().children(".on").removeClass("on");
        $(this).parent().children('.select-btn').toggleClass("on");
        if ($(this).parent().children('.select-btn').hasClass('on')) {
            $(this).parent().children('.select-list').show();
        } else {
            $(this).parent().children('.select-list').hide();
        }
        event.stopPropagation();
    });
    $('#footer-list li .select-list li').click(function () {
        $('#footer-list li .select-btn').removeClass("on");
        $(this).parent('.select-list').slideToggle();
    });

    /* Input */
    function setInput(hint, input) {
        field = input + " .textfield";
        $(field).focus(function () {
            var txt = $(this).val();
            if (txt == hint) {
                $(this).val("");
            }
        }).blur(function () {
            txt = $(this).val();
            if (txt == "") {
                $(this).val(hint);
            }
        });
    }
    setInput("Search", "#search");
    function inputHilite() {
        $(".textfield").focus(function () {
            $(this).parent().addClass("on");
        }).blur(function () {
            $(this).parent().removeClass("on");
        });
    }
    inputHilite();

    /* Ellipsis */
    function setEllipsis() {
        $(".ellipsis").ellipsis();
    }
    setEllipsis();

    /* Window Resize */
    $(window).resize(function () {
        autoWidth();
        autoHeight();
        setEllipsis();
    });
});
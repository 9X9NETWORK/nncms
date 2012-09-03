$(function() {
    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
    $('#header, #footer, #footer-control').fadeOut(3000);

    $('#content-wrap.epcurate-shopping ul.radio li a').click(function() {
        $('#content-wrap.epcurate-shopping ul.radio li').removeClass('on');
        $(this).parent().addClass('on');
    });

    $('.switch-off').click(function() {
        $(this).hide();
        $('.switch-on').show();
        $(this).parent().parent().nextAll('.fminput').removeClass('disable');
        return false;
    });

    $('.switch-on').click(function() {
        $(this).hide();
        $('.switch-off').show();
        $(this).parent().parent().nextAll('.fminput').addClass('disable');
        return false;
    });

    $('#date-time .datepicker').datepicker();
});
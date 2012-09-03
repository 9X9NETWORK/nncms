$(function() {
    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
    if($('input.text').length > 0) {
        $('input.text').toggleVal();
    }
    
    $('#library-video-list ul li').hover(function() {
        var videoWrapWidth = $('#library-video-list ul').width();
        var index = $(this).index();
        var rowItem = parseInt(videoWrapWidth/114, 10);  //114 = ¼v¤ù¼e«× + margin-right
        var row = parseInt(index/rowItem, 10);

        if(1 == row%3) {
            $(this).children('.video-tip').css('top', '-110px');
        }
        if(2 == row%3) {
            $(this).children('.video-tip').css('top', '-220px');
        }
    });
});
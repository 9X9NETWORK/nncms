$(function() {
    scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
	$.blockUI.defaults.overlayCSS.opacity = '0.9';
	setWidth();

	$('body').keyup(function(e) {
		if (e.keyCode === 27) {
			$.unblockUI();
		}
	});

    if($('input.text').length > 0) {
        $('input.text').toggleVal();
    }

    $('.library-list a.video-play').click(function() {    
        $.blockUI({ 
            message: $('#lightbox-play-video')
        });
        return false;
    });
    
    $('#library-video-list ul li').hover(function() {
        var videoWrapWidth = $('#library-video-list ul').width();
        var index = $(this).index();
        var rowItem = parseInt(videoWrapWidth/114, 10);  //114 = 影片寬度 + margin-right
        var row = parseInt(index/rowItem, 10);

        if(1 == row%3) {
            $(this).children('.video-tip').css('top', '-110px');
			$(this).children('.tip-arrow').html('<img src="images/bubble_arrow_middle.png" alt="" />');
        }
        if(2 == row%3) {
            $(this).children('.video-tip').css('top', '-220px');
			$(this).children('.tip-arrow').html('<img src="images/bubble_arrow_bottom.png" alt="" />');
        }
    });

	$('#library-video-list a.video-del').click(function() {
        $.blockUI.defaults.overlayCSS.opacity = '0.9';
        $.blockUI({ 
            message: $('#delete-prompt')
        });
        $('.blockOverlay').height($(window).height() - 45);
		return false;
	});
	$('#delete-prompt .btn-del').click(function() {
		$.unblockUI();
		$('#overlay-s .overlay-middle').html('Saving...');
        $('#overlay-s').fadeIn();
        setTimeout(function() {
            $('#overlay-s').hide();
            $('#overlay-s .overlay-middle').html('Changes were saved successfully');
            $('#overlay-s').fadeIn().delay(3000).fadeOut();
        }, 3000);
        return false;
	});

    $('.unblock, .btn-close, .btn-cancel, .btn-no').click(function() {
        $.unblockUI();
        return false;
    });
	
	/* Window Resize */
	$(window).resize(function(){
		setWidth();
		scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
	});
});

function setWidth() {
	var titleWidth = $('#title-func').width();
	var rowItem = parseInt($('.video-list').width()/114, 10);
	var titleBtnPosition = rowItem * 114 - 14 - 118;
	
	if($('.no-video').length > 0) {
		$('#title-func .library-add-video p.text span .text').width(titleWidth - 140);
	} else {
		$('#title-func .library-add-video p.text span .text').width(titleBtnPosition);
	}
}
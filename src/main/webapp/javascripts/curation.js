$(function() {
    $('#cur-uploads .no-video .btns').click(function() {
        $.blockUI({ 
            message: $('#lightbox-upload-video')
        });
        return false;
    });

    $('.lightbox-upload-video .radio-list a').click(function() {
        $('.lightbox-upload-video .radio-list').children('span').removeClass('on');
        $(this).parent('span').addClass('on');
    });
    $('.lightbox-upload-video .radio-list a.radio-upload').click(function() {
        $('.lightbox-upload-video .upload-func p.upload').show();
        $('.lightbox-upload-video .upload-func p.img-url').hide();
    });
    $('.lightbox-upload-video .radio-list a.radio-url').click(function() {
        $('.lightbox-upload-video .upload-func p.img-url').show();
        $('.lightbox-upload-video .upload-func p.upload').hide();
    });

    $('.lightbox-upload-video #lightboxUploadForm').submit(function() {
        $.unblockUI();
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-uploads').parent().parent().addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-uploads').removeClass('hide');
        $('#cur-uploads .no-video').addClass('hide');
        $('#cur-uploads .result-list').removeClass('hide');
        return false;
    });

    $('.unblock, .btn-close').click(function() {
        $.unblockUI();
        return false;
    });

    $('.yt-category li a').not('.yt-category li.last a').click(function() {
        var showBlock = $(this).attr('href').split('#');

        $('.yt-category li').removeClass('on');
        $(this).parent().addClass('on');
        $('#cur-youtube .result-list').addClass('hide');
        $('#' + showBlock[1]).removeClass('hide');
		return false;
    });

    $('#epcurate-curation ul.tabs li a').click(function() {
        var showBlock = $(this).attr('href').split('#');
    
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $(this).parent().parent().addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#' + showBlock[1]).removeClass('hide');
		return false;
    });

    $('#cur-library .btns').click(function() {
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-add').parent().parent().addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-add').removeClass('hide');
		return false;
    });

    $('#cur-add .btns').click(function() {
        $('#epcurate-curation ul.tabs li').removeClass('on');
        $('#epcurate-curation ul.tabs li a.cur-library').parent().parent().addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-library').removeClass('hide');
        $('#cur-library .no-video').addClass('hide');
        $('#cur-library .result-list').removeClass('hide');
		return false;
    });

    $('#cur-edit .edit-time .btn-wrap .btn-edit').click(function() {
        $('#cur-edit p.time').removeClass('disable');
        $('#cur-edit input.time').removeAttr('disabled');
        $('#cur-edit .btn-wrap .btns').removeClass('hide');
        $('#cur-edit .btn-wrap .btn-edit').addClass('hide');
		return false;
    });

    $('#cur-edit .edit-time .btn-wrap .btn-cancel, #cur-edit .btn-wrap .btn-done').click(function() {
        $('#cur-edit p.time').addClass('disable');
        $('#cur-edit input.time').attr('disabled', 'disabled');
        $('#cur-edit .btn-wrap .btns').addClass('hide');
        $('#cur-edit .btn-wrap .btn-edit').removeClass('hide');
		return false;
    });

	$('#cur-edit .edit-title .btn-edit').click(function() {
        $('#cur-edit .edit-title').removeClass('disable');
        $('#cur-edit .edit-title .btn-container .btns, #cur-edit .edit-title .btn-container .btn-del').removeClass('hide');
        $('#cur-edit .edit-title .btn-container .btn-edit').addClass('hide');
		return false;
    });


	$('#cur-edit .edit-title .radio-bgcolor').click(function() {
		if (!$('#cur-edit .edit-title').hasClass('disable')) {
			$('#cur-edit .edit-title .radio-bgcolor').parent().addClass('on');
			$('#cur-edit .edit-title .radio-bgimg').parent().removeClass('on');
			$('#cur-edit .background-container .bg-color').removeClass('hide');
			$('#cur-edit .background-container .bg-img').addClass('hide');
		}
		return false;
	});
	$('#cur-edit .edit-title .radio-bgimg').click(function() {
		if (!$('#cur-edit .edit-title').hasClass('disable')) {
			$('#cur-edit .edit-title .radio-bgcolor').parent().removeClass('on');
			$('#cur-edit .edit-title .radio-bgimg').parent().addClass('on');
			$('#cur-edit .background-container .bg-color').addClass('hide');
			$('#cur-edit .background-container .bg-img').removeClass('hide');
		}
		return false;
	});

	$('#storyboard .storyboard-list ul li .title a').click(function() {
        $('#epcurate-curation ul.tabs li').removeClass('on');
		$('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
		$('#cur-edit .edit-time').addClass('hide');
		$('#cur-edit .edit-title').removeClass('hide');
		$('#cur-edit .edit-title').removeClass('disable');
		return false;
	});

	$('#storyboard .storyboard-list ul li .hover-func a.video-play').click(function() {
        $('#epcurate-curation ul.tabs li').removeClass('on');
		$('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');		
		$('#cur-edit .edit-title').addClass('hide');
		$('#cur-edit .edit-time').removeClass('hide');
		return false;
	});

	$('#storyboard .storyboard-list ul li .hover-func a.begin-title, #storyboard .storyboard-list ul li .hover-func a.end-title').click(function() {
        $('#epcurate-curation ul.tabs li').removeClass('on');
		$('#epcurate-curation ul.tabs li a.cur-add').parent().parent().removeClass('last');
        $('#epcurate-curation ul.tabs li a.cur-edit').parent().parent().removeClass('hide').addClass('on');
        $('#epcurate-curation .tab-content').addClass('hide');
        $('#cur-edit').removeClass('hide');
		$('#cur-edit .edit-time').addClass('hide');
		$('#cur-edit .edit-title').removeClass('hide');
		$('#cur-edit .edit-title').addClass('disable');
		return false;
	});
});
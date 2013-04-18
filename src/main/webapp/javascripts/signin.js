$(function () {

	var mms = new Date().getTime();
	
	// signup 
	$(document).on('click', '#sign-up', function () {
		$(".msg-error").hide();
        $("#signup-layer").fadeIn(400);
    });

	$(document).on('click', '.btn-fb', function () {
		$(".msg-error").hide();
		//log ('redirect to facebook login! bye');
		$.cookie ("fb-return-hash", location.hash);
		seamless_exit ('/playerAPI/fbLogin');
    });

  
	function seamless_exit (url){
		window.onbeforeunload = undefined;
		if (url.match (/^\//))
			window.location.href = location.protocol + '//' + location.host + url;
		else
			window.location.href = url;
	}

	$("#btn-signup-close, #signup-cancel").on("click",function() {
		$("#signup-layer").hide();
 	});
	
	$("#signup-checkbox").on("click",function() {
    	$(this).toggleClass("on");
  	});
	
	$("#signup-create").on("click",function() {
		
		showProcessingOverlay();
		
		var chk_email = $('#su_email').val(); 	
		var su_pass = $('#su_password').val(); 	
		var su_pass_re = $('#su_password_re').val(); 	
		var su_user = $('#su_user').val();
		
		
		if( $('#su_user').val()== $('#su_user').attr("defvalue") || $('#su_password').val()== $('#su_password').attr("defvalue")){
			//alert( "Please fill your data!!" )
            $("#signup-layer .msg-error").text(nn._(['signin', 'errMsg','Please fill your data!'])).show();
            $('#overlay-s').fadeOut();
			return false;
		}
		
        pattern = /^[\w\-]+(\.[\w\-]+)*@([\w\-]+\.)+[a-zA-Z]{2,7}$/;
		if( !$("#signup-checkbox").hasClass("on") ){
			//alert("Please click agree !!");
	        $("#signup-layer .msg-error").text(nn._(['signin', 'errMsg','Please accept the agreements below.'])).show();
            $('#overlay-s').fadeOut();
			return false ;
		}
        if (!pattern.test(chk_email)) {
            //alert('Email format error!');
	        $("#signup-layer .msg-error").text(nn._(['signin', 'errMsg','Email format error!'])).show();
            $('#overlay-s').fadeOut();
            return false;
        }		
        if (su_pass != su_pass_re) {
            //alert('Passwrod not match!!');
	        $("#signup-layer .msg-error").text(nn._(['signin', 'errMsg','The two passwords you entered do not match.'])).show();
            $('#overlay-s').fadeOut();
            return false;
        }		
        if (su_pass.length < 6 || su_pass.length > 16 ) {
            //alert('Passwrod Enter 8-16 English letters ,numbers or low line!!');
	        $("#signup-layer .msg-error").text(nn._(['signin', 'errMsg','Please input 6-16 characters in password.'])).show();
            $('#overlay-s').fadeOut();
            return false;
        }
        
        var strESC = /[!$%^&*()+|~=`{}\[\]:";'#@%<>?,.\/]/ ;
        //var num_regexp = 
		
		//alert(strESC.test(su_user));
		
        if ( strESC.test(su_user) ) {
            //alert('Passwrod Enter 8-16 English letters ,numbers or low line!!');
	        $("#signup-layer .msg-error").text(nn._(['signin', 'errMsg','Only letters, numbers or low line are allowed.'])).show();
            $('#overlay-s').fadeOut();
            return false;
        }
        
        if (su_user.length < 6 || su_user.length > 16 ) {
            //alert('Passwrod Enter 8-16 English letters ,numbers or low line!!');
	        $("#signup-layer .msg-error").text(nn._(['signin', 'errMsg','Please input 6 to 16 characters in username.'])).show();
            $('#overlay-s').fadeOut();
            return false;
        }
        
        
        
        
    
			var gurl = "/playerAPI/signup"; //?email="+chk_email+"&rx=g"+mms+"&v=32";
			
			
			var posting = $.post( gurl, { 'email': chk_email, 'name': su_user, 'password':su_pass, 'rx':"s"+mms, 'v':32 } );
			/* Put the results in a div */
			posting.done(function( result ) {
				
				var ret = result.split("	");
				//alert( ret[0] + "**" + ret[1] )
				if( ret[0] === "0" ){
					location.href = "./";
				}else{
					if( ret[0] === "202" ){
						//alert( "Error : Email already exist!!" );
				        $("#signup-layer .msg-error").text(nn._(['signin', 'errMsg','This email has been used.'])).show();
			            $('#overlay-s').fadeOut();
						
					}else{
						//alert( "Error : " + ret[1] );
				        $("#signup-layer .msg-error").text(nn._(['signin', 'errMsg', ret[1] ])).show();
			            $('#overlay-s').fadeOut();
					}
					
					
				}
	
			});		
	    		
  	});
	
	
	// forget password
     $('#btn-forgot-password').on("click", function () {
     	$(".msg-error").hide();
		$("#forgot-password-layer").fadeIn(400);
		$(".forgot-password-form").show();
		$(".forgot-password-msg").hide();
  	});
  	
     $('#btn-reset-password').on("click", function () {
     	showProcessingOverlay();
		//$('#fg_email').val( $.trim($('#fg_email').val()) );
		var chk_email = $('#fg_email').val();     	
        pattern = /^[\w\-]+(\.[\w\-]+)*@([\w\-]+\.)+[a-zA-Z]{2,7}$/;
        if (!pattern.test(chk_email)) {
            //alert('Email format error!');
            $("#forgot-password-layer .msg-error").text(nn._(['signin', 'errMsg','Email format error!'])).show();
            $('#overlay-s').fadeOut();
            return false;
        }
		var gurl = "/playerAPI/forgotpwd?email="+chk_email+"&rx=g"+mms+"&v=32";
		$.get(gurl, function(result){
			var ret = result.split("	");
			if( ret[0] === "0" ){
			  $("#forgot-password-form").hide();
			  $("#forgot-password-msg").show();
			  
			}else{
				$("#forgot-password-layer .msg-error").text("Error : " + nn._(['signin', 'errMsg',  ret[1]])).show();
				//alert( "Error : " + ret[1] );
			}
			$('#overlay-s').fadeOut();
		  });
		 
  	});

    $('#btn-forgot-password-close, .back-to-sign').on("click", function () {
		$("#fg_email").val($("#fg_email").attr("defvalue")) ;
		$("#forgot-password-form").show();
		$("#forgot-password-msg").hide();
		$("#forgot-password-layer").hide();
 	});
  

	
	// login 
     $('#btn_sign_in').on("click", function () {
     	showProcessingOverlay();
    	$('#si_email').val( $.trim($('#si_email').val()) );
    	$('#si_password').val( $.trim($('#si_password').val()) );
		var chk_email = $('#si_email').val();
		var chk_pass = $('#si_password').val();
            pattern = /^[\w\-]+(\.[\w\-]+)*@([\w\-]+\.)+[a-zA-Z]{2,7}$/;
        if ('' === chk_email) {
            $(".msg-error").text(nn._(['signin', 'errMsg','Please input email!'])).show();
            $('#overlay-s').fadeOut();
            return false;
        }
        if (!pattern.test(chk_email)) {
            $(".msg-error").text(nn._(['signin', 'errMsg','Email format error!'])).show();
            $('#overlay-s').fadeOut();
            return false;
        }
        if ('' === chk_pass) {
            $(".msg-error").text(nn._(['signin', 'errMsg','Please input password!'])).show();
            $('#overlay-s').fadeOut();
            return false;
        }
        var qrystring = "email=" + chk_email + "&password=" + chk_pass ;
        
        nn.api('POST', CMS_CONF.API('/api/login'), qrystring, function (user) {
            if (!user || !user.id) {
	            $(".msg-error").text(nn._(['signin', 'errMsg','Email and password do not match, please try again.'])).show();
            } else {
                location.href = './';
            }
            $('#overlay-s').fadeOut();
            return false;
        });
        $('#overlay-s').fadeOut();
        return false;
    });


     $('#si_email, #fg_email, #su_user, #su_email').on("focus", function () {
     	$(".msg-error").hide();
    	if( $(this).val() == $(this).attr("defvalue") ){
    		$(this).val("") ;		
    	}
    });
    
     $('#si_email, #fg_email, #su_user, #su_email').focusout( function () {
     	$(this).val( $.trim($(this).val()));
    	if( $(this).val() == "" ){
    		$(this).val($(this).attr("defvalue")) ;		
    	}
    });
    
    
     $('#si_passwordfak, #su_passwordfak, #su_password_refak').on("focus", function () {
     	$(".msg-error").hide();
		$(this).hide();
		var actID = "#" + $(this).attr('id').replace("fak","");
		$(actID).show();
		$(actID).focus();
    });
    
     $('#si_password, #su_password, #su_password_re').focusout( function () {
     	$(this).val( $.trim($(this).val()));
     	var actID = "#" + $(this).attr('id') + "fak" ;
    	if( $(this).val() == "" ){
    		$(this).hide();
			$(actID).show();
    	}
    });

});

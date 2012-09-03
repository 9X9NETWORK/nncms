// JavaScript Document
function log() {
}
$(function() {
    SetEllipsis();
    autoWidth();
    autoHeight();

  /* Dropdown Menu */
  $("body").click(function() {
    $(".dropdown").hide();
	$(".dropdown").parents("li").removeClass("on");
  });
  
  $(".dropdown").click(function(event) {
    event.stopPropagation();
  });
  
  function ShowDropdown(btn) {
    $(".dropdown").hide();
	$(btn).addClass("on");
	str = $(btn).attr("id");
	if (str.search("btn") == 0) {
	  str = $(btn).attr("id").slice(4);
	}
	id="#"+str+"-dropdown";
	$(id).show();
  }
  
  // browse dropdown //
  $("#browse").click(function(event) {
	ShowDropdown("#browse");
	event.stopPropagation();
  });
  
  $("#browse-dropdown li").click(function() {
	$("#browse").removeClass("on");
    $("#browse-dropdown").hide();
  });
  
  // profile dropdown //
  $("#btn-profile").click(function(event) {
	ShowDropdown("#btn-profile");
	event.stopPropagation();
  });
  
  $("#profile-dropdown li").click(function() {
	$("#btn-profile").removeClass("on");
    $("#profile-dropdown").hide();
  });

  // setting-category dropdown //
  $("#btn-setting-category").click(function(event) {
	ShowDropdown("#btn-setting-category");
	event.stopPropagation();
  });
  
  $("#setting-category-dropdown li").click(function() {
	$("#btn-setting-category").removeClass("on");
    $("#setting-category-dropdown").hide();
  });
  
    /* Footer Control */
    $("#footer-control").click(function() {
        if ($(this).hasClass("on")) {
            $(this).removeClass("on");
            $("#footer").slideToggle();
        } else {
            $(this).addClass("on");
            $("#footer").slideToggle();
        }
    });
  
  
  /* Curator Bubble */
  $("#curator-list li").mouseover(function() {
    $("#curator-list li").removeClass("anchor").addClass("fade");
	$(this).removeClass("fade").addClass("anchor");
  }).mouseout(function() {
	$("#curator-list li").removeClass("fade");
  });
  
  $("#curator-list img").mouseover(function() {
    bloc=$(this).offset();
	bl = bloc.left-4;
    $("#curator-bubble").show().css({"left":bl});	
	SetEllipsis();
  }).mouseout(function() {
	$("#curator-bubble").hide();
  });
  
  $("#curator-bubble").mouseover(function() {
    $(this).show();
	$("#curator-list li").addClass("fade");
  }).mouseout(function() {
	$(this).hide();
	$("#curator-list li").removeClass("fade");
  });
  
  /* Input */
  InputHilite();
  SetInput("Search", "#search"); //Search input 
  
  function SetInput(hint, input) {
	field = input + " .textfield";
    $(field).focus(function() {
	  txt = $(this).val();
	  if (txt == hint) {
        $(this).val("");
	  }
    }).blur(function() {
	  txt = $(this).val();
	  if (txt == "") {
	    $(this).val(hint);
	  }
    });
  }
  
  function SetPwInput(field) {
    $(field).children(".textfield").click(function() {
	  $(field).children("span").hide();
    }).blur(function() {
	  txt = $(field).children(".textfield").val();
	  if (txt == "") {
	    $(field).children("span").show();
	  }
    });
  }
  
  function InputHilite() {
    $(".textfield").focus(function(){
	  $(this).parent().addClass("on");
	}).blur(function() {
	  $(this).parent().removeClass("on");
	});
  }
     
  /* Ellipsis */
  function SetEllipsis() {
    $(".ellipsis").ellipsis();
  }

    /* Window Resize */
    $(window).resize(function(){
        autoWidth();
        autoHeight();
        scrollbar("#content-main", "#content-main-wrap", "#main-wrap-slider");
        SetEllipsis();
    });
});
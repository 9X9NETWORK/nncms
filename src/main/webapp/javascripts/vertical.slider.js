/* scrollbar ("#faq-content", "#faq-list", "#faq-slider"); */

function scrollbar (outer, inner, sliderwrap)
  {
  /* change the main div to overflow-hidden as we can use the slider now */
  $(outer).css ('overflow', 'hidden');

  /* compare the height of the scroll content to the scroll pane to see if we need a scrollbar */
  var difference = $(inner).height() - $(outer).height();

  if (difference > 0)
    {
    log ('slider on: ' + sliderwrap);
    $(sliderwrap).show();
    var proportion = difference / $(inner).height();

    /* set the proportional height - round it to make sure everything adds up correctly later on */
    var handleHeight = Math.round ((1-proportion)*$(outer).height());
    handleHeight -= handleHeight % 2; 

    /* set up the slider */

    $(sliderwrap + ' .slider-vertical').slider (
      {
      orientation: 'vertical',
      min: 0,
      max: 100,
      value: 100,
      slide: function (event, ui)
        {
        /* scroll content when slide is dragged */
        var topValue = -((100-ui.value)*difference/100);
        /* move the top up (negative value) by the percentage the slider has been moved times the difference in height */
        $(inner).css ({ top: topValue });
        },
      change: function (event, ui)
        {
        /* scroll content when the slider is changed by a click outside the handle or by the mousewheel */
        var topValue = -((100-ui.value)*difference/100);
        /* move the top up (negative value) by the percentage the slider has been moved times the difference in height */
        $(inner).css ({ top: topValue });
        }
      });

    /* set the handle height and bottom margin so the middle of the handle is in line with the slider */
    $(sliderwrap + " .ui-slider-handle").css ({ height: handleHeight, 'margin-bottom': -0.5 * handleHeight });

    /* remember the original slider height ONCE, and always used the saved value */
    var origSliderHeight = $(sliderwrap).attr ("data-orig-slider-height");
    if (!origSliderHeight)
      {
      origSliderHeight = $(sliderwrap + " .slider-vertical").height();
      $(sliderwrap).attr ("data-orig-slider-height", origSliderHeight);
      }

    /* the height through which the handle can move needs to be the original height minus the handle height */
    var sliderHeight = origSliderHeight - handleHeight;

    /* so the slider needs to have both top and bottom margins equal to half the difference */
    var sliderMargin =  (origSliderHeight - sliderHeight) * 0.5;

    $(sliderwrap + " .ui-slider").css ({ height: sliderHeight, 'margin-top': sliderMargin });
    } 
  else
    {
    log ('slider off: ' + sliderwrap);
    $(sliderwrap).hide();
    }

  $(sliderwrap + " .ui-slider").unbind ('click');
  $(sliderwrap + " .ui-slider").click (function (event) { event.stopPropagation(); });
   
  $(sliderwrap + " .slider-wrap").unbind ('click');
  $(sliderwrap + " .slider-wrap").click (function (event)
    {
    /* clicks on the wrap outside the slider range */
    var offsetTop = $(this).offset().top;
    /* find the click point, subtract the offset, and calculate percentage of the slider clicked */
    var clickValue = (event.pageY-offsetTop) * 100 / $(this).height();
    $(sliderwrap + " .slider-vertical").slider ("value", 100-clickValue);
    }); 
	 
  $(outer + ", " + sliderwrap + " .slider-wrap").unbind ('mousewheel');
  $(outer + ", " + sliderwrap + " .slider-wrap").mousewheel (function (event, delta)
    {
    var speed = 5;
    var sliderVal = $(sliderwrap + " .slider-vertical").slider ("value");
    sliderVal += (delta*speed);
    $(sliderwrap + " .slider-vertical").slider ("value", sliderVal);
    event.preventDefault();
    });
  }
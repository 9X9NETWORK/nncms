/*jslint unparam: true, sloppy: true, vars: true */
/*global $, CMS_CONF */
// scrollbar('#storyboard-wrap', '#storyboard-list', '#storyboard-slider');

function scrollbar(outer, inner, sliderwrap) {
    // change the main div to overflow-hidden as we can use the slider now
    //$(outer).css('overflow', 'hidden');

    // compare the height of the scroll content to the scroll pane to see if we need a scrollbar
    var difference = $(inner).width() - $(outer).width();

    if (difference > 0) {
        $(sliderwrap).show();
        //var proportion = difference / $(inner).width();

        // set the proportional height - round it to make sure everything adds up correctly later on
        //var handleWidth = $(outer).width() - (proportion * $(outer).width());
        var handleWidth = 50;

        // set up the slider
        $(sliderwrap + ' .slider-h').slider({
            orientation: 'horizontal',
            min: 0,
            max: 100,
            value: 0,
            slide: function (event, ui) {
                // scroll content when slide is dragged
                var leftValue = -(ui.value / 100 * difference);
                // move the top up (negative value) by the percentage the slider has been moved times the difference in height
                $(inner).css({ left: leftValue });
            },
            change: function (event, ui) {
                // scroll content when the slider is changed by a click outside the handle or by the mousewheel
                var leftValue = -(ui.value / 100 * difference);
                // move the top up (negative value) by the percentage the slider has been moved times the difference in height
                $(inner).css({ left: leftValue });
            }
        });

        // set the handle height and bottom margin so the middle of the handle is in line with the slider
        $(sliderwrap + ' .ui-slider-handle').css({ width: handleWidth });

        // remember the original slider height ONCE, and always used the saved value
        var origSliderWidth = $(sliderwrap).attr('data-orig-slider-width');
        if (!origSliderWidth) {
            origSliderWidth = $(sliderwrap + ' .slider-h').width();
            $(sliderwrap).attr('data-orig-slider-width', origSliderWidth);
        }

        // the height through which the handle can move needs to be the original height minus the handle height
        var sliderWidth = origSliderWidth - handleWidth;

        // so the slider needs to have both top and bottom margins equal to half the difference
        //var sliderMargin = (origSliderWidth - sliderWidth) * 0.5;

        $(sliderwrap + ' .ui-slider').css({ width: sliderWidth });
    } else {
        $(sliderwrap).hide();
    }

    $(sliderwrap + ' .ui-slider').unbind('click');
    $(sliderwrap + ' .ui-slider').click(function (event) { event.stopPropagation(); });
/*
    $(outer + ', ' + sliderwrap + ' .slider-wrap').unbind('click');
    $(outer + ', ' + sliderwrap + ' .slider-wrap').click(function (event) {
        // clicks on the wrap outside the slider range
        var offsetLeft = $(this).offset().left;
        // find the click point, subtract the offset, and calculate percentage of the slider clicked
        var clickValue = (event.pageX - offsetLeft) * 100 / $(this).width();
        $(sliderwrap + ' .slider-h').slider('value', 100 - clickValue);
    }); 
*/
    $(outer + ', ' + sliderwrap + ' .slider-wrap').unbind('mousewheel');
    $(outer + ', ' + sliderwrap + ' .slider-wrap').mousewheel(function (event, delta) {
        var speed = 5;
        var sliderVal = $(sliderwrap + ' .slider-h').slider('value');
        sliderVal += (delta * speed);
        $(sliderwrap + ' .slider-h').slider('value', sliderVal);
        event.preventDefault();
    });
}
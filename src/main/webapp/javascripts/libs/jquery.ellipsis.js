/*jslint sloppy: true */
/*global jQuery */

(function ($) {
    $.fn.ellipsis = function () {
        var el, text, multiline, t, height, width, func;
        return this.each(function () {
            el = $(this);
            if ('hidden' === el.css('overflow')) {
                text = el.html();
                multiline = el.hasClass('multiline');
                t = $(this.cloneNode(true))
                    .hide()
                    .css('position', 'absolute')
                    .css('overflow', 'visible')
                    .width(multiline ? el.width() : 'auto')
                    .height(multiline ? 'auto' : el.height());
                el.after(t);
                height = function () {
                    return t.height() > el.height();
                };
                width = function () {
                    return t.width() > el.width();
                };
                func = multiline ? height : width;
                while (text.length > 0 && func()) {
                    text = text.substr(0, text.length - 1);
                    t.html(text + '...');
                }
                el.html(t.html());
                t.remove();
            }
        });
    };
}(jQuery));
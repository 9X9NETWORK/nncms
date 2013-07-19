/*!
 *
 * Revised by marshsu@gmail.com added countDown flag for count down and count up at 2013/07/19
 * Revised by chihwen@doubleservice.com added multibyte counter and clear feature.
 * jquery.charcounter.js version 1.3
 * requires jQuery version 1.2 or higher
 *
 * Copyright (c) 2007 Tom Deater (http://www.tomdeater.com)
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * predefine global variables: jQuery window escape setTimeout
 * JSLint Directive Options: jslint eqeq: true, plusplus: true, regexp: true, sloppy: true
 *
 */

(function ($) {
    /**
     * attaches a character counter to each textarea element in the jQuery object
     * usage: $("#myTextArea").charCounter(max, settings);
     */
    $.fn.charCounter = function (max, settings) {
        max = max || 100;
        settings = $.extend({
            container: "<span></span>",
            classname: "charcounter",
            format: "(%1 characters remaining)",
            pulse: true,
            delay: 0,
            multibyte: false,
            cntdivide: false,
            clear: true,
            countDown: true
        }, settings);
        settings.cntdivide = (settings.multibyte && settings.cntdivide) ? true : false;
        var p, timeout;

        function mb_strwidth(str) {
            var strlen, rtnlen, revcnt, c, cc, i;
            strlen = str.length;
            rtnlen = revcnt = 0;
            if (strlen > 0) {
                for (i = 0; i < strlen; i++) {
                    c = escape(str.charAt(i));
                    if ('%' == c.charAt(0)) {
                        cc = c.charAt(1);
                        if ('A' == cc || 'u' == cc) {
                            rtnlen += 2;
                            revcnt += 1;
                        } else {
                            rtnlen += 1;
                        }
                    } else {
                        rtnlen += 1;
                    }
                }
            }
            if (settings.cntdivide) {
                rtnlen = rtnlen / 2;
            }
            return [rtnlen, revcnt];
        }

        function pulse(el, again) {
            if (p) {
                window.clearTimeout(p);
                p = null;
            }
            el.animate({ opacity: 0.1 }, 100, function () {
                $(this).animate({ opacity: 1.0 }, 100);
            });
            if (again) {
                p = window.setTimeout(function () { pulse(el); }, 200);
            }
        }

        function count(el, container) {
            el = $(el);
            var tmp, len, rev, to, retLen;
            tmp = mb_strwidth(el.val());
            len = (settings.multibyte) ? tmp[0] : el.val().length;
            rev = (settings.multibyte) ? tmp[1] : 0;
            if (settings.clear && len > max) {
                to = (settings.cntdivide) ? (max * 2 - rev) : (max - rev);
                el.val(el.val().substring(0, to));
                if (settings.pulse && !p) {
                    pulse(container, true);
                }
            }
            if (settings.countDown) {
                retLen = max - len;
            } else {
                retLen = len;
            }
            if (settings.delay > 0) {
                if (timeout) {
                    window.clearTimeout(timeout);
                }
                timeout = window.setTimeout(function () {
                    container.html(settings.format.replace(/%1/, retLen));
                }, settings.delay);
            } else {
                container.html(settings.format.replace(/%1/, retLen));
            }
        }

        return this.each(function () {
            var container;
            if (!settings.container.match(/^<.+>$/)) {
                // use existing element to hold counter message
                container = $(settings.container);
            } else {
                // append element to hold counter message (clean up old element first)
                $(this).next("." + settings.classname).remove();
                container = $(settings.container).insertAfter(this).addClass(settings.classname);
            }
            $(this)
                .unbind(".charCounter")
                .bind("keydown.charCounter", function () { count(this, container); })
                .bind("keypress.charCounter", function () { count(this, container); })
                .bind("keyup.charCounter", function () { count(this, container); })
                .bind("focus.charCounter", function () { count(this, container); })
                .bind("mouseover.charCounter", function () { count(this, container); })
                .bind("mouseout.charCounter", function () { count(this, container); })
                .bind("paste.charCounter", function () {
                    var me = this;
                    setTimeout(function () { count(me, container); }, 10);
                });
            if (this.addEventListener) {
                this.addEventListener('input', function () { count(this, container); }, false);
            }
            count(this, container);
        });
    };
}(jQuery));
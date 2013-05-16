/**
 * 9x9 SDK (nn-sdk.js)
 *
 * Please refer to http://dev.teltel.com/louis/9x9-sdk-usage/ for usage
 * and more information.
 *
 * ChangeLog:
 *
 *   + 2012-08-23 v0.0.1 by Louis
 *     - first version
 *     - api(), log(), i18n()
 *
 *   + 2012-09-27 v0.0.2 by Louis
 *     - nn.on() multiple hook
 *     - nn.api() supports YouTube API
 *
 *   + 2012-10-01 v0.0.3 by Louis
 *     - nn.when()
 *     - disable ajax cache
 *
 *   + 2012-11-28 v0.0.4 by Louis
 *     - support multi-level language pack
 *
 *   + 2013-01-30 v0.0.5 by Louis
 *     - CORS cross domain support
 *
 *   + 2013-05-09 v0.0.6 by Louis
 *     - nn.api(): 'DELETE' workarround
 *     - CSS/JS loader (also load jQuery automatically when missing)
 *     - jQuery 1.9.1
 *
 * To download the latest release:
 *
 *   http://dev.teltel.com/louis/9x9-sdk-usage/js/release/latest/nn-sdk.js
 *
 * To download the latest development:
 *
 *   http://dev.teltel.com/louis/9x9-sdk/js/nn-sdk.js
 *
 * @author	Louis Jeng <louis.jeng@9x9.tv>
 */

var nn = { };

(function(nn) {

	nn.initialize = function(callback) {
		// NOTE: 'this' is denote 'nn' object itself, but not always does.

        var _init = function() {
            if (typeof $ == 'undefined') {
                return nn.log('nn: jQuery is still missing!', 'error');
            }
            nn.log('nn: jQuery is detected ' + $().jquery);
            var _dfd = $.Deferred();
            if (typeof callback == 'function') {
                _dfd.done(callback);
            }
            $(function() {
                nn.log('nn: initialized');
                _dfd.resolve();
            });
            return _dfd.promise();
        };
        if (typeof $ != 'undefined') {
            return _init();
        }
        nn.log('nn: jQuery is missing, but we can load it automatically.');
        nn.load(nn.jQueryUrl, _init);
	};

    nn.init = nn.initialize;
	
    nn.jQueryUrl = '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';

    nn.load = function(url, callback) {

        var head = document.getElementsByTagName('head')[0];

        // load css
        if (url.substr(-4, 4) == '.css') {

            var _dfd = $.Deferred();
            var css = document.createElement('link');
            css.type = "text/css";
            css.rel = "stylesheet";
            css.href = url;
            css.onload = function() {
                if (typeof callback == 'function') {
                    _dfd.done(callback);
                }
                _dfd.resolve();
            };
            nn.log('nn.load: load CSS from ' + url);
            head.appendChild(css);
            return _dfd.promise();

        } else {

            if (typeof $ != 'undefined') {
                // using jQuery
                nn.log('nn.load: load JS by jQuery ' + url);
                return $.getScript(url, callback);
            }
            // without using jQuery
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = url;
            script.onload = callback;
            nn.log('nn.load: load JS from ' + url);
            head.appendChild(script);
        }
    };

	nn.log = function(message, type) {
	
        var blackbird = function() { };
        
        if ((typeof window == 'undefined' || typeof window.console == 'undefined' || typeof window.console.log == 'undefined') &&
            (typeof console == 'undefined' || typeof console.log == 'undefined')) {
            
            return;
        }
        
		if (typeof type == 'undefined') {
			type = 'info';
		} else if (typeof nn.logTypes[type] == 'undefined') {
			return;
		}
		
		if (nn.logTypes[type]) {
			switch (type) {
				case 'info':
				if (typeof console.info == 'function') {
					console.info(message);
				} else if (typeof console.log == 'function') {
					console.log('[i] ' + message);
				}
				break;
				
				case 'warning':
				if (typeof console.warn == 'function') {
					console.warn(message);
				} else if (typeof console.log == 'function') {
					console.log('[-] ' + message);
				}
				break;
				
				case 'error':
				if (typeof console.error == 'function') {
					console.error(message);
				} else if (typeof console.log == 'function') {
					console.log('[!] ' + message);
				}
				break;
				
				case 'debug':
				if (typeof console.debug == 'function') {
					console.debug(message);
				} else if (typeof console.log == 'function') {
					console.log(message);
				}
				break;
				
				default:
			}
		}
	};
	
	nn.api = function(method, resourceURI, parameter, callback, dataType) {
		
		nn.log('nn.api: ' + method + ' "' + resourceURI + '"');
		
		if ($.inArray(method, ['PUT', 'GET', 'POST', 'DELETE', 'HEAD', 'OPTIONS']) == -1) {
			nn.log('nn.api: not supported method', 'warning');
			return;
		}
		
        var withCredentials = false;
        if (resourceURI.indexOf('gdata.youtube.com') < 0) {
            withCredentials = true;
        }

		var localParameter = null;
		var localCallback = null;
        var localDataType = 'json';
        
		if (typeof parameter == 'function') {
			localCallback = parameter;
            if (typeof callback == 'string') {
                localDataType = callback;
                nn.log('nn.api: dataType = ' + localDataType);
            }
		} else if (typeof parameter == 'object' || (typeof parameter == 'string' && 
                                                    $.inArray(parameter, [ 'xml', 'html', 'script', 'json', 'jsonp', 'text' ]) < 0)) {
            
			localParameter = parameter;
			if (typeof callback == 'function') {
				localCallback = callback;
                if (typeof dataType == 'string') {
                    localDataType = dataType;
                    nn.log('nn.api: dataType = ' + localDataType);
                }
            } else if (typeof callback == 'string') {
                    localDataType = callback;
                    nn.log('nn.api: dataType = ' + localDataType);
            }
		} else if (typeof parameter == 'string') {
            
            localDataType = parameter;
            nn.log('nn.api: dataType = ' + localDataType);
        }

		nn.log(localParameter, 'debug');
        
        // workaround
        if (method == 'DELETE' && localParameter) {
            nn.log('nn.api: workaround');
            var queryString = $.param(localParameter);
            var conjunction = resourceURI.indexOf('?') < 0 ? '?' : '&';
            resourceURI = [ resourceURI, queryString ].join(conjunction);
            localParameter = null;
        }
		
		var _dfd = $.ajax({
			'url':        resourceURI,
			'type':       method,
            'cache':      false,
			'data':       localParameter,
            'dataType':   localDataType,
			'statusCode': nn.apiHooks,
            'xhrFields': {
                'withCredentials': withCredentials
            },
			'success': function(data, textStatus, jqXHR) {
				nn.log('nn.api: HTTP ' + jqXHR.status + ' ' + jqXHR.statusText);
				nn.log('nn.api: textStatus = ' + textStatus, 'debug');
				nn.log(data, 'debug');
			},
			'error': function(jqXHR, textStatus) {
				nn.log('nn.api: ' + jqXHR.status + ' ' + jqXHR.statusText, 'warning');
				nn.log('nn.api: textStatus = ' + textStatus);
				nn.log('nn.api: responseText = ' + jqXHR.responseText);
			}
		});
        if (typeof localCallback == 'function') {
            
            _dfd.done(localCallback);
        }
		
		return _dfd.promise();
	};
    
    nn.when = function(promises) {
        
        var _dfd = $.Deferred();
        var count = promises.length;
        var countCommited = 0;
        
        if (!$.isArray(promises)) {
            nn.log('nn.when(): parameter error', 'error');
            _dfd.reject();
            return _dfd.promise();
        }
        
        nn.log('nn.when(): ' + count + ' promises');
        var resolved = true;
        
        $.each(promises, function(i, promise) {
            
            promise.done(function() {
                
                nn.log('nn.when(): promise ' + i + ' commited');
                countCommited++;
                
            }).fail(function() {
                
                nn.log('nn.when(): promise ' + i + ' not commited', 'warning');
                resolved = false;
                
            }).always(function() {
                
                count = count - 1;
                nn.log(count + ' promises left');
                if (count == 0) {
                    console.log('promises commited = ' + countCommited);
                    if (resolved) {
                        _dfd.resolve(countCommited);
                    } else {
                        _dfd.reject(countCommited);
                    }
                }
            });
        });
        
        return _dfd.promise();
    },
	
	nn.apiHooks = {
		200: function(jqXHR, textStatus) { },
		201: function(jqXHR, textStatus) { },
		400: function(jqXHR, textStatus) { },
		401: function(jqXHR, textStatus) { },
		403: function(jqXHR, textStatus) { },
		404: function(jqXHR, textStatus) { },
		500: function(jqXHR, textStatus) { }
	};
	
	nn.on = function(type, hook) {
        if ($.isArray(type)) {
            $.each(type, function(i, item) {
                nn.on(item, hook);
            });
		} else if (typeof nn.apiHooks[type] != 'undefined') {
			nn.log('nn.on: hook on [' + type + ']');
			nn.apiHooks[type] = hook;
		}
	};
	
	nn._ = function(orig, repl) {
		
		var result = '*FIX ME!*';
		
		if (typeof orig == 'string') {
			
			result = (typeof nn.langPack[orig] == 'string') ? nn.langPack[orig] : orig;
			
		} else if ($.isArray(orig) && orig.length > 0) {
            
            var digg = nn.langPack;
            while (orig.length > 1) {
                var piece = orig.shift();
                if (typeof digg[piece] != 'undefined') {
                    digg = digg[piece];
                }
            }
            orig = orig.shift();
            result = (typeof digg[orig] == 'string') ? digg[orig] : orig;
        }
		
		if ($.isArray(repl)) {
			for (var i = 0; i < repl.length; i++) {
				result = result.replace('{' + i + '}', repl[i]);
			}
		} else if (typeof repl == 'string') {
            result = result.replace('{0}', repl);
        }
		
		return result;
	};
	
    // TODO: pack is a url
	nn.i18n = function(pack) {
		nn.langPack = $.extend(nn.langPack, pack);
	};
	
	nn.langPack = { };
	
	nn.logTypes = {
		'info':    true, // turns log on/off separately
		'warning': true,
		'error':   true,
		'debug':   false
	};
    
    nn.debug = function(turnOn) {
        if (typeof turnOn == 'undefined') {
            return nn.logTypes['debug'];
        }
        if (turnOn) {
            nn.logTypes['debug'] = true;
        } else {
            nn.logTypes['debug'] = false;
        }
    };
	
	nn.getFileTypeByName = function(name) {
		
		if (typeof name == 'undefined' || name == null || name == '' || name.indexOf('.') <= 0) {
			return '';
		}
		return name.substr(name.indexOf('.'));
	};
	
})(nn);


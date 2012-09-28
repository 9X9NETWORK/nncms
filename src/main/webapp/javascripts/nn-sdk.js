/**
 * 9x9 SDK (nn-sdk.js)
 *
 * Please refer to http://202.5.224.193/louis/9x9-sdk-usage/ for usage
 *
 * @author	Louis Jeng <louis.jeng@9x9.tv>
 * @version	0.0.1
 * @since	2012-08-23
 */

var nn = { };

(function(nn) {
	
	nn.initialize = function() {
		// NOTE: 'this' is denote 'nn' object itself, but not always.
		
		nn.log('nn: initialized');
	};
	
	nn.log = function(message, type) {
		
		if (!window.console || !window.console.log || !console || !console.log)
			return;


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
					console.log('[v] ' + message);
				}
				break;
				
				default:
			}
		}
	};
	
	nn.api = function(method, resourceURI, parameter, callback) {
		
		nn.log('nn.api: ' + method + ' "' + resourceURI + '"');
		nn.log(parameter, 'debug');
		
		if ($.inArray(method, ['PUT', 'GET', 'POST', 'DELETE']) == -1) {
			nn.log('nn.api: not supported method', 'warning');
			return;
		}
		
		var localParameter = null;
		var localCallback = null;
		
		if (typeof parameter == 'function') {
			localCallback = parameter;
		} else if (typeof parameter != 'undefined') {
			localParameter = parameter;
			if (typeof callback == 'function')
				localCallback = callback;
		}
		
		var jqAjax = $.ajax({
			'url':        resourceURI,
			'type':       method,
			'data':       localParameter,
			'statusCode': nn.apiHooks,
			'success': function(data, textStatus, jqXHR) {
				nn.log('nn.api: HTTP ' + jqXHR.status + ' ' + jqXHR.statusText);
				nn.log('nn.api: textStatus = ' + textStatus, 'debug');
				nn.log(data, 'debug');
				if (typeof localCallback == 'function') {
					localCallback(data);
				}
			},
			'error': function(jqXHR, textStatus) {
				nn.log('nn.api: ' + jqXHR.status + ' ' + jqXHR.statusText, 'warning');
				nn.log('nn.api: textStatus = ' + textStatus);
				nn.log('nn.api: responseText = ' + jqXHR.responseText);
			}
		});
		
		return jqAjax.promise();
	};
	
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
		if (typeof nn.apiHooks[type] != 'undefined') {
			nn.log('nn.on: hook on [' + type + ']');
			nn.apiHooks[type] = hook;
		}
	};
	
	nn._ = function(orig, repl) {
		
		var result = '';
		
		if (typeof orig == 'string') {
			
			result = (typeof nn.langPack[orig] == 'string') ? nn.langPack[orig] : orig;
			
		}
		
		if ($.isArray(repl)) {
			for (var i = 0; i < repl.length; i++) {
				result = result.replace('{' + i + '}', repl[i]);
			}
		}
		
		return result;
	};
	
	nn.i18n = function(pack) {
		nn.langPack = $.extend(nn.langPack, pack);
	};
	
	nn.langPack = { };
	
	nn.logTypes = {
		'info':    true, // turns log on/off separately
		'warning': true,
		'error':   true,
		'debug':   true
	};
	
	nn.getFileTypeByName = function(name) {
		
		if (typeof name == 'undefined' || name == null || name == '' || name.indexOf('.') <= 0) {
			return '';
		}
		return name.substr(name.indexOf('.'));
	};
	
})(nn);


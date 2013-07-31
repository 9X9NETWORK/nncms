/**
 * @file Client locale utility.
 * @author Yi-Fan Liao <yifan.9x9@gmail.com>
 */
(function(cms) {

    // var ipServiceUrl = "http://api.hostip.info/country.php";
    // var ipServiceUrl = "freegeoip.net/{format}/{ip_or_hostname}";

        // Request data format.
    var dataFormat = "json",
        // Local IP address.
        ipAddress = "",
        // IP lookup service url
        ipServiceUrl = "http://freegeoip.net/" + dataFormat,
        // Cached locale data.
        localeCache = {
            // "ip": "114.32.175.163",
            // "country_code": "TW",
            // "country_name": "Taiwan",
            // "region_code": "03",
            // "region_name": "T'ai-pei",
            // "city": "Taipei",
            // "zipcode": "",
            // "latitude": 25.0392,
            // "longitude": 121.525,
            // "metro_code": "",
            // "areacode": ""
        };

    // Set localeCache and global user data.
    var setLocale = function(data) {
        
        localeCache = {
            ip: data.ip,
            country_code: data.country_code,
            country_name: data.country_name,
            region_code: data.region_code,
            region_name: data.region_name,
            city: data.city,
            zipcode: data.zipcode,
            latitude: data.latitude,
            longitude: data.longitude,
            metro_code: data.metro_code,
            areacode: data.areacode
        };

        cms.global.USER_DATA.locale = localeCache;
    };

    cms.localeUtility = cms.localeUtility || {
        /**
         * Get client locale information using ip lookup provided by specified service url.
         * @returns {object} JQuery promise.
         */
        getLocale: function() {
            return $.ajax({
                url: ipServiceUrl,
                cache: true,
                beforeSend: function () {
                    if (!$.isEmptyObject(localeCache)) {
                        setLocale(localeCache);
                        return false;
                    }
                    return true;
                },
                complete: function (jqXHR, textStatus) {
                    setLocale(jqXHR.responseJSON);
                }
            });
        },


        /* Not fully implemented API */

        /**
         * Get client country code using ip lookup provided by specified service url.
         * @returns {object} JQuery promise.
         */
        getCountryCode: function() {
            var deferred = $.Deferred();

            if ( !! localeData) {

            } else {
                $.get(ipServiceUrl, function(data) {
                    localeData = data;
                    deferred.resolve(data.country_code);
                });
            }

            return deferred.promise();
        },

        /**
         * Get client country name using ip lookup provided by specified service url.
         * @returns {object} JQuery promise.
         */
        getCountryName: function() {
            var deferred = $.Deferred();

            $.get(ipServiceUrl, function(data) {
                localeData = data;
                deferred.resolve(data.country_name);
            });

            return deferred.promise();
        }

    };

})(cms);
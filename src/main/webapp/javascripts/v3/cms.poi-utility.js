/**
 * @file Resful poi api access utility.
 * @author Yi-Fan Liao <yifan.9x9@gmail.com>
 */

 (function(cms, nn) {

    var poi, poiEvent, poiPoint, poiCampaign;

    poi = {
        get: function () {},
        set: function (poiCampaignId, poiData) {
            var deferred = $.Deferred();
            nn.api('POST', cms.reapi('/api/poi_campaigns/{poiCampaignId}/pois', {
                poiCampaignId: poiCampaignId
            }), poiData, function (poi) {
                deferred.resolve(poi);
            });
            return deferred.promise(); 
        },
        update: function () {},
        delete: function () {}
    };

    poiPoint = {
        get: function () {},
        set: function (programId, poiPointData) {
            var deferred = $.Deferred();
            nn.api('POST', cms.reapi('/api/programs/{programId}/poi_points', {
                programId: programId
            }), poiPointData, function (poi_point) { 
                deferred.resolve(poi_point);
            });  
            return deferred.promise();         
        },
        update: function () {},
        delete: function () {}
    };
    
    poiEvent = {
        get: function () {},
        set: function (userId, poiEventData) {
            var deferred = $.Deferred();
            nn.api('POST', cms.reapi('/api/users/{userId}/poi_events', {
                userId: userId
            }), poiEventData, function (poi_event) {
                deferred.resolve(poi_event);                
            });
            return deferred.promise();   
        },
        update: function (poiEventId, poiEventData) {
            var deferred = $.Deferred();
            nn.api('PUT', cms.reapi('/api/poi_events/{poiEventId}', {
                poiEventId: poiEventId
            }), poiEventData, function (poi_event) {
                deferred.resolve(poi_event);        
            });
            return deferred.promise();   
        },
        delete: function () {}
    };

    poiCampaign = {
        get: function () {},
        set: function () {},
        update: function () {},
        delete: function () {}
    };

    cms.poiUtility = {
        poi: poi,
        poiEvent: poiEvent,
        poiPoint: poiPoint,
        poiCampaign: poiCampaign
    };

})(cms, nn);
/*jslint browser: true, devel: true, unparam: true */
/*global $, nn */

var cms = {};

(function (cms) {
    'use strict';

    //-------------------------------------------------------------------------
    // Config (readonly)
    //-------------------------------------------------------------------------

    cms.config = {
        // for UI Coding: prototype
        // for DS.com: development, demonstration
        // for 9x9.tv: testing, production
        CMS_ENV: 'production',
        IS_DEBUG: true,
        RESERVED_CORE: ['config', 'global', 'reapi', 'namespace'],
        RESERVED_FUNC: ['common'],
        API_BASE: '',
        API_PACK: {
            '/api/login':                                           '/api/login',
            '/api/s3/attributes':                                   '/api/s3/attributes',
            '/api/categories':                                      '/api/categories',
            '/api/tags':                                            '/api/tags',
            '/api/users/{userId}':                                  '/api/users/{userId}',
            '/api/users/{userId}/my_favorites':                     '/api/users/{userId}/my_favorites',
            '/api/users/{userId}/my_favorites/fake':                '/api/users/{userId}/my_favorites',
            '/api/users/{userId}/channels':                         '/api/users/{userId}/channels',
            '/api/users/{userId}/channels/{channelId}':             '/api/users/{userId}/channels/{channelId}',
            '/api/users/{userId}/channels/sorting':                 '/api/users/{userId}/channels/sorting',
            '/api/users/{userId}/sns_auth/facebook':                '/api/users/{userId}/sns_auth/facebook',
            '/api/users/{userId}/poi_campaigns':                    '/api/users/{userId}/poi_campaigns',
            '/api/users/{userId}/poi_events':                       '/api/users/{userId}/poi_events',
            '/api/channels':                                        '/api/channels',
            '/api/channels/{channelId}':                            '/api/channels/{channelId}',
            '/api/channels/{channelId}/autosharing/facebook':       '/api/channels/{channelId}/autosharing/facebook',
            '/api/channels/{channelId}/autosharing/brand':          '/api/channels/{channelId}/autosharing/brand',
            '/api/channels/{channelId}/autosharing/validBrands':    '/api/channels/{channelId}/autosharing/validBrands',
            '/api/channels/{channelId}/episodes':                   '/api/channels/{channelId}/episodes',
            '/api/channels/{channelId}/episodes/sorting':           '/api/channels/{channelId}/episodes/sorting',
            '/api/channels/{channelId}/poi_points':                 '/api/channels/{channelId}/poi_points',
            '/api/episodes/{episodeId}':                            '/api/episodes/{episodeId}',
            '/api/episodes/{episodeId}/programs':                   '/api/episodes/{episodeId}/programs',
            '/api/programs/{programId}':                            '/api/programs/{programId}',
            '/api/programs/{programId}/title_cards':                '/api/programs/{programId}/title_cards',
            '/api/programs/{programId}/poi_points':                 '/api/programs/{programId}/poi_points',
            '/api/title_card/{titlecardId}':                        '/api/title_card/{titlecardId}',
            '/api/poi_campaigns/{poiCampaignId}/pois':              '/api/poi_campaigns/{poiCampaignId}/pois',
            '/api/poi_points/{poiPointId}':                         '/api/poi_points/{poiPointId}',
            '/api/poi_events/{poiEventId}':                         '/api/poi_events/{poiEventId}',
            '/api/mso/{msoId}':                                     '/api/mso/{msoId}',
            '/api/mso/{msoId}/sets':                                '/api/mso/{msoId}/sets',
            '/api/mso/{msoId}/store':                               '/api/mso/{msoId}/store',
            '/api/sets/{setId}':                                    '/api/sets/{setId}',
            '/api/sets/{setId}/channels':                           '/api/sets/{setId}/channels',
            '/api/sets/{setId}/channels/sorting':                   '/api/sets/{setId}/channels/sorting',
            '/api/store':                                           '/api/store'
        },
        FAKE_PACK: {
            '/api/login':                                           'fakeapi/login.php',
            '/api/s3/attributes':                                   'fakeapi/s3_attributes.php',
            '/api/categories':                                      'fakeapi/categories.php',
            '/api/tags':                                            'fakeapi/tags.php',
            '/api/users/{userId}':                                  'fakeapi/users.php?userId={userId}',
            '/api/users/{userId}/my_favorites':                     'fakeapi/users_my_favorites.php?userId={userId}',
            '/api/users/{userId}/my_favorites/fake':                'fakeapi/users_my_favorites.php?userId={userId}',
            '/api/users/{userId}/channels':                         'fakeapi/users_channels.php?userId={userId}',
            '/api/users/{userId}/channels/{channelId}':             'fakeapi/users_channels_del.php?userId={userId}&channelId={channelId}',
            '/api/users/{userId}/channels/sorting':                 'fakeapi/users_channels_sorting.php?userId={userId}',
            '/api/users/{userId}/sns_auth/facebook':                'fakeapi/users_sns_auth_facebook.php?userId={userId}',
            '/api/users/{userId}/poi_campaigns':                    'fakeapi/users_poi_campaigns.php?userId={userId}',
            '/api/users/{userId}/poi_events':                       'fakeapi/users_poi_events.php?userId={userId}',
            '/api/channels':                                        'fakeapi/channels_search.php',
            '/api/channels/{channelId}':                            'fakeapi/channels.php?channelId={channelId}',
            '/api/channels/{channelId}/autosharing/facebook':       'fakeapi/channels_autosharing_facebook.php?channelId={channelId}',
            '/api/channels/{channelId}/autosharing/brand':          'fakeapi/channels_autosharing_brand.php?channelId={channelId}',
            '/api/channels/{channelId}/autosharing/validBrands':    'fakeapi/channels_autosharing_validBrands.php?channelId={channelId}',
            '/api/channels/{channelId}/episodes':                   'fakeapi/channels_episodes.php?channelId={channelId}',
            '/api/channels/{channelId}/episodes/sorting':           'fakeapi/channels_episodes_sorting.php?channelId={channelId}',
            '/api/channels/{channelId}/poi_points':                 'fakeapi/channels_poi_points.php?channelId={channelId}',
            '/api/episodes/{episodeId}':                            'fakeapi/episodes.php?episodeId={episodeId}',
            '/api/episodes/{episodeId}/programs':                   'fakeapi/episodes_programs.php?episodeId={episodeId}',
            '/api/programs/{programId}':                            'fakeapi/programs.php?programId={programId}',
            '/api/programs/{programId}/title_cards':                'fakeapi/programs_title_cards.php?programId={programId}',
            '/api/programs/{programId}/poi_points':                 'fakeapi/programs_poi_points.php?programId={programId}',
            '/api/title_card/{titlecardId}':                        'fakeapi/title_card_del.php?titlecardId={titlecardId}',
            '/api/poi_campaigns/{poiCampaignId}/pois':              'fakeapi/poi_campaigns_pois.php?poiCampaignId={poiCampaignId}',
            '/api/poi_points/{poiPointId}':                         'fakeapi/poi_points.php?poiPointId={poiPointId}',
            '/api/poi_events/{poiEventId}':                         'fakeapi/poi_events.php?poiEventId={poiEventId}',
            '/api/mso/{msoId}':                                     'fakeapi/mso.php?msoId={msoId}',
            '/api/mso/{msoId}/sets':                                'fakeapi/mso_sets.php?msoId={msoId}',
            '/api/mso/{msoId}/store':                               'fakeapi/mso_store.php?msoId={msoId}',
            '/api/sets/{setId}':                                    'fakeapi/sets.php?setId={setId}',
            '/api/sets/{setId}/channels':                           'fakeapi/sets_channels.php?setId={setId}',
            '/api/sets/{setId}/channels/sorting':                   'fakeapi/sets_channels_sorting.php?setId={setId}',
            '/api/store':                                           'fakeapi/store_search.php'
        },
        PROTOTYPE_PACK: {
            '/api/login':                                           'fakeapi/json/login.json',
            '/api/s3/attributes':                                   'fakeapi/json/s3_attributes.json',
            '/api/categories':                                      'fakeapi/json/categories.json',
            '/api/tags':                                            'fakeapi/json/tags.json',
            '/api/users/{userId}':                                  'fakeapi/json/users.json?userId={userId}',
            '/api/users/{userId}/my_favorites':                     'fakeapi/json/users_my_favorites.json?userId={userId}',
            '/api/users/{userId}/my_favorites/fake':                'fakeapi/json/users_my_favorites_fake.json?userId={userId}',
            '/api/users/{userId}/channels':                         'fakeapi/json/users_channels.json?userId={userId}',
            '/api/users/{userId}/channels/{channelId}':             'fakeapi/json/users_channels_del.json?userId={userId}&channelId={channelId}',
            '/api/users/{userId}/channels/sorting':                 'fakeapi/json/users_channels_sorting.json?userId={userId}',
            '/api/users/{userId}/sns_auth/facebook':                'fakeapi/json/users_sns_auth_facebook.json?userId={userId}',
            '/api/users/{userId}/poi_campaigns':                    'fakeapi/json/users_poi_campaigns.json?userId={userId}',
            '/api/users/{userId}/poi_events':                       'fakeapi/json/users_poi_events.json?userId={userId}',
            '/api/channels':                                        'fakeapi/json/channels_search.json',
            '/api/channels/{channelId}':                            'fakeapi/json/channels_{channelId}.json',
            '/api/channels/{channelId}/autosharing/facebook':       'fakeapi/json/channels_autosharing_facebook.json?channelId={channelId}',
            '/api/channels/{channelId}/autosharing/brand':          'fakeapi/json/channels_autosharing_brand.json?channelId={channelId}',
            '/api/channels/{channelId}/autosharing/validBrands':    'fakeapi/json/channels_autosharing_validBrands.json?channelId={channelId}',
            '/api/channels/{channelId}/episodes':                   'fakeapi/json/channels_episodes_{channelId}.json',
            '/api/channels/{channelId}/episodes/sorting':           'fakeapi/json/channels_episodes_sorting.json?channelId={channelId}',
            '/api/channels/{channelId}/poi_points':                 'fakeapi/json/channels_poi_points.json?channelId={channelId}',
            '/api/episodes/{episodeId}':                            'fakeapi/json/episodes.json?episodeId={episodeId}',
            '/api/episodes/{episodeId}/programs':                   'fakeapi/json/episodes_programs.json?episodeId={episodeId}',
            '/api/programs/{programId}':                            'fakeapi/json/programs.json?programId={programId}',
            '/api/programs/{programId}/title_cards':                'fakeapi/json/programs_title_cards.json?programId={programId}',
            '/api/programs/{programId}/poi_points':                 'fakeapi/json/programs_poi_points.json?programId={programId}',
            '/api/title_card/{titlecardId}':                        'fakeapi/json/title_card_del.json?titlecardId={titlecardId}',
            '/api/poi_campaigns/{poiCampaignId}/pois':              'fakeapi/json/poi_campaigns_pois.json?poiCampaignId={poiCampaignId}',
            '/api/poi_points/{poiPointId}':                         'fakeapi/json/poi_points.json?poiPointId={poiPointId}',
            '/api/poi_events/{poiEventId}':                         'fakeapi/json/poi_events.json?poiEventId={poiEventId}',
            '/api/mso/{msoId}':                                     'fakeapi/json/mso.json?msoId={msoId}',
            '/api/mso/{msoId}/sets':                                'fakeapi/json/mso_sets.json?msoId={msoId}',
            '/api/mso/{msoId}/store':                               'fakeapi/json/mso_store.json?msoId={msoId}',
            '/api/sets/{setId}':                                    'fakeapi/json/sets.json?setId={setId}',
            '/api/sets/{setId}/channels':                           'fakeapi/json/sets_channels.json?setId={setId}',
            '/api/sets/{setId}/channels/sorting':                   'fakeapi/json/sets_channels_sorting.json?setId={setId}',
            '/api/store':                                           'fakeapi/json/store_search.json'
        },
        YOUR_FAVORITE: 11,
        PROGRAM_MAX: 50,
        LANG_MAP: {
            'en': 'English',
            'zh': 'Chinese',
            'other': 'Others'
        },
        SPHERE_MAP: {
            'en': 'US',
            'zh': 'Taiwan',
            'other': 'Worldwide'
        },
        CATEGORY_MAP: {},
        EFFECT_MAP: {
            'none': 'None',
            'fade': 'Fade',
            'blind': 'Blind',
            'clip': 'Clip',
            'drop': 'Drop'
        },
        COLOR_MAP: {
            '#ffffff': 'c-fff',
            '#eeeeee': 'c-eee',
            '#bbbbbb': 'c-bbb',
            '#777777': 'c-777',
            '#333333': 'c-333',
            '#000000': 'c-000',
            '#ff0000': 'c-f00',
            '#ff6600': 'c-f60',
            '#ffff00': 'c-ff0',
            '#009900': 'c-090',
            '#0033ff': 'c-03f',
            '#6600ff': 'c-60f'
        },
        // NOTE: The naming is 9x9 API convention, not jquery.titlecard plugin convention
        TITLECARD_DEFAULT_OPTION: {
            message: 'My video',
            align: 'center',
            effect: 'fade',
            duration: 7,
            size: 20,
            color: '#ffffff',
            style: 'normal',
            weight: 'normal',
            bgColor: '#000000',
            bgImage: ''
        },
        TITLECARD_DEFAULT_IMAGE_BY_SYSTEM: 'http://9x9ui.s3.amazonaws.com/war/v0/images/titlecard-default.png',
        TITLECARD_DEFAULT_IMAGE_BY_UPLOAD: 'http://s3.amazonaws.com/9x9ui/war/v0/images/titlecard-default.png',
        EPISODE_DEFAULT_IMAGE: 'http://s3.amazonaws.com/9x9ui/war/v0/images/episode-default.png',
        CHANNEL_DEFAULT_IMAGE: 'images/ep_default.png',
        CHANNEL_DEFAULT_IMAGE2: 'images/ep_default.png',
        FONT_RADIX_MIN: 6,
        FONT_RADIX_MAX: 48,
        LANG_SUPPORT: ['en', 'zh'],
        LC_MAP: {
            'en': 'en_US',
            'zh': 'zh_TW'
        },
        FB_APP_ID: '110847978946712',
        FB_REQ_PERMS: [
            'email',
            'friends_actions.video',
            'friends_birthday',
            'friends_education_history',
            'friends_groups',
            'friends_hometown',
            'friends_interests',
            'friends_likes',
            'friends_location',
            'friends_relationship_details',
            'friends_subscriptions',
            'manage_friendlists',
            'manage_pages',
            'publish_actions',
            'publish_stream',
            'read_stream',
            'user_actions.video',
            'user_birthday',
            'user_education_history',
            'user_groups',
            'user_hometown',
            'user_interests',
            'user_likes',
            'user_location',
            'user_relationship_details',
            'user_subscriptions'
        ],
        POI_ACTION_URL: 'http://www.9x9.tv/poiAction?poiId=',
        POI_TYPE_MAP: {
            0: '',
            1: 'event-hyper',
            2: 'event-instant',
            3: 'event-scheduled',
            4: 'event-poll',
            'event-hyper': {
                code: 1,
                plugin: 'hyperChannel',
                formId: 'eventHyperForm'
            },
            'event-instant': {
                code: 2,
                plugin: 'shoppingInfo',
                formId: 'eventInstantForm'
            },
            'event-scheduled': {
                code: 3,
                plugin: 'tvShowNotice',
                formId: 'eventScheduledForm'
            },
            'event-poll': {
                code: 4,
                plugin: 'poll',
                formId: 'eventPollForm'
            }
        }
    };

    //-------------------------------------------------------------------------
    // Global Variable
    //-------------------------------------------------------------------------

    cms.global = {
        USER_URL: null,
        USER_DATA: null,
        CAMPAIGN_ID: null,
        PAGE_ID: 'index',
        PAGE_OBJECT: null,
        FB_RESTART_CONNECT: false,
        FB_PAGES_MAP: null,
        USER_SNS_AUTH: null,
        EPISODES_PAGING: [],
        EPISODES_PAGING_INFO: [],
        SLIDER_MAX: 100,
        MSO: 0,
        MSOINFO: null,
        YOUTUBE_PLAYER: null
    };

    //-------------------------------------------------------------------------
    // Function (reapi, namespace)
    //-------------------------------------------------------------------------

    cms.reapi = function (uri, repl) {
        var api = '';

        if ('string' === typeof uri) {
            api = ('string' === typeof cms.config.API_PACK[uri]) ? cms.config.API_PACK[uri] : uri;
        }
        if (repl && 'object' === typeof repl) {
            $.each(repl, function (k, v) {
                api = api.replace('{' + k + '}', v);
            });
        }

        return cms.config.API_BASE + api;
    };

    cms.namespace = function (ns) {
        var parts = ns.split('.'),
            part = '',
            object = this,
            i = 0,
            len = parts.length;

        if (len > 0 && -1 === $.inArray(parts[0], cms.config.RESERVED_CORE)) {
            for (i = 0; i < len; i += 1) {
                part = parts[i];
                if (!object[part]) {
                    object[part] = {};
                }
                object = object[part];
            }
        }

        return object;
    };

    //-------------------------------------------------------------------------
    // Switch Config By ENV
    //-------------------------------------------------------------------------

    switch (cms.config.CMS_ENV) {
    case 'prototype':
        cms.config.IS_DEBUG = true;
        cms.config.API_BASE = '';
        cms.config.API_PACK = cms.config.PROTOTYPE_PACK;
        cms.config.FB_APP_ID = '367878243223232';
        break;
    case 'development':
        cms.config.IS_DEBUG = true;
        cms.config.API_BASE = '';
        cms.config.API_PACK = cms.config.FAKE_PACK;
        cms.config.FB_APP_ID = '367878243223232';
        break;
    case 'demonstration':
        cms.config.IS_DEBUG = true;
        cms.config.API_BASE = '';
        cms.config.API_PACK = cms.config.FAKE_PACK;
        cms.config.FB_APP_ID = '367878243223232';
        break;
    case 'testing':
        cms.config.IS_DEBUG = true;
        cms.config.API_BASE = 'http://dev.teltel.com:8080';
        break;
    case 'production':
        cms.config.IS_DEBUG = false;
        cms.config.API_BASE = '';
        break;
    }

    //-------------------------------------------------------------------------
    // nn SDK Initialize And Error Handle
    //-------------------------------------------------------------------------

    nn.init();
    nn.debug(cms.config.IS_DEBUG);
    nn.on(400, function (jqXHR, textStatus) {
        if (cms.config.IS_DEBUG) {
            alert(textStatus + ': ' + jqXHR.responseText);
        }
        location.replace('index.html');
    });
    nn.on(401, function (jqXHR, textStatus) {
        location.href = '../';
    });
    nn.on(403, function (jqXHR, textStatus) {
        location.replace('index.html');
    });
    nn.on(500, function (jqXHR, textStatus) {
        if (cms.config.IS_DEBUG) {
            alert(textStatus + ': ' + jqXHR.responseText);
        }
    });
    nn.load('http://code.jquery.com/jquery-migrate-1.2.1' + ((cms.config.IS_DEBUG) ? '' : '.min') + '.js');

}(cms));
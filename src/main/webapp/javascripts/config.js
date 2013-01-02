var CMS_CONF = {
    // for DS.com: development, demonstration
    // for 9x9.tv: testing, production
    CMS_ENV: 'production',
    IS_DEBUG: true,
    API_PACK: {
        '/api/login':                                       '/api/login',
        '/api/s3/attributes':                               '/api/s3/attributes',
        '/api/categories':                                  '/api/categories',
        '/api/tags':                                        '/api/tags',
        '/api/users/{userId}':                              '/api/users/{userId}',
        '/api/users/{userId}/my_favorites':                 '/api/users/{userId}/my_favorites',
        '/api/users/{userId}/channels':                     '/api/users/{userId}/channels',
        '/api/users/{userId}/channels/{channelId}':         '/api/users/{userId}/channels/{channelId}',
        '/api/users/{userId}/channels/sorting':             '/api/users/{userId}/channels/sorting',
        '/api/users/{userId}/sns_auth/facebook':            '/api/users/{userId}/sns_auth/facebook',
        '/api/channels/{channelId}':                        '/api/channels/{channelId}',
        '/api/channels/{channelId}/autosharing/facebook':   '/api/channels/{channelId}/autosharing/facebook',
        '/api/channels/{channelId}/episodes':               '/api/channels/{channelId}/episodes',
        '/api/channels/{channelId}/episodes/sorting':       '/api/channels/{channelId}/episodes/sorting',
        '/api/episodes/{episodeId}':                        '/api/episodes/{episodeId}',
        '/api/episodes/{episodeId}/programs':               '/api/episodes/{episodeId}/programs',
        '/api/programs/{programId}':                        '/api/programs/{programId}',
        '/api/programs/{programId}/title_cards':            '/api/programs/{programId}/title_cards',
        '/api/title_card/{titlecardId}':                    '/api/title_card/{titlecardId}'
    },
    FAKE_PACK: {
        '/api/login':                                       'fakeapi/login.php',
        '/api/s3/attributes':                               'fakeapi/s3_attributes.php',
        '/api/categories':                                  'fakeapi/categories.php',
        '/api/tags':                                        'fakeapi/tags.php',
        '/api/users/{userId}':                              'fakeapi/users.php?userId={userId}',
        '/api/users/{userId}/my_favorites':                 'fakeapi/users_my_favorites.php?userId={userId}',
        '/api/users/{userId}/channels':                     'fakeapi/users_channels.php?userId={userId}',
        '/api/users/{userId}/channels/{channelId}':         'fakeapi/users_channels_del.php?userId={userId}&channelId={channelId}',
        '/api/users/{userId}/channels/sorting':             'fakeapi/users_channels_sorting.php?userId={userId}',
        '/api/users/{userId}/sns_auth/facebook':            'fakeapi/users_sns_auth_facebook.php?userId={userId}',
        '/api/channels/{channelId}':                        'fakeapi/channels.php?channelId={channelId}',
        '/api/channels/{channelId}/autosharing/facebook':   'fakeapi/channels_autosharing_facebook.php?channelId={channelId}',
        '/api/channels/{channelId}/episodes':               'fakeapi/channels_episodes.php?channelId={channelId}',
        '/api/channels/{channelId}/episodes/sorting':       'fakeapi/channels_episodes_sorting.php?channelId={channelId}',
        '/api/episodes/{episodeId}':                        'fakeapi/episodes.php?episodeId={episodeId}',
        '/api/episodes/{episodeId}/programs':               'fakeapi/episodes_programs.php?episodeId={episodeId}',
        '/api/programs/{programId}':                        'fakeapi/programs.php?programId={programId}',
        '/api/programs/{programId}/title_cards':            'fakeapi/programs_title_cards.php?programId={programId}',
        '/api/title_card/{titlecardId}':                    'fakeapi/title_card_del.php?titlecardId={titlecardId}'
    },
    API: function (uri, repl) {
        var api = '';
        if ('string' === typeof uri) {
            api = ('string' === typeof CMS_CONF.API_PACK[uri]) ? CMS_CONF.API_PACK[uri] : uri;
        }
        if (repl && 'object' === typeof repl) {
            $.each(repl, function (k, v) {
                api = api.replace('{' + k + '}', v);
            });
        }
        return api;
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
    USER_URL: null,
    USER_DATA: null,
    LANG_SUPPORT: ['en', 'zh'],
    LC_MAP: {
        'en': 'en_US',
        'zh': 'zh_TW'
    },
    PAGE_ID: 'index',
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
    FB_RESTART_CONNECT: false,
    FB_PAGES_MAP: null,
    USER_SNS_AUTH: null
};

switch (CMS_CONF.CMS_ENV) {
case 'development':
    CMS_CONF.IS_DEBUG = true;
    CMS_CONF.API_PACK = CMS_CONF.FAKE_PACK;
    CMS_CONF.FB_APP_ID = '367878243223232';
    break;
case 'demonstration':
    CMS_CONF.IS_DEBUG = true;
    CMS_CONF.API_PACK = CMS_CONF.FAKE_PACK;
    CMS_CONF.FB_APP_ID = '367878243223232';
    break;
case 'testing':
    CMS_CONF.IS_DEBUG = true;
    break;
case 'production':
    CMS_CONF.IS_DEBUG = false;
    break;
}
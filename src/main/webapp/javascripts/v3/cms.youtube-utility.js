/**
 * @file YouTube relative utility.
 * @author Yi-Fan Liao <yifan.9x9@gmail.com>
 */
(function(cms) {

	cms.youtubeUtility = cms.youtubeUtility || {

        /**
         * Check youtube video validity.
         * @param {object} youtube - The youtube data API response.
         * @returns {object} Checked validity result.
         */
		checkVideoValidity: function (youtube) {

			var checkResult = {
                // Private video?
                isPrivateVideo: false,
                // Not playable in some regions?
                isZoneLimited: false,
                // Not playable on mobile device?
                isSyndicateLimited: false,
                // Non-embeddable video?
                isEmbedLimited: false,
                // Deleted or not found?
                isInvalid: false,
                // Unplayable video?
                isUnplayableVideo: false,
                // Is the video still processing/uploading?
                isProcessing: false,
                // Is the video not available in the curator's region?
                isRequesterRegionRestricted: false
			};

            var ytData, hasSyndicateDenied, hasLimitedSyndication;

            if (youtube.data) {
                ytData = youtube.data;
                checkResult.isPrivateVideo = false;
                checkResult.isZoneLimited = !!ytData.restrictions;
                hasSyndicateDenied = ytData.accessControl && ytData.accessControl.syndicate && 'denied' === ytData.accessControl.syndicate;
                hasLimitedSyndication = ytData.status && ytData.status.reason && 'limitedSyndication' === ytData.status.reason;
                checkResult.isSyndicateLimited = !!(hasSyndicateDenied || hasLimitedSyndication);
                checkResult.isEmbedLimited = ytData.accessControl && ytData.accessControl.embed && 'denied' === ytData.accessControl.embed;
                checkResult.isUnplayableVideo = !!(checkResult.isEmbedLimited || hasSyndicateDenied || (ytData.status && !hasLimitedSyndication));
                checkResult.isProcessing = ytData.status && ytData.status.value === 'processing';
                checkResult.isRequesterRegionRestricted = checkResult.isZoneLimited && ytData.status && ytData.status.reason === 'requesterRegion' && ytData.status.value === 'restricted';
                // if (checkResult.isZoneLimited) {
                    // for (var i = ytData.restrictions.length - 1; i >= 0; i--) {
                    //     if (ytData.restrictions[i].countries.indexOf(cms.global.USER_DATA.locale.country_code) === -1 && ytData.restrictions[i].relationship === "deny") {
                    //         checkResult.isRequesterRegionRestricted = true;
                    //     }
                    // }
                // }
            } else {
                checkResult.isPrivateVideo = youtube.error && youtube.error.code && 403 === youtube.error.code;
                checkResult.isInvalid = !checkResult.isPrivateVideo;
            }

			return checkResult;
		}

	};

})(cms);
import 'dotenv/config'

async function fetchCommunityTweets() {
	const communityId = '1787507243883057561'
	const queryId = 'fnpm1rI1w1_6RyLUDyWKGA'
	const url = `https://x.com/i/api/graphql/${queryId}/CommunityTweetsTimeline`

	const authToken = process.env.TWITTER_AUTH_TOKEN
	const ct0 = process.env.TWITTER_CT0

	const cookies = [
        `auth_token=${authToken}`,
        `ct0=${ct0}`,
        `twid=${process.env.TWITTER_TWID}`,
        `guest_id=v1%3A177173807738930903`,
        `kdt=UlUAv5Cpep5dlsnpTiiYRkRfqKoJRoQ1RP41nC9W`,
	].join('; ')

	const variables = {
		communityId,
		count: 20,
		withCommunity: true,
	}
	const features = {
		responsive_web_graphql_exclude_directive_enabled: true,
		verified_phone_label_enabled: false,
		creator_subscriptions_tweet_preview_api_enabled: true,
		responsive_web_graphql_timeline_navigation_enabled: true,
		responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
		tweet_with_visibility_results_prefer_gql_limited_actions_pose_enabled: true,
		tweet_awards_web_tipping_enabled: false,
		freedom_of_speech_not_reach_fetch_enabled: true,
		standardized_nudges_misinfo: true,
		tweet_with_visibility_results_prefer_gql_media_interstitial_enabled: true,
		interactive_text_enabled: true,
		responsive_web_text_entities_tweet_api_enabled: true,
		blue_business_profile_image_shape_enabled: true,
		responsive_web_uc_gql_enabled: true,
		vibe_api_enabled: true,
		responsive_web_edit_tweet_api_enabled: true,
		longform_notetweets_inline_media_enabled: true,
		responsive_web_enhance_cards_enabled: false,
	}

	const params = new URLSearchParams({
		variables: JSON.stringify(variables),
		features: JSON.stringify(features),
	})

	const headers = {
		'Authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
		'Cookie': cookies,
		'x-csrf-token': ct0 || '',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
		'Content-Type': 'application/json',
		'Accept': '*/*',
		'Referer': 'https://x.com/',
	}

	try {
		const fullUrl = `${url}?${params.toString()}`
		const response = await fetch(fullUrl, { headers })
		const data = await response.json() as any

		if (data.errors) {
			console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2))

			return
		}

		console.log('Full response structure keys:', Object.keys(data.data))
		if (data.data.community_screen) {
			console.log('community_screen keys:', Object.keys(data.data.community_screen))
		}

		const timeline = data.data.community_screen?.timeline || data.data.community_timeline?.timeline
		if (!timeline) {
			console.log('Timeline not found. Full data:', JSON.stringify(data, null, 2))

			return
		}

		const instructions = timeline.instructions
		const entries = instructions.find((i: any) => i.type === 'TimelineAddEntries')?.entries || []

		console.log('--- Recent Community Tweets ---')
		entries.forEach((entry: any) => {
			const tweet = entry.content.itemContent?.tweet_results?.result?.legacy
			if (tweet) {
				console.log(`- ${tweet.full_text}`)
			}
		})
	} catch (error) {
		console.error('Error fetching tweets:', error)
	}
}

fetchCommunityTweets()

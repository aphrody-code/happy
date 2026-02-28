import 'dotenv/config'

async function fetchCommunity() {
	const communityId = '1787507243883057561'
	const queryId = 'DmYpjGQiykH6g3PqIUjmkQ'
	const url = `https://x.com/i/api/graphql/${queryId}/CommunityByRestId`

	// On utilise les tokens du .env mais on pourrait aussi passer le bloc complet
	const authToken = process.env.TWITTER_AUTH_TOKEN
	const ct0 = process.env.TWITTER_CT0

	const cookies = [
        `auth_token=${authToken}`,
        `ct0=${ct0}`,
        `twid=${process.env.TWITTER_TWID}`,
        `guest_id=v1%3A177173807738930903`,
        `kdt=UlUAv5Cpep5dlsnpTiiYRkRfqKoJRoQ1RP41nC9W`,
	].join('; ')

	const variables = { communityId }
	const features = {
		responsive_web_graphql_exclude_directive_enabled: true,
		verified_phone_label_enabled: false,
		responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
		responsive_web_graphql_timeline_navigation_enabled: true,
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
		'x-twitter-auth-type': 'OAuth2Session',
		'x-twitter-active-user': 'yes',
		'x-twitter-client-language': 'fr',
	}

	try {
		const fullUrl = `${url}?${params.toString()}`
		console.log('Fetching URL:', fullUrl)
		const response = await fetch(fullUrl, { headers })
		console.log('Status:', response.status)
		const data = await response.json() as any

		if (data.errors) {
			console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2))

			return
		}

		const community = data.data.community || (data.data.communityResults && data.data.communityResults.result)
		if (!community) {
			console.log('Community not found in response data:', JSON.stringify(data, null, 2))

			return
		}

		const info = community.legacy || community
		console.log('--- Community Info ---')
		console.log('Name:', info.name)
		console.log('Description:', info.description)
		console.log('Members:', info.member_count)
		console.log('Moderators:', info.moderator_count)
	} catch (error) {
		console.error('Error fetching community:', error)
	}
}

fetchCommunity()

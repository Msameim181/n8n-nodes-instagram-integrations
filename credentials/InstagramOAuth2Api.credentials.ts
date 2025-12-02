import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IDataObject,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

export class InstagramOAuth2Api implements ICredentialType {
	name = 'instagramOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'Instagram OAuth2 API';
	documentationUrl = 'https://developers.facebook.com/docs/instagram-api/getting-started';
	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://api.instagram.com/oauth/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://api.instagram.com/oauth/access_token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
		{
			displayName: 'Account Information',
			name: 'accountInfoNotice',
			type: 'notice',
			default: '',
			description: 'After connecting your account, your Instagram Business Account details (username, ID, profile) will be automatically available. You can access this information in your workflow nodes. The system will automatically exchange your OAuth token for a long-lived token (60 days) and persist it, ensuring it survives n8n restarts.',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'The Instagram App ID from your Meta Developer Console. <a href="https://developers.facebook.com/apps/" target="_blank">Get it here</a>.',
			placeholder: '1234567890123456',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The Instagram App Secret from your Meta Developer Console',
			placeholder: 'abc123def456...',
		},
		{
			displayName: 'Webhook Verify Token',
			name: 'webhookVerifyToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			description: 'Optional: Custom verification token for webhook setup (minimum 20 characters). Only needed if using Instagram Trigger node.',
			placeholder: 'my_custom_verify_token_2024',
		},
		// Hidden field for long-lived token with expirable typeOption
		// This enables n8n's preAuthentication system to persist the token
		{
			displayName: 'Long-Lived Token',
			name: 'longLivedToken',
			type: 'hidden',
			typeOptions: {
				expirable: true,
			},
			default: '',
		},
		{
			displayName: 'Token Expires At',
			name: 'tokenExpiresAt',
			type: 'hidden',
			default: 0,
		},
	];

	/**
	 * Pre-authentication hook that exchanges short-lived OAuth token for a long-lived token
	 * and refreshes it when near expiration. n8n automatically persists the returned values.
	 *
	 * This is called by n8n before each API request when the credential has an expirable field.
	 * If this function returns new credential data, n8n will persist it to the database.
	 */
	async preAuthentication(
		this: IHttpRequestHelper,
		credentials: ICredentialDataDecryptedObject,
	): Promise<IDataObject> {
		const now = Math.floor(Date.now() / 1000);
		const longLivedToken = credentials.longLivedToken as string;
		const tokenExpiresAt = (credentials.tokenExpiresAt as number) || 0;
		const clientSecret = credentials.clientSecret as string;
		const oauthTokenData = credentials.oauthTokenData as { access_token?: string } | undefined;
		const shortLivedToken = oauthTokenData?.access_token;

		// If we have a valid long-lived token that's not near expiration, no action needed
		if (longLivedToken && tokenExpiresAt > 0) {
			// Token is still valid with more than 7 days remaining
			const sevenDaysInSeconds = 7 * 24 * 60 * 60;
			if (tokenExpiresAt > now + sevenDaysInSeconds) {
				return {}; // No update needed
			}

			// Token is valid but near expiration (< 7 days), try to refresh it
			// Instagram allows refresh only if token is at least 24 hours old
			const totalLifetime = 60 * 24 * 60 * 60; // 60 days
			const tokenAge = now - (tokenExpiresAt - totalLifetime);
			if (tokenAge >= 24 * 60 * 60) {
				try {
					const refreshed = await this.helpers.httpRequest({
						method: 'GET',
						url: 'https://graph.instagram.com/refresh_access_token',
						qs: {
							grant_type: 'ig_refresh_token',
							access_token: longLivedToken,
						},
					}) as { access_token: string; token_type: string; expires_in: number };

					return {
						longLivedToken: refreshed.access_token,
						tokenExpiresAt: now + refreshed.expires_in,
					};
				} catch (error) {
					// Refresh failed, but token is still valid - continue using it
					console.warn('Instagram: Failed to refresh long-lived token, continuing with current token', error);
					return {};
				}
			}
			return {}; // Token too new to refresh
		}

		// No long-lived token yet - exchange short-lived OAuth token for long-lived
		if (!shortLivedToken) {
			// No token available at all
			return {};
		}

		try {
			const exchanged = await this.helpers.httpRequest({
				method: 'GET',
				url: 'https://graph.instagram.com/access_token',
				qs: {
					grant_type: 'ig_exchange_token',
					client_secret: clientSecret,
					access_token: shortLivedToken,
				},
			}) as { access_token: string; token_type: string; expires_in: number };

			return {
				longLivedToken: exchanged.access_token,
				tokenExpiresAt: now + exchanged.expires_in,
			};
		} catch (error) {
			// Exchange failed - the short-lived token may be expired
			console.error('Instagram: Failed to exchange OAuth token for long-lived token', error);
			return {};
		}
	}

	/**
	 * Test the credentials to ensure they work
	 */
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://graph.instagram.com/v23.0',
			url: '/me',
			method: 'GET',
			qs: {
				fields: 'id,username',
			},
		},
	};
}

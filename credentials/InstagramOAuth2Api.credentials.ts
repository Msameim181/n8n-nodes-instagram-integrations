import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
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
			description: 'After connecting your account, your Instagram Business Account details (username, ID, profile) will be automatically available. You can access this information in your workflow nodes.',
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
		// Hidden fields for token management
		{
			displayName: 'Token Type',
			name: 'tokenType',
			type: 'hidden',
			default: 'short-lived',
			description: 'Type of access token (short-lived or long-lived)',
		},
		{
			displayName: 'Token Expires At',
			name: 'tokenExpiresAt',
			type: 'hidden',
			default: 0,
			description: 'Unix timestamp when the token expires',
		},
		{
			displayName: 'Long-Lived Token',
			name: 'longLivedToken',
			type: 'hidden',
			typeOptions: { password: true },
			default: '',
			description: 'The long-lived access token (60 days validity)',
		},
	];

	/**
	 * Hook that runs after OAuth authentication to exchange short-lived token for long-lived token
	 */
	async preAuthentication(
		this: any,
		credentials: ICredentialDataDecryptedObject,
	): Promise<ICredentialDataDecryptedObject> {
		// Check if we already have a long-lived token that's still valid
		const tokenExpiresAt = credentials.tokenExpiresAt as number;
		const now = Math.floor(Date.now() / 1000);
		
		// If token expires in more than 7 days, no need to refresh yet
		if (tokenExpiresAt && tokenExpiresAt > now + (7 * 24 * 60 * 60)) {
			return credentials;
		}

		return credentials;
	}

	/**
	 * Authenticate hook to inject long-lived token or refresh if needed
	 */
	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const now = Math.floor(Date.now() / 1000);
		const tokenExpiresAt = credentials.tokenExpiresAt as number || 0;
		const longLivedToken = credentials.longLivedToken as string;
		const oauthTokenData = credentials.oauthTokenData as any;
		
		let accessToken = oauthTokenData?.access_token || credentials.accessToken as string;

		// Check if we need to get a long-lived token for the first time
		if (!longLivedToken && accessToken) {
			try {
				const longLivedData = await this.exchangeForLongLivedToken(
					accessToken,
					credentials.clientSecret as string,
				);
				
				// Store the long-lived token
				credentials.longLivedToken = longLivedData.access_token;
				credentials.tokenType = 'long-lived';
				credentials.tokenExpiresAt = now + longLivedData.expires_in;
				
				accessToken = longLivedData.access_token;
			} catch (error) {
				// If exchange fails, continue with short-lived token
				console.error('Failed to exchange for long-lived token:', error);
			}
		}
		// Check if we need to refresh the long-lived token
		else if (longLivedToken && tokenExpiresAt) {
			const daysSinceIssued = now - (tokenExpiresAt - (60 * 24 * 60 * 60));
			const daysUntilExpiry = (tokenExpiresAt - now) / (24 * 60 * 60);
			
			// Refresh if token is at least 24 hours old AND expires in less than 7 days
			if (daysSinceIssued >= (24 * 60 * 60) && daysUntilExpiry < 7) {
				try {
					const refreshedData = await this.refreshLongLivedToken(longLivedToken);
					
					// Update credentials with refreshed token
					credentials.longLivedToken = refreshedData.access_token;
					credentials.tokenExpiresAt = now + refreshedData.expires_in;
					
					accessToken = refreshedData.access_token;
				} catch (error) {
					console.error('Failed to refresh long-lived token:', error);
					// Try to exchange current OAuth token for new long-lived token
					if (oauthTokenData?.access_token) {
						try {
							const longLivedData = await this.exchangeForLongLivedToken(
								oauthTokenData.access_token,
								credentials.clientSecret as string,
							);
							
							credentials.longLivedToken = longLivedData.access_token;
							credentials.tokenExpiresAt = now + longLivedData.expires_in;
							accessToken = longLivedData.access_token;
						} catch (exchangeError) {
							throw new Error('Token expired and refresh failed. Please reconnect your Instagram account.');
						}
					}
				}
			} else if (daysUntilExpiry < 0) {
				// Token is expired, need to re-authenticate
				throw new Error('Instagram access token has expired. Please reconnect your account.');
			}
			
			// Use the long-lived token
			accessToken = longLivedToken;
		}

		// Inject the access token into the request
		if (!requestOptions.qs) {
			requestOptions.qs = {};
		}
		requestOptions.qs.access_token = accessToken;

		return requestOptions;
	}

	/**
	 * Exchange short-lived token for long-lived token (60 days)
	 */
	private async exchangeForLongLivedToken(
		shortLivedToken: string,
		clientSecret: string,
	): Promise<{ access_token: string; token_type: string; expires_in: number }> {
		const url = 'https://graph.instagram.com/access_token';
		const params = new URLSearchParams({
			grant_type: 'ig_exchange_token',
			client_secret: clientSecret,
			access_token: shortLivedToken,
		});

		const response = await fetch(`${url}?${params.toString()}`, {
			method: 'GET',
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(`Failed to exchange token: ${JSON.stringify(error)}`);
		}

		return (await response.json()) as { access_token: string; token_type: string; expires_in: number };
	}

	/**
	 * Refresh a long-lived token (extends for another 60 days)
	 */
	private async refreshLongLivedToken(
		longLivedToken: string,
	): Promise<{ access_token: string; token_type: string; expires_in: number }> {
		const url = 'https://graph.instagram.com/refresh_access_token';
		const params = new URLSearchParams({
			grant_type: 'ig_refresh_token',
			access_token: longLivedToken,
		});

		const response = await fetch(`${url}?${params.toString()}`, {
			method: 'GET',
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(`Failed to refresh token: ${JSON.stringify(error)}`);
		}

		return (await response.json()) as { access_token: string; token_type: string; expires_in: number };
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

import type {
	ICredentialTestRequest,
	ICredentialType,
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
			description: 'After connecting your account, your Instagram Business Account details (username, ID, profile) will be automatically available. You can access this information in your workflow nodes. The system will automatically exchange your OAuth token for a long-lived token (60 days) and refresh it when needed.',
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

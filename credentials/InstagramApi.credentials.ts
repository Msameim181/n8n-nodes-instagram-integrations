import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class InstagramApi implements ICredentialType {
	name = 'instagramApi';
	displayName = 'Instagram API';
	documentationUrl = 'https://developers.facebook.com/docs/instagram-api';
	properties: INodeProperties[] = [
		{
			displayName: 'App ID',
			name: 'appId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Instagram/Facebook App ID from Meta Developer Console',
			placeholder: '1234567890123456',
		},
		{
			displayName: 'App Secret',
			name: 'appSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Instagram App Secret from Meta Developer Console',
			placeholder: 'abc123def456...',
		},
		{
			displayName: 'Page Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Facebook Page access token with Instagram permissions. Get it from <a href="https://developers.facebook.com/docs/pages/access-tokens" target="_blank">here</a>.',
			placeholder: 'EAAxxxxx...',
		},
		{
			displayName: 'Instagram Business Account ID',
			name: 'igUserId',
			type: 'string',
			default: '',
			required: true,
			description: 'Your Instagram Business Account ID (IGSID). Find it in your Facebook Page settings under Instagram.',
			placeholder: '17841400000000000',
		},
		{
			displayName: 'Webhook Verify Token',
			name: 'webhookVerifyToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: false,
			description: 'Custom verification token for webhook setup (minimum 20 characters). Used when configuring webhooks in Meta Developer Console.',
			placeholder: 'my_custom_verify_token_2024',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				access_token: '={{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://graph.instagram.com/v23.0',
			url: '={{$credentials.igUserId}}',
			qs: {
				fields: 'id,username',
			},
		},
	};
}

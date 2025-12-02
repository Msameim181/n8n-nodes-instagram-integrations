import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	IWebhookFunctions,
	JsonObject,
	ICredentialDataDecryptedObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import * as crypto from 'crypto';

/**
 * Get access token from credentials.
 *
 * The token lifecycle is now handled by n8n's preAuthentication system in the credential type:
 * 1. On first use, preAuthentication exchanges the short-lived OAuth token for a 60-day long-lived token
 * 2. When the long-lived token is near expiration (< 7 days), preAuthentication refreshes it
 * 3. n8n automatically persists the new token to the database
 *
 * This function simply retrieves the persisted long-lived token, or falls back to the OAuth token
 * if no long-lived token exists yet (which triggers preAuthentication on next request).
 */
export async function getAccessToken(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
): Promise<string> {
	const credentials = (await this.getCredentials('instagramOAuth2Api')) as ICredentialDataDecryptedObject;
	const now = Math.floor(Date.now() / 1000);

	// Check for persisted long-lived token first (set by preAuthentication)
	const longLivedToken = credentials.longLivedToken as string;
	const tokenExpiresAt = (credentials.tokenExpiresAt as number) || 0;

	if (longLivedToken && tokenExpiresAt > now) {
		// We have a valid long-lived token
		return longLivedToken;
	}

	// No long-lived token yet, or it's expired
	// Fall back to OAuth token - preAuthentication will exchange it on the next request
	const oauthTokenData = credentials.oauthTokenData as { access_token?: string } | undefined;
	const accessToken = oauthTokenData?.access_token;

	if (!accessToken) {
		throw new Error('No access token found. Please reconnect your Instagram account.');
	}

	// Check if long-lived token is expired
	if (longLivedToken && tokenExpiresAt <= now) {
		throw new Error('Instagram access token has expired. Please reconnect your account by clicking "Connect" in the credential settings.');
	}

	// Return OAuth token - preAuthentication will handle exchanging it for a long-lived token
	// and persisting it on the next API request
	return accessToken;
}

/**
 * Get Instagram Business Account ID from the authenticated user
 */
export async function getInstagramBusinessAccountId(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
): Promise<string> {
	try {
		const accessToken = await getAccessToken.call(this);

		const options: IRequestOptions = {
			method: 'GET',
			url: 'https://graph.instagram.com/v23.0/me',
			qs: {
				access_token: accessToken,
				fields: 'id,name,account_type,media_count,user_id,username',
			},
			json: true,
		};

		const response = await this.helpers.request(options);

		if (response && response.id) {
			return response.id;
		}

		throw new Error('No Instagram Business Account found. Make sure your Facebook Page is connected to an Instagram Business Account.');
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Failed to fetch Instagram Business Account ID, Error: ' + (error as Error).message,
		});
	}
}

/**
 * Make an authenticated API request to Instagram Graph API
 */
export async function instagramApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	// Get valid access token (will auto-refresh if needed)
	const accessToken = await getAccessToken.call(this);

	const options: IRequestOptions = {
		method,
		body,
		qs: {
			...qs,
			access_token: accessToken,
		},
		url: `https://graph.instagram.com/v23.0${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an authenticated API request with pagination support
 */
export async function instagramApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any[]> {
	const returnData: any[] = [];
	let responseData;

	qs.limit = 100;

	do {
		responseData = await instagramApiRequest.call(this, method, endpoint, body, qs);
		if (responseData.data) {
			returnData.push(...responseData.data);
		}
		if (responseData.paging?.next) {
			const url = new URL(responseData.paging.next);
			qs.after = url.searchParams.get('after');
		} else {
			break;
		}
	} while (responseData.paging?.next);

	return returnData;
}

/**
 * Validate Instagram Webhook Signature
 */
export function validateSignature(payload: string, signature: string, appSecret: string): boolean {
	const hmac = crypto.createHmac('sha256', appSecret);
	const expectedSignature = 'sha256=' + hmac.update(payload).digest('hex');

	try {
		return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
	} catch (error) {
		return false;
	}
}

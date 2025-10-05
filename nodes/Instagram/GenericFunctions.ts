import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	IWebhookFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import * as crypto from 'crypto';

/**
 * Get Instagram Business Account ID from the authenticated user
 */
export async function getInstagramBusinessAccountId(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
): Promise<string> {
	try {
		const options: IRequestOptions = {
			method: 'GET',
			url: 'https://graph.facebook.com/v23.0/me',
			qs: {
				fields: 'id,name,account_type,media_count,user_id,username',
			},
			json: true,
		};

		const response = await this.helpers.requestOAuth2.call(this, 'instagramOAuth2Api', options);
		
		if (response.data && response.data.length > 0) {
			const igAccount = response.data[0];
			if (igAccount && igAccount.id) {
				return igAccount.id;
			}
		}
		
		throw new Error('No Instagram Business Account found. Make sure your Facebook Page is connected to an Instagram Business Account.');
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: 'Failed to fetch Instagram Business Account ID',
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
	const options: IRequestOptions = {
		method,
		body,
		qs,
		url: `https://graph.instagram.com/v23.0${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	try {
		return await this.helpers.requestOAuth2.call(this, 'instagramOAuth2Api', options);
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

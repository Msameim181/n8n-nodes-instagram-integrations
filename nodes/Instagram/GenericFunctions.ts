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
 * Make an authenticated API request to Instagram Graph API
 */
export async function instagramApiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('instagramApi');

	const options: IRequestOptions = {
		method,
		body,
		qs: {
			access_token: credentials.accessToken,
			...qs,
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

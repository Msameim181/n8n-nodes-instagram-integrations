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

// Token cache to store validated tokens per credential
const tokenCache = new Map<string, { token: string; expiresAt: number; lastCheck: number }>();

/**
 * Exchange short-lived token for long-lived token (60 days)
 */
async function exchangeForLongLivedToken(
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
async function refreshLongLivedToken(
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
 * Get and manage access token with automatic refresh
 */
export async function getAccessToken(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
): Promise<string> {
	const credentials = (await this.getCredentials('instagramOAuth2Api')) as ICredentialDataDecryptedObject;
	const now = Math.floor(Date.now() / 1000);
	
	// Get OAuth token data
	const oauthTokenData = credentials.oauthTokenData as any;
	let accessToken = oauthTokenData?.access_token as string;
	
	if (!accessToken) {
		throw new Error('No access token found. Please reconnect your Instagram account.');
	}
	
	// Get stored long-lived token data
	let longLivedToken = credentials.longLivedToken as string;
	let tokenExpiresAt = credentials.tokenExpiresAt as number || 0;
	const clientSecret = credentials.clientSecret as string;
	const clientId = credentials.clientId as string;
	
	// Create a unique cache key for this credential
	const cacheKey = `${clientId}_${accessToken.substring(0, 10)}`;
	
	// Check cache first
	const cached = tokenCache.get(cacheKey);
	if (cached && cached.token && cached.expiresAt > now + (24 * 60 * 60)) {
		// Cache is valid and token expires in more than 1 day
		return cached.token;
	}
	
	// Check if we need to get a long-lived token for the first time
	if (!longLivedToken || tokenExpiresAt === 0) {
		try {
			const longLivedData = await exchangeForLongLivedToken(accessToken, clientSecret);
			
			longLivedToken = longLivedData.access_token;
			tokenExpiresAt = now + longLivedData.expires_in;
			
			// Cache the token
			tokenCache.set(cacheKey, {
				token: longLivedToken,
				expiresAt: tokenExpiresAt,
				lastCheck: now,
			});
			
			// Log for user to manually update credential
			console.log(`Instagram: New long-lived token generated. Please save these values in your credential:
- Long-Lived Token: ${longLivedToken}
- Token Expires At: ${tokenExpiresAt}
- Token Type: long-lived`);
			
			return longLivedToken;
		} catch (error) {
			// If exchange fails, use short-lived token but warn
			console.warn('Failed to exchange for long-lived token, using short-lived token:', error);
			return accessToken;
		}
	}
	
	// Check if token is expired or near expiration (90% of lifetime)
	const totalLifetime = 60 * 24 * 60 * 60; // 60 days in seconds
	const tokenAge = now - (tokenExpiresAt - totalLifetime);
	const lifetimeUsed = tokenAge / totalLifetime;
	
	// Token is expired
	if (now >= tokenExpiresAt) {
		throw new Error('Instagram access token has expired. Please reconnect your account.');
	}
	
	// Token is near expiration (>90% of lifetime) and eligible for refresh (>24 hours old)
	if (lifetimeUsed >= 0.9 && tokenAge >= (24 * 60 * 60)) {
		try {
			console.log(`Instagram: Token is at ${(lifetimeUsed * 100).toFixed(1)}% of lifetime. Attempting refresh...`);
			
			const refreshedData = await refreshLongLivedToken(longLivedToken);
			
			longLivedToken = refreshedData.access_token;
			tokenExpiresAt = now + refreshedData.expires_in;
			
			// Cache the refreshed token
			tokenCache.set(cacheKey, {
				token: longLivedToken,
				expiresAt: tokenExpiresAt,
				lastCheck: now,
			});
			
			// Log for user to manually update credential
			console.log(`Instagram: Token refreshed successfully. Please update your credential with:
- Long-Lived Token: ${longLivedToken}
- Token Expires At: ${tokenExpiresAt}`);
			
			return longLivedToken;
		} catch (error) {
			console.warn('Failed to refresh token, attempting to exchange OAuth token...', error);
			// If refresh fails, try to exchange the OAuth token for a new long-lived token
			try {
				const longLivedData = await exchangeForLongLivedToken(accessToken, clientSecret);
				
				longLivedToken = longLivedData.access_token;
				tokenExpiresAt = now + longLivedData.expires_in;
				
				// Cache the token
				tokenCache.set(cacheKey, {
					token: longLivedToken,
					expiresAt: tokenExpiresAt,
					lastCheck: now,
				});
				
				console.log(`Instagram: New long-lived token generated via exchange. Please update your credential with:
- Long-Lived Token: ${longLivedToken}
- Token Expires At: ${tokenExpiresAt}
- Token Type: long-lived`);
				
				return longLivedToken;
			} catch (exchangeError) {
				throw new Error('Token refresh failed and exchange failed. Please reconnect your Instagram account.');
			}
		}
	}
	
	// Token is still valid and not near expiration
	// Cache it for future requests
	tokenCache.set(cacheKey, {
		token: longLivedToken,
		expiresAt: tokenExpiresAt,
		lastCheck: now,
	});
	
	return longLivedToken;
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

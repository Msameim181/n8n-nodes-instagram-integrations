import type {
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	INodeExecutionData,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { validateSignature } from './GenericFunctions';
import type { IInstagramWebhook, IMessagingEvent } from './types';

export class InstagramTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instagram Trigger',
		name: 'instagramTrigger',
		icon: 'file:instagram.svg',
		group: ['trigger'],
		version: 1,
		description: 'Triggers workflow on Instagram webhook events (messages, postbacks, etc.)',
		defaults: {
			name: 'Instagram Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'instagramApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: '={{$parameter["httpMethod"] || "POST"}}',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'Messages',
						value: 'messages',
						description: 'Trigger on new messages received',
					},
					{
						name: 'Postbacks',
						value: 'messaging_postbacks',
						description: 'Trigger when user clicks a button',
					},
					{
						name: 'Opt-Ins',
						value: 'messaging_optins',
						description: 'Trigger when user opts in',
					},
				],
				default: ['messages'],
				description: 'The events to listen to',
			},
			{
				displayName:
					'To set up the webhook, you need to configure it in your Meta App Dashboard. Use this webhook URL in the callback URL field.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const query = this.getQueryData() as IDataObject;
		const headerData = this.getHeaderData() as IDataObject;
		const bodyData = this.getBodyData() as IDataObject;
		const credentials = await this.getCredentials('instagramApi');

		// ==================== Handle GET Request (Webhook Verification) ====================
		if (req.method === 'GET') {
			const mode = query['hub.mode'] as string;
			const token = query['hub.verify_token'] as string;
			const challenge = query['hub.challenge'] as string;

			const verifyToken = credentials.webhookVerifyToken as string;

			if (mode === 'subscribe' && token === verifyToken) {
				return {
					webhookResponse: challenge,
				};
			} else {
				throw new NodeOperationError(this.getNode(), 'Webhook verification failed: Invalid verify token');
			}
		}

		// ==================== Handle POST Request (Webhook Events) ====================
		if (req.method === 'POST') {
			// Validate signature
			const signature = headerData['x-hub-signature-256'] as string;
			const appSecret = credentials.appSecret as string;

			if (!signature) {
				throw new NodeOperationError(this.getNode(), 'Webhook authentication failed: No signature provided');
			}

			const isValid = validateSignature(JSON.stringify(bodyData), signature, appSecret);

			if (!isValid) {
				throw new NodeOperationError(this.getNode(), 'Webhook authentication failed: Invalid signature');
			}

			// Parse webhook payload
			const webhookData = bodyData as unknown as IInstagramWebhook;
			const returnData: INodeExecutionData[] = [];
			const events = this.getNodeParameter('events', []) as string[];

			for (const entry of webhookData.entry || []) {
				if (entry.messaging) {
					for (const messagingEvent of entry.messaging as IMessagingEvent[]) {
						// Extract message data
						const data: IDataObject = {
							senderId: messagingEvent.sender.id,
							recipientId: messagingEvent.recipient.id,
							timestamp: messagingEvent.timestamp,
							entryId: entry.id,
						};

						let shouldInclude = false;

						// Handle message events
						if (messagingEvent.message && events.includes('messages')) {
							data.eventType = 'message';
							data.messageId = messagingEvent.message.mid;
							data.text = messagingEvent.message.text;
							data.attachments = messagingEvent.message.attachments;
							if (messagingEvent.message.quick_reply) {
								data.quickReplyPayload = messagingEvent.message.quick_reply.payload;
							}
							shouldInclude = true;
						}

						// Handle postback events
						if (messagingEvent.postback && events.includes('messaging_postbacks')) {
							data.eventType = 'postback';
							data.payload = messagingEvent.postback.payload;
							data.title = messagingEvent.postback.title;
							shouldInclude = true;
						}

						// Handle opt-in events
						if (messagingEvent.optin && events.includes('messaging_optins')) {
							data.eventType = 'optin';
							data.ref = messagingEvent.optin.ref;
							shouldInclude = true;
						}

						if (shouldInclude) {
							returnData.push({ json: data });
						}
					}
				}
			}

			return {
				workflowData: [returnData],
			};
		}

		throw new NodeOperationError(this.getNode(), 'Method not allowed');
	}
}

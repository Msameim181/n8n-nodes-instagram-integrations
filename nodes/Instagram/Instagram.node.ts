import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { instagramApiRequest, getInstagramBusinessAccountId } from './GenericFunctions';
import type { IButton, IGenericElement, IQuickReply } from './types';

export class Instagram implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Instagram',
		name: 'instagram',
		icon: 'file:instagram-large.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send messages and interact with Instagram users via Messaging API',
		defaults: {
			name: 'Instagram',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'instagramOAuth2Api',
				required: true,
			},
		],
		properties: [
			// Resource selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'message',
			},

			// Message Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
			},
		},
		options: [
			{
				name: 'Send Audio',
				value: 'sendAudio',
				description: 'Send an audio message',
				action: 'Send an audio message',
			},
			{
				name: 'Send Button Template',
				value: 'sendButtonTemplate',
				description: 'Send a message with buttons',
				action: 'Send a button template message',
			},
			{
				name: 'Send Generic Template',
				value: 'sendGenericTemplate',
				description: 'Send a carousel of cards',
				action: 'Send a generic template message',
			},
			{
				name: 'Send Image',
				value: 'sendImage',
				description: 'Send an image message',
				action: 'Send an image message',
			},
			{
				name: 'Send Quick Replies',
				value: 'sendQuickReplies',
				description: 'Send a message with quick reply options',
				action: 'Send a message with quick replies',
			},
			{
				name: 'Send Text',
				value: 'sendText',
				description: 'Send a text message',
				action: 'Send a text message',
			},
			{
				name: 'Send Video',
				value: 'sendVideo',
				description: 'Send a video message',
				action: 'Send a video message',
			},
			{
				name: 'Upload Media',
				value: 'uploadMedia',
				description: 'Upload media to Instagram',
				action: 'Upload media',
			},
		],
		default: 'sendText',
	},			// User Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['user'],
					},
				},
				options: [
					{
						name: 'Get My Profile',
						value: 'getMyProfile',
						description: 'Get authenticated account profile information',
						action: 'Get my profile',
					},
					{
						name: 'Get Profile',
						value: 'getProfile',
						description: 'Get user profile information by ID',
						action: 'Get user profile',
					},
				],
				default: 'getMyProfile',
			},

			// ==================== Send Text Message ====================
			{
				displayName: 'Recipient ID',
				name: 'recipientId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendText'],
					},
				},
				default: '',
				placeholder: '1234567890',
				description: 'Instagram-scoped user ID (IGSID) of the recipient',
			},
			{
				displayName: 'Message',
				name: 'messageText',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendText'],
					},
				},
				default: '',
				placeholder: 'Hello from N8N!',
				description: 'Text message to send (max 1000 characters)',
			},

			// ==================== Send Image Message ====================
			{
				displayName: 'Recipient ID',
				name: 'recipientId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendImage'],
					},
				},
				default: '',
				placeholder: '1234567890',
				description: 'Instagram-scoped user ID (IGSID) of the recipient',
			},
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendImage'],
					},
				},
				default: '',
				placeholder: 'https://example.com/photo.jpg',
				description: 'Public HTTPS URL of the image (JPG, PNG)',
			},
			{
				displayName: 'Is Reusable',
				name: 'isReusable',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendImage'],
					},
				},
				default: false,
				description: 'Whether to make the attachment reusable for multiple recipients',
			},

			// ==================== Send Audio Message ====================
			{
				displayName: 'Recipient ID',
				name: 'recipientId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendAudio'],
					},
				},
				default: '',
				placeholder: '1234567890',
				description: 'Instagram-scoped user ID (IGSID) of the recipient',
			},
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendAudio'],
					},
				},
				default: '',
				placeholder: 'https://example.com/voice.mp3',
				description: 'Public HTTPS URL of the audio file',
			},
			{
				displayName: 'Is Reusable',
				name: 'isReusable',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendAudio'],
					},
				},
				default: false,
				description: 'Whether to make the attachment reusable for multiple recipients',
			},

			// ==================== Send Video Message ====================
			{
				displayName: 'Recipient ID',
				name: 'recipientId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendVideo'],
					},
				},
				default: '',
				placeholder: '1234567890',
				description: 'Instagram-scoped user ID (IGSID) of the recipient',
			},
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendVideo'],
					},
				},
				default: '',
				placeholder: 'https://example.com/video.mp4',
				description: 'Public HTTPS URL of the video file',
			},
			{
				displayName: 'Is Reusable',
				name: 'isReusable',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendVideo'],
					},
				},
				default: false,
				description: 'Whether to make the attachment reusable for multiple recipients',
			},

			// ==================== Send Button Template ====================
			{
				displayName: 'Recipient ID',
				name: 'recipientId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendButtonTemplate'],
					},
				},
				default: '',
				placeholder: '1234567890',
				description: 'Instagram-scoped user ID (IGSID) of the recipient',
			},
			{
				displayName: 'Message Text',
				name: 'messageText',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendButtonTemplate'],
					},
				},
				default: '',
				placeholder: 'Choose an option:',
				description: 'Text to display above buttons (max 640 characters)',
			},
			{
				displayName: 'Buttons',
				name: 'buttons',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					maxValues: 3,
				},
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendButtonTemplate'],
					},
				},
				default: {},
				placeholder: 'Add Button',
				options: [
					{
						name: 'button',
						displayName: 'Button',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{
										name: 'Web URL',
										value: 'web_url',
									},
									{
										name: 'Postback',
										value: 'postback',
									},
								],
								default: 'web_url',
								description: 'Type of button',
							},
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								placeholder: 'Click Me',
								description: 'Button title (max 20 characters)',
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								displayOptions: {
									show: {
										type: ['web_url'],
									},
								},
								default: '',
								placeholder: 'https://example.com',
								description: 'Button URL (must be HTTPS)',
							},
							{
								displayName: 'Payload',
								name: 'payload',
								type: 'string',
								displayOptions: {
									show: {
										type: ['postback'],
									},
								},
								default: '',
								placeholder: 'BUTTON_CLICKED',
								description: 'Postback payload (max 1000 characters)',
							},
						],
					},
				],
			},

			// ==================== Send Generic Template ====================
			{
				displayName: 'Recipient ID',
				name: 'recipientId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendGenericTemplate'],
					},
				},
				default: '',
				placeholder: '1234567890',
				description: 'Instagram-scoped user ID (IGSID) of the recipient',
			},
			{
				displayName: 'Elements',
				name: 'elements',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					maxValues: 10,
				},
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendGenericTemplate'],
					},
				},
				default: {},
				placeholder: 'Add Element',
				options: [
					{
						name: 'element',
						displayName: 'Element',
						values: [
							{
						displayName: 'Buttons',
						name: 'buttons',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
							maxValues: 3,
						},
						default: {},
						placeholder: 'Add Button',
						options: [
									{
										name: 'button',
										displayName: 'Button',
											values:	[
													{
												displayName: 'Type',
												name: 'type',
												type: 'options',
												options: [
															{
																name: 'Web URL',
																value: 'web_url',
															},
															{
																name: 'Postback',
																value: 'postback',
															},
														],
												default: 'web_url',
												description: 'Type of button',
													},
													{
												displayName: 'Title',
												name: 'title',
												type: 'string',
												default: '',
												placeholder: 'Click Me',
												description: 'Button title (max 20 characters)',
													},
													{
												displayName: 'URL',
												name: 'url',
												type: 'string',
												default: '',
												placeholder: 'https://example.com',
												description: 'Button URL (must be HTTPS)',
													},
													{
												displayName: 'Payload',
												name: 'payload',
												type: 'string',
												default: '',
												placeholder: 'BUTTON_CLICKED',
												description: 'Postback payload (max 1000 characters)',
													},
											]
									},
					]
							},
							{
						displayName: 'Default Action',
						name: 'default_action',
						type: 'fixedCollection',
						default: {},
						options: [
									{
										name: 'action',
										displayName: 'Action',
											values:	[
													{
												displayName: 'URL',
												name: 'url',
												type: 'string',
												default: '',
												placeholder: 'https://example.com',
												description: 'URL to open when card is tapped (must be HTTPS)',
													},
											]
									},
					]
							},
							{
						displayName: 'Image URL',
						name: 'image_url',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/image.jpg',
						description: 'Image URL for the card',
							},
							{
						displayName: 'Subtitle',
						name: 'subtitle',
						type: 'string',
						default: '',
						placeholder: 'Card subtitle',
						description: 'Element subtitle (max 80 characters)',
							},
							{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						placeholder: 'Card Title',
						description: 'Element title (max 80 characters)',
							},
					],
					},
				],
			},

			// ==================== Send Quick Replies ====================
			{
				displayName: 'Recipient ID',
				name: 'recipientId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendQuickReplies'],
					},
				},
				default: '',
				placeholder: '1234567890',
				description: 'Instagram-scoped user ID (IGSID) of the recipient',
			},
			{
				displayName: 'Message Text',
				name: 'messageText',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendQuickReplies'],
					},
				},
				default: '',
				placeholder: 'Choose an option:',
				description: 'Text message to display with quick replies',
			},
			{
				displayName: 'Quick Replies',
				name: 'quickReplies',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					maxValues: 13,
				},
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendQuickReplies'],
					},
				},
				default: {},
				placeholder: 'Add Quick Reply',
				options: [
					{
						name: 'quickReply',
						displayName: 'Quick Reply',
						values: [
							{
								displayName: 'Title',
								name: 'title',
								type: 'string',
								default: '',
								placeholder: 'Option 1',
								description: 'Quick reply title (max 20 characters)',
							},
							{
								displayName: 'Payload',
								name: 'payload',
								type: 'string',
								default: '',
								placeholder: 'OPTION_1',
								description: 'Payload sent back when clicked (max 1000 characters)',
							},
						],
					},
				],
			},

			// ==================== Upload Media ====================
			{
				displayName: 'Media Type',
				name: 'mediaType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['uploadMedia'],
					},
				},
				options: [
					{
						name: 'Image',
						value: 'IMAGE',
					},
					{
						name: 'Video',
						value: 'VIDEO',
					},
					{
						name: 'Reels',
						value: 'REELS',
					},
					{
						name: 'Stories',
						value: 'STORIES',
					},
				],
				default: 'IMAGE',
				description: 'Type of media to upload',
			},
			{
				displayName: 'Media URL',
				name: 'mediaUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['uploadMedia'],
					},
				},
				default: '',
				placeholder: 'https://example.com/image.jpg',
				description: 'Public URL of the media file',
			},
			{
				displayName: 'Caption',
				name: 'caption',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['uploadMedia'],
					},
				},
				default: '',
				placeholder: 'Check out this photo!',
				description: 'Caption for the media',
			},

			// ==================== Get User Profile ====================
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getProfile'],
					},
				},
				default: '',
				placeholder: '1234567890',
				description: 'Instagram-scoped user ID (IGSID)',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'multiOptions',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getProfile'],
					},
				},
				options: [
					{
						name: 'Follower Count',
						value: 'follower_count',
					},
					{
						name: 'ID',
						value: 'id',
					},
					{
						name: 'Is Business Follow User',
						value: 'is_business_follow_user',
					},
					{
						name: 'Is User Follow Business',
						value: 'is_user_follow_business',
					},
					{
						name: 'Is Verified User',
						value: 'is_verified_user',
					},
					{
						name: 'Name',
						value: 'name',
					},
					{
						name: 'Profile Picture',
						value: 'profile_pic',
					},
					{
						name: 'Username',
						value: 'username',
					},
				],
				default: ['id', 'name', 'username','follower_count'],
				description: 'Fields to retrieve from user profile',
			},

			// ==================== Get My Profile Fields ====================
			{
				displayName: 'Fields',
				name: 'myProfileFields',
				type: 'multiOptions',
				displayOptions: {
					show: {
						resource: ['user'],
						operation: ['getMyProfile'],
					},
				},
				options: [
					{
						name: 'Account Type',
						value: 'account_type',
					},
					{
						name: 'Followers Count',
						value: 'followers_count',
					},
					{
						name: 'Follows Count',
						value: 'follows_count',
					},
					{
						name: 'ID',
						value: 'id',
					},
					{
						name: 'Media Count',
						value: 'media_count',
					},
					{
						name: 'Name',
						value: 'name',
					},
					{
						name: 'Profile Picture URL',
						value: 'profile_picture_url',
					},
					{
						name: 'User ID',
						value: 'user_id',
					},
					{
						name: 'Username',
						value: 'username',
					},
				],
				default: ['id', 'username', 'name', 'account_type'],
				description: 'Fields to retrieve from authenticated user profile',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'message') {
					// ==================== Send Text Message ====================
					if (operation === 'sendText') {
						const recipientId = this.getNodeParameter('recipientId', i) as string;
						const messageText = this.getNodeParameter('messageText', i) as string;

						const body = {
							recipient: { id: recipientId },
							message: { text: messageText },
						};

						const responseData = await instagramApiRequest.call(this, 'POST', '/me/messages', body);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Send Image Message ====================
					else if (operation === 'sendImage') {
						const recipientId = this.getNodeParameter('recipientId', i) as string;
						const imageUrl = this.getNodeParameter('imageUrl', i) as string;
						const isReusable = this.getNodeParameter('isReusable', i) as boolean;

						const body = {
							recipient: { id: recipientId },
							message: {
								attachment: {
									type: 'image',
									payload: {
										url: imageUrl,
										is_reusable: isReusable,
									},
								},
							},
						};

						const responseData = await instagramApiRequest.call(this, 'POST', '/me/messages', body);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Send Audio Message ====================
					else if (operation === 'sendAudio') {
						const recipientId = this.getNodeParameter('recipientId', i) as string;
						const audioUrl = this.getNodeParameter('audioUrl', i) as string;
						const isReusable = this.getNodeParameter('isReusable', i) as boolean;

						const body = {
							recipient: { id: recipientId },
							message: {
								attachment: {
									type: 'audio',
									payload: {
										url: audioUrl,
										is_reusable: isReusable,
									},
								},
							},
						};

						const responseData = await instagramApiRequest.call(this, 'POST', '/me/messages', body);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Send Video Message ====================
					else if (operation === 'sendVideo') {
						const recipientId = this.getNodeParameter('recipientId', i) as string;
						const videoUrl = this.getNodeParameter('videoUrl', i) as string;
						const isReusable = this.getNodeParameter('isReusable', i) as boolean;

						const body = {
							recipient: { id: recipientId },
							message: {
								attachment: {
									type: 'video',
									payload: {
										url: videoUrl,
										is_reusable: isReusable,
									},
								},
							},
						};

						const responseData = await instagramApiRequest.call(this, 'POST', '/me/messages', body);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Send Button Template ====================
					else if (operation === 'sendButtonTemplate') {
						const recipientId = this.getNodeParameter('recipientId', i) as string;
						const messageText = this.getNodeParameter('messageText', i) as string;
						const buttonsData = this.getNodeParameter('buttons', i) as any;

						const buttons: IButton[] = [];
						if (buttonsData.button) {
							for (const button of buttonsData.button) {
								const buttonObj: IButton = {
									type: button.type,
									title: button.title,
								};
								if (button.type === 'web_url') {
									buttonObj.url = button.url;
								} else {
									buttonObj.payload = button.payload;
								}
								buttons.push(buttonObj);
							}
						}

						const body = {
							recipient: { id: recipientId },
							message: {
								attachment: {
									type: 'template',
									payload: {
										template_type: 'button',
										text: messageText,
										buttons,
									},
								},
							},
						};

						const responseData = await instagramApiRequest.call(this, 'POST', '/me/messages', body);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Send Generic Template ====================
					else if (operation === 'sendGenericTemplate') {
						const recipientId = this.getNodeParameter('recipientId', i) as string;
						const elementsData = this.getNodeParameter('elements', i) as any;

					const elements: IGenericElement[] = [];
					if (elementsData.element && Array.isArray(elementsData.element)) {
						for (const elem of elementsData.element) {
							const element: IGenericElement = {
								title: elem.title,
							};								if (elem.subtitle) element.subtitle = elem.subtitle;
								if (elem.image_url) element.image_url = elem.image_url;


							if (elem.default_action?.action?.url) {
								element.default_action = {
									type: 'web_url',
									url: elem.default_action.action.url,
								};
							}

							if (elem.buttons?.button && Array.isArray(elem.buttons.button)) {
								element.buttons = [];
								for (const button of elem.buttons.button) {
									const buttonObj: IButton = {
										type: button.type,
										title: button.title,
									};
									if (button.type === 'web_url') {
										buttonObj.url = button.url;
									} else {
										buttonObj.payload = button.payload;
									}
									element.buttons.push(buttonObj);
								}
							}

							elements.push(element);
						}
					}
						const body = {
							recipient: { id: recipientId },
							message: {
								attachment: {
									type: 'template',
									payload: {
										template_type: 'generic',
										elements,
									},
								},
							},
						};

						const responseData = await instagramApiRequest.call(this, 'POST', '/me/messages', body);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Send Quick Replies ====================
					else if (operation === 'sendQuickReplies') {
						const recipientId = this.getNodeParameter('recipientId', i) as string;
						const messageText = this.getNodeParameter('messageText', i) as string;
					const quickRepliesData = this.getNodeParameter('quickReplies', i) as any;

					const quickReplies: IQuickReply[] = [];
					if (quickRepliesData.quickReply && Array.isArray(quickRepliesData.quickReply)) {
						for (const qr of quickRepliesData.quickReply) {
							const quickReply: IQuickReply = {
								content_type: 'text',
								title: qr.title,
								payload: qr.payload,
							};
							quickReplies.push(quickReply);
						}
					}

					const body = {
							recipient: { id: recipientId },
							message: {
								text: messageText,
								quick_replies: quickReplies,
							},
						};

						const responseData = await instagramApiRequest.call(this, 'POST', '/me/messages', body);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Upload Media ====================
				else if (operation === 'uploadMedia') {
					// Get Instagram Business Account ID
					const igUserId = await getInstagramBusinessAccountId.call(this);
					const mediaType = this.getNodeParameter('mediaType', i) as string;
					const mediaUrl = this.getNodeParameter('mediaUrl', i) as string;
					const caption = this.getNodeParameter('caption', i, '') as string;						const body: any = {
							image_url: mediaUrl,
							caption,
						};

						if (mediaType === 'VIDEO' || mediaType === 'REELS') {
							body.video_url = mediaUrl;
							delete body.image_url;
							body.media_type = mediaType;
						}

						const responseData = await instagramApiRequest.call(
							this,
							'POST',
							`/${igUserId}/media`,
							body,
						);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}
				}

				// ==================== User Operations ====================
				else if (resource === 'user') {
					// ==================== Get My Profile ====================
					if (operation === 'getMyProfile') {
						const fields = this.getNodeParameter('myProfileFields', i) as string[];

						const responseData = await instagramApiRequest.call(this, 'GET', '/me', {}, {
							fields: fields.join(','),
						});
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Get User Profile ====================
					else if (operation === 'getProfile') {
						const userId = this.getNodeParameter('userId', i) as string;
						const fields = this.getNodeParameter('fields', i) as string[];

						const responseData = await instagramApiRequest.call(this, 'GET', `/${userId}`, {}, {
							fields: fields.join(','),
						});
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error.message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

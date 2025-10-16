import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

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
						name: 'Media',
						value: 'media',
					},
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'Post',
						value: 'post',
					},
					{
						name: 'Story',
						value: 'story',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'message',
			},			// Message Operations
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
	},

			// Media Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['media'],
					},
				},
				options: [
					{
						name: 'Get Media',
						value: 'getMedia',
						description: 'Get media object information',
						action: 'Get media',
					},
					{
						name: 'Get Media Children',
						value: 'getMediaChildren',
						description: 'Get children of a carousel album',
						action: 'Get media children',
					},
					{
						name: 'List Media',
						value: 'listMedia',
						description: 'Get list of media objects',
						action: 'List media',
					},
				],
				default: 'listMedia',
			},

			// Post Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['post'],
					},
				},
				options: [
					{
						name: 'Create Single Post',
						value: 'createSinglePost',
						description: 'Create a single image or video post',
						action: 'Create a single post',
					},
					{
						name: 'Create Carousel Post',
						value: 'createCarouselPost',
						description: 'Create a carousel post with multiple images/videos',
						action: 'Create a carousel post',
					},
					{
						name: 'Create Reel',
						value: 'createReel',
						description: 'Create a reel (short video)',
						action: 'Create a reel',
					},
					{
						name: 'Publish Post',
						value: 'publishPost',
						description: 'Publish a media container',
						action: 'Publish a post',
					},
				],
				default: 'createSinglePost',
			},

			// Story Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['story'],
					},
				},
				options: [
					{
						name: 'Create Story',
						value: 'createStory',
						description: 'Create a story (image or video)',
						action: 'Create a story',
					},
				],
				default: 'createStory',
			},

			// User Operations
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

			// ==================== Media Operations ====================
			// List Media
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['media'],
						operation: ['listMedia'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['media'],
						operation: ['listMedia'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Fields',
				name: 'mediaFields',
				type: 'multiOptions',
				displayOptions: {
					show: {
						resource: ['media'],
						operation: ['listMedia'],
					},
				},
				options: [
					{ name: 'Caption', value: 'caption' },
					{ name: 'Comments Count', value: 'comments_count' },
					{ name: 'ID', value: 'id' },
					{ name: 'Is Comment Enabled', value: 'is_comment_enabled' },
					{ name: 'Like Count', value: 'like_count' },
					{ name: 'Media Type', value: 'media_type' },
					{ name: 'Media URL', value: 'media_url' },
					{ name: 'Owner', value: 'owner' },
					{ name: 'Permalink', value: 'permalink' },
					{ name: 'Thumbnail URL', value: 'thumbnail_url' },
					{ name: 'Timestamp', value: 'timestamp' },
					{ name: 'Username', value: 'username' },
				],
				default: ['id', 'media_type', 'media_url', 'permalink', 'timestamp'],
				description: 'Fields to retrieve for each media item',
			},

			// Get Media
			{
				displayName: 'Media ID',
				name: 'mediaId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['media'],
						operation: ['getMedia', 'getMediaChildren'],
					},
				},
				default: '',
				placeholder: '17895695668004550',
				description: 'ID of the media object',
			},
			{
				displayName: 'Fields',
				name: 'mediaDetailFields',
				type: 'multiOptions',
				displayOptions: {
					show: {
						resource: ['media'],
						operation: ['getMedia'],
					},
				},
				options: [
					{ name: 'Caption', value: 'caption' },
					{ name: 'Children', value: 'children' },
					{ name: 'Comments Count', value: 'comments_count' },
					{ name: 'ID', value: 'id' },
					{ name: 'Is Comment Enabled', value: 'is_comment_enabled' },
					{ name: 'Like Count', value: 'like_count' },
					{ name: 'Media Product Type', value: 'media_product_type' },
					{ name: 'Media Type', value: 'media_type' },
					{ name: 'Media URL', value: 'media_url' },
					{ name: 'Owner', value: 'owner' },
					{ name: 'Permalink', value: 'permalink' },
					{ name: 'Shortcode', value: 'shortcode' },
					{ name: 'Thumbnail URL', value: 'thumbnail_url' },
					{ name: 'Timestamp', value: 'timestamp' },
					{ name: 'Username', value: 'username' },
				],
				default: ['id', 'media_type', 'media_url', 'permalink', 'caption'],
				description: 'Fields to retrieve for the media object',
			},

			// ==================== Post Operations ====================
			// Create Single Post
			{
				displayName: 'Media Type',
				name: 'postMediaType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createSinglePost'],
					},
				},
				options: [					{ name: 'Image', value: 'IMAGE' },
					{ name: 'Video', value: 'VIDEO' },
				],
				default: 'IMAGE',
				description: 'Type of media for the post',
			},
			{
				displayName: 'Image URL',
				name: 'postImageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createSinglePost'],
						postMediaType: ['IMAGE'],
					},
				},
				default: '',
				placeholder: 'https://example.com/image.jpg',
				description: 'Public URL of the image (must be HTTPS)',
			},
			{
				displayName: 'Video URL',
				name: 'postVideoUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createSinglePost'],
						postMediaType: ['VIDEO'],
					},
				},
				default: '',
				placeholder: 'https://example.com/video.mp4',
				description: 'Public URL of the video (must be HTTPS)',
			},
			{
				displayName: 'Caption',
				name: 'postCaption',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createSinglePost'],
					},
				},
				default: '',
				placeholder: 'Check out this amazing photo! #instagram',
				description: 'Caption for the post (supports hashtags and @mentions)',
			},
			{
				displayName: 'Additional Options',
				name: 'postAdditionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createSinglePost'],
					},
				},
				options: [
					{
						displayName: 'Collaborators',
						name: 'collaborators',
						type: 'string',
						default: '',
						placeholder: '["17841400001234567","17841400009876543"]',
						description: 'JSON array of Instagram account IDs to tag as collaborators',
					},
					{
						displayName: 'Location ID',
						name: 'location_id',
						type: 'string',
						default: '',
						placeholder: '123456789',
						description: 'Facebook Page ID to tag the post location',
					},
					{
						displayName: 'Product Tags',
						name: 'product_tags',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						placeholder: 'Add Product Tag',
						description: 'Tag products in the photo (requires Instagram Shopping)',
						options: [
							{
								name: 'tag',
								displayName: 'Product Tag',
								values: [
									{
										displayName: 'Product ID',
										name: 'product_id',
										type: 'string',
										default: '',
										placeholder: '1234567890',
										description: 'Facebook catalog product ID',
									},
									{
										displayName: 'X Position',
										name: 'x',
										type: 'number',
										typeOptions: {
											minValue: 0,
											maxValue: 1,
											numberPrecision: 2,
										},
										default: 0.5,
										description: 'X coordinate (0.0 to 1.0)',
									},
									{
										displayName: 'Y Position',
										name: 'y',
										type: 'number',
										typeOptions: {
											minValue: 0,
											maxValue: 1,
											numberPrecision: 2,
										},
										default: 0.5,
										description: 'Y coordinate (0.0 to 1.0)',
									},
								],
							},
						],
					},
					{
						displayName: 'Share to Feed',
						name: 'share_to_feed',
						type: 'boolean',
						default: true,
						description: 'Whether to share this post to feed (for reels)',
					},
				
					{
						displayName: 'Thumb Offset',
						name: 'thumb_offset',
						type: 'number',
						displayOptions: {
							show: {
								'/postMediaType': ['VIDEO'],
							},
						},
						default: 0,
						description: 'Video thumbnail frame offset in milliseconds',
					},
					{
						displayName: 'User Tags',
						name: 'user_tags',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						default: {},
						placeholder: 'Add User Tag',
						description: 'Tag users in the photo',
						options: [
							{
								name: 'tag',
								displayName: 'Tag',
								values: [
									{
										displayName: 'Username',
										name: 'username',
										type: 'string',
										default: '',
										placeholder: 'johndoe',
										description: 'Instagram username to tag',
									},
									{
										displayName: 'X Position',
										name: 'x',
										type: 'number',
										typeOptions: {
											minValue: 0,
											maxValue: 1,
											numberPrecision: 2,
										},
										default: 0.5,
										description: 'X coordinate (0.0 to 1.0)',
									},
									{
										displayName: 'Y Position',
										name: 'y',
										type: 'number',
										typeOptions: {
											minValue: 0,
											maxValue: 1,
											numberPrecision: 2,
										},
										default: 0.5,
										description: 'Y coordinate (0.0 to 1.0)',
									},
								],
							},
						],
					},],
			},

			// Create Carousel Post
			{
				displayName: 'Children',
				name: 'carouselChildren',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					minValues: 2,
					maxValues: 10,
				},
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createCarouselPost'],
					},
				},
				default: {},
				placeholder: 'Add Media Item',
				description: 'Media items for the carousel (2-10 items)',
				options: [
					{
						name: 'child',
						displayName: 'Media Item',
						values: [
							{
								displayName: 'Media Type',
								name: 'media_type',
								type: 'options',
								options: [
									{ name: 'Image', value: 'IMAGE' },
									{ name: 'Video', value: 'VIDEO' },
								],
								default: 'IMAGE',
								description: 'Type of media',
							},
							{
								displayName: 'Image URL',
								name: 'image_url',
								type: 'string',
								displayOptions: {
									show: {
										media_type: ['IMAGE'],
									},
								},
								default: '',
								placeholder: 'https://example.com/image.jpg',
								description: 'Public URL of the image',
							},
							{
								displayName: 'Video URL',
								name: 'video_url',
								type: 'string',
								displayOptions: {
									show: {
										media_type: ['VIDEO'],
									},
								},
								default: '',
								placeholder: 'https://example.com/video.mp4',
								description: 'Public URL of the video',
							},
							{
								displayName: 'User Tags',
								name: 'user_tags',
								type: 'string',
								default: '',
								placeholder: '[{"username":"johndoe","x":0.5,"y":0.5}]',
								description: 'JSON array of user tags for this media item',
							},
						],
					},
				],
			},
			{
				displayName: 'Caption',
				name: 'carouselCaption',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createCarouselPost'],
					},
				},
				default: '',
				placeholder: 'Swipe to see more! #carousel',
				description: 'Caption for the carousel post',
			},
			{
				displayName: 'Additional Options',
				name: 'carouselAdditionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createCarouselPost'],
					},
				},
				options: [
					{
						displayName: 'Location ID',
						name: 'location_id',
						type: 'string',
						default: '',
						placeholder: '123456789',
						description: 'Facebook Page ID to tag the post location',
					},
					{
						displayName: 'Collaborators',
						name: 'collaborators',
						type: 'string',
						default: '',
						placeholder: '["17841400001234567"]',
						description: 'JSON array of Instagram account IDs to tag as collaborators',
					},
				],
			},

			// Create Reel
			{
				displayName: 'Video URL',
				name: 'reelVideoUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createReel'],
					},
				},
				default: '',
				placeholder: 'https://example.com/reel.mp4',
				description: 'Public URL of the video (must be HTTPS, max 60 seconds)',
			},
			{
				displayName: 'Caption',
				name: 'reelCaption',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createReel'],
					},
				},
				default: '',
				placeholder: 'Check out this reel! #reels',
				description: 'Caption for the reel',
			},
			{
				displayName: 'Additional Options',
				name: 'reelAdditionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['createReel'],
					},
				},
				options: [					{
						displayName: 'Audio Name',
						name: 'audio_name',
						type: 'string',
						default: '',
						placeholder: 'Original Audio - Username',
						description: 'Name of the audio track',
					},
					{
						displayName: 'Collaborators',
						name: 'collaborators',
						type: 'string',
						default: '',
						placeholder: '["17841400001234567"]',
						description: 'JSON array of Instagram account IDs',
					},
					{
						displayName: 'Cover URL',
						name: 'cover_url',
						type: 'string',
						default: '',
						placeholder: 'https://example.com/cover.jpg',
						description: 'Public URL of the reel cover image',
					},
					{
						displayName: 'Location ID',
						name: 'location_id',
						type: 'string',
						default: '',
						placeholder: '123456789',
						description: 'Facebook Page ID to tag the location',
					},
					{
						displayName: 'Share to Feed',
						name: 'share_to_feed',
						type: 'boolean',
						default: true,
						description: 'Whether to share this reel to feed',
					},
					{
						displayName: 'Thumb Offset',
						name: 'thumb_offset',
						type: 'number',
						default: 0,
						description: 'Video thumbnail frame offset in milliseconds',
					},
				],
			},

			// Publish Post
			{
				displayName: 'Creation ID',
				name: 'creationId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['publishPost'],
					},
				},
				default: '',
				placeholder: '17895695668004550',
				description: 'ID of the media container to publish (from create operation)',
			},

			// ==================== Story Operations ====================
			{
				displayName: 'Media Type',
				name: 'storyMediaType',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['story'],
						operation: ['createStory'],
					},
				},
				options: [
					{ name: 'Image', value: 'IMAGE' },
					{ name: 'Video', value: 'VIDEO' },
				],
				default: 'IMAGE',
				description: 'Type of media for the story',
			},
			{
				displayName: 'Image URL',
				name: 'storyImageUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['story'],
						operation: ['createStory'],
						storyMediaType: ['IMAGE'],
					},
				},
				default: '',
				placeholder: 'https://example.com/story.jpg',
				description: 'Public URL of the image (must be HTTPS)',
			},
			{
				displayName: 'Video URL',
				name: 'storyVideoUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['story'],
						operation: ['createStory'],
						storyMediaType: ['VIDEO'],
					},
				},
				default: '',
				placeholder: 'https://example.com/story.mp4',
				description: 'Public URL of the video (must be HTTPS, max 60 seconds)',
			},
			{
				displayName: 'Additional Options',
				name: 'storyAdditionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						resource: ['story'],
						operation: ['createStory'],
					},
				},
				options: [
					{
						displayName: 'Location ID',
						name: 'location_id',
						type: 'string',
						default: '',
						placeholder: '123456789',
						description: 'Facebook Page ID to tag the story location',
					},
					{
						displayName: 'Collaborators',
						name: 'collaborators',
						type: 'string',
						default: '',
						placeholder: '["17841400001234567"]',
						description: 'JSON array of Instagram account IDs',
					},
				],
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

				// ==================== Media Operations ====================
				else if (resource === 'media') {
					const igUserId = await getInstagramBusinessAccountId.call(this);

					// ==================== List Media ====================
					if (operation === 'listMedia') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const fields = this.getNodeParameter('mediaFields', i) as string[];

						const qs: any = {
							fields: fields.join(','),
						};

						if (returnAll) {
							const { instagramApiRequestAllItems } = await import('./GenericFunctions');
							const responseData = await instagramApiRequestAllItems.call(
								this,
								'GET',
								`/${igUserId}/media`,
								{},
								qs,
							);
							responseData.forEach((item: any) => {
								returnData.push({ json: item, pairedItem: { item: i } });
							});
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;

							const responseData = await instagramApiRequest.call(
								this,
								'GET',
								`/${igUserId}/media`,
								{},
								qs,
							);

							if (responseData.data) {
								responseData.data.forEach((item: any) => {
									returnData.push({ json: item, pairedItem: { item: i } });
								});
							}
						}
					}

					// ==================== Get Media ====================
					else if (operation === 'getMedia') {
						const mediaId = this.getNodeParameter('mediaId', i) as string;
						const fields = this.getNodeParameter('mediaDetailFields', i) as string[];

						const responseData = await instagramApiRequest.call(
							this,
							'GET',
							`/${mediaId}`,
							{},
							{ fields: fields.join(',') },
						);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Get Media Children ====================
					else if (operation === 'getMediaChildren') {
						const mediaId = this.getNodeParameter('mediaId', i) as string;

						const responseData = await instagramApiRequest.call(
							this,
							'GET',
							`/${mediaId}/children`,
							{},
							{ fields: 'id,media_type,media_url,permalink,timestamp' },
						);

						if (responseData.data) {
							responseData.data.forEach((item: any) => {
								returnData.push({ json: item, pairedItem: { item: i } });
							});
						}
					}
				}

				// ==================== Post Operations ====================
				else if (resource === 'post') {
					const igUserId = await getInstagramBusinessAccountId.call(this);

					// ==================== Create Single Post ====================
					if (operation === 'createSinglePost') {
						const mediaType = this.getNodeParameter('postMediaType', i) as string;
						const caption = this.getNodeParameter('postCaption', i, '') as string;
						const additionalOptions = this.getNodeParameter('postAdditionalOptions', i, {}) as any;

						const body: any = {
							caption,
							media_type: mediaType,
						};

						if (mediaType === 'IMAGE') {
							body.image_url = this.getNodeParameter('postImageUrl', i) as string;
						} else {
							body.video_url = this.getNodeParameter('postVideoUrl', i) as string;
						}

						// Add additional options
						if (additionalOptions.location_id) {
							body.location_id = additionalOptions.location_id;
						}

						if (additionalOptions.user_tags) {
							const userTags = additionalOptions.user_tags.tag || [];
							if (userTags.length > 0) {
								body.user_tags = JSON.stringify(userTags);
							}
						}

						if (additionalOptions.product_tags) {
							const productTags = additionalOptions.product_tags.tag || [];
							if (productTags.length > 0) {
								body.product_tags = JSON.stringify(productTags);
							}
						}

						if (additionalOptions.collaborators) {
							body.collaborators = additionalOptions.collaborators;
						}

						if (additionalOptions.thumb_offset !== undefined) {
							body.thumb_offset = additionalOptions.thumb_offset;
						}

						if (additionalOptions.share_to_feed !== undefined) {
							body.share_to_feed = additionalOptions.share_to_feed;
						}

						const responseData = await instagramApiRequest.call(
							this,
							'POST',
							`/${igUserId}/media`,
							body,
						);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Create Carousel Post ====================
					else if (operation === 'createCarouselPost') {
						const childrenData = this.getNodeParameter('carouselChildren', i) as any;
						const caption = this.getNodeParameter('carouselCaption', i, '') as string;
						const additionalOptions = this.getNodeParameter('carouselAdditionalOptions', i, {}) as any;

						// Step 1: Create child media containers
						const childIds: string[] = [];

						if (childrenData.child && Array.isArray(childrenData.child)) {
							for (const child of childrenData.child) {
								const childBody: any = {
									is_carousel_item: true,
								};

								if (child.media_type === 'IMAGE') {
									childBody.image_url = child.image_url;
									childBody.media_type = 'IMAGE';
								} else {
									childBody.video_url = child.video_url;
									childBody.media_type = 'VIDEO';
								}

								if (child.user_tags) {
									childBody.user_tags = child.user_tags;
								}

								const childResponse = await instagramApiRequest.call(
									this,
									'POST',
									`/${igUserId}/media`,
									childBody,
								);

								if (childResponse.id) {
									childIds.push(childResponse.id);
								}
							}
						}

						// Step 2: Create carousel container
						const carouselBody: any = {
							media_type: 'CAROUSEL',
							children: childIds.join(','),
							caption,
						};

						if (additionalOptions.location_id) {
							carouselBody.location_id = additionalOptions.location_id;
						}

						if (additionalOptions.collaborators) {
							carouselBody.collaborators = additionalOptions.collaborators;
						}

						const responseData = await instagramApiRequest.call(
							this,
							'POST',
							`/${igUserId}/media`,
							carouselBody,
						);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Create Reel ====================
					else if (operation === 'createReel') {
						const videoUrl = this.getNodeParameter('reelVideoUrl', i) as string;
						const caption = this.getNodeParameter('reelCaption', i, '') as string;
						const additionalOptions = this.getNodeParameter('reelAdditionalOptions', i, {}) as any;

						const body: any = {
							media_type: 'REELS',
							video_url: videoUrl,
							caption,
						};

						if (additionalOptions.cover_url) {
							body.cover_url = additionalOptions.cover_url;
						}

						if (additionalOptions.audio_name) {
							body.audio_name = additionalOptions.audio_name;
						}

						if (additionalOptions.location_id) {
							body.location_id = additionalOptions.location_id;
						}

						if (additionalOptions.collaborators) {
							body.collaborators = additionalOptions.collaborators;
						}

						if (additionalOptions.share_to_feed !== undefined) {
							body.share_to_feed = additionalOptions.share_to_feed;
						}

						if (additionalOptions.thumb_offset !== undefined) {
							body.thumb_offset = additionalOptions.thumb_offset;
						}

						const responseData = await instagramApiRequest.call(
							this,
							'POST',
							`/${igUserId}/media`,
							body,
						);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}

					// ==================== Publish Post ====================
					else if (operation === 'publishPost') {
						const creationId = this.getNodeParameter('creationId', i) as string;

						const body = {
							creation_id: creationId,
						};

						const responseData = await instagramApiRequest.call(
							this,
							'POST',
							`/${igUserId}/media_publish`,
							body,
						);
						returnData.push({ json: responseData, pairedItem: { item: i } });
					}
				}

				// ==================== Story Operations ====================
				else if (resource === 'story') {
					const igUserId = await getInstagramBusinessAccountId.call(this);

					// ==================== Create Story ====================
					if (operation === 'createStory') {
						const mediaType = this.getNodeParameter('storyMediaType', i) as string;
						const additionalOptions = this.getNodeParameter('storyAdditionalOptions', i, {}) as any;

						const body: any = {
							media_type: 'STORIES',  // Use STORIES media_type for stories
						};

						if (mediaType === 'IMAGE') {
							body.image_url = this.getNodeParameter('storyImageUrl', i) as string;
						} else {
							body.video_url = this.getNodeParameter('storyVideoUrl', i) as string;
						}

						if (additionalOptions.location_id) {
							body.location_id = additionalOptions.location_id;
						}

						if (additionalOptions.collaborators) {
							body.collaborators = additionalOptions.collaborators;
						}

						// Create story container
						const createResponse = await instagramApiRequest.call(
							this,
							'POST',
							`/${igUserId}/media`,
							body,
						);

						// Wait for container to be ready and auto-publish story
						if (createResponse.id) {
							const containerId = createResponse.id;
							
							// Poll status until media is ready (max 60 seconds)
							let status = 'IN_PROGRESS';
							let attempts = 0;
							const maxAttempts = 30; // 30 attempts with 2 second intervals = 60 seconds max
							
							while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
								// Wait 2 seconds before checking status
								await new Promise(resolve => setTimeout(resolve, 2000));
								
								// Check container status
								const statusResponse = await instagramApiRequest.call(
									this,
									'GET',
									`/${containerId}`,
									{},
									{ fields: 'status_code' },
								);
								
								status = statusResponse.status_code || 'IN_PROGRESS';
								attempts++;
								
								// If status is FINISHED, ready to publish
								if (status === 'FINISHED') {
									break;
								}
								
								// If status is ERROR or EXPIRED, throw error
								if (status === 'ERROR' || status === 'EXPIRED') {
									throw new NodeOperationError(this.getNode(), `Story creation failed with status: ${status}. Please check your media file and try again.`);
								}
							}
							
							// If still IN_PROGRESS after max attempts, throw error
							if (status === 'IN_PROGRESS') {
								throw new NodeOperationError(this.getNode(), 'Story creation timed out. The media is taking too long to process. Please try with a smaller file or try again later.');
							}
							
							// Publish the story
							const publishResponse = await instagramApiRequest.call(
								this,
								'POST',
								`/${igUserId}/media_publish`,
								{ creation_id: containerId },
							);
							
							returnData.push({ 
								json: {
									...publishResponse,
									status: 'published',
									container_id: containerId,
									attempts_taken: attempts,
								}, 
								pairedItem: { item: i } 
							});
						} else {
							returnData.push({ json: createResponse, pairedItem: { item: i } });
						}
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

export interface IInstagramCredentials {
	appId: string;
	appSecret: string;
	accessToken: string;
	igUserId: string;
	webhookVerifyToken?: string;
}

export interface IInstagramMessage {
	recipient: { id: string };
	message: {
		text?: string;
		attachment?: IAttachment;
		quick_replies?: IQuickReply[];
	};
	messaging_type?: 'RESPONSE' | 'UPDATE' | 'MESSAGE_TAG';
	tag?: string;
}

export interface IAttachment {
	type: 'image' | 'video' | 'audio' | 'file' | 'template';
	payload: IAttachmentPayload;
}

export interface IAttachmentPayload {
	url?: string;
	is_reusable?: boolean;
	template_type?: 'button' | 'generic' | 'media';
	text?: string;
	elements?: IGenericElement[];
	buttons?: IButton[];
}

export interface IButton {
	type: 'web_url' | 'postback';
	title: string;
	url?: string;
	payload?: string;
}

export interface IGenericElement {
	title: string;
	subtitle?: string;
	image_url?: string;
	default_action?: IDefaultAction;
	buttons?: IButton[];
}

export interface IDefaultAction {
	type: 'web_url';
	url: string;
}

export interface IQuickReply {
	content_type: 'text';
	title: string;
	payload: string;
}

export interface IInstagramWebhook {
	object: string;
	entry: IWebhookEntry[];
}

export interface IWebhookEntry {
	id: string;
	time: number;
	messaging?: IMessagingEvent[];
	changes?: IWebhookChange[];
}

export interface IWebhookChange {
	field: string;
	value: ICommentValue | IMentionValue | any;
}

export interface ICommentValue {
	id: string;
	media: {
		id: string;
		media_product_type: string;
	};
	text: string;
	from: {
		id: string;
		username: string;
	};
	parent_id?: string;
}

export interface IMentionValue {
	id: string;
	media_id: string;
	comment_id?: string;
	text?: string;
}

export interface IMessagingEvent {
	sender: { id: string };
	recipient: { id: string };
	timestamp: number;
	message?: {
		mid: string;
		text?: string;
		attachments?: any[];
		quick_reply?: { payload: string };
		is_echo?: boolean;
	};
	postback?: {
		title: string;
		payload: string;
	};
	optin?: {
		ref: string;
	};
}

export interface IMediaUploadResponse {
	id: string;
}

export interface IUserProfile {
	id: string;
	name?: string;
	username?: string;
	profile_pic?: string;
}

export interface IMediaObject {
	id: string;
	media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
	media_url?: string;
	permalink?: string;
	caption?: string;
	timestamp?: string;
	like_count?: number;
	comments_count?: number;
	owner?: {
		id: string;
		username?: string;
	};
	thumbnail_url?: string;
	children?: {
		data: IMediaObject[];
	};
}

export interface IPostContainer {
	id: string;
	status_code?: string;
}

export interface IUserTag {
	username: string;
	x: number;
	y: number;
}

export interface IProductTag {
	product_id: string;
	x: number;
	y: number;
}

export interface ICarouselChild {
	media_type: 'IMAGE' | 'VIDEO';
	image_url?: string;
	video_url?: string;
	user_tags?: string;
}

export interface IStoryOptions {
	location_id?: string;
	collaborators?: string;
}

export interface IPostOptions extends IStoryOptions {
	user_tags?: string;
	product_tags?: string;
	thumb_offset?: number;
	share_to_feed?: boolean;
	cover_url?: string;
	audio_name?: string;
}

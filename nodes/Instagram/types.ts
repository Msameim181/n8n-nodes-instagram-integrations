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
	image_url?: string;
}

export interface IInstagramWebhook {
	object: string;
	entry: IWebhookEntry[];
}

export interface IWebhookEntry {
	id: string;
	time: number;
	messaging?: IMessagingEvent[];
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

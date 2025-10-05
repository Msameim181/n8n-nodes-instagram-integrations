---
applyTo: '**'
---

# Instagram Nodes Implementation Specification

## Overview
This document defines the complete architecture for N8N Instagram integration nodes. The package includes one main messaging node, one trigger node, and comprehensive credential management.

---

## 1. Credentials Node

### File: `credentials/InstagramApi.credentials.ts`

**Purpose**: Manage Instagram App credentials and access tokens for API authentication.

**Credential Type**: OAuth2 with manual token input fallback

**Required Fields**:
1. **Instagram App ID** (string, required)
   - Display Name: "App ID"
   - Description: "Your Instagram/Facebook App ID from Meta Developer Console"
   - Placeholder: "1234567890123456"

2. **Instagram App Secret** (string, required, password)
   - Display Name: "App Secret"
   - Description: "Your Instagram App Secret from Meta Developer Console"
   - Placeholder: "abc123def456..."

3. **Page Access Token** (string, required, password)
   - Display Name: "Page Access Token"
   - Description: "Facebook Page access token with Instagram permissions"
   - Placeholder: "EAAxxxxx..."
   - Documentation: "https://developers.facebook.com/docs/pages/access-tokens"

4. **Instagram Business Account ID** (string, required)
   - Display Name: "Instagram Account ID"
   - Description: "Your Instagram Business Account ID (IGSID)"
   - Placeholder: "17841400000000000"

5. **Webhook Verify Token** (string, optional)
   - Display Name: "Webhook Verify Token"
   - Description: "Custom verification token for webhook setup (min 20 characters)"
   - Placeholder: "my_custom_verify_token_2024"

**Authentication Method**:
- Type: OAuth2 (recommended) or Manual Token
- Grant Type: Authorization Code
- Authorization URL: `https://www.facebook.com/v23.0/dialog/oauth`
- Token URL: `https://graph.instagram.com/v23.0/oauth/access_token`
- Scope: `instagram_basic,instagram_manage_messages,pages_manage_metadata,pages_read_engagement`

**Test Connection**: Verify by calling `GET /{ig-user-id}?fields=id,username`

---

## 2. Main Instagram Node

### File: `nodes/Instagram/Instagram.node.ts`

**Display Name**: Instagram
**Name**: instagram
**Icon**: instagram.svg
**Group**: Communication
**Version**: 1
**Description**: Send messages, manage media, and interact with Instagram users via Messaging API

### Resources & Operations Structure

#### Resource 1: MESSAGE

##### Operation 2.1: Send Text Message
**API Endpoint**: `POST /me/messages`
**Parameters**:
- **Recipient ID** (string, required)
  - Description: "Instagram-scoped user ID (IGSID) of the recipient"
  - Placeholder: "1234567890"
- **Message Text** (string, required)
  - Description: "Text message to send (max 1000 characters)"
  - Placeholder: "Hello from N8N!"

**Implementation**:
```typescript
POST https://graph.instagram.com/v23.0/me/messages
{
  "recipient": { "id": "{{recipientId}}" },
  "message": { "text": "{{messageText}}" }
}
```

##### Operation 2.2: Upload Media
**API Endpoint**: `POST /{ig-user-id}/media`
**Parameters**:
- **Media Type** (options: image, video, reels, stories)
- **Media URL** (string, required)
  - Description: "Public URL of the media file"
  - Placeholder: "https://example.com/image.jpg"
- **Caption** (string, optional)
  - Description: "Caption for the media"

**Implementation**: Multi-step process (upload → publish)

##### Operation 2.3: Send Image Message
**API Endpoint**: `POST /me/messages`
**Parameters**:
- **Recipient ID** (string, required)
- **Image URL** (string, required)
  - Description: "Public HTTPS URL of the image (JPG, PNG)"
  - Placeholder: "https://example.com/photo.jpg"
  - Validation: Must be HTTPS
- **Is Reusable** (boolean, default: false)
  - Description: "Make attachment reusable for multiple recipients"

**Implementation**:
```typescript
POST https://graph.instagram.com/v23.0/me/messages
{
  "recipient": { "id": "{{recipientId}}" },
  "message": {
    "attachment": {
      "type": "image",
      "payload": {
        "url": "{{imageUrl}}",
        "is_reusable": {{isReusable}}
      }
    }
  }
}
```

##### Operation 2.4: Send Audio Message
**API Endpoint**: `POST /me/messages`
**Parameters**:
- **Recipient ID** (string, required)
- **Audio URL** (string, required)
  - Description: "Public HTTPS URL of the audio file"
  - Placeholder: "https://example.com/voice.mp3"
- **Is Reusable** (boolean, default: false)

**Implementation**:
```typescript
{
  "recipient": { "id": "{{recipientId}}" },
  "message": {
    "attachment": {
      "type": "audio",
      "payload": { "url": "{{audioUrl}}", "is_reusable": {{isReusable}} }
    }
  }
}
```

##### Operation 2.5: Send Video Message
**API Endpoint**: `POST /me/messages`
**Parameters**:
- **Recipient ID** (string, required)
- **Video URL** (string, required)
  - Description: "Public HTTPS URL of the video file"
  - Placeholder: "https://example.com/video.mp4"
- **Is Reusable** (boolean, default: false)

**Implementation**: Same pattern as image with `type: "video"`

##### Operation 2.6: Send Button Template
**API Endpoint**: `POST /me/messages`
**Parameters**:
- **Recipient ID** (string, required)
- **Message Text** (string, required)
  - Description: "Text to display above buttons (max 640 characters)"
- **Buttons** (fixedCollection, required)
  - **Button Type** (options: web_url, postback)
    - **For web_url**:
      - Title (string, max 20 chars)
      - URL (string, must be HTTPS)
    - **For postback**:
      - Title (string, max 20 chars)
      - Payload (string, max 1000 chars)
  - Max buttons: 3

**Implementation**:
```typescript
{
  "recipient": { "id": "{{recipientId}}" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "{{messageText}}",
        "buttons": [
          { "type": "web_url", "url": "{{url}}", "title": "{{title}}" },
          { "type": "postback", "title": "{{title}}", "payload": "{{payload}}" }
        ]
      }
    }
  }
}
```

##### Operation 2.7: Send Generic Template
**API Endpoint**: `POST /me/messages`
**Parameters**:
- **Recipient ID** (string, required)
- **Elements** (fixedCollection, required)
  - **Image URL** (string, optional)
  - **Title** (string, required, max 80 chars)
  - **Subtitle** (string, optional, max 80 chars)
  - **Default Action** (collection, optional)
    - Type: web_url
    - URL: (string, HTTPS)
  - **Buttons** (collection, max 3)
    - Same structure as Button Template
  - Max elements: 10

**Implementation**:
```typescript
{
  "recipient": { "id": "{{recipientId}}" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
          {
            "title": "{{title}}",
            "image_url": "{{imageUrl}}",
            "subtitle": "{{subtitle}}",
            "default_action": {
              "type": "web_url",
              "url": "{{url}}"
            },
            "buttons": [...]
          }
        ]
      }
    }
  }
}
```

##### Operation 2.8: Set Persistent Menu (Ice Box - Instagram doesn't support this)
**Note**: Instagram Messaging API does not support persistent menus. This feature is Facebook Messenger only. Remove from implementation.

##### Operation 2.9: Send Quick Replies
**API Endpoint**: `POST /me/messages`
**Parameters**:
- **Recipient ID** (string, required)
- **Message Text** (string, required)
- **Quick Replies** (fixedCollection, required)
  - **Content Type** (options: text, default: text)
  - **Title** (string, required, max 20 chars)
  - **Payload** (string, required, max 1000 chars)
  - **Image URL** (string, optional, for content_type=text)
  - Max quick replies: 13

**Implementation**:
```typescript
{
  "recipient": { "id": "{{recipientId}}" },
  "message": {
    "text": "{{messageText}}",
    "quick_replies": [
      {
        "content_type": "text",
        "title": "{{title}}",
        "payload": "{{payload}}",
        "image_url": "{{imageUrl}}"
      }
    ]
  }
}
```

#### Resource 2: USER

##### Operation 2.10: Get User Profile
**API Endpoint**: `GET /{instagram-scoped-id}`
**Parameters**:
- **User ID** (string, required)
  - Description: "Instagram-scoped user ID (IGSID)"
  - Placeholder: "1234567890"
- **Fields** (multiOptions, optional)
  - Options: id, name, username, profile_pic
  - Default: id,name,username,profile_pic

**Implementation**:
```typescript
GET https://graph.instagram.com/v23.0/{{userId}}?fields={{fields}}
```

**Response**:
```json
{
  "id": "1234567890",
  "name": "John Doe",
  "username": "johndoe",
  "profile_pic": "https://..."
}
```

---

## 3. Instagram Trigger Node (Webhook)

### File: `nodes/Instagram/InstagramTrigger.node.ts`

**Display Name**: Instagram Trigger
**Name**: instagramTrigger
**Icon**: instagram.svg
**Group**: Trigger
**Version**: 1
**Description**: Triggers workflow on Instagram webhook events (messages, postbacks, etc.)

### Webhook Operations

#### Operation 2.11: Webhook Verification (GET)
**Purpose**: Verify webhook during Meta App configuration
**HTTP Method**: GET
**Endpoint**: N8N webhook URL

**Parameters**:
- **Verify Token** (string, required)
  - Description: "Must match the token in your Instagram credentials"
  - Expression support: Yes

**Implementation**:
```typescript
async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
  const req = this.getRequestObject();
  const query = this.getQueryData();
  
  if (req.method === 'GET') {
    // Verification
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
    
    const credentials = await this.getCredentials('instagramApi');
    const verifyToken = credentials.webhookVerifyToken;
    
    if (mode === 'subscribe' && token === verifyToken) {
      return {
        webhookResponse: challenge,
      };
    } else {
      return {
        webhookResponse: 'Forbidden',
        status: 403,
      };
    }
  }
}
```

#### Operation 2.12: Webhook Event Handler (POST)
**Purpose**: Parse incoming Instagram events and trigger workflows
**HTTP Method**: POST
**Endpoint**: N8N webhook URL

**Event Types Supported**:
- **messages**: New message received
- **messaging_postbacks**: Button postback clicked
- **messaging_optins**: User opted in

**Parameters**:
- **Events** (multiOptions, required)
  - Options: messages, messaging_postbacks, messaging_optins
  - Default: messages

**Signature Validation**:
```typescript
function validateSignature(
  payload: string,
  signature: string,
  appSecret: string,
): boolean {
  const hmac = crypto.createHmac('sha256', appSecret);
  const expectedSignature = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}
```

**Implementation**:
```typescript
async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
  const req = this.getRequestObject();
  const bodyData = this.getBodyData();
  const headerData = this.getHeaderData();
  
  if (req.method === 'POST') {
    // Validate signature
    const signature = headerData['x-hub-signature-256'] as string;
    const credentials = await this.getCredentials('instagramApi');
    
    if (!validateSignature(JSON.stringify(bodyData), signature, credentials.appSecret)) {
      return {
        webhookResponse: 'Invalid signature',
        status: 401,
      };
    }
    
    // Parse webhook payload
    const webhookData = bodyData as IInstagramWebhook;
    const returnData: INodeExecutionData[] = [];
    
    for (const entry of webhookData.entry) {
      if (entry.messaging) {
        for (const messagingEvent of entry.messaging) {
          // Extract message data
          const data: IDataObject = {
            senderId: messagingEvent.sender.id,
            recipientId: messagingEvent.recipient.id,
            timestamp: messagingEvent.timestamp,
          };
          
          // Handle different event types
          if (messagingEvent.message) {
            data.eventType = 'message';
            data.messageId = messagingEvent.message.mid;
            data.text = messagingEvent.message.text;
            data.attachments = messagingEvent.message.attachments;
          } else if (messagingEvent.postback) {
            data.eventType = 'postback';
            data.payload = messagingEvent.postback.payload;
            data.title = messagingEvent.postback.title;
          }
          
          returnData.push({ json: data });
        }
      }
    }
    
    return {
      workflowData: [returnData],
    };
  }
}
```

**Webhook Payload Structure**:
```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "page-id",
      "time": 1234567890,
      "messaging": [
        {
          "sender": { "id": "sender-igsid" },
          "recipient": { "id": "page-igsid" },
          "timestamp": 1234567890,
          "message": {
            "mid": "message-id",
            "text": "Hello",
            "attachments": []
          }
        }
      ]
    }
  ]
}
```

---

## 4. Type Definitions

### File: `nodes/Instagram/types.ts`

```typescript
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
}
```

---

## 5. Implementation Checklist

### Credentials (2.0)
- [ ] Create `InstagramApi.credentials.ts`
- [ ] Implement OAuth2 authentication flow
- [ ] Add manual token input fields
- [ ] Implement test connection method
- [ ] Add credential validation

### Main Node - Message Operations
- [ ] Send Text Message (2.1)
- [ ] Upload Media (2.2)
- [ ] Send Image Message (2.3)
- [ ] Send Audio Message (2.4)
- [ ] Send Video Message (2.5)
- [ ] Send Button Template (2.6)
- [ ] Send Generic Template (2.7)
- [ ] ~~Set Persistent Menu~~ (2.8 - Not supported)
- [ ] Send Quick Replies (2.9)

### Main Node - User Operations
- [ ] Get User Profile (2.10)

### Trigger Node - Webhook
- [ ] Webhook Verification GET (2.11)
- [ ] Webhook Event Handler POST (2.12)
- [ ] Signature validation
- [ ] Event parsing (messages, postbacks, optins)

### Supporting Files
- [ ] Create type definitions
- [ ] Add node icons (SVG)
- [ ] Write unit tests
- [ ] Update README with examples
- [ ] Add API error handling
- [ ] Implement rate limiting awareness

---

## 6. API Endpoints Reference

| Operation | Method | Endpoint | Purpose |
|-----------|--------|----------|---------|
| Send Message | POST | `/me/messages` | Send any type of message |
| Upload Media | POST | `/{ig-user-id}/media` | Upload media for publishing |
| Get User Profile | GET | `/{ig-scoped-id}` | Retrieve user information |
| Webhook Verify | GET | (N8N webhook) | Verify webhook subscription |
| Webhook Events | POST | (N8N webhook) | Receive Instagram events |

---

## 7. Error Handling Strategy

### Common Instagram API Errors
- **190**: Access token expired/invalid → Re-authenticate
- **200**: Permission denied → Check app permissions
- **551**: User cannot receive messages → Handle gracefully
- **10**: Permission denied → Missing required permissions
- **613**: Rate limit exceeded → Implement backoff

### Error Response Format
```typescript
{
  "error": {
    "message": "Error description",
    "type": "OAuthException",
    "code": 190,
    "fbtrace_id": "..."
  }
}
```

---

## 8. Testing Requirements

1. **Unit Tests**: Test each message type independently
2. **Webhook Tests**: Mock Meta webhook payloads
3. **Signature Validation**: Test with valid/invalid signatures
4. **Error Cases**: Test API error handling
5. **Rate Limiting**: Test behavior under rate limits

---

## 9. Documentation Requirements

### Node Documentation
- Setup instructions (Meta App creation)
- Permission requirements
- Webhook configuration steps
- Example workflows for each operation
- Troubleshooting common issues

### Code Comments
- Document all public interfaces
- Explain complex logic
- Add TODO for future enhancements
- Include API reference links

---

## 10. Future Enhancements (Out of Scope)

- [ ] Story mentions/replies
- [ ] Instagram comments automation
- [ ] Media insights and analytics
- [ ] Hashtag search
- [ ] User mentions
- [ ] Instagram Shopping API
- [ ] Batch message sending
- [ ] Message templates management

---

## Notes
- Instagram Messaging API requires a Facebook Page connected to Instagram Business Account
- All media URLs must be publicly accessible via HTTPS
- Maximum message size: 1000 characters for text
- Webhook events are sent in batches every 20 seconds
- User-scoped IDs (IGSID) are different from Instagram user IDs
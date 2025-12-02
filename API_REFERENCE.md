# Instagram API Reference

Complete API reference for n8n-nodes-instagram-integrations operations.

## Table of Contents

- [Instagram Node](#instagram-node)
  - [Message Operations](#message-operations)
  - [Comment Operations](#comment-operations)
  - [User Operations](#user-operations)
- [Instagram Trigger Node](#instagram-trigger-node)
  - [Webhook Events](#webhook-events)
- [Error Codes](#error-codes)
- [Rate Limits](#rate-limits)

---

## Instagram Node

The main Instagram node provides messaging and user management capabilities.

### Message Operations

#### Send Text Message

Send a plain text message to an Instagram user.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Recipient ID | string | Yes | Instagram-scoped user ID (IGSID) |
| Message Text | string | Yes | Text content (max 1000 characters) |

**Example:**

```json
{
  "recipientId": "1234567890",
  "messageText": "Hello! Thanks for reaching out."
}
```

**API Endpoint:** `POST /me/messages`

**Request Body:**
```json
{
  "recipient": { "id": "1234567890" },
  "message": { "text": "Hello! Thanks for reaching out." }
}
```

**Response:**
```json
{
  "recipient_id": "1234567890",
  "message_id": "mid.abc123def456"
}
```

---

#### Send Image Message

Send an image via public HTTPS URL.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Recipient ID | string | Yes | Instagram-scoped user ID |
| Image URL | string | Yes | Public HTTPS URL of image (JPG, PNG) |
| Is Reusable | boolean | No | Make attachment reusable (default: false) |

**Example:**

```json
{
  "recipientId": "1234567890",
  "imageUrl": "https://example.com/image.jpg",
  "isReusable": true
}
```

**API Endpoint:** `POST /me/messages`

**Request Body:**
```json
{
  "recipient": { "id": "1234567890" },
  "message": {
    "attachment": {
      "type": "image",
      "payload": {
        "url": "https://example.com/image.jpg",
        "is_reusable": true
      }
    }
  }
}
```

**Constraints:**
- Must be HTTPS
- Max file size: 8MB
- Supported formats: JPG, PNG, GIF
- Dimensions: Up to 8192x8192 pixels

---

#### Send Audio Message

Send an audio file via public HTTPS URL.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Recipient ID | string | Yes | Instagram-scoped user ID |
| Audio URL | string | Yes | Public HTTPS URL of audio file |
| Is Reusable | boolean | No | Make attachment reusable (default: false) |

**Example:**

```json
{
  "recipientId": "1234567890",
  "audioUrl": "https://example.com/audio.mp3",
  "isReusable": false
}
```

**API Endpoint:** `POST /me/messages`

**Constraints:**
- Must be HTTPS
- Max file size: 25MB
- Supported formats: MP3, WAV, M4A

---

#### Send Video Message

Send a video file via public HTTPS URL.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Recipient ID | string | Yes | Instagram-scoped user ID |
| Video URL | string | Yes | Public HTTPS URL of video file |
| Is Reusable | boolean | No | Make attachment reusable (default: false) |

**Example:**

```json
{
  "recipientId": "1234567890",
  "videoUrl": "https://example.com/video.mp4",
  "isReusable": false
}
```

**API Endpoint:** `POST /me/messages`

**Constraints:**
- Must be HTTPS
- Max file size: 25MB
- Supported formats: MP4, MOV
- Max duration: 60 seconds
- Aspect ratio: 16:9 or 9:16 recommended

---

#### Send Button Template

Send an interactive button template message.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Recipient ID | string | Yes | Instagram-scoped user ID |
| Message Text | string | Yes | Text to display (max 640 characters) |
| Buttons | array | Yes | Array of buttons (max 3) |

**Button Types:**

**Web URL Button:**
```json
{
  "type": "web_url",
  "title": "Visit Website",
  "url": "https://example.com"
}
```

**Postback Button:**
```json
{
  "type": "postback",
  "title": "Get Started",
  "payload": "GET_STARTED_PAYLOAD"
}
```

**Complete Example:**

```json
{
  "recipientId": "1234567890",
  "messageText": "How can we help you today?",
  "buttons": [
    {
      "type": "web_url",
      "title": "Visit Shop",
      "url": "https://shop.example.com"
    },
    {
      "type": "postback",
      "title": "Contact Support",
      "payload": "CONTACT_SUPPORT"
    },
    {
      "type": "postback",
      "title": "Track Order",
      "payload": "TRACK_ORDER"
    }
  ]
}
```

**API Endpoint:** `POST /me/messages`

**Constraints:**
- Max 3 buttons per template
- Button title: Max 20 characters
- Postback payload: Max 1000 characters
- URLs must be HTTPS

---

#### Send Generic Template

Send a carousel of cards with images and buttons.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Recipient ID | string | Yes | Instagram-scoped user ID |
| Elements | array | Yes | Array of template elements (max 10) |

**Element Structure:**

```json
{
  "title": "Product Name",
  "subtitle": "Product description",
  "image_url": "https://example.com/product.jpg",
  "default_action": {
    "type": "web_url",
    "url": "https://example.com/product"
  },
  "buttons": [
    {
      "type": "web_url",
      "title": "Buy Now",
      "url": "https://example.com/buy"
    },
    {
      "type": "postback",
      "title": "Add to Cart",
      "payload": "ADD_TO_CART_123"
    }
  ]
}
```

**Complete Example:**

```json
{
  "recipientId": "1234567890",
  "elements": [
    {
      "title": "Summer Collection",
      "subtitle": "New arrivals for summer 2025",
      "image_url": "https://example.com/summer.jpg",
      "buttons": [
        {
          "type": "web_url",
          "title": "Shop Now",
          "url": "https://shop.example.com/summer"
        }
      ]
    },
    {
      "title": "Winter Sale",
      "subtitle": "Up to 50% off",
      "image_url": "https://example.com/winter.jpg",
      "buttons": [
        {
          "type": "web_url",
          "title": "View Deals",
          "url": "https://shop.example.com/winter"
        }
      ]
    }
  ]
}
```

**Constraints:**
- Max 10 elements (cards)
- Title: Max 80 characters
- Subtitle: Max 80 characters
- Max 3 buttons per element
- Image aspect ratio: 1.91:1 recommended
- Image size: Min 600x315 pixels

---

#### Send Quick Replies

Send a message with quick reply options.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Recipient ID | string | Yes | Instagram-scoped user ID |
| Message Text | string | Yes | Text message content |
| Quick Replies | array | Yes | Array of quick reply options (max 13) |

**Quick Reply Structure:**

```json
{
  "content_type": "text",
  "title": "Option 1",
  "payload": "OPTION_1_PAYLOAD",
  "image_url": "https://example.com/icon.png"
}
```

**Complete Example:**

```json
{
  "recipientId": "1234567890",
  "messageText": "What's your favorite color?",
  "quickReplies": [
    {
      "content_type": "text",
      "title": "Red",
      "payload": "COLOR_RED"
    },
    {
      "content_type": "text",
      "title": "Blue",
      "payload": "COLOR_BLUE"
    },
    {
      "content_type": "text",
      "title": "Green",
      "payload": "COLOR_GREEN"
    }
  ]
}
```

**Constraints:**
- Max 13 quick replies
- Title: Max 20 characters
- Payload: Max 1000 characters
- Image URL optional

---

#### Upload Media

Upload media for publishing to Instagram feed, reels, or stories.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Media Type | options | Yes | Type: image, video, reels, stories |
| Media URL | string | Yes | Public HTTPS URL of media file |
| Caption | string | No | Caption for the media post |

**Example:**

```json
{
  "mediaType": "image",
  "mediaUrl": "https://example.com/photo.jpg",
  "caption": "Check out our new product! #Launch"
}
```

**API Endpoint:** `POST /{ig-user-id}/media` (container creation)  
**Publish Endpoint:** `POST /{ig-user-id}/media_publish`

**Process:**
1. Create media container
2. Wait for processing
3. Publish container

**Constraints:**
- **Images**: JPG/PNG, max 8MB, min 320px
- **Videos**: MP4/MOV, max 100MB, 3-60 seconds
- **Reels**: 9:16 aspect ratio, max 90 seconds
- **Stories**: 9:16 aspect ratio, 24-hour duration

---

### Comment Operations

#### Get Comments

Retrieve all comments on a specific Instagram media post.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Media ID | string | Yes | ID of the Instagram media post |
| Return All | boolean | No | Retrieve all comments (default: false) |
| Limit | number | No | Maximum number of comments to return (default: 50) |

**Example:**

```json
{
  "mediaId": "17895695668004550",
  "returnAll": false,
  "limit": 20
}
```

**API Endpoint:** `GET /{media-id}/comments?fields=id,text,username,timestamp,like_count,replies_count`

**Response:**
```json
{
  "data": [
    {
      "id": "17858391726040854",
      "text": "Great post!",
      "username": "follower123",
      "timestamp": "2024-01-15T10:30:00+0000",
      "like_count": 5,
      "replies_count": 2
    }
  ],
  "paging": {
    "cursors": {
      "after": "cursor_token"
    }
  }
}
```

---

#### Get Replies

Retrieve replies to a specific comment.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Comment ID | string | Yes | ID of the parent comment |
| Return All | boolean | No | Retrieve all replies (default: false) |
| Limit | number | No | Maximum number of replies to return (default: 50) |

**Example:**

```json
{
  "commentId": "17858391726040854",
  "returnAll": false,
  "limit": 10
}
```

**API Endpoint:** `GET /{comment-id}/replies?fields=id,text,username,timestamp,like_count`

**Response:**
```json
{
  "data": [
    {
      "id": "17899876543210123",
      "text": "Thanks for your support!",
      "username": "youraccount",
      "timestamp": "2024-01-15T11:00:00+0000",
      "like_count": 2
    }
  ]
}
```

---

#### Reply to Comment

Post a public reply to a comment on your media.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Comment ID | string | Yes | ID of the comment to reply to |
| Reply Text | string | Yes | Text of your reply (max 8000 characters) |

**Example:**

```json
{
  "commentId": "17858391726040854",
  "replyText": "Thanks for your feedback! 🙌"
}
```

**API Endpoint:** `POST /{comment-id}/replies`

**Request Body:**
```json
{
  "message": "Thanks for your feedback! 🙌"
}
```

**Response:**
```json
{
  "id": "17899876543210456"
}
```

**Constraints:**
- Reply text max length: 8000 characters
- Must be replying to a comment on your own media
- Supports @mentions (auto-tagging)

---

#### Send Private Reply

Send a Direct Message to a user who commented on your media. This is the "Private Reply" feature available within the 7-day messaging window.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Comment ID | string | Yes | ID of the comment from the user |
| Message Text | string | Yes | Text message to send privately |

**Example:**

```json
{
  "commentId": "17858391726040854",
  "messageText": "Hey! Thanks for your comment. Here's an exclusive discount code: SAVE20"
}
```

**API Endpoint:** `POST /me/messages`

**Request Body:**
```json
{
  "recipient": {
    "comment_id": "17858391726040854"
  },
  "message": {
    "text": "Hey! Thanks for your comment. Here's an exclusive discount code: SAVE20"
  }
}
```

**Response:**
```json
{
  "recipient_id": "1234567890",
  "message_id": "mid.xyz789"
}
```

**Important Notes:**
- ⏰ **7-Day Window**: Private replies must be sent within 7 days of the comment
- 🔒 **First Contact**: This can initiate a DM conversation with users who haven't messaged you
- 📌 **Use Case**: Perfect for sending promotional codes, exclusive offers, or private information
- ⚠️ **Limitations**: Only works for comments on your own media posts

---

#### Delete Comment

Delete a comment from your media post.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Comment ID | string | Yes | ID of the comment to delete |

**Example:**

```json
{
  "commentId": "17858391726040854"
}
```

**API Endpoint:** `DELETE /{comment-id}`

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Can only delete comments on your own media
- Can delete your own replies on any post
- Deletion is permanent and cannot be undone

---

#### Hide/Unhide Comment

Toggle the visibility of a comment. Hidden comments are not visible to the public but remain in your moderation queue.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Comment ID | string | Yes | ID of the comment to hide/unhide |
| Hide | boolean | Yes | true to hide, false to unhide |

**Example:**

```json
{
  "commentId": "17858391726040854",
  "hide": true
}
```

**API Endpoint:** `POST /{comment-id}`

**Request Body:**
```json
{
  "hide": true
}
```

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Hidden comments are still accessible via the API
- Useful for moderation without permanent deletion
- Users are not notified when their comment is hidden

---

### User Operations

#### Get User Profile

Retrieve Instagram user profile information.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| User ID | string | Yes | Instagram-scoped user ID (IGSID) |
| Fields | multi-options | No | Fields to retrieve (default: all) |

**Available Fields:**
- `id` - User's Instagram-scoped ID
- `name` - User's full name
- `username` - Instagram username
- `profile_pic` - Profile picture URL

**Example:**

```json
{
  "userId": "1234567890",
  "fields": ["id", "name", "username", "profile_pic"]
}
```

**API Endpoint:** `GET /{ig-user-id}?fields=...`

**Response:**
```json
{
  "id": "1234567890",
  "name": "John Doe",
  "username": "johndoe",
  "profile_pic": "https://scontent.cdninstagram.com/..."
}
```

---

## Instagram Trigger Node

Webhook-based trigger for Instagram events.

### Webhook Events

#### Messages

Triggered when a user sends a message to your Instagram Business Account.

**Event Data:**

```json
{
  "eventType": "message",
  "senderId": "1234567890",
  "recipientId": "0987654321",
  "timestamp": 1696435200000,
  "messageId": "mid.abc123",
  "text": "Hello!",
  "attachments": []
}
```

**Attachment Structure:**

```json
{
  "type": "image",
  "payload": {
    "url": "https://scontent.cdninstagram.com/..."
  }
}
```

**Quick Reply Response:**

```json
{
  "eventType": "message",
  "senderId": "1234567890",
  "text": "Red",
  "quick_reply": {
    "payload": "COLOR_RED"
  }
}
```

---

#### Postbacks

Triggered when a user clicks a button in a template.

**Event Data:**

```json
{
  "eventType": "postback",
  "senderId": "1234567890",
  "recipientId": "0987654321",
  "timestamp": 1696435200000,
  "payload": "GET_STARTED",
  "title": "Get Started"
}
```

---

#### Opt-ins

Triggered when a user grants permissions or subscribes.

**Event Data:**

```json
{
  "eventType": "optin",
  "senderId": "1234567890",
  "recipientId": "0987654321",
  "timestamp": 1696435200000,
  "ref": "NEWSLETTER_SIGNUP"
}
```

---

## Error Codes

### Instagram API Errors

| Code | Type | Description | Solution |
|------|------|-------------|----------|
| 190 | OAuthException | Invalid access token | Re-authenticate or refresh token |
| 200 | PermissionsError | Permission denied | Request required permissions |
| 551 | APIException | User cannot receive messages | Wait for user to initiate conversation |
| 613 | APIException | Rate limit exceeded | Implement exponential backoff |
| 10 | OAuthException | Permission not granted | Check app permissions in Meta console |
| 100 | InvalidParameter | Invalid parameter | Verify request payload |
| 2 | APIException | Service temporarily unavailable | Retry after delay |

### n8n Node Errors

| Error | Description | Solution |
|-------|-------------|----------|
| Missing Credential | No credential selected | Select credential in node settings |
| Invalid Recipient ID | Recipient ID format invalid | Use Instagram-scoped ID (IGSID) |
| URL Not HTTPS | Media URL not secure | Use HTTPS URLs only |
| Webhook Verification Failed | Verify token mismatch | Check token in credential matches Meta app |

---

## Rate Limits

### API Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Messaging API | 200 calls | Per hour per user |
| Media Upload | 50 calls | Per hour per user |
| User Profile | 200 calls | Per hour per app |

### Webhook Limits

- **Events**: Unlimited receives
- **Response Time**: Must respond within 20 seconds
- **Batch Size**: Up to 1000 events per batch
- **Retry**: 3 attempts with exponential backoff

### Best Practices

1. **Implement Retry Logic**: Use exponential backoff for failed requests
2. **Cache Data**: Store user profiles to reduce API calls
3. **Batch Operations**: Group operations when possible
4. **Monitor Usage**: Track API call consumption
5. **Handle Errors**: Gracefully handle rate limit responses

### Rate Limit Headers

```
X-Business-Use-Case-Usage: {"business_id":{"call_count":15,"total_cputime":25,"total_time":25}}
X-App-Usage: {"call_count":15,"total_cputime":25,"total_time":25}
```

**Response When Exceeded:**

```json
{
  "error": {
    "message": "Application request limit reached",
    "type": "OAuthException",
    "code": 4,
    "fbtrace_id": "..."
  }
}
```

**Recommended Retry Delay:**
- 1st retry: 1 second
- 2nd retry: 2 seconds
- 3rd retry: 4 seconds
- 4th retry: 8 seconds
- Max retries: 5

---

## Additional Resources

### Instagram Graph API
- [Official Documentation](https://developers.facebook.com/docs/instagram-api)
- [Messaging API Reference](https://developers.facebook.com/docs/messenger-platform/instagram)
- [Webhook Reference](https://developers.facebook.com/docs/graph-api/webhooks)

### Testing Tools
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Webhook Tester](https://developers.facebook.com/tools/webhooks/)

### Support
- 📧 Email: 9259samei@gmail.com
- 🐛 [Issue Tracker](https://github.com/Msameim181/n8n-nodes-instagram-integrations/issues)
- 💬 [n8n Community](https://community.n8n.io)

---

**Last Updated:** January 2025  
**API Version:** Instagram Graph API v23.0  
**Package Version:** 1.6.0

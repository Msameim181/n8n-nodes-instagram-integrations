# N8N Instagram Integration - Implementation Guide

## 📋 Overview

This guide provides a complete roadmap for implementing the N8N Instagram integration package based on the instruction files created.

## 🎯 What Has Been Created

### 1. System Prompt Instructions (`/.github/instructions/system_prompt.instructions.md`)
A comprehensive guide covering:
- N8N node development standards
- TypeScript coding conventions
- Instagram Graph API guidelines
- Error handling best practices
- Security considerations
- Performance optimization techniques

### 2. Instagram Nodes Specification (`/.github/instructions/instagram-nodes.instructions.md`)
A detailed specification defining:
- **1 Credential Node**: OAuth2 + manual token configuration
- **1 Main Node**: 10 message operations + user profile retrieval
- **1 Trigger Node**: Webhook verification + event handling
- Complete type definitions
- API endpoint mappings
- Implementation checklist

## 🏗️ Architecture

```
n8n-nodes-instagram-integrations/
├── credentials/
│   └── InstagramApi.credentials.ts       # OAuth2 + manual credentials
├── nodes/
│   └── Instagram/
│       ├── Instagram.node.ts             # Main messaging node
│       ├── InstagramTrigger.node.ts      # Webhook trigger
│       ├── types.ts                      # TypeScript interfaces
│       └── descriptions/                  # Operation descriptions
│           ├── MessageOperations.ts
│           ├── UserOperations.ts
│           └── TemplateOperations.ts
└── .github/
    └── instructions/                     # AI coding guidelines
        ├── system_prompt.instructions.md
        └── instagram-nodes.instructions.md
```

## 📝 Features Breakdown

### Credential Management (2.0)
- ✅ Instagram App ID
- ✅ Instagram App Secret
- ✅ Page Access Token
- ✅ Instagram Business Account ID
- ✅ Webhook Verify Token

### Messaging Operations

#### Basic Messages
- ✅ **2.1**: Send Text Message
- ✅ **2.3**: Send Image Message (via URL)
- ✅ **2.4**: Send Audio Message (via URL)
- ✅ **2.5**: Send Video Message (via URL)

#### Advanced Messages
- ✅ **2.6**: Send Button Template (web_url, postback)
- ✅ **2.7**: Send Generic Template (carousel with images, buttons)
- ✅ **2.9**: Send Quick Replies (up to 13 options)

#### Media Management
- ✅ **2.2**: Upload Media (images, videos, reels, stories)

#### User Operations
- ✅ **2.10**: Get User Profile (id, name, username, profile_pic)

#### Webhook Integration
- ✅ **2.11**: Webhook Verification (GET method)
- ✅ **2.12**: Webhook Event Handler (POST method)
  - Message events
  - Postback events
  - Opt-in events
  - Signature validation

### Features Removed
- ❌ **2.8**: Persistent Menu (Instagram doesn't support this - it's Messenger-only)

## 🔧 Implementation Steps

### Phase 1: Setup & Credentials
1. Create `InstagramApi.credentials.ts`
2. Implement OAuth2 flow
3. Add manual token input
4. Add connection testing

### Phase 2: Main Node Foundation
1. Create `Instagram.node.ts`
2. Set up resource-operation structure
3. Implement API request helper
4. Add error handling

### Phase 3: Message Operations
1. Send Text Message (2.1)
2. Send Image/Audio/Video (2.3-2.5)
3. Send Button Template (2.6)
4. Send Generic Template (2.7)
5. Send Quick Replies (2.9)

### Phase 4: Media & User
1. Upload Media (2.2)
2. Get User Profile (2.10)

### Phase 5: Webhook Trigger
1. Create `InstagramTrigger.node.ts`
2. Implement GET verification (2.11)
3. Implement POST handler (2.12)
4. Add signature validation
5. Parse webhook events

### Phase 6: Polish
1. Add TypeScript types
2. Write unit tests
3. Create documentation
4. Add examples
5. Test with real Instagram account

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Link for local testing
npm link

# In your N8N installation
cd ~/.n8n/nodes
npm link n8n-nodes-instagram

# Restart N8N
n8n start
```

## 📚 API Endpoints Used

| Operation | Endpoint | Method |
|-----------|----------|--------|
| Send Message | `/me/messages` | POST |
| Upload Media | `/{ig-user-id}/media` | POST |
| Get User Profile | `/{ig-scoped-id}` | GET |
| Webhook (all) | N8N webhook URL | GET/POST |

## 🔑 Required Instagram Permissions

- `instagram_basic` - Basic profile access
- `instagram_manage_messages` - Send/receive messages
- `pages_manage_metadata` - Webhook subscriptions
- `pages_read_engagement` - Read message engagement

## 📖 Key Concepts

### Instagram Scoped ID (IGSID)
- Not the same as Instagram username or profile ID
- Unique per app-user combination
- Obtained from webhook events or Graph API

### Webhook Events
```json
{
  "object": "instagram",
  "entry": [{
    "messaging": [{
      "sender": { "id": "sender-igsid" },
      "message": { "text": "Hello" }
    }]
  }]
}
```

### Message Templates
- **Button**: Text + up to 3 buttons
- **Generic**: Carousel of cards with images + buttons
- **Quick Replies**: Text + up to 13 quick reply options

## ⚠️ Important Notes

1. **Prerequisites**:
   - Facebook Page
   - Instagram Business Account linked to Page
   - Facebook App with Instagram permissions
   - Page Access Token (not User Token)

2. **Limitations**:
   - 200 API calls per hour per user
   - 1000 character limit for text messages
   - 20 characters max for button titles
   - Must respond to webhooks within 20 seconds

3. **Security**:
   - Always validate webhook signatures
   - Use HTTPS for all media URLs
   - Never log access tokens
   - Implement token refresh logic

## 🧪 Testing Checklist

- [ ] Credential authentication works
- [ ] Send text message successfully
- [ ] Send image/video/audio messages
- [ ] Button template renders correctly
- [ ] Generic template displays properly
- [ ] Quick replies appear in Instagram
- [ ] Webhook verification passes
- [ ] Webhook events are parsed correctly
- [ ] Signature validation works
- [ ] Error handling gracefully catches API errors
- [ ] Rate limiting is respected

## 📦 Package.json Configuration

```json
{
  "name": "n8n-nodes-instagram",
  "version": "1.0.0",
  "description": "N8N nodes for Instagram Messaging API",
  "keywords": ["n8n-community-node-package", "instagram", "messaging"],
  "license": "MIT",
  "n8n": {
    "credentials": ["credentials/InstagramApi.credentials.ts"],
    "nodes": [
      "nodes/Instagram/Instagram.node.ts",
      "nodes/Instagram/InstagramTrigger.node.ts"
    ]
  }
}
```

## 🎓 Learning Resources

- [N8N Node Development Docs](https://docs.n8n.io/integrations/creating-nodes/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Instagram Messaging API](https://developers.facebook.com/docs/messenger-platform/instagram)
- [Webhook Reference](https://developers.facebook.com/docs/graph-api/webhooks)

## 🤝 Contributing

When implementing new features:
1. Follow the system prompt instructions
2. Update the instagram-nodes specification
3. Add TypeScript types
4. Write tests
5. Update documentation

## 📞 Support

For issues:
1. Check Instagram API status
2. Verify permissions are granted
3. Check webhook signature validation
4. Review N8N logs
5. Test with Graph API Explorer

---

**Ready to implement?** Start with Phase 1 and follow the checklist in `instagram-nodes.instructions.md`!

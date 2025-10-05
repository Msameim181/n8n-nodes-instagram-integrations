# n8n-nodes-instagram-integrations

![Instagram Banner](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)
[![npm version](https://img.shields.io/npm/v/n8n-nodes-instagram-integrations.svg)](https://www.npmjs.com/package/n8n-nodes-instagram-integrations)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n](https://img.shields.io/badge/n8n-community-FF6D5A?logo=n8n)](https://n8n.io)
[![Downloads](https://img.shields.io/npm/dt/n8n-nodes-instagram-integrations.svg)](https://www.npmjs.com/package/n8n-nodes-instagram-integrations)

Professional N8N community nodes for seamless Instagram Messaging API integration with OAuth2 authentication.

[Installation](#installation) • [Features](#features) • [Prerequisites](#prerequisites) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Support](#support)

---

## 📖 Overview

This package provides comprehensive Instagram integration for n8n workflows, enabling automated messaging, media management, and webhook-based event handling through the official Instagram Graph API.

**Perfect for:**
- 🤖 Automated customer support via Instagram DM
- 📢 Marketing campaigns and notifications
- 🎯 Lead generation and engagement
- 📊 Customer interaction tracking
- 🔄 Multi-platform messaging automation

---

## ✨ Features

### 🔐 OAuth2 Authentication
- **One-click authentication** - Secure OAuth2 flow similar to Google Drive
- **🆕 Automatic long-lived tokens** - Short-lived tokens (1 hour) automatically exchanged for long-lived tokens (60 days)
- **🆕 Automatic token refresh** - Tokens refresh automatically before expiration (zero configuration)
- **🆕 No more "refreshToken is required" errors** - Smart token lifecycle management prevents expiration issues
- **Multiple credential types** - OAuth2 or manual access token
- **Auto-discovery** - Automatically fetches Instagram Business Account ID

### 📬 Instagram Messaging Node

**Message Types:**
- 💬 **Text Messages** - Send formatted text with up to 1000 characters
- 🖼️ **Image Messages** - Share images via public HTTPS URLs
- 🎵 **Audio Messages** - Send voice messages and audio files
- 🎬 **Video Messages** - Share video content
- 📤 **Media Upload** - Upload and publish photos, videos, reels, and stories

**Interactive Templates:**
- 🔘 **Button Templates** - Up to 3 action buttons (web links or postbacks)
- 🎴 **Generic Templates** - Carousel cards with images and buttons
- ⚡ **Quick Replies** - Up to 13 quick response options

**User Management:**
- 👤 **Get User Profile** - Retrieve user information (name, username, profile picture)

### � Instagram Content Publishing (NEW!)

**Post Creation:**
- 📷 **Single Posts** - Create image or video feed posts
- 🎞️ **Carousel Posts** - Multi-media posts (2-10 images/videos)
- 🎬 **Reels** - Short-form videos up to 60 seconds
- 📋 **Stories** - 24-hour temporary content

**Advanced Features:**
- 🏷️ **User Tagging** - Tag up to 20 users with precise positioning
- 🛍️ **Product Tagging** - Tag products from Facebook catalog
- 🤝 **Collaborators** - Tag other accounts as collaborators
- 📍 **Location Tagging** - Add location stickers to posts
- 🎨 **Custom Thumbnails** - Set video thumbnail positions
- 🎵 **Audio Attribution** - Name audio tracks in reels

**Media Management:**
- 📊 **List Media** - Get paginated list of your media
- 🔍 **Get Media Details** - Retrieve specific media information
- 👶 **Get Carousel Children** - Access individual carousel items

###  Instagram Trigger Node

**Webhook Events:**
- 💬 **New Messages** - Trigger on incoming messages
- 🔘 **Postback Events** - Handle button clicks and interactions
- ✅ **Opt-in Events** - Process user consent actions
- 💭 **Comments** (NEW!) - Trigger when someone comments on your media
- 🏷️ **Mentions** (NEW!) - Trigger when someone mentions you in comments or stories

**Dual Output System:**
- **Output 1** (Messages/Postbacks/Opt-ins) - Direct messaging events
- **Output 2** (Comments/Mentions) - Content engagement events

**Security Features:**
- 🔒 Webhook signature validation (X-Hub-Signature-256)
- ✓ Verify token authentication
- 🛡️ HMAC SHA256 cryptographic verification

---

## 📋 Prerequisites

### Required Accounts
1. **Facebook Page** - Active Facebook page
2. **Instagram Business Account** - Connected to your Facebook page
3. **Meta Developer Account** - Access to Facebook Developer Console
4. **n8n Instance** - Self-hosted or cloud (version 0.196.0+)

### Required Permissions

**For Messaging:**
- `instagram_basic` - Basic profile access
- `instagram_manage_messages` - Send and receive messages
- `pages_manage_metadata` - Webhook subscriptions
- `pages_read_engagement` - Read engagement data

**For Content Publishing (NEW):**
- `instagram_content_publish` - Create and publish posts, reels, and stories
- `pages_show_list` - List Facebook pages
- `catalog_management` - Product tagging (optional, for Instagram Shopping)

### Technical Requirements
- Node.js 18.15+ or 20.10+
- n8n version 0.196.0 or higher
- HTTPS webhook endpoint (for trigger node)

---

## 🚀 Installation

### Option 1: n8n Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Search for `n8n-nodes-instagram-integrations`
4. Click **Install**
5. Restart n8n

### Option 2: npm Installation

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-instagram-integrations
```

### Option 3: Docker

Add to your `docker-compose.yml`:

```yaml
services:
  n8n:
    environment:
      - N8N_COMMUNITY_PACKAGES=n8n-nodes-instagram-integrations
```

---

## 🎯 Quick Start

### Step 1: Create Meta App

1. Visit [Meta for Developers](https://developers.facebook.com/apps/)
2. Click **Create App**
3. Select **Business** type
4. Add **Instagram** product
5. Note your **App ID** and **App Secret**

### Step 2: Connect Facebook Page

1. In App Dashboard → **Instagram** → **Basic Display**
2. Add your Instagram Business Account
3. Generate a **Page Access Token** with required permissions
4. Copy the **Instagram Business Account ID**

### Step 3: Configure n8n Credentials

**Using OAuth2 (Recommended):**

1. In n8n: **Credentials** → **New** → **Instagram OAuth2 API**
2. Enter:
   - **Client ID**: Your App ID
   - **Client Secret**: Your App Secret
3. Click **Connect my account**
4. Authorize in popup window
5. ✅ Connection established!

**Using Access Token:**

1. In n8n: **Credentials** → **New** → **Instagram Access Token API**
2. Enter:
   - **Access Token**: Your Page Access Token
3. Click **Save**
4. ✅ Account ID auto-discovered!

### Step 4: Build Your First Workflow

1. Create new workflow
2. Add **Instagram** node
3. Select **Message** → **Send Text Message**
4. Configure:
   - **Credential**: Your Instagram credential
   - **Recipient ID**: Target user's Instagram-scoped ID
   - **Message**: Your text content
5. Execute!

---

## 📚 Documentation

### Core Guides
- 📘 [**CHANGELOG.md**](./CHANGELOG.md) - Version history and updates
- 🔧 [**IMPLEMENTATION_GUIDE.md**](./IMPLEMENTATION_GUIDE.md) - Developer documentation
- � [**AUTHENTICATION_GUIDE.md**](./AUTHENTICATION_GUIDE.md) - Setup and OAuth guide
- �📋 [**Instruction Files**](./.github/instructions/) - Technical specifications

### Content Publishing Guides (NEW!)
- 🚀 [**QUICKSTART.md**](./QUICKSTART.md) - Get started in 5 minutes
- 📸 [**POST_STORY_GUIDE.md**](./POST_STORY_GUIDE.md) - Complete post/story creation guide
- 💡 [**EXAMPLES.md**](./EXAMPLES.md) - Code examples and workflow patterns
- 📊 [**FEATURE_SUMMARY.md**](./FEATURE_SUMMARY.md) - Technical implementation details

### Example Workflows

**Messaging:**
- Auto-Reply to Messages
- Daily Announcements
- Customer Support Bot

**Content Publishing:**
- Scheduled Daily Posts
- Automated Carousels
- Story Automation
- Product Showcase Reels

### API Reference

**Message Operations:**
- `sendTextMessage` - Send text content
- `sendImageMessage` - Send image via URL
- `sendAudioMessage` - Send audio file
- `sendVideoMessage` - Send video content
- `sendButtonTemplate` - Interactive buttons
- `sendGenericTemplate` - Carousel cards
- `sendQuickReplies` - Quick response options
- `uploadMedia` - Upload media files

**Post Operations (NEW):**
- `createSinglePost` - Create image/video posts
- `createCarouselPost` - Multi-media carousels
- `createReel` - Short-form videos
- `publishPost` - Publish created content

**Story Operations (NEW):**
- `createStory` - Create and publish stories

**Media Operations (NEW):**
- `listMedia` - Get your media list
- `getMedia` - Get media details
- `getMediaChildren` - Get carousel children

**User Operations:**
- `getUserProfile` - Fetch user information
- `getMyProfile` - Get authenticated account info

**Webhook Events:**
- `messages` - Incoming messages
- `messaging_postbacks` - Button interactions
- `messaging_optins` - Consent events

---

## � Token Management (v1.5.0+)

### Automatic Long-Lived Token System

Instagram uses a two-tier token system that this package **automatically manages** for you:

| Token Type | Validity | Management |
|------------|----------|------------|
| Short-lived | 1 hour | Received from OAuth |
| Long-lived | 60 days | **Auto-exchanged** on first use |
| Refreshed | 60 days | **Auto-refreshed** before expiration |

### How It Works

```
OAuth Authentication (User action)
         ↓
Short-lived Token (1 hour)
         ↓
First API Call (automatic)
         ↓
Long-lived Token Exchange (automatic)
         ↓
Token Valid for 60 Days
         ↓
Auto-refresh at 53 Days (automatic)
         ↓
Another 60 Days of Validity
```

### Key Features

✅ **Zero Configuration** - Everything happens automatically  
✅ **No More Errors** - "refreshToken is required" error is eliminated  
✅ **Smart Refresh** - Tokens refresh when at least 24 hours old and expiring within 7 days  
✅ **Fallback Protection** - If refresh fails, attempts to exchange current OAuth token  
✅ **Secure Storage** - All tokens encrypted in N8N credential system  

### Best Practices

1. **Keep Workflows Active**: Run at least once every 50 days to maintain token validity
2. **Monitor Health**: Create a weekly health-check workflow (optional)
3. **Handle Errors Gracefully**: Use `continueOnFail` for robust error handling

### Token Lifecycle Example

```typescript
// Day 1: OAuth authentication
User authenticates → Short-lived token (expires in 1 hour)

// Day 1: First workflow run
First API call → Automatic exchange → Long-lived token (expires in 60 days)

// Day 53: Automatic refresh (7 days before expiry)
API call → Token check → Auto-refresh → New long-lived token (expires in 60 days)

// Repeat cycle every ~53 days as long as workflows are active
```

### What If Token Expires?

If a workflow is inactive for 60+ days:
1. Token expires and cannot be refreshed
2. Workflow shows error: "Instagram access token has expired"
3. **Solution**: Reconnect your Instagram OAuth2 credential (takes 30 seconds)

### Learn More

📘 [**TOKEN_MANAGEMENT.md**](./docs/TOKEN_MANAGEMENT.md) - Comprehensive token management guide  
🔧 [**TOKEN_MANAGEMENT_IMPLEMENTATION.md**](./docs/TOKEN_MANAGEMENT_IMPLEMENTATION.md) - Technical implementation details

---

## �🔧 Configuration

### Webhook Setup

1. In Meta App Dashboard → **Instagram** → **Webhooks**
2. Subscribe to `messages` field
3. Callback URL: Your n8n webhook URL
   ```
   https://your-n8n.com/webhook/instagram
   ```
4. Verify Token: Enter in both Meta and n8n credentials
5. Click **Verify and Save**

### Rate Limits

- **API Calls**: 200 requests per hour per user
- **Messages**: 1000 characters max
- **Buttons**: 3 per template, 20 characters per title
- **Quick Replies**: 13 max per message
- **Webhook Response**: Must respond within 20 seconds

---

## 🛠️ Troubleshooting

### Common Issues

**"Invalid OAuth Access Token"**
- Verify token hasn't expired
- Check required permissions are granted
- Regenerate token in Meta Developer Console

**"Webhook Verification Failed"**
- Ensure verify token matches in both Meta and n8n
- Check n8n webhook is publicly accessible via HTTPS
- Verify firewall allows Meta's IP ranges

**"User Cannot Receive Messages"**
- User must initiate conversation first (24-hour window)
- Use message tags for out-of-window messaging
- Verify Instagram Business Account is active

**"Rate Limit Exceeded"**
- Implement exponential backoff
- Reduce request frequency
- Use batch operations where possible

### Debug Mode

Enable n8n debug logging:
```bash
export N8N_LOG_LEVEL=debug
n8n start
```

---

## 🤝 Support

### Resources
- 📖 [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- 💬 [n8n Community Forum](https://community.n8n.io)
- 🐛 [Issue Tracker](https://github.com/Msameim181/n8n-nodes-instagram-integrations/issues)
- 📧 Email: 9259samei@gmail.com

### Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow existing code style
4. Add tests for new features
5. Submit a pull request

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE.md](./LICENSE.md) for details.

Copyright © 2025 Mohammad Mahdi Samei

---

## 🙏 Acknowledgments

- Built with [n8n](https://n8n.io) - Fair-code workflow automation
- Powered by [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- Icons by [Instagram Brand Guidelines](https://en.instagram-brand.com/)

---

## 📊 Stats

![npm](https://img.shields.io/npm/v/n8n-nodes-instagram-integrations)
![downloads](https://img.shields.io/npm/dt/n8n-nodes-instagram-integrations)
![license](https://img.shields.io/npm/l/n8n-nodes-instagram-integrations)
![node version](https://img.shields.io/node/v/n8n-nodes-instagram-integrations)

---

**Made with ❤️ for the n8n community** | [GitHub](https://github.com/Msameim181/n8n-nodes-instagram-integrations) | [npm](https://www.npmjs.com/package/n8n-nodes-instagram-integrations)

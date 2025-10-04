# n8n-nodes-instagram

![Instagram Banner](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)
[![npm version](https://img.shields.io/npm/v/n8n-nodes-instagram.svg)](https://www.npmjs.com/package/n8n-nodes-instagram)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is an n8n community node package for Instagram Messaging API integration. It provides comprehensive support for sending messages, managing media, and handling webhooks through the Instagram Graph API.

## 📦 Installation

### Community Nodes (Recommended)

1. In n8n, go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-instagram` in the **Enter npm package name** field
4. Click **Install**

### Manual Installation

```bash
npm install n8n-nodes-instagram
```

## 🔑 Prerequisites

Before using this integration, you need:

1. **Facebook Page** - A Facebook Page linked to your Instagram Business Account
2. **Instagram Business Account** - Convert your Instagram account to a Business account
3. **Meta Developer App** - Create an app in the [Meta Developer Console](https://developers.facebook.com/)
4. **Required Permissions**: `instagram_basic`, `instagram_manage_messages`, `pages_manage_metadata`, `pages_read_engagement`
5. **Page Access Token** - Generate a token with the required permissions

## 🚀 Features

### Main Node: Instagram
- Send Text, Image, Audio, Video Messages
- Send Button & Generic Templates
- Send Quick Replies
- Upload Media
- Get User Profile

### Trigger Node: Instagram Trigger
- Listen for Messages, Postbacks, Opt-ins

## 📚 Documentation

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for complete documentation and examples.

## 📄 License

[MIT](LICENSE.md)

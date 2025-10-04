# n8n-nodes-instagram-integrations

![Instagram Banner](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)
[![npm version](https://img.shields.io/npm/v/n8n-nodes-instagram-integrations.svg)](https://www.npmjs.com/package/n8n-nodes-instagram-integrations)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

N8N community nodes for Instagram API integration with **OAuth2 authentication** - just like Google Drive!

## ✨ Features

### 🔐 Simple OAuth2 Authentication
- **One-click login** - Authenticate through Instagram popup
- **Automatic token management** - N8N handles token refresh
- **Secure** - Uses official OAuth2 flow
- Works exactly like Google Drive authentication in N8N

### 📬 Instagram Node
Send messages and interact with Instagram users:
- ✉️ Send Text, Image, Audio, Video Messages
- �� Send Button & Generic Templates  
- ⚡ Send Quick Replies
- 📤 Upload Media
- 👤 Get User Profile

### 🔔 Instagram Trigger Node  
Listen for Instagram events:
- 💬 New Messages
- 🔘 Button Postbacks
- ✅ User Opt-ins

## 🚀 Quick Start

### 1. Install

```bash
npm install n8n-nodes-instagram-integrations
```

### 2. Get Instagram Credentials

1. Go to [Meta Developer Console](https://developers.facebook.com/apps/)
2. Create app → Add Instagram product
3. Note **App ID** and **App Secret**

### 3. Authenticate (Just Like Google Drive!)

1. In N8N: **Credentials > New > Instagram OAuth2 API**
2. Enter **Client ID** (App ID) and **Client Secret**
3. Click **Connect my account**
4. Instagram popup → Login → Authorize
5. ✅ Done!

## 📄 License

MIT License

**Made with ❤️ for the N8N community**

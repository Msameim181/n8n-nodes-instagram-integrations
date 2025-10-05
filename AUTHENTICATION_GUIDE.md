# Instagram API Authentication Guide

Complete guide for setting up Instagram API authentication with n8n-nodes-instagram-integrations.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Authentication Methods](#authentication-methods)
- [Step-by-Step Setup](#step-by-step-setup)
- [OAuth2 Flow](#oauth2-flow)
- [Access Token Method](#access-token-method)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)
- [FAQs](#faqs)

---

## Overview

This package supports **OAuth2 authentication** for seamless integration with Instagram's Messaging API. The authentication process connects your n8n workflows to Instagram Business Accounts through the Meta Graph API.

### Supported Credential Types

| Type | Recommended | Use Case | Auto-Refresh |
|------|-------------|----------|--------------|
| **Instagram OAuth2 API** | ✅ Yes | Production, long-term | Yes |
| **Instagram Access Token API** | ⚠️ Alternative | Testing, manual control | No |

---

## Prerequisites

### Required Accounts

1. **Facebook Account** - Personal or business account
2. **Facebook Page** - Must be an admin/owner
3. **Instagram Business Account** - Professional account linked to Facebook Page
4. **Meta Developer Account** - Free registration at [developers.facebook.com](https://developers.facebook.com)

### Required Permissions

Your Meta app needs these permissions:

- ✅ `instagram_basic` - Basic profile information
- ✅ `instagram_manage_messages` - Send and receive messages
- ✅ `pages_manage_metadata` - Subscribe to webhooks
- ✅ `pages_read_engagement` - Read page engagement data

### Technical Requirements

- n8n version 0.196.0+
- Node.js 18.15+ or 20.10+
- HTTPS domain (for OAuth2 callback and webhooks)

---

## Authentication Methods

### Method 1: OAuth2 (Recommended) ⭐

**Advantages:**
- ✅ Automatic token refresh
- ✅ Secure authorization flow
- ✅ No manual token management
- ✅ Best for production

**Process:**
1. User clicks "Connect my account"
2. Popup opens Meta login
3. User authorizes permissions
4. n8n receives access token
5. Token auto-refreshes before expiry

### Method 2: Manual Access Token

**Advantages:**
- ⚡ Quick setup for testing
- 🔧 Full control over token lifecycle
- 🛠️ Useful for debugging

**Disadvantages:**
- ⏰ Manual token renewal required
- 🔄 No automatic refresh

**Process:**
1. Generate token in Meta Developer Console
2. Copy and paste into n8n credentials
3. Instagram Account ID auto-discovered
4. Manually refresh when expired

---

## Step-by-Step Setup

### Part A: Create Meta Developer App

#### Step 1: Register as Developer

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **Get Started** (top right)
3. Complete registration with your Facebook account
4. Verify email if prompted

#### Step 2: Create New App

1. Click **My Apps** → **Create App**
2. Select use case:
   - **Business** (recommended for most users)
   - Or **Consumer** for personal projects
3. Fill in app details:
   ```
   App Name: My Instagram n8n Integration
   App Contact Email: your-email@example.com
   Business Account: (select or create)
   ```
4. Click **Create App**
5. Complete security check if prompted

#### Step 3: Add Instagram Product

1. In App Dashboard, scroll to **Add Products**
2. Find **Instagram** → Click **Set Up**
3. Instagram product added to left sidebar ✅

#### Step 4: Configure Instagram Basic Display

1. Click **Instagram** → **Basic Display**
2. Click **Create New App**
3. Fill in:
   ```
   Display Name: n8n Instagram Bot
   Valid OAuth Redirect URIs: https://your-n8n.com/oauth/callback
   Deauthorize Callback URL: https://your-n8n.com/oauth/deauth
   Data Deletion Request URL: https://your-n8n.com/oauth/delete
   ```
4. Click **Save Changes**

#### Step 5: Add Instagram Accounts

1. Still in **Basic Display** tab
2. Scroll to **User Token Generator**
3. Click **Add or Remove Instagram Accounts**
4. Login to Instagram (Business Account)
5. Authorize the app
6. Account appears in list ✅

#### Step 6: Get App Credentials

1. Go to **Settings** → **Basic** (left sidebar)
2. Note your credentials:
   ```
   App ID: 1234567890123456
   App Secret: [Click Show] abc123def456...
   ```
3. **Keep these secure!** 🔒

---

### Part B: Connect Facebook Page

#### Step 7: Link Instagram to Facebook Page

1. Go to Facebook Page Settings
2. Click **Instagram** (left sidebar)
3. Click **Connect Account**
4. Login to Instagram Business Account
5. Confirm connection

#### Step 8: Generate Page Access Token

**Option 1: Using Graph API Explorer (Quick)**

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from dropdown
3. Click **Generate Access Token**
4. Grant permissions:
   - ✅ instagram_basic
   - ✅ instagram_manage_messages
   - ✅ pages_manage_metadata
   - ✅ pages_read_engagement
5. Copy the generated token (starts with `EAA...`)

**Option 2: Using Access Token Tool**

1. Go to [Access Token Tool](https://developers.facebook.com/tools/accesstoken/)
2. Find your Page
3. Click **Generate Token**
4. Select permissions
5. Copy Page Access Token

#### Step 9: Get Instagram Business Account ID

**Method 1: Auto-Discovery (Easiest)**

The package automatically discovers your Instagram Business Account ID when you use the **Instagram Access Token API** credential type.

**Method 2: Manual Lookup**

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Use your Page Access Token
3. Make request:
   ```
   GET /{page-id}?fields=instagram_business_account
   ```
4. Copy the `instagram_business_account.id` value

**Method 3: Using Facebook Business Manager**

1. Go to [Business Settings](https://business.facebook.com/settings/)
2. Click **Instagram Accounts**
3. Select your account
4. ID shown in URL or account details

---

### Part C: Configure n8n Credentials

#### Option 1: OAuth2 Setup (Recommended)

1. **Open n8n**
   - Navigate to **Credentials** (left sidebar)
   - Click **+ New Credential**

2. **Select Credential Type**
   - Search for "Instagram"
   - Select **Instagram OAuth2 API**

3. **Configure OAuth2**
   ```
   Credential Name: Instagram Bot
   
   Client ID: [Your App ID from Step 6]
   Client Secret: [Your App Secret from Step 6]
   
   OAuth Callback URL: (auto-filled by n8n)
   Copy this URL for Meta App settings
   ```

4. **Update Meta App Redirect URIs**
   - Go to Meta App → **Instagram** → **Basic Display**
   - Add n8n's OAuth Callback URL to **Valid OAuth Redirect URIs**
   - Save changes

5. **Authorize in n8n**
   - Back in n8n, click **Connect my account**
   - Popup opens → Login to Facebook
   - Authorize permissions
   - Popup closes → Credential saved ✅

6. **Test Connection**
   - Click **Test credential**
   - Should show: ✅ "Credential test successful"

#### Option 2: Access Token Setup (Alternative)

1. **Open n8n**
   - Navigate to **Credentials**
   - Click **+ New Credential**

2. **Select Credential Type**
   - Search for "Instagram"
   - Select **Instagram Access Token API**

3. **Configure Token**
   ```
   Credential Name: Instagram Bot (Token)
   
   Access Token: [Your Page Access Token from Step 8]
   (Paste the entire EAA... token)
   
   Instagram Business Account ID: (Leave empty for auto-discovery)
   
   Webhook Verify Token: (Optional, for webhooks)
   my_secure_verify_token_2024
   ```

4. **Save & Test**
   - Click **Save**
   - Account ID automatically discovered ✅
   - Click **Test credential** to verify

---

### Part D: Webhook Configuration (For Trigger Node)

#### Step 10: Set Up Webhook in n8n

1. Create new workflow in n8n
2. Add **Instagram Trigger** node
3. Select your credential
4. Copy the **Webhook URL** shown
   ```
   https://your-n8n.com/webhook/abc123-def456-ghi789
   ```

#### Step 11: Configure Webhook in Meta App

1. Go to Meta App Dashboard
2. Click **Instagram** → **Configuration** (or **Messenger** tab)
3. Scroll to **Webhooks**
4. Click **Add Callback URL**

5. **Fill in Webhook Settings:**
   ```
   Callback URL: [Your n8n Webhook URL from Step 10]
   https://your-n8n.com/webhook/abc123-def456-ghi789
   
   Verify Token: [Same token from credential setup]
   my_secure_verify_token_2024
   ```

6. Click **Verify and Save**
   - Meta sends GET request to n8n
   - n8n responds with challenge
   - Status shows ✅ "Complete"

#### Step 12: Subscribe to Webhook Events

1. In Webhooks section, click **Add Subscriptions**
2. Select your Instagram Account
3. Check these fields:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `messaging_optins`
4. Click **Save**

#### Step 13: Test Webhook

1. Send a message to your Instagram Business Account
2. Check n8n workflow execution
3. Should see incoming message data ✅

---

## OAuth2 Flow

### How It Works

```
User clicks "Connect"
       ↓
n8n redirects to Meta login
       ↓
User authorizes permissions
       ↓
Meta redirects back to n8n
       ↓
n8n exchanges code for token
       ↓
Token stored securely
       ↓
n8n auto-refreshes token
```

### Token Lifecycle

- **Access Token**: Valid for 60 days
- **Refresh Token**: Used to get new access token
- **Auto-Refresh**: n8n handles automatically
- **Manual Refresh**: Re-authorize if needed

### Scopes Requested

```json
{
  "scope": "instagram_basic,instagram_manage_messages,pages_manage_metadata,pages_read_engagement"
}
```

---

## Access Token Method

### Generating Long-Lived Tokens

Short-lived tokens (1 hour) can be exchanged for long-lived tokens (60 days):

```bash
curl -X GET "https://graph.instagram.com/v23.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=SHORT_LIVED_TOKEN"
```

Response:
```json
{
  "access_token": "EAA...",
  "token_type": "bearer",
  "expires_in": 5183944
}
```

### Extending Token Expiration

Refresh long-lived tokens before expiry:

```bash
curl -X GET "https://graph.instagram.com/v23.0/oauth/access_token" \
  -d "grant_type=fb_exchange_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "fb_exchange_token=LONG_LIVED_TOKEN"
```

---

## Troubleshooting

### Common Issues

#### "Invalid OAuth Access Token" (Error 190)

**Causes:**
- Token expired
- Token revoked by user
- Missing required permissions

**Solutions:**
1. Re-authorize credential in n8n
2. Check token expiry in [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
3. Verify all permissions granted
4. Generate new token

#### "Permission Denied" (Error 200)

**Causes:**
- Missing app permissions
- App not in live mode
- Business verification required

**Solutions:**
1. Go to Meta App → **Roles** → Add your account as admin
2. Request advanced permissions in **App Review**
3. Complete Business Verification if required

#### "Webhook Verification Failed"

**Causes:**
- Verify token mismatch
- n8n webhook not accessible
- Firewall blocking Meta

**Solutions:**
1. Ensure verify token matches exactly (case-sensitive)
2. Test webhook URL is publicly accessible
3. Check HTTPS certificate is valid
4. Whitelist Meta IP ranges in firewall

#### "User Cannot Receive Messages" (Error 551)

**Causes:**
- 24-hour messaging window expired
- User hasn't started conversation
- Account not eligible

**Solutions:**
1. Wait for user to message first
2. Use message tags for out-of-window messages
3. Verify account is Instagram Business Account

---

## Security Best Practices

### Protecting Credentials

- 🔒 **Never commit** credentials to version control
- 🔒 **Use environment variables** in production
- 🔒 **Rotate tokens regularly** (every 30 days)
- 🔒 **Limit token permissions** to minimum required
- 🔒 **Monitor access logs** for suspicious activity

### Webhook Security

- ✅ **Always validate** webhook signatures
- ✅ **Use HTTPS** for all endpoints
- ✅ **Verify token** is strong (20+ characters)
- ✅ **Rate limit** webhook endpoints
- ✅ **Log failures** for monitoring

### Token Storage

n8n stores credentials encrypted:
- Credentials encrypted at rest
- Encryption key in environment variable
- Access restricted by user permissions
- Audit logs for credential access

---

## FAQs

### Q: Which authentication method should I use?

**A:** Use **OAuth2** for production (automatic refresh). Use **Access Token** for testing or when you need manual control.

### Q: How long do tokens last?

**A:** 
- Short-lived: 1 hour
- Long-lived: 60 days
- OAuth2: Auto-refreshed by n8n

### Q: Can I use a personal Instagram account?

**A:** No, you must use an **Instagram Business Account** or **Instagram Creator Account** connected to a Facebook Page.

### Q: Do I need Instagram API approval?

**A:** For basic testing (your own account), no. For production (other users), you need to submit your app for **App Review** and get advanced permissions approved.

### Q: How do I get Instagram-scoped user IDs?

**A:** User IDs come from:
1. Webhook events (when users message you)
2. Graph API calls to conversations endpoint
3. User interactions with your Instagram account

### Q: Can I send messages to anyone?

**A:** No, users must initiate conversation first. After that, you have a 24-hour window to respond. Use message tags for exceptions (e.g., updates, events).

### Q: What's the rate limit?

**A:** 200 API calls per hour per user. Webhooks can receive unlimited events.

### Q: How do I test without a real Instagram account?

**A:** Use Meta's **Graph API Explorer** to test API calls. For webhooks, use tools like **ngrok** to test locally.

---

## Additional Resources

### Official Documentation
- 📖 [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- 📖 [Instagram Messaging API](https://developers.facebook.com/docs/messenger-platform/instagram)
- 📖 [Webhooks Reference](https://developers.facebook.com/docs/graph-api/webhooks)
- 📖 [Access Tokens Guide](https://developers.facebook.com/docs/facebook-login/guides/access-tokens)

### Tools
- 🔧 [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- 🔧 [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- 🔧 [Webhook Tester](https://developers.facebook.com/tools/webhooks/)

### Support
- 💬 [Meta Developer Community](https://developers.facebook.com/community/)
- 💬 [n8n Community Forum](https://community.n8n.io)
- 📧 Package Support: 9259samei@gmail.com

---

**Authentication setup complete!** 🎉 You're ready to build Instagram automation workflows in n8n.

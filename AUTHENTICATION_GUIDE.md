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

### Key Features (v1.5.7+)

- ✅ **Automatic Token Persistence** - Long-lived tokens are stored in n8n's database and survive restarts
- ✅ **Automatic Token Exchange** - Short-lived OAuth tokens are automatically exchanged for 60-day tokens
- ✅ **Automatic Token Refresh** - Tokens are refreshed when near expiration (< 7 days remaining)
- ✅ **No Manual Intervention** - Everything is handled transparently by n8n's credential system

### Supported Credential Types

| Type | Recommended | Use Case | Auto-Refresh | Survives Restart |
|------|-------------|----------|--------------|------------------|
| **Instagram OAuth2 API** | ✅ Yes | Production, long-term | Yes | ✅ Yes |

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
- ✅ Automatic token exchange (short-lived → 60-day long-lived)
- ✅ Automatic token refresh when near expiration
- ✅ **Token persists through n8n/Docker restarts** (v1.5.7+)
- ✅ Secure authorization flow
- ✅ No manual token management
- ✅ Best for production

**How It Works (v1.5.7+):**
1. User clicks "Connect my account"
2. Popup opens Meta login
3. User authorizes permissions
4. n8n receives short-lived access token (1 hour)
5. **First API call**: Token is automatically exchanged for 60-day long-lived token
6. **Token is persisted** to n8n's database (survives restarts)
7. **When token nears expiration** (< 7 days): Automatically refreshed
8. Workflow continues working indefinitely without manual intervention

### ~~Method 2: Manual Access Token~~ (Deprecated)

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

### How It Works (v1.5.7+)

```
User clicks "Connect"
       ↓
n8n redirects to Meta login
       ↓
User authorizes permissions
       ↓
Meta redirects back to n8n
       ↓
n8n receives short-lived token (1 hour)
       ↓
First API request triggers preAuthentication:
       ↓
┌─────────────────────────────────────────────┐
│  Token Exchange (automatic)                 │
│  Short-lived token → 60-day long-lived     │
│  Token persisted to n8n database           │
└─────────────────────────────────────────────┘
       ↓
Workflow runs normally
       ↓
┌─────────────────────────────────────────────┐
│  Token Refresh (automatic, when < 7 days)   │
│  Old token → New 60-day token              │
│  Updated token persisted to database       │
└─────────────────────────────────────────────┘
```

### Token Lifecycle (v1.5.7+)

| Stage | Token Type | Validity | Action |
|-------|------------|----------|--------|
| OAuth | Short-lived | 1 hour | Received from Meta |
| Exchange | Long-lived | 60 days | Automatic on first API call |
| Active | Long-lived | 60 days | Persisted in n8n database |
| Near Expiry | Long-lived | < 7 days | Auto-refreshed |
| Refreshed | Long-lived | 60 days | New token persisted |

**Important Notes:**
- ✅ Tokens survive n8n restarts, Docker container restarts, and server reboots
- ✅ Refresh only happens if token is at least 24 hours old (Instagram API requirement)
- ✅ If refresh fails but token is still valid, the existing token continues to work
- ⚠️ If token fully expires (workflow not run for 60+ days), user must reconnect

### Scopes Requested

```json
{
  "scope": "instagram_basic,instagram_manage_messages,pages_manage_metadata,pages_read_engagement"
}
```

---

## Access Token Method (Reference Only)

> **Note:** As of v1.5.7, you don't need to manually manage tokens. The OAuth2 credential type handles all token exchange and refresh automatically. This section is kept for reference only.

### How the Package Handles Tokens Automatically

**Token Exchange** (short-lived → long-lived):
```
GET https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret=YOUR_APP_SECRET
  &access_token=SHORT_LIVED_TOKEN
```

Response:
```json
{
  "access_token": "IGQ...",
  "token_type": "bearer",
  "expires_in": 5183944
}
```

**Token Refresh** (when < 7 days remaining):
```
GET https://graph.instagram.com/refresh_access_token
  ?grant_type=ig_refresh_token
  &access_token=LONG_LIVED_TOKEN
```

Response:
```json
{
  "access_token": "IGQ...",
  "token_type": "bearer",
  "expires_in": 5183944
}
```

> **All of this is handled automatically** by the `preAuthentication` hook in the credential type. The refreshed token is persisted to n8n's database, ensuring it survives restarts.

---

## Troubleshooting

### Common Issues

#### "Invalid OAuth Access Token" (Error 190)

**Causes:**
- Token expired (workflow not run for 60+ days)
- Token revoked by user in Instagram/Facebook settings
- Missing required permissions
- App removed from user's authorized apps

**Solutions:**
1. **Re-authorize credential in n8n:**
   - Go to Credentials → Instagram OAuth2 API
   - Click "Connect my account" to re-authenticate
   - The system will automatically get a new long-lived token
2. Check token expiry in [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
3. Verify all permissions are still granted
4. Check if the Instagram account is still connected to the Facebook Page

**Note (v1.5.7+):** If you see this error after an n8n restart, it may indicate the token wasn't properly persisted. Try re-authenticating once to ensure the long-lived token is stored correctly.

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
- Short-lived (from OAuth): 1 hour
- Long-lived (after exchange): 60 days
- **With OAuth2 credential (v1.5.7+)**: Indefinitely, as long as workflow runs at least once every 60 days

### Q: Do tokens survive n8n restarts?

**A:** Yes! As of v1.5.7, long-lived tokens are automatically persisted to n8n's database. They survive:
- n8n service restarts
- Docker container restarts
- Server reboots
- n8n updates

### Q: When does automatic token refresh happen?

**A:** The token is automatically refreshed when:
- Token has less than 7 days remaining before expiration
- Token is at least 24 hours old (Instagram API requirement)
- An API request is made (triggers the refresh check)

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

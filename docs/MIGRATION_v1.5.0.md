# Migration Guide: Upgrading to v1.5.0 with Automatic Token Management

## Overview

Version 1.5.0 introduces **automatic long-lived token management** that eliminates the "refreshToken is required" error. This guide explains what's changed and what you need to do.

---

## 🎉 Good News: No Action Required!

**Existing workflows will automatically benefit from the new token management system without any changes.**

---

## What's Changed?

### Before v1.5.0 ❌

```
OAuth Authentication → Short-lived Token (1 hour)
         ↓
After 1 hour: API calls fail ❌
Error: "refreshToken is required"
Manual fix: Reconnect credential
```

### After v1.5.0 ✅

```
OAuth Authentication → Short-lived Token (1 hour)
         ↓
First API Call → Automatic Exchange → Long-lived Token (60 days) ✅
         ↓
After 53 days → Automatic Refresh → New Long-lived Token (60 days) ✅
         ↓
Repeat automatically (as long as workflow runs every 60 days)
```

---

## Migration Scenarios

### Scenario 1: You're Using OAuth2 Credentials

**No action needed!**

1. Update to v1.5.0
2. Next time your workflow runs, short-lived token will automatically exchange for long-lived token
3. From then on, automatic refresh keeps it alive

**Timeline:**
```
Day 1: Update package
Day 1: Next workflow run → Auto-exchange to long-lived token
Day 53: Auto-refresh (7 days before expiry)
∞: Continue automatically
```

### Scenario 2: You're Using Manual Access Token

**Action required if you're using short-lived tokens:**

If you manually pasted a short-lived access token:

1. **Option A (Recommended)**: Switch to OAuth2
   - Delete old credential
   - Create new "Instagram OAuth2 API" credential
   - Click "Connect my account"
   - Automatic token management enabled ✅

2. **Option B**: Generate long-lived token manually
   - Exchange your token using Instagram API
   - Paste the long-lived token (valid 60 days)
   - Note: Still manual refresh needed every 60 days

**Switch to OAuth2 (5-minute process):**
```bash
# Step 1: Create new OAuth2 credential
n8n UI → Credentials → New → Instagram OAuth2 API

# Step 2: Enter app details
Client ID: [Your App ID]
Client Secret: [Your App Secret]

# Step 3: Click "Connect my account"
Authenticate in popup window

# Step 4: Update workflows
Replace old credential with new OAuth2 credential

# Step 5: Delete old credential
Cleanup old manual access token credential

✅ Done! Automatic token management enabled
```

### Scenario 3: You've Been Experiencing Token Errors

**Great news! This update fixes your problem.**

1. Update package to v1.5.0
2. If credentials are still working:
   - No action needed
   - Automatic management starts on next run

3. If credentials expired:
   - Disconnect and reconnect credential
   - Automatic management prevents future errors

---

## Testing Your Migration

### Step 1: Update Package

**Via n8n UI:**
```
Settings → Community Nodes → n8n-nodes-instagram-integrations → Update
```

**Via npm:**
```bash
cd ~/.n8n/nodes
npm update n8n-nodes-instagram-integrations
```

**Via Docker:**
```bash
docker-compose down
docker-compose pull
docker-compose up -d
```

### Step 2: Verify Credentials

1. Go to **Credentials** in n8n
2. Open your Instagram OAuth2 credential
3. Click **Test credential**
4. Should show: ✅ "Connection successful"

### Step 3: Test a Workflow

Create a simple test workflow:

```json
{
  "nodes": [
    {
      "name": "Instagram",
      "type": "n8n-nodes-instagram-integrations.instagram",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {
        "resource": "user",
        "operation": "getProfile",
        "userId": "me"
      },
      "credentials": {
        "instagramOAuth2Api": {
          "id": "YOUR_CREDENTIAL_ID",
          "name": "Instagram OAuth2 API"
        }
      }
    }
  ]
}
```

Execute the workflow:
- ✅ Success = Token management working
- ❌ Error = Check troubleshooting section below

---

## Troubleshooting Migration Issues

### Issue 1: "Invalid OAuth access token"

**Cause**: Existing token expired before update

**Solution**:
```bash
1. Delete existing Instagram credential
2. Create new Instagram OAuth2 API credential
3. Authenticate via OAuth
4. Update workflows to use new credential
```

### Issue 2: "Failed to exchange token"

**Cause**: Short-lived token expired before exchange could happen

**Solution**:
- This shouldn't happen as exchange happens immediately
- If it does, reconnect your credential
- The system will get a fresh token

### Issue 3: Workflows still failing after update

**Diagnostic steps**:

1. **Check package version**:
   ```bash
   npm list n8n-nodes-instagram-integrations
   # Should show: n8n-nodes-instagram-integrations@1.5.0
   ```

2. **Check credential type**:
   - Should be "Instagram OAuth2 API"
   - Not "Instagram API" (deprecated)

3. **Check n8n logs**:
   ```bash
   # Look for token exchange/refresh messages
   docker logs n8n | grep -i instagram
   ```

4. **Test credential**:
   - Open credential in n8n UI
   - Click "Test credential"
   - Should return user profile data

### Issue 4: "Token expired and refresh failed"

**Cause**: Workflow inactive for 60+ days

**Solution**:
```bash
1. Reconnect Instagram OAuth2 credential
2. Set up weekly health check workflow (optional):
   - Schedule trigger (every 7 days)
   - Instagram node (get user profile)
   - Email node (notify on failure)
```

---

## Breaking Changes

**None!** This is a backward-compatible update.

- ✅ Existing workflows continue to work
- ✅ No credential changes required
- ✅ No API changes
- ✅ No configuration changes

---

## New Features in v1.5.0

### 1. Automatic Token Exchange

First API call after OAuth automatically exchanges short-lived for long-lived token:

```typescript
// Before: Manual process
1. Get short-lived token from OAuth
2. Manually call exchange API
3. Copy long-lived token
4. Update credential

// After: Automatic
1. Get short-lived token from OAuth
2. ✨ Everything else handled automatically
```

### 2. Automatic Token Refresh

Tokens automatically refresh before expiration:

```typescript
// Check on every API call:
if (tokenAge >= 24 hours && expiryIn <= 7 days) {
  await refreshToken(); // Automatic
}
```

### 3. Token Metadata Tracking

New hidden fields added to credentials (automatic):

- `tokenType`: "short-lived" or "long-lived"
- `tokenExpiresAt`: Unix timestamp of expiry
- `longLivedToken`: Encrypted long-lived access token

### 4. Fallback Protection

If refresh fails, system tries to exchange current OAuth token:

```typescript
try {
  await refreshLongLivedToken(token);
} catch (error) {
  // Fallback: Try to exchange current OAuth token
  await exchangeForLongLivedToken(oauthToken);
}
```

---

## Best Practices Post-Migration

### 1. Set Up Monitoring (Optional)

Create a health-check workflow:

```yaml
Trigger: Schedule (every 7 days)
↓
Instagram Node: Get User Profile
↓
If Node: Check for errors
↓
Email Node: Notify if failed
```

### 2. Review Inactive Workflows

If you have workflows that haven't run in 60+ days:
- They may need credential reconnection
- Consider archiving unused workflows
- Set up periodic triggers for important workflows

### 3. Update Documentation

Update your internal documentation to reflect:
- No manual token refresh needed
- Workflows must run at least once every 60 days
- OAuth2 credentials recommended over manual tokens

### 4. Test Edge Cases

Test your workflows in scenarios like:
- First run after update
- Run after 10 days (should use cached long-lived token)
- Run after credential reconnection
- Error handling when API is down

---

## Rollback Plan

If you encounter issues with v1.5.0 and need to rollback:

### Option 1: Rollback Package

```bash
# Via npm
cd ~/.n8n/nodes
npm install n8n-nodes-instagram-integrations@1.4.0

# Via Docker (docker-compose.yml)
environment:
  - N8N_COMMUNITY_PACKAGES=n8n-nodes-instagram-integrations@1.4.0
```

### Option 2: Manual Token Management

While on v1.4.0:
1. Use manual access token credential type
2. Generate long-lived token manually:
   ```bash
   curl -X GET "https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=YOUR_SECRET&access_token=SHORT_LIVED_TOKEN"
   ```
3. Update credential with long-lived token
4. Repeat every 60 days

---

## Support & Resources

### Documentation
- 📘 [TOKEN_MANAGEMENT.md](./TOKEN_MANAGEMENT.md) - Complete token management guide
- 🔧 [TOKEN_MANAGEMENT_IMPLEMENTATION.md](./TOKEN_MANAGEMENT_IMPLEMENTATION.md) - Technical details
- 📋 [CHANGELOG.md](../CHANGELOG.md) - Version history

### Getting Help

**Before opening an issue, try:**
1. Reconnect your Instagram credential
2. Check n8n logs for errors
3. Verify package version is 1.5.0
4. Test credential in n8n UI

**If still having issues:**
1. Open issue on [GitHub](https://github.com/Msameim181/n8n-nodes-instagram-integrations/issues)
2. Include:
   - n8n version
   - Package version
   - Error message
   - Steps to reproduce

---

## FAQ

### Q: Do I need to update my workflows?

**A:** No! Existing workflows work without changes.

### Q: Will my current credentials stop working?

**A:** No! They'll automatically upgrade to use long-lived tokens on next run.

### Q: Do I need to reconnect my Instagram account?

**A:** Only if your current token is already expired. Otherwise, no.

### Q: What happens if I don't update?

**A:** On v1.4.0 and earlier, you'll continue to experience "refreshToken is required" errors after a few hours.

### Q: Can I continue using manual access tokens?

**A:** Yes, but OAuth2 is recommended for automatic management.

### Q: How do I know if token management is working?

**A:** Your workflows will run successfully without "refreshToken" errors for 60 days.

### Q: What if my workflow is inactive for 60+ days?

**A:** The token will expire. Simply reconnect your credential (30 seconds).

---

## Timeline Summary

```
Day 0: Update to v1.5.0
   ↓
Day 0: First workflow run
   ↓ (Automatic exchange to long-lived token)
Day 1-52: Use long-lived token
   ↓
Day 53: Automatic refresh (7 days before expiry)
   ↓ (New 60-day long-lived token)
Day 54-112: Use refreshed token
   ↓
Day 113: Another automatic refresh
   ↓
∞: Continues automatically (as long as workflow runs every 60 days)
```

---

**Last Updated**: October 5, 2025  
**Version**: 1.5.0  
**Author**: Mohammad Mahdi Samei

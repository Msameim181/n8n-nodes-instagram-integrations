# Quick Start: Instagram Post & Story Creation

Get started with Instagram content publishing in 5 minutes.

---

## Prerequisites

1. **Instagram Business Account** connected to a Facebook Page
2. **N8N Instance** with n8n-nodes-instagram-integrations installed
3. **Instagram Credentials** configured in N8N
4. **Public Media URLs** (HTTPS required)

---

## Your First Post

### Step 1: Create a Simple Image Post

1. Add Instagram node to your workflow
2. Configure:
   - **Resource**: Post
   - **Operation**: Create Single Post
   - **Media Type**: IMAGE
   - **Image URL**: `https://your-public-url.com/image.jpg`
   - **Caption**: `My first automated post! 🎉 #n8n`

3. Run the workflow
4. Copy the returned `creation_id`

### Step 2: Publish the Post

1. Add another Instagram node
2. Configure:
   - **Resource**: Post
   - **Operation**: Publish Post
   - **Creation ID**: (paste from step 1)

3. Run the workflow
4. Check your Instagram feed!

---

## Simple Workflow Examples

### Example 1: Automated Daily Post

```
Schedule Trigger (9 AM daily)
  ↓
Set Node (prepare data)
  image_url: "https://picsum.photos/1080/1080"
  caption: "Good morning! ☀️"
  ↓
Instagram: Create Single Post
  ↓
Wait Node (10 seconds)
  ↓
Instagram: Publish Post
```

### Example 2: Post with User Tag

```
Manual Trigger
  ↓
Instagram: Create Single Post
  Media Type: IMAGE
  Image URL: https://example.com/photo.jpg
  Caption: "Great times! @friend"
  Additional Options:
    User Tags:
      - username: friend
        x: 0.5
        y: 0.5
  ↓
Wait Node (10 seconds)
  ↓
Instagram: Publish Post
```

### Example 3: Simple Story

```
Manual Trigger
  ↓
Instagram: Create Story
  Media Type: IMAGE
  Image URL: https://example.com/story.jpg
```
(Stories auto-publish, no need for publish step!)

### Example 4: Basic Carousel

```
Manual Trigger
  ↓
Instagram: Create Carousel Post
  Children:
    - Image URL: https://example.com/photo1.jpg
    - Image URL: https://example.com/photo2.jpg
    - Image URL: https://example.com/photo3.jpg
  Caption: "Swipe through! ➡️"
  ↓
Wait Node (15 seconds)
  ↓
Instagram: Publish Post
```

---

## Important Tips

### ✅ DO:
- Use **HTTPS** URLs only
- Wait **10-60 seconds** between create and publish (especially for videos)
- Test with **small files** first
- Check **status_code** for large videos before publishing

### ❌ DON'T:
- Use HTTP URLs (will fail)
- Publish immediately after creating videos
- Exceed **25 posts per day**
- Use files larger than **100 MB** (1 GB for reels)

---

## Testing Your Setup

### Test 1: Simple Image Post
```javascript
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "IMAGE",
  "postImageUrl": "https://picsum.photos/1080/1080",
  "postCaption": "Test post from N8N! 🤖"
}
```

### Test 2: List Your Media
```javascript
{
  "resource": "media",
  "operation": "listMedia",
  "returnAll": false,
  "limit": 10,
  "mediaFields": ["id", "media_type", "permalink"]
}
```

### Test 3: Quick Story
```javascript
{
  "resource": "story",
  "operation": "createStory",
  "storyMediaType": "IMAGE",
  "storyImageUrl": "https://picsum.photos/1080/1920"
}
```

---

## Common Issues & Solutions

### "Invalid media file"
**Problem**: URL not accessible
**Solution**: 
- Test URL in browser first
- Ensure it's public (no authentication)
- Use HTTPS, not HTTP

### "Container not ready"
**Problem**: Tried to publish too quickly
**Solution**: 
- Add a Wait node (10-60 seconds)
- For videos, wait longer

### "Permission denied"
**Problem**: Missing Instagram permissions
**Solution**:
- Verify Instagram Business Account is connected
- Check credentials include `instagram_content_publish` permission
- Reconnect Facebook Page if needed

### "Rate limit exceeded"
**Problem**: Posted too many times
**Solution**:
- Instagram limits: 25 posts per 24 hours
- Wait 24 hours or use different account

---

## Next Steps

Once you've mastered the basics:

1. **Add User Tags** - Tag people in photos
2. **Use Locations** - Add location stickers
3. **Create Reels** - Short-form video content
4. **Build Carousels** - Multi-image posts
5. **Automate Scheduling** - Daily/weekly posts
6. **Integrate with CMS** - Pull content from WordPress, etc.

---

## Full Documentation

For detailed information:
- **[POST_STORY_GUIDE.md](./POST_STORY_GUIDE.md)** - Complete feature guide
- **[EXAMPLES.md](./EXAMPLES.md)** - Code examples for all operations
- **[FEATURE_SUMMARY.md](./FEATURE_SUMMARY.md)** - Technical details

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/Msameim181/n8n-nodes-instagram-integrations/issues)
- **Instagram API**: [Facebook Developer Docs](https://developers.facebook.com/docs/instagram-api)
- **N8N Community**: [N8N Forum](https://community.n8n.io/)

---

## Sample Workflow JSON

Copy and import this complete workflow:

```json
{
  "name": "Instagram Simple Post",
  "nodes": [
    {
      "parameters": {},
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "position": [250, 300]
    },
    {
      "parameters": {
        "resource": "post",
        "operation": "createSinglePost",
        "postMediaType": "IMAGE",
        "postImageUrl": "https://picsum.photos/1080/1080",
        "postCaption": "Automated post from N8N! 🤖 #automation #n8n"
      },
      "name": "Create Post",
      "type": "n8n-nodes-community.instagram",
      "credentials": {
        "instagramOAuth2Api": {
          "id": "1",
          "name": "Instagram account"
        }
      },
      "position": [450, 300]
    },
    {
      "parameters": {
        "amount": 10
      },
      "name": "Wait",
      "type": "n8n-nodes-base.wait",
      "position": [650, 300]
    },
    {
      "parameters": {
        "resource": "post",
        "operation": "publishPost",
        "creationId": "={{ $node['Create Post'].json.id }}"
      },
      "name": "Publish Post",
      "type": "n8n-nodes-community.instagram",
      "credentials": {
        "instagramOAuth2Api": {
          "id": "1",
          "name": "Instagram account"
        }
      },
      "position": [850, 300]
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [[{ "node": "Create Post", "type": "main", "index": 0 }]]
    },
    "Create Post": {
      "main": [[{ "node": "Wait", "type": "main", "index": 0 }]]
    },
    "Wait": {
      "main": [[{ "node": "Publish Post", "type": "main", "index": 0 }]]
    }
  }
}
```

Import this into N8N:
1. Copy the JSON above
2. In N8N, click "+ Workflow from URL"
3. Paste the JSON
4. Configure your Instagram credentials
5. Run!

---

Happy Automating! 🚀

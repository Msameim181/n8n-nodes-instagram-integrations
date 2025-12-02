# Instagram Node - Resource & Operation Map

Visual reference for all available resources and operations.

---

## Node Structure

```
Instagram Node
│
├── 📬 Message Resource (Existing)
│   ├── Send Text
│   ├── Send Image
│   ├── Send Audio
│   ├── Send Video
│   ├── Send Button Template
│   ├── Send Generic Template
│   ├── Send Quick Replies
│   └── Upload Media
│
├── � Comment Resource (NEW v1.6.0)
│   ├── Get Comments
│   ├── Get Replies
│   ├── Reply to Comment
│   ├── Send Private Reply
│   ├── Delete Comment
│   └── Hide/Unhide Comment
│
├── �📸 Post Resource (NEW)
│   ├── Create Single Post
│   ├── Create Carousel Post
│   ├── Create Reel
│   └── Publish Post
│
├── 📱 Story Resource (NEW)
│   └── Create Story
│
├── 📊 Media Resource (NEW)
│   ├── List Media
│   ├── Get Media
│   └── Get Media Children
│
└── 👤 User Resource (Existing)
    ├── Get My Profile
    └── Get Profile
```

---

## Operation Details

### 📬 Message Resource

#### Send Text
```
Input: recipientId, messageText
Output: messageId, timestamp
```

#### Send Image
```
Input: recipientId, imageUrl, isReusable
Output: messageId, attachmentId
```

#### Send Audio
```
Input: recipientId, audioUrl, isReusable
Output: messageId, attachmentId
```

#### Send Video
```
Input: recipientId, videoUrl, isReusable
Output: messageId, attachmentId
```

#### Send Button Template
```
Input: recipientId, messageText, buttons[]
  - button: type, title, url/payload
Output: messageId
```

#### Send Generic Template
```
Input: recipientId, elements[]
  - element: title, subtitle, imageUrl, buttons[], defaultAction
Output: messageId
```

#### Send Quick Replies
```
Input: recipientId, messageText, quickReplies[]
  - quickReply: title, payload
Output: messageId
```

#### Upload Media
```
Input: mediaType, mediaUrl, caption
Output: mediaId, status
```

---

### � Comment Resource (NEW v1.6.0)

#### Get Comments
```
Input:
  - mediaId: ID of the media post
  - returnAll: boolean
  - limit: number (if not returnAll)
  
Output: Array of comment objects
  - id, text, username, timestamp, like_count, replies_count
```

#### Get Replies
```
Input:
  - commentId: ID of the parent comment
  - returnAll: boolean
  - limit: number (if not returnAll)
  
Output: Array of reply objects
  - id, text, username, timestamp, like_count
```

#### Reply to Comment
```
Input:
  - commentId: ID of comment to reply to
  - replyText: Your reply message (max 8000 chars)
  
Output: { id: "new_reply_id" }
```

#### Send Private Reply
```
Input:
  - commentId: ID of comment from user
  - messageText: Private message to send
  
Output: { recipient_id, message_id }

Note: 7-day window from comment timestamp
```

#### Delete Comment
```
Input:
  - commentId: ID of comment to delete
  
Output: { success: true }
```

#### Hide/Unhide Comment
```
Input:
  - commentId: ID of comment
  - hide: boolean (true = hide, false = unhide)
  
Output: { success: true }
```

---

### �📸 Post Resource (NEW)

#### Create Single Post
```
Input:
  - mediaType: IMAGE or VIDEO
  - imageUrl or videoUrl
  - caption
  - Additional Options:
    • locationId
    • userTags[] (username, x, y)
    • productTags[] (productId, x, y)
    • collaborators[]
    • thumbOffset
    • shareToFeed
    
Output: { id: "creation_id" }
```

#### Create Carousel Post
```
Input:
  - children[] (2-10 items)
    • mediaType: IMAGE or VIDEO
    • imageUrl or videoUrl
    • userTags (per item)
  - caption
  - Additional Options:
    • locationId
    • collaborators[]
    
Output: { id: "creation_id" }
```

#### Create Reel
```
Input:
  - videoUrl (max 60 seconds)
  - caption
  - Additional Options:
    • coverUrl
    • audioName
    • locationId
    • collaborators[]
    • shareToFeed
    • thumbOffset
    
Output: { id: "creation_id" }
```

#### Publish Post
```
Input: creationId
Output: { id: "published_media_id" }
```

---

### 📱 Story Resource (NEW)

#### Create Story
```
Input:
  - mediaType: IMAGE or VIDEO
  - imageUrl or videoUrl
  - Additional Options:
    • locationId
    • collaborators[]
    
Output: { id: "published_story_id" }
Note: Auto-publishes immediately
```

---

### 📊 Media Resource (NEW)

#### List Media
```
Input:
  - returnAll: boolean
  - limit: number (if not returnAll)
  - fields[]
    
Output: Array of media objects
```

#### Get Media
```
Input:
  - mediaId
  - fields[]
    
Output: Single media object with details
```

#### Get Media Children
```
Input: mediaId (carousel album)
Output: Array of child media items
```

---

### 👤 User Resource (Existing)

#### Get My Profile
```
Input: fields[]
Output: Authenticated user profile data
```

#### Get Profile
```
Input: userId, fields[]
Output: User profile data
```

---

## Workflow Patterns

### Pattern 1: Simple Post Publishing
```
┌─────────────┐
│   Trigger   │
└──────┬──────┘
       │
       v
┌─────────────────────┐
│  Create Single Post │
│  (returns ID)       │
└──────┬──────────────┘
       │
       v
┌─────────────┐
│    Wait     │
│  10 seconds │
└──────┬──────┘
       │
       v
┌─────────────┐
│ Publish Post│
│  (use ID)   │
└──────┬──────┘
       │
       v
┌─────────────┐
│   Success   │
└─────────────┘
```

### Pattern 2: Carousel Creation
```
┌─────────────┐
│   Trigger   │
└──────┬──────┘
       │
       v
┌────────────────────────┐
│  Create Carousel Post  │
│  (children uploaded    │
│   automatically)       │
└──────┬─────────────────┘
       │
       v
┌─────────────┐
│    Wait     │
│  20 seconds │
└──────┬──────┘
       │
       v
┌─────────────┐
│ Publish Post│
└──────┬──────┘
       │
       v
┌─────────────┐
│   Success   │
└─────────────┘
```

### Pattern 3: Story Publishing
```
┌─────────────┐
│   Trigger   │
└──────┬──────┘
       │
       v
┌─────────────┐
│Create Story │
│(auto-pub)   │
└──────┬──────┘
       │
       v
┌─────────────┐
│   Success   │
└─────────────┘
```

### Pattern 4: Media Management
```
┌─────────────┐
│   Trigger   │
└──────┬──────┘
       │
       v
┌─────────────┐
│ List Media  │
└──────┬──────┘
       │
       v
┌─────────────┐
│    Loop     │
└──────┬──────┘
       │
       v
┌─────────────┐
│  Get Media  │
│   Details   │
└──────┬──────┘
       │
       v
┌─────────────┐
│  Process    │
└─────────────┘
```

### Pattern 5: Comment Moderation (NEW v1.6.0)
```
┌─────────────────────────┐
│  Instagram Trigger      │
│  (comments webhook)     │
└──────────┬──────────────┘
           │
           v
┌─────────────────────────┐
│    Check Comment        │
│    (spam detection)     │
└──────────┬──────────────┘
           │
     ┌─────┴─────┐
     │           │
     v           v
┌────────┐  ┌────────────┐
│  Spam  │  │ Good       │
└────┬───┘  └─────┬──────┘
     │            │
     v            v
┌────────┐  ┌────────────┐
│ Hide   │  │ Reply +    │
│Comment │  │Private DM  │
└────────┘  └────────────┘
```

### Pattern 6: Private Reply Workflow (NEW v1.6.0)
```
┌─────────────────────────┐
│  Instagram Trigger      │
│  (comments webhook)     │
└──────────┬──────────────┘
           │
           v
┌─────────────────────────┐
│  Check keyword in       │
│  comment (e.g., "INFO") │
└──────────┬──────────────┘
           │
           v
┌─────────────────────────┐
│  Send Private Reply     │
│  (DM with details)      │
└──────────┬──────────────┘
           │
           v
┌─────────────────────────┐
│  Reply to Comment       │
│  "Check your DMs! 📬"   │
└─────────────────────────┘
```

---

## Parameter Quick Reference

### Common Parameters

**Media URLs:**
- Must be HTTPS
- Publicly accessible
- Valid formats (JPEG, PNG for images; MP4 for videos)

**Captions:**
- Max 2,200 characters
- Supports #hashtags (max 30)
- Supports @mentions

**Coordinates (x, y):**
- Range: 0.0 to 1.0
- x: 0.0 (left) to 1.0 (right)
- y: 0.0 (top) to 1.0 (bottom)

**Account IDs:**
- Format: Instagram-scoped ID (17-digit number)
- Get from Graph API: `/{username}?fields=id`

### Limits

| Feature | Limit |
|---------|-------|
| Posts per day | 25 |
| Carousel items | 2-10 |
| User tags per image | 20 |
| Hashtags per caption | 30 |
| Quick replies | 13 |
| Buttons per template | 3 |
| Video duration (stories/reels) | 60 seconds |
| Video duration (feed) | 60 minutes |
| Image size | 8 MB |
| Video size | 100 MB (1 GB for reels) |

---

## Error Handling

### Common Errors

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 190 | Invalid token | Reconnect credentials |
| 200 | Permission denied | Check app permissions |
| 551 | User cannot receive | User must initiate conversation |
| 10 | Missing permission | Add required permission to app |
| 613 | Rate limit | Wait before retrying |
| 100 | Invalid parameter | Check parameter format |

### Status Codes (Media Containers)

| Status | Meaning | Action |
|--------|---------|--------|
| FINISHED | Ready to publish | Publish now |
| IN_PROGRESS | Processing | Wait longer |
| ERROR | Processing failed | Check media format |
| EXPIRED | Container expired | Create new container |
| PUBLISHED | Already published | No action needed |

---

## Field Options

### Media Fields
```
- id
- caption
- media_type (IMAGE, VIDEO, CAROUSEL_ALBUM)
- media_url
- permalink
- thumbnail_url
- timestamp
- username
- like_count
- comments_count
- owner
- is_comment_enabled
- media_product_type (FEED, REELS, STORY)
- shortcode
- children (for carousels)
```

### User Fields
```
- id
- username
- name
- account_type (BUSINESS, MEDIA_CREATOR, PERSONAL)
- profile_picture_url
- followers_count
- follows_count
- media_count
- follower_count
- is_verified_user
- is_user_follow_business
- is_business_follow_user
```

---

## Integration Examples

### With External Services

**WordPress → Instagram:**
```
WordPress Trigger (new post)
  → Extract featured image
  → Create Instagram Post
  → Publish
```

**Shopify → Instagram:**
```
Shopify Trigger (new product)
  → Get product images
  → Create Carousel Post
  → Add product tags
  → Publish
```

**Airtable → Instagram:**
```
Airtable Trigger (new record)
  → Read content & media URLs
  → Create Post/Story
  → Publish
  → Update Airtable (mark as posted)
```

**RSS Feed → Instagram:**
```
RSS Trigger (new item)
  → Parse content
  → Download/upload images
  → Create Post
  → Publish
```

---

## Best Practices

### ✅ DO:
1. **Test with small files first**
2. **Use HTTPS URLs exclusively**
3. **Wait appropriate time before publishing**
   - Images: 5-10 seconds
   - Videos: 30-60 seconds
   - Carousels: 20-30 seconds
4. **Check status_code for videos**
5. **Handle errors gracefully**
6. **Respect rate limits (25 posts/day)**
7. **Use high-quality media**
8. **Tag strategically (don't over-tag)**

### ❌ DON'T:
1. **Don't use HTTP URLs**
2. **Don't publish videos immediately**
3. **Don't exceed daily limits**
4. **Don't use oversized files**
5. **Don't hardcode credentials**
6. **Don't ignore error codes**
7. **Don't skip status checking**
8. **Don't use expired containers**

---

## Quick Command Reference

### Create Image Post
```javascript
Resource: post
Operation: createSinglePost
postMediaType: IMAGE
postImageUrl: https://...
postCaption: "..."
```

### Create Video Post
```javascript
Resource: post
Operation: createSinglePost
postMediaType: VIDEO
postVideoUrl: https://...
postCaption: "..."
```

### Create Carousel
```javascript
Resource: post
Operation: createCarouselPost
carouselChildren: [...]
carouselCaption: "..."
```

### Create Reel
```javascript
Resource: post
Operation: createReel
reelVideoUrl: https://...
reelCaption: "..."
```

### Create Story
```javascript
Resource: story
Operation: createStory
storyMediaType: IMAGE/VIDEO
storyImageUrl/storyVideoUrl: https://...
```

### List Media
```javascript
Resource: media
Operation: listMedia
returnAll: true/false
limit: 50
```

### Publish
```javascript
Resource: post
Operation: publishPost
creationId: "..."
```

### Get Comments (NEW v1.6.0)
```javascript
Resource: comment
Operation: getComments
mediaId: "17895695668004550"
returnAll: true
```

### Reply to Comment (NEW v1.6.0)
```javascript
Resource: comment
Operation: replyToComment
commentId: "17858391726040854"
replyText: "Thanks for your feedback!"
```

### Send Private Reply (NEW v1.6.0)
```javascript
Resource: comment
Operation: sendPrivateReply
commentId: "17858391726040854"
messageText: "Here's your exclusive code: SAVE20"
```

### Hide Comment (NEW v1.6.0)
```javascript
Resource: comment
Operation: toggleVisibility
commentId: "17858391726040854"
hide: true
```

---

For complete documentation, see:
- [POST_STORY_GUIDE.md](./POST_STORY_GUIDE.md)
- [EXAMPLES.md](./EXAMPLES.md)
- [QUICKSTART.md](./QUICKSTART.md)

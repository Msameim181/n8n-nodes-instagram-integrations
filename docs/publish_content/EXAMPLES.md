# Instagram Node - Code Examples

Quick reference examples for common Instagram operations.

---

## Table of Contents
- [Single Image Post](#single-image-post)
- [Single Video Post](#single-video-post)
- [Carousel Post](#carousel-post)
- [Reel Creation](#reel-creation)
- [Story Creation](#story-creation)
- [Advanced Features](#advanced-features)

---

## Single Image Post

### Basic Image Post
```javascript
// Step 1: Create Container
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "IMAGE",
  "postImageUrl": "https://example.com/photo.jpg",
  "postCaption": "Beautiful day! ☀️ #sunshine"
}
// Returns: { "id": "17895695668004550" }

// Step 2: Publish
{
  "resource": "post",
  "operation": "publishPost",
  "creationId": "17895695668004550"
}
```

### Image Post with User Tags
```javascript
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "IMAGE",
  "postImageUrl": "https://example.com/group-photo.jpg",
  "postCaption": "Great times with friends! 🎉",
  "postAdditionalOptions": {
    "user_tags": {
      "tag": [
        {
          "username": "alice",
          "x": 0.3,
          "y": 0.4
        },
        {
          "username": "bob",
          "x": 0.7,
          "y": 0.4
        }
      ]
    }
  }
}
```

### Image Post with Location
```javascript
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "IMAGE",
  "postImageUrl": "https://example.com/eiffel-tower.jpg",
  "postCaption": "Paris 🇫🇷 #travel",
  "postAdditionalOptions": {
    "location_id": "110774245634034"  // Paris, France
  }
}
```

### Image Post with Product Tags (Shopping)
```javascript
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "IMAGE",
  "postImageUrl": "https://example.com/product.jpg",
  "postCaption": "New product launch! 🛍️ #shopping",
  "postAdditionalOptions": {
    "product_tags": {
      "tag": [
        {
          "product_id": "1234567890",
          "x": 0.5,
          "y": 0.5
        }
      ]
    }
  }
}
```

---

## Single Video Post

### Basic Video Post
```javascript
// Step 1: Create Container
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "VIDEO",
  "postVideoUrl": "https://example.com/video.mp4",
  "postCaption": "Watch this! 🎬 #video"
}

// Step 2: Wait for processing (videos take longer)
// Wait 30-60 seconds

// Step 3: Publish
{
  "resource": "post",
  "operation": "publishPost",
  "creationId": "17895695668004550"
}
```

### Video Post with Custom Thumbnail
```javascript
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "VIDEO",
  "postVideoUrl": "https://example.com/video.mp4",
  "postCaption": "Amazing moment captured! 📹",
  "postAdditionalOptions": {
    "thumb_offset": 5000  // Use frame at 5 seconds as thumbnail
  }
}
```

---

## Carousel Post

### Basic Carousel (Multiple Images)
```javascript
{
  "resource": "post",
  "operation": "createCarouselPost",
  "carouselChildren": {
    "child": [
      {
        "media_type": "IMAGE",
        "image_url": "https://example.com/photo1.jpg"
      },
      {
        "media_type": "IMAGE",
        "image_url": "https://example.com/photo2.jpg"
      },
      {
        "media_type": "IMAGE",
        "image_url": "https://example.com/photo3.jpg"
      }
    ]
  },
  "carouselCaption": "Swipe through my journey! ➡️ #carousel"
}
```

### Mixed Media Carousel (Images + Videos)
```javascript
{
  "resource": "post",
  "operation": "createCarouselPost",
  "carouselChildren": {
    "child": [
      {
        "media_type": "IMAGE",
        "image_url": "https://example.com/photo1.jpg"
      },
      {
        "media_type": "VIDEO",
        "video_url": "https://example.com/clip1.mp4"
      },
      {
        "media_type": "IMAGE",
        "image_url": "https://example.com/photo2.jpg"
      },
      {
        "media_type": "VIDEO",
        "video_url": "https://example.com/clip2.mp4"
      }
    ]
  },
  "carouselCaption": "Behind the scenes! 🎬📸"
}
```

### Carousel with User Tags per Image
```javascript
{
  "resource": "post",
  "operation": "createCarouselPost",
  "carouselChildren": {
    "child": [
      {
        "media_type": "IMAGE",
        "image_url": "https://example.com/photo1.jpg",
        "user_tags": "[{\"username\":\"alice\",\"x\":0.5,\"y\":0.5}]"
      },
      {
        "media_type": "IMAGE",
        "image_url": "https://example.com/photo2.jpg",
        "user_tags": "[{\"username\":\"bob\",\"x\":0.3,\"y\":0.4}]"
      }
    ]
  },
  "carouselCaption": "Team photos! 👥"
}
```

---

## Reel Creation

### Basic Reel
```javascript
{
  "resource": "post",
  "operation": "createReel",
  "reelVideoUrl": "https://example.com/reel.mp4",
  "reelCaption": "Check this out! 🔥 #reels #viral"
}
```

### Reel with Cover Image
```javascript
{
  "resource": "post",
  "operation": "createReel",
  "reelVideoUrl": "https://example.com/reel.mp4",
  "reelCaption": "Tutorial time! 📚 #howto",
  "reelAdditionalOptions": {
    "cover_url": "https://example.com/cover.jpg"
  }
}
```

### Reel with Audio Name
```javascript
{
  "resource": "post",
  "operation": "createReel",
  "reelVideoUrl": "https://example.com/dance.mp4",
  "reelCaption": "New dance trend! 💃 #dance",
  "reelAdditionalOptions": {
    "audio_name": "Original Audio - YourUsername",
    "share_to_feed": true
  }
}
```

### Reel with All Options
```javascript
{
  "resource": "post",
  "operation": "createReel",
  "reelVideoUrl": "https://example.com/reel.mp4",
  "reelCaption": "Full feature reel! 🎥",
  "reelAdditionalOptions": {
    "cover_url": "https://example.com/cover.jpg",
    "audio_name": "Original Audio",
    "location_id": "123456789",
    "collaborators": "[\"17841400001234567\"]",
    "share_to_feed": true,
    "thumb_offset": 2000
  }
}
```

---

## Story Creation

### Basic Image Story
```javascript
{
  "resource": "story",
  "operation": "createStory",
  "storyMediaType": "IMAGE",
  "storyImageUrl": "https://example.com/story.jpg"
}
// Stories are automatically published immediately
```

### Basic Video Story
```javascript
{
  "resource": "story",
  "operation": "createStory",
  "storyMediaType": "VIDEO",
  "storyVideoUrl": "https://example.com/story.mp4"
}
```

### Story with Location
```javascript
{
  "resource": "story",
  "operation": "createStory",
  "storyMediaType": "IMAGE",
  "storyImageUrl": "https://example.com/story.jpg",
  "storyAdditionalOptions": {
    "location_id": "123456789"
  }
}
```

### Story with Collaborator
```javascript
{
  "resource": "story",
  "operation": "createStory",
  "storyMediaType": "IMAGE",
  "storyImageUrl": "https://example.com/collab.jpg",
  "storyAdditionalOptions": {
    "collaborators": "[\"17841400001234567\"]"
  }
}
```

---

## Advanced Features

### Collaborator Posts
```javascript
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "IMAGE",
  "postImageUrl": "https://example.com/collab-post.jpg",
  "postCaption": "Collaboration post! 🤝",
  "postAdditionalOptions": {
    "collaborators": "[\"17841400001234567\",\"17841400009876543\"]"
  }
}
```

### Maximum User Tags (20 tags)
```javascript
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "IMAGE",
  "postImageUrl": "https://example.com/large-group.jpg",
  "postCaption": "Big event! 🎉",
  "postAdditionalOptions": {
    "user_tags": {
      "tag": [
        { "username": "user1", "x": 0.1, "y": 0.1 },
        { "username": "user2", "x": 0.2, "y": 0.1 },
        { "username": "user3", "x": 0.3, "y": 0.1 },
        { "username": "user4", "x": 0.4, "y": 0.1 },
        { "username": "user5", "x": 0.5, "y": 0.1 },
        { "username": "user6", "x": 0.6, "y": 0.1 },
        { "username": "user7", "x": 0.7, "y": 0.1 },
        { "username": "user8", "x": 0.8, "y": 0.1 },
        { "username": "user9", "x": 0.9, "y": 0.1 },
        { "username": "user10", "x": 0.1, "y": 0.5 }
        // ... up to 20 tags
      ]
    }
  }
}
```

### Multiple Product Tags
```javascript
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "IMAGE",
  "postImageUrl": "https://example.com/products.jpg",
  "postCaption": "Shop the look! 🛍️ #shopping",
  "postAdditionalOptions": {
    "product_tags": {
      "tag": [
        { "product_id": "1111111111", "x": 0.3, "y": 0.4 },
        { "product_id": "2222222222", "x": 0.7, "y": 0.4 },
        { "product_id": "3333333333", "x": 0.5, "y": 0.8 }
      ]
    }
  }
}
```

---

## Media Operations

### List All Media
```javascript
{
  "resource": "media",
  "operation": "listMedia",
  "returnAll": true,
  "mediaFields": ["id", "media_type", "media_url", "permalink", "timestamp", "caption"]
}
```

### List Recent Media (Limited)
```javascript
{
  "resource": "media",
  "operation": "listMedia",
  "returnAll": false,
  "limit": 25,
  "mediaFields": ["id", "media_type", "permalink", "like_count", "comments_count"]
}
```

### Get Specific Media Details
```javascript
{
  "resource": "media",
  "operation": "getMedia",
  "mediaId": "17895695668004550",
  "mediaDetailFields": [
    "id",
    "caption",
    "media_type",
    "media_url",
    "permalink",
    "timestamp",
    "like_count",
    "comments_count",
    "owner",
    "username"
  ]
}
```

### Get Carousel Children
```javascript
{
  "resource": "media",
  "operation": "getMediaChildren",
  "mediaId": "17895695668004550"  // Carousel album ID
}
```

---

## Error Handling Examples

### Check Container Status Before Publishing
```javascript
// After creating a post container, check its status
// Use HTTP Request node with Instagram API

// GET https://graph.instagram.com/v23.0/{container-id}?fields=status_code

// Response examples:
// { "status_code": "FINISHED" } → Ready to publish
// { "status_code": "IN_PROGRESS" } → Wait longer
// { "status_code": "ERROR" } → Something went wrong
```

### Retry Logic for Publishing
```javascript
// N8N Workflow with retry
{
  "nodes": [
    {
      "name": "Create Post",
      "type": "instagram",
      "continueOnFail": false
    },
    {
      "name": "Wait 10 seconds",
      "type": "wait"
    },
    {
      "name": "Check Status",
      "type": "httpRequest",
      "continueOnFail": true
    },
    {
      "name": "If Finished",
      "type": "if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.status_code }}",
              "operation": "equals",
              "value2": "FINISHED"
            }
          ]
        }
      }
    },
    {
      "name": "Publish Post",
      "type": "instagram"
    }
  ]
}
```

---

## N8N Expression Examples

### Using Previous Node Data
```javascript
// Reference data from previous nodes
{
  "postImageUrl": "={{ $node['Download Image'].json.url }}",
  "postCaption": "={{ $node['Generate Caption'].json.text }}"
}
```

### Dynamic User Tags
```javascript
// From previous node with array of users
{
  "postAdditionalOptions": {
    "user_tags": {
      "tag": "={{ $node['Get Users'].json.map(u => ({ username: u.name, x: 0.5, y: 0.5 })) }}"
    }
  }
}
```

### Conditional Publishing
```javascript
// Only publish if certain conditions are met
{
  "resource": "post",
  "operation": "publishPost",
  "creationId": "={{ $node['Create Post'].json.id }}",
  "conditionals": {
    "if": "={{ $node['Check Status'].json.status_code === 'FINISHED' }}"
  }
}
```

---

## Common Workflows

### Scheduled Daily Post
```
Cron Trigger (9 AM daily)
  → Fetch Content from Database
  → Create Instagram Post
  → Wait 15 seconds
  → Publish Post
  → Log Success
```

### User-Generated Content Curation
```
Webhook Trigger (when user submits photo)
  → Validate Image URL
  → Create Post with User Tag
  → Wait for Processing
  → Publish Post
  → Thank User (Email/DM)
```

### Cross-Platform Posting
```
Manual Trigger
  → Upload to Cloud Storage (S3)
  → Get Public URL
  → Create Instagram Post
  → Create Facebook Post
  → Create Twitter Post
  → Send Summary Report
```

### Automated Product Showcase
```
Shopify New Product Trigger
  → Get Product Images
  → Create Carousel Post
  → Add Product Tags
  → Publish Post
  → Update Product Metadata
```

---

## Tips & Best Practices

1. **Always Use HTTPS URLs** - Instagram requires secure connections
2. **Test Image Accessibility** - Ensure URLs are publicly accessible before posting
3. **Wait Before Publishing** - Give videos time to process (30-60 seconds)
4. **Validate Container Status** - Check status_code before publishing
5. **Handle Errors Gracefully** - Use try-catch and continueOnFail options
6. **Respect Rate Limits** - Max 25 posts per 24 hours
7. **Use High-Quality Media** - Instagram may reject low-quality content
8. **Optimize Video Format** - MP4 with H.264 codec works best
9. **Keep Captions Engaging** - Use emojis, hashtags, and @mentions
10. **Tag Strategically** - Don't over-tag (max 20 user tags, 30 hashtags)

---

For more details, see the [POST_STORY_GUIDE.md](./POST_STORY_GUIDE.md) documentation.

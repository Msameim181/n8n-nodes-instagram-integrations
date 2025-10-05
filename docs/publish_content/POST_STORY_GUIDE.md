# Instagram Post & Story Creation Guide

This guide covers the new post and story creation features added to the N8N Instagram node.

## Table of Contents
- [Overview](#overview)
- [Media Operations](#media-operations)
- [Post Operations](#post-operations)
- [Story Operations](#story-operations)
- [Advanced Features](#advanced-features)
- [Workflow Examples](#workflow-examples)
- [API Limitations](#api-limitations)

---

## Overview

The Instagram node now supports comprehensive content creation features:

### Resources
- **Media** - Retrieve and manage existing media objects
- **Post** - Create feed posts, carousel posts, and reels
- **Story** - Create Instagram stories

### Publishing Flow
Instagram uses a two-step process for creating content:
1. **Create Container** - Upload media and create a media container (returns a creation ID)
2. **Publish** - Publish the container to make it visible (automatic for stories)

---

## Media Operations

### List Media
Retrieve a list of media objects from your Instagram account.

**Parameters:**
- **Return All** - Whether to return all results or limit
- **Limit** - Maximum number of results (1-100)
- **Fields** - Data to retrieve for each media item:
  - Caption
  - Comments Count
  - ID
  - Is Comment Enabled
  - Like Count
  - Media Type
  - Media URL
  - Owner
  - Permalink
  - Thumbnail URL
  - Timestamp
  - Username

**Example Response:**
```json
{
  "id": "17895695668004550",
  "media_type": "IMAGE",
  "media_url": "https://scontent.cdninstagram.com/...",
  "permalink": "https://www.instagram.com/p/ABC123/",
  "timestamp": "2024-01-15T10:30:00+0000"
}
```

### Get Media
Retrieve detailed information about a specific media object.

**Parameters:**
- **Media ID** - The Instagram media ID
- **Fields** - Data to retrieve (includes all List Media fields plus):
  - Children (for carousel albums)
  - Media Product Type
  - Shortcode

### Get Media Children
Retrieve child media items from a carousel album.

**Parameters:**
- **Media ID** - The carousel album media ID

---

## Post Operations

### Create Single Post

Create a single image or video feed post.

**Parameters:**

#### Required
- **Media Type** - IMAGE or VIDEO
- **Image URL** / **Video URL** - Public HTTPS URL of the media file
- **Caption** - Post caption (supports #hashtags and @mentions)

#### Additional Options
- **Location ID** - Facebook Page ID for location tagging
- **User Tags** - Tag users in the photo
  - Username
  - X Position (0.0 to 1.0)
  - Y Position (0.0 to 1.0)
- **Product Tags** - Tag products (requires Instagram Shopping)
  - Product ID (from Facebook catalog)
  - X Position (0.0 to 1.0)
  - Y Position (0.0 to 1.0)
- **Collaborators** - JSON array of Instagram account IDs
  ```json
  ["17841400001234567", "17841400009876543"]
  ```
- **Thumb Offset** - Video thumbnail position in milliseconds (VIDEO only)
- **Share to Feed** - Whether to share to main feed (for reels)

**Example Workflow:**
```javascript
// Step 1: Create post container
{
  "resource": "post",
  "operation": "createSinglePost",
  "postMediaType": "IMAGE",
  "postImageUrl": "https://example.com/photo.jpg",
  "postCaption": "Amazing sunset! 🌅 #nature #photography",
  "postAdditionalOptions": {
    "user_tags": {
      "tag": [
        {
          "username": "johndoe",
          "x": 0.5,
          "y": 0.3
        }
      ]
    },
    "location_id": "123456789"
  }
}

// Response: { "id": "17895695668004550" }

// Step 2: Publish the post
{
  "resource": "post",
  "operation": "publishPost",
  "creationId": "17895695668004550"
}

// Response: { "id": "17895695668004550_17841400000000000" }
```

---

### Create Carousel Post

Create a post with multiple images/videos (2-10 items).

**Parameters:**

#### Required
- **Children** - Media items for the carousel (2-10 items)
  - **Media Type** - IMAGE or VIDEO
  - **Image URL** / **Video URL** - Public HTTPS URL
  - **User Tags** - JSON string of user tags for this specific item
    ```json
    [{"username":"johndoe","x":0.5,"y":0.5}]
    ```
- **Caption** - Caption for the carousel

#### Additional Options
- **Location ID** - Facebook Page ID for location tagging
- **Collaborators** - JSON array of Instagram account IDs

**Example Workflow:**
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
        "media_type": "VIDEO",
        "video_url": "https://example.com/video1.mp4"
      }
    ]
  },
  "carouselCaption": "Swipe to see the journey! ➡️ #travel",
  "carouselAdditionalOptions": {
    "location_id": "123456789"
  }
}

// This creates and returns the carousel container ID
// Then use "publishPost" operation to publish it
```

---

### Create Reel

Create an Instagram Reel (short-form video, max 60 seconds).

**Parameters:**

#### Required
- **Video URL** - Public HTTPS URL of the video (max 60 seconds)
- **Caption** - Reel caption

#### Additional Options
- **Cover URL** - Custom cover image URL
- **Audio Name** - Name of the audio track
- **Location ID** - Facebook Page ID for location
- **Collaborators** - JSON array of Instagram account IDs
- **Share to Feed** - Whether to share to main feed (default: true)
- **Thumb Offset** - Thumbnail position in milliseconds

**Example:**
```javascript
{
  "resource": "post",
  "operation": "createReel",
  "reelVideoUrl": "https://example.com/reel.mp4",
  "reelCaption": "Check out this amazing moment! 🎬 #reels #viral",
  "reelAdditionalOptions": {
    "cover_url": "https://example.com/cover.jpg",
    "audio_name": "Original Audio - YourUsername",
    "share_to_feed": true,
    "thumb_offset": 2000
  }
}
```

---

### Publish Post

Publish a previously created media container.

**Parameters:**
- **Creation ID** - The ID returned from a create operation

**Example:**
```javascript
{
  "resource": "post",
  "operation": "publishPost",
  "creationId": "17895695668004550"
}
```

**Note:** You must wait for the container status to be ready before publishing. Check status with:
```javascript
GET /{container-id}?fields=status_code
```

Status codes:
- `EXPIRED` - Container expired, create a new one
- `ERROR` - Processing error
- `FINISHED` - Ready to publish
- `IN_PROGRESS` - Still processing, wait before publishing
- `PUBLISHED` - Already published

---

## Story Operations

### Create Story

Create an Instagram Story (image or video, max 60 seconds for video).

**Parameters:**

#### Required
- **Media Type** - IMAGE or VIDEO
- **Image URL** / **Video URL** - Public HTTPS URL

#### Additional Options
- **Location ID** - Facebook Page ID for location sticker
- **Collaborators** - JSON array of Instagram account IDs

**Example:**
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

**Note:** Stories are automatically published immediately (24-hour duration).

---

## Advanced Features

### User Tagging

Tag users in photos by specifying their position:

```javascript
"user_tags": {
  "tag": [
    {
      "username": "johndoe",
      "x": 0.5,    // Center horizontally
      "y": 0.3     // Upper third vertically
    },
    {
      "username": "janedoe",
      "x": 0.8,
      "y": 0.7
    }
  ]
}
```

Coordinate system:
- X: 0.0 (left) to 1.0 (right)
- Y: 0.0 (top) to 1.0 (bottom)

### Product Tagging

Tag products from your Facebook catalog (requires Instagram Shopping):

```javascript
"product_tags": {
  "tag": [
    {
      "product_id": "1234567890",
      "x": 0.5,
      "y": 0.5
    }
  ]
}
```

### Collaborator Tagging

Tag other Instagram accounts as collaborators:

```javascript
"collaborators": "[\"17841400001234567\",\"17841400009876543\"]"
```

**Note:** Must be a JSON string array of Instagram account IDs (not usernames).

### Location Tagging

Add a location sticker using a Facebook Page ID:

```javascript
"location_id": "123456789"
```

To find a Facebook Page ID:
1. Go to the Facebook Page
2. Click "About"
3. Scroll to "Page ID" or check the URL

---

## Workflow Examples

### Complete Post Creation Workflow

```
1. HTTP Request Node
   └─ Download image from URL
   
2. Instagram Node (Create Single Post)
   ├─ Media Type: IMAGE
   ├─ Image URL: {{ $node["HTTP Request"].json.imageUrl }}
   ├─ Caption: "My amazing post! #n8n"
   └─ User Tags: Tag friends
   
3. Wait Node
   └─ Wait 10 seconds for processing
   
4. Instagram Node (Publish Post)
   └─ Creation ID: {{ $node["Instagram"].json.id }}
   
5. Send Success Notification
```

### Automated Carousel Post from Multiple Sources

```
1. Read Binary Files
   └─ Read 3-5 images from folder
   
2. Loop Node
   ├─ For each image...
   └─ Upload to public storage (S3, Cloudinary, etc.)
   
3. Aggregate URLs
   └─ Collect all image URLs
   
4. Instagram Node (Create Carousel)
   └─ Map URLs to carousel children
   
5. Instagram Node (Publish Post)
```

### Scheduled Story Posts

```
1. Cron Trigger
   └─ Every day at 9 AM
   
2. Fetch Daily Content
   └─ From CMS or database
   
3. Instagram Node (Create Story)
   ├─ Media Type: IMAGE
   └─ Image URL: {{ $node["Fetch"].json.storyImage }}
   
4. Log Success
```

---

## API Limitations

### Media Requirements

**Images:**
- Format: JPEG, PNG
- Max size: 8 MB
- Aspect ratio: 0.8 to 1.91
- Min dimensions: 320 x 320 pixels
- Must be hosted on publicly accessible HTTPS URL

**Videos:**
- Format: MP4, MOV
- Max size: 100 MB (1 GB for reels)
- Max duration: 60 seconds (stories/reels), 60 minutes (feed videos)
- Aspect ratio: 0.01 to 10.0
- Frame rate: Max 60 fps
- Audio codec: AAC, MP3

**Stories:**
- Duration: 24 hours
- Video max: 60 seconds
- Image display: 5 seconds (user can hold)

### Rate Limits

- **Content Publishing**: 25 posts per 24 hours per user
- **API Calls**: 200 calls per hour per user
- **Carousel Items**: 2-10 items per carousel
- **User Tags**: Max 20 per photo
- **Hashtags**: Max 30 per caption

### Publishing Delays

After creating a media container, you must wait for it to be processed:

- **Images**: Usually immediate (< 5 seconds)
- **Videos**: Can take 30 seconds to several minutes depending on size
- **Carousels**: Additional time for each child media item

Always check the container's `status_code` before publishing:
```javascript
GET /{container-id}?fields=status_code
```

### Permissions Required

Ensure your Instagram Business Account has these permissions:
- `instagram_basic`
- `instagram_content_publish`
- `pages_read_engagement`
- `pages_show_list`

For product tagging:
- `catalog_management` (Instagram Shopping setup required)

### Best Practices

1. **Test with Small Files First** - Start with small images/videos to verify your setup
2. **Use High-Quality Media** - Instagram may reject low-quality content
3. **Validate URLs** - Ensure all media URLs are publicly accessible via HTTPS
4. **Handle Errors Gracefully** - Implement retry logic for publishing failures
5. **Monitor Status** - Always check container status before publishing
6. **Respect Rate Limits** - Don't exceed 25 posts per day
7. **Use Webhooks** - For production, use webhooks to get publishing status updates

---

## Troubleshooting

### Common Errors

**"Invalid media file"**
- Ensure the media URL is publicly accessible
- Check file format and size requirements
- Verify the URL uses HTTPS

**"Container not ready"**
- Wait longer for video processing
- Check status_code field before publishing

**"Permission denied"**
- Verify Instagram Business Account is connected
- Check app permissions include `instagram_content_publish`

**"Rate limit exceeded"**
- You've published too many posts today (max 25)
- Wait 24 hours or use a different account

**"Invalid container ID"**
- Container may have expired (24-hour lifetime)
- Create a new container

### Getting Help

- Check the [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- Review [Content Publishing Guidelines](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- Test with [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

---

## Complete Example: Multi-Step Post Creation

Here's a complete N8N workflow for creating and publishing an Instagram post with all features:

```json
{
  "nodes": [
    {
      "name": "Trigger",
      "type": "n8n-nodes-base.manualTrigger"
    },
    {
      "name": "Prepare Data",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "imageUrl",
              "value": "https://images.unsplash.com/photo-1234567890"
            },
            {
              "name": "caption",
              "value": "Beautiful sunset captured today! 🌅 #photography #nature"
            }
          ]
        }
      }
    },
    {
      "name": "Create Post",
      "type": "n8n-nodes-community.instagram",
      "parameters": {
        "resource": "post",
        "operation": "createSinglePost",
        "postMediaType": "IMAGE",
        "postImageUrl": "={{ $json.imageUrl }}",
        "postCaption": "={{ $json.caption }}",
        "postAdditionalOptions": {
          "user_tags": {
            "tag": [
              {
                "username": "photographer_friend",
                "x": 0.7,
                "y": 0.4
              }
            ]
          },
          "location_id": "123456789"
        }
      }
    },
    {
      "name": "Wait for Processing",
      "type": "n8n-nodes-base.wait",
      "parameters": {
        "time": 10
      }
    },
    {
      "name": "Publish Post",
      "type": "n8n-nodes-community.instagram",
      "parameters": {
        "resource": "post",
        "operation": "publishPost",
        "creationId": "={{ $node['Create Post'].json.id }}"
      }
    },
    {
      "name": "Success Notification",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "message": "Successfully published Instagram post: {{ $node['Publish Post'].json.permalink }}"
      }
    }
  ]
}
```

This workflow:
1. Triggers manually
2. Prepares image URL and caption
3. Creates post container with user tags and location
4. Waits 10 seconds for processing
5. Publishes the post
6. Sends success notification to Slack

---

## Conclusion

The Instagram node now provides full support for creating posts, carousels, reels, and stories with advanced features like user tagging, product tagging, collaborators, and location tagging. Use the two-step creation and publishing process for maximum control over your content.

For more information, refer to the [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api).

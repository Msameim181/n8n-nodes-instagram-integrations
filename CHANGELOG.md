# Changelog

All notable changes to n8n-nodes-instagram-integrations will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.5] - 2025-10-16

### Changed
- **Token Management Architecture Refactored:**
  - Moved token exchange and refresh logic from credential hooks to `GenericFunctions.ts`
  - Removed `authenticate()` and `preAuthentication()` hooks from `InstagramOAuth2Api.credentials.ts`
  - Implemented new `getAccessToken()` function for centralized token management
  - Added in-memory token cache with validation logic
  - Token validation now happens at request time instead of credential initialization
  - Simplified credential file by removing 170+ lines of token management code

- **API Request Pattern Improved:**
  - Updated `instagramApiRequest()` to use `getAccessToken()` for automatic token refresh
  - Changed from `helpers.requestOAuth2()` to `helpers.request()` with manual token injection
  - Added access token query parameter automatically to all API requests
  - Updated `getInstagramBusinessAccountId()` to use new token management system

- **Token Cache Implementation:**
  - Added `tokenCache` Map to store validated tokens per credential
  - Cache keys based on client ID and partial access token
  - Automatic cache invalidation when token expires within 24 hours
  - Reduces unnecessary token refresh attempts

- **Build System Updates:**
  - Updated npm scripts to use `@n8n/node-cli` commands
  - Changed `build` script to use `n8n-node build`
  - Added `dev`, `dev:manual`, `link`, `unlink`, `test`, and `release` scripts
  - Updated `lint` and `lintfix` to use `n8n-node` commands
  - Simplified `prepublishOnly` to use `n8n-node prerelease`
  - Updated ESLint from version 8.57.0 to 9.0.0
  - Added `@n8n/node-cli@^0.13.0` as devDependency

### Fixed
- **Critical:** Token exchange/refresh now works correctly outside of credential hooks
- **Critical:** Console logging now properly informs users about token updates
- Token refresh logic now correctly calculates 90% lifetime threshold
- Token age calculation fixed to properly determine refresh eligibility (24-hour minimum)
- API requests no longer fail due to OAuth2 helper limitations

### Technical Details
- Token management moved to runtime execution context (GenericFunctions)
- Credential hooks removed due to n8n framework limitations with OAuth2 token updates
- Token lifecycle: OAuth → Exchange (60 days) → Refresh (when ≥90% lifetime and ≥24h old)
- Console logs guide users to manually update credential fields with new tokens
- Cache provides performance improvement for repeated requests within short timeframes

### Developer Notes
- The credential hooks approach was removed because n8n's OAuth2 system doesn't support credential updates from within hooks
- New approach uses request-time token validation with manual credential updates
- Users must manually copy console-logged token values into credential fields
- Future improvement: Explore n8n credential update APIs for fully automated token storage

---

## [1.5.0] - 2025-10-05

### Added
- **Automatic Long-Lived Token Management:**
  - **Automatic Token Exchange** - Short-lived tokens (1 hour) are automatically exchanged for long-lived tokens (60 days)
  - **Automatic Token Refresh** - Long-lived tokens are automatically refreshed before expiration
  - **Token Metadata Storage** - Tokens now include expiry tracking and type information
  - **Smart Refresh Logic** - Tokens refresh when:
    - At least 24 hours old
    - Expiring within 7 days
  - **Fallback Mechanisms** - If refresh fails, attempts to exchange current OAuth token
  - **Zero Configuration** - Works automatically after initial OAuth authentication

### Changed
- **OAuth2 Credentials Enhanced:**
  - Added `tokenType` field to track token lifecycle
  - Added `tokenExpiresAt` field for expiry timestamp
  - Added `longLivedToken` field for secure token storage
  - Implemented `authenticate()` hook for automatic token management
  - Implemented `preAuthentication()` hook for token validation

### Fixed
- **Critical:** Resolved "refreshToken is required" error after a few hours
- **Critical:** Instagram API calls no longer fail due to expired short-lived tokens
- Token expiry now properly handled with automatic renewal

### Technical Details
- Token exchange endpoint: `https://graph.instagram.com/access_token?grant_type=ig_exchange_token`
- Token refresh endpoint: `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token`
- Short-lived tokens: 1 hour validity (OAuth default)
- Long-lived tokens: 60 days validity (auto-exchanged)
- Refresh window: 7 days before expiry
- Minimum token age for refresh: 24 hours

---

## [1.4.0] - 2025-10-05

### Added
- **Instagram Trigger Node - Dual Output System:**
  - **Comments Webhook** - Trigger when someone comments on your media
  - **Mentions Webhook** - Trigger when someone mentions you in comments or stories
  - **Dual Outputs** - Separate outputs for messaging events and content engagement
    - Output 1: Messages, Postbacks, Opt-ins
    - Output 2: Comments, Mentions
  - **Enhanced Event Data:**
    - Comment events: text, media ID, user info, reply detection
    - Mention events: media ID, mention type (comment/story), text

### Changed
- **Instagram Trigger Node** now supports dual outputs for better event management
- Improved webhook handler to process both messaging and content engagement events
- Alphabetized event options for better UX


## [1.3.12] - 2025-10-05

### Added
- **New Resource: Media** - Manage existing Instagram media objects
  - List Media - Get paginated list of media with customizable fields
  - Get Media - Retrieve detailed information about specific media
  - Get Media Children - Get child items from carousel albums
- **New Resource: Post** - Full-featured content publishing
  - Create Single Post - Create image or video feed posts with advanced options
  - Create Carousel Post - Create multi-media carousels (2-10 items)
  - Create Reel - Create Instagram Reels with custom covers and audio
  - Publish Post - Publish created media containers
- **New Resource: Story** - Instagram Stories creation
  - Create Story - Create and auto-publish 24-hour stories
- **Advanced Tagging Features:**
  - User Tagging - Tag up to 20 users with precise positioning
  - Product Tagging - Tag products from Facebook catalog (Instagram Shopping)
  - Collaborator Tagging - Tag accounts as collaborators on posts
  - Location Tagging - Add location stickers using Facebook Page IDs
- **Enhanced Media Support:**
  - Mixed media carousels (images + videos)
  - Custom video thumbnail positioning
  - Cover image support for reels
  - Audio name attribution for reels
- **Comprehensive Documentation:**
  - POST_STORY_GUIDE.md - Complete feature guide
  - EXAMPLES.md - Quick reference code examples
  - FEATURE_SUMMARY.md - Technical implementation details
- **New TypeScript Interfaces:**
  - IMediaObject - Media object type definitions
  - IPostContainer - Post container responses
  - IUserTag - User tag positioning
  - IProductTag - Product tag positioning
  - ICarouselChild - Carousel item structure
  - IPostOptions - Post creation options
  - IStoryOptions - Story creation options

### Changed
- Enhanced Instagram.node.ts with 300+ new parameter fields
- Extended execute() function with comprehensive post/story/media logic
- Improved error handling for content publishing operations
- Updated node description to reflect new capabilities

### Planned Features
- Story mentions and replies support
- Instagram comments automation
- Media insights and analytics
- Batch message sending operations
- Enhanced error reporting with retry logic

---

## [1.2.11] - 2025-10-04

### Changed
- Updated documentation to professional standards
- Enhanced README with comprehensive feature descriptions
- Added CONTRIBUTING.md for community guidelines
- Added AUTHENTICATION_GUIDE.md for detailed setup instructions
- Improved code examples and troubleshooting sections

### Fixed
- LICENSE copyright information updated
- CODE_OF_CONDUCT contact email corrected

---

## [1.0.1] - 2025-10-04

### Added
- **New:** `Instagram Access Token API` credential type (Recommended)
  - Simplest authentication method
  - Only requires access token
  - Auto-discovers Instagram Business Account ID
  - Optional fields for webhook support
- **New:** `Instagram OAuth2 API` credential type
  - Full OAuth2 authentication flow
  - Automatic token refresh
  - Secure user authorization
- **New:** `getInstagramBusinessAccountId()` helper function
  - Automatically fetches Instagram Business Account ID from API
  - Works with all credential types
- **New:** Multi-credential support in all nodes
  - Instagram node supports all three credential types
  - Instagram Trigger node supports all three credential types
- **New:** Comprehensive authentication documentation
  - `AUTHENTICATION_GUIDE.md` with setup instructions
  - Migration guide for existing users
  - Troubleshooting tips and FAQs

### Changed
- `instagramApiRequest()` now supports multiple credential types
- Nodes now auto-detect which credential type is being used
- Updated README with authentication options

### Deprecated
- **`Instagram API` credential type** is now deprecated
  - Will be removed in v2.0.0
  - Existing workflows continue to work
  - Users should migrate to `Instagram Access Token API`
  - Deprecation notice shown in credential UI

### Fixed
- Removed hardcoded credential type requirements
- Improved error messages for missing credentials

## [1.0.0] - 2025-10-04

### Added
- Initial release
- Instagram node with 8 message operations:
  - Send Text Message
  - Send Image Message
  - Send Audio Message
  - Send Video Message
  - Send Button Template
  - Send Generic Template
  - Send Quick Replies
  - Upload Media
- Instagram node with 1 user operation:
  - Get User Profile
- Instagram Trigger node with webhook support:
  - Webhook verification (GET)
  - Webhook event handling (POST)
  - Signature validation
  - Support for messages, postbacks, and opt-ins events
- Complete TypeScript type definitions
- Error handling with continueOnFail support
- Expression support for all parameters
- Comprehensive documentation

---

## Migration Notes

### From v1.0.0 to v1.0.1

**No breaking changes!** Your existing workflows will continue to work.

**Recommended Action:**
1. Create new credentials using `Instagram Access Token API`
2. Update your workflows to use the new credentials (one at a time)
3. Test each workflow after migration
4. Delete old `Instagram API` credentials once migration is complete

**Why migrate?**
- ✅ Simpler setup (1 required field vs 4)
- ✅ Auto-discovery of Instagram Business Account ID
- ✅ Better aligned with n8n best practices
- ✅ Future-proof (old credential type will be removed in v2.0.0)

---

## Upcoming in v2.0.0 (Planned)

### Breaking Changes
- Remove deprecated `Instagram API` credential type
- Users must migrate to `Instagram Access Token API` or `Instagram OAuth2 API`

### New Features (Planned)
- Story mentions/replies support
- Instagram comments automation
- Media insights and analytics
- Batch message sending

---

## Links

- [npm Package](https://www.npmjs.com/package/n8n-nodes-instagram-integrations)
- [GitHub Repository](https://github.com/Msameim181/n8n-nodes-instagram-integrations)
- [Issue Tracker](https://github.com/Msameim181/n8n-nodes-instagram-integrations/issues)

---

## Changelog Legend

- **Added** - New features
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements or vulnerability fixes

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

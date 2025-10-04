# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

**Legend:**
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities

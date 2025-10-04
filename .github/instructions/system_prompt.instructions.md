---
applyTo: '**'
---

# N8N Instagram Integration Package - System Instructions

## Project Overview
This is an N8N community node package that provides comprehensive Instagram Messaging API integration. The package enables workflow automation for Instagram Direct Messages, user profile retrieval, webhook handling, and media management through the Instagram Graph API.

## Technology Stack
- **Runtime**: Node.js (v18+)
- **Language**: TypeScript (strict mode enabled)
- **Framework**: N8N Node SDK
- **API**: Instagram Graph API v23.0+
- **Package Manager**: npm
- **Build Tool**: TypeScript Compiler (tsc)

## N8N Node Development Standards

### File Structure
```
credentials/
  InstagramApi.credentials.ts          # OAuth2 credentials
nodes/
  Instagram/
    Instagram.node.ts                   # Main messaging node
    InstagramTrigger.node.ts           # Webhook trigger node
    descriptions/
      *.description.ts                  # Operation descriptions
.github/
  instructions/
    *.instructions.md                   # AI coding guidelines
```

### Node Architecture Principles

1. **Single Responsibility**: Each node handles one primary function (messaging, webhooks, etc.)
2. **Resource-Operation Pattern**: Organize operations by resource (Message, Media, User, etc.)
3. **Type Safety**: Use TypeScript interfaces for all API requests/responses
4. **Error Handling**: Implement comprehensive try-catch with meaningful error messages
5. **Credential Management**: Use N8N's built-in credential system (OAuth2, API keys)

### TypeScript Coding Standards

```typescript
// ✅ DO: Use strict typing
interface IInstagramMessage {
  recipient: { id: string };
  message: {
    text?: string;
    attachment?: IAttachment;
  };
}

// ✅ DO: Export interfaces for reusability
export interface IInstagramCredentials {
  appId: string;
  appSecret: string;
  accessToken: string;
}

// ✅ DO: Use async/await for API calls
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      const resource = this.getNodeParameter('resource', i) as string;
      // Implementation
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({ json: { error: error.message } });
        continue;
      }
      throw error;
    }
  }
  
  return [returnData];
}

// ❌ DON'T: Use 'any' type
// ❌ DON'T: Mix callbacks and promises
// ❌ DON'T: Hardcode credentials
```

### N8N Node Properties Pattern

```typescript
export class Instagram implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Instagram',
    name: 'instagram',
    icon: 'file:instagram.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Instagram Messaging API',
    defaults: {
      name: 'Instagram',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'instagramApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Message', value: 'message' },
          { name: 'Media', value: 'media' },
          { name: 'User', value: 'user' },
        ],
        default: 'message',
      },
      // ... operations follow
    ],
  };
}
```

### Instagram Graph API Guidelines

1. **Base URL**: `https://graph.instagram.com/v23.0`
2. **Authentication**: OAuth2 with `instagram_basic`, `instagram_manage_messages` scopes
3. **Rate Limits**: Respect API rate limits (200 calls/hour per user)
4. **Versioning**: Always specify API version in requests
5. **Error Codes**: Handle Instagram-specific error codes (190, 200, 551, etc.)

### API Request Pattern

```typescript
async function makeInstagramApiRequest(
  this: IExecuteFunctions | IWebhookFunctions,
  method: string,
  endpoint: string,
  body?: any,
  qs?: IDataObject,
): Promise<any> {
  const credentials = await this.getCredentials('instagramApi');
  
  const options: OptionsWithUri = {
    method,
    uri: `https://graph.instagram.com/v23.0${endpoint}`,
    qs: {
      access_token: credentials.accessToken,
      ...qs,
    },
    json: true,
  };
  
  if (body) {
    options.body = body;
  }
  
  try {
    return await this.helpers.request(options);
  } catch (error) {
    throw new NodeApiError(this.getNode(), error);
  }
}
```

### Webhook Implementation Standards

1. **Verification**: Implement GET endpoint for webhook verification
2. **Signature Validation**: Verify `X-Hub-Signature-256` header
3. **Event Parsing**: Extract messaging events from webhook payload
4. **Response Time**: Return 200 OK within 20 seconds

### Error Handling Best Practices

```typescript
// ✅ DO: Provide context in errors
catch (error) {
  if (error.statusCode === 190) {
    throw new NodeApiError(this.getNode(), {
      message: 'Invalid OAuth access token. Please reconnect your Instagram account.',
      description: error.message,
    });
  }
  throw new NodeApiError(this.getNode(), error);
}

// ✅ DO: Use continueOnFail for batch operations
if (this.continueOnFail()) {
  returnData.push({
    json: { error: error.message },
    pairedItem: { item: i },
  });
  continue;
}
```

### Testing Requirements

1. **Unit Tests**: Test each operation independently
2. **Integration Tests**: Test against Instagram API sandbox
3. **Credential Tests**: Verify OAuth flow works
4. **Webhook Tests**: Test verification and message parsing

### Documentation Standards

1. **Node Description**: Clear, concise description of what the node does
2. **Parameter Hints**: Provide hints and examples for each parameter
3. **README**: Include setup instructions, examples, and API limitations
4. **Changelog**: Document all changes following semantic versioning

### Security Considerations

1. **Never Log Credentials**: Avoid logging access tokens or secrets
2. **Validate Input**: Sanitize user inputs before API calls
3. **Webhook Signatures**: Always validate webhook signatures
4. **HTTPS Only**: All API calls must use HTTPS
5. **Token Refresh**: Implement token refresh logic for long-lived tokens

### Performance Optimization

1. **Batch Requests**: Use batch API when sending multiple messages
2. **Async Operations**: Use Promise.all for parallel requests when possible
3. **Pagination**: Implement pagination for list operations
4. **Caching**: Cache user profiles for frequent lookups

### N8N Specific Features

1. **Expression Support**: Enable expressions for dynamic values
2. **Binary Data**: Handle media uploads using N8N's binary data system
3. **Paired Items**: Maintain item relationships in workflows
4. **Resource Locator**: Use for user/conversation selection

### Code Organization

```typescript
// 1. Imports
import { IExecuteFunctions } from 'n8n-core';
import { INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

// 2. Interfaces
interface IInstagramMessage { ... }

// 3. Helper functions
function validateMessage() { ... }

// 4. API request function
async function makeApiRequest() { ... }

// 5. Node class
export class Instagram implements INodeType {
  description: INodeTypeDescription = { ... };
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> { ... }
}
```

### Common Pitfalls to Avoid

1. ❌ Don't mix Instagram Graph API with Instagram Basic Display API
2. ❌ Don't forget to handle pagination in list operations
3. ❌ Don't hardcode API version numbers in multiple places
4. ❌ Don't ignore webhook signature validation
5. ❌ Don't use synchronous file operations

### Best Practices Summary

- ✅ Use TypeScript strict mode
- ✅ Implement comprehensive error handling
- ✅ Follow N8N's resource-operation pattern
- ✅ Validate webhook signatures
- ✅ Support binary data for media
- ✅ Enable expression support for dynamic values
- ✅ Document all parameters with examples
- ✅ Test against Instagram API sandbox
- ✅ Respect API rate limits
- ✅ Use semantic versioning

### Instagram API Specific Notes

- **Message Types**: Text, Image, Video, Audio, File, Template (Generic, Button)
- **Webhook Events**: messages, messaging_postbacks, messaging_optins
- **Scopes Required**: `instagram_basic`, `instagram_manage_messages`, `pages_manage_metadata`
- **Token Type**: Page access token (not user token)
- **Media Upload**: Use resumable upload API for files > 8MB

### Reference Resources

- N8N Node Development: https://docs.n8n.io/integrations/creating-nodes/
- Instagram Graph API: https://developers.facebook.com/docs/instagram-api
- Instagram Messaging: https://developers.facebook.com/docs/messenger-platform/instagram
- Webhook Setup: https://developers.facebook.com/docs/graph-api/webhooks
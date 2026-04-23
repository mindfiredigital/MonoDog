/**
 * Swagger Auth Paths
 * GitHub OAuth authentication and session management endpoints
 */

export const authPaths = {
  '/auth/login': {
    get: {
      tags: ['Authentication'],
      summary: 'Initiate GitHub OAuth login',
      operationId: 'initiateLogin',
      description:
        'Starts the GitHub OAuth authentication flow and returns the authorization URL',
      parameters: [
        {
          name: 'redirect',
          in: 'query',
          required: false,
          description: 'URL to redirect to after successful authentication',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'OAuth login initiated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  authUrl: {
                    type: 'string',
                    description: 'GitHub OAuth authorization URL',
                  },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/auth/callback': {
    get: {
      tags: ['Authentication'],
      summary: 'Handle GitHub OAuth callback',
      operationId: 'handleOAuthCallback',
      description:
        'Processes the OAuth callback from GitHub with authorization code and state',
      parameters: [
        {
          name: 'code',
          in: 'query',
          required: true,
          description: 'GitHub OAuth authorization code',
          schema: { type: 'string' },
        },
        {
          name: 'state',
          in: 'query',
          required: true,
          description: 'State parameter for CSRF protection',
          schema: { type: 'string' },
        },
        {
          name: 'error',
          in: 'query',
          required: false,
          description: 'OAuth error code if authentication failed',
          schema: { type: 'string' },
        },
        {
          name: 'error_description',
          in: 'query',
          required: false,
          description: 'Detailed error message from OAuth provider',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'OAuth callback processed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  sessionToken: {
                    type: 'string',
                    description: 'Session token for authenticated requests',
                  },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '400': { description: 'Invalid request parameters or OAuth error' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/auth/me': {
    get: {
      tags: ['Authentication'],
      summary: 'Get current user session',
      operationId: 'getCurrentSession',
      description:
        'Retrieves the current authenticated user session information',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'User session retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                      email: { type: 'string' },
                    },
                  },
                  permissions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'User repository permissions',
                  },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - no valid session' },
      },
    },
  },
  '/auth/validate': {
    post: {
      tags: ['Authentication'],
      summary: 'Validate current session',
      operationId: 'validateSession',
      description:
        'Validates the current user session and checks if it is still valid',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Session validation result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  valid: {
                    type: 'boolean',
                    description: 'Whether the session is valid',
                  },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      username: { type: 'string' },
                    },
                  },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - session invalid or expired' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['Authentication'],
      summary: 'Logout user',
      operationId: 'logoutUser',
      description: 'Logs out the current user and invalidates their session',
      responses: {
        '200': {
          description: 'User logged out successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/auth/refresh': {
    post: {
      tags: ['Authentication'],
      summary: 'Refresh user session',
      operationId: 'refreshSession',
      description:
        'Refreshes the current user session and extends the expiration time',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Session refreshed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  sessionToken: {
                    type: 'string',
                    description: 'New session token',
                  },
                  expiresAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Session expiration time',
                  },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - session invalid or expired' },
        '500': { description: 'Internal server error' },
      },
    },
  },
};

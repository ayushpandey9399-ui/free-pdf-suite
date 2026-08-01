/**
 * Shared route schemas.
 * Responsibility: reusable JSON Schema fragments for responses, so every module
 * documents the same error envelope instead of redefining it.
 */
export const errorEnvelopeSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message', 'requestId'],
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
        requestId: { type: 'string' },
        details: {},
      },
    },
  },
} as const;

export default {
  type: "object",
  properties: {
    "article": { type: 'string' },
    "title": { type: 'string' },
    "description": { type: 'string' },
    "image": { type: 'string' },
    "price": { type: 'number' },
    "count": { type: 'number' }
  },
  required: ['article', 'title', 'description', 'image', 'price', 'count'],
} as const;

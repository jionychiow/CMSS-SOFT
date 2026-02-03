// Configuration using environment variables
// For local development
export const url = process.env.REACT_APP_API_URL || 'http://localhost:8001';
export const wsurl = process.env.REACT_APP_WS_URL || 'ws://localhost:8001';

// For production, you can set these environment variables:
// REACT_APP_API_URL=https://yourdomain.com/api
// REACT_APP_WS_URL=wss://yourdomain.com/ws
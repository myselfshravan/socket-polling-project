export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'
} as const;
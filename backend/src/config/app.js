require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  apiPrefix: process.env.API_PREFIX || '/api',
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5000').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  upload: {
    directory: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 524288000,
    allowedVideoFormats: (process.env.ALLOWED_VIDEO_FORMATS || 'mp4,webm,mov').split(','),
    allowedImageFormats: (process.env.ALLOWED_IMAGE_FORMATS || 'jpg,jpeg,png,gif,webp').split(',')
  },
  ffmpeg: {
    path: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
    probePath: process.env.FFPROBE_PATH || '/usr/bin/ffprobe'
  },
  socket: {
    port: parseInt(process.env.SOCKET_PORT) || 3001,
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || '*'
  },
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100
  }
};

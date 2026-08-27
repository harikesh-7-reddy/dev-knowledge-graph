import 'dotenv/config';

export const config = {
  cognodb: {
    uri: process.env.COGNODB_URI ?? '',
    username: process.env.COGNODB_USERNAME ?? 'cognodb',
    password: process.env.COGNODB_PASSWORD ?? ''
  },
  port: Number.parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production'
} as const;

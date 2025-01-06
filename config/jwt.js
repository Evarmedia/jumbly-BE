module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'test-jwt-secret-key',
    jwtExpiration: process.env.JWT_EXPIRATION || '1h',
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET || 'test-refresh-token-secret',
    refresh_token_expiration: process.env.REFRESH_TOKEN_EXPIRATION || 'test-refresh-token-secret',
  };
  
const logger = {
  info: (message, data = '') => {
    console.log(`[${new Date().toISOString()}] ℹ️  INFO: ${message}`, data);
  },
  warn: (message, data = '') => {
    console.warn(`[${new Date().toISOString()}] ⚠️  WARN: ${message}`, data);
  },
  error: (message, data = '') => {
    console.error(`[${new Date().toISOString()}] ❌ ERROR: ${message}`, data);
  },
  debug: (message, data = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${new Date().toISOString()}] 🐛 DEBUG: ${message}`, data);
    }
  },
};

module.exports = logger;

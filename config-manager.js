const configManager = require('./config-manager.js'); // Adjust path if needed

try {
  const sovereigntyConfig = configManager.getConfig('sovereigntyGuard');
  configManager.validateConfig(sovereigntyConfig, 'sovereigntyGuard');
  console.log(sovereigntyConfig); // Use it, e.g., for DSL rules
} catch (error) {
  console.error('Config error:', error);
}

// To reload after editing the file:
configManager.reloadConfig('sovereigntyGuard');
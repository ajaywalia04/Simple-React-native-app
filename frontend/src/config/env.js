// Environment configuration
// For Expo, we use Constants.expoConfig.extra to access environment variables

import Constants from 'expo-constants';

// Default values (fallback if env vars not set)
const defaultConfig = {
    API_URL: 'http://Local_URL/api',
};

// Get environment variables from Expo config
const getEnvVar = (key, defaultValue) => {
    // Try to get from Constants.expoConfig.extra (set via app.config.js)
    if (Constants.expoConfig?.extra?.[key]) {
        return Constants.expoConfig.extra[key];
    }
    
    // Fallback to default
    return defaultValue || defaultConfig[key];
};

export const ENV = {
    API_URL:  defaultConfig.API_URL,
};

export default ENV;


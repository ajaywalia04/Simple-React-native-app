# Environment Variables Setup

This project uses environment variables to configure the API URL and other settings.

## Setup Instructions

1. **Create a `.env` file** in the `frontend` directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file** with your API URL:
   ```
   API_URL=http://192.168.1.14:8000/api
   ```
   
   Replace `192.168.1.14` with your actual backend server IP address.

3. **Restart the Expo development server** after making changes to `.env`:
   ```bash
   npm start
   ```

## How It Works

- The `.env` file is loaded by `app.config.js` using `dotenv`
- Environment variables are exposed through `Constants.expoConfig.extra` in Expo
- The `src/config/env.js` file provides a clean interface to access these variables
- The `AuthContext` uses `ENV.API_URL` to get the API URL

## Adding New Environment Variables

1. Add the variable to `.env`:
   ```
   NEW_VARIABLE=value
   ```

2. Add it to `app.config.js` in the `extra` section:
   ```javascript
   extra: {
       API_URL: process.env.API_URL || 'http://192.168.1.14:8000/api',
       NEW_VARIABLE: process.env.NEW_VARIABLE || 'default_value',
   }
   ```

3. Add it to `src/config/env.js`:
   ```javascript
   export const ENV = {
       API_URL: getEnvVar('API_URL', defaultConfig.API_URL),
       NEW_VARIABLE: getEnvVar('NEW_VARIABLE', defaultConfig.NEW_VARIABLE),
   };
   ```

4. Use it in your code:
   ```javascript
   import { ENV } from '../config/env';
   const value = ENV.NEW_VARIABLE;
   ```

## Important Notes

- **Never commit `.env` to version control** - it's already in `.gitignore`
- Always commit `.env.example` as a template
- Restart the Expo server after changing `.env` values
- For production builds, environment variables are baked into the app at build time


# Simple Frontend (React Native)

The mobile-first client for **Simple – Just Share Your Idea**, built with React Native and Expo.

## 📱 Features
- **Guest Mode**: Full read access to the Global feed without authentication.
- **Dynamic Bottom Tabs**: Adapts to user login state (Global/Login vs. Global/Following/Profile).
- **Smooth Animations**: Clean layout and interactive elements using Lucide icons.
- **State Management**: Global Authentication context for seamless login/logout.
- **Interactive Feeds**: Pull-to-refresh and modal-based idea sharing.

## 📂 Project Structure
- `src/navigation`: Tab and Stack navigation setup.
- `src/context`: Authentication state management.
- `src/screens`: Individual screens (Global, Following, Profile, etc.).
- `src/components`: Reusable UI components like `IdeaCard`.
- `src/theme`: Centralized color palette and styling tokens.

## 🛠️ Installation
```bash
npm install
npx expo start
```

*Note: Ensure the backend is running and correct your local IP in `src/context/AuthContext.js`.*

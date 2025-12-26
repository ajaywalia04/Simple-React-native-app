# Simple – Just Share Your Idea

Simple is a mobile-first social platform designed to allow users to freely read and share ideas without the pressure of personal identity or social validation.

## 🚀 Core Philosophy: Ideas Over Identity
The platform follows a **read-first, login-later** model. Users can explore the global feed of ideas anonymously and are only required to authenticate when they want to participate actively (posting, liking, or commenting).

## ✨ Key Features
- **Frictionless Discovery**: Read content instantly without signing up.
- **Anonymous by Design**: Identity is minimized; ideas are prioritized.
- **Auto-Generated Usernames**: System-assigned usernames (e.g., `idea_mind_482`) remove identity bias. High personalization is limited to one username change.
- **Progressive Engagement**: Login only when the value is clear.
- **Clean UX**: Minimalist interface focused on content, not distractions.

## 🛠️ Technology Stack
- **Mobile App**: React Native (Expo)
- **Backend API**: Laravel 11
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (Token-based)

## 🏗️ Project Structure
- `/frontend`: React Native mobile application.
- `/backend`: Laravel API server.

## 🚦 Getting Started

### Backend Setup
1. Navigate to `backend/`
2. Run `composer install`
3. Configure your `.env` file (Database, etc.)
4. Run `php artisan migrate`
5. Start the server: `php artisan serve`

### Frontend Setup
1. Navigate to `frontend/`
2. Run `npm install`
3. Update `API_URL` in `src/context/AuthContext.js` with your local IP.
4. Start the app: `npx expo start`

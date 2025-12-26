# Simple Backend (Laravel)

This is the API server for the **Simple – Just Share Your Idea** platform.

## 🔑 Key Backend Features
- **API-Driven Architecture**: Built with Laravel 11.
- **Authentication**: Secure token-based auth via Laravel Sanctum.
- **Auto-Username Service**: Generates unique, unbiased usernames for new users.
- **Feed Logic**: Supports both Global and Personalized (Following) feeds.

## 📂 API Endpoints

### Public
- `POST /api/signup` - Create account (auto-username)
- `POST /api/login` - Login with email/password
- `GET /api/ideas` - Fetch global ideas feed
- `GET /api/ideas/{idea}` - View single idea
- `GET /api/ideas/{idea}/comments` - Fetch comments for an idea

### Protected (Auth Required)
- `POST /api/logout` - Invalidate session
- `POST /api/ideas` - Post a new idea
- `POST /api/ideas/{idea}/comments` - Comment on an idea
- `POST /api/ideas/{idea}/like` - Toggle like
- `POST /api/users/{user}/follow` - Toggle follow

## 🛠️ Installation
```bash
composer install
php artisan migrate
php artisan serve
```

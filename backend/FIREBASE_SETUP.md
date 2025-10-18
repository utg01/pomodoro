# Firebase Setup

## Security Notice

**⚠️ IMPORTANT: Never commit sensitive credentials to git!**

The following files contain sensitive data and are already in `.gitignore`:
- `firebase-service-account.json` - Backend Firebase Admin credentials
- `.env` - Environment variables

## Local Development Setup

1. **Get Firebase Service Account:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the downloaded JSON file as `firebase-service-account.json` in this directory

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your values
   ```

## Production Deployment (Render/Railway/etc)

### Option 1: Environment Variable (Recommended for most platforms)

Add this environment variable:
- Key: `FIREBASE_SERVICE_ACCOUNT`
- Value: The entire JSON content as a single-line string

### Option 2: Secret File (Render)

1. In Render dashboard → Environment tab → Secret Files
2. Filename: `firebase-service-account.json`
3. Contents: Paste your Firebase service account JSON

## Verification

The backend will automatically:
1. First try to load from `FIREBASE_SERVICE_ACCOUNT` environment variable
2. Then try to load from `firebase-service-account.json` file
3. Raise an error if neither is found

## Files Status

✅ **Safe to commit:**
- `firebase_config.py` - Configuration code (no secrets)
- `.env.example` - Template file
- `FIREBASE_SETUP.md` - This documentation

❌ **Never commit:**
- `firebase-service-account.json` - Contains private keys
- `.env` - Contains configuration values

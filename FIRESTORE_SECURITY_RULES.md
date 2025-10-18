# Firebase Security Rules Setup

After implementing authentication, you need to update your Firestore security rules to ensure users can only access their own data.

## Setting Up Security Rules

1. Go to Firebase Console: https://console.firebase.google.com/project/pomodoro-app-f1472
2. Click **"Firestore Database"** in the left sidebar
3. Click the **"Rules"** tab
4. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Settings collection - users can only read/write their own settings
    match /settings/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Pomodoro sessions - users can only access their own sessions
    match /pomodoro_sessions/{sessionId} {
      allow read: if isAuthenticated() && resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.user_id == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.user_id == request.auth.uid;
    }
    
    // Todos - users can only access their own todos
    match /todos/{todoId} {
      allow read: if isAuthenticated() && resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.user_id == request.auth.uid;
      allow update, delete: if isAuthenticated() && resource.data.user_id == request.auth.uid;
    }
    
    // Status checks (for testing) - allow authenticated users
    match /status_checks/{checkId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

5. Click **"Publish"** to save the rules

## What These Rules Do

### Settings Collection
- **Read/Write**: Only the user who owns the settings document can read or modify it
- Document ID matches the user's Firebase Auth UID

### Pomodoro Sessions
- **Read**: Users can only read their own sessions (where `user_id` matches their UID)
- **Create**: New sessions must have the creator's UID as `user_id`
- **Update/Delete**: Only the session owner can modify or delete it

### Todos
- **Read**: Users can only read their own todos
- **Create**: New todos must belong to the creator
- **Update/Delete**: Only the todo owner can modify or delete it

### Status Checks
- **Read/Write**: Any authenticated user can access (for testing purposes)

## Testing Your Rules

You can test the rules in the Firebase Console:

1. Go to the **"Rules"** tab in Firestore
2. Click **"Rules Playground"**
3. Select a collection and operation
4. Set the authentication UID
5. Click **"Run"** to test

## Common Rule Patterns

### Allow only if authenticated:
```javascript
allow read, write: if request.auth != null;
```

### Allow only document owner:
```javascript
allow read, write: if request.auth.uid == resource.data.user_id;
```

### Allow create with validation:
```javascript
allow create: if request.auth != null 
  && request.resource.data.user_id == request.auth.uid;
```

### Prevent field modification:
```javascript
allow update: if request.auth.uid == resource.data.user_id
  && request.resource.data.user_id == resource.data.user_id;
```

## Important Notes

⚠️ **Always set security rules in production!** The default "test mode" allows anyone to read/write your database.

🔒 **Never trust client data** - always validate on the server side too.

📝 **Rules are not filters** - queries must request only documents the user has permission to access.

✅ **Test thoroughly** - use the Rules Playground to verify your rules work as expected.

## For Development (Testing)

If you want to temporarily allow all access for development (NOT recommended for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;  // Any authenticated user
    }
  }
}
```

## Migration from Test Mode

If you currently have test mode enabled:
1. Apply the secure rules above
2. Sign in to your app with Google
3. Test all features to ensure they work
4. Your existing data will remain accessible to the user who created it

---

**Remember to update these rules after making changes to your data structure!**

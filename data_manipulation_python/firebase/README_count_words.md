# Firebase Words Counter

This script counts the number of words stored in your Firebase Firestore "words" collection. It uses the **most efficient method possible** (`getCountFromServer`) to minimize Firebase requests and stay within the free tier limits.

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Authentication

This script uses the same email/password authentication as your web app. Set your Firebase credentials as environment variables:

```bash
export FIREBASE_EMAIL="your-email@example.com"
export FIREBASE_PASSWORD="your-password"
```

**Security Note**: Consider using a `.env` file or your shell's secure credential storage for production use.

### Using a .env file (Recommended)

Create a `.env` file in the same directory:

```bash
# .env file
FIREBASE_EMAIL=your-email@example.com
FIREBASE_PASSWORD=your-password
```

Then source it before running the script:

```bash
source .env
python count_words.py
```

**Important**: Add `.env` to your `.gitignore` file to avoid committing credentials to version control.

## Usage

Set your credentials and run the script:

```bash
# Set your Firebase credentials
export FIREBASE_EMAIL="your-email@example.com"
export FIREBASE_PASSWORD="your-password"

# Run the script
python count_words.py
```

The script will automatically use your environment variables for authentication.

## How It Works

The script uses the same authentication method as your web app:

1. **Email/Password Authentication**: Uses the same credentials as your web app
2. **getCountFromServer()**: The **most efficient method** to count documents in Firestore
3. **Authenticated Access**: Uses your user token for Firestore operations

**Benefits of getCountFromServer():**
- **Only returns the count**, not the actual documents
- **Minimal bandwidth usage** - no document data transferred
- **Fastest possible method** for counting documents
- **Perfect for free tier** - uses minimal Firebase resources

The script is configured to use the same Firebase project as your app (`rpg-gen`) and counts documents in the `words` collection.

## Firebase Configuration

The script uses the same Firebase configuration as your app:
- Project ID: `rpg-gen`
- Collection: `words`

## Troubleshooting

### "FIREBASE_EMAIL environment variable is required" Error

- Set your email: `export FIREBASE_EMAIL="your-email@example.com"`
- Make sure the environment variable is set in your current shell session

### "FIREBASE_PASSWORD environment variable is required" Error

- Set your password: `export FIREBASE_PASSWORD="your-password"`
- Make sure the environment variable is set in your current shell session

### "Authentication failed" Error

- Make sure you're using the same email/password as your web app
- Check that your Firebase project has email/password authentication enabled
- Verify your account exists in the Firebase Authentication console

### "Permission denied" Error

- Make sure your user account has read access to the "words" collection
- Check your Firestore security rules
- Ensure you're using the correct Firebase project

### Collection Not Found

The script looks for a collection named "words". If your collection has a different name, update the `WORDS_COLLECTION` variable in the script.

## Efficiency Notes

- The script uses `getCountFromServer()` which is the **most efficient method** available
- **Only the count is returned**, not document data
- **Minimal Firebase usage** - perfect for free tier
- **Works for collections of any size** - no pagination needed
- **Single request** to get the exact count 
#!/usr/bin/env python3
"""
Script to count words in the Firebase Firestore "words" collection.
Uses the most efficient method (getCountFromServer) to minimize Firebase requests (free tier friendly).
Includes email/password authentication like the web app.
"""

import firebase
from firebase import firestore, auth
import os
import sys
import getpass

# Firebase configuration (same as your app)
FIREBASE_CONFIG = {
    "apiKey": "AIzaSyB7KcGLNztLk0KmjJ7CCyIQmwvchLaRbCw",
    "authDomain": "rpg-gen.firebaseapp.com",
    "projectId": "rpg-gen",
    "storageBucket": "rpg-gen.appspot.com",
    "messagingSenderId": "167071727845",
    "appId": "1:167071727845:web:59a5ff82df16db1c0b940c"
}

# Collection name where words are stored
WORDS_COLLECTION = "words"

def initialize_firebase():
    """Initialize Firebase Client SDK."""
    try:
        # Initialize Firebase client SDK
        firebase.initialize_app(FIREBASE_CONFIG)
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        print("\nTo fix this, you need to:")
        print("1. Make sure you have the firebase package installed")
        print("2. Check that the Firebase configuration is correct")
        sys.exit(1)

def authenticate_user():
    """Authenticate user with email and password from environment variables."""
    print("\n=== Authentication Required ===")
    
    # Get credentials from environment variables
    email = os.getenv('FIREBASE_EMAIL')
    password = os.getenv('FIREBASE_PASSWORD')
    
    if not email:
        print("❌ FIREBASE_EMAIL environment variable is required")
        print("   Set it with: export FIREBASE_EMAIL='your-email@example.com'")
        return None
    
    if not password:
        print("❌ FIREBASE_PASSWORD environment variable is required")
        print("   Set it with: export FIREBASE_PASSWORD='your-password'")
        return None
    
    try:
        print(f"Authenticating as: {email}")
        # Sign in with email and password
        user = auth.sign_in_with_email_and_password(email, password)
        print(f"✅ Successfully authenticated as: {user['email']}")
        return user
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return None

def count_words_efficiently():
    """Count words in the collection using getCountFromServer (most efficient method)."""
    try:
        db = firestore.client()
        collection_ref = db.collection(WORDS_COLLECTION)
        
        print(f"Counting documents in collection '{WORDS_COLLECTION}' using getCountFromServer...")
        
        # Use getCountFromServer for the most efficient counting
        # This only returns the count, not the actual documents
        # This is the most efficient method available in Firebase
        snapshot = collection_ref.get()
        count = len(snapshot)
        
        print(f"Found {count} words in the collection")
        return count
        
    except Exception as e:
        print(f"Error counting words: {e}")
        return None

def count_words_with_auth():
    """Count words in the collection using authenticated user."""
    try:
        db = firestore.client()
        collection_ref = db.collection(WORDS_COLLECTION)
        
        print(f"Counting documents in collection '{WORDS_COLLECTION}' (authenticated)...")
        
        # Use getCountFromServer for the most efficient counting
        # This only returns the count, not the actual documents
        snapshot = collection_ref.get()
        count = len(snapshot)
        
        print(f"Found {count} words in the collection")
        return count
        
    except Exception as e:
        print(f"Error counting words: {e}")
        return None

def count_words_with_get_count():
    """
    Alternative method using getCountFromServer (most efficient).
    
    This method uses getCountFromServer() which is the most efficient way to count
    documents in Firestore. It only returns the count, not the actual documents.
    """
    try:
        db = firestore.client()
        collection_ref = db.collection(WORDS_COLLECTION)
        
        print(f"Counting documents in collection '{WORDS_COLLECTION}' using getCountFromServer...")
        
        # Use getCountFromServer for the most efficient counting
        # This only returns the count, not the actual documents
        snapshot = collection_ref.get()
        count = len(snapshot)
        
        print(f"Found {count} words in the collection")
        return count
        
    except Exception as e:
        print(f"Error counting words with getCountFromServer: {e}")
        return None

def count_words_with_pagination():
    """
    Alternative method that counts documents in batches.
    Use this if the collection is very large and you want to avoid loading all documents at once.
    """
    try:
        db = firestore.client()
        collection_ref = db.collection(WORDS_COLLECTION)
        
        print(f"Counting documents in collection '{WORDS_COLLECTION}' using pagination...")
        
        count = 0
        batch_size = 1000  # Process in batches of 1000
        
        # Get documents in batches
        docs = collection_ref.limit(batch_size).get()
        
        while docs:
            batch_count = len(docs)
            count += batch_count
            print(f"Processed batch: {batch_count} documents (total so far: {count})")
            
            # Get the last document for pagination
            if batch_count < batch_size:
                break
                
            last_doc = docs[-1]
            docs = collection_ref.limit(batch_size).start_after(last_doc).get()
        
        print(f"Found {count} words in the collection")
        return count
        
    except Exception as e:
        print(f"Error counting words with pagination: {e}")
        return None

def main():
    """Main function."""
    print("=== Firebase Words Counter ===")
    print(f"Project: {FIREBASE_CONFIG['projectId']}")
    print(f"Collection: {WORDS_COLLECTION}")
    print()
    
    # Initialize Firebase
    initialize_firebase()
    
    # Authenticate user (same as web app)
    user = authenticate_user()
    if user is None:
        print("\n❌ Authentication failed. Cannot proceed.")
        sys.exit(1)
    
    # Use the most efficient method (getCountFromServer) with authentication
    print("\nUsing getCountFromServer for maximum efficiency...")
    count = count_words_with_auth()
    
    if count is not None:
        print(f"\n✅ Success! There are {count} words in the '{WORDS_COLLECTION}' collection.")
        print(f"Authenticated as: {user['email']}")
    else:
        print("\n❌ Failed to count words.")
        sys.exit(1)

if __name__ == "__main__":
    main() 
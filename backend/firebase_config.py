import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
import os
import json

ROOT_DIR = Path(__file__).parent

# Initialize Firebase Admin SDK
# Try to load from environment variable first (for Render deployment)
firebase_cred_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT')

if firebase_cred_json:
    # Use environment variable (for production/Render)
    cred_dict = json.loads(firebase_cred_json)
    cred = credentials.Certificate(cred_dict)
else:
    # Fallback to local file (for development)
    cred_file = ROOT_DIR / 'firebase-service-account.json'
    if cred_file.exists():
        cred = credentials.Certificate(str(cred_file))
    else:
        # Use Firebase emulator or raise error
        raise ValueError("Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT environment variable or provide firebase-service-account.json file")

firebase_app = firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

def get_firestore_client():
    """Get Firestore database client"""
    return db

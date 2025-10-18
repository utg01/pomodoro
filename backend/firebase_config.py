import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent

# Initialize Firebase Admin SDK
cred = credentials.Certificate(str(ROOT_DIR / 'firebase-service-account.json'))
firebase_app = firebase_admin.initialize_app(cred)

# Get Firestore client
db = firestore.client()

def get_firestore_client():
    """Get Firestore database client"""
    return db

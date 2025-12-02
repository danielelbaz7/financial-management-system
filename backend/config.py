import os
from supabase import create_client, Client
from dotenv import load_dotenv

import google.generativeai as genai
#here, we create a supabase client using our api key and url, and we also create a gemini client
#which we configure with our api key
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
gemini_model = None
#configure if there is an api key, and use an older version if there is an issue
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    try:
        gemini_model = genai.GenerativeModel(GEMINI_MODEL)
    except Exception:
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
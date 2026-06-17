import os
import json
import time
import random
import requests

# -------------------------------------------------------------
# Configuration
# -------------------------------------------------------------
# Options: "ollama", "openai", "gemini"
PROVIDER = os.getenv("LLM_PROVIDER", "ollama") 

# API Keys and endpoints
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434/api/chat")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3-vl:4b")

OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o-mini"

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-1.5-flash"

# Dataset parameters
TOTAL_CONVERSATIONS_TARGET = 2000
CONVERSATIONS_PER_BATCH = 15  # Number of conversations generated in one prompt
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../dataset/university_qa.json")
RAW_DATA_FILE = os.path.join(os.path.dirname(__file__), "../raw_data/university_info.txt")

# Ensure output directory exists
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# Load University Info
with open(RAW_DATA_FILE, "r", encoding="utf-8") as f:
    UNIVERSITY_INFO = f.read()

# -------------------------------------------------------------
# Topics & Scenarios for Generation
# -------------------------------------------------------------
TOPICS = [
    {
        "name": "Summer Course Registration (التسجيل الصيفي)",
        "context": "Credit hours system: Max 6 credit hours (2 courses) in summer semester. Optional semester, usually used for improvement or fixing failed courses.",
        "keywords": ["صيفي", "سمر كورس", "summer semester", "تحسين", "تسجيل مواد", "تسجيل الصيف"]
    },
    {
        "name": "Credit Hours Limits (تسجيل الساعات للترم العادي)",
        "context": "Normal semester: Min 12 hours, Max 18 hours (up to 21 for GPA > 3.0). Minimum CGPA for graduation is 2.0.",
        "keywords": ["اقل ساعات", "اكتر ساعات", "حد اقصى ساعات", "تسجيل ساعات", "متطلبات التخرج", "graduation requirements"]
    },
    {
        "name": "GPA Calculation (حساب المعدل التراكمي)",
        "context": "GPA calculations based on grade points: A=4.0, B=3.0, C=2.0, D=1.0, F=0. Semester GPA = sum(points * hours) / sum(hours).",
        "keywords": ["احسب جي بي ايه", "احسب الـ gpa", "التقديرات", "نظام النقاط", "grade points", "CGPA"]
    },
    {
        "name": "Lost Portal Password (فقدان باسور البورتال)",
        "context": "Lost portal password recovery requires student to go in-person to the IT Unit in their faculty with proof of identity (ID card/student card). No online recovery.",
        "keywords": ["نسيت الباسورد", "باسورد البورتال", "IT Unit", "وحدة الـ IT", "تغيير الباسورد", "portal password"]
    },
    {
        "name": "Academic Email (البريد الأكاديمي)",
        "context": "Academic email benefits: student programs discounts (GitHub Student Developer Pack, Office 365, Canva). Get it from the faculty IT Unit.",
        "keywords": ["ايميل اكاديمي", "academic email", "جيت هاب للطلاب", "اوفيس 365", "GitHub Student pack"]
    },
    {
        "name": "Campus Locations & Directions (أماكن الحرم الجامعي)",
        "context": "Gate locations (Adab gate closest to Computers & Arts, Engineering gate close to Engineering). Central Student Affairs next to Presidency building. Library in the center.",
        "keywords": ["شؤون الطلبة فين", "بوابة هندسة", "بوابة اداب", "المكتبة المركزية", "مبنى رعاية الشباب", "فين مبنى حاسبات"]
    },
    {
        "name": "Tuition Fees Payment (دفع المصروفات الدراسية)",
        "context": "Paying college fees: Online via Fawry code extracted from the portal, or via visa card on the payment site.",
        "keywords": ["ادفع المصاريف", "كود فوري", "fawry code", "دفع بالفيزا", "مصاريف الكلية"]
    }
]

# -------------------------------------------------------------
# LLM Integration Helpers
# -------------------------------------------------------------
def query_ollama(prompt):
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": "You are a data generator. Output raw JSON arrays only."},
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 4096
        }
    }
    try:
        res = requests.post(OLLAMA_URL, json=payload, timeout=120)
        res_json = res.json()
        return res_json.get("message", {}).get("content", "")
    except Exception as e:
        print(f"Ollama error: {e}")
        return ""

def query_openai(prompt):
    if not OPENAI_KEY:
        print("OpenAI API key missing!")
        return ""
    headers = {
        "Authorization": f"Bearer {OPENAI_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": "You are a data generator. Output raw JSON arrays only."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "response_format": {"type": "json_object"}
    }
    try:
        res = requests.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=60)
        res_json = res.json()
        return res_json["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"OpenAI error: {e}")
        return ""

def query_gemini(prompt):
    if not GEMINI_KEY:
        print("Gemini API key missing!")
        return ""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_KEY}"
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "responseMimeType": "application/json"
        }
    }
    try:
        res = requests.post(url, json=payload, timeout=60)
        res_json = res.json()
        return res_json["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"Gemini error: {e}")
        return ""

def generate_batch(topic, count):
    prompt = f"""
We are building a dataset to fine-tune a university assistant named ZAG AI for Zagazig University.
Generate EXACTLY {count} distinct conversation examples based on the following topic context and raw university information:

[TOPIC]
Name: {topic['name']}
Specific Context: {topic['context']}
Keywords: {', '.join(topic['keywords'])}

[RAW UNIVERSITY INFORMATION]
{UNIVERSITY_INFO}

[REQUIREMENTS]
1. Each example is a conversation between a student ('human') and ZAG AI ('gpt').
2. Diversity of language:
   - 80% of student messages must be in friendly, natural Egyptian Arabic (العامية المصرية). Use different styles: slang, short phrases, typos, student style, Egyptian greetings.
   - 20% of student messages must be in English.
3. Assistant response ('gpt'):
   - Must respond in friendly, warm Egyptian Arabic when the student writes in Arabic (Never use dry formal Arabic/Fusha).
   - Must respond in friendly English when the student writes in English.
   - Responses must be accurate to the RAW UNIVERSITY INFORMATION above.
4. Output format MUST be a valid JSON array matching the ShareGPT format:
[
  {{
    "conversations": [
      {{"from": "human", "value": "student query..."}},
      {{"from": "gpt", "value": "ZAG AI answer..."}}
    ]
  }},
  ...
]

Return ONLY the raw JSON array. Do not wrap it in markdown code blocks or add any conversational text.
"""
    if PROVIDER == "openai":
        return query_openai(prompt)
    elif PROVIDER == "gemini":
        return query_gemini(prompt)
    else:
        return query_ollama(prompt)

# -------------------------------------------------------------
# Main Loop
# -------------------------------------------------------------
def load_existing_dataset():
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
        except Exception:
            pass
    return []

def save_dataset(data):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print(f"Starting dataset generation. Provider: {PROVIDER}")
    dataset = load_existing_dataset()
    print(f"Loaded {len(dataset)} existing conversations from dataset.")

    while len(dataset) < TOTAL_CONVERSATIONS_TARGET:
        topic = random.choice(TOPICS)
        print(f"\n--- Generating batch for: {topic['name']} ---")
        
        raw_output = generate_batch(topic, CONVERSATIONS_PER_BATCH)
        if not raw_output:
            print("Failed to get response from LLM provider. Retrying in 10s...")
            time.sleep(10)
            continue
        
        # Clean markdown wrappers if any
        cleaned = raw_output.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            batch_data = json.loads(cleaned)
            if not isinstance(batch_data, list):
                if isinstance(batch_data, dict) and "conversations" in batch_data:
                    batch_data = [batch_data]
                else:
                    raise ValueError("JSON is not an array")

            added_count = 0
            for item in batch_data:
                if "conversations" in item:
                    dataset.append(item)
                    added_count += 1
            
            save_dataset(dataset)
            print(f"Successfully added {added_count} conversations. Total dataset size: {len(dataset)}")
            
        except Exception as e:
            print("Failed to parse JSON batch. Output was:")
            print(cleaned[:300] + "...")
            print(f"Error details: {e}")
            print("Retrying in 5s...")
            time.sleep(5)
            continue
        
        # Avoid rate limits
        time.sleep(2)

    print(f"\nTarget achieved! Final dataset saved to {OUTPUT_FILE} with {len(dataset)} examples.")

if __name__ == "__main__":
    main()

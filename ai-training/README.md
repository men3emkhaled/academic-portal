# Zagazig University AI Assistant (ZAG AI) - Dataset & Training Pipeline

يحتوي هذا المجلد على خط الإنتاج الكامل لتوليد البيانات المصطنعة وتدريب الموديل محلياً لكي يتحدث العامية المصرية ويكون خبيراً في لوائح وجغرافيا جامعة الزقازيق.

---

## 🛠️ المتطلبات وتثبيت الحزم (Installation)

لتشغيل كود التوليد والتدريب، يفضل إنشاء بيئة عمل (Virtual Environment) جديدة وتثبيت المكتبات المطلوبة:

```bash
# إنشاء بيئة عمل
python3 -m venv venv
source venv/bin/activate

# تثبيت مكتبات توليد البيانات
pip install requests datasets transformers trl

# تثبيت Unsloth للتدريب السريع (متوافق مع كروت Nvidia مثل 4060)
pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
pip install --no-deps "xformers<0.0.27" trl peft accelerate bitsandbytes
```

---

## 1️⃣ توليد البيانات المصطنعة (Dataset Generation)

يمكنك توليد 2000 محادثة باستخدام Ollama المحلي، أو استخدام مفاتيح API لـ Gemini أو OpenAI لسرعة وجودة أعلى.

### الإعداد (مفاتيح البيئة):
قم بتعيين المتغيرات حسب رغبتك قبل تشغيل السكربت:

```bash
# خيار 1: استخدام Ollama المحلي (افتراضي)
export LLM_PROVIDER="ollama"
export OLLAMA_MODEL="qwen3-vl:4b"

# خيار 2: استخدام Gemini API (موصى به للسرعة والتوفير)
export LLM_PROVIDER="gemini"
export GEMINI_API_KEY="AIzaSyYourKeyHere..."

# خيار 3: استخدام OpenAI API
export LLM_PROVIDER="openai"
export OPENAI_API_KEY="sk-proj-YourKeyHere..."
```

### تشغيل المولد:
```bash
python scripts/generate_dataset.py
```
*سيقوم السكربت بحفظ المحادثات تدريجياً داخل ملف `dataset/university_qa.json` بتنسيق ShareGPT.*

---

## 2️⃣ تدريب الموديل (Fine-Tuning via LoRA)

بمجرد اكتمال توليد البيانات وحفظها في `dataset/university_qa.json`، يمكنك تشغيل التدريب:

```bash
python scripts/train_lora.py
```
*السكربت مبرمج على استخدام Unsloth لدمج الموديل بدقة 4-bit مما يجعله يستهلك أقل من 6 جيجابايت VRAM ويعمل بكفاءة عالية جداً على كارت 4060.*

---

## 3️⃣ تشغيل الموديل المدرب على Ollama

بعد انتهاء التدريب، سيقوم السكربت بحفظ الموديل المدمج. لتشغيله داخل Ollama الخاص بك:

1. **تحويل الموديل لـ GGUF**:
   يمكنك تعديل نهاية ملف `train_lora.py` لكي يقوم Unsloth بتحويله مباشرة وصناعة الـ Modelfile:
   ```python
   # تصدير الموديل بصيغة Q8_0 GGUF المناسبة لـ Ollama
   model.save_pretrained_gguf("university_model_gguf", tokenizer, quantization_method = "q8_0")
   ```
2. **تسجيل الموديل في Ollama**:
   ```bash
   ollama create zag-ai-specialist -f ./university_model_gguf/Modelfile
   ```
3. **التشغيل**:
   ```bash
   ollama run zag-ai-specialist
   ```

ثم قم بتحديث متغير البيئة `OLLAMA_MODEL` في ملف `.env` الخاص بالـ Backend ليكون `zag-ai-specialist` بدلاً من الموديل العام.

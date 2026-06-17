import os
import torch
from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments

# -------------------------------------------------------------
# Configuration
# -------------------------------------------------------------
MODEL_NAME = "unsloth/Qwen2.5-7B-Instruct"  # High performance for Egyptian Arabic
MAX_SEQ_LENGTH = 2048
LORA_R = 16
LORA_ALPHA = 32
LORA_DROPOUT = 0
LEARNING_RATE = 2e-4
BATCH_SIZE = 4
GRADIENT_ACCUMULATION_STEPS = 4
EPOCHS = 3
OUTPUT_DIR = "./lora_output"
DATASET_PATH = os.path.join(os.path.dirname(__file__), "../dataset/university_qa.json")

# -------------------------------------------------------------
# 1. Load Model & Tokenizer
# -------------------------------------------------------------
print("Loading model and tokenizer in 4-bit...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=MAX_SEQ_LENGTH,
    dtype=None,  # Auto detect
    load_in_4bit=True,
)

# -------------------------------------------------------------
# 2. Add LoRA Adapters
# -------------------------------------------------------------
print("Applying LoRA adapters...")
model = FastLanguageModel.get_peft_model(
    model,
    r=LORA_R,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=LORA_ALPHA,
    lora_dropout=LORA_DROPOUT,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
)

# -------------------------------------------------------------
# 3. Prepare Dataset (ShareGPT to Prompt template)
# -------------------------------------------------------------
print("Formatting and loading dataset...")

def format_prompts(examples):
    conversations = examples["conversations"]
    texts = []
    for conv in conversations:
        # Construct chat format
        formatted = ""
        for msg in conv:
            role = msg["from"]
            val = msg["value"]
            if role == "human":
                formatted += f"<|im_start|>user\n{val}<|im_end|>\n"
            elif role == "gpt":
                formatted += f"<|im_start|>assistant\n{val}<|im_end|>\n"
        texts.append(formatted)
    return {"text": texts}

dataset = load_dataset("json", data_files=DATASET_PATH, split="train")
dataset = dataset.map(format_prompts, batched=True)

# -------------------------------------------------------------
# 4. Initialize Trainer
# -------------------------------------------------------------
print("Initializing SFTTrainer...")
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=MAX_SEQ_LENGTH,
    dataset_num_proc=2,
    packing=False,  # Can speed up training for short sequences
    args=TrainingArguments(
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=GRADIENT_ACCUMULATION_STEPS,
        warmup_steps=5,
        num_train_epochs=EPOCHS,
        learning_rate=LEARNING_RATE,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        logging_steps=1,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        output_dir=OUTPUT_DIR,
        report_to="none",  # Change to "wandb" if using weights & biases
    ),
)

# -------------------------------------------------------------
# 5. Run Training
# -------------------------------------------------------------
print("Starting training...")
trainer_stats = trainer.train()

# -------------------------------------------------------------
# 6. Save LoRA Adapters
# -------------------------------------------------------------
print("Saving LoRA adapters...")
model.save_pretrained_merged("university_model_merged", tokenizer, save_method="merged_16bit")
print("Finished! Merged model saved to 'university_model_merged' directory.")

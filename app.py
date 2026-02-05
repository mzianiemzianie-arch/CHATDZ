from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoModel, AutoTokenizer
import torch
import os
import shutil
import tempfile

app = FastAPI(title="DeepSeek-OCR-2 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ────────────────────────────────────────────────
# تحميل النموذج مرة واحدة عند بدء السيرفر
# ────────────────────────────────────────────────

print("جاري تحميل DeepSeek-OCR-2 ... قد يأخذ عدة دقائق")

os.environ["CUDA_VISIBLE_DEVICES"] = "0"   # غيّر الرقم إذا كان لديك أكثر من GPU

MODEL_NAME = "deepseek-ai/DeepSeek-OCR-2"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)

model = AutoModel.from_pretrained(
    MODEL_NAME,
    _attn_implementation="flash_attention_2",
    trust_remote_code=True,
    use_safetensors=True
)

model = model.eval().to(torch.bfloat16)

if torch.cuda.is_available():
    model = model.cuda()
    print("→ النموذج محمل على GPU")
else:
    print("⚠️  تحذير: لا GPU → سيعمل على CPU (بطيء جداً)")

print("النموذج جاهز!")

# ────────────────────────────────────────────────
# Endpoint الرئيسي
# ────────────────────────────────────────────────

@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, detail="يجب أن يكون الملف صورة")

    try:
        # حفظ مؤقت
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_path = tmp.name

        # Prompt (يمكنك تعديله)
        prompt = "<image>\n<|grounding|>Convert the document to markdown."

        # الاستدلال
        result = model.infer(
            tokenizer=tokenizer,
            prompt=prompt,
            image_file=temp_path,
            base_size=1024,
            image_size=768,
            crop_mode=True,
            save_results=False
        )

        os.unlink(temp_path)  # حذف الملف المؤقت

        # استخراج الناتج
        output = result.get("markdown", result.get("text", str(result)))

        return {"result": output}

    except Exception as e:
        if 'temp_path' in locals():
            try: os.unlink(temp_path)
            except: pass
        raise HTTPException(500, detail=f"خطأ داخلي: {str(e)}")


@app.get("/")
def root():
    return {"message": "DeepSeek-OCR-2 API تعمل • POST /ocr لرفع صورة"}

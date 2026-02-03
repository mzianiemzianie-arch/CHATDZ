from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)  # للسماح للصفحة بالاتصال من أي دومين

# 🔹 المفتاح مباشرة هنا
openai.api_key = "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"

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    question = data.get("question", "")
    if not question:
        return jsonify({"answer":"⚠️ لم يتم إدخال سؤال!"})
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role":"user","content":question}],
            max_tokens=300
        )
        answer = response.choices[0].message.content
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"answer": f"⚠️ حدث خطأ في الذكاء الاصطناعي: {str(e)}"})

if __name__=="__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT",5000)), debug=True)

import whisper
import tempfile
import os
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

# ✅ app must be created BEFORE using @app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
)

# ✅ load model after app creation (recommended)
model = whisper.load_model("base")


@app.websocket("/ws/transcribe")
async def transcribe(ws: WebSocket):
    await ws.accept()
    print("WebSocket connected")

    try:
        data = await ws.receive_bytes()
        print("Received bytes:", len(data))

        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            tmp.write(data)
            tmp_path = tmp.name

        print("Saved temp file:", tmp_path)

        wav_path = tmp_path.replace(".webm", ".wav")
        os.system(f'ffmpeg -y -i "{tmp_path}" "{wav_path}"')
        print("Converted to wav:", wav_path)

        result = model.transcribe(wav_path)
        print("Transcription result:", repr(result["text"]))

        await ws.send_text(result["text"])

        os.remove(tmp_path)
        os.remove(wav_path)
        print("Temp files removed")

    except Exception as e:
        print("Error occurred:", e)

    finally:
        print("Connection closed")
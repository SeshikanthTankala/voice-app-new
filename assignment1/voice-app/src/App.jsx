import React, { useRef, useState } from "react";

function App() {
  const [text, setText] = useState("");
  const wsRef = useRef(null);
  const recorderRef = useRef(null);

  const start = async () => {
  wsRef.current = new WebSocket("ws://localhost:8000/ws/transcribe");

  wsRef.current.onopen = async () => {
    console.log("WebSocket connected");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    recorderRef.current = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus"
    });

    recorderRef.current.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        const buffer = await e.data.arrayBuffer();
        wsRef.current.send(buffer);
      }
    };

    recorderRef.current.start();
  };

  wsRef.current.onmessage = (e) => {
    console.log("Received from server:", e.data);
    setText(e.data);
    wsRef.current.close();   // close AFTER receiving text
  };

  wsRef.current.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
};

const stop = () => {
  if (recorderRef.current && recorderRef.current.state === "recording") {
    recorderRef.current.stop();
  }
};

  return (
    <div style={{ padding: 20 }}>
      <h2>Open Source Voice to Text</h2>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <p>{text}</p>
    </div>
  );
}

export default App;

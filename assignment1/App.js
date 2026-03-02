import React, { useRef, useState } from "react";

function App() {
  const [text, setText] = useState("");
  const wsRef = useRef(null);
  const recorderRef = useRef(null);

  const start = async () => {
    wsRef.current = new WebSocket("ws://localhost:8000/ws/transcribe");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorderRef.current = new MediaRecorder(stream);

    recorderRef.current.ondataavailable = async (e) => {
      const buf = await e.data.arrayBuffer();
      wsRef.current.send(buf);
    };

    wsRef.current.onmessage = (e) => {
      setText(t => t + " " + e.data);
    };

    recorderRef.current.start(1000);
  };

  const stop = () => {
    recorderRef.current.stop();
    wsRef.current.close();
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

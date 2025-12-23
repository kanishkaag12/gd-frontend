let recorder;
let chunks = [];
let audioStream;

function joinRoom() {
  const room = document.getElementById("room").value;
  if (!room) {
    alert("Enter room name");
    return;
  }

  document.getElementById("jitsi").innerHTML = `
    <iframe
      src="https://meet.jit.si/${room}"
      allow="camera; microphone; fullscreen"
    ></iframe>
  `;

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      audioStream = stream;
    });
}

function startRecording() {
  if (!audioStream) {
    alert("Join room first");
    return;
  }

  chunks = [];
  recorder = new MediaRecorder(audioStream);
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.start();

  document.getElementById("report").innerText = "Recording audio for evaluation...";
}

function stopRecording() {
  recorder.stop();

  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: "audio/wav" });
    const form = new FormData();
    form.append("audio", blob, "gd.wav");

    document.getElementById("report").innerText = "Evaluating...";

    const res = await fetch("https://gd-backend-2d44.onrender.com", {
      method: "POST",
      body: form
    });

    const data = await res.json();
    document.getElementById("report").innerText =
      JSON.stringify(data, null, 2);
  };
}

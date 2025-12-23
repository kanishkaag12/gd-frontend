let mediaRecorder;
let audioChunks = [];
let audioStream = null;
let roomJoined = false;

// 🔹 JOIN GD
async function joinRoom() {
  const room = document.getElementById("room").value.trim();
  if (!room) {
    alert("Enter room name");
    return;
  }

  // Force mic permission
  audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const roomName = "GD_" + room;

  document.getElementById("jitsi").innerHTML = `
    <iframe
      src="https://meet.jit.si/${roomName}
      #config.prejoinPageEnabled=false
      #config.enableWelcomePage=false
      #config.disableDeepLinking=true"
      allow="camera; microphone; fullscreen"
    ></iframe>
  `;

  roomJoined = true;

  // Show Start Evaluation button
  document.getElementById("startBtn").style.display = "inline-block";
}

// 🔹 START EVALUATION
function startEvaluation() {
  if (!roomJoined || !audioStream) {
    alert("Join room first");
    return;
  }

  audioChunks = [];
  mediaRecorder = new MediaRecorder(audioStream);

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.start();

  document.getElementById("startBtn").style.display = "none";
  document.getElementById("stopBtn").style.display = "inline-block";
}

// 🔹 STOP & GENERATE REPORT
async function stopEvaluation() {
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", audioBlob);

    const res = await fetch("http://127.0.0.1:8000/evaluate", {
      method: "POST",
      body: formData
    });

    const result = await res.json();
    document.getElementById("reportText").textContent =
      JSON.stringify(result, null, 2);

    document.getElementById("stopBtn").style.display = "none";
  };
}

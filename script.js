const { Room } = LivekitClient;

const LIVEKIT_URL = "wss://groupdiscussion-tnfney72.livekit.cloud";
const BACKEND_URL = "https://gd-backend-2d44.onrender.com";

let room;
let audioTrack;
let mediaRecorder;
let chunks = [];

async function joinRoom() {
  const roomName = document.getElementById("room").value;

  const tokenRes = await fetch(`${BACKEND_URL}/token?room=${roomName}`);
  const { token } = await tokenRes.json();

  room = new Room();
  await room.connect(LIVEKIT_URL, token);

  room.localParticipant.enableCameraAndMicrophone();

  room.on("trackSubscribed", (track) => {
    if (track.kind === "video") {
      const el = track.attach();
      document.getElementById("videos").appendChild(el);
    }
    if (track.kind === "audio") {
      track.attach();
    }
  });

  audioTrack = room.localParticipant.audioTracks.values().next().value.track;
}

function startEvaluation() {
  chunks = [];
  const stream = new MediaStream([audioTrack.mediaStreamTrack]);
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  mediaRecorder.start();

  document.getElementById("report").innerText = "Recording...";
}

function stopEvaluation() {
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: "audio/wav" });
    const form = new FormData();
    form.append("audio", blob, "gd.wav");

    document.getElementById("report").innerText = "Evaluating...";

    const res = await fetch(`${BACKEND_URL}/evaluate`, {
      method: "POST",
      body: form
    });

    const data = await res.json();
    document.getElementById("report").innerText =
      JSON.stringify(data, null, 2);
  };
}

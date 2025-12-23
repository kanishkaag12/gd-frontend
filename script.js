const socket = io("https://gd-backend-2d44.onrender.com");
let localStream, recorder, chunks = [];
const videos = document.getElementById("videos");
const report = document.getElementById("report");

async function joinRoom() {
    const room = document.getElementById("room").value;
    socket.emit("join", room);

    localStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });

    const video = document.createElement("video");
    video.srcObject = localStream;
    video.autoplay = true;
    video.muted = true;
    videos.appendChild(video);
}

function startRecording() {
    chunks = [];
    recorder = new MediaRecorder(localStream);
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.start();
    report.innerText = "Recording...";
}

function stopRecording() {
    recorder.stop();
    recorder.onstop = async () => {
        const blob = new Blob(chunks, { type:"audio/wav" });
        const form = new FormData();
        form.append("audio", blob, "gd.wav");

        report.innerText = "Evaluating...";

        const res = await fetch("http://127.0.0.1:8000/evaluate", {
            method: "POST",
            body: form
        });
        const data = await res.json();
        report.innerText = JSON.stringify(data, null, 2);
    };
}

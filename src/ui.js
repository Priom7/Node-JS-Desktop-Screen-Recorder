const {
  desktopCapture,
  remote,
  desktopCapturer
} = require("electron");

const videoComponent = document.querySelector("video");

const startBtn = document.getElementById("start__btn");
startBtn.onclick = e => {
  videoRecorder.start();
  startBtn.innerText = "Recording";
};
const stopBtn = document.getElementById("stop__btn");
startBtn.onclick = e => {
  videoRecorder.stop();
  startBtn.innerText = "Start";
};
const selectBtn = document.getElementById("select__btn");

const { dialog, Menu } = remote;
selectBtn.onclick = getRecordingSources;
async function getRecordingSources() {
  const videoSources = await desktopCapturer.getSources({
    types: ["window", "screen"]
  });

  const optionMenu = Menu.buildFromTemplate(
    videoSources.map(source => {
      return {
        label: source.name,
        click: () => pickSource(source)
      };
    })
  );
  optionMenu.popup();
}

let videoRecorder;
const recorderChunks = [];

async function pickSource(source) {
  const rules = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: source.id
      }
    }
  };
  const stream = await navigator.mediaDevices.getUserMedia(
    rules
  );

  videoComponent.srcObject = stream;
  videoComponent.play();

  const options = { mimeType: "video/webm; codecs=vp9" };
  videoRecorder = new MediaRecorder(stream, options);

  videoRecorder.ondataavailable = handleDataAvailable;
  videoRecorder.onstop = handleStop;
}

function handleDataAvailable(e) {
  console.log("Video Data available");
  recorderChunks.push(e.data);
}
const { writeFIle } = require("fs");

async function handleStop(e) {
  const blob = new Blob(recorderChunks, {
    type: "video/webm; codecs=vp9"
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showOpenDialog({
    buttonLabel: "Save Video",
    defaultPath: `vid-${Date.now()}.webm`
  });

  console.log(filePath);

  writeFIle(filePath, buffer, () =>
    console.log("video Saved")
  );
}

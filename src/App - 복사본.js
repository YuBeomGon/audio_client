import React, { useState, useRef, useEffect } from "react";
import Button from "@material-ui/core/Button";
import NativeSelect from "@material-ui/core/NativeSelect";
import {
  RecordRTCPromisesHandler,
  stopRecording,
  StereoAudioRecorder,
  MediaStreamRecorder,
  invokeSaveAsDialog
} from "recordrtc";
import { Base64 } from "js-base64";
import axios from "axios";
axios.defaults.headers.post["Content-Type"] = "application/json; charset=utf-8";


// var ws = new WebSocket("ws://172.26.70.79:5000");
// console.log(ws);
const App = () => {
  const [ws, setWs] = useState();
  const recordBtn = useRef(null);
  const player = useRef(null);
  const [webSocket, setWebSocket] = useState(); // websocket
  const [base64Data, setBase64Data] = useState(); // socket으로 날릴 때 message로 들어감
  const [blob, setBlob] = useState(); // blob data , 이것으로 download 파일
  const [mimeType, setMimeType] = useState(); // 녹음할 mimeType          audio/webm or audio/pcm
  const [fileExtension, setFileExtension] = useState(); // 녹음할 fileExtension     webm or pcm
  const [recorderType, setRecorderType] = useState("webm"); // 녹음할 recorderType      MediaStreamRecorder or StereoAudioRecorder
  const [sampleRate, setSampleRate] = useState(48000); // 녹음할 sampleRate        이후 socket으로 날릴 때 sampling으로도 들어감
  const [time, setTime] = useState(10);
  //const [socketUrl, setSocketUrl] = useState("ws://172.26.70.81:5000");
  const [socketUrl, setSocketUrl] = useState("");

  const [dataSize, setDataSize] = useState(0);

  useEffect(() => {
    //let a = new WebSocket("ws://172.26.70.79:5000");
    let a = new WebSocket("ws://172.26.70.10:4000");
    //let a = new WebSocket("ws://172.26.70.22:5000");

    a.onopen = () => {
      console.log("connected...");

      setWebSocket(a);
    };
    a.onclose = () => {
      console.log("disconnected...");
    };
    a.onmessage = event => {
      console.log(event);
    };
  }, []);

  useEffect(() => {
    // console.log("useEffect");
    if (webSocket && typeof base64Data !== "undefined") {
      let jsonData = JSON.stringify({
        action: "voicebot",
        message: base64Data,
        sampling: String(sampleRate)
      });
      console.log(jsonData);
      console.log(base64Data);
      let jsonDataSize = jsonData.length;
      console.log(dataSize, jsonDataSize);
      webSocket.send(
        JSON.stringify({
          dataSize: String(dataSize),
          jsonDataSize: String(jsonDataSize),
          blobSize: String(blob.size)
        })
      );

      webSocket.send(jsonData);
    }
  }, [webSocket, socketUrl]);

  let recorder;
  let downFile;
  let tempBlob;

  const getAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    });
    // console.log("sample", sampleRate);
    recorder = new RecordRTCPromisesHandler(stream, {
      type: "audio",
      mimeType,
      fileExtension,
      recorderType:
        recorderType === "webm" ? MediaStreamRecorder : StereoAudioRecorder,
      bitsPerSecond: 128000,
      audioBitsPerSecond: 128000,
      sampleRate,
      timeSlice: 1000
    });
    recorder.startRecording();


    setTimeout(() => {
      stopClick();
    }, 180*30);

    //downClick();

  };

  const stopClick = async () => {
    const sleep = m => new Promise(r => setTimeout(r, m));
    await sleep(0);
    await recorder.stopRecording();
    tempBlob = await recorder.blob;

    setBlob(tempBlob);

    const convertBlobToBase64 = blob =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    convertBlobToBase64(tempBlob).then(data => {
      downFile = data.slice(23);
      setDataSize(downFile.length);
      setBase64Data(downFile);
    });

    //downClick()

    //getAudio();
  };

  const downClick = () => {
    // console.log(blob);
    invokeSaveAsDialog(blob);
  };

  const setSaveType = e => {
    // console.log(e.target.value);
    setMimeType(`audio/${e.target.value}`);
    setFileExtension(e.target.value);
    // console.log(e.target.value === "webm");
    e.target.value === "webm"
      ? setRecorderType("webm")
      : setRecorderType("wav");
  };

  const setSampleRateText = e => {
    setSampleRate(Number(e.target.value));
  };

  const setTimeText = e => {
    setTime(Number(e.target.value));
  };

  const socketUrlChange = e => {
    setSocketUrl(e.target.value);
  };

  return (
    <>
      <audio ref={player} id="player" />
      <NativeSelect id="saveType" name="saveType" onChange={setSaveType}>
        <option value="webm">opus</option>
        <option value="wav">pcm</option>
      </NativeSelect>
      <NativeSelect id="time" name="time" onChange={setTimeText}>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="30">30</option>
      </NativeSelect>
      <NativeSelect
        id="sampleRate"
        name="sampleRate"
        onChange={setSampleRateText}
      >
        <option value="48000">48.0kHz</option>
        <option value="44100">44.1kHz</option>
        <option value="22000">20.0kHz</option>
        <option value="16000">16.0kHz</option>
      </NativeSelect>
      <br />
      <Button
        variant="contained"
        color="primary"
        ref={recordBtn}
        onClick={getAudio}
        id="recordBtn"
      >
        Start Recording
      </Button>{" "}
      <br />
      <Button variant="contained" color="primary" onClick={stopClick}>
        STOP
      </Button>{" "}
      <br />
      <Button variant="contained" color="primary" onClick={downClick}>
        DOWNLOAD
      </Button>{" "}
      <br />
      <Button variant="contained" color="primary">
        소켓
      </Button>
      <input value={socketUrl} onChange={socketUrlChange} />
    </>
  );
};

export default App;
// const speech = require("@google-cloud/speech");
// require("dotenv").config();

// // Instantiates a client.
// const client = new speech.SpeechClient();

// // const keyfile = require("./affable-beaker-391122-a51bb7949bd7.json");
// // const client = new SpeechClient({ keyfile });

// // The path to the remote audio file.
// const gcsUri = "https://dogi.vip/audio.mp3";

// async function transcribeSpeech() {
//   const audio = {
//     uri: gcsUri,
//   };

//   // Transcribes your audio file using the specified configuration.
//   const config = {
//     model: "phone_call",
//     encoding: "LINEAR16",
//     sampleRateHertz: 44100,
//     audioChannelCount: 2,
//     enableWordTimeOffsets: true,
//     enableWordConfidence: true,
//     useEnhanced: true,
//     languageCode: "en-US",
//   };

//   const request = {
//     audio: audio,
//     config: config,
//   };

//   // Detects speech in the audio file. This creates a recognition job that you
//   // can wait for now, or get its result later.
//   const [operation] = await client.longRunningRecognize(request);
//   // Get a Promise representation of the final result of the job.
//   const [response] = await operation.promise();
//   const transcription = response.results
//     .map((result) => result.alternatives[0].transcript)
//     .join("\n");
//   console.log(`Transcription: ${transcription}`);
// }

// transcribeSpeech();

const speech = require("@google-cloud/speech");
require("dotenv").config();

// Instantiates a client.
const client = new speech.SpeechClient();

async function transcribeSpeech() {
  const audio = {
    // Replace 'https://example.com/audio.mp3' with the URL of your audio file.
    uri: "https://dogi.vip/audio.mp3",
  };

  // Transcribes your audio file using the specified configuration.
  const config = {
    model: "phone_call",
    encoding: "MP3",
    sampleRateHertz: 44100,
    audioChannelCount: 2,
    enableWordTimeOffsets: true,
    enableWordConfidence: true,
    useEnhanced: true,
    languageCode: "en-US",
  };

  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  const [operation] = await client.longRunningRecognize(request);
  // Get a Promise representation of the final result of the job.
  const [response] = await operation.promise();
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");
  console.log(`Transcription: ${transcription}`);
}

transcribeSpeech();

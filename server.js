// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const multer = require("multer");
// const FormData = require("form-data");
// const apiRouter = require("./api");
// const fs = require("fs");
// const path = require("path");
// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const ffmpeg = require("fluent-ffmpeg");
// ffmpeg.setFfmpegPath(ffmpegPath);
// require("dotenv").config();
// const { Storage } = require("@google-cloud/storage");
// const speech = require("@google-cloud/speech");

// // Instantiates a client.
// const client = new speech.SpeechClient();
// const app = express();

// app.use(cors());
// app.options("*", cors());

// const port = process.env.PORT || 3001;

// // database
// app.use("/", apiRouter);

// // Set up Multer for file upload
// const upload = multer({ dest: "uploads/" });

// function generateRandomString() {
//   const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   let randomString = "";

//   for (let i = 0; i < 20; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     const randomChar = characters.charAt(randomIndex);
//     randomString += randomChar;
//   }

//   return randomString;
// }

// // API endpoint for downloading files
// app.get("/api/download", async (req, res) => {
//   const fileUrl = req.query.url; // Get the file URL from the query parameters

//   try {
//     // Download the file from the specified URL
//     const fileResponse = await axios.get(fileUrl, { responseType: "stream" });

//     // Set the appropriate headers for the response
//     res.setHeader("Content-Type", fileResponse.headers["content-type"]);
//     res.setHeader("Content-Disposition", `attachment; filename="${fileUrl}"`);

//     // Pipe the file stream to the response
//     fileResponse.data.pipe(res);
//   } catch (error) {
//     console.error("Error downloading file:", error);
//     res.status(500).json({ error: "Failed to download file" });
//   }
// });

// // API endpoint for file upload and transcription
// app.post("/api/upload", upload.single("file"), async (req, res) => {
//   try {
//     const inputFile = req.file.path;
//     const randomString = generateRandomString();
//     const outputFile = `./uploads/converted/${randomString}.mp3`;
//     await ffmpeg(inputFile)
//       .toFormat("mp3")
//       .on("end", async () => {
//         const fileStats = await fs.statSync(outputFile);

//         const gcsUri = `gs://podship/${randomString}.mp3`;

//         // Upload the converted audio file to Google Cloud Storage
//         const storage = new Storage();
//         await storage.bucket("podship").upload(outputFile, {
//           destination: `${randomString}.mp3`,
//           metadata: {
//             contentType: "audio/mp3",
//           },
//         });

//         const audio = {
//           uri: gcsUri,
//         };

//         const config = {
//           model: "phone_call",
//           encoding: "MP3",
//           sampleRateHertz: 44100,
//           audioChannelCount: 1,
//           enableWordTimeOffsets: true,
//           enableWordConfidence: true,
//           useEnhanced: true,
//           languageCode: "en-US",
//         };

//         const request = {
//           audio: audio,
//           config: config,
//         };

//         // Transcribe the audio using LongRunningRecognize
//         const [operation] = await client.longRunningRecognize(request);
//         const [response] = await operation.promise();
//         const transcription = response.results
//           .map((result) => result.alternatives[0].transcript)
//           .join("\n");
//         console.log(response);
//         res.send({ transcription });
//       })
//       .on("error", (err) => {
//         console.error("Error during conversion:", err);
//         res.status(500).json({ error: "Failed to convert file" });
//       })
//       .save(outputFile);
//   } catch (error) {
//     if (error.response) {
//       console.log(error.response.data); // This will display the error message from the server
//     }
//     console.error("Error uploading file:", error);
//     res.status(500).json({ error: "Failed to upload file" });
//   }
// });

// //===========================================================================================
// app.get("/check", (req, res) => {
//   res.status(200).json({ message: "App Updated", version: "1.0.9" });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// ============================================ without ffmpeg ===============================================

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const apiRouter = require("./api");
const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const speech = require("@google-cloud/speech");

const client = new speech.SpeechClient();
const app = express();

app.use(cors());
app.options("*", cors());

const port = process.env.PORT || 3001;

app.use("/", apiRouter);

const upload = multer({ dest: "uploads/" });

function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let randomString = "";

  for (let i = 0; i < 20; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomChar = characters.charAt(randomIndex);
    randomString += randomChar;
  }

  return randomString;
}

app.get("/api/download", async (req, res) => {
  const fileUrl = req.query.url;

  try {
    const fileResponse = await axios.get(fileUrl, { responseType: "stream" });

    res.setHeader("Content-Type", fileResponse.headers["content-type"]);
    res.setHeader("Content-Disposition", `attachment; filename="${fileUrl}"`);

    fileResponse.data.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const inputFile = req.file.path;
    const randomString = generateRandomString();
    const gcsUri = `gs://podship/${randomString}.mp3`;

    const storage = new Storage();
    await storage.bucket("podship").upload(inputFile, {
      destination: `${randomString}.mp3`,
      metadata: {
        contentType: "audio/mp3",
      },
    });

    const audio = {
      uri: gcsUri,
    };

    const config = {
      model: "phone_call",
      encoding: "LINEAR16",
      sampleRateHertz: 44100,
      audioChannelCount: 1,
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      useEnhanced: true,
      languageCode: "en-US",
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [operation] = await client.longRunningRecognize(request);
    const [response] = await operation.promise();
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");
    console.log(response);
    res.send({ transcription });
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
    }
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

app.get("/check", (req, res) => {
  res.status(200).json({ message: "App Updated", version: "1.0.9" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// ffmpeg when not mp3 ===================================================================================

// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const multer = require("multer");
// const FormData = require("form-data");
// const apiRouter = require("./api");
// const fs = require("fs");
// const path = require("path");
// const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
// const ffmpeg = require("fluent-ffmpeg");
// ffmpeg.setFfmpegPath(ffmpegPath);
// require("dotenv").config();
// const { Storage } = require("@google-cloud/storage");
// const speech = require("@google-cloud/speech");

// const currentTime = new Date();

// // Instantiates a client.
// const client = new speech.SpeechClient();
// const app = express();

// app.use(cors());
// app.options("*", cors());

// const port = process.env.PORT || 3001;

// // database
// app.use("/", apiRouter);

// // Set up Multer for file upload
// const upload = multer({ dest: "uploads/" });

// function generateRandomString() {
//   const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
//   let randomString = "";

//   for (let i = 0; i < 20; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     const randomChar = characters.charAt(randomIndex);
//     randomString += randomChar;
//   }

//   return randomString;
// }

// // API endpoint for downloading files
// app.get("/api/download", async (req, res) => {
//   const fileUrl = req.query.url; // Get the file URL from the query parameters

//   try {
//     // Download the file from the specified URL
//     const fileResponse = await axios.get(fileUrl, { responseType: "stream" });

//     // Set the appropriate headers for the response
//     res.setHeader("Content-Type", fileResponse.headers["content-type"]);
//     res.setHeader("Content-Disposition", `attachment; filename="${fileUrl}"`);

//     // Pipe the file stream to the response
//     fileResponse.data.pipe(res);
//   } catch (error) {
//     console.error("Error downloading file:", error);
//     res.status(500).json({ error: "Failed to download file" });
//   }
// });

// // API endpoint for file upload and transcription
// app.post("/api/upload", upload.single("file"), async (req, res) => {
//   try {
//     const inputFile = req.file.path;
//     const fileExtension = path.extname(inputFile).toLowerCase();

//     if (fileExtension === ".mp3") {
//       // The file is already an MP3, proceed with the process
//       await processFile(inputFile, res);
//     } else {
//       // Convert the file to MP3
//       const randomString = generateRandomString();
//       const outputFile = `./uploads/converted/${randomString}.mp3`;

//       await ffmpeg(inputFile)
//         .toFormat("mp3")
//         .on("end", async () => {
//           await processFile(outputFile, res);
//         })
//         .on("error", (err) => {
//           console.error("Error during conversion:", err);
//           res.status(500).json({ error: "Failed to convert file" });
//         })
//         .save(outputFile);
//     }
//   } catch (error) {
//     if (error.response) {
//       console.log(currentTime, error.response.data); // This will display the error message from the server
//     }
//     console.error("Error uploading file:", error);
//     res.status(500).json({ error: "Failed to upload file" });
//   }
// });

// // Process the file for transcription
// async function processFile(file, res) {
//   const fileStats = await fs.statSync(file);

//   const gcsUri = `gs://podship/${path.basename(file)}`;

//   // Upload the audio file to Google Cloud Storage
//   const storage = new Storage();
//   await storage.bucket("podship").upload(file, {
//     destination: path.basename(file),
//     metadata: {
//       contentType: "audio/mp3",
//     },
//   });

//   const audio = {
//     uri: gcsUri,
//   };

//   const config = {
//     model: "phone_call",
//     encoding: "MP3",
//     sampleRateHertz: 44100,
//     audioChannelCount: 1,
//     enableWordTimeOffsets: true,
//     enableWordConfidence: true,
//     useEnhanced: true,
//     languageCode: "en-US",
//   };

//   const request = {
//     audio: audio,
//     config: config,
//   };

//   // Transcribe the audio using LongRunningRecognize
//   const [operation] = await client.longRunningRecognize(request);
//   const [response] = await operation.promise();
//   const transcription = response.results
//     .map((result) => result.alternatives[0].transcript)
//     .join("\n");
//   console.log(currentTime, response);
//   res.send({ transcription });
// }

// //===========================================================================================
// app.get("/check", (req, res) => {
//   res.status(200).json({ message: "App Updated", version: "1.0.9" });
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

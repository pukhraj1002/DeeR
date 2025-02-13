import { Message } from "./types";
import Cartesia, { WebPlayer } from "@cartesia/cartesia-js";

const BACKEND_URL = "http://localhost:8001";
const CARTESIA_API_KEY =
  process.env.NEXT_PUBLIC_CARTESIA_API_KEY || "your-cartesia-api-key";

const cartesia = new Cartesia({ apiKey: CARTESIA_API_KEY });
const player = new WebPlayer({ bufferDuration: 0.5 });

export const addToChromaDB = async (content: string) => {
  try {
    await fetch(`${BACKEND_URL}/add-to-chroma`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
  } catch (error) {
    console.error("Error adding to ChromaDB:", error);
  }
};

export const getRelevantContext = async (query: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/query-chroma`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CARTESIA_API_KEY}`,
      },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error querying ChromaDB:", error);
    return [];
  }
};

export const sendMessageToAPI = async (messages: Message[], input: string) => {
  const relevantContext = await getRelevantContext(input);
  console.log("Relevant context:", relevantContext);
  await addToChromaDB(input);

  const response = await fetch(`${BACKEND_URL}/generate-summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: `Relevant context: ${relevantContext.join(
            ". "
          )} Your Role: You are a professional Teacher Who loves the Richard Feynman Method of learning!
      You will be informed on what to do later on,
      till then just help the user out with learning whatever he asks you!`,
        },
        ...messages,
        { role: "user", content: input },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.status === "success") {
    return data.summary;
  } else {
    throw new Error(data.message || "Failed to generate summary");
  }
};

export const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BACKEND_URL}/upload-file`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }

  return await response.json();
};

export const playAudioMessage = async (text: string) => {
  const websocket = cartesia.tts.websocket({
    container: "raw",
    encoding: "pcm_f32le",
    sampleRate: 44100,
  });

  try {
    await websocket.connect();
    const response = await websocket.send({
      model_id: "sonic-english",
      voice: {
        mode: "id",
        id: "a0e99841-438c-4a64-b679-ae501e7d6091", // You can change this to a different voice ID if desired
      },
      transcript: text,
    });

    await player.play(response.source);
  } catch (error) {
    console.error("Error playing audio:", error);
  }
};

'use client';

import { useEffect, useState } from 'react';
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils/vapiHelpers";
import { useVapiClient } from './hooks/useVapiClient';
import { Sidebar } from './components/ui/Sidebar';
import { CallTranscript } from './components/ui/CallTranscript/CallTranscript';
import { usePublicKeyInvalid } from './hooks/usePublicKeyInvalid';

// Environment variables
const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const vapiAssistant = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_VAPI_API_KEY is not defined in the environment variables");
}

// Initialize Vapi
const vapi = new Vapi(apiKey);

export default function Home() {
  const [structuredData, setStructuredData] = useState(null);
  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();
  
  const {
    connected,
    assistantIsSpeaking,
    volumeLevel,
    partialTranscript,
    finalTranscript,
    handleCallStart,
    handleCallEnd,
    handleMessage,
    resetTranscripts,
    setAssistantIsSpeaking,
    setVolumeLevel,
  } = useVapiClient({
    onStructuredDataReceived: setStructuredData,
  });

  useEffect(() => {
    // Register Vapi event listeners
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", () => setAssistantIsSpeaking(true));
    vapi.on("speech-end", () => setAssistantIsSpeaking(false));
    vapi.on("volume-level", setVolumeLevel);
    vapi.on("message", handleMessage);
    vapi.on("error", (error) => {
      console.error(error);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });

    // Cleanup event listeners on component unmount
    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("speech-start", () => setAssistantIsSpeaking(true));
      vapi.off("speech-end", () => setAssistantIsSpeaking(false));
      vapi.off("volume-level", setVolumeLevel);
      vapi.off("message", handleMessage);
    };
  }, [
    handleCallStart, 
    handleCallEnd, 
    handleMessage, 
    setAssistantIsSpeaking, 
    setVolumeLevel,
    setShowPublicKeyInvalidMessage
  ]);

  const startCall = () => {
    vapi.start(vapiAssistant);
  };

  const endCall = () => {
    vapi.stop();
  };

  return (
    <div className="grid grid-cols-5 h-screen">
      <Sidebar
        connected={connected}
        assistantIsSpeaking={assistantIsSpeaking}
        volumeLevel={volumeLevel}
        showPublicKeyInvalidMessage={showPublicKeyInvalidMessage}
        finalTranscript={finalTranscript}
        onStartCall={startCall}
        onEndCall={endCall}
        onResetTranscripts={resetTranscripts}
      />
      <main className="col-span-4 overflow-y-auto p-4 flex flex-col justify-center bg-gray-100">
        <div className="h-6 text-2xl font-semibold mb-8 mt-4 text-gray-100">
          Call Assistant PoC
        </div>
        <CallTranscript
          finalTranscript={finalTranscript}
          partialTranscript={partialTranscript}
          structuredData={structuredData}
        />
      </main>
    </div>
  );
}
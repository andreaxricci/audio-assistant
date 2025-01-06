'use client';

import { useEffect, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";
import Button from "./components/ui/Button";
import ActiveCallDetail from "./components/ui/ActiveCallDetail";

interface StructuredDataResponse {
  success: boolean;
  structuredData: any;
}

function isStructuredDataResponse(data: unknown): data is StructuredDataResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof (data as StructuredDataResponse).success === 'boolean' &&
    'structuredData' in data
  );
}

const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const vapiAssistant = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_VAPI_API_KEY is not defined in the environment variables");
}

const serverSecret = process.env.NEXT_PUBLIC_VAPI_SERVER_SECRET;

if (!serverSecret) {
  throw new Error("NEXT_PUBLIC_VAPI_SERVER_SECRET is not defined in the environment variables");
}

const vapi = new Vapi(apiKey);

export default function Home() {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [lastSpeaker, setLastSpeaker] = useState("");
  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();
  const [structuredData, setStructuredData] = useState(null);
  // const [phoneNumber, setPhoneNumber] = useState("");
  {/*const [hospitalName, setHospitalName] = useState("");
  const [hcpName, setHcpName] = useState("");
  const [productName, setProductName] = useState(""); */}

  const handleCallStart = useCallback(() => {
    setConnecting(false);
    setConnected(true);
    setShowPublicKeyInvalidMessage(false);
  }, [setShowPublicKeyInvalidMessage]);

  const handleCallEnd = useCallback(() => {
    setConnecting(false);
    setConnected(false);
    setShowPublicKeyInvalidMessage(false);
    setPartialTranscript("");
    setLastSpeaker("");
  }, [setShowPublicKeyInvalidMessage]);

  const handleSpeechStart = useCallback(() => {
    setAssistantIsSpeaking(true);
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setAssistantIsSpeaking(false);
  }, []);

  const handleVolumeLevel = useCallback((level: any) => {
    setVolumeLevel(level);
  }, []);

  const handleMessage = useCallback((msg: any) => {
    console.log(`msg.type: ${msg.type}`);
    console.log(msg); 
    if (msg.type === "transcript") {
      const speaker = msg.role === "user" ? "User" : "Assistant";
      const transcriptText = msg.transcript;

      if (msg.transcriptType === "partial") {
        setPartialTranscript((prev) => (lastSpeaker === speaker ? prev + " " + transcriptText : `${speaker}: ${transcriptText}`));
      } else if (msg.transcriptType === "final") {
        setFinalTranscript((prev) => (lastSpeaker === speaker ? prev + " " + transcriptText : `${prev}\n\n${speaker}: ${transcriptText}`));
        setPartialTranscript(""); 
        setLastSpeaker(speaker);
      } {/*
    } else if (msg.type === "function-call" && msg.functionCall.name === "GetCallDetails") {
      console.log('Function call received: ', msg.functionCall);
      const { hospitalName, hcpName, productName } = JSON.parse(msg.functionCall.parameters);
      setHospitalName(hospitalName);
      setHcpName(hcpName);
    setProductName(productName); */}
    } else if (msg.type === "end-of-call-report") {
      if (!serverSecret) {
        console.error('Server secret is not defined. Cannot make API call.');
        return;
      }

      fetch('/api/webhook/structuredData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(serverSecret ? { 'x-vapi-secret': serverSecret } : {}),
        },
        body: JSON.stringify({ analysis: msg.analysis }),
      })
      .then(response => response.json())
      .then((data: unknown) => {
      if (isStructuredDataResponse(data)) {
        if (data.success) {
          setStructuredData(data.structuredData);
        }
      } else {
        console.error('Unexpected response format');
      }
    })
    .catch(error => console.error('Error:', error));
  }
  }, [lastSpeaker]);

  const handleError = useCallback((error: any) => {
    console.error(error);
    setConnecting(false);
    if (isPublicKeyMissingError({ vapiError: error })) {
      setShowPublicKeyInvalidMessage(true);
    }
  }, [setShowPublicKeyInvalidMessage]);

  useEffect(() => {
    // Register Vapi event listeners
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("volume-level", handleVolumeLevel);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    // Cleanup event listeners on component unmount
    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("volume-level", handleVolumeLevel);
      vapi.off("message", handleMessage);
      vapi.off("error", handleError);
    };
  }, [handleCallStart, handleCallEnd, handleSpeechStart, handleSpeechEnd, handleVolumeLevel, handleMessage, handleError]);

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    vapi.start(vapiAssistant); 
  };

  const endCall = () => {
    vapi.stop();
  };

  const resetTranscripts = () => {
    setPartialTranscript("");
    setFinalTranscript("");
    setLastSpeaker("");
  };

  return (
    <div className="grid grid-cols-5 h-screen">
      <aside className="col-span-1 bg-gray-200 p-4">
        <div className="h-6 text-2xl font-semibold mb-12 mt-4 text-center">
          Call Assistant PoCs
        </div>
        
        <div className="flex flex-col items-center mb-4">
          {!connected ? (
            <div className="flex flex-col space-y-4">
              <Button onClick={startCallInline}> Start Call </Button>
              {finalTranscript && (
                <Button onClick={resetTranscripts}> Reset </Button>
              )}
            </div>
            
          ) : (
            <ActiveCallDetail
              assistantIsSpeaking={assistantIsSpeaking}
              volumeLevel={volumeLevel}
              onEndCallClick={endCall}
            />
          )}
          {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
          
        </div>
        {/* <div className="mt-4">
          <h3 className="font-semibold">Call Details:</h3>
          <p>Hospital: {hospitalName}</p>
          <p>HCP: {hcpName}</p>
          <p>Product: {productName}</p>
          </div> */}
      </aside>
      <main className="col-span-4 overflow-y-auto p-4 flex flex-col justify-center bg-gray-100">
        {/*<div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        </div>*/}
        <div className="h-6 text-2xl font-semibold mb-8 mt-4 text-gray-100">
          Call Assistant PoC
        </div>
        <div className="w-full flex-grow p-4">
          <div className="flex-grow overflow-y-auto bg-white p-4 rounded shadow-md whitespace-pre-wrap">
            <p><strong>Transcript:</strong> {finalTranscript} </p>
            <p>{partialTranscript}</p>
          </div>
          {structuredData && (
            <div className="mt-4">
              <h3>Structured Data:</h3>
              <pre>{JSON.stringify(structuredData, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>

  );
}

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      const timer = setTimeout(() => {
        setShowPublicKeyInvalidMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div style={{ position: "fixed", bottom: "25px", left: "25px", padding: "10px", color: "#fff", backgroundColor: "#f03e3e", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  );
};

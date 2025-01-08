import { useEffect, useState, useCallback } from "react";
import { handleEndOfCallReport } from '../utils/vapiHelpers';

interface UseVapiClientProps {
    onStructuredDataReceived: (data: any) => void;
  }
  
  export const useVapiClient = ({ onStructuredDataReceived }: UseVapiClientProps) => {
    const [connecting, setConnecting] = useState(false);
    const [connected, setConnected] = useState(false);
    const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [partialTranscript, setPartialTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    const [lastSpeaker, setLastSpeaker] = useState("");
  
    const handleCallStart = useCallback(() => {
      setConnecting(false);
      setConnected(true);
    }, []);
  
    const handleCallEnd = useCallback(() => {
      setConnecting(false);
      setConnected(false);
      setPartialTranscript("");
      setLastSpeaker("");
    }, []);
  
    const handleMessage = useCallback((msg: any) => {
      if (msg.type === "transcript") {
        const speaker = msg.role === "user" ? "User" : "Assistant";
        const transcriptText = msg.transcript;
  
        if (msg.transcriptType === "partial") {
          setPartialTranscript((prev) => 
            lastSpeaker === speaker ? prev + " " + transcriptText : `${speaker}: ${transcriptText}`
          );
        } else if (msg.transcriptType === "final") {
          setFinalTranscript((prev) => 
            lastSpeaker === speaker ? prev + " " + transcriptText : `${prev}\n\n${speaker}: ${transcriptText}`
          );
          setPartialTranscript("");
          setLastSpeaker(speaker);
        }
      } else if (msg.type === "end-of-call-report") {
        handleEndOfCallReport(msg.analysis, onStructuredDataReceived);
      }
    }, [lastSpeaker, onStructuredDataReceived]);
  
    const resetTranscripts = useCallback(() => {
      setPartialTranscript("");
      setFinalTranscript("");
      setLastSpeaker("");
    }, []);
  
    return {
      connecting,
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
    };
  };

  
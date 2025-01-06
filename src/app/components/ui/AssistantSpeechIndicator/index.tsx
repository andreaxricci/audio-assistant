import React from "react";

interface AssistantSpeechIndicatorProps {
    isSpeaking: boolean;
  }

const AssistantSpeechIndicator: React.FC<AssistantSpeechIndicatorProps> = ({ isSpeaking }) => {
  return (
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "10px",
        padding: "20px" }}
      >
      <div
        style={{
          width: "20px",
          height: "20px",
          backgroundColor: isSpeaking ? "#808080" : "#f03e3e",
          marginRight: "10px",
          borderRadius: "4px",
        }}
      />
      <p style={{ color: "white", margin: 0 }}>
        {isSpeaking ? "Assistant speaking" : "Assistant not speaking"}
      </p>
    </div>
  );
};

export default AssistantSpeechIndicator;
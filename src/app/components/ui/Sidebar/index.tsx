import Button from "../Button/Button";
import ActiveCallDetail from "../ActiveCallDetail";

interface SidebarProps {
    connected: boolean;
    assistantIsSpeaking: boolean;
    volumeLevel: number;
    showPublicKeyInvalidMessage: boolean;
    finalTranscript: string;
    onStartCall: () => void;
    onEndCall: () => void;
    onResetTranscripts: () => void;
  }
  
  export const Sidebar: React.FC<SidebarProps> = ({
    connected,
    assistantIsSpeaking,
    volumeLevel,
    showPublicKeyInvalidMessage,
    finalTranscript,
    onStartCall,
    onEndCall,
    onResetTranscripts,
  }) => {
    return (
      <aside className="col-span-1 bg-gray-200 p-4">
        <div className="h-6 text-2xl font-semibold mb-12 mt-4 text-center">
          Call Assistant PoCs
        </div>
        
        <div className="flex flex-col items-center mb-4">
          {!connected ? (
            <div className="flex flex-col space-y-4">
              <Button onClick={onStartCall}>Start Call</Button>
              {finalTranscript && (
                <Button onClick={onResetTranscripts}>Reset</Button>
              )}
            </div>
          ) : (
            <ActiveCallDetail
              assistantIsSpeaking={assistantIsSpeaking}
              volumeLevel={volumeLevel}
              onEndCallClick={onEndCall}
            />
          )}
          {showPublicKeyInvalidMessage && <PleaseSetYourPublicKeyMessage />}
        </div>
      </aside>
    );
  };

  const PleaseSetYourPublicKeyMessage = () => {
    return (
      <div style={{ position: "fixed", bottom: "25px", left: "25px", padding: "10px", color: "#fff", backgroundColor: "#f03e3e", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
        Is your Vapi Public Key missing? (recheck your code)
      </div>
    );
  };
  
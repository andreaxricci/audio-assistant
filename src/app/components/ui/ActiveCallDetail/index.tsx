import AssistantSpeechIndicator from "../AssistantSpeechIndicator";
import Button from "../Button";
import VolumeLevel from "../VolumeLevel/VolumeLevel";

interface ActiveCallDetailProps {
    assistantIsSpeaking: boolean;
    volumeLevel: number;
    onEndCallClick: () => void;
  }

const ActiveCallDetail: React.FC<ActiveCallDetailProps> = ({ assistantIsSpeaking, volumeLevel, onEndCallClick }) => {
  return (
    <div>
      <div className="flex flex-col space-y-4" 
      >
        <AssistantSpeechIndicator isSpeaking={assistantIsSpeaking} />
        <VolumeLevel volume={volumeLevel} />
      </div>
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Button onClick={onEndCallClick} > End Call </Button>
      </div>
    </div>
  );
};

export default ActiveCallDetail;

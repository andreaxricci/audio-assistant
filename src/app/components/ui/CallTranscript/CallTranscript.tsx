interface CallTranscriptProps {
  finalTranscript: string;
  partialTranscript: string;
  structuredData: any;
}

export const CallTranscript: React.FC<CallTranscriptProps> = ({
  finalTranscript,
  partialTranscript,
  structuredData
}) => {
  return (
    <div className="w-full flex-grow p-4">
      <div className="flex-grow overflow-y-auto bg-white p-4 rounded shadow-md whitespace-pre-wrap">
        <p><strong>Transcript:</strong> {finalTranscript}</p>
        <p>{partialTranscript}</p>
      </div>
      {structuredData && (
        <div className="mt-4">
          <h3>Structured Data:</h3>
          <pre>{JSON.stringify(structuredData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

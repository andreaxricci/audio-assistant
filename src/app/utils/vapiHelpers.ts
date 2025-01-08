
const serverSecret = process.env.NEXT_PUBLIC_VAPI_SERVER_SECRET;

// Type definitions
interface StructuredDataResponse {
  success: boolean;
  structuredData: any;
}

export function isStructuredDataResponse(data: unknown): data is StructuredDataResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof (data as StructuredDataResponse).success === 'boolean' &&
    'structuredData' in data
  );
}

export const handleEndOfCallReport = async (
  analysis: any,
  onStructuredDataReceived: (data: any) => void
) => {
  if (!serverSecret) {
    console.error('Server secret is not defined. Cannot make API call.');
    return;
  }

  try {
    const response = await fetch('/api/webhook/structuredData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vapi-secret': serverSecret,
      },
      body: JSON.stringify({ analysis }),
    });

    const data = await response.json();
    
    if (isStructuredDataResponse(data) && data.success) {
      onStructuredDataReceived(data.structuredData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Error type checking
interface VapiError {
  message: string;
  code?: string;
}

interface IsPublicKeyMissingErrorParams {
  vapiError: VapiError;
}

export const isPublicKeyMissingError = ({ vapiError }: IsPublicKeyMissingErrorParams): boolean => {
  return vapiError?.message?.includes('public key') || vapiError?.code === 'invalid_key';
};
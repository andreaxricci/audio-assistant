export default async function handler(req: any, res: any) {
  const incomingSecret = req.headers['x-vapi-secret'];

  if (incomingSecret !== process.env.NEXT_PUBLIC_VAPI_SERVER_SECRET) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
    if (req.method === 'POST') {
      const { analysis } = req.body;
      res.status(200).json({ success: true, structuredData: analysis.structuredData });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }
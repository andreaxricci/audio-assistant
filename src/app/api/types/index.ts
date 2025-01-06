export interface ErrorResponse {
    error: string
  }
  
export interface Env {
    SUPABASE_URL: string
    SUPABASE_KEY: string
  }
  
export  interface CallRecord {
      id: number
      created_at: string
      last_visit_channel: string
      products: string
      notes: string
      customer_id: string
      customer_name: string
      city: string
    }
  
export  interface VapiToolCallFunction {
    name: string
    arguments: {
      customerName?: string
    }
  }
  
export  interface VapiToolCall {
    id: string
    type: string
    function: VapiToolCallFunction
  }
  
export  interface VapiRequestPayload {
    message: {
      timestamp: number
      type: string
      toolCalls: VapiToolCall[]
      toolCallList: VapiToolCall[]
      toolWithToolCallList: any[] 
    }
  }
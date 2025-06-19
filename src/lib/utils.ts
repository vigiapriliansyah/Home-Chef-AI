import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function to handle streaming responses from the AI API
 * @param url The URL to make the request to
 * @param body The request body
 * @param onChunk Callback function to handle each chunk of text as it arrives
 * @param onDone Callback function when the stream is complete
 * @param onError Callback function to handle errors
 * @param signal AbortSignal for cancelling the request
 */
export async function fetchEventSource(
  url: string,
  { 
    body,
    onChunk,
    onDone,
    onError,
    signal
  }: {
    body: any,
    onChunk: (chunk: string) => void,
    onDone?: () => void,
    onError?: (error: Error) => void,
    signal?: AbortSignal
  }
) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the reader from the response body stream
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        if (buffer.length > 0) {
          // Process any remaining content in the buffer
          processSSEChunks(buffer, onChunk);
        }
        onDone?.();
        break;
      }

      // Decode the chunk and add it to the buffer
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // Process SSE chunks (data: ...\n\n format)
      const processed = processSSEChunks(buffer, onChunk);
      buffer = processed.remaining;
    }
  } catch (error) {
    console.error('Error in fetchEventSource:', error);
    onError?.(error as Error);
  }
}

function processSSEChunks(buffer: string, onChunk: (chunk: string) => void): { remaining: string } {
  // Split by double newlines to get complete SSE events
  const events = buffer.split('\n\n');
  const remaining = events.pop() || ''; // Keep incomplete event in buffer
  
  for (const event of events) {
    if (event.trim()) {
      processSSEEvent(event, onChunk);
    }
  }
  
  return { remaining };
}

function processSSEEvent(event: string, onChunk: (chunk: string) => void) {
  // Handle SSE format (data: ...)
  const lines = event.split('\n');
  for (const line of lines) {
    if (line.startsWith('data:')) {
      const data = line.substring(5).trim(); // Remove 'data: ' prefix
      if (data && data !== '[DONE]') {
        processChunk(data, onChunk);
      }
    }
  }
}

function processChunk(data: string, onChunk: (chunk: string) => void) {
  try {
    // Try to parse as JSON (for serve-v2.py format)
    try {
      const jsonData = JSON.parse(data);
      // Look for text content in JSON format
      const textContent = jsonData.text || jsonData.content || jsonData.message || jsonData.response;
      
      // If we found a string, use it
      if (typeof textContent === 'string') {
        onChunk(textContent);
      } else if (typeof textContent === 'object') {
        // If it's still an object, stringify it
        onChunk(JSON.stringify(textContent));
      }
    } catch (e) {
      // If it's not valid JSON, just use the raw text (for serve-v2-improved.py format)
      const cleanData = data.trim();
      if (cleanData) {
        onChunk(cleanData);
      }
    }
  } catch (e) {
    console.error('Error processing chunk:', e);
    // Even on error, try to provide some data
    const cleanData = data.trim();
    if (cleanData) {
      onChunk(cleanData);
    }
  }
}

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
 */
export async function fetchEventSource(
  url: string,
  { 
    body,
    onChunk,
    onDone,
    onError
  }: {
    body: any,
    onChunk: (chunk: string) => void,
    onDone?: () => void,
    onError?: (error: Error) => void
  }
) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
          processChunk(buffer, onChunk);
        }
        onDone?.();
        break;
      }

      // Decode the chunk and add it to the buffer
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // Check for SSE format or raw text
      if (buffer.includes('data:')) {
        // Process as SSE format (data: {...})
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';
        
        for (const event of events) {
          processEvent(event, onChunk);
        }
      } else if (buffer.includes('\n')) {
        // Process as newline-delimited chunks
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            processChunk(line, onChunk);
          }
        }
      } else {
        // For small chunks with no delimiter, just accumulate in buffer
        // Will be processed when a delimiter is found or at the end
      }
    }
  } catch (error) {
    console.error('Error in fetchEventSource:', error);
    onError?.(error as Error);
  }
}

function processEvent(event: string, onChunk: (chunk: string) => void) {
  // Handle SSE format (data: ...)
  const lines = event.split('\n');
  for (const line of lines) {
    if (line.startsWith('data:')) {
      const data = line.substring(6).trim();
      if (data && data !== '[DONE]') {
        processChunk(data, onChunk);
      }
    }
  }
}

function processChunk(data: string, onChunk: (chunk: string) => void) {
  try {
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(data);
      // Look for text content in various common formats
      const textContent = 
        jsonData.text || 
        jsonData.content || 
        jsonData.message || 
        (jsonData.choices ? 
          (jsonData.choices[0]?.text || jsonData.choices[0]?.message?.content) : 
          undefined) ||
        jsonData;
      
      // If we found a string, use it
      if (typeof textContent === 'string') {
        onChunk(textContent);
      } else if (typeof textContent === 'object') {
        // If it's still an object, stringify it
        onChunk(JSON.stringify(textContent));
      }
    } catch (e) {
      // If it's not valid JSON, just use the raw text
      onChunk(data);
    }
  } catch (e) {
    console.error('Error processing chunk:', e);
    // Even on error, try to provide some data
    onChunk(data);
  }
}

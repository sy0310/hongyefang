import { POST } from '../app/api/chat/route';

async function test() {
  console.log('--- Testing API Route Directly ---');
  
  // Construct simulated request body
  const requestBody = {
    messages: [
      { 
        id: '1', 
        role: 'user', 
        content: '__start__',
        parts: [{ type: 'text', text: '__start__' }]
      },
      { 
        id: '2', 
        role: 'assistant', 
        content: '您好！很高兴能与您一起探索副业的可能性。我是弘业坊的AI副业孵化顾问，我们的目标是帮助您跨过从0到60分的繁琐启动阶段，直接对接优质资源，让您的副业之路更顺畅。为了更好地为您匹配合适的资源，我们先从您的意向开始。请问您目前有没有比较感兴趣的副业方向，比如实体店、电商、自媒体等等？如果暂时没有，填“暂无”也可以。',
        parts: [{ 
          type: 'text', 
          text: '您好！很高兴能与您一起探索副业的可能性。我是弘业坊的AI副业孵化顾问，我们的目标是帮助您跨过从0到60分的繁琐启动阶段，直接对接优质资源，让您的副业之路更顺畅。为了更好地为您匹配合适的资源，我们先从您的意向开始。请问您目前有没有比较感兴趣的副业方向，比如实体店、电商、自媒体等等？如果暂时没有，填“暂无”也可以。' 
        }]
      },
      { 
        id: '3', 
        role: 'user', 
        content: '实体店',
        parts: [{ type: 'text', text: '实体店' }]
      }
    ] as any[],
    collected: {}
  };

  const req = new Request('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  try {
    console.log('Sending request to POST handler...');
    const { convertToModelMessages } = await import('ai');
    const converted = await convertToModelMessages(requestBody.messages);
    console.log('Converted Model Messages:', JSON.stringify(converted, null, 2));

    const response = await POST(req);
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    // Read the stream
    const reader = response.body?.getReader();
    if (!reader) {
      console.log('No response body reader!');
      return;
    }

    const decoder = new TextDecoder();
    console.log('Reading stream chunks...');
    let done = false;
    let chunks = '';
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: !done });
        chunks += chunk;
        console.log('Chunk received:', chunk);
      }
    }
    console.log('Stream completed successfully.');
  } catch (error) {
    console.error('API Route Execution Failed:', error);
  }
}

test();

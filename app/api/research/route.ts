import { mastra } from '@/src/mastra';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return new Response('Query is required', { status: 400 });
    }

    const agent = mastra.getAgent('research-agent');

    if (!agent) {
      return new Response('Research agent not found', { status: 500 });
    }

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate research with streaming
          const result = await agent.stream([
            {
              role: 'user',
              content: `Research the following topic thoroughly: ${query}`,
            },
          ]);

          // Stream the text response
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`));
          }

          // Get the full result with tool calls
          const fullResult = await result.object;

          // Extract sources from tool calls if available
          const sources: any[] = [];
          if (fullResult.steps) {
            for (const step of fullResult.steps) {
              if (step.toolCalls) {
                for (const toolCall of step.toolCalls) {
                  if (toolCall.toolName === 'web-search' && toolCall.result?.results) {
                    for (const webResult of toolCall.result.results) {
                      sources.push({
                        title: webResult.title,
                        url: webResult.url,
                        snippet: webResult.content?.substring(0, 200),
                      });
                    }
                  }
                }
              }
            }
          }

          // Send sources at the end
          if (sources.length > 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'sources', content: sources })}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', content: 'An error occurred during research' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in research API:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

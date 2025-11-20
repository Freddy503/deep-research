import { getResearchAgent } from '@/lib/mastra-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return new Response('Query is required', { status: 400 });
    }

    const agent = getResearchAgent();

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Use generate instead of stream for better control
          const result = await agent.generate(
            [
              {
                role: 'user',
                content: `Research the following topic thoroughly: ${query}`,
              },
            ],
            {
              // Enable streaming via onStepFinish callback
              onStepFinish: async (step: any) => {
                console.log('Step finished:', step);
                // Stream any intermediate text
                if (step.text) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'text', content: step.text })}\n\n`)
                  );
                }
              },
            }
          );

          // Stream the final text result
          if (result.text) {
            // Split into words for token-by-token effect
            const words = result.text.split(' ');
            for (const word of words) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'text', content: word + ' ' })}\n\n`)
              );
              // Small delay to simulate streaming
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          }

          // Extract sources from tool calls
          const sources: any[] = [];
          if (result.toolResults) {
            for (const toolResult of result.toolResults) {
              if (toolResult.toolName === 'webSearchTool' && toolResult.result?.results) {
                for (const webResult of toolResult.result.results) {
                  sources.push({
                    title: webResult.title,
                    url: webResult.url,
                    snippet: webResult.content?.substring(0, 200),
                  });
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

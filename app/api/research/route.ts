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
          console.log('Starting research for query:', query);

          // First call - let agent use tools to gather information
          const toolResult = await agent.generate(
            [
              {
                role: 'user',
                content: `Research the following topic thoroughly: ${query}`,
              },
            ],
            {
              maxSteps: 10, // Allow multiple tool calls
            }
          );

          console.log('Tool gathering completed. Messages:', toolResult.response?.messages?.length);

          // Extract sources from tool results
          const sources: any[] = [];
          if (toolResult.toolResults) {
            for (const toolResult_ of toolResult.toolResults) {
              if (toolResult_.toolName === 'webSearchTool' && toolResult_.result?.results) {
                for (const webResult of toolResult_.result.results) {
                  sources.push({
                    title: webResult.title,
                    url: webResult.url,
                    snippet: webResult.content?.substring(0, 200),
                  });
                }
              }
            }
          }

          // Build a summary of research findings for synthesis
          let researchSummary = 'Here are the research findings:\n\n';
          if (toolResult.toolResults) {
            for (const tr of toolResult.toolResults) {
              if (tr.toolName === 'webSearchTool' && tr.result?.results) {
                for (const result of tr.result.results) {
                  researchSummary += `**${result.title}** (${result.url})\n${result.content}\n\n`;
                }
              }
            }
          }

          console.log('Generating synthesis...');

          // Second call - get text synthesis with fresh context
          const finalResult = await agent.generate([
            {
              role: 'user',
              content: `${researchSummary}\n\nBased on the research findings above, please provide a comprehensive answer to my original question: "${query}"\n\nProvide a clear, well-organized response that synthesizes the information.`,
            }
          ], {
            maxSteps: 1, // No more tool calls, just text
          });

          console.log('Synthesis completed. Text length:', finalResult.text?.length || 0);
          console.log('First 200 chars:', finalResult.text?.substring(0, 200));

          // Stream the final text result
          if (finalResult.text) {
            const words = finalResult.text.split(/(\s+)/);
            for (const word of words) {
              if (word.length > 0) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'text', content: word })}\n\n`)
                );
                await new Promise(resolve => setTimeout(resolve, 20));
              }
            }
          } else {
            console.error('No text in final result');
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', content: 'I was unable to generate a response. Please try again.' })}\n\n`)
            );
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

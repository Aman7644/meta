import { NextRequest, NextResponse } from 'next/server';
import { getAIClient, getDefaultModel, demoResponses, type Provider } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { messages, apiKey, provider, topic, modelId } = await req.json();
    const model = modelId || getDefaultModel(provider as Provider);

    if (!apiKey || provider === 'demo') {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({
        content: demoResponses.chat(topic || messages[messages.length - 1]?.content || 'this topic'),
      });
    }

    const client = getAIClient(apiKey, provider);
    if (!client) return NextResponse.json({ error: 'Invalid config' }, { status: 400 });

    const systemPrompt = `You are NeuroLearn, an expert AI tutor. You adapt to the learner's level and use the Socratic method to deepen understanding. 

Guidelines:
- Be encouraging, clear, and concise
- Use markdown formatting with bold, lists, and code blocks when helpful
- Ask follow-up questions to check understanding
- Relate concepts to real-world examples
- When explaining, go from simple to complex
- If the user seems stuck, break the concept into smaller steps
${topic ? `\nCurrent learning context: ${topic}` : ''}`;

    const completion = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    return NextResponse.json({ content: completion.choices[0].message.content });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

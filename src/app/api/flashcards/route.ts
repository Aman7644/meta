import { NextRequest, NextResponse } from 'next/server';
import { getAIClient, getDefaultModel, type Provider } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { topic, count = 8, apiKey, provider, modelId } = await req.json();
    const model = modelId || getDefaultModel(provider as Provider);

    const demoCards = Array.from({ length: count }, (_, i) => ({
      front: `Key concept #${i + 1} in ${topic}`,
      back: `This is the explanation of concept #${i + 1} in ${topic}. Understanding this helps build a stronger foundation.`,
    }));

    if (!apiKey || provider === 'demo') {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ cards: demoCards });
    }

    const client = getAIClient(apiKey, provider);
    if (!client) return NextResponse.json({ error: 'Invalid config' }, { status: 400 });

    const prompt = `Create ${count} high-quality flashcards for studying "${topic}".

Return ONLY valid JSON:
{
  "cards": [
    { "front": "Question or concept on front", "back": "Clear, concise answer or explanation" }
  ]
}

Requirements:
- Front: a clear question, term, or concept prompt
- Back: a concise but complete answer (2-4 sentences max)
- Cover diverse aspects of ${topic}
- Progress from fundamental to more advanced
- Make them genuinely useful for memorization and understanding`;

    const completion = await client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.6,
    });

    const text = completion.choices[0].message.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Parse error' }, { status: 500 });

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

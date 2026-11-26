import { NextRequest, NextResponse } from 'next/server';
import { getAIClient, getDefaultModel, type Provider } from '@/lib/ai';

const demoQuiz = (topic: string) => ({
  questions: [
    {
      question: `What is the most fundamental concept in ${topic}?`,
      options: ['The basic building block', 'A complex abstraction', 'An advanced technique', 'A theoretical construct'],
      correctIndex: 0,
      explanation: `The basic building block is the foundation of ${topic}. Everything else is built upon this core concept.`,
    },
    {
      question: `Which approach is best when learning ${topic}?`,
      options: ['Memorizing everything', 'Understanding core principles first', 'Skipping to advanced topics', 'Avoiding practice'],
      correctIndex: 1,
      explanation: 'Understanding core principles first creates a strong foundation and makes advanced concepts easier to grasp.',
    },
    {
      question: `How does ${topic} apply in real-world scenarios?`,
      options: ['It has no real-world use', 'Only in academic settings', 'In many practical applications', 'Only in research'],
      correctIndex: 2,
      explanation: `${topic} has wide-ranging practical applications across many domains and industries.`,
    },
    {
      question: `What is a common mistake when studying ${topic}?`,
      options: ['Practicing regularly', 'Seeking feedback', 'Rushing through concepts', 'Building on fundamentals'],
      correctIndex: 2,
      explanation: 'Rushing through concepts without deep understanding leads to gaps in knowledge that cause problems later.',
    },
    {
      question: `Which mindset is most effective for mastering ${topic}?`,
      options: ['Fixed mindset', 'Growth mindset', 'Avoidance mindset', 'Perfectionist mindset'],
      correctIndex: 1,
      explanation: 'A growth mindset — believing abilities can be developed through dedication — is proven to lead to better learning outcomes.',
    },
  ],
});

export async function POST(req: NextRequest) {
  try {
    const { topic, difficulty, numQuestions = 5, apiKey, provider, modelId } = await req.json();
    const model = modelId || getDefaultModel(provider as Provider);

    if (!apiKey || provider === 'demo') {
      await new Promise((r) => setTimeout(r, 1000));
      return NextResponse.json(demoQuiz(topic));
    }

    const client = getAIClient(apiKey, provider);
    if (!client) return NextResponse.json({ error: 'Invalid config' }, { status: 400 });

    const prompt = `Generate a ${difficulty || 'intermediate'} quiz about "${topic}" with exactly ${numQuestions} multiple-choice questions.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Requirements:
- Questions should test genuine understanding, not memorization
- Include one clearly correct answer and three plausible distractors
- Explanations should be educational and reinforce learning
- Vary question difficulty slightly within the ${difficulty} range
- Make questions specific to ${topic}`;

    const completion = await client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.6,
    });

    const text = completion.choices[0].message.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse quiz' }, { status: 500 });

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

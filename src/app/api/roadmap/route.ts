import { NextRequest, NextResponse } from 'next/server';
import { getAIClient, getDefaultModel, type Provider } from '@/lib/ai';

const demoRoadmap = (topic: string, goal: string) => ({
  steps: [
    { id: '1', title: `Foundations of ${topic}`, description: `Start with the absolute basics of ${topic}. Understand the core concepts, terminology, and why this matters.`, resources: ['Official documentation', 'Beginner YouTube tutorials', 'Introductory articles'], status: 'completed', estimatedTime: '1-2 weeks' },
    { id: '2', title: 'Core Concepts Deep Dive', description: 'Explore the fundamental principles in depth. Practice with hands-on exercises and small projects.', resources: ['Interactive exercises', 'Practice problems', 'Community forums'], status: 'active', estimatedTime: '2-3 weeks' },
    { id: '3', title: 'Intermediate Skills', description: 'Build on your foundation with more complex topics. Start working on real projects.', resources: ['Project-based tutorials', 'Intermediate courses', 'Code reviews'], status: 'locked', estimatedTime: '3-4 weeks' },
    { id: '4', title: 'Advanced Techniques', description: 'Master advanced patterns, optimizations, and best practices used by professionals.', resources: ['Advanced books', 'Technical papers', 'Expert blogs'], status: 'locked', estimatedTime: '4-6 weeks' },
    { id: '5', title: `Achieve: ${goal}`, description: 'Apply everything you have learned to achieve your specific goal. Build a portfolio project.', resources: ['Portfolio projects', 'Job boards', 'Networking communities'], status: 'locked', estimatedTime: '2-4 weeks' },
  ],
});

export async function POST(req: NextRequest) {
  try {
    const { topic, goal, currentLevel, apiKey, provider, modelId } = await req.json();
    const model = modelId || getDefaultModel(provider as Provider);

    if (!apiKey || provider === 'demo') {
      await new Promise((r) => setTimeout(r, 1200));
      return NextResponse.json(demoRoadmap(topic, goal));
    }

    const client = getAIClient(apiKey, provider);
    if (!client) return NextResponse.json({ error: 'Invalid config' }, { status: 400 });

    const prompt = `Create a personalized learning roadmap for someone who wants to learn "${topic}" with the goal: "${goal}". Their current level is: ${currentLevel || 'beginner'}.

Return ONLY valid JSON in this exact format:
{
  "steps": [
    {
      "id": "1",
      "title": "Step title",
      "description": "Detailed description of what to learn and do in this step",
      "resources": ["Resource 1", "Resource 2", "Resource 3"],
      "status": "completed",
      "estimatedTime": "1-2 weeks"
    }
  ]
}

Rules:
- Create 6-8 progressive steps from their current level to their goal
- First step should be "completed" (already done basics), second "active", rest "locked"
- Each step should build meaningfully on the previous
- Resources should be specific and actionable
- Make it truly personalized to the "${topic}" topic and "${goal}" goal
- Estimated times should be realistic`;

    const completion = await client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
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

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_INSTRUCTION = `
You are an expert survey analyst.
Analyze the following responses and provide structured insights with percentage breakdowns.
Output language: Simplified Chinese.
Format with markdown headings, bullet points, and bold text.
Each theme/category MUST include an estimated percentage (sum to 100%).
Example: "### 薪酬福利 (占比 45%)"
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, answers } = req.body;

  if (!question || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'question and answers array are required' });
  }

  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'MINIMAX_API_KEY not configured' });
  }

  try {
    const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'MiniMax-M2',
        max_tokens: 32000,
        thinking: { type: "disabled" },
        system: SYSTEM_INSTRUCTION,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: `Analyze the following ${answers.length} responses to the question: "${question}"\n\nRespond in Chinese. Provide percentage breakdowns for each theme.\n\n${answers.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}`
              }
            ]
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `API error: ${response.status} - ${errorText}` });
    }

    const data = await response.json();

    if (data.error) {
      return res.status(401).json({ error: data.error.message || 'API authentication error' });
    }

    let text = '';
    if (data.content && Array.isArray(data.content)) {
      const textContent = data.content.find((block: any) => block.type === 'text');
      text = textContent?.text || '';
    } else if (typeof data.content === 'string') {
      text = data.content;
    } else if (data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    } else if (data.text) {
      text = data.text;
    }

    if (!text) {
      return res.status(500).json({ error: 'No text content in AI response' });
    }

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('MiniMax API error:', error);
    return res.status(500).json({ error: error.message || 'Analysis failed' });
  }
}

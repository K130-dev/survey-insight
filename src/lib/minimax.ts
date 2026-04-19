export interface SummarizeResult {
  text: string;
}

export async function summarizeTextStream(
  question: string,
  answers: string[],
  onChunk: (text: string) => void
): Promise<void> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answers }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  // For streaming, we accumulate the full response and stream it
  const data = await response.json();

  if (!data.text) {
    throw new Error('No summary generated');
  }

  // Simulate streaming by yielding chunks
  const words = data.text.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 20));
    onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
  }
}

export async function summarizeText(question: string, answers: string[]): Promise<string> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answers }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.text) {
    throw new Error('No summary generated');
  }

  return data.text;
}

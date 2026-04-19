# MiniMax API Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Google Gemini API with MiniMax API for text summarization in the survey analysis tool.

**Architecture:** A new Vercel serverless API endpoint (`/api/summarize`) acts as a proxy, protecting the MiniMax API key on the server side. The frontend calls this internal API instead of calling Gemini directly. This follows the same pattern as the sql-prism reference project.

**Tech Stack:** React 19, Vite 6, Tailwind CSS, Vercel Functions, MiniMax Anthropic-compatible API

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `api/summarize.ts` | Create | Serverless proxy to MiniMax API |
| `src/lib/minimax.ts` | Create | Frontend wrapper calling `/api/summarize` |
| `src/lib/gemini.ts` | Delete | Removed (was direct Gemini client) |
| `src/components/analysis/TextSummary.tsx` | Modify | Swap `gemini` import to `minimax` |
| `.env.example` | Modify | Update with MiniMax env vars |
| `package.json` | Modify | Remove `@google/genai` dependency |
| `vite.config.ts` | Modify | Add Vercel adapter for API routes |

---

## Tasks

### Task 1: Remove `@google/genai` dependency

**Files:**
- Modify: `package.json`
- Modify: `.env.example`

- [ ] **Step 1: Remove `@google/genai` from package.json**

Edit `package.json` to remove the line `"@google/genai": "^1.29.0"` from dependencies.

- [ ] **Step 2: Update .env.example for MiniMax**

Replace the contents of `.env.example`:

```env
# MiniMax API Key (get from https://platform.minimaxi.com/)
MINIMAX_API_KEY=your-api-key-here

# Optional: App URL for callbacks
APP_URL=http://localhost:3000
```

- [ ] **Step 3: Remove node_modules and reinstall**

Run: `rm -rf node_modules package-lock.json && npm install`
Expected: Clean install without `@google/genai`

- [ ] **Step 4: Commit**

```bash
git add package.json .env.example
git commit -m "chore: remove @google/genai, update env for MiniMax"
```

---

### Task 2: Create Vercel API proxy endpoint

**Files:**
- Create: `api/summarize.ts`
- Modify: `vercel.json` (create if missing)

- [ ] **Step 1: Create api/summarize.ts**

```typescript
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
```

- [ ] **Step 2: Create vercel.json**

```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ]
}
```

Note: Vercel automatically detects `api/` directory as serverless functions.

- [ ] **Step 3: Commit**

```bash
git add api/summarize.ts vercel.json
git commit -m "feat: add MiniMax API proxy endpoint /api/summarize"
```

---

### Task 3: Create MiniMax client library

**Files:**
- Create: `src/lib/minimax.ts`

- [ ] **Step 1: Create src/lib/minimax.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/minimax.ts
git commit -m "feat: create MiniMax client library"
```

---

### Task 4: Update TextSummary to use MiniMax

**Files:**
- Modify: `src/components/analysis/TextSummary.tsx`

- [ ] **Step 1: Change import from gemini to minimax**

Find line 3:
```typescript
import { summarizeTextStream } from '@/lib/gemini';
```

Replace with:
```typescript
import { summarizeTextStream } from '@/lib/minimax';
```

- [ ] **Step 2: Change button text from "使用 Gemini 分析" to "使用 MiniMax 分析"**

Find the button text around line 146:
```typescript
使用 Gemini 分析
```

Replace with:
```typescript
使用 MiniMax 分析
```

- [ ] **Step 3: Commit**

```bash
git add src/components/analysis/TextSummary.tsx
git commit -m "feat: switch TextSummary to use MiniMax API"
```

---

### Task 5: Delete old gemini.ts file

**Files:**
- Delete: `src/lib/gemini.ts`

- [ ] **Step 1: Delete src/lib/gemini.ts**

```bash
rm src/lib/gemini.ts
```

- [ ] **Step 2: Commit**

```bash
git rm src/lib/gemini.ts
git commit -m "chore: remove deprecated Gemini client"
```

---

### Task 6: Local testing

**Files:**
- None (testing only)

- [ ] **Step 1: Create .env file with dummy key for local testing**

Create `.env` file:
```env
MINIMAX_API_KEY=test-key-for-local
```

Note: The API call will fail with a dummy key, but the frontend should show proper error handling.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`
Expected: Server starts on port 3000

- [ ] **Step 3: Test error handling**

Navigate to http://localhost:3000, upload a sample CSV, go through column mapping, and try the AI summary.
Expected: Should show "MINIMAX_API_KEY not configured" error (not a crash)

- [ ] **Step 4: Verify no Gemini references remain**

Run: `grep -r "gemini" src/ --include="*.ts" --include="*.tsx"`
Expected: No matches

- [ ] **Step 5: Clean up and commit**

Remove `.env` file, then commit any remaining changes.

```bash
git add -A && git commit -m "test: verify error handling works correctly"
```

---

### Task 7: Deploy to Vercel

**Files:**
- None (deployment)

- [ ] **Step 1: Push branch to remote**

```bash
git push -u origin minimax-api
```

- [ ] **Step 2: Deploy via Vercel**

Use the Vercel deploy skill or run `vercel --prod` to deploy the `minimax-api` branch.

- [ ] **Step 3: Add MINIMAX_API_KEY environment variable in Vercel dashboard**

1. Go to Vercel project settings → Environment Variables
2. Add `MINIMAX_API_KEY` with your actual MiniMax API key
3. Redeploy if needed

- [ ] **Step 4: Verify deployment**

1. Open the Vercel deployment URL
2. Complete the full flow: upload CSV → map columns → view dashboard → test AI summary
3. Verify the MiniMax analysis works end-to-end

---

## Verification Checklist

After Task 7, verify:
- [ ] No `@google/genai` in package.json or node_modules
- [ ] `/api/summarize` endpoint exists and works
- [ ] Frontend calls `/api/summarize` (not external Gemini)
- [ ] `src/lib/gemini.ts` is deleted
- [ ] MiniMax API key is only in Vercel env vars (not exposed to client)
- [ ] Error messages display properly when API is unavailable
- [ ] Full user flow works in production
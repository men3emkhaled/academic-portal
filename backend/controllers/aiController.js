let xss;
try {
  xss = require('xss');
} catch {
  xss = (s) => s.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

const OLLAMA_MODEL = 'qwen3-vl:4b';
const OLLAMA_HOSTS = process.env.OLLAMA_HOST
  ? [process.env.OLLAMA_HOST]
  : ['http://127.0.0.1:11434', 'http://localhost:11434', 'http://host.docker.internal:11434'];

const systemPrompt = `أنت مساعد ذكي لطلاب جامعة الزقازيق اسمك ZAG AI.
تعليمات اللهجة والسرعة:
1. اللهجة: كلم المستخدم دايماً بالعامية المصرية الودودة (مثل: "كله تمام يا صديقي"، "يا باشا"، "عامل إيه").
2. تجنب التأليف: لا تخترع كلمات غير مصرية (تجنب "ماه دي" أو "جاي ليش").
3. للرد على التحية (عامل ايه/ازيك): رد فوراً بـ "الحمد لله يا صديقي كله تمام، أنت عامل ايه؟ أقدر أساعدك بإيه النهاردة؟"
4. إذا كتب المستخدم بالإنجليزي، رد بالإنجليزي.
5. للأسئلة البسيطة والتحية، قلل التفكير جداً وجاوب فوراً باختصار.`;

const buildOllamaMessages = (messages) => {
  if (OLLAMA_MODEL.toLowerCase().includes('internvl')) {
    const last = messages[messages.length - 1];
    return [{ role: 'user', content: `${systemPrompt}\n\n${last.content}` }];
  }
  return [{ role: 'system', content: systemPrompt }, ...messages];
};

const extractThinking = (content) => {
  let thinking = '';
  let clean = content;
  const match = clean.match(/<think>([\s\S]*?)<\/think>/i);
  if (match) {
    thinking = match[1].trim();
    clean = clean.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }
  return { response: clean, thinking };
};

const getRealResponse = async (messages) => {
  let lastError;
  for (const baseUrl of OLLAMA_HOSTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 120000);
      const res = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`Ollama returned ${res.status}`);
      const data = await res.json();
      const { response, thinking } = extractThinking(data.message?.content || '');
      const modelThinking = data.message?.thinking || '';
      return { response, thinking: modelThinking || thinking };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('All Ollama hosts failed');
};

const chat = async (req, res) => {
  try {
    let { message, messages } = req.body;
    if ((!message && !messages) || !messages?.length && !message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const ollamaMessages = buildOllamaMessages(
      messages || [{ role: 'user', content: message }]
    );
    const result = await getRealResponse(ollamaMessages);
    res.json(result);
  } catch (error) {
    console.error('Error in AI chat:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const chatStream = async (req, res) => {
  try {
    let { message, messages } = req.body;
    if ((!message && !messages) || !messages?.length && !message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const ollamaMessages = buildOllamaMessages(
      messages || [{ role: 'user', content: message }]
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let lastError;
    let usedHost = false;

    for (const baseUrl of OLLAMA_HOSTS) {
      if (usedHost) break;
      try {
        const controller = new AbortController();
        req.on('close', () => controller.abort());

        const ollamaRes = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({ model: OLLAMA_MODEL, messages: ollamaMessages, stream: true }),
        });

        if (!ollamaRes.ok) throw new Error(`Ollama returned ${ollamaRes.status}`);

        usedHost = true;
        let fullContent = '';
        let fullThinking = '';
        let insideThink = false;
        const reader = ollamaRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!part.trim()) continue;
            let json;
            try { json = JSON.parse(part); } catch { continue; }

            const contentToken = json.message?.content || '';
            const thinkingToken = json.message?.thinking || '';

            if (thinkingToken) {
              fullThinking += thinkingToken;
              res.write(`data: ${JSON.stringify({ thinking: thinkingToken })}\n\n`);
            }

            if (!contentToken) continue;

            let toSend = '';
            let remaining = contentToken;

            while (remaining.length > 0) {
              if (insideThink) {
                const end = remaining.indexOf('</think>');
                if (end !== -1) {
                  insideThink = false;
                  remaining = remaining.slice(end + '</think>'.length);
                } else {
                  remaining = '';
                }
              } else {
                const start = remaining.indexOf('<think>');
                if (start !== -1) {
                  toSend += remaining.slice(0, start);
                  insideThink = true;
                  remaining = remaining.slice(start + '<think>'.length);
                } else {
                  toSend += remaining;
                  remaining = '';
                }
              }
            }

            if (toSend) {
              fullContent += toSend;
              res.write(`data: ${JSON.stringify({ token: toSend })}\n\n`);
            }
          }
        }

        const { response, thinking } = extractThinking(fullContent);
        res.write(`data: ${JSON.stringify({ done: true, response, thinking: fullThinking || thinking })}\n\n`);
        res.end();
        return;
      } catch (err) {
        lastError = err;
        console.error('Stream error on host:', err.message);
      }
    }
    if (!res.headersSent) {
      res.status(500).json({ error: lastError?.message || 'All Ollama hosts failed' });
    } else {
      res.write(`data: ${JSON.stringify({ error: lastError?.message || 'Failed' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('Error in AI stream:', error.message);
    if (!res.headersSent) res.status(500).json({ error: error.message });
    else { res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`); res.end(); }
  }
};

const listModels = async (req, res) => {
  try {
    for (const baseUrl of OLLAMA_HOSTS) {
      try {
        const ollamaRes = await fetch(`${baseUrl}/api/tags`);
        if (ollamaRes.ok) {
          const data = await ollamaRes.json();
          return res.json(data.models?.map(m => ({ name: m.name, size: m.size })) || []);
        }
      } catch {}
    }
    res.json([]);
  } catch {
    res.json([]);
  }
};

module.exports = { chat, chatStream, listModels };

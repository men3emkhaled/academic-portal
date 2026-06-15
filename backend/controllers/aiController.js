const xss = require('xss');
const { spawn } = require('child_process');
const path = require('path');

// Toggle this when the model is trained
// false = mock echo, true = calls Python inference server
const USE_REAL_MODEL = false;
const INFERENCE_PORT = 5001;

const mockResponse = (message) => {
  const isAr = /[\u0600-\u06FF]/.test(message);
  if (isAr) {
    return `مرحباً! أنا Zag AI. تلقيت رسالتك: "${message}". النموذج قيد التدريب حاليًا وسيقدم إجابات ذكية قريباً.`;
  }
  return `Hello! I'm Zag AI. You said: "${message}". The model is currently being trained and will provide intelligent responses soon.`;
};

const getRealResponse = (message) => {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [
      path.join(__dirname, '../../ai-model-train/inference.py'),
      '--message', message,
    ]);

    let output = '';
    let error = '';

    py.stdout.on('data', (data) => { output += data.toString(); });
    py.stderr.on('data', (data) => { error += data.toString(); });

    py.on('close', (code) => {
      if (code !== 0 || error) {
        console.error('Inference error:', error);
        reject(new Error('Model inference failed'));
      } else {
        resolve(output.trim());
      }
    });

    py.on('error', (err) => {
      console.error('Failed to start inference:', err);
      reject(err);
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      py.kill();
      reject(new Error('Inference timed out'));
    }, 30000);
  });
};

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const sanitizedMessage = xss(message.trim());

    let response;
    if (USE_REAL_MODEL) {
      response = await getRealResponse(sanitizedMessage);
    } else {
      response = mockResponse(sanitizedMessage);
    }

    res.json({ response });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { chat };

const express = require('express');
const multer = require('multer');
const router = express.Router();

// Setup Multer to store the uploaded image temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/ocr/scan
router.post('/scan', upload.single('noteImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file.' });
    }

    // 1. Clean the API key (removes accidental quotes or spaces from your .env file)
    const apiKey = (process.env.GEMINI_API_KEY || '').replace(/['"]/g, '').trim();

    console.log("[Backend] Connecting to Google...");

    // ---------------------------------------------------------
    // 2. AUTO-DISCOVERY: Ask Google what models you can use
    // ---------------------------------------------------------
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (!listResponse.ok || !listData.models) {
      console.error("[Backend] API Key Error:", listData);
      return res.status(401).json({ message: 'Invalid API Key or Google API is down.', error: listData });
    }

    // Find models that are Gemini and support generation
    const validModels = listData.models.filter(m => 
      m.name.includes("gemini") && 
      m.supportedGenerationMethods.includes("generateContent")
    );

    if (validModels.length === 0) {
      return res.status(403).json({ message: 'Your API key does not have access to any Gemini models.' });
    }

    // Pick the best available model (Prefer 1.5 flash, otherwise take whatever works)
    const workingModel = validModels.find(m => m.name.includes("1.5-flash")) || validModels[0];
    console.log(`[Backend] Auto-discovered working model: ${workingModel.name}`);

    // ---------------------------------------------------------
    // 3. BUILD & SEND THE OCR REQUEST
    // ---------------------------------------------------------
    const jsonPayload = {
      contents: [{
        parts: [
          { text: "Read all the handwritten or printed text in this image. Return ONLY the extracted text. Keep the formatting as close to the original as possible. If it is completely unreadable, reply 'Could not read handwriting.'" },
          {
            inlineData: {
              mimeType: req.file.mimetype,
              data: req.file.buffer.toString("base64") 
            }
          }
        ]
      }]
    };

    // Use the exact model name Google just told us is valid for your key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${workingModel.name}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Backend] Google API Rejected Request:", data.error);
      return res.status(response.status).json({ 
        message: 'Google API rejected the request', 
        error: data.error?.message 
      });
    }

    const extractedText = data.candidates[0].content.parts[0].text;
    console.log("[Backend] Handwriting extraction successful!");

    // Send it back to the frontend
    res.json({ extractedText: extractedText });

  } catch (error) {
    console.error("OCR Request Error:", error);
    res.status(500).json({ message: 'Failed to process image.', error: error.message });
  }
});

module.exports = router;
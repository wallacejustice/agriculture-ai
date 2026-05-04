require('dotenv').config();
console.log('�� Key first 15 chars:', process.env.GEMINI_API_KEY?.substring(0, 15));
console.log('🔑 Key length:', process.env.GEMINI_API_KEY?.length);

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.length < 30) {
  console.error('❌ KEY MISSING or TOO SHORT! Check backend/.env');
  process.exit(1);
}

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

model.generateContent("Why is maize yellow?")
  .then(result => {
    console.log('✅ SUCCESS!');
    console.log('Response:', result.response.text().substring(0, 80) + '...');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ FAILED:', error.message);
    if (error.message.includes('403')) {
      console.error('👉 ACTION: Enable billing at https://console.cloud.google.com/billing');
    }
    process.exit(1);
  });

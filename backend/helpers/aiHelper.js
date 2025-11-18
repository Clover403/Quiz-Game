const axios = require('axios');
require('dotenv').config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'gpt-3.5-turbo';

/**
 * Generate quiz questions menggunakan AI (OpenAI)
 * @param {object} params - Parameter untuk generate questions
 * @param {string} params.category - Kategori quiz (Science, History, Pop Culture, dll)
 * @param {string} params.difficulty - Difficulty level (easy, medium, hard)
 * @param {number} params.numberOfQuestions - Jumlah pertanyaan yang ingin digenerate
 * @returns {Promise<Array>} Array of questions
 */
const generateQuestions = async ({ category, difficulty, numberOfQuestions = 5 }) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    const prompt = `Generate ${numberOfQuestions} multiple choice quiz questions about ${category} with ${difficulty} difficulty level.

For each question, provide:
1. The question text
2. Four answer options (A, B, C, D)
3. The correct answer (A, B, C, or D)
4. Points value (easy: 100, medium: 200, hard: 300)
5. Time limit in seconds (easy: 30, medium: 45, hard: 60)

Return the response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "points": 100,
    "timeLimit": 30
  }
]

Only return the JSON array, no additional text.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: AI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a quiz question generator. Generate high-quality, accurate quiz questions in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Parse JSON response
    let questions;
    try {
      // Coba parse langsung
      questions = JSON.parse(content);
    } catch (e) {
      // Jika gagal, coba extract JSON dari markdown code block
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    return questions;
  } catch (error) {
    console.error('Error generating questions with AI:', error.message);
    
    // Fallback: return dummy questions jika AI gagal
    return generateFallbackQuestions(category, difficulty, numberOfQuestions);
  }
};

/**
 * Generate fallback questions jika AI tidak tersedia
 */
const generateFallbackQuestions = (category, difficulty, numberOfQuestions) => {
  const pointsMap = { easy: 100, medium: 200, hard: 300 };
  const timeLimitMap = { easy: 30, medium: 45, hard: 60 };
  
  const questions = [];
  
  for (let i = 0; i < numberOfQuestions; i++) {
    questions.push({
      question: `Sample ${category} question ${i + 1} (${difficulty} level)?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'A',
      points: pointsMap[difficulty] || 100,
      timeLimit: timeLimitMap[difficulty] || 30
    });
  }
  
  return questions;
};

/**
 * Validate generated questions
 */
const validateQuestions = (questions) => {
  if (!Array.isArray(questions)) {
    return false;
  }
  
  return questions.every(q => {
    return (
      q.question &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.correctAnswer &&
      ['A', 'B', 'C', 'D'].includes(q.correctAnswer) &&
      typeof q.points === 'number' &&
      typeof q.timeLimit === 'number'
    );
  });
};

module.exports = {
  generateQuestions,
  validateQuestions
};

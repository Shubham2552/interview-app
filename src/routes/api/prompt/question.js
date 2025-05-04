import express from 'express';
import axios from 'axios';

const router = express.Router();

// OpenAI API key
const OPENAI_API_KEY = '1234567890abcdef1234567890abcdef12345678';

// Route to handle the prompt and get the answer
router.post('/question', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    setTimeout(async () => {
        try {
            const response = await axios.post(
                'https://api.openai.com/v1/completions',
                {
                    model: 'text-davinci-003', // Specify the model you want to use
                    prompt: 'This is a dummy prompt for testing purposes.', // Dummy prompt
                    max_tokens: 100, // Adjust the token limit as needed
                    temperature: 0.7, // Adjust the creativity level as needed
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                    },
                }
            );

            res.json({ answer: response.data.choices[0].text.trim() });
        } catch (error) {
            console.error('Error calling OpenAI API:', error.message);
            res.status(500).json({ error: 'Failed to fetch response from OpenAI API' });
        }
    }, 2000); // Delay of 2 seconds
});

export default router;
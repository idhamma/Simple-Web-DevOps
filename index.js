const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 4000;

// URL layanan mikro (dalam Kubernetes, ini akan menjadi nama service, misal: 'http://result-service')
const RESULT_SERVICE_URL = 'http://localhost:4003/results';
const VOTE_SERVICE_URL = 'http://localhost:4002/vote';

app.use(cors()); // Mengizinkan cross-origin requests

// Meneruskan request untuk mendapatkan hasil
app.get('/results', async (req, res) => {
    try {
        const response = await axios.get(RESULT_SERVICE_URL);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghubungi Result Service' });
    }
});

// Meneruskan request untuk vote
app.post('/vote/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.post(`${VOTE_SERVICE_URL}/${id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghubungi Vote Service' });
    }
});

app.listen(PORT, () => {
    console.log(`API Gateway berjalan di http://localhost:${PORT}`);
});
const express = require('express');
const cors = require('cors');
const fetch = require('cross-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const ACCESS_KEY = '0e90e287-1f58-4bbf-865c452c8a71-c2fd-4bf2';
const STORAGE_HOST = 'br.storage.bunnycdn.com';

app.get('/list', async (req, res) => {
  try {
    const folder = req.query.folder;
    if (!folder) return res.status(400).json({ error: 'Parâmetro folder é obrigatório' });

    const url = `https://${STORAGE_HOST}/${folder}`;

    const response = await fetch(url, {
      headers: { AccessKey: ACCESS_KEY }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao listar arquivos' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy rodando em http://localhost:${PORT}`));

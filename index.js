const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const STORAGE_ZONE = 'fotossite';
const API_KEY = '0e90e287-1f58-4bbf-865c452c8a71-c2fd-4bf2';
const BUNNY_URL = 'https://br.storage.bunnycdn.com';

app.use(cors());

app.get('/files', async (req, res) => {
  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  const fullUrl = `${BUNNY_URL}/${STORAGE_ZONE}/${path}`;
  try {
    const response = await fetch(fullUrl, {
      headers: {
        AccessKey: API_KEY,
        accept: 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Bunny API returned ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar arquivos.' });
  }
});

app.get('/download', async (req, res) => {
  const { path } = req.query;
  if (!path) return res.status(400).send('Missing path');

  const downloadUrl = `${BUNNY_URL}/${STORAGE_ZONE}/${path}`;
  try {
    const response = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        AccessKey: API_KEY
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('Erro no download');
    }

    const fileName = path.split('/').pop();
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Erro ao baixar arquivo');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});

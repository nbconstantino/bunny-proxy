const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;
const BUNNY_STORAGE_ZONE = 'fotossite';
const BUNNY_STORAGE_API = `https://br.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}`;
const BUNNY_ACCESS_KEY = '0e90e287-1f58-4bbf-865c452c8a71-c2fd-4bf2'; // SUA CHAVE

// Rota para listar arquivos em uma pasta
app.get('/list', async (req, res) => {
  const path = req.query.path || '';
  try {
    const response = await axios.get(`${BUNNY_STORAGE_API}/${path}`, {
      headers: {
        AccessKey: BUNNY_ACCESS_KEY
      }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Erro ao listar arquivos:', err.message);
    res.status(500).json({ error: 'Erro ao listar arquivos' });
  }
});

// Rota para baixar um arquivo
app.get('/download', async (req, res) => {
  const path = req.query.path;
  if (!path) return res.status(400).json({ error: 'Parâmetro "path" é obrigatório' });

  try {
    const fileUrl = `${BUNNY_STORAGE_API}/${path}`;
    const fileResponse = await axios.get(fileUrl, {
      responseType: 'stream',
      headers: {
        AccessKey: BUNNY_ACCESS_KEY
      }
    });

    res.setHeader('Content-Disposition', `attachment; filename="${path.split('/').pop()}"`);
    fileResponse.data.pipe(res);
  } catch (err) {
    console.error('Erro ao baixar arquivo:', err.message);
    res.status(500).json({ error: 'Erro ao baixar arquivo' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});

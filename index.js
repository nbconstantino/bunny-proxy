import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

const STORAGE_ZONE = 'fotossite';
const API_KEY = '0e90e287-1f58-4bbf-865c452c8a71-c2fd-4bf2';
const HOSTNAME = 'br.storage.bunnycdn.com';

app.use(cors());

// Listagem de arquivos em uma pasta
app.get('/list', async (req, res) => {
  try {
    const path = req.query.path || '';
    if (!path) return res.status(400).json({ error: 'Parâmetro path é obrigatório' });

    const normalizedPath = path.endsWith('/') ? path : path + '/';
    const url = `https://${HOSTNAME}/${STORAGE_ZONE}/${normalizedPath}`;

    const response = await fetch(url, {
      headers: {
        AccessKey: API_KEY,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Erro ao listar arquivos', details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
  }
});

// Proxy de download autenticado
app.get('/download', async (req, res) => {
  const path = req.query.path;
  if (!path) return res.status(400).json({ error: 'Parâmetro path é obrigatório' });

  const url = `https://${HOSTNAME}/${STORAGE_ZONE}/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        AccessKey: API_KEY
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    // Repassa o tipo de conteúdo e força o download
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${decodeURIComponent(path.split('/').pop())}"`);

    // Faz streaming do conteúdo direto para o navegador
    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao baixar o arquivo', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});

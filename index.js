const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;

// Configurações da sua Storage Zone
const STORAGE_ZONE_NAME = 'fotossite';
const STORAGE_HOSTNAME = 'br.storage.bunnycdn.com';
const ACCESS_KEY = '0e90e287-1f58-4bbf-865c452c8a71-c2fd-4bf2';

// Rota raiz só para teste simples
app.get('/', (req, res) => {
  res.send('Proxy Bunny CDN ativo');
});

// Rota para listar arquivos em uma pasta
// Exemplo: /list?path=Fprodutos
app.get('/list', async (req, res) => {
  try {
    const folderPath = req.query.path;
    if (!folderPath) {
      return res.status(400).json({ error: 'Parâmetro "path" é obrigatório' });
    }

    // Monta a URL para listar os arquivos
    // Exemplo: https://br.storage.bunnycdn.com/fotossite/Fprodutos
    const url = `https://${STORAGE_HOSTNAME}/${STORAGE_ZONE_NAME}/${folderPath}`;

    const response = await fetch(url, {
      headers: {
        AccessKey: ACCESS_KEY,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Erro ao listar arquivos: ${text}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para download de arquivo específico
// Exemplo: /download?path=Fprodutos/arquivo.jpg
app.get('/download', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).send('Parâmetro "path" é obrigatório');
  }

  // Redireciona para a URL direta do arquivo na storage zone
  // A Bunny CDN permite acesso público a esses arquivos via URL direta
  const url = `https://${STORAGE_HOSTNAME}/${STORAGE_ZONE_NAME}/${filePath}`;
  res.redirect(url);
});

app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});

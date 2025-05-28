const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const BUNNY_STORAGE_API = 'https://br.storage.bunnycdn.com/fotossite';
const BUNNY_ACCESS_KEY = '0e90e287-1f58-4bbf-865c452c8a71-c2fd-4bf2';

app.get('/list', async (req, res) => {
  const path = req.query.path || '';
  try {
    const encodedPath = encodeURI(path); // importante para espaços e caracteres especiais
    const response = await axios.get(`${BUNNY_STORAGE_API}/${encodedPath}`, {
      headers: { AccessKey: BUNNY_ACCESS_KEY }
    });
    res.json(response.data);
  } catch (err) {
    console.error('Erro ao listar arquivos:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.get('/download', async (req, res) => {
  const path = req.query.path || '';
  try {
    const encodedPath = encodeURI(path);
    const url = `${BUNNY_STORAGE_API}/${encodedPath}`;
    // Redireciona para o arquivo com a AccessKey no header
    // Bunny Storage não suporta AccessKey via query param, então proxy é necessário para ocultar a chave
    const response = await axios({
      url,
      method: 'GET',
      headers: { AccessKey: BUNNY_ACCESS_KEY },
      responseType: 'stream'
    });
    res.setHeader('Content-Disposition', `attachment; filename="${path.split('/').pop()}"`);
    response.data.pipe(res);
  } catch (err) {
    console.error('Erro ao baixar arquivo:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});

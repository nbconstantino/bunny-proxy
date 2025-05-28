import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 10000;

const STORAGE_ZONE = 'fotossite';
const API_KEY = '0e90e287-1f58-4bbf-865c452c8a71-c2fd-4bf2'; // sua read-only key
const HOSTNAME = 'br.storage.bunnycdn.com';

app.use(cors());

app.get('/list', async (req, res) => {
  try {
    const path = req.query.path || '';
    if (!path) return res.status(400).json({ error: 'Parâmetro path é obrigatório' });

    // Monta URL da Bunny Storage para listar arquivos na pasta
    const url = `https://${HOSTNAME}/${STORAGE_ZONE}/${path}`;

    // Faz a requisição para Bunny Storage
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

app.get('/download', (req, res) => {
  const path = req.query.path;
  if (!path) return res.status(400).json({ error: 'Parâmetro path é obrigatório' });

  const url = `https://${HOSTNAME}/${STORAGE_ZONE}/${path}`;

  // Redireciona para URL direta da Bunny Storage (ou pode implementar streaming se quiser)
  res.redirect(url);
});

app.listen(PORT, () => {
  console.log(`Proxy rodando na porta ${PORT}`);
});

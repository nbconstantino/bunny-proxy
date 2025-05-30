import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

const STORAGE_ZONE = 'fotossite';
const API_KEY = '0e90e287-1f58-4bbf-865c452c8a71-c2fd-4bf2';
const HOSTNAME = 'br.storage.bunnycdn.com';

app.use(cors());

// Função recursiva para listar arquivos de subpastas
async function listarArquivos(path) {
  const url = `https://${HOSTNAME}/${STORAGE_ZONE}/${path}`;
  const response = await fetch(url, {
    headers: {
      AccessKey: API_KEY,
      Accept: 'application/json'
    }
  });

  if (!response.ok) throw new Error(`Erro ao acessar ${path}: ${await response.text()}`);

  const arquivos = await response.json();
  let todos = [];

  for (const item of arquivos) {
    if (item.IsDirectory) {
      const subPath = `${path}/${item.ObjectName}`;
      const subArquivos = await listarArquivos(subPath);
      todos = todos.concat(subArquivos);
    } else {
      todos.push({ ...item, fullPath: `${path}/${item.ObjectName}` });
    }
  }

  return todos;
}

// Endpoint de listagem
app.get('/list', async (req, res) => {
  try {
    const path = req.query.path;
    const term = (req.query.term || '').toLowerCase();
    const type = req.query.type;

    if (!path) return res.status(400).json({ error: 'Path é obrigatório' });

    const arquivos = await listarArquivos(path);
    const filtrados = arquivos.filter(file =>
      file.ObjectName.toLowerCase().includes(term) &&
      (!type || file.ObjectName.toLowerCase().endsWith(type))
    );

    res.json(filtrados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint de download autenticado
app.get('/download', async (req, res) => {
  const path = req.query.path;
  if (!path) return res.status(400).json({ error: 'Path é obrigatório' });

  const url = `https://${HOSTNAME}/${STORAGE_ZONE}/${path}`;
  const response = await fetch(url, { headers: { AccessKey: API_KEY } });

  if (!response.ok) return res.status(response.status).send(await response.text());

  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${decodeURIComponent(path.split('/').pop())}"`);
  response.body.pipe(res);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'citysave'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados.');
});

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

const cache = {};

async function fetchCityCosts(city, country = 'Brazil') {
  const cacheKey = `${city.toLowerCase()}-${country.toLowerCase()}`;
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < 3600000) {
    return cache[cacheKey].data;
  }

  const options = {
    method: 'GET',
    url: 'https://cost-of-living-and-prices.p.rapidapi.com/prices',
    params: {
      city_name: city,
      country_name: country
    },
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST
    }
  };

  try {
    const response = await axios.request(options);
    if (response.data.error) {
      throw new Error(`Cidade não encontrada: ${city}`);
    }

    const prices = response.data.prices;
    cache[cacheKey] = { data: prices, timestamp: Date.now() };
    return prices;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Limite de requisições da API atingido. Tente novamente mais tarde.');
    }
    throw new Error(error.message || `Erro ao buscar dados de ${city}`);
  }
}

function extrairCustos(prices) {
  const categorias = {
    Moradia: 0,
    Alimentacao: 0,
    Transporte: 0,
    Lazer: 0
  };

  prices.forEach(item => {
    const nome = item.item_name.toLowerCase();
    const valor = item.average_price || 0;

    if (nome.includes('apartment')) categorias.Moradia += valor;
    else if (nome.includes('meal') || nome.includes('milk') || nome.includes('rice') || nome.includes('chicken')) categorias.Alimentacao += valor;
    else if (nome.includes('transportation') || nome.includes('ticket')) categorias.Transporte += valor;
    else if (nome.includes('cinema') || nome.includes('fitness')) categorias.Lazer += valor;
  });

  return categorias;
}

app.post('/api/comparar', async (req, res) => {
  const { cidadeA, cidadeB } = req.body;

  db.query(
    'INSERT INTO buscas (cidade_origem, cidade_destino) VALUES (?, ?)',
    [cidadeA, cidadeB],
    (err) => {
      if (err) {
        console.error('Erro ao inserir no banco:', err.message);
      }
    }
  );

  try {
    const dadosA = await fetchCityCosts(cidadeA);
    const dadosB = await fetchCityCosts(cidadeB);

    const custosA = extrairCustos(dadosA);
    const custosB = extrairCustos(dadosB);

    const categorias = Object.keys(custosA).map(categoria => ({
      nome: categoria,
      cidadeA: parseFloat(custosA[categoria].toFixed(2)),
      cidadeB: parseFloat(custosB[categoria].toFixed(2))
    }));

    res.json({ cidadeA, cidadeB, categorias });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

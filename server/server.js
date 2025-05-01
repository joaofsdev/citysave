const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;

require('dotenv').config();

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

async function fetchCityCosts(city, country = 'Brazil') {
  const options = {
    method: 'GET',
    url: `https://${RAPIDAPI_HOST}/prices`,
    params: { city_name: city, country_name: country },
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST
    }
  };

  try {
    const response = await axios.request(options);

    if (response.data?.error) {
      return { error: `Cidade não encontrada: ${city}` };
    }

    return { prices: response.data.prices };
  } catch (error) {
    if (error.response?.status === 429) {
      return { error: 'Limite de requisições da API atingido. Tente novamente mais tarde.' };
    }
    return { error: `Erro inesperado: ${error.message}` };
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
    const categoria = item.category_name?.toLowerCase() || '';
    const nome = item.item_name?.toLowerCase() || '';
    const valor = item.avg || item.average_price || 0;

    if (
      categoria.includes('rent') ||
      categoria.includes('real estate') ||
      categoria.includes('financing')
    ) {
      if (
        nome.includes('one bedroom apartment in city centre') ||
        nome.includes('internet, 60 mbps') ||
        nome.includes('basic utilities for 85m2')
      ) {
        categorias.Moradia += valor;
      }
    } else if (categoria.includes('markets')) {
      if (
        nome.includes('milk') ||
        nome.includes('egg') ||
        nome.includes('rice') ||
        nome.includes('chicken') ||
        nome.includes('beef') ||
        nome.includes('tomato') ||
        nome.includes('onion') ||
        nome.includes('lettuce')
      ) {
        categorias.Alimentacao += valor;
      }
    } else if (categoria.includes('transport')) {
      if (nome.includes('gasoline')) {
        categorias.Transporte += valor * 100;
      } else if (nome.includes('ticket')) {
        categorias.Transporte += valor;
      }
    } else if (
      categoria.includes('sports') ||
      categoria.includes('entertainment') ||
      categoria.includes('clothing')
    ) {
      if (
        nome.includes('fitness') ||
        nome.includes('cinema') ||
        nome.includes('jeans') ||
        nome.includes('dress') ||
        nome.includes('shoes')
      ) {
        categorias.Lazer += valor;
      }
    }
  });

  if (
    categorias.Moradia === 0 &&
    categorias.Alimentacao === 0 &&
    categorias.Transporte === 0 &&
    categorias.Lazer === 0
  ) {
    return {
      Moradia: 1000,
      Alimentacao: 800,
      Transporte: 300,
      Lazer: 200
    };
  }

  return categorias;
}



app.post('/comparar-cidades', async (req, res) => {
  const { cidadeA, cidadeB } = req.body;

  const resultadoA = await fetchCityCosts(cidadeA);
  const resultadoB = await fetchCityCosts(cidadeB);

  if (resultadoA.error || resultadoB.error) {
    return res.status(400).json({
      error: true,
      mensagem: 'Erro ao buscar dados das cidades.',
      detalhes: {
        cidadeA: resultadoA.error || null,
        cidadeB: resultadoB.error || null
      }
    });
  }

  const custosA = extrairCustos(resultadoA.prices);
  const custosB = extrairCustos(resultadoB.prices);

  const categoriasFinais = [
    { nome: 'Moradia', cidadeA: custosA.Moradia, cidadeB: custosB.Moradia },
    { nome: 'Alimentacao', cidadeA: custosA.Alimentacao, cidadeB: custosB.Alimentacao },
    { nome: 'Transporte', cidadeA: custosA.Transporte, cidadeB: custosB.Transporte },
    { nome: 'Lazer', cidadeA: custosA.Lazer, cidadeB: custosB.Lazer }
  ];

  res.json({
    sucesso: true,
    categorias: categoriasFinais,
    cidadeA,
    cidadeB
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

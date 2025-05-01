document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('button');
  const inputs = document.querySelectorAll('input');
  const cidadeAInput = inputs[0];
  const cidadeBInput = inputs[1];

  // Autocompletar com cidades do IBGE
  fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
    .then(res => res.json())
    .then(data => {
      const cidades = data.map(c => c.nome);
      [cidadeAInput, cidadeBInput].forEach(input => {
        input.setAttribute('list', 'lista-cidades');
      });
      const datalist = document.createElement('datalist');
      datalist.id = 'lista-cidades';
      cidades.forEach(nome => {
        const option = document.createElement('option');
        option.value = nome;
        datalist.appendChild(option);
      });
      document.body.appendChild(datalist);
    });

  // Evento de clique para comparar cidades
  btn.addEventListener('click', async () => {
    const cidadeA = cidadeAInput.value;
    const cidadeB = cidadeBInput.value;
    if (!cidadeA || !cidadeB) return alert('Preencha ambas as cidades.');

    try {
      const resposta = await fetch('http://localhost:3000/comparar-cidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cidadeA, cidadeB })
      });

      const dados = await resposta.json();

      if (!resposta.ok || dados.error) {
        const erroA = dados.detalhes?.cidadeA || '';
        const erroB = dados.detalhes?.cidadeB || '';
        throw new Error(`${erroA} ${erroB}`);
      }

      renderizaGrafico(dados);
      renderizaResumo(dados);
    } catch (err) {
      console.error('Erro na requisição:', err);
      alert('Erro ao comparar cidades: ' + err.message);
    }
  });
});

function renderizaGrafico(dados) {
  const container = document.querySelector('#graficoContainer');
  container.innerHTML = '<canvas id="graficoComparacao"></canvas>';
  const ctx = document.getElementById('graficoComparacao').getContext('2d');

  const labels = dados.categorias.map(c => c.nome);
  const valoresA = dados.categorias.map(c => c.cidadeA);
  const valoresB = dados.categorias.map(c => c.cidadeB);

  const coresA = dados.categorias.map(c => c.cidadeA < c.cidadeB ? '#22c55e' : '#94a3b8');
  const coresB = dados.categorias.map(c => c.cidadeB < c.cidadeA ? '#22c55e' : '#94a3b8');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: dados.cidadeA,
          data: valoresA,
          backgroundColor: coresA
        },
        {
          label: dados.cidadeB,
          data: valoresB,
          backgroundColor: coresB
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Comparativo de Custo de Vida'
        }
      }
    }
  });
}

function renderizaResumo(dados) {
  const resumo = document.querySelector('#resumoComparacao') || document.createElement('div');
  resumo.id = 'resumoComparacao';
  resumo.style.marginTop = '2rem';
  resumo.innerHTML = `
    <h3>Resumo da Comparação</h3>
    <ul>
      ${dados.categorias.map(cat => `
        <li><strong>${cat.nome}:</strong> ${dados.cidadeA}: R$ ${cat.cidadeA.toFixed(2)} | ${dados.cidadeB}: R$ ${cat.cidadeB.toFixed(2)}</li>
      `).join('')}
    </ul>
  `;
  document.body.appendChild(resumo);
}


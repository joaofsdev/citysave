
# 🏙️ CitySave – Comparador de Custo de Vida entre Cidades Brasileiras

**CitySave** é uma aplicação web interativa que permite comparar o custo de vida entre duas cidades do Brasil. Ideal para quem está planejando uma mudança ou deseja conhecer melhor o custo de diferentes regiões.

---

## 💡 Sobre o Projeto

A plataforma coleta dados de preços médios através da **API Cost of Living and Prices (RapidAPI)**, e exibe os valores em quatro categorias principais:

- 🏠 **Moradia**
- 🍽️ **Alimentação**
- 🚗 **Transporte**
- 🎉 **Lazer**

A comparação é apresentada visualmente por meio de gráficos de barras e resumos comparativos, facilitando a análise para o usuário.

---

## 🚀 Tecnologias Utilizadas

- **HTML + Tailwind CSS**: Interface moderna, responsiva e leve.
- **JavaScript (Vanilla)**: Manipulação de DOM, requisições HTTP e lógica de comparação.
- **Node.js + Express**: Backend que interage com a API externa, processa e entrega dados ao frontend.
- **MySQL**: Preparado para futuras expansões de persistência de dados.
- **Chart.js**: Criação de gráficos para visualização comparativa.
- **API do IBGE**: Autocompletar de nomes de cidades brasileiras.

---

## ⚙️ Funcionalidades

- 🔍 Autocompletar de cidades com dados oficiais do IBGE.
- 📊 Comparação de custo de vida por categorias específicas.
- ⛽ Cálculo ajustado de transporte (com base em 100 litros/mês de gasolina).
- 🧾 Exibição clara e detalhada dos valores por cidade e categoria.
- 📉 Visualização por gráficos dinâmicos (Chart.js).

---

## 🛠️ Como Executar Localmente

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/citysave.git
cd citysave
```

2. **Instale as dependências do backend:**

```bash
npm install express cors axios mysql2 dotenv
```

3. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
RAPIDAPI_KEY=sua_chave_aqui
RAPIDAPI_HOST=cost-of-living-and-prices.p.rapidapi.com
```

4. **Inicie o servidor:**

```bash
node server.js
```

5. **Abra o arquivo `index.html` no navegador.**

---

## 📁 Estrutura do Projeto

```
citysave/
├── public/
│   ├──src/
│   │   ├── script.js
│   │   └── style.css
│   └── index.html
├── server/
│   └── server.js
├── sql/
│   └── db.sql
├── package.json
└── README.md
```

---

## 📌 Observações Importantes

- Os dados variam conforme a disponibilidade da API externa.
- O cálculo de transporte assume o consumo médio de 100 litros/mês.
- Mensagens de erro são exibidas para cidades inválidas ou problemas na requisição.

---

## 🔮 Possíveis Expansões Futuras

- 📦 Armazenamento das cidades mais buscadas no banco de dados.
- 📄 Exportação de relatórios em PDF ou CSV.
- 📱 Interface otimizada para mobile.
- 💱 Suporte a outras moedas e países.

---

## 🧠 Autor

Desenvolvido por **Joao Francisco da Silva**, estudante de Engenharia de Software, com foco em soluções acessíveis e funcionais para o dia a dia.

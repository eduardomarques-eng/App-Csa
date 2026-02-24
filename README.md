# EsquadriasCalc Pro 🚀

Sistema profissional de alto desempenho para dimensionamento executivo de esquadrias e vidros, em total conformidade com as normas brasileiras:

- **NBR 6123:2023** (Cargas de Vento)
- **NBR 7199:2025** (Vidros na Construção Civil)
- **NBR 10821** (Esquadrias Externas)

## 🛠️ Tecnologias

- **Frontend:** React 19, TypeScript, Tailwind CSS, Motion
- **Backend:** Node.js, Express, SQLite (Better-SQLite3)
- **Segurança:** JWT, Bcrypt, Helmet
- **Relatórios:** jsPDF, AutoTable
- **IA:** Google Gemini API (Extração de dados técnicos)

## 🏗️ Arquitetura

O projeto segue os princípios da **Clean Architecture** e **SOLID**:

- `src/server/domain`: Entidades e regras de negócio puras.
- `src/server/application`: Casos de uso e serviços.
- `src/server/infrastructure`: Implementações técnicas (DB, Auth, AI).
- `src/server/interfaces`: Controladores, rotas e middlewares.

## 🚀 Como Iniciar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure o arquivo `.env` (use `.env.example` como base).

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## 🔒 Segurança

- Autenticação via JWT com Refresh Tokens.
- Senhas criptografadas com Bcrypt (12 rounds).
- Proteção contra ataques comuns via Helmet e CORS.
- Variáveis de ambiente protegidas.

## 📄 Licença

Uso restrito e profissional. Consulte os termos de uso.

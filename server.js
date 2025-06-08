const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar sessão
app.use(session({
  secret: 'segredo-super-seguro', // troque por algo mais forte em produção
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true só com HTTPS
}));

// MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro na conexão', err));

// Modelo do usuário
const Usuario = mongoose.model('Usuario', {
  nome: String,
  email: String,
  username: String,
  senha: String
});

// Middleware de proteção
function proteger(req, res, next) {
  if (req.session.usuarioLogado) {
    next();
  } else {
    res.redirect('/');
  }
}

// Cadastro
app.post('/cadastro', async (req, res) => {
  const { nome, email, username, senha } = req.body;

  const existente = await Usuario.findOne({ $or: [{ email }, { username }] });
  if (existente) return res.status(400).json({ message: 'Usuário já existe' });

  const senhaHash = await bcrypt.hash(senha, 10);
  await new Usuario({ nome, email, username, senha: senhaHash }).save();

  res.status(201).json({ message: 'Cadastro feito com sucesso' });
});

// Login
app.post('/login', async (req, res) => {
  const { username, senha } = req.body;
  const user = await Usuario.findOne({ username });

  if (!user) return res.status(401).json({ message: 'Login inválido' });

  const match = await bcrypt.compare(senha, user.senha);
  if (!match) return res.status(401).json({ message: 'Login inválido' });

  req.session.usuarioLogado = true;
  res.status(200).json({ message: 'Login ok' });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Página protegida
app.get('/painel', proteger, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'painel.html'));
});

// Iniciar
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando em http://localhost:${PORT}`));

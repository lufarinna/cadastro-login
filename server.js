const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => console.error('Erro ao conectar:', err));
  

const Usuario = mongoose.model('Usuario', {
  nome: String,
  email: String,
  username: String,
  senha: String
});

// Rota de cadastro
app.post('/cadastro', async (req, res) => {
  try {
    const novo = new Usuario(req.body);
    await novo.save();
    res.send('Cadastro realizado com sucesso!');
  } catch (err) {
    res.status(500).send('Erro ao cadastrar.');
  }
});

// Rota de login
app.post('/login', async (req, res) => {
  const { username, senha } = req.body;
  const user = await Usuario.findOne({ username, senha });
  if (user) res.send('Login OK');
  else res.status(401).send('Usuário ou senha inválidos');
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

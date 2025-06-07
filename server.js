const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Middleware para servir arquivos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Modelo de usuário
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
    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar:', err);
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

// Rota de login aprimorada
app.post('/login', async (req, res) => {
  try {
    const { username, senha } = req.body;
    const user = await Usuario.findOne({ username, senha });

    if (user) {
      res.status(200).json({ message: 'Login bem-sucedido' });
    } else {
      res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

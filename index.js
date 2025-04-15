require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const Usuario = require('./models/Usuario');
const Mensaje = require('./models/Mensaje');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*'
  }
});

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Conexión MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err.message));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// RUTA PRINCIPAL
app.get('/', (req, res) => {
  res.send('🌐 Servidor de chat en línea');
});

// REGISTRO
app.post('/register', async (req, res) => {
  const { usuario, contraseña } = req.body;
  if (!usuario || !contraseña) return res.status(400).json({ mensaje: 'Faltan campos' });

  const existe = await Usuario.findOne({ usuario });
  if (existe) return res.status(409).json({ mensaje: 'El usuario ya existe' });

  const hash = await bcrypt.hash(contraseña, 10);
  const nuevo = new Usuario({ usuario, contraseña: hash });
  await nuevo.save();

  res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
});

// LOGIN
app.post('/login', async (req, res) => {
  const { usuario, contraseña } = req.body;

  const encontrado = await Usuario.findOne({ usuario });
  if (!encontrado) return res.status(401).json({ mensaje: 'Usuario no encontrado' });

  const coincide = await bcrypt.compare(contraseña, encontrado.contraseña);
  if (!coincide) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

  const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: '3h' });
  res.json({ token, mensaje: 'Login exitoso' });
});

// SOCKET.IO — chat en tiempo real
io.on('connection', socket => {
  console.log('🟢 Usuario conectado al chat');

  socket.on('mensaje', async ({ usuario, mensaje }) => {
    const nuevoMensaje = new Mensaje({ usuario, mensaje });
    await nuevoMensaje.save();
    io.emit('mensaje', nuevoMensaje);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Usuario desconectado');
  });
});

// INICIAR SERVIDOR
http.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

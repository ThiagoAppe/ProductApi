import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Función para manejar reconexión a la base de datos
function handleDisconnect() {
  db.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      setTimeout(handleDisconnect, 2000); // Reintenta después de 2 segundos
    } else {
      console.log('Conexión exitosa a la base de datos MySQL');
    }
  });

  db.on('error', (err) => {
    console.error('Error en la conexión:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect(); // Reconexión automática en caso de desconexión
    } else {
      throw err;
    }
  });
}

// Llamada inicial para conectar
handleDisconnect();

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Ruta para obtener productos
app.get('/api/productos', (req, res) => {
  const query = 'SELECT * FROM products'; // Cambia según tu tabla
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).json({ error: 'Error al obtener los productos' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Servidor escuchando
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

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
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de CORS
const corsOptions = {
  origin: (origin, callback) => {
    console.log('Origen de la solicitud:', origin); // Para depuración
    if (origin === process.env.CORS_ORIGIN || !origin) {
      callback(null, true);  // Permite la solicitud
    } else {
      console.error('Solicitud bloqueada por CORS desde:', origin); // Para depuración
      callback(new Error('No permitido por CORS'));  // Bloquea la solicitud
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  optionsSuccessStatus: 200, // Para compatibilidad con IE11 y otros navegadores antiguos
};

// Asegúrate de usar CORS antes de las rutas
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      res.status(500).json({ error: 'Error al obtener los productos' });
    } else {
      res.status(200).json(results);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

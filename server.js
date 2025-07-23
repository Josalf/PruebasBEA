// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const cron = require('node-cron');
const helmet = require('helmet');  // Importar helmet

const app = express();
app.use(cors());

const config = {
  user: 'jcalvillo',
  password: 'bea12345',
  server: 'localhost',
  database: 'SistemasBEA',
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  connectionTimeout: 15000,
  requestTimeout: 15000
};

// Usar helmet para configurar las políticas de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],  // Permitir cargar desde el mismo dominio
      imgSrc: ["'self'", 'data:', 'http://localhost:3000'],  // Permitir imágenes del mismo dominio y desde localhost
      scriptSrc: ["'self'"],  // Permitir cargar scripts del mismo dominio
    }
  }
}));

// === Entradas vs Recharges con FULL OUTER JOIN ===
app.get('/api/entriesVsRecharges', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT
        COALESCE(e.Dia, b.Dia) AS Dia,
        ISNULL(e.Entries, 0) + ISNULL(b.Entries, 0) AS TotalEntries,
        ISNULL(e.Recharges, 0) + ISNULL(b.Recharges, 0) AS TotalRecharges
      FROM
        (SELECT Dia, SUM(TotalPasesEntrada) AS Entries, SUM(TotalRecargasVRT) AS Recharges
         FROM Estaciones GROUP BY Dia) e
      FULL OUTER JOIN
        (SELECT Dia, SUM(TotalPasesMoneda) AS Entries, SUM(CantidadRecargas) AS Recharges
         FROM Autobuses GROUP BY Dia) b
      ON e.Dia = b.Dia
      ORDER BY Dia
    `);

    const dates = result.recordset.map(r => r.Dia);
    const entriesTotal = result.recordset.map(r => r.TotalEntries);
    const rechargesTotal = result.recordset.map(r => r.TotalRecharges);
    res.json({ dates, entriesTotal, rechargesTotal });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error ENTRIES VS RECHARGES.');
  }
});

// === Cantidad Rutas Autobuses ===
app.get('/api/feederBusRoutes', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT Ruta, COUNT(*) AS Cantidad FROM Autobuses GROUP BY Ruta
    `);
    const labels = result.recordset.map(r => r.Ruta);
    const values = result.recordset.map(r => r.Cantidad);
    res.json({ labels, values });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error feederBusRoutes.');
  }
});

// === Transacciones por Tipo ===
app.get('/api/transactionsByType', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT Estacion, 
        SUM(TotalPasesEntrada) AS Entrada,
        SUM(TotalPasesSalida) AS Salida,
        SUM(TotalRecargasVRT) AS Recarga,
        SUM(TotalVentasVRT) AS VentaTarjeta
      FROM Estaciones GROUP BY Estacion
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error transactionsByType.');
  }
});

// === Lista de Estaciones ===
app.get('/api/listaEstaciones', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`SELECT DISTINCT Estacion FROM Estaciones`);
    res.json(result.recordset.map(r => r.Estacion));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error listaEstaciones.');
  }
});

// === Histórico Entradas + Recargas por Estación ===
app.get('/api/entriesRecargasPerStation/:estacion', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('estacion', sql.NVarChar, req.params.estacion)
      .query(`
        SELECT Dia, SUM(TotalPasesEntrada) AS Entries, SUM(TotalRecargasVRT) AS Recharges
        FROM Estaciones WHERE Estacion = @estacion
        GROUP BY Dia ORDER BY Dia
      `);
    res.json({
      dates: result.recordset.map(r => r.Dia),
      entries: result.recordset.map(r => r.Entries),
      recharges: result.recordset.map(r => r.Recharges)
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error histórico estación.');
  }
});

// === Transacciones Dispositivos Total ===
app.get('/api/deviceTransactionsTotal', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        SUM(TotalPasesEntrada) AS Entries,
        SUM(TotalPasesSalida) AS Exits,
        SUM(TotalPasesGarita) AS Gates,
        SUM(TotalVentasVRT) AS TicketMachines
      FROM Estaciones
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deviceTransactionsTotal.');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ API corriendo en http://localhost:${PORT}`);
});

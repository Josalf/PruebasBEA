// server.js
const express = require('express');
const sql = require('mssql');
const cors = require('cors');

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

// === ENDPPOINTS PRINCIPALES ===

// 1) Entradas + Recargas Global (por día)
app.get('/api/entriesVsRecharges', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const est = await pool.request().query(`
      SELECT Dia, SUM(TotalPasesEntrada) AS Entries, SUM(TotalRecargasVRT) AS Recharges
      FROM Estaciones GROUP BY Dia ORDER BY Dia
    `);
    const bus = await pool.request().query(`
      SELECT Dia, SUM(TotalPasesMoneda) AS Entries, SUM(CantidadRecargas) AS Recharges
      FROM Autobuses GROUP BY Dia ORDER BY Dia
    `);

    const dates = est.recordset.map(r => r.Dia);
    const entriesTotal = est.recordset.map((r, i) => r.Entries + (bus.recordset[i]?.Entries || 0));
    const rechargesTotal = est.recordset.map((r, i) => r.Recharges + (bus.recordset[i]?.Recharges || 0));

    res.json({ dates, entriesTotal, rechargesTotal });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error ENTRIES VS RECHARGES.');
  }
});

// 2) Cantidad Rutas Autobuses
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

// 3) Transacciones por Tipo
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

// 4) Selector Lista Estaciones
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

// 5) Histórico Entradas+Recargas por Estación
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

// 6) Device Transactions Total (NUEVO)
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

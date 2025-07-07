// script.js
document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:3000";

  // === NUEVO: Función para dar formato de fecha amigable ===
  const formatDate = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // === ENTRIES VS RECHARGES ===
  const resGlobal = await fetch(`${API_URL}/api/entriesVsRecharges`);
  const global = await resGlobal.json();
  const ctxLine = document.getElementById("lineChart").getContext("2d");
  new Chart(ctxLine, {
    type: "line",
    data: {
      labels: global.dates.map(formatDate), // <-- FORMATO LIMPIO
      datasets: [
        { label: "Stations+Buses Entries", data: global.entriesTotal, borderColor: "#0077b6", tension: 0.3 },
        { label: "Stations+Buses Recharges", data: global.rechargesTotal, borderColor: "#90e0ef", tension: 0.3 }
      ]
    }
  });
  document.getElementById("totalEntries").textContent = global.entriesTotal.reduce((a,b)=>a+b,0).toLocaleString();
  document.getElementById("totalRecharges").textContent = global.rechargesTotal.reduce((a,b)=>a+b,0).toLocaleString();
  document.getElementById("transactionCount").textContent = 
    (global.entriesTotal.reduce((a,b)=>a+b,0) + global.rechargesTotal.reduce((a,b)=>a+b,0)).toLocaleString();

  // === FEEDER BUS ROUTES ===
  const resFeeder = await fetch(`${API_URL}/api/feederBusRoutes`);
  const feeder = await resFeeder.json();
  const ctxFeeder = document.getElementById("feederChart").getContext("2d");
  new Chart(ctxFeeder, {
    type: "pie",
    data: {
      labels: feeder.labels,
      datasets: [{
        data: feeder.values,
        backgroundColor: ["#0077b6", "#00b4d8", "#48cae4", "#90e0ef", "#caf0f8"],
        borderColor: "#fff",
        borderWidth: 2
      }]
    }
  });
  document.getElementById("feederTotal").textContent = feeder.values.reduce((a,b)=>a+b,0);

  // === TRANSACTIONS BY TYPE ===
  const resType = await fetch(`${API_URL}/api/transactionsByType`);
  const type = await resType.json();
  const ctxStacked = document.getElementById("stackedBarChart").getContext("2d");
  new Chart(ctxStacked, {
    type: "bar",
    data: {
      labels: type.map(t => t.Estacion),
      datasets: [
        { label: "Entrada", data: type.map(t => t.Entrada), backgroundColor: "#0077b6" },
        { label: "Salida", data: type.map(t => t.Salida), backgroundColor: "#00b4d8" },
        { label: "Recarga", data: type.map(t => t.Recarga), backgroundColor: "#90e0ef" },
        { label: "Venta Tarjeta", data: type.map(t => t.VentaTarjeta), backgroundColor: "#f77f00" }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
    }
  });

  // === DEVICE TRANSACTIONS TOTAL ===
  const resDevice = await fetch(`${API_URL}/api/deviceTransactionsTotal`);
  const device = await resDevice.json();
  const deviceData = {
    Entries: device.Entries,
    Exits: device.Exits,
    Gates: device.Gates,
    TicketMachines: device.TicketMachines
  };
  const maxValue = Math.max(...Object.values(deviceData));
  const deviceList = document.getElementById("deviceList");
  const traducciones = {
    Entries: "Entradas",
    Exits: "Salidas",
    Gates: "Torniquetes",
    TicketMachines: "Máquinas"
  };
  Object.entries(deviceData).forEach(([key, value]) => {
    const percent = (value / maxValue) * 100;
    const row = document.createElement("div");
    row.className = "device-row";
    row.innerHTML = `
      <div class="device-name">${traducciones[key]}</div>
      <div class="device-bar-container">
        <div class="device-bar" style="width: ${percent}%"></div>
      </div>
      <div class="device-value">${value.toLocaleString()}</div>
    `;
    deviceList.appendChild(row);
  });

  // === ENTRADAS POR ESTACIÓN HISTÓRICO ===
  const resLista = await fetch(`${API_URL}/api/listaEstaciones`);
  const estaciones = await resLista.json();
  const stationSelector = document.getElementById("stationSelector");
  estaciones.forEach(estacion => {
    const option = document.createElement("option");
    option.value = estacion;
    option.textContent = estacion;
    stationSelector.appendChild(option);
  });
  const ctxStation = document.getElementById("stationLineChart").getContext("2d");
  let stationLineChart = new Chart(ctxStation, {
    type: "line",
    data: { labels: [], datasets: [
      { label: "Entradas", data: [], borderColor: "#0077b6", tension: 0.3 },
      { label: "Recargas", data: [], borderColor: "#90e0ef", tension: 0.3 }
    ] },
    options: { responsive: true, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } }
  });
  async function loadStationHistory(estacion) {
    const res = await fetch(`${API_URL}/api/entriesRecargasPerStation/${estacion}`);
    const data = await res.json();
    stationLineChart.data.labels = data.dates.map(formatDate); // <-- FORMATEA FECHAS
    stationLineChart.data.datasets[0].data = data.entries;
    stationLineChart.data.datasets[1].data = data.recharges;
    stationLineChart.update();
  }
  if (estaciones.length > 0) {
    stationSelector.value = estaciones[0];
    loadStationHistory(estaciones[0]);
  }
  stationSelector.addEventListener("change", (e) => {
    loadStationHistory(e.target.value);
  });

});

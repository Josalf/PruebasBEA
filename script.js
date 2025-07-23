// Cargar los datos de data.json
const data = {
  "entriesRecargasPerStationPerDay": {
    "Tlaquepaque Centro": {
      "entries": [350, 420, 390, 410, 370, 430, 400],
      "recharges": [210, 215, 220, 225, 230, 240, 245]
    },
    "CUTLAQ": {
      "entries": [300, 310, 330, 360, 340, 325, 310],
      "recharges": [150, 160, 170, 175, 180, 185, 190]
    },
    "Lomas del Sur": {
      "entries": [200, 210, 230, 240, 250, 260, 270],
      "recharges": [120, 125, 130, 135, 140, 145, 150]
    },
    "El Cuervo": {
      "entries": [180, 190, 210, 220, 200, 210, 205],
      "recharges": [110, 115, 120, 125, 130, 135, 140]
    },
    "Las Pintas": {
      "entries": [240, 250, 260, 280, 270, 300, 310],
      "recharges": [140, 145, 150, 155, 160, 165, 170]
    }
  }
};

// Configuración para cada estación
const stations = ["Tlaquepaque Centro", "CUTLAQ", "Lomas del Sur", "El Cuervo", "Las Pintas"];

stations.forEach(station => {
  const stationData = data.entriesRecargasPerStationPerDay[station];
  
  const ctx = document.getElementById(`${station.replace(/\s+/g, '')}Chart`).getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2025-04-17', '2025-04-18', '2025-04-19', '2025-04-20', '2025-04-21', '2025-04-22', '2025-04-23'], // Fechas o días
      datasets: [{
        label: 'Entradas',
        data: stationData.entries,
        borderColor: 'rgba(0, 123, 255, 1)',
        fill: false,
        tension: 0.1
      }, {
        label: 'Recargas',
        data: stationData.recharges,
        borderColor: 'rgba(255, 159, 64, 1)',
        fill: false,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
      },
    },
  });
});

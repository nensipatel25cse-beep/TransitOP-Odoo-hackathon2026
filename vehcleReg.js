let vehicles = [];
const STORAGE_KEY = 'manifest_vehicles';

const STATUSES = [
  { name: "All Routes", key: "ALL" },
  { name: "On Road", key: "On Road" },
  { name: "Loading", key: "Loading" },
  { name: "Completed Journey", key: "Completed Journey" }
];

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  vehicles = saved ? JSON.parse(saved) : seedVehicles();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

function seedVehicles() {
  return [
    {id:1, regNumber:"GJ01AB1234", name:"Ahmedabad Express", model:"Toyota Innova", type:"SUV", region:"India", maxLoad:450, odometer:48210, cost:24500, status:"On Road"},
    {id:2, regNumber:"MH12CD5678", name:"Pune Cargo", model:"Tata Ace", type:"Cargo Truck", region:"India", maxLoad:750, odometer:102340, cost:9800, status:"Loading"},
    {id:3, regNumber:"JP-TYO-4102", name:"Tokyo Precision", model:"Toyota Alphard", type:"Van", region:"Japan", maxLoad:600, odometer:39870, cost:41200, status:"Completed Journey"}
  ];
}

function getStatusCounts() {
  const counts = { "ALL": vehicles.length, "On Road": 0, "Loading": 0, "Completed Journey": 0 };
  vehicles.forEach(v => {
    if (counts[v.status] !== undefined) counts[v.status]++;
  });
  return counts;
}

function initNavigation() {
  const nav = document.getElementById('routes');
  const counts = getStatusCounts();

  nav.innerHTML = STATUSES.map(status => {
    const count = counts[status.key] || 0;
    return `
      <div class="route-tab ${status.key === 'ALL' ? 'active' : ''}" data-status="${status.key}">
        ${status.name} <span class="count">${count}</span>
      </div>
    `;
  }).join('');

  nav.addEventListener('click', (e) => {
    const tab = e.target.closest('.route-tab');
    if (!tab) return;
    
    document.querySelectorAll('.route-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    // Filtering can be added here later
  });
}

function render() {
  const tbody = document.getElementById('vehicle-tbody');
  tbody.innerHTML = vehicles.map(v => `
    <tr>
      <td>${v.regNumber}</td>
      <td>${v.name}<br><small>${v.model}</small></td>
      <td>${v.type}</td>
      <td>${v.region}</td>
      <td>${v.status}</td>
    </tr>
  `).join('');

  // Update board stats
  const counts = getStatusCounts();
  document.getElementById('stat-total').textContent = counts.ALL;
  document.getElementById('stat-onroad').textContent = counts["On Road"];
  document.getElementById('stat-loading').textContent = counts.Loading;
  document.getElementById('stat-completed').textContent = counts["Completed Journey"];

  // Refresh navigation counts
  initNavigation();
}

// Event Listeners
document.getElementById('add-btn').addEventListener('click', () => {
  document.getElementById('modal-backdrop').style.display = 'flex';
});

document.getElementById('cancel-btn').addEventListener('click', () => {
  document.getElementById('modal-backdrop').style.display = 'none';
});

document.getElementById('modal-backdrop').addEventListener('click', (e) => {
  if (e.target.id === 'modal-backdrop') document.getElementById('modal-backdrop').style.display = 'none';
});

document.getElementById('vehicle-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const newVehicle = {
    id: Date.now(),
    regNumber: document.getElementById('f-regNumber').value,
    name: document.getElementById('f-name').value,
    model: document.getElementById('f-model').value,
    type: document.getElementById('f-type').value,
    region: document.getElementById('f-region').value,
    maxLoad: Number(document.getElementById('f-maxLoad').value),
    odometer: Number(document.getElementById('f-odometer').value),
    cost: Number(document.getElementById('f-cost').value),
    status: document.getElementById('f-status').value
  };

  vehicles.push(newVehicle);
  saveData();
  render();
  document.getElementById('modal-backdrop').style.display = 'none';
});

// Initialize
loadData();
render();

let nodes = ['A', 'B', 'C', 'D', 'E'];
let graph = {};
let positions = {
  'A': [100, 200],
  'B': [200, 100],
  'C': [300, 200],
  'D': [400, 100],
  'E': [500, 200]
};

// Function to build graph from input
function buildGraph() {
  // Read nodes
  const nodesStr = document.getElementById('nodesInput').value.trim();
  nodes = nodesStr.split(',').map(n => n.trim()).filter(n => n);
  // Reset graph
  graph = {};
  nodes.forEach(n => {
    graph[n] = {};
  });
  // Read edges
  const edgesStr = document.getElementById('edgesInput').value.trim();
  const lines = edgesStr.split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 3) {
      const [u, v, wStr] = parts;
      const w = parseFloat(wStr);
      if (nodes.includes(u) && nodes.includes(v) && !isNaN(w)) {
        graph[u][v] = w;
        graph[v][u] = w;
      }
    }
  }
}

// Add new node
document.getElementById('addNodeBtn').addEventListener('click', () => {
  const newNode = document.getElementById('addNodeInput').value.trim();
  if (newNode && !nodes.includes(newNode)) {
    nodes.push(newNode);
    // Add to input field
    document.getElementById('nodesInput').value = nodes.join(',');
    // Add to graph
    graph[newNode] = {};
    // Assign random position
    const x = Math.random() * 600 + 50;
    const y = Math.random() * 300 + 50;
    positions[newNode] = [x, y];
    document.getElementById('addNodeInput').value = '';
    drawGraph();
  } else {
    alert("Invalid or duplicate node");
  }
});

// Draw graph
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw edges
  for (const u of nodes) {
    for (const v in graph[u]) {
      if (u < v) { // to avoid duplicate lines
        const [x1, y1] = positions[u];
        const [x2, y2] = positions[v];
        ctx.strokeStyle = "#ECF0F1";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }
  // Draw nodes
  for (const node of nodes) {
    const [x, y] = positions[node];
    ctx.fillStyle = "#3498DB";
    ctx.strokeStyle = "#2980B9";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = "bold 11px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node, x, y);
  }
}

// Dynamic table header update
function updateTableHeader() {
  const thead = document.querySelector('#resultsTable thead');
  thead.innerHTML = '';
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `<th>Node</th>` + nodes.map(n => `<th>${n}</th>`).join('');
  thead.appendChild(headerRow);
}

// Update table with distances
function updateTable(dist) {
  const tbody = document.querySelector('#resultsTable tbody');
  tbody.innerHTML = '';
  for (const node of nodes) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${node}</td>` + nodes.map(n => `<td>${dist[node][n]}</td>`).join('');
    tbody.appendChild(row);
  }
}

// Algorithms
function distanceVector() {
  const startTime = performance.now();
  const nodesArr = [...nodes];
  const dist = {};
  nodesArr.forEach(n => {
    dist[n] = {};
    nodesArr.forEach(m => {
      dist[n][m] = Infinity;
    });
    dist[n][n] = 0;
  });
  for (const u of nodes) {
    for (const v in graph[u]) {
      dist[u][v] = graph[u][v];
    }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const u of nodes) {
      for (const v of nodes) {
        for (const k in graph[u]) {
          if (dist[u][v] > dist[u][k] + dist[k][v]) {
            dist[u][v] = dist[u][k] + dist[k][v];
            changed = true;
          }
        }
      }
    }
  }
  const endTime = performance.now();
  return {distances: dist, time: (endTime - startTime)/1000};
}

function dijkstra(graph, src) {
  const dist = {};
  const visited = new Set();
  for (const node of nodes) dist[node] = Infinity;
  dist[src] = 0;
  const pq = [{node: src, dist: 0}];
  while (pq.length > 0) {
    pq.sort((a,b) => a.dist - b.dist);
    const {node: u} = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    for (const v in graph[u]) {
      const alt = dist[u] + graph[u][v];
      if (alt < dist[v]) {
        dist[v] = alt;
        pq.push({node: v, dist: alt});
      }
    }
  }
  return dist;
}

function linkState() {
  const startTime = performance.now();
  const allDist = {};
  for (const node of nodes) {
    allDist[node] = dijkstra(graph, node);
  }
  const endTime = performance.now();
  return {distances: allDist, time: (endTime - startTime)/1000};
}

// Event: Update graph
document.getElementById('updateGraphBtn').addEventListener('click', () => {
  buildGraph();
  updateTableHeader();
  drawGraph();
  document.getElementById('resultLabel').innerText = 'Graph Updated!';
});

// Algorithm buttons
document.getElementById('dvButton').addEventListener('click', () => {
  const {distances, time} = distanceVector();
  document.getElementById('resultLabel').innerText = `Distance Vector Time: ${time.toFixed(6)} sec`;
  updateTable(distances);
});
document.getElementById('lsButton').addEventListener('click', () => {
  const {distances, time} = linkState();
  document.getElementById('resultLabel').innerText = `Link State Time: ${time.toFixed(6)} sec`;
  updateTable(distances);
});

// Initialize
buildGraph();
updateTableHeader();
drawGraph();

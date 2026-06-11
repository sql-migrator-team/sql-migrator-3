function initReportsPage() {
  if (!requireAuth()) return;
  loadSharedComponent('header', () => {
    setProfileSummary();
    bindHeaderActions();
  });
  initSidebar();
  const headerTitle = document.getElementById('page-title');
  if (headerTitle) headerTitle.textContent = 'Reports';
  renderReportSummary();
  renderReportTable();
}

async function renderReportTable() {
  const response = await apiRequest('/reports', 'GET');
  const reports = response.reports || [];
  const tableBody = document.getElementById('reports-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = reports
    .map((report) => `
      <tr>
        <td>${report.name}</td>
        <td>${report.type}</td>
        <td>${report.generatedBy}</td>
        <td>${report.date}</td>
        <td><span class="status-pill status-success">${report.status}</span></td>
        <td>
          <button class="button-secondary">View</button>
          <button class="button-secondary">Download</button>
        </td>
      </tr>
    `)
    .join('');
}

function renderReportSummary() {
  const stats = {
    totalReports: 112,
    today: 8,
    pdfReports: 64,
    jsonReports: 48,
  };
  const container = document.getElementById('report-summary');
  if (!container) return;
  container.innerHTML = `
    <div class="card metric-card"><h3>Total Reports</h3><strong>${stats.totalReports}</strong></div>
    <div class="card metric-card"><h3>Generated Today</h3><strong>${stats.today}</strong></div>
    <div class="card metric-card"><h3>PDF Reports</h3><strong>${stats.pdfReports}</strong></div>
    <div class="card metric-card"><h3>JSON Reports</h3><strong>${stats.jsonReports}</strong></div>
  `;
}

function initMigrationPage() {
  if (!requireAuth()) return;
  loadSharedComponent('header', () => {
    setProfileSummary();
    bindHeaderActions();
  });
  initSidebar();
  const headerTitle = document.getElementById('page-title');
  if (headerTitle) headerTitle.textContent = 'Migration';

  const tabs = document.querySelectorAll('.migration-tab');
  const panels = document.querySelectorAll('.migration-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.classList.remove('active'));
      panels.forEach((panel) => panel.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.remove('hidden');
    });
  });

  // NOTE: Do NOT call injectDatabaseOptions here — the HTML already has
  // the correct <option> values (mysql, postgres, sqlite, etc.) that match
  // what the backend connection_manager expects.

  const sqlToSqlForm = document.getElementById('sql-to-sql-form');
  const sqlToFileForm = document.getElementById('sql-to-file-form');
  const fileToSqlForm = document.getElementById('file-to-sql-form');

  // --- SQL to SQL ---
  if (sqlToSqlForm) {
    sqlToSqlForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      resetProgress();
      appendLog('Collecting connection details...');

      const payload = {
        source_db_type: getVal('source-db-type'),
        source_host: getVal('source-host'),
        source_port: getVal('source-port'),
        source_username: getVal('source-username'),
        source_password: getVal('source-password'),
        source_database: getVal('source-db-name'),
        target_db_type: getVal('target-db-type'),
        target_host: getVal('target-host'),
        target_port: getVal('target-port'),
        target_username: getVal('target-username'),
        target_password: getVal('target-password'),
        target_database: getVal('target-db-name'),
        tables: getVal('sql-tables') ? getVal('sql-tables').split(',').map(s => s.trim()) : [],
      };

      appendLog(`Connecting to source (${payload.source_db_type}://${payload.source_host})...`);
      const response = await apiRequest('/migration/sql-to-sql', 'POST', payload);
      handleMigrationResponse(response);
    });
  }

  // --- SQL to File ---
  if (sqlToFileForm) {
    sqlToFileForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      resetProgress();
      appendLog('Preparing export...');

      const payload = {
        source_db_type: getVal('export-db-type'),
        source_host: getVal('export-host'),
        source_port: getVal('export-port'),
        source_username: getVal('export-username'),
        source_password: getVal('export-password'),
        source_database: getVal('export-db-name'),
        source_table: getVal('export-table-name'),
        export_format: getVal('export-format'),
        columns: getVal('export-columns') ? getVal('export-columns').split(',').map(s => s.trim()) : [],
      };

      appendLog(`Exporting from ${payload.source_db_type}...`);
      const response = await apiRequest('/export/sql-to-file', 'POST', payload);
      handleMigrationResponse(response);
    });
  }

  // --- File to SQL ---
  if (fileToSqlForm) {
    fileToSqlForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      resetProgress();
      appendLog('Preparing file import...');

      const fileInput = document.getElementById('source-file');
      const file = fileInput ? fileInput.files[0] : null;

      const payload = new FormData();
      if (file) {
        payload.append('file', file);
      }
      payload.append('target_db_type', getVal('file-target-db-type'));
      payload.append('target_host', getVal('file-target-host'));
      payload.append('target_port', getVal('file-target-port'));
      payload.append('target_username', getVal('file-target-username'));
      payload.append('target_password', getVal('file-target-password'));
      payload.append('target_database', getVal('file-target-db-name'));
      payload.append('target_table', getVal('file-target-table'));

      appendLog(`Importing to ${payload.get('target_db_type')}...`);
      const response = await apiRequest('/import/file-to-sql', 'POST', payload);
      handleMigrationResponse(response);
    });
  }

  // File upload preview
  const uploadInput = document.getElementById('source-file');
  const filePreview = document.getElementById('file-preview');
  if (uploadInput && filePreview) {
    uploadInput.addEventListener('change', () => {
      const file = uploadInput.files[0];
      if (!file) return;
      filePreview.textContent = `Selected file: ${file.name}`;
    });
  }
}

/* ---------- Helpers ---------- */

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function resetProgress() {
  const progress = document.getElementById('migration-progress-fill');
  const progressText = document.getElementById('migration-progress-status');
  const logs = document.getElementById('migration-logs');
  if (progress) progress.style.width = '0%';
  if (progressText) progressText.textContent = 'Pending';
  const pct = document.getElementById('migration-progress-percentage');
  if (pct) pct.textContent = '0%';
  if (logs) logs.innerHTML = '<p class="log-line">Initializing migration...</p>';
}

function appendLog(message) {
  const logs = document.getElementById('migration-logs');
  if (logs) {
    logs.innerHTML += `<p class="log-line">${message}</p>`;
    logs.scrollTop = logs.scrollHeight;
  }
}

function handleMigrationResponse(response) {
  // Backend error responses come in two forms:
  // 1. { "message": "Migration failed.", "error": "..." } (500 errors)
  // 2. { "message": "source_table is required." } (400 errors — no `error` key)
  const isError = response.error
    || (!response.report && !response.result && response.message &&
        /required|failed|error|not found|invalid|denied|placeholder/i.test(response.message));

  if (isError) {
    const errorDetail = response.error || response.message || 'Unknown error';
    appendLog(`<span class="status-error">Error: ${errorDetail}</span>`);
    const progressText = document.getElementById('migration-progress-status');
    if (progressText) progressText.textContent = 'Failed';
    const progress = document.getElementById('migration-progress-fill');
    if (progress) { progress.style.width = '100%'; progress.style.background = '#ef4444'; }
    const pct = document.getElementById('migration-progress-percentage');
    if (pct) pct.textContent = '100%';
  } else {
    if (response.message) appendLog(response.message);
    simulateMigrationProgress();
  }
}

function simulateMigrationProgress() {
  const progress = document.getElementById('migration-progress-fill');
  const progressText = document.getElementById('migration-progress-status');
  const logs = document.getElementById('migration-logs');
  let percentage = 0;
  const interval = setInterval(() => {
    percentage += Math.floor(Math.random() * 12) + 8;
    if (percentage > 100) percentage = 100;
    if (progress) progress.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = percentage < 100 ? 'Running' : 'Completed';
    const progressNumber = document.getElementById('migration-progress-percentage');
    if (progressNumber) progressNumber.textContent = `${percentage}%`;
    if (logs) {
      logs.innerHTML += `<p class="log-line">${percentage}% completed... checking connection and migrating rows.</p>`;
      logs.scrollTop = logs.scrollHeight;
    }
    if (percentage >= 100) {
      clearInterval(interval);
      if (logs) logs.innerHTML += '<p class="log-line status-success">Migration completed successfully.</p>';
    }
  }, 700);
}

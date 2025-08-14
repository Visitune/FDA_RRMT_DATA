/**
 * FDA RRM-FT Assistant - Main Application
 * Risk Ranking Model for Food Tracing (FSMA 204 Rule)
 */

class RRMFTApp {
  constructor() {
    this.state = {
      lang: 'fr',
      data: {
        oneA: null,
        twoA: null,
        i18n: { hazard: {}, commodity: {}, category: {} }
      },
      current: {
        commodity: null,
        category: null,
        pairs: null
      },
      log: [],
      cache: new Map()
    };

    this.elements = {};
    this.init();
  }

  async init() {
    this.cacheElements();
    this.bindEvents();
    await this.loadData();
    this.setupAccessibility();
  }

  cacheElements() {
    this.elements = {
      langSelect: document.getElementById('lang'),
      commoditySelect: document.getElementById('commoditySelect'),
      searchInput: document.getElementById('q'),
      statusBadge: document.getElementById('statusBadge'),
      counts: document.getElementById('counts'),
      ftlBadge: document.getElementById('ftlBadge'),
      aggScore: document.getElementById('aggScore'),
      catName: document.getElementById('catName'),
      pairsTable: document.getElementById('pairsTable'),
      projName: document.getElementById('projName'),
      projRef: document.getElementById('projRef'),
      projNotes: document.getElementById('projNotes'),
      filesInput: document.getElementById('files'),
      saveRRM: document.getElementById('saveRRM'),
      openRRM: document.getElementById('openRRM'),
      log: document.getElementById('log')
    };
  }

  bindEvents() {
    // Language change
    this.elements.langSelect.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });

    // Commodity selection
    this.elements.commoditySelect.addEventListener('change', (e) => {
      this.selectCommodity(e.target.value);
    });

    // Search functionality
    this.elements.searchInput.addEventListener('input', this.debounce((e) => {
      this.handleSearch(e.target.value);
    }, 300));

    // Project management
    this.elements.saveRRM.addEventListener('click', () => this.saveProject());
    this.elements.openRRM.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.loadProject(e.target.files[0]);
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            this.saveProject();
            break;
          case 'e':
            e.preventDefault();
            this.exportResults();
            break;
        }
      }
    });
  }

  setupAccessibility() {
    // Add skip links
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'sr-only';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add ARIA live regions
    const statusRegion = document.createElement('div');
    statusRegion.setAttribute('aria-live', 'polite');
    statusRegion.setAttribute('aria-atomic', 'true');
    statusRegion.className = 'sr-only';
    statusRegion.id = 'status-region';
    document.body.appendChild(statusRegion);
  }

  // Utility functions
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  async sha256(ab) {
    try {
      const buffer = new Uint8Array(ab);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      throw new Error(`SHA-256 error: ${error.message}`);
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString(this.state.lang === 'fr' ? 'fr-FR' : 'en-US');
    const entry = { timestamp, message, type };
    
    this.state.log.push(entry);
    if (this.state.log.length > 100) {
      this.state.log = this.state.log.slice(-50);
    }

    const logDiv = this.elements.log;
    const line = `[${timestamp}] ${message}`;
    logDiv.textContent = (logDiv.textContent ? logDiv.textContent + '\n' : '') + line;
    logDiv.scrollTop = logDiv.scrollHeight;

    // Update status region for screen readers
    const statusRegion = document.getElementById('status-region');
    if (statusRegion) {
      statusRegion.textContent = message;
    }
  }

  async fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, { ...options, cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  async fetchAndVerify(path) {
    try {
      const response = await this.fetchWithRetry(path);
      const ab = await response.arrayBuffer();
      const digest = await this.sha256(ab);
      
      // Verify checksum
      const manifest = await this.getManifest();
      const checksums = await this.getChecksums();
      
      const expected = manifest?.sources?.find(s => s.path === path)?.sha256 || 
                      checksums?.[path];
      
      if (expected && expected !== digest) {
        throw new Error(`Checksum mismatch for ${path}`);
      }
      
      const json = JSON.parse(new TextDecoder().decode(ab));
      this.state.cache.set(path, { json, ab, sha256: digest });
      
      return { json, ab, sha256: digest };
    } catch (error) {
      this.log(`Error loading ${path}: ${error.message}`, 'error');
      throw error;
    }
  }

  async getManifest() {
    if (!this.state.data.manifest) {
      const data = await this.fetchAndVerify('manifest.json');
      this.state.data.manifest = data.json;
    }
    return this.state.data.manifest;
  }

  async getChecksums() {
    if (!this.state.data.checksums) {
      const data = await this.fetchAndVerify('metadata/checksums.json');
      this.state.data.checksums = data.json;
    }
    return this.state.data.checksums;
  }

  async loadData() {
    try {
      this.setLoading(true);
      this.log('Loading FDA RRM-FT data...');

      // Load main data files
      const [twoA, oneA] = await Promise.all([
        this.fetchAndVerify('en/commodities_table_2A.json'),
        this.fetchAndVerify('en/ftl_table_1A.json')
      ]);

      this.state.data.twoA = twoA.json;
      this.state.data.oneA = oneA.json;

      // Load i18n files
      const i18nFiles = ['hazard', 'commodity', 'category'];
      const i18nPromises = i18nFiles.map(file =>
        this.fetchAndVerify(`i18n/${file}.json`)
      );

      const i18nData = await Promise.all(i18nPromises);
      i18nFiles.forEach((file, index) => {
        this.state.data.i18n[file] = i18nData[index].json;
      });

      this.updateDataStatus();
      this.populateCommoditySelect();
      this.log('Data loaded successfully', 'success');

    } catch (error) {
      this.log(`Critical error: ${error.message}`, 'error');
      this.setStatus('error', 'Error loading data');
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    const badge = this.elements.statusBadge;
    if (isLoading) {
      badge.className = 'pill warn';
      badge.innerHTML = '<span class="loading" aria-hidden="true"></span> Loading...';
      badge.setAttribute('aria-busy', 'true');
    } else {
      badge.setAttribute('aria-busy', 'false');
    }
  }

  setStatus(type, message) {
    const badge = this.elements.statusBadge;
    badge.className = `pill ${type}`;
    badge.textContent = message;
  }

  updateDataStatus() {
    const badge = this.elements.statusBadge;
    const counts = this.elements.counts;
    
    if (this.state.data.twoA && this.state.data.oneA) {
      badge.className = 'pill ok';
      badge.textContent = 'Ready';
      
      const totalCommodities = Object.keys(this.state.data.twoA).length;
      counts.textContent = `${totalCommodities} commodities`;
    }
  }

  populateCommoditySelect() {
    if (!this.state.data.twoA) return;

    const select = this.elements.commoditySelect;
    select.innerHTML = '<option value="">Select a commodity...</option>';

    const commodities = Object.entries(this.state.data.twoA)
      .map(([code, data]) => ({
        code,
        name: this.state.data.i18n.commodity[code]?.[this.state.lang] || data.name || code,
        category: data.category
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const fragment = document.createDocumentFragment();
    commodities.forEach(item => {
      const option = document.createElement('option');
      option.value = item.code;
      option.textContent = `${item.name} (${item.code})`;
      option.setAttribute('data-category', item.category);
      fragment.appendChild(option);
    });

    select.appendChild(fragment);
  }

  setLanguage(lang) {
    this.state.lang = lang;
    this.populateCommoditySelect();
    
    if (this.state.current.commodity) {
      this.selectCommodity(this.state.current.commodity);
    }
    
    this.log(`Language changed to ${lang === 'fr' ? 'Français' : 'English'}`);
  }

  selectCommodity(code) {
    if (!code || !this.state.data.twoA || !this.state.data.oneA) return;

    const commodity = this.state.data.twoA[code];
    if (!commodity) return;

    this.state.current.commodity = code;
    this.state.current.category = commodity.category;

    // Update UI
    const isFTL = this.state.data.oneA[code]?.ftl || false;
    const ftlBadge = this.elements.ftlBadge;
    ftlBadge.className = isFTL ? 'pill ok' : 'pill hidden';
    ftlBadge.textContent = 'FTL';
    ftlBadge.setAttribute('aria-hidden', !isFTL);

    const catName = this.state.data.i18n.category[commodity.category]?.[this.state.lang] || 
                   commodity.category;
    this.elements.catName.textContent = catName;

    this.loadPairs(code);
  }

  async loadPairs(code) {
    try {
      const pairsPath = `en/pairs_table_2B/${code}.json`;
      const { json: pairs } = await this.fetchAndVerify(pairsPath);
      
      this.state.current.pairs = pairs;
      this.displayPairs(pairs);
      
      const maxScore = Math.max(...Object.values(pairs).map(p => p.score || 0));
      this.elements.aggScore.textContent = `Max score: ${maxScore}`;
      
    } catch (error) {
      this.log(`Error loading pairs for ${code}: ${error.message}`, 'error');
      this.displayPairs({});
    }
  }

  displayPairs(pairs) {
    const tbody = this.elements.pairsTable.querySelector('tbody');
    tbody.innerHTML = '';

    if (!pairs || Object.keys(pairs).length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="9" class="muted" style="text-align: center; padding: 32px;">No data available</td>';
      tbody.appendChild(tr);
      return;
    }

    const fragment = document.createDocumentFragment();
    Object.entries(pairs)
      .sort(([, a], [, b]) => (b.score || 0) - (a.score || 0))
      .forEach(([hazard, data]) => {
        const tr = document.createElement('tr');
        const hazardName = this.state.data.i18n.hazard[hazard]?.[this.state.lang] || hazard;
        
        tr.innerHTML = `
          <th scope="row">${hazardName}</th>
          <td>${data.c1 || 0}</td>
          <td>${data.c2 || 0}</td>
          <td>${data.c3 || 0}</td>
          <td>${data.c4 || 0}</td>
          <td>${data.c5 || 0}</td>
          <td>${data.c6 || 0}</td>
          <td>${data.c7 || 0}</td>
          <td><strong>${data.score || 0}</strong></td>
        `;
        
        fragment.appendChild(tr);
      });

    tbody.appendChild(fragment);
  }

  handleSearch(query) {
    if (!query) return;

    const select = this.elements.commoditySelect;
    const options = Array.from(select.options);
    const lowercaseQuery = query.toLowerCase();

    const match = options.find(opt => 
      opt.text.toLowerCase().includes(lowercaseQuery) ||
      opt.value.toLowerCase().includes(lowercaseQuery)
    );

    if (match && match.value) {
      select.value = match.value;
      this.selectCommodity(match.value);
    }
  }

  async saveProject() {
    try {
      const name = this.elements.projName.value.trim();
      const ref = this.elements.projRef.value.trim();
      const notes = this.elements.projNotes.value.trim();
      
      if (!this.state.current.commodity) {
        alert(this.state.lang === 'fr' ? 
          'Veuillez d\'abord sélectionner un produit' : 
          'Please select a commodity first');
        return;
      }

      const project = {
        metadata: {
          name: name || 'Untitled',
          reference: ref || '',
          notes: notes || '',
          created: new Date().toISOString(),
          version: '1.0',
          lang: this.state.lang
        },
        analysis: {
          commodity: this.state.current.commodity,
          category: this.state.current.category,
          pairs: this.state.current.pairs
        },
        log: this.state.log.slice(-20)
      };

      const zip = new JSZip();
      zip.file('project.json', JSON.stringify(project, null, 2));

      // Add attachments
      const files = this.elements.filesInput.files;
      if (files.length > 0) {
        const attachments = zip.folder('attachments');
        for (const file of files) {
          attachments.file(file.name, file);
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const filename = `rrmft_${this.slugify(name || 'project')}_${new Date().toISOString().split('T')[0]}.rrm`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      this.log(`Project saved: ${filename}`, 'success');

    } catch (error) {
      this.log(`Error saving project: ${error.message}`, 'error');
    }
  }

  async loadProject(file) {
    try {
      const zip = await JSZip.loadAsync(file);
      const projectFile = zip.file('project.json');
      
      if (!projectFile) {
        throw new Error('project.json not found');
      }

      const project = JSON.parse(await projectFile.async('string'));
      
      // Restore project data
      this.elements.projName.value = project.metadata.name || '';
      this.elements.projRef.value = project.metadata.reference || '';
      this.elements.projNotes.value = project.metadata.notes || '';
      
      // Restore analysis
      if (project.analysis.commodity) {
        const commodity = project.analysis.commodity;
        this.elements.commoditySelect.value = commodity;
        this.selectCommodity(commodity);
      }
      
      // Restore log
      if (project.log) {
        this.state.log = project.log;
        const logDiv = this.elements.log;
        logDiv.textContent = project.log.map(entry => 
          `[${entry.timestamp}] ${entry.message}`
        ).join('\n');
        logDiv.scrollTop = logDiv.scrollHeight;
      }

      this.log(`Project loaded: ${file.name}`, 'success');

    } catch (error) {
      this.log(`Error loading project: ${error.message}`, 'error');
    }
  }

  exportResults() {
    if (!this.state.current.commodity || !this.state.current.pairs) {
      alert(this.state.lang === 'fr' ? 
        'Aucune donnée à exporter' : 
        'No data to export');
      return;
    }

    const commodity = this.state.data.twoA[this.state.current.commodity];
    const commodityName = this.state.data.i18n.commodity[this.state.current.commodity]?.en || 
                         commodity.name;
    const categoryName = this.state.data.i18n.category[commodity.category]?.en || 
                        commodity.category;

    const exportData = {
      exportDate: new Date().toISOString(),
      commodity: {
        code: this.state.current.commodity,
        name: commodityName,
        category: categoryName,
        ftl: this.state.data.oneA[this.state.current.commodity]?.ftl || false
      },
      pairs: Object.entries(this.state.current.pairs).map(([hazard, data]) => ({
        hazard: this.state.data.i18n.hazard[hazard]?.en || hazard,
        criteria: {
          c1: data.c1 || 0,
          c2: data.c2 || 0,
          c3: data.c3 || 0,
          c4: data.c4 || 0,
          c5: data.c5 || 0,
          c6: data.c6 || 0,
          c7: data.c7 || 0
        },
        score: data.score || 0
      })).sort((a, b) => b.score - a.score),
      metadata: {
        source: 'FDA RRM-FT',
        method: 'FSMA 204 Rule',
        disclaimer: 'Risk scores are intrinsic and do not account for preventive controls'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const filename = `rrmft_export_${this.state.current.commodity}_${new Date().toISOString().split('T')[0]}.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    this.log(`Export completed: ${filename}`, 'success');
  }

  slugify(str) {
    if (!str) return '';
    return str
      .replace(/&/g, 'and')
      .normalize('NFKD')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase()
      .slice(0, 120);
  }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  window.rrmftApp = new RRMFTApp();
});
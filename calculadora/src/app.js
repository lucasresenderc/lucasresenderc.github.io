// Calculadora de IRR - Vanilla JavaScript

class IRRCalculator {
  constructor() {
    this.scenarios = [];
    this.riskFreeReturn = 5;
    this.minBuyPrice = 1400;
    this.maxBuyPrice = 3000;
    this.interval = 100;
    this.buyPrices = this.generateBuyPrices();
    this.displayMode = 'irr'; // 'irr' or 'profit'
    this.modalCreated = false;
    this.setupEventListeners();
    this.addDefaultScenarios();
  }

  createModal() {
    if (this.modalCreated) return;

    const modalHTML = `<div id="scenarioModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Detalhes do Cenário</h2>
          <button type="button" class="modal-close" onclick="calc.closeScenarioModal()">&times;</button>
        </div>
        <div class="modal-body" id="modalBody"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" onclick="calc.closeScenarioModal()">Fechar</button>
        </div>
      </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add click handler to close on overlay click
    document.getElementById('scenarioModal').addEventListener('click', (e) => {
      if (e.target.id === 'scenarioModal') {
        this.closeScenarioModal();
      }
    });

    this.modalCreated = true;
  }

  addDefaultScenarios() {
    const baseScenario = {
      id: `scenario_${Date.now()}_base`,
      name: 'Cenário Base',
      numYears: 3,
      unitsBuy: 50,
      unitsSell: 50,
      sellPrice: 5000,
      costs: [12000, 14000, 16000],
      irrValues: this.buyPrices.map(buyPrice =>
        this.equivalenteAA(buyPrice, 50, 50, 5000, [12000, 14000, 16000])
      )
    };
    this.scenarios.push(baseScenario);

    const pessimisticScenario = {
      id: `scenario_${Date.now()}_pessimistic`,
      name: 'Cenário Pessimista',
      numYears: 3,
      unitsBuy: 50,
      unitsSell: 48,
      sellPrice: 4000,
      costs: [14000, 17000, 20000],
      irrValues: this.buyPrices.map(buyPrice =>
        this.equivalenteAA(buyPrice, 50, 48, 4000, [14000, 17000, 20000])
      )
    };
    this.scenarios.push(pessimisticScenario);

    this.updateUI();
  }

  generateBuyPrices() {
    const prices = [];
    for (let price = this.minBuyPrice; price <= this.maxBuyPrice; price += this.interval) {
      prices.push(price);
    }
    return prices;
  }

  recalculateAllScenarios() {
    this.scenarios.forEach(scenario => {
      scenario.irrValues = this.buyPrices.map(buyPrice =>
        this.equivalenteAA(buyPrice, scenario.unitsBuy, scenario.unitsSell, scenario.sellPrice, scenario.costs)
      );
    });
  }

  npv(rate, buyPrice, unitsBuy, unitsSell, sellPrice, costs) {
    // costs array can be 1-5 elements long
    const numYears = costs.length;
    const cashFlows = [-unitsBuy * buyPrice];
    
    // Add maintenance costs for years 1 to numYears-1
    for (let i = 0; i < numYears - 1; i++) {
      cashFlows.push(-costs[i]);
    }
    
    // Final year: maintenance cost + sale revenue
    cashFlows.push(unitsSell * sellPrice - costs[numYears - 1]);
    
    return cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);
  }

  calculateNetProfit(buyPrice, unitsBuy, unitsSell, sellPrice, costs) {
    const totalInvestment = unitsBuy * buyPrice;
    const totalCosts = costs.reduce((sum, cost) => sum + cost, 0);
    const totalRevenue = unitsSell * sellPrice;
    return totalRevenue - totalInvestment - totalCosts;
  }

  equivalenteAA(buyPrice, unitsBuy, unitsSell, sellPrice, costs, tol = 1e-8, maxIter = 10000) {
    let low = -0.99;
    let high = 5.0;

    for (let iter = 0; iter < maxIter; iter++) {
      const mid = 0.5 * (low + high);
      const value = this.npv(mid, buyPrice, unitsBuy, unitsSell, sellPrice, costs);

      if (Math.abs(value) < tol) {
        return mid;
      }

      if (value > 0) {
        low = mid;
      } else {
        high = mid;
      }
    }

    return 0.5 * (low + high);
  }

  setupEventListeners() {
    document.getElementById('scenarioForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addScenario();
    });

    document.getElementById('numYears').addEventListener('change', () => {
      this.updateCostFields();
    });

    document.getElementById('riskFreeReturn').addEventListener('change', () => {
      this.riskFreeReturn = parseFloat(document.getElementById('riskFreeReturn').value) || 5;
      this.updateUI();
    });

    document.getElementById('minBuyPrice').addEventListener('change', () => {
      this.minBuyPrice = parseFloat(document.getElementById('minBuyPrice').value) || 1400;
      this.buyPrices = this.generateBuyPrices();
      this.recalculateAllScenarios();
      this.updateUI();
    });

    document.getElementById('maxBuyPrice').addEventListener('change', () => {
      this.maxBuyPrice = parseFloat(document.getElementById('maxBuyPrice').value) || 3000;
      this.buyPrices = this.generateBuyPrices();
      this.recalculateAllScenarios();
      this.updateUI();
    });

    document.getElementById('interval').addEventListener('change', () => {
      this.interval = parseInt(document.getElementById('interval').value) || 100;
      this.buyPrices = this.generateBuyPrices();
      this.recalculateAllScenarios();
      this.updateUI();
    });

    document.getElementById('displayToggle').addEventListener('change', (e) => {
      this.displayMode = e.target.checked ? 'profit' : 'irr';
      document.getElementById('toggleText').textContent = e.target.checked ? 'Mostrar Rentabilidade' : 'Mostrar Lucro Líquido';
      this.updateUI();
    });
  }

  updateCostFields() {
    const numYears = parseInt(document.getElementById('numYears').value);
    for (let i = 1; i <= 5; i++) {
      const field = document.getElementById(`costField${i}`);
      if (i <= numYears) {
        field.style.display = 'block';
        document.getElementById(`cost_${i}`).required = true;
      } else {
        field.style.display = 'none';
        document.getElementById(`cost_${i}`).required = false;
        document.getElementById(`cost_${i}`).value = '';
      }
    }
  }

  addScenario() {
    const name = document.getElementById('name').value.trim();
    const numYears = parseInt(document.getElementById('numYears').value);
    const unitsBuy = parseFloat(document.getElementById('units_buy').value);
    const unitsSell = parseFloat(document.getElementById('units_sell').value);
    const sellPrice = parseFloat(document.getElementById('sell_price').value);
    
    const costs = [];
    for (let i = 1; i <= numYears; i++) {
      costs.push(parseFloat(document.getElementById(`cost_${i}`).value) || 0);
    }

    if (!name || unitsBuy <= 0 || unitsSell <= 0 || sellPrice <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios com valores válidos.');
      return;
    }

    const scenario = {
      id: `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      numYears,
      unitsBuy,
      unitsSell,
      sellPrice,
      costs,
      irrValues: this.buyPrices.map(buyPrice =>
        this.equivalenteAA(buyPrice, unitsBuy, unitsSell, sellPrice, costs)
      )
    };

    this.scenarios.push(scenario);
    this.updateUI();
    document.getElementById('scenarioForm').reset();
  }

  removeScenario(id) {
    this.scenarios = this.scenarios.filter(s => s.id !== id);
    this.updateUI();
  }

  showScenarioInfo(id) {
    this.createModal();
    const scenario = this.scenarios.find(s => s.id === id);
    if (!scenario) return;

    const modal = document.getElementById('scenarioModal');
    const modalBody = document.getElementById('modalBody');

    const costsHtml = scenario.costs
      .map((cost, i) => `<div class="info-row"><strong>Ano ${i + 1}:</strong> ${this.formatCurrency(cost)}</div>`)
      .join('');

    modalBody.innerHTML = `
      <div class="info-row">
        <strong>Nome do Cenário:</strong> ${scenario.name}
      </div>
      <div class="info-row">
        <strong>Cabeças Compradas:</strong> ${scenario.unitsBuy.toFixed(2)}
      </div>
      <div class="info-row">
        <strong>Cabeças Vendidas:</strong> ${scenario.unitsSell.toFixed(2)}
      </div>
      <div class="info-row">
        <strong>Preço de Venda:</strong> ${this.formatCurrency(scenario.sellPrice)}
      </div>
      <div class="info-row">
        <strong>Período:</strong> ${scenario.numYears} ano${scenario.numYears > 1 ? 's' : ''}
      </div>
      <div class="info-row">
        <strong>Custos Operacionais:</strong>
      </div>
      ${costsHtml}
      <div class="info-row">
        <strong>Total de Custos:</strong> ${this.formatCurrency(scenario.costs.reduce((a, b) => a + b, 0))}
      </div>
    `;

    modal.style.display = 'flex';
  }

  closeScenarioModal() {
    const modal = document.getElementById('scenarioModal');
    modal.style.display = 'none';
  }

  clearAll() {
    if (confirm('Tem certeza que deseja remover todos os cenários?')) {
      this.scenarios = [];
      this.updateUI();
    }
  }

  formatIRR(irrValue) {
    if (irrValue > 5) return 'N/A';
    return (irrValue * 100).toFixed(2) + '%';
  }

  getIRRClass(irrValue) {
    const riskFreePercent = this.riskFreeReturn / 100;
    
    if (irrValue < 0) {
      return 'irr-black';
    } else if (irrValue < riskFreePercent) {
      return 'irr-red';
    } else if (irrValue < riskFreePercent + 0.05) {
      return 'irr-orange';
    } else {
      return 'irr-green';
    }
  }

  formatPrice(price) {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatCurrency(amount) {
    return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  updateUI() {
    // Update button with scenario count
    const count = this.scenarios.length;
    const submitBtn = document.getElementById('submitBtn');
    if (count === 0) {
      submitBtn.textContent = 'Adicionar Cenário';
    } else {
      submitBtn.textContent = `Adicionar Cenário (${count} já adicionado${count === 1 ? '' : 's'})`;
    }

    // Toggle empty state
    const isEmpty = this.scenarios.length === 0;
    document.getElementById('emptyState').style.display = isEmpty ? 'block' : 'none';
    document.getElementById('tableContainer').style.display = isEmpty ? 'none' : 'block';

    if (isEmpty) return;

    // Update header
    const headerRow = document.getElementById('headerRow');
    headerRow.innerHTML = '<th>Preço de Compra</th>';
    this.scenarios.forEach(scenario => {
      const th = document.createElement('th');
      th.innerHTML = `<div class="scenario-header-content">
        <span>${scenario.name}</span>
        <div class="scenario-header-buttons">
          <button type="button" class="btn-info" title="Info" onclick="calc.showScenarioInfo('${scenario.id}')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="8" cy="8" r="7"/>
              <line x1="8" y1="5" x2="8" y2="5.5"/>
              <line x1="8" y1="7.5" x2="8" y2="11"/>
            </svg>
          </button>
          <button type="button" class="btn btn-close btn-close-sm" 
                  onclick="calc.removeScenario('${scenario.id}')"></button>
        </div>
      </div>`;
      headerRow.appendChild(th);
    });

    // Update body
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    this.buyPrices.forEach((buyPrice, i) => {
      const tr = document.createElement('tr');
      tr.className = i % 2 === 0 ? 'highlight-row' : '';
      
      let html = `<td class="buy-price-cell">${this.formatPrice(buyPrice)}</td>`;
      this.scenarios.forEach(scenario => {
        const irrValue = scenario.irrValues[i];
        const irrClass = irrValue > 5 ? 'irr-neutral' : this.getIRRClass(irrValue);
        
        if (this.displayMode === 'irr') {
          const irrStr = this.formatIRR(irrValue);
          html += `<td class="irr-cell ${irrClass}">${irrStr}</td>`;
        } else {
          const profit = this.calculateNetProfit(buyPrice, scenario.unitsBuy, scenario.unitsSell, scenario.sellPrice, scenario.costs);
          const profitStr = this.formatCurrency(profit);
          html += `<td class="irr-cell ${irrClass}">${profitStr}</td>`;
        }
      });
      tr.innerHTML = html;
      tableBody.appendChild(tr);
    });
  }

  exportCSV() {
    if (this.scenarios.length === 0) {
      alert('Adicione cenários para exportar dados.');
      return;
    }

    let csv = 'Buy Price,' + this.scenarios.map(s => s.name).join(',') + '\n';
    this.buyPrices.forEach((buyPrice, i) => {
      const row = [this.formatPrice(buyPrice)];
      this.scenarios.forEach(scenario => {
        row.push(this.formatIRR(scenario.irrValues[i]));
      });
      csv += row.join(',') + '\n';
    });

    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = 'irr_analysis.csv';
    link.click();
  }
}

// Initialize app
const calc = new IRRCalculator();

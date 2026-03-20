/**
 * Budget Buddy – Charts Module
 * Handles Chart.js pie, bar, and line chart rendering
 */

// ─── Chart Color Palette ──────────────────────────────────────────────────────
const CHART_COLORS = [
  '#14c4b2', '#f5a623', '#8b5cf6', '#f43f5e',
  '#22d3ee', '#fb923c', '#a3e635', '#e879f9',
  '#38bdf8', '#4ade80'
];

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let pieChartInstance  = null;
let barChartInstance  = null;
let lineChartInstance = null;

// ─── Returns text + grid colours based on active theme ───────────────────────
function getThemeColors() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return {
    text:  isLight ? '#1e1b4b' : '#e2e8f0',
    grid:  isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)',
    font:  { family: 'DM Sans, sans-serif', size: 12 }
  };
}

// ─── Sets Chart.js global default colour before every render ─────────────────
// This is the key fix — Chart.js reads Chart.defaults.color for legend text
function applyChartTheme() {
  const { text } = getThemeColors();
  Chart.defaults.color = text;
  Chart.defaults.font.family = 'DM Sans, sans-serif';
  Chart.defaults.font.size = 12;
}

/**
 * Render pie chart showing category-wise expense distribution
 */
function renderPieChart(categoryData) {
  const ctx = document.getElementById('pieChart');
  if (!ctx) return;

  applyChartTheme(); // ← sets Chart.defaults.color before render

  if (pieChartInstance) pieChartInstance.destroy();

  if (!categoryData || categoryData.length === 0) {
    ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
    return;
  }

  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoryData.map(d => d._id),
      datasets: [{
        data: categoryData.map(d => d.total),
        backgroundColor: CHART_COLORS.slice(0, categoryData.length),
        borderColor: 'transparent',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 8,
            color: getThemeColors().text,  // explicit colour on labels
            font: { family: 'DM Sans, sans-serif', size: 12 },
            generateLabels(chart) {
              const { data } = chart;
              return data.labels.map((label, i) => ({
                text: label,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: 'transparent',
                pointStyle: 'circle',
                fontColor: getThemeColors().text, // explicit per-label colour
                index: i
              }));
            }
          }
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ₹${ctx.parsed.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Render bar chart showing monthly spending trend
 */
function renderBarChart(monthlyData) {
  const ctx = document.getElementById('barChart');
  if (!ctx) return;

  applyChartTheme(); // ← sets Chart.defaults.color before render

  if (barChartInstance) barChartInstance.destroy();

  const sorted = [...(monthlyData || [])]
    .sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year;
      return a._id.month - b._id.month;
    })
    .slice(-6);

  const labels  = sorted.map(d => `${MONTH_NAMES[d._id.month - 1]} ${d._id.year}`);
  const amounts = sorted.map(d => d.total);
  const { text, grid, font } = getThemeColors();

  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Monthly Spending',
        data: amounts,
        backgroundColor: CHART_COLORS.map(c => c + '99'),
        borderColor: CHART_COLORS,
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              return ` ₹${ctx.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: grid },
          ticks: { color: text, font }   // explicit colour on axis ticks
        },
        y: {
          grid: { color: grid },
          ticks: {
            color: text, font,           // explicit colour on axis ticks
            callback(val) {
              return '₹' + (val >= 1000 ? (val/1000).toFixed(1) + 'k' : val);
            }
          },
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Render line chart for 12-month overview (Analytics page)
 */
function renderLineChart(monthlyData) {
  const ctx = document.getElementById('lineChart');
  if (!ctx) return;

  applyChartTheme(); // ← sets Chart.defaults.color before render

  if (lineChartInstance) lineChartInstance.destroy();

  const sorted = [...(monthlyData || [])]
    .sort((a, b) => {
      if (a._id.year !== b._id.year) return a._id.year - b._id.year;
      return a._id.month - b._id.month;
    })
    .slice(-12);

  const labels  = sorted.map(d => `${MONTH_NAMES[d._id.month - 1]} '${String(d._id.year).slice(2)}`);
  const amounts = sorted.map(d => d.total);
  const { text, grid, font } = getThemeColors();

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Monthly Spending',
        data: amounts,
        borderColor: '#14c4b2',
        backgroundColor: 'rgba(20,196,178,0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#14c4b2',
        pointBorderColor: 'transparent',
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(ctx) {
              return ` ₹${ctx.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: grid },
          ticks: { color: text, font }   // explicit colour on axis ticks
        },
        y: {
          grid: { color: grid },
          ticks: {
            color: text, font,           // explicit colour on axis ticks
            callback(val) {
              return '₹' + (val >= 1000 ? (val/1000).toFixed(1) + 'k' : val);
            }
          },
          beginAtZero: true
        }
      }
    }
  });
}
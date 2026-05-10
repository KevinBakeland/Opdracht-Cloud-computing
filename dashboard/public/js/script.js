// Hoofdconstanten voor API URLs
const INFLUX_URL = `http://${window.location.hostname}:8086/query?db=sensors&q=`;
const NODE_RED_URL = `http://${window.location.hostname}:1880`;

// Huidige prijzen en sessie winst
let currentPrices = { AAPL: 0, TSLA: 0, KEVB: 0, CATS: 0 };
let sessionProfit = 0; // Winst uit verkochte aandelen (de "vastgezette" winst)

// Portfolio gegevens
let userPortfolio = {
    AAPL: { amount: 0, totalCost: 0 },
    TSLA: { amount: 0, totalCost: 0 },
    KEVB: { amount: 0, totalCost: 0 },
    CATS: { amount: 0, totalCost: 0 }
};

let myChart;
let currentActiveStock = '';

// --- 1. PORTFOLIO & HANDEL LOGICA ---

// Laad portfolio en sessie winst
async function loadHoldings() {
    try {
        // Laad sessionProfit uit browser geheugen
        sessionProfit = parseFloat(localStorage.getItem('sessionProfit')) || 0;

        const res = await fetch(`${NODE_RED_URL}/get-portfolio`);
        const cloudData = await res.json();
        
        const stocks = ['AAPL', 'TSLA', 'KEVB', 'CATS'];
        stocks.forEach(stock => {
            if (cloudData[stock]) {
                userPortfolio[stock].amount = cloudData[stock].amount || 0;
                userPortfolio[stock].totalCost = cloudData[stock].totalCost || 0;
            }
        });
        calculatePortfolio(); 
    } catch (e) {
        console.error("Laden van portfolio mislukt:", e);
    }
}

// Sla portfolio op naar cloud
async function saveToCloud(stock, amount, totalCost) {
    try {
        await fetch(`${NODE_RED_URL}/update-portfolio?stock=${stock}&amount=${amount}&totalCost=${totalCost}`);
    } catch (e) {
        console.error("Opslaan mislukt:", e);
    }
}

// Voer koop/verkoop transactie uit
function executeTrade(stock, type, event) {
    event.stopPropagation(); // Voorkomt dat de grafiek opent bij het klikken op een knop
    const stockKey = stock.toUpperCase();
    const priceNow = currentPrices[stockKey];
    const portfolio = userPortfolio[stockKey];
    
    if (!priceNow || priceNow <= 0) {
        alert("Wacht op live prijs...");
        return;
    }

    if (type === 'buy') {
        portfolio.amount += 1;
        portfolio.totalCost += priceNow;
    } else if (type === 'sell') {
        if (portfolio.amount > 0) {
            const avgPrice = portfolio.totalCost / portfolio.amount;
            
            // Bereken winst van deze verkoop en voeg toe aan sessie
            const profitOnSale = priceNow - avgPrice;
            sessionProfit += profitOnSale;
            localStorage.setItem('sessionProfit', sessionProfit);

            portfolio.amount -= 1;
            portfolio.totalCost -= avgPrice;
        } else {
            alert("Je hebt geen aandelen om te verkopen!");
            return;
        }
    }

    saveToCloud(stockKey, portfolio.amount, portfolio.totalCost);
    calculatePortfolio();
}

// Reset de gehele sessie
function resetSession() {
    const zekerweten = confirm("Weet je zeker dat je ALLES wilt resetten? Je winst en je bezittingen gaan naar €0.");
    
    if (zekerweten) {
        sessionProfit = 0;
        localStorage.setItem('sessionProfit', 0);
        
        const stocks = ['AAPL', 'TSLA', 'KEVB', 'CATS'];
        stocks.forEach(stock => {
            userPortfolio[stock].amount = 0;
            userPortfolio[stock].totalCost = 0;
            saveToCloud(stock, 0, 0);
        });

        calculatePortfolio();
    }
}

// Bereken totaal portfolio rendement
function calculatePortfolio() {
    let currentUnrealizedProfit = 0;
    const stocks = ['AAPL', 'TSLA', 'KEVB', 'CATS'];
    
    stocks.forEach(stock => {
        const stockLower = stock.toLowerCase();
        const data = userPortfolio[stock.toUpperCase()];
        
        const countEl = document.getElementById(`${stockLower}-count`);
        const buyPriceDisplayEl = document.getElementById(`${stockLower}-buyprice-display`);
        const plEl = document.getElementById(`${stockLower}-pl`);
        const detailsDiv = document.getElementById(`${stockLower}-details`);

        if (data.amount > 0) {
            const avgBuyPrice = data.totalCost / data.amount;
            const currentPrice = currentPrices[stock.toUpperCase()] || 0;
            const profit = (currentPrice - avgBuyPrice) * data.amount;
            
            currentUnrealizedProfit += profit;
            
            if (countEl) countEl.innerText = data.amount;
            if (buyPriceDisplayEl) buyPriceDisplayEl.innerText = "€" + avgBuyPrice.toFixed(2);
            if (plEl) {
                plEl.innerText = (profit >= 0 ? "+" : "") + "€" + profit.toFixed(2);
                plEl.className = profit >= 0 ? "price profit" : "price loss";
            }
            if (detailsDiv) detailsDiv.style.display = "flex";
        } else {
            if (detailsDiv) detailsDiv.style.display = "none";
            if (countEl) countEl.innerText = "0";
        }
    });

    // Totaal = Gerealiseerde winst + Huidige schommelende winst
    const totalRendement = sessionProfit + currentUnrealizedProfit;

    const plElement = document.getElementById('total-pl');
    const totalCard = document.getElementById('main-portfolio-card');

    if (plElement) {
        plElement.innerText = (totalRendement >= 0 ? "+" : "") + "€" + totalRendement.toFixed(2);
        plElement.className = totalRendement >= 0 ? "price profit" : "price loss";
        
        // Verander de gloed van de kaart
        if (totalCard) {
            totalCard.style.borderColor = totalRendement >= 0 ? "#0ecb81" : "#f6465d";
        }
    }
}

// --- 2. DATA FETCHING ---

// Haal live prijzen en gemiddelden op
async function fetchData() {
    const liveQuery = encodeURIComponent('SELECT last("price") FROM "stock_data" GROUP BY "stock"');
    const avgQuery = encodeURIComponent('SELECT MEAN("price") FROM "stock_data" WHERE time > now() - 1h GROUP BY "stock"');

    try {
        const resLive = await fetch(INFLUX_URL + liveQuery);
        const dataLive = await resLive.json();
        
        if (dataLive.results && dataLive.results[0].series) {
            dataLive.results[0].series.forEach(series => {
                const stock = series.tags.stock.toUpperCase();
                const price = series.values[0][1];
                currentPrices[stock] = price;
                const priceEl = document.getElementById(`${stock.toLowerCase()}-price`);
                if (priceEl) priceEl.innerText = "€" + parseFloat(price).toFixed(2);
            });
            calculatePortfolio(); 
        }

        const resAvg = await fetch(INFLUX_URL + avgQuery);
        const dataAvg = await resAvg.json();
        if (dataAvg.results && dataAvg.results[0].series) {
            dataAvg.results[0].series.forEach(series => {
                const stock = series.tags.stock.toUpperCase();
                const avgPrice = series.values[0][1];
                const avgEl = document.getElementById(`${stock.toLowerCase()}-1h`);
                if (avgEl) avgEl.innerText = "€" + avgPrice.toFixed(2);
            });
        }
    } catch (error) {
        console.error("Fout bij ophalen prijzen:", error);
    }
}

// --- 3. MODAL & CHART LOGICA ---

// Open grafiek modaal voor een aandeel
async function openChart(stock) {
    currentActiveStock = stock;
    document.getElementById('modal-title').innerText = `${stock} Prijsverloop`;
    document.getElementById('chart-modal').style.display = 'block';
    updateChartTime('1h');
}

// Sluit grafiek modaal
function closeModal() {
    document.getElementById('chart-modal').style.display = 'none';
}

// Sluit modaal bij klik buiten
window.onclick = function(event) {
    const modal = document.getElementById('chart-modal');
    if (event.target == modal) closeModal();
}

// Update grafiek voor gekozen tijdframe
async function updateChartTime(timeframe) {
    // UI: Actieve knop markeren
    document.querySelectorAll('.filter-group button').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${timeframe}`);
    if (activeBtn) activeBtn.classList.add('active');

    const groupTime = timeframe === '1h' ? '1m' : '10m';
    const query = encodeURIComponent(`SELECT mean("price") FROM "stock_data" WHERE "stock"='${currentActiveStock}' AND time > now() - ${timeframe} GROUP BY time(${groupTime}) FILL(previous)`);
    
    try {
        const res = await fetch(INFLUX_URL + query);
        const data = await res.json();
        
        if (data.results && data.results[0].series) {
            const points = data.results[0].series[0].values;
            const labels = points.map(p => new Date(p[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
            const prices = points.map(p => p[1]);
            renderChart(labels, prices);
        }
    } catch (e) {
        console.error("Grafiek data error:", e);
    }
}

// Render de grafiek met Chart.js
function renderChart(labels, prices) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Prijs ${currentActiveStock}`,
                data: prices,
                borderColor: '#f0b90b',
                backgroundColor: 'rgba(240, 185, 11, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: '#2d333a' }, ticks: { color: '#848e9c' } },
                x: { grid: { display: false }, ticks: { color: '#848e9c', maxRotation: 0 } }
            },
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            }
        }
    });
}

// Start de applicatie bij laden
window.onload = () => {
    loadHoldings();
    setInterval(fetchData, 5000);
    fetchData();
};
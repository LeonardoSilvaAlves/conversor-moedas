const apiKey = "90a71959722f909408b5ea63"; 
const apiUrl = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convertBtn");
const resultText = document.getElementById("result");
let exchangeChart = null; // Variável global para armazenar o gráfico

// Buscar moedas e popular os selects
async function loadCurrencies() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const currencies = Object.keys(data.conversion_rates);

        currencies.forEach(currency => {
            let option1 = document.createElement("option");
            let option2 = document.createElement("option");

            option1.value = option2.value = currency;
            option1.textContent = option2.textContent = currency;

            fromCurrency.appendChild(option1);
            toCurrency.appendChild(option2);
        });

        fromCurrency.value = "USD";
        toCurrency.value = "BRL";
    } catch (error) {
        console.error("Erro ao carregar moedas:", error);
    }
}

// Converter Moeda
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        resultText.textContent = "Por favor, insira um valor válido.";
        return;
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const rate = data.conversion_rates[toCurrency.value];
        const convertedAmount = (amount * rate).toFixed(2);

        resultText.textContent = `${amount} ${fromCurrency.value} = ${convertedAmount} ${toCurrency.value}`;
        await loadExchangeChart(fromCurrency.value, toCurrency.value);
    } catch (error) {
        console.error("Erro ao converter:", error);
    }
}

// Buscar histórico de taxas de câmbio e atualizar o gráfico
async function loadExchangeChart(base, target) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const formattedStart = startDate.toISOString().split("T")[0];
    const formattedEnd = endDate.toISOString().split("T")[0];

    const url = `https://api.frankfurter.app/${formattedStart}..${formattedEnd}?from=${base}&to=${target}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.rates) {
            console.error("Erro: Nenhum dado retornado pela API.");
            return;
        }

        const dates = Object.keys(data.rates);
        const rates = dates.map(date => data.rates[date][target]);

        updateChart(dates, rates, base, target);
    } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error);
    }
}

// Atualizar ou criar gráfico no Chart.js
function updateChart(labels, data, base, target) {
    const ctx = document.getElementById("exchangeChart").getContext("2d");

    // Se um gráfico já existe, destruir antes de criar um novo
    if (exchangeChart) {
        exchangeChart.destroy();
    }

    exchangeChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: `Variação ${base} para ${target}`,
                data: data,
                borderColor: "#28a745",
                backgroundColor: "rgba(40, 167, 69, 0.2)",
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: "#28a745",
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: false }
            }
        }
    });
}

convertBtn.addEventListener("click", convertCurrency);
document.addEventListener("DOMContentLoaded", loadCurrencies);

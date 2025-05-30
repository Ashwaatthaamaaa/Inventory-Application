// Sample data for demonstration
const sampleStockData = {
    AAPL: {
      name: "Apple Inc.",
      price: 178.72,
      change: 2.50,
      percentChange: 1.40,
      volume: "14.6M",
      dividend: 0.92
    },
    MSFT: {
      name: "Microsoft Corporation",
      price: 337.82,
      change: 1.75,
      percentChange: 2.30,
      volume: "24.3M",
      dividend: 2.72
    },
    NFLX: {
      name: "Netflix, Inc.",
      price: 626.08,
      change: -4.20,
      percentChange: -1.15,
      volume: "8.2M",
      dividend: 0
    },
    AMZN: {
      name: "Amazon.com, Inc.",
      price: 178.15,
      change: 3.25,
      percentChange: 1.86,
      volume: "31.5M",
      dividend: 0
    },
    GOOGL: {
      name: "Alphabet Inc.",
      price: 163.20,
      change: 0.43,
      percentChange: 0.26,
      volume: "19.8M",
      dividend: 0
    }
  };
  
  let selectedStock = null;
  let stockCache = {};  // Local cache to avoid unnecessary server requests
  
  // Initialize the application
  document.addEventListener('DOMContentLoaded', function() {
    initializeWatchlist();
    setupEventListeners();
    
    // Show a default stock if available in the watchlist
    const watchlistItems = document.querySelectorAll('.stock-card');
    if (watchlistItems.length > 0) {
      selectStock(watchlistItems[0].dataset.symbol);
    }
    // Check for messages passed via query parameters
    handleMessages();
  });
  
  // Set up event listeners
  function setupEventListeners() {
    // Add stock form submission
    const addStockForm = document.getElementById('add-stock-form');
    if (addStockForm) {
      addStockForm.addEventListener('submit', function(e) {
        // Form is handled by the server, so we don't prevent default
      });
    }
  
    // Stock card click events for selecting a stock
    document.addEventListener('click', function(e) {
      if (e.target.closest('.stock-card')) {
        const stockCard = e.target.closest('.stock-card');
        const symbol = stockCard.dataset.symbol;
        selectStock(symbol);
      }
    });
  
    // Generate summary button
    const generateBtn = document.getElementById('generate-summary');
    if (generateBtn) {
      generateBtn.addEventListener('click', function() {
        generateSummary();
      });
    }
  }
  
  // Initialize watchlist with sample data for demo purposes
  function initializeWatchlist() {
    const watchlistContainer = document.getElementById('watchlist-container');
    if (!watchlistContainer) return;
    
    // Get watchlist items from the server-rendered HTML
    const watchlistItems = watchlistContainer.querySelectorAll('.stock-card');
    
    // If no items in watchlist, show a message
    if (watchlistItems.length === 0) {
      watchlistContainer.innerHTML = '<p class="text-center">No stocks in watchlist</p>';
    }
  }
  
  // Select a stock to show details
  function selectStock(symbol) {
    // Remove selected class from all cards
    document.querySelectorAll('.stock-card').forEach(card => {
      card.classList.remove('selected');
    });
    
    // Add selected class to clicked card
    const selectedCard = document.querySelector(`.stock-card[data-symbol="${symbol}"]`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }
    
    // Set the selected stock
    selectedStock = symbol;
    
    // Update the detail panel
    updateStockDetails(symbol);
  }
  
  // Update the stock details panel
  async function updateStockDetails(symbol) {
    const detailPanel = document.getElementById('stock-detail');
    if (!detailPanel) return;

    // Show loading state immediately
    detailPanel.innerHTML = `<div class="loading-state"><p>Loading data for ${symbol}...</p></div>`;

    try {
        let stockData;
        
        // Check local cache first
        if (stockCache[symbol]) {
            stockData = stockCache[symbol];
        } else {
            // Fetch from server (which handles session caching)
            const response = await fetch(`/api/stock-data?symbol=${symbol}`);
            if (!response.ok) {
                // Try to parse error message from server
                let errorMsg = `Failed to fetch data (${response.status})`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) { /* Ignore parsing error */ }
                throw new Error(errorMsg);
            }
            stockData = await response.json();
            
            // Store in local cache
            stockCache[symbol] = stockData;
        }

        const changeSign = stockData.change >= 0 ? '+' : '';
        const changeClass = stockData.change >= 0 ? 'positive' : 'negative';
        
        const detailHTML = `
            <div class="stock-detail-header">
                <div>
                    <h2 class="stock-detail-title">${symbol} - ${stockData.name}</h2>
                    <div class="stock-detail-price">$${stockData.price?.toFixed(2) ?? 'N/A'}</div>
                    <span class="stock-change ${changeClass}">
                        ${changeSign}${stockData.change?.toFixed(2) ?? 'N/A'} (${changeSign}${stockData.percentChange?.toFixed(2) ?? 'N/A'}%)
                    </span>
                </div>
            </div>
            
            <div class="stock-detail-metrics">
                <div class="metric">
                    <div class="metric-title">Volume</div>
                    <div class="metric-value">${stockData.volume ?? 'N/A'}</div>
                </div>
                <div class="metric">
                    <div class="metric-title">Dividend</div>
                    <div class="metric-value">$${stockData.dividend?.toFixed(2) ?? 'N/A'}</div>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="chart-placeholder">Stock price chart (Placeholder)</div>
            </div>
            
            <div class="summary-section">
                <div class="summary-title">AI Analysis</div>
                <div class="summary-content" id="summary-content">
                    ${stockData.analysis ? `<p>${stockData.analysis}</p>` : '<p>Analysis not available.</p>'}
                </div>
            </div>
        `;
        
        detailPanel.innerHTML = detailHTML;

        console.log(`Received data for ${symbol}:`, stockData);
        console.log(`Analysis present:`, !!stockData.analysis);
        if (stockData.analysis) {
            console.log(`Analysis content:`, stockData.analysis);
        }
    } catch (error) {
        console.error("Error updating stock details:", error);
        detailPanel.innerHTML = `<div class="error-state">
            <p>Error loading data for ${symbol}:</p>
            <p>${error.message}</p>
            </div>`;
    }
  }
  
  // Generate an AI summary for the stock (placeholder for future functionality)
  function generateSummary() {
    if (!selectedStock) return;
    
    const summaryContent = document.querySelector('.summary-content');
    if (!summaryContent) return;
    
    summaryContent.innerHTML = '<p>Generating summary...</p>';
    
    setTimeout(() => {
      const stockData = sampleStockData[selectedStock];
      
      let summaryText = '';
      if (stockData.change >= 0) {
        summaryText = `${selectedStock} is showing positive momentum today, with a gain of ${stockData.change.toFixed(2)} points (${stockData.percentChange.toFixed(2)}%). The stock is trading with a volume of ${stockData.volume} shares. ${stockData.dividend > 0 ? `The stock offers a dividend of $${stockData.dividend.toFixed(2)} per share.` : 'The company does not currently pay a dividend.'}`;
      } else {
        summaryText = `${selectedStock} is facing downward pressure today, dropping by ${Math.abs(stockData.change).toFixed(2)} points (${Math.abs(stockData.percentChange).toFixed(2)}%). Trading volume is at ${stockData.volume} shares. ${stockData.dividend > 0 ? `The stock pays a dividend of $${stockData.dividend.toFixed(2)} per share.` : 'The company does not currently pay a dividend.'}`;
      }
      
      summaryContent.innerHTML = `
        <p>${summaryText}</p>
        <p class="text-secondary" style="margin-top: 0.75rem; font-size: 0.75rem;">Note: This is a sample summary. The LLM-based analysis will be implemented in the future.</p>
      `;
    }, 1500);
  }
  
  function handleMessages() {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const type = urlParams.get('type') || 'info'; // Default to info if type not specified

    if (message) {
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.textContent = decodeURIComponent(message);
            messageContainer.className = `message message-${type}`; // Apply class based on type
            messageContainer.style.display = 'block'; // Show the message

            // Optional: Hide message after a few seconds
            // setTimeout(() => {
            //    messageContainer.style.display = 'none';
            // }, 5000);
        }
        // Clean the URL to remove the message parameters after displaying
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
  
// Last updated: 2026-02-14 23:01:57 UTC
/**
 * Denomination Utilities for YieldBasis Dashboard
 * Provides functions to convert values between BTC, ETH, and USD
 */

// Current denomination state (persisted in localStorage)
let currentDenomination = localStorage.getItem('denomination') || 'usd';

// Price cache (updated when data is loaded)
const prices = {
    btc_usd: null,
    eth_usd: null,
    eth_btc: null  // calculated: eth_usd / btc_usd
};

/**
 * Initialize prices from data sources
 * Call this after unified_data.js and unified_data_adapter.js are loaded
 */
function initializePrices() {
    // Get BTC price from yield data
    if (typeof yieldData_cbbtc !== 'undefined' && yieldData_cbbtc.data && yieldData_cbbtc.data.length > 0) {
        const latestBtc = yieldData_cbbtc.data[yieldData_cbbtc.data.length - 1];
        if (latestBtc.btc_price) {
            prices.btc_usd = latestBtc.btc_price;
        }
    }
    // Fallback to WBTC data
    if (!prices.btc_usd && typeof yieldData_wbtc !== 'undefined' && yieldData_wbtc.data && yieldData_wbtc.data.length > 0) {
        const latestBtc = yieldData_wbtc.data[yieldData_wbtc.data.length - 1];
        if (latestBtc.btc_price) {
            prices.btc_usd = latestBtc.btc_price;
        }
    }

    // Get ETH price from yield data
    if (typeof yieldData_eth !== 'undefined' && yieldData_eth.data && yieldData_eth.data.length > 0) {
        const latestEth = yieldData_eth.data[yieldData_eth.data.length - 1];
        if (latestEth.eth_price) {
            prices.eth_usd = latestEth.eth_price;
        }
    }

    // Calculate ETH/BTC ratio
    if (prices.btc_usd && prices.eth_usd) {
        prices.eth_btc = prices.eth_usd / prices.btc_usd;
    }

    console.log('Denomination prices initialized:', prices);
}

/**
 * Convert a value from one asset denomination to another
 * @param {number} value - The value to convert
 * @param {string} fromAsset - Source asset: 'btc' or 'eth'
 * @param {string} toDenom - Target denomination: 'btc', 'eth', or 'usd'
 * @returns {number} Converted value
 */
function convertValue(value, fromAsset, toDenom) {
    if (!value || isNaN(value)) return 0;
    if (fromAsset === toDenom) return value;

    // Convert to USD first, then to target
    if (toDenom === 'usd') {
        if (fromAsset === 'btc') {
            return value * (prices.btc_usd || 0);
        } else if (fromAsset === 'eth') {
            return value * (prices.eth_usd || 0);
        }
    }

    if (toDenom === 'btc') {
        if (fromAsset === 'eth') {
            return prices.eth_btc ? value * prices.eth_btc : 0;
        } else if (fromAsset === 'usd') {
            return prices.btc_usd ? value / prices.btc_usd : 0;
        }
    }

    if (toDenom === 'eth') {
        if (fromAsset === 'btc') {
            return prices.eth_btc ? value / prices.eth_btc : 0;
        } else if (fromAsset === 'usd') {
            return prices.eth_usd ? value / prices.eth_usd : 0;
        }
    }

    return value;
}

/**
 * Format a value for display in the specified denomination
 * @param {number} value - The value to format
 * @param {string} denom - Denomination: 'btc', 'eth', or 'usd'
 * @param {object} options - Formatting options
 * @returns {string} Formatted value string
 */
function formatValue(value, denom, options = {}) {
    if (value === null || value === undefined || isNaN(value)) return '-';

    const { compact = false, showSymbol = true } = options;

    switch (denom) {
        case 'btc':
            if (compact && Math.abs(value) >= 1000) {
                return (showSymbol ? '' : '') + (value / 1000).toFixed(2) + 'K BTC';
            }
            return value.toFixed(8) + (showSymbol ? ' BTC' : '');

        case 'eth':
            if (compact && Math.abs(value) >= 1000) {
                return (value / 1000).toFixed(2) + 'K ETH';
            }
            return value.toFixed(6) + (showSymbol ? ' ETH' : '');

        case 'usd':
            if (compact) {
                if (Math.abs(value) >= 1e9) {
                    return (showSymbol ? '$' : '') + (value / 1e9).toFixed(2) + 'B';
                } else if (Math.abs(value) >= 1e6) {
                    return (showSymbol ? '$' : '') + (value / 1e6).toFixed(2) + 'M';
                } else if (Math.abs(value) >= 1e3) {
                    return (showSymbol ? '$' : '') + (value / 1e3).toFixed(2) + 'K';
                }
            }
            return (showSymbol ? '$' : '') + value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        default:
            return value.toString();
    }
}

/**
 * Get the symbol for a denomination
 * @param {string} denom - Denomination: 'btc', 'eth', or 'usd'
 * @returns {string} Symbol
 */
function getDenomSymbol(denom) {
    switch (denom) {
        case 'btc': return 'BTC';
        case 'eth': return 'ETH';
        case 'usd': return '$';
        default: return '';
    }
}

/**
 * Set the current denomination and save to localStorage
 * @param {string} denom - New denomination: 'btc', 'eth', or 'usd'
 * @param {function} callback - Optional callback after setting denomination
 */
function setDenomination(denom, callback) {
    if (['btc', 'eth', 'usd'].includes(denom)) {
        currentDenomination = denom;
        localStorage.setItem('denomination', denom);

        // Update UI buttons
        document.querySelectorAll('.denom-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.denom === denom);
        });

        if (typeof callback === 'function') {
            callback(denom);
        }

        // Dispatch custom event for listeners
        window.dispatchEvent(new CustomEvent('denominationChanged', { detail: { denomination: denom } }));
    }
}

/**
 * Get the current denomination
 * @returns {string} Current denomination
 */
function getDenomination() {
    return currentDenomination;
}

/**
 * Create and insert the denomination switcher UI
 * @param {string} containerId - ID of the container element
 * @param {function} onChange - Callback when denomination changes
 */
function createDenominationSwitcher(containerId, onChange) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Denomination switcher container not found:', containerId);
        return;
    }

    const switcher = document.createElement('div');
    switcher.className = 'denomination-switcher';
    switcher.innerHTML = `
        <button class="denom-btn ${currentDenomination === 'btc' ? 'active' : ''}" data-denom="btc" onclick="setDenomination('btc', ${onChange ? onChange.name : 'null'})">BTC</button>
        <button class="denom-btn ${currentDenomination === 'eth' ? 'active' : ''}" data-denom="eth" onclick="setDenomination('eth', ${onChange ? onChange.name : 'null'})">ETH</button>
        <button class="denom-btn ${currentDenomination === 'usd' ? 'active' : ''}" data-denom="usd" onclick="setDenomination('usd', ${onChange ? onChange.name : 'null'})">USD</button>
    `;

    container.appendChild(switcher);
}

/**
 * Add denomination switcher styles to the page
 */
function addDenominationStyles() {
    if (document.getElementById('denomination-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'denomination-styles';
    styles.textContent = `
        .denomination-switcher {
            display: inline-flex;
            gap: 4px;
            background: rgba(30, 41, 59, 0.8);
            padding: 4px;
            border-radius: 8px;
            margin-left: 15px;
        }
        .denom-btn {
            padding: 6px 14px;
            border: none;
            background: transparent;
            color: #94a3b8;
            cursor: pointer;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .denom-btn:hover {
            background: rgba(139, 92, 246, 0.2);
            color: #c4b5fd;
        }
        .denom-btn.active {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
        }
    `;
    document.head.appendChild(styles);
}

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializePrices,
        convertValue,
        formatValue,
        getDenomSymbol,
        setDenomination,
        getDenomination,
        createDenominationSwitcher,
        addDenominationStyles,
        prices
    };
}

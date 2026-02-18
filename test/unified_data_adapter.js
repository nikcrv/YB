/**
 * Adapter: converts unifiedData to individual variable names
 * that existing HTML dashboards expect.
 *
 * Usage: Include unified_data.js first, then this file.
 * <script src="unified_data.js"></script>
 * <script src="unified_data_adapter.js"></script>
 */

// ========== HELPER FUNCTIONS ==========

function _extractData(src) { return Array.isArray(src) ? src : (src?.data || []); }

/**
 * Align revenue yield arrays across markets using forward-fill.
 * The unified collector samples each market independently at different blocks,
 * resulting in different timestamps per market. Dashboards (dashboard.html)
 * require all markets to share the same timestamps (commonTimestamps).
 *
 * This function creates aligned arrays where every market has a data point
 * at every timestamp from the union of all markets' timestamps.
 * - Cumulative fields (total_withdrawable_btc, admin_fees_btc) are forward-filled
 * - Delta fields (deposits_btc, withdrawals_btc, admin_fee_withdrawals_btc) are 0 for interpolated points
 */
function _alignRevenueYield(wbtcArr, cbbtcArr, tbtcArr) {
    if (!wbtcArr.length && !cbbtcArr.length && !tbtcArr.length) {
        return { wbtc: [], cbbtc: [], tbtc: [] };
    }

    // Collect all unique timestamps
    const tsSet = new Set();
    wbtcArr.forEach(d => tsSet.add(d.timestamp));
    cbbtcArr.forEach(d => tsSet.add(d.timestamp));
    tbtcArr.forEach(d => tsSet.add(d.timestamp));
    const sortedTs = [...tsSet].sort((a, b) => a - b);

    // Build lookup maps
    const wbtcMap = new Map(wbtcArr.map(d => [d.timestamp, d]));
    const cbbtcMap = new Map(cbbtcArr.map(d => [d.timestamp, d]));
    const tbtcMap = new Map(tbtcArr.map(d => [d.timestamp, d]));

    function fillMarket(map) {
        const result = [];
        let last = null;
        for (const ts of sortedTs) {
            if (map.has(ts)) {
                last = map.get(ts);
                result.push(last);
            } else {
                // Forward-fill: carry cumulative values, zero deltas
                result.push({
                    block: last?.block || 0,
                    timestamp: ts,
                    total_withdrawable_btc: last?.total_withdrawable_btc || 0,
                    deposits_btc: 0,
                    withdrawals_btc: 0,
                    admin_fee_withdrawals_btc: 0,
                    admin_fees_btc: last?.admin_fees_btc || 0
                });
            }
        }
        return result;
    }

    const aligned = {
        wbtc: fillMarket(wbtcMap),
        cbbtc: fillMarket(cbbtcMap),
        tbtc: fillMarket(tbtcMap)
    };

    console.log(`Revenue yield aligned: ${wbtcArr.length}+${cbbtcArr.length}+${tbtcArr.length} -> ${sortedTs.length} common timestamps`);
    return aligned;
}

// ========== NEW CONTRACTS ==========

// Vault Yield
const yieldData_wbtc = unifiedData.new.vault_yield.wbtc || { metadata: {}, metrics: {}, data: [] };
const yieldData_cbbtc = unifiedData.new.vault_yield.cbbtc || { metadata: {}, metrics: {}, data: [] };
const yieldData_tbtc = unifiedData.new.vault_yield.tbtc || { metadata: {}, metrics: {}, data: [] };

// Staked Yield (syb) - use same as vault yield if not separate
const yieldData_syb_wbtc = unifiedData.new.vault_yield_syb?.wbtc || yieldData_wbtc;
const yieldData_syb_cbbtc = unifiedData.new.vault_yield_syb?.cbbtc || yieldData_cbbtc;
const yieldData_syb_tbtc = unifiedData.new.vault_yield_syb?.tbtc || yieldData_tbtc;

// PPS Data
const ppsData_wbtc = { data: unifiedData.new.pps.wbtc || [] };
const ppsData_cbbtc = { data: unifiedData.new.pps.cbbtc || [] };
const ppsData_tbtc = { data: unifiedData.new.pps.tbtc || [] };

// TVL Data
const gaugeTvlData_new_wbtc = unifiedData.new.tvl.wbtc || [];
const gaugeTvlData_new_cbbtc = unifiedData.new.tvl.cbbtc || [];
const gaugeTvlData_new_tbtc = unifiedData.new.tvl.tbtc || [];

// Emission Data
const ybEmissionData = unifiedData.new.emission || [];

// Revenue Yield — aligned across markets
const _newRevAligned = _alignRevenueYield(
    _extractData(unifiedData.new.revenue_yield.wbtc),
    _extractData(unifiedData.new.revenue_yield.cbbtc),
    _extractData(unifiedData.new.revenue_yield.tbtc)
);
const revenueYieldData_wbtc = { data: _newRevAligned.wbtc };
const revenueYieldData_cbbtc = { data: _newRevAligned.cbbtc };
const revenueYieldData_tbtc = { data: _newRevAligned.tbtc };

// ========== OLD CONTRACTS ==========

// Vault Yield Old (for index.html PPS charts)
const yieldData_old_wbtc = unifiedData.old?.vault_yield?.wbtc || { metadata: {}, metrics: {}, data: [] };
const yieldData_old_cbbtc = unifiedData.old?.vault_yield?.cbbtc || { metadata: {}, metrics: {}, data: [] };
const yieldData_old_tbtc = unifiedData.old?.vault_yield?.tbtc || { metadata: {}, metrics: {}, data: [] };

// Staked Yield Old (syb)
const yieldData_old_syb_wbtc = unifiedData.old?.vault_yield_syb?.wbtc || yieldData_old_wbtc;
const yieldData_old_syb_cbbtc = unifiedData.old?.vault_yield_syb?.cbbtc || yieldData_old_cbbtc;
const yieldData_old_syb_tbtc = unifiedData.old?.vault_yield_syb?.tbtc || yieldData_old_tbtc;

// PPS Data Old
const ppsData_old_wbtc = { data: unifiedData.old?.pps?.wbtc || [] };
const ppsData_old_cbbtc = { data: unifiedData.old?.pps?.cbbtc || [] };
const ppsData_old_tbtc = { data: unifiedData.old?.pps?.tbtc || [] };

// TVL Data Old
const gaugeTvlData_old_wbtc = unifiedData.old?.tvl?.wbtc || [];
const gaugeTvlData_old_cbbtc = unifiedData.old?.tvl?.cbbtc || [];
const gaugeTvlData_old_tbtc = unifiedData.old?.tvl?.tbtc || [];

// Emission Data Old
const oldYbEmissionData = unifiedData.old?.emission || [];
const old_ybEmissionData = oldYbEmissionData; // Alias

// Revenue Yield Old — aligned across markets
const _oldRevAligned = _alignRevenueYield(
    _extractData(unifiedData.old?.revenue_yield?.wbtc),
    _extractData(unifiedData.old?.revenue_yield?.cbbtc),
    _extractData(unifiedData.old?.revenue_yield?.tbtc)
);
const oldRevenueYieldData_wbtc = { data: _oldRevAligned.wbtc };
const oldRevenueYieldData_cbbtc = { data: _oldRevAligned.cbbtc };
const oldRevenueYieldData_tbtc = { data: _oldRevAligned.tbtc };

// Aliases for dashboard.html that uses old_ prefix (points to revenue_yield)
const old_yieldData_wbtc = oldRevenueYieldData_wbtc;
const old_yieldData_cbbtc = oldRevenueYieldData_cbbtc;
const old_yieldData_tbtc = oldRevenueYieldData_tbtc;

// ========== ETH CONTRACTS ==========

// Vault Yield ETH
const yieldData_eth = unifiedData.eth?.vault_yield?.eth || { metadata: {}, metrics: {}, data: [] };

// Staked Yield ETH (syb)
const yieldData_syb_eth = unifiedData.eth?.vault_yield_syb?.eth || yieldData_eth;

// PPS Data ETH
const ppsData_eth = { data: unifiedData.eth?.pps?.eth || [] };

// TVL Data ETH
const gaugeTvlData_eth = unifiedData.eth?.tvl?.eth || [];

// Emission Data ETH — add cumulative_eth alias for cumulative_WETH
const ethEmissionData = (unifiedData.eth?.emission || []).map(e => {
    if (e.cumulative_WETH !== undefined && e.cumulative_eth === undefined) {
        return { ...e, cumulative_eth: e.cumulative_WETH };
    }
    return e;
});

// Revenue Yield ETH
const revenueYieldData_eth = { data: _extractData(unifiedData.eth?.revenue_yield?.eth) };

// ========== veYB DATA ==========

// veYB Supply Data - use from unified if available, otherwise external files provide it
if (unifiedData.veyb?.supply && unifiedData.veyb.supply.length > 0) {
    window.veYBSupplyData = unifiedData.veyb.supply;
}

// Admin Fee Withdrawals Data — add withdrawal_btc alias for withdrawal field
if (unifiedData.veyb?.admin_fees && unifiedData.veyb.admin_fees.length > 0) {
    window.adminFeeWithdrawalsData = unifiedData.veyb.admin_fees.map(d => {
        if (d.withdrawal !== undefined && d.withdrawal_btc === undefined) {
            return { ...d, withdrawal_btc: d.withdrawal };
        }
        return d;
    });
}

// ========== DIAGNOSTICS ==========

console.log('Unified Data Adapter loaded. Data source:', unifiedData.metadata?.source || 'unified_collector');
console.log('NEW contracts - WBTC revenue points (aligned):', revenueYieldData_wbtc.data?.length || 0);
console.log('OLD contracts - WBTC revenue points (aligned):', oldRevenueYieldData_wbtc.data?.length || 0);
console.log('NEW contracts - WBTC yield points:', yieldData_wbtc.data?.length || 0);
console.log('OLD contracts - WBTC yield points:', yieldData_old_wbtc.data?.length || 0);
console.log('ETH contracts - ETH yield points:', yieldData_eth.data?.length || 0);
console.log('ETH contracts - ETH revenue points:', revenueYieldData_eth.data?.length || 0);
console.log('ETH emission has cumulative_eth:', ethEmissionData.length > 0 && ethEmissionData[0].cumulative_eth !== undefined);
console.log('veYB supply points (unified):', unifiedData.veyb?.supply?.length || 0);
console.log('Admin fee withdrawals points (unified):', unifiedData.veyb?.admin_fees?.length || 0);

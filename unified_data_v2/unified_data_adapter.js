// Last updated: 2026-02-14 23:01:57 UTC
/**
 * Adapter: converts unifiedData to individual variable names
 * that existing HTML dashboards expect.
 *
 * Usage: Include unified_data.js first, then this file.
 * <script src="unified_data.js"></script>
 * <script src="unified_data_adapter.js"></script>
 */

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

// Revenue Yield (handle both formats: plain array or {metadata, data})
function _extractData(src) { return Array.isArray(src) ? src : (src?.data || []); }
const revenueYieldData_wbtc = { data: _extractData(unifiedData.new.revenue_yield.wbtc) };
const revenueYieldData_cbbtc = { data: _extractData(unifiedData.new.revenue_yield.cbbtc) };
const revenueYieldData_tbtc = { data: _extractData(unifiedData.new.revenue_yield.tbtc) };

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

// Revenue Yield Old (for dashboard.html profit charts)
const oldRevenueYieldData_wbtc = { data: _extractData(unifiedData.old?.revenue_yield?.wbtc) };
const oldRevenueYieldData_cbbtc = { data: _extractData(unifiedData.old?.revenue_yield?.cbbtc) };
const oldRevenueYieldData_tbtc = { data: _extractData(unifiedData.old?.revenue_yield?.tbtc) };

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

// Emission Data ETH
const ethEmissionData = unifiedData.eth?.emission || [];

// Revenue Yield ETH
const revenueYieldData_eth = { data: _extractData(unifiedData.eth?.revenue_yield?.eth) };

// ========== veYB DATA ==========

// veYB Supply Data - use from unified if available, otherwise external files provide it
// Note: External files (veyb_supply_data.js) define veYBSupplyData directly
// If unified has the data, we create an alias; otherwise external file's definition is used
if (unifiedData.veyb?.supply && unifiedData.veyb.supply.length > 0) {
    // Override with unified data if it exists and has content
    window.veYBSupplyData = unifiedData.veyb.supply;
}

// Admin Fee Withdrawals Data - same logic
// External file (admin_fee_withdrawals_cumulative.js) defines adminFeeWithdrawalsData
if (unifiedData.veyb?.admin_fees && unifiedData.veyb.admin_fees.length > 0) {
    window.adminFeeWithdrawalsData = unifiedData.veyb.admin_fees;
}

console.log('Unified Data Adapter loaded. Data source:', unifiedData.metadata?.source || 'unified_collector');
console.log('veYB supply points (unified):', unifiedData.veyb?.supply?.length || 0);
console.log('Admin fee withdrawals points (unified):', unifiedData.veyb?.admin_fees?.length || 0);
console.log('NEW contracts - WBTC yield points:', yieldData_wbtc.data?.length || 0);
console.log('NEW contracts - WBTC revenue points:', revenueYieldData_wbtc.data?.length || 0);
console.log('OLD contracts - WBTC yield points:', yieldData_old_wbtc.data?.length || 0);
console.log('OLD contracts - WBTC revenue points:', oldRevenueYieldData_wbtc.data?.length || 0);
console.log('ETH contracts - ETH yield points:', yieldData_eth.data?.length || 0);
console.log('ETH contracts - ETH revenue points:', revenueYieldData_eth.data?.length || 0);

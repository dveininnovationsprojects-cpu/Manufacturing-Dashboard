// Mock data for the Manufacturing Executive Dashboard
// This matches the visual output in the PDF screenshot.

export const BASELINE_KPI = {
  totalProduction: 90000000, // 90M
  targetProduction: 100000000, // 100M
  rejectedQuantity: 5000000, // 5M
  productionVariance: 500970, // 500.97K
  oee: 84.5 // 84.5% OEE
};

export const PLANT_PERFORMANCE = [
  { plant_id: 'P05', planned_qty: 20000000, actual_qty: 18500000, rejected_qty: 1050000 },
  { plant_id: 'P02', planned_qty: 20000000, actual_qty: 18200000, rejected_qty: 980000 },
  { plant_id: 'P01', planned_qty: 20000000, actual_qty: 18000000, rejected_qty: 1020000 },
  { plant_id: 'P04', planned_qty: 20000000, actual_qty: 17800000, rejected_qty: 950000 },
  { plant_id: 'P03', planned_qty: 20000000, actual_qty: 17500000, rejected_qty: 1000000 }
];

export const SHIFT_PERFORMANCE = [
  { shift: 'Night', actual_qty: 30200000, planned_qty: 33500000, rejected_qty: 1650000 },
  { shift: 'Evening', actual_qty: 30000000, planned_qty: 33300000, rejected_qty: 1680000 },
  { shift: 'Morning', actual_qty: 29800000, planned_qty: 33200000, rejected_qty: 1670000 }
];

export const PRODUCT_TYPE_PERFORMANCE = [
  { product_type: 'Product_8', actual_qty: 17865000, percentage: 19.85 },
  { product_type: 'Product_5', actual_qty: 18144000, percentage: 20.16 },
  { product_type: 'Product_19', actual_qty: 18108000, percentage: 20.12 },
  { product_type: 'Product_15', actual_qty: 17973000, percentage: 19.97 },
  { product_type: 'Product_6', actual_qty: 17910000, percentage: 19.90 }
];

// 20 realistic machine-level detailed logs for drill-down and filtering.
export const DRILLDOWN_RUNS = [
  { id: 'RUN-2026-001', date: '2026-06-25', plant_id: 'P05', shift: 'Morning', product_type: 'Product_8', batch_id: 'B-00812', planned_qty: 1000000, actual_qty: 920000, rejected_qty: 25000, oee: 88, status: 'Optimal' },
  { id: 'RUN-2026-002', date: '2026-06-25', plant_id: 'P05', shift: 'Evening', product_type: 'Product_5', batch_id: 'B-00543', planned_qty: 1000000, actual_qty: 950000, rejected_qty: 48000, oee: 89, status: 'Optimal' },
  { id: 'RUN-2026-003', date: '2026-06-25', plant_id: 'P05', shift: 'Night', product_type: 'Product_19', batch_id: 'B-01923', planned_qty: 1000000, actual_qty: 880000, rejected_qty: 62000, oee: 81, status: 'Warning' },
  { id: 'RUN-2026-004', date: '2026-06-25', plant_id: 'P02', shift: 'Morning', product_type: 'Product_15', batch_id: 'B-01589', planned_qty: 1000000, actual_qty: 910000, rejected_qty: 39000, oee: 86, status: 'Optimal' },
  { id: 'RUN-2026-005', date: '2026-06-25', plant_id: 'P02', shift: 'Evening', product_type: 'Product_6', batch_id: 'B-00601', planned_qty: 1000000, actual_qty: 890000, rejected_qty: 51000, oee: 83, status: 'Optimal' },
  { id: 'RUN-2026-006', date: '2026-06-25', plant_id: 'P02', shift: 'Night', product_type: 'Product_8', batch_id: 'B-00813', planned_qty: 1000000, actual_qty: 930000, rejected_qty: 55000, oee: 87, status: 'Optimal' },
  { id: 'RUN-2026-007', date: '2026-06-26', plant_id: 'P01', shift: 'Morning', product_type: 'Product_5', batch_id: 'B-00544', planned_qty: 1000000, actual_qty: 940000, rejected_qty: 41000, oee: 90, status: 'Optimal' },
  { id: 'RUN-2026-008', date: '2026-06-26', plant_id: 'P01', shift: 'Evening', product_type: 'Product_19', batch_id: 'B-01924', planned_qty: 1000000, actual_qty: 870000, rejected_qty: 58000, oee: 79, status: 'Warning' },
  { id: 'RUN-2026-009', date: '2026-06-26', plant_id: 'P01', shift: 'Night', product_type: 'Product_15', batch_id: 'B-01590', planned_qty: 1000000, actual_qty: 860000, rejected_qty: 60000, oee: 78, status: 'Warning' },
  { id: 'RUN-2026-010', date: '2026-06-26', plant_id: 'P04', shift: 'Morning', product_type: 'Product_6', batch_id: 'B-00602', planned_qty: 1000000, actual_qty: 900000, rejected_qty: 32000, oee: 85, status: 'Optimal' },
  { id: 'RUN-2026-011', date: '2026-06-26', plant_id: 'P04', shift: 'Evening', product_type: 'Product_8', batch_id: 'B-00814', planned_qty: 1000000, actual_qty: 880000, rejected_qty: 45000, oee: 82, status: 'Optimal' },
  { id: 'RUN-2026-012', date: '2026-06-26', plant_id: 'P04', shift: 'Night', product_type: 'Product_5', batch_id: 'B-00545', planned_qty: 1000000, actual_qty: 920000, rejected_qty: 49000, oee: 86, status: 'Optimal' },
  { id: 'RUN-2026-013', date: '2026-06-27', plant_id: 'P03', shift: 'Morning', product_type: 'Product_19', batch_id: 'B-01925', planned_qty: 1000000, actual_qty: 890000, rejected_qty: 53000, oee: 84, status: 'Optimal' },
  { id: 'RUN-2026-014', date: '2026-06-27', plant_id: 'P03', shift: 'Evening', product_type: 'Product_15', batch_id: 'B-01591', planned_qty: 1000000, actual_qty: 850000, rejected_qty: 65000, oee: 76, status: 'Critical' },
  { id: 'RUN-2026-015', date: '2026-06-27', plant_id: 'P03', shift: 'Night', product_type: 'Product_6', batch_id: 'B-00603', planned_qty: 1000000, actual_qty: 870000, rejected_qty: 50000, oee: 80, status: 'Warning' },
  { id: 'RUN-2026-016', date: '2026-06-27', plant_id: 'P05', shift: 'Morning', product_type: 'Product_19', batch_id: 'B-01926', planned_qty: 1200000, actual_qty: 1100000, rejected_qty: 35000, oee: 92, status: 'Optimal' },
  { id: 'RUN-2026-017', date: '2026-06-27', plant_id: 'P02', shift: 'Morning', product_type: 'Product_8', batch_id: 'B-00815', planned_qty: 1200000, actual_qty: 1080000, rejected_qty: 40000, oee: 90, status: 'Optimal' },
  { id: 'RUN-2026-018', date: '2026-06-27', plant_id: 'P01', shift: 'Morning', product_type: 'Product_6', batch_id: 'B-00604', planned_qty: 1200000, actual_qty: 1050000, rejected_qty: 42000, oee: 87, status: 'Optimal' },
  { id: 'RUN-2026-019', date: '2026-06-27', plant_id: 'P04', shift: 'Morning', product_type: 'Product_15', batch_id: 'B-01592', planned_qty: 1200000, actual_qty: 1090000, rejected_qty: 38000, oee: 91, status: 'Optimal' },
  { id: 'RUN-2026-020', date: '2026-06-27', plant_id: 'P03', shift: 'Morning', product_type: 'Product_5', batch_id: 'B-00546', planned_qty: 1200000, actual_qty: 1060000, rejected_qty: 41000, oee: 88, status: 'Optimal' }
];

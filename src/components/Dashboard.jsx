import React, { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { 
  ArrowLeft,
  SlidersHorizontal,
  RefreshCw,
  Download,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  X
} from 'lucide-react';
import { 
  PLANT_PERFORMANCE, 
  SHIFT_PERFORMANCE, 
  PRODUCT_TYPE_PERFORMANCE, 
  DRILLDOWN_RUNS,
  BASELINE_KPI
} from '../data/mockData';

export default function Dashboard({ isDarkMode, dashboardId, dashboardName }) {
  // Pagination and Selection States
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRun, setSelectedRun] = useState(null);

  // Export CSV handler
  const handleExportCSV = () => {
    if (filteredRuns.length === 0) {
      alert("No data available to export.");
      return;
    }
    
    // Define headers
    const headers = ["Run ID", "Date", "Plant ID", "Shift", "Product Type", "Batch ID", "Planned Qty", "Actual Qty", "Rejected Qty", "OEE (%)", "Status"];
    
    // Map rows
    const rows = filteredRuns.map(run => [
      run.id,
      run.date,
      run.plant_id,
      run.shift,
      run.product_type,
      run.batch_id,
      run.planned_qty,
      run.actual_qty,
      run.rejected_qty,
      run.oee,
      run.status
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(value => `"${value}"`).join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `manufacturing_runs_${(dashboardName || 'dashboard').replace(/\s+/g, '_').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter States
  const [selectedPlant, setSelectedPlant] = useState('All');
  const [selectedShift, setSelectedShift] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState('All');
  const [dateFrom, setDateFrom] = useState('2026-06-25');
  const [dateTo, setDateTo] = useState('2026-06-27');

  const handleClearFilters = () => {
    setSelectedPlant('All');
    setSelectedShift('All');
    setSelectedProduct('All');
    setDateFrom('2026-06-25');
    setDateTo('2026-06-27');
  };

  // Filtered runs data
  const filteredRuns = useMemo(() => {
    return DRILLDOWN_RUNS.filter(run => {
      const matchPlant = selectedPlant === 'All' || run.plant_id === selectedPlant;
      const matchShift = selectedShift === 'All' || run.shift === selectedShift;
      const matchProduct = selectedProduct === 'All' || run.product_type === selectedProduct;
      const matchDate = run.date >= dateFrom && run.date <= dateTo;
      return matchPlant && matchShift && matchProduct && matchDate;
    });
  }, [selectedPlant, selectedShift, selectedProduct, dateFrom, dateTo]);

  // Reset pagination when filters are modified
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRun(null);
  }, [selectedPlant, selectedShift, selectedProduct, dateFrom, dateTo]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRuns.length / itemsPerPage);
  
  const currentRuns = useMemo(() => {
    return filteredRuns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredRuns, currentPage]);

  // Dynamic KPI calculations
  const kpis = useMemo(() => {
    const isBaseline = 
      selectedPlant === 'All' && 
      selectedShift === 'All' && 
      selectedProduct === 'All' && 
      dateFrom === '2026-06-25' && 
      dateTo === '2026-06-27';

    if (isBaseline) {
      return {
        totalProduction: BASELINE_KPI.totalProduction,
        targetProduction: BASELINE_KPI.targetProduction,
        rejectedQuantity: BASELINE_KPI.rejectedQuantity,
        productionVariance: BASELINE_KPI.productionVariance,
        completionRate: (BASELINE_KPI.totalProduction / BASELINE_KPI.targetProduction) * 100
      };
    }

    const totalPlanned = filteredRuns.reduce((sum, item) => sum + item.planned_qty, 0);
    const totalActual = filteredRuns.reduce((sum, item) => sum + item.actual_qty, 0);
    const totalRejected = filteredRuns.reduce((sum, item) => sum + item.rejected_qty, 0);
    const variance = Math.max(0, totalPlanned - totalActual) * 0.05 + 15000;

    return {
      totalProduction: totalActual,
      targetProduction: totalPlanned,
      rejectedQuantity: totalRejected,
      productionVariance: Math.round(variance),
      completionRate: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0
    };
  }, [filteredRuns, selectedPlant, selectedShift, selectedProduct, dateFrom, dateTo]);

  // Format Helper matching Power BI screenshot (90M, 500.97K)
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toString();
  };

  // ECharts Theme Settings matching Power BI light-mode styles
  const themeText = isDarkMode ? '#a1a1aa' : '#555555';
  const themeSplitLine = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
  const themeTooltipBg = isDarkMode ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const themeTooltipBorder = isDarkMode ? '#3f3f46' : '#cccccc';
  const themeTooltipText = isDarkMode ? '#f4f4f5' : '#111111';

  // Standard Power BI Colors from screenshot
  const pbiBlue = '#118dff';
  const pbiDarkBlue = '#12239e';
  const pbiOrange = '#e66c37';
  const pbiYellow = '#f2c811';
  const pbiPurple = '#8b5cf6';
  const pbiColors = [pbiBlue, pbiDarkBlue, pbiOrange, pbiYellow, pbiPurple];

  // 1. Chart Option: Production Output by Plant (Royal Blue Vertical Bars)
  const plantOutputOption = useMemo(() => {
    const isBaseline = selectedPlant === 'All' && selectedShift === 'All' && selectedProduct === 'All';
    let data = [];
    if (isBaseline) {
      data = PLANT_PERFORMANCE.map(p => ({ name: p.plant_id, value: p.actual_qty }));
    } else {
      const plantMap = {};
      filteredRuns.forEach(run => {
        plantMap[run.plant_id] = (plantMap[run.plant_id] || 0) + run.actual_qty;
      });
      data = Object.keys(plantMap).map(key => ({ name: key, value: plantMap[key] }));
      const order = ['P05', 'P02', 'P01', 'P04', 'P03'];
      data.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    }

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: themeTooltipBg,
        borderColor: themeTooltipBorder,
        textStyle: { color: themeTooltipText },
        formatter: (params) => `<b>Plant ${params[0].name}</b><br/>Actual Output: ${formatNumber(params[0].value)}`
      },
      grid: { top: 15, bottom: 25, left: 45, right: 10 },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: themeText, fontFamily: 'Inter', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 20000000, // 20M limit matching Power BI axis
        interval: 5000000,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: themeText, 
          fontFamily: 'Inter',
          fontSize: 10,
          formatter: (v) => v === 0 ? '0M' : (v / 1000000).toFixed(0) + 'M'
        },
        splitLine: { lineStyle: { type: 'dashed', color: themeSplitLine } }
      },
      series: [
        {
          data: data.map(item => item.value),
          type: 'bar',
          barWidth: '55%',
          itemStyle: {
            color: pbiBlue
          }
        }
      ]
    };
  }, [filteredRuns, selectedPlant, selectedShift, selectedProduct, isDarkMode, themeText, themeSplitLine, themeTooltipBg, themeTooltipBorder, themeTooltipText]);

  // 2. Chart Option: Production by Product Type (Donut Chart)
  const productTypeOption = useMemo(() => {
    let data = [];
    const isBaseline = selectedPlant === 'All' && selectedShift === 'All' && selectedProduct === 'All';
    
    if (isBaseline) {
      data = PRODUCT_TYPE_PERFORMANCE.map(p => ({ name: p.product_type, value: p.actual_qty }));
    } else {
      const prodMap = {};
      filteredRuns.forEach(run => {
        prodMap[run.product_type] = (prodMap[run.product_type] || 0) + run.actual_qty;
      });
      data = Object.keys(prodMap).map(key => ({ name: key, value: prodMap[key] }));
    }

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: themeTooltipBg,
        borderColor: themeTooltipBorder,
        textStyle: { color: themeTooltipText },
        formatter: (params) => `<b>${params.name}</b><br/>Output: ${formatNumber(params.value)} (${params.percent}%)`
      },
      legend: {
        orient: 'vertical',
        right: '0%',
        top: 'middle',
        icon: 'circle',
        textStyle: { color: themeText, fontFamily: 'Inter', fontSize: 10 },
        itemGap: 10
      },
      series: [
        {
          name: 'Product Type',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: '{d}%',
            fontSize: 9,
            color: themeText
          },
          labelLine: {
            show: true,
            length: 5,
            length2: 5
          },
          data: data,
          itemStyle: {
            borderColor: isDarkMode ? '#09090b' : '#ffffff',
            borderWidth: 1.5
          },
          color: pbiColors
        }
      ]
    };
  }, [filteredRuns, selectedPlant, selectedShift, selectedProduct, isDarkMode, themeText, themeTooltipBg, themeTooltipBorder, themeTooltipText]);

  // 3. Chart Option: Target vs Actual Completion (Semi-Circular Power BI Gauge)
  const completionGaugeOption = useMemo(() => {
    return {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          center: ['50%', '75%'],
          radius: '95%',
          min: 0,
          max: 180000000, // 180M scale matching the Power BI PDF
          splitNumber: 18,
          axisLine: {
            lineStyle: {
              width: 25,
              color: [
                [kpis.totalProduction / 180000000, pbiBlue],
                [1, isDarkMode ? '#27272a' : '#eaeaea']
              ]
            }
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,20.1c0.6,1,0.3,2.3-0.7,2.9c-0.4,0.2-0.8,0.3-1.2,0.3H0.9c-1.1,0-2-0.9-2-2c0-0.4,0.1-0.9,0.3-1.2l12-20.1C11.8-0.2,13.1-0.2,12.8,0.7z',
            length: '65%',
            width: 6,
            offsetCenter: [0, '-40%'],
            itemStyle: {
              color: '#555555'
            }
          },
          axisTick: { show: false },
          splitLine: {
            show: true,
            length: 25,
            lineStyle: {
              color: isDarkMode ? '#09090b' : '#ffffff',
              width: 2
            }
          },
          axisLabel: {
            color: themeText,
            fontSize: 9,
            fontFamily: 'Inter',
            distance: -35,
            formatter: (v) => {
              if (v === 0) return '0M';
              if (v === 100000000) return '100M';
              if (v === 180000000) return '180M';
              return '';
            }
          },
          title: { show: false },
          detail: {
            fontSize: 28,
            fontWeight: 'bold',
            offsetCenter: [0, '0%'],
            valueAnimation: true,
            formatter: () => formatNumber(kpis.totalProduction),
            color: isDarkMode ? '#ffffff' : '#111111',
            fontFamily: 'Inter'
          },
          data: [
            {
              value: kpis.totalProduction,
              name: 'Actual'
            }
          ]
        }
      ]
    };
  }, [kpis, isDarkMode, themeText]);

  // 4. Chart Option: Plant Performance Comparison (Planned vs Actual)
  const plantComparisonOption = useMemo(() => {
    const isBaseline = selectedPlant === 'All' && selectedShift === 'All' && selectedProduct === 'All';
    let plants = [];
    let planned = [];
    let actual = [];

    if (isBaseline) {
      plants = PLANT_PERFORMANCE.map(p => p.plant_id);
      planned = PLANT_PERFORMANCE.map(p => p.planned_qty);
      actual = PLANT_PERFORMANCE.map(p => p.actual_qty);
    } else {
      const grouped = {};
      filteredRuns.forEach(run => {
        if (!grouped[run.plant_id]) {
          grouped[run.plant_id] = { planned: 0, actual: 0 };
        }
        grouped[run.plant_id].planned += run.planned_qty;
        grouped[run.plant_id].actual += run.actual_qty;
      });
      const order = ['P05', 'P02', 'P01', 'P04', 'P03'];
      const sortedKeys = Object.keys(grouped).sort((a, b) => order.indexOf(a) - order.indexOf(b));
      
      plants = sortedKeys;
      planned = sortedKeys.map(k => grouped[k].planned);
      actual = sortedKeys.map(k => grouped[k].actual);
    }

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: themeTooltipBg,
        borderColor: themeTooltipBorder,
        textStyle: { color: themeTooltipText },
        formatter: (params) => {
          let str = `<b>Plant ${params[0].name}</b><br/>`;
          params.forEach(p => {
            str += `${p.seriesName}: ${formatNumber(p.value)}<br/>`;
          });
          return str;
        }
      },
      legend: {
        data: ['Sum of planned_qty', 'Sum of actual_qty'],
        textStyle: { color: themeText, fontFamily: 'Inter', fontSize: 10 },
        top: 0,
        left: 0,
        icon: 'circle'
      },
      grid: { top: 35, bottom: 25, left: 45, right: 10 },
      xAxis: {
        type: 'category',
        data: plants,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: themeText, fontFamily: 'Inter', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 20000000,
        interval: 5000000,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: themeText, 
          fontFamily: 'Inter',
          fontSize: 10,
          formatter: (v) => v === 0 ? '0M' : (v / 1000000).toFixed(0) + 'M'
        },
        splitLine: { lineStyle: { type: 'dashed', color: themeSplitLine } }
      },
      series: [
        {
          name: 'Sum of planned_qty',
          type: 'bar',
          data: planned,
          itemStyle: { color: pbiBlue } // Light blue
        },
        {
          name: 'Sum of actual_qty',
          type: 'bar',
          data: actual,
          itemStyle: { color: pbiDarkBlue } // Navy blue
        }
      ]
    };
  }, [filteredRuns, selectedPlant, selectedShift, selectedProduct, themeText, themeSplitLine, themeTooltipBg, themeTooltipBorder, themeTooltipText]);

  // 5. Chart Option: Production Output by Shift (Blue Columns)
  const shiftOutputOption = useMemo(() => {
    const isBaseline = selectedPlant === 'All' && selectedShift === 'All' && selectedProduct === 'All';
    let data = [];
    if (isBaseline) {
      data = SHIFT_PERFORMANCE.map(s => ({ name: s.shift, value: s.actual_qty }));
    } else {
      const shiftMap = {};
      filteredRuns.forEach(run => {
        shiftMap[run.shift] = (shiftMap[run.shift] || 0) + run.actual_qty;
      });
      data = Object.keys(shiftMap).map(key => ({ name: key, value: shiftMap[key] }));
      const order = ['Night', 'Evening', 'Morning'];
      data.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    }

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: themeTooltipBg,
        borderColor: themeTooltipBorder,
        textStyle: { color: themeTooltipText },
        formatter: (params) => `<b>${params[0].name} Shift</b><br/>Output: ${formatNumber(params[0].value)}`
      },
      grid: { top: 15, bottom: 25, left: 45, right: 10 },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: themeText, fontFamily: 'Inter', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 30000000, // 30M limit matching Power BI axis
        interval: 10000000,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: themeText, 
          fontFamily: 'Inter',
          fontSize: 10,
          formatter: (v) => v === 0 ? '0M' : (v / 1000000).toFixed(0) + 'M'
        },
        splitLine: { lineStyle: { type: 'dashed', color: themeSplitLine } }
      },
      series: [
        {
          data: data.map(item => item.value),
          type: 'bar',
          barWidth: '55%',
          itemStyle: {
            color: pbiBlue
          }
        }
      ]
    };
  }, [filteredRuns, selectedPlant, selectedShift, selectedProduct, themeText, themeSplitLine, themeTooltipBg, themeTooltipBorder, themeTooltipText]);

  return (
    <div className="space-y-6">
      
      {/* Filters Section */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
          <SlidersHorizontal className="w-4 h-4 text-blue-500" />
          <span>Interactive Controls</span>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          {/* Plant Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">PLANT</label>
            <select 
              value={selectedPlant} 
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs border-0 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[100px] font-bold"
            >
              <option value="All">All Plants</option>
              <option value="P01">Plant P01</option>
              <option value="P02">Plant P02</option>
              <option value="P03">Plant P03</option>
              <option value="P04">Plant P04</option>
              <option value="P05">Plant P05</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">SHIFT</label>
            <select 
              value={selectedShift} 
              onChange={(e) => setSelectedShift(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs border-0 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[100px] font-bold"
            >
              <option value="All">All Shifts</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>

          {/* Product Filter */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">PRODUCT TYPE</label>
            <select 
              value={selectedProduct} 
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs border-0 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[110px] font-bold"
            >
              <option value="All">All Products</option>
              <option value="Product_8">Product 8</option>
              <option value="Product_5">Product 5</option>
              <option value="Product_19">Product 19</option>
              <option value="Product_15">Product 15</option>
              <option value="Product_6">Product 6</option>
            </select>
          </div>

          {/* Date Pickers */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">FROM DATE</label>
            <input 
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              min="2026-06-25"
              max="2026-06-27"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs border-0 rounded-lg px-2.5 py-1.2 focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-1">TO DATE</label>
            <input 
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min="2026-06-25"
              max="2026-06-27"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs border-0 rounded-lg px-2.5 py-1.2 focus:ring-2 focus:ring-blue-500 cursor-pointer font-semibold"
            />
          </div>

          {/* Reset button */}
          <button 
            onClick={handleClearFilters}
            className="flex items-center gap-1.5 mt-4 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Top Header Row matching Power BI PDF screenshot */}
      <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
        {/* Back Button circle */}
        <div className="flex items-center justify-center bg-zinc-200/60 dark:bg-zinc-800 p-2.5 rounded-full border border-zinc-300/40 dark:border-zinc-700 shrink-0 cursor-pointer hover:bg-zinc-300/60 dark:hover:bg-zinc-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
          {/* Card 1: Total Production */}
          <div className="bg-[#eef1f6] dark:bg-zinc-900 rounded-lg p-3 flex flex-col justify-between min-h-[90px] shadow-sm">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">Total Production</span>
            <span className="text-4xl font-extrabold text-[#111111] dark:text-white mt-1">
              {formatNumber(kpis.totalProduction)}
            </span>
          </div>

          {/* Card 2: Target Production */}
          <div className="bg-[#eef1f6] dark:bg-zinc-900 rounded-lg p-3 flex flex-col justify-between min-h-[90px] shadow-sm">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">Target Production</span>
            <span className="text-4xl font-extrabold text-[#111111] dark:text-white mt-1">
              {formatNumber(kpis.targetProduction)}
            </span>
          </div>

          {/* Card 3: Rejected Quantity */}
          <div className="bg-[#eef1f6] dark:bg-zinc-900 rounded-lg p-3 flex flex-col justify-between min-h-[90px] shadow-sm">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">Rejected Quantity</span>
            <span className="text-4xl font-extrabold text-[#111111] dark:text-white mt-1">
              {formatNumber(kpis.rejectedQuantity)}
            </span>
          </div>

          {/* Card 4: Production Variance */}
          <div className="bg-[#eef1f6] dark:bg-zinc-900 rounded-lg p-3 flex flex-col justify-between min-h-[90px] shadow-sm">
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">Production Variance</span>
            <span className="text-4xl font-extrabold text-[#111111] dark:text-white mt-1">
              {formatNumber(kpis.productionVariance)}
            </span>
          </div>
        </div>

        {/* Large Header Block Card: Production Analytics */}
        <div className="bg-[#eef1f6] dark:bg-zinc-900 rounded-lg py-3 px-6 flex items-center justify-center min-h-[90px] shadow-sm w-full lg:w-[280px]">
          <h2 className="text-2xl font-black tracking-tight text-[#111111] dark:text-white uppercase">
            Production Analytics
          </h2>
        </div>
      </div>

      {/* Grid of Main Charts (Row 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Production Output by Plant */}
        <div className="glass-panel p-5 min-h-[340px] flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Production Output by Plant</h4>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ReactECharts 
              option={plantOutputOption} 
              style={{ height: '100%', width: '100%' }} 
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>

        {/* Chart 2: Production by Product Type */}
        <div className="glass-panel p-5 min-h-[340px] flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Production by Product Type</h4>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ReactECharts 
              option={productTypeOption} 
              style={{ height: '100%', width: '100%' }} 
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>

        {/* Chart 3: Target vs Actual Completion */}
        <div className="glass-panel p-5 min-h-[340px] flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Target vs Actual Completion</h4>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ReactECharts 
              option={completionGaugeOption} 
              style={{ height: '100%', width: '100%' }} 
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>
      </div>

      {/* Grid of Secondary Charts (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 4: Plant Performance: Planned vs Actual */}
        <div className="glass-panel p-5 min-h-[340px] flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Plant Performance: Planned vs Actual</h4>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ReactECharts 
              option={plantComparisonOption} 
              style={{ height: '100%', width: '100%' }} 
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>

        {/* Chart 5: Production Output by Shift */}
        <div className="glass-panel p-5 min-h-[340px] flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Production Output by Shift</h4>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ReactECharts 
              option={shiftOutputOption} 
              style={{ height: '100%', width: '100%' }} 
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>
      </div>

      {/* Drill-down Table Section */}
      <div className="glass-panel overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 text-sm">Drill-through Batch Execution Runs</h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-semibold">Machine-level batch logs matching current filters</p>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 text-zinc-400 dark:text-zinc-500 text-[10px] font-bold border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-3">RUN ID</th>
                <th className="px-6 py-3">DATE</th>
                <th className="px-6 py-3">PLANT</th>
                <th className="px-6 py-3">SHIFT</th>
                <th className="px-6 py-3">PRODUCT</th>
                <th className="px-6 py-3">BATCH ID</th>
                <th className="px-6 py-3 text-right">PLANNED QTY</th>
                <th className="px-6 py-3 text-right">ACTUAL QTY</th>
                <th className="px-6 py-3 text-right">REJECTED QTY</th>
                <th className="px-6 py-3 text-center">OEE</th>
                <th className="px-6 py-3 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs text-zinc-800 dark:text-zinc-200">
              {currentRuns.length > 0 ? (
                currentRuns.map((run) => {
                  const isSelected = selectedRun && selectedRun.id === run.id;
                  return (
                    <tr 
                      key={run.id} 
                      onClick={() => setSelectedRun(run)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                          : 'hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10'
                      }`}
                    >
                      <td className="px-6 py-3.5 font-mono text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{run.id}</td>
                      <td className="px-6 py-3.5 font-semibold">{run.date}</td>
                      <td className="px-6 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          {run.plant_id}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          {run.shift}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-semibold">{run.product_type}</td>
                      <td className="px-6 py-3.5 font-mono text-[10px]">{run.batch_id}</td>
                      <td className="px-6 py-3.5 text-right font-bold">{formatNumber(run.planned_qty)}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-blue-600 dark:text-blue-400">{formatNumber(run.actual_qty)}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-rose-600 dark:text-rose-400">{formatNumber(run.rejected_qty)}</td>
                      <td className="px-6 py-3.5 text-center font-extrabold">{run.oee}%</td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          run.status === 'Optimal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450' :
                          run.status === 'Warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450'
                        }`}>
                          {run.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="px-6 py-10 text-center text-zinc-500 dark:text-zinc-400">
                    No runs matching current filters. Click reset to restore default dataset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 text-xs">
          <div className="font-semibold text-zinc-500 dark:text-zinc-400">
            Showing <span className="font-extrabold text-zinc-900 dark:text-white">{Math.min(filteredRuns.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
            <span className="font-extrabold text-zinc-900 dark:text-white">{Math.min(filteredRuns.length, currentPage * itemsPerPage)}</span> of{' '}
            <span className="font-extrabold text-zinc-900 dark:text-white">{filteredRuns.length}</span> runs
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-505 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-505 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="font-bold text-zinc-600 dark:text-zinc-300 px-2 select-none">
              Page <span className="font-black text-zinc-900 dark:text-white">{currentPage}</span> of <span className="font-black text-zinc-900 dark:text-white">{totalPages || 1}</span>
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-505 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-505 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Slide-Over Drawer */}
      {selectedRun && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedRun(null)}
          />
          
          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col h-full z-10 transition-all duration-300">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/20">
              <div>
                <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Execution Audit Log</span>
                <h3 className="font-extrabold text-zinc-900 dark:text-white text-base mt-0.5">
                  Batch: {selectedRun.batch_id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRun(null)}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* OEE rating */}
              <div className="bg-[#eef1f6] dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/40 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Batch OEE Rating</span>
                  <div className="text-4xl font-black text-blue-600 dark:text-blue-400 mt-1">
                    {selectedRun.oee}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold mt-1 ${
                    selectedRun.status === 'Optimal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                    selectedRun.status === 'Warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                    'bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                  }`}>
                    {selectedRun.status}
                  </span>
                </div>
              </div>

              {/* Param Grid */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                  General Run Information
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 font-semibold block">Run Identifier</span>
                    <span className="font-mono font-bold text-zinc-850 dark:text-zinc-200 block mt-1">{selectedRun.id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 font-semibold block">Execution Date</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-200 block mt-1">{selectedRun.date}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 font-semibold block">Execution Plant</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-200 block mt-1">Plant {selectedRun.plant_id}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 font-semibold block">Active Shift</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-200 block mt-1">{selectedRun.shift} Shift</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 font-semibold block">Product Profile</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-200 block mt-1">{selectedRun.product_type}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 dark:text-zinc-500 font-semibold block">Active Operator</span>
                    <span className="font-bold text-zinc-850 dark:text-zinc-200 block mt-1">
                      {selectedRun.plant_id === 'P05' ? 'Alex Rivera' :
                       selectedRun.plant_id === 'P02' ? 'Sarah Chen' :
                       selectedRun.plant_id === 'P01' ? 'Raj Patel' :
                       selectedRun.plant_id === 'P04' ? 'Marcus Vance' : 'Elena Rostova'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantities */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                  Production Outcomes
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-zinc-50 dark:bg-zinc-950/20 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg p-2.5">
                    <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Planned</span>
                    <span className="text-xs font-black text-zinc-850 dark:text-zinc-200 block mt-1">
                      {formatNumber(selectedRun.planned_qty)}
                    </span>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/30 dark:border-blue-800/30 rounded-lg p-2.5">
                    <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Actual</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 block mt-1">
                      {formatNumber(selectedRun.actual_qty)}
                    </span>
                  </div>
                  <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/30 dark:border-rose-800/30 rounded-lg p-2.5">
                    <span className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Rejected</span>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 block mt-1">
                      {formatNumber(selectedRun.rejected_qty)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sensors */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-455 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-1.5">
                  Machine IoT Sensor Health
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30">
                    <span className="text-zinc-400 dark:text-zinc-500 font-semibold block">Temperature</span>
                    <span className="text-xs font-black text-zinc-850 dark:text-zinc-200 mt-1 block">
                      {selectedRun.status === 'Optimal' ? '74.5°C' : selectedRun.status === 'Warning' ? '82.1°C' : '94.8°C'}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/20 rounded-lg border border-zinc-200/30 dark:border-zinc-800/30">
                    <span className="text-zinc-400 dark:text-zinc-500 font-semibold block">Vibration Index</span>
                    <span className="text-xs font-black text-zinc-850 dark:text-zinc-200 mt-1 block">
                      {selectedRun.status === 'Optimal' ? '0.18 mm/s' : selectedRun.status === 'Warning' ? '0.45 mm/s' : '0.88 mm/s'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer button */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/10">
              <button 
                onClick={() => setSelectedRun(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close Audit Logs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

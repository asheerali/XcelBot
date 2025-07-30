// hooks/useSharedChartData.ts
import { useMemo } from 'react';
import { useAppSelector } from '../typedHooks';

// Interface for shared chart data
interface SharedChartData {
  // Sales Split data (from ExcelImport)
  salesSplitData: {
    tableData: any;
    fileName: string;
    selectedLocation: string;
    hasData: boolean;
  };
  
  // Sales Wide data (from SalesDashboard)
  salesWideData: {
    salesData: any[];
    ordersData: any[];
    avgTicketData: any[];
    laborHrsData: any[];
    spmhData: any[];
    laborCostData: any[];
    laborPercentageData: any[];
    cogsData: any[];
    cogsPercentageData: any[];
    financialTables: any[];
    selectedLocation: string;
    hasData: boolean;
  };
  
  // Common data transformations
  transformedData: {
    inHousePercentageData: any[];
    deliveryPercentageData: any[];
    cateringPercentageData: any[];
    totalSalesData: any[];
    wowTrendsData: any[];
  };
}

export const useSharedChartData = (): SharedChartData => {
  const { 
    // Sales Split state
    tableData: reduxTableData,
    fileName,
    location: currentSalesLocation,
    fileProcessed,
    files,
    
    // Sales Wide state
    salesWideFiles,
    currentSalesWideLocation,
    salesWideFilters
  } = useAppSelector((state) => state.excel);

  // Get current Sales Wide data
  const currentSalesWideData = salesWideFiles.find(f => f.location === currentSalesWideLocation)?.data;

  // Memoized sales split data
  const salesSplitData = useMemo(() => ({
    tableData: reduxTableData,
    fileName: fileName || '',
    selectedLocation: currentSalesLocation || '',
    hasData: fileProcessed && files.length > 0 && reduxTableData?.table1?.length > 0
  }), [reduxTableData, fileName, currentSalesLocation, fileProcessed, files.length]);

  // Memoized sales wide data
  const salesWideData = useMemo(() => ({
    salesData: currentSalesWideData?.salesData || [],
    ordersData: currentSalesWideData?.ordersData || [],
    avgTicketData: currentSalesWideData?.avgTicketData || [],
    laborHrsData: currentSalesWideData?.laborHrsData || [],
    spmhData: currentSalesWideData?.spmhData || [],
    laborCostData: currentSalesWideData?.laborCostData || [],
    laborPercentageData: currentSalesWideData?.laborPercentageData || [],
    cogsData: currentSalesWideData?.cogsData || [],
    cogsPercentageData: currentSalesWideData?.cogsPercentageData || [],
    financialTables: currentSalesWideData?.financialTables || [],
    selectedLocation: currentSalesWideLocation || '',
    hasData: salesWideFiles.length > 0 && !!currentSalesWideData
  }), [currentSalesWideData, currentSalesWideLocation, salesWideFiles.length]);

  // Transform data for common chart components
  const transformedData = useMemo(() => {
    const result = {
      inHousePercentageData: [],
      deliveryPercentageData: [],
      cateringPercentageData: [],
      totalSalesData: [],
      wowTrendsData: []
    };

    // Transform Sales Split data for common charts
    if (salesSplitData.hasData && salesSplitData.tableData) {
      // Transform In-House percentage data
      if (salesSplitData.tableData.table3) {
        result.inHousePercentageData = salesSplitData.tableData.table3.map((row: any) => ({
          week: row.Week,
          inHousePercent: parseFloat(row['In-House']?.replace('%', '') || '0'),
          cateringPercent: parseFloat(row['Catering']?.replace('%', '') || '0'),
          ddPercent: parseFloat(row['DD']?.replace('%', '') || '0'),
          ghPercent: parseFloat(row['GH']?.replace('%', '') || '0'),
          ubPercent: parseFloat(row['UB']?.replace('%', '') || '0'),
          firstPartyPercent: parseFloat(row['1P']?.replace('%', '') || '0')
        }));
      }

      // Transform delivery percentage data
      if (salesSplitData.tableData.table2) {
        result.deliveryPercentageData = salesSplitData.tableData.table2.map((row: any) => ({
          week: row.Week,
          ddChange: parseFloat(row['DD']?.replace('%', '') || '0'),
          ghChange: parseFloat(row['GH']?.replace('%', '') || '0'),
          ubChange: parseFloat(row['UB']?.replace('%', '') || '0')
        }));
      }

      // Transform catering percentage data
      if (salesSplitData.tableData.table2) {
        result.cateringPercentageData = salesSplitData.tableData.table2.map((row: any) => ({
          week: row.Week,
          cateringChange: parseFloat(row['Catering']?.replace('%', '') || '0')
        }));
      }

      // Transform total sales data from table1
      if (salesSplitData.tableData.table1) {
        result.totalSalesData = salesSplitData.tableData.table1.map((row: any) => ({
          week: row.Week,
          grandTotal: parseFloat(row['Grand Total']?.replace(/[$,]/g, '') || '0'),
          catering: parseFloat(row['Catering']?.replace(/[$,]/g, '') || '0'),
          inHouse: parseFloat(row['In-House']?.replace(/[$,]/g, '') || '0'),
          dd: parseFloat(row['DD']?.replace(/[$,]/g, '') || '0'),
          gh: parseFloat(row['GH']?.replace(/[$,]/g, '') || '0'),
          ub: parseFloat(row['UB']?.replace(/[$,]/g, '') || '0'),
          firstParty: parseFloat(row['1P']?.replace(/[$,]/g, '') || '0')
        }));
      }

      // Transform WOW trends data from table4
      if (salesSplitData.tableData.table4) {
        result.wowTrendsData = salesSplitData.tableData.table4.map((row: any) => ({
          week: row.Week,
          firstParty: parseFloat(row['1P']?.replace('%', '') || '0'),
          inHouse: parseFloat(row['In-House']?.replace('%', '') || '0'),
          catering: parseFloat(row['Catering']?.replace('%', '') || '0'),
          dd: parseFloat(row['DD']?.replace('%', '') || '0'),
          gh: parseFloat(row['GH']?.replace('%', '') || '0'),
          ub: parseFloat(row['UB']?.replace('%', '') || '0'),
          thirdParty: parseFloat(row['3P']?.replace('%', '') || '0'),
          firstToThirdRatio: parseFloat(row['1P/3P']?.replace('%', '') || '0')
        }));
      }
    }

    return result;
  }, [salesSplitData]);

  return {
    salesSplitData,
    salesWideData,
    transformedData
  };
};

export default useSharedChartData;
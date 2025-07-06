import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import DateRangeSelector from "../components/DateRangeSelector";
import {
  selectSelectedCompanies,
  selectSelectedLocations,
  selectLastAppliedFilters,
  setSelectedCompanies,
  setSelectedLocations
} from "../store/slices/masterFileSlice";

const API_URL_Local = "http://localhost:8000";

const SummaryFinancialDashboard = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const selectedCompanies = useSelector(selectSelectedCompanies);
  const selectedLocations = useSelector(selectSelectedLocations);
  const lastAppliedFilters = useSelector(selectLastAppliedFilters);

  // Local state for non-Redux data
  const [companyLocationData, setCompanyLocationData] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [companySummaryData, setCompanySummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [financialDataLoading, setFinancialDataLoading] = useState(false);
  const [error, setError] = useState(null);

  // Date range state
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    startDateStr: '',
    endDateStr: ''
  });

  // Fetch company and location data from API
  useEffect(() => {
    const fetchCompanyLocationData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL_Local}/company-locations/all`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCompanyLocationData(data);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch company data: ${err.message}`);
        console.error('Error fetching company data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyLocationData();
  }, []);

  // Check for existing Redux values and load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Check if there are existing values in Redux from last applied filters
      if (lastAppliedFilters.companies.length > 0 && lastAppliedFilters.locations.length > 0) {
        console.log('Loading initial data from Redux state:', lastAppliedFilters);
        console.log('Current Redux state - Companies:', selectedCompanies, 'Locations:', selectedLocations);
        
        // Set the Redux state to match last applied filters if not already set
        if (selectedCompanies.length === 0) {
          dispatch(setSelectedCompanies(lastAppliedFilters.companies));
        }
        if (selectedLocations.length === 0) {
          dispatch(setSelectedLocations(lastAppliedFilters.locations));
        }
        
        // Fetch initial financial data
        await fetchFinancialDataFromRedux();
      } else {
        console.log('No existing Redux values found for initial data load');
      }
    };

    // Only run after company location data is loaded
    if (!loading && companyLocationData.length > 0) {
      loadInitialData();
    }
  }, [loading, companyLocationData, lastAppliedFilters, selectedCompanies, selectedLocations, dispatch]);

  // Fetch financial data function using Redux state
  const fetchFinancialDataFromRedux = async () => {
    const companies = selectedCompanies.length > 0 ? selectedCompanies : lastAppliedFilters.companies;
    const locations = selectedLocations.length > 0 ? selectedLocations : lastAppliedFilters.locations;
    
    // Only fetch if we have both company and location selected
    if (companies.length > 0 && locations.length > 0) {
      try {
        setFinancialDataLoading(true);
        const companyId = companies[0]; // Use first selected company
        const locationId = locations[0]; // Use first selected location
        
        console.log('Fetching financial data for company:', companyId, 'location:', locationId);
        
        // Build URL with date range parameters if selected
        let financialUrl = `${API_URL_Local}/api/storeorders/financialsummary/${companyId}/${locationId}`;
        let companySummaryUrl = `${API_URL_Local}/api/storeorders/companysummary/${companyId}`;
        
        // Add date range parameters if selected
        if (selectedDateRange.startDateStr && selectedDateRange.endDateStr) {
          const dateParams = `?start_date=${selectedDateRange.startDateStr}&end_date=${selectedDateRange.endDateStr}`;
          financialUrl += dateParams;
          companySummaryUrl += dateParams;
        }
        
        console.log('Financial URL:', financialUrl);
        console.log('Company Summary URL:', companySummaryUrl);
        
        // Fetch financial summary data
        const financialResponse = await fetch(financialUrl);
        
        if (!financialResponse.ok) {
          throw new Error(`HTTP error! status: ${financialResponse.status}`);
        }
        
        const financialData = await financialResponse.json();
        console.log('Financial API Response:', financialData);
        setFinancialData(financialData);
        
        // Fetch company summary data for store breakdown and daily data
        const companySummaryResponse = await fetch(companySummaryUrl);
        
        if (!companySummaryResponse.ok) {
          throw new Error(`HTTP error! status: ${companySummaryResponse.status}`);
        }
        
        const companySummaryData = await companySummaryResponse.json();
        console.log('Company Summary API Response:', companySummaryData);
        setCompanySummaryData(companySummaryData);
        
        setError(null);
      } catch (err) {
        setError(`Failed to fetch financial data: ${err.message}`);
        console.error('Error fetching financial data:', err);
      } finally {
        setFinancialDataLoading(false);
      }
    } else {
      // Show message if no filters selected
      if (companies.length === 0 || locations.length === 0) {
        setError('Please select both a company and location to view financial data');
      }
      setFinancialData(null);
      setCompanySummaryData(null);
      setFinancialDataLoading(false);
    }
  };

  // Legacy function for backward compatibility
  const fetchFinancialData = async () => {
    await fetchFinancialDataFromRedux();
  };

  // Transform API data to filter options
  const getFilterFields = () => {
    if (!companyLocationData || companyLocationData.length === 0) {
      return [
        {
          key: "companies",
          label: "Companies",
          options: [],
        },
        {
          key: "location",
          label: "Locations",
          options: [],
          disabled: true,
        },
      ];
    }

    // Extract unique companies
    const companies = companyLocationData.map(company => ({
      value: company.company_id.toString(),
      label: company.company_name,
    }));

    // Get locations for selected companies
    const getLocationsForSelectedCompanies = () => {
      if (selectedCompanies.length === 0) {
        return [];
      }

      const locations = [];
      const selectedCompanyIds = selectedCompanies.map(id => parseInt(id));
      
      companyLocationData.forEach(company => {
        if (selectedCompanyIds.includes(company.company_id)) {
          company.locations.forEach(location => {
            locations.push({
              value: location.location_id.toString(),
              label: location.location_name,
            });
          });
        }
      });

      return locations;
    };

    return [
      {
        key: "companies",
        label: "Companies",
        options: companies,
      },
      {
        key: "location",
        label: "Locations",
        options: getLocationsForSelectedCompanies(),
        disabled: selectedCompanies.length === 0,
      },
    ];
  };

  // Get summary stats from API data
  const getSummaryStats = () => {
    if (!financialData) {
      return {
        totalCost: 0,
        totalOrders: 0,
        activeStores: 0,
        dailyAverage: 0,
      };
    }

    // Debug: log the actual API response structure
    console.log('Financial Data:', financialData);
    console.log('Company Summary Data:', companySummaryData);

    // Handle different possible API response structures
    const data = financialData.data || financialData;
    
    return {
      totalCost: data.total_sales || 0,
      totalOrders: data.total_orders || 0,
      activeStores: companySummaryData?.data?.cost_breakdown_by_store?.filter(store => store.cost > 0).length || 0,
      dailyAverage: data.orders_cost_per_day || 0,
    };
  };

  // Get store breakdown from API data
  const getStoreBreakdown = () => {
    if (!companySummaryData?.data?.cost_breakdown_by_store) {
      return [];
    }

    return companySummaryData.data.cost_breakdown_by_store.map(store => ({
      name: store.store_name,
      cost: store.cost,
      percentage: store.percentage,
    }));
  };

  // Get category breakdown from API data
  const getCategoryBreakdown = () => {
    if (!financialData) {
      return [];
    }

    // Handle different possible API response structures
    const data = financialData.data || financialData;
    
    if (!data.cost_breakdown_by_category) {
      return [];
    }

    return data.cost_breakdown_by_category.map(category => ({
      name: category.category,
      cost: category.cost,
      percentage: category.percentage,
    }));
  };

  // Get daily data from API data
  const getDailyData = () => {
    if (!companySummaryData?.data?.cost_summary) {
      return [];
    }

    const costSummary = companySummaryData.data.cost_summary;
    const dailyData = [];
    
    // Process each date entry (excluding period total)
    costSummary.forEach(entry => {
      if (entry.date !== "Period Total:") {
        const stores = {};
        
        // Extract store data (excluding date and daily_total)
        Object.keys(entry).forEach(key => {
          if (key !== 'date' && key !== 'daily_total') {
            stores[key] = entry[key] || 0;
          }
        });
        
        dailyData.push({
          date: entry.date,
          stores: stores,
          total: entry.daily_total || 0,
        });
      }
    });

    return dailyData;
  };

  // Get period total from API data
  const getPeriodTotal = () => {
    if (!companySummaryData?.data?.cost_summary) {
      return {};
    }

    const periodTotalEntry = companySummaryData.data.cost_summary.find(
      entry => entry.date === "Period Total:"
    );

    if (!periodTotalEntry) {
      return {};
    }

    const periodTotal = {};
    Object.keys(periodTotalEntry).forEach(key => {
      if (key !== 'date' && key !== 'daily_total') {
        periodTotal[key] = periodTotalEntry[key] || 0;
      }
    });

    return {
      stores: periodTotal,
      total: periodTotalEntry.daily_total || 0,
    };
  };

  // Filter configuration
  const filterFields = getFilterFields();

  const handleFilterChange = useCallback((fieldKey, values) => {
    console.log('🔄 Filter change triggered:', { fieldKey, values, timestamp: Date.now() });
    
    if (fieldKey === "companies") {
      dispatch(setSelectedCompanies(values));
      
      // Clear locations when companies change
      if (values.length === 0) {
        dispatch(setSelectedLocations([]));
      }
    } else if (fieldKey === "location") {
      dispatch(setSelectedLocations(values));
    }
  }, [dispatch]);

  const handleApplyFilters = async () => {
    console.log("Applying filters:", { companies: selectedCompanies, locations: selectedLocations });
    // Fetch financial data when apply filters is clicked
    await fetchFinancialDataFromRedux();
  };

  const handleClearFilters = () => {
    dispatch(setSelectedCompanies([]));
    dispatch(setSelectedLocations([]));
    
    // Clear date range
    setSelectedDateRange({
      startDate: new Date(),
      endDate: new Date(),
      startDateStr: '',
      endDateStr: ''
    });
    
    // Clear financial data when filters are cleared
    setFinancialData(null);
    setCompanySummaryData(null);
    setError(null);
  };

  // Date range utility functions
  const formatDateRange = () => {
    if (!selectedDateRange.startDate || !selectedDateRange.endDate) {
      return "Select Date Range";
    }
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };
    
    return `${formatDate(selectedDateRange.startDate)} - ${formatDate(selectedDateRange.endDate)}`;
  };

  // Date range handlers
  const handleDateRangeSelect = (range) => {
    setSelectedDateRange({
      startDate: range.startDate,
      endDate: range.endDate,
      startDateStr: range.startDateStr,
      endDateStr: range.endDateStr
    });
    setShowDateRangeModal(false);
    
    // Clear current data when date range changes
    setFinancialData(null);
    setCompanySummaryData(null);
    setError(null);
    
    console.log("Date range selected:", range);
  };

  // Export functions for Daily Cost Summary table
  const exportToExcel = () => {
    const dailyData = getDailyData();
    const periodTotal = getPeriodTotal();
    
    if (dailyData.length === 0) {
      alert("No data available to export");
      return;
    }

    try {
      const storeNames = Object.keys(dailyData[0].stores);
      const headers = ["Date", ...storeNames, "Daily Total"];
      
      // Create CSV content
      let csvContent = "\uFEFF"; // BOM for Excel UTF-8 recognition
      csvContent += headers.join(",") + "\n";
      
      // Add data rows
      dailyData.forEach(row => {
        const rowData = [
          `"${row.date}"`,
          ...storeNames.map(store => `"${row.stores[store].toFixed(2)}"`),
          `"${row.total.toFixed(2)}"`
        ];
        csvContent += rowData.join(",") + "\n";
      });
      
      // Add period total row
      if (periodTotal.stores) {
        const periodTotalRow = [
          `"Period Total:"`,
          ...storeNames.map(store => `"${(periodTotal.stores[store] || 0).toFixed(2)}"`),
          `"${periodTotal.total.toFixed(2)}"`
        ];
        csvContent += periodTotalRow.join(",") + "\n";
      }
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "daily_cost_summary.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("Excel export completed successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Error exporting to Excel. Please try again.");
    }
  };

  const exportToPDF = () => {
    const dailyData = getDailyData();
    const periodTotal = getPeriodTotal();
    
    if (dailyData.length === 0) {
      alert("No data available to export");
      return;
    }

    try {
      const storeNames = Object.keys(dailyData[0].stores);
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      
      if (!printWindow) {
        alert("Please allow popups for this site to export PDF");
        return;
      }
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Daily Cost Summary</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                font-size: 12px;
              }
              h1 { 
                color: #333; 
                margin-bottom: 10px; 
                font-size: 24px;
              }
              p { 
                color: #666; 
                margin-bottom: 20px;
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin-top: 20px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
                font-size: 11px;
              }
              th { 
                background-color: #f8f9fa; 
                font-weight: bold;
                color: #333;
              }
              .total-row { 
                background-color: #e3f2fd; 
                font-weight: bold;
              }
              .cost-highlight { 
                background-color: #e3f2fd; 
                color: #1976d2; 
                padding: 4px 8px; 
                border-radius: 4px; 
                font-weight: 500;
              }
              .daily-total {
                font-weight: 600;
                color: #1976d2;
              }
              @media print { 
                body { margin: 0; }
                @page { size: landscape; }
              }
            </style>
          </head>
          <body>
            <h1>Daily Cost Summary</h1>
            <p>Cost breakdown by day and store for ${companySummaryData?.data?.company_name || 'Selected Company'}</p>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  ${storeNames.map(store => `<th>${store}</th>`).join('')}
                  <th>Daily Total</th>
                </tr>
              </thead>
              <tbody>
                ${dailyData.map(row => `
                  <tr>
                    <td style="font-weight: 500;">${row.date}</td>
                    ${storeNames.map(store => `
                      <td>${row.stores[store] > 0 ? `<span class="cost-highlight">$${row.stores[store].toFixed(2)}</span>` : '$0.00'}</td>
                    `).join('')}
                    <td class="daily-total">$${row.total.toFixed(2)}</td>
                  </tr>
                `).join('')}
                ${periodTotal.stores ? `
                <tr class="total-row">
                  <td style="font-weight: 600;">Period Total:</td>
                  ${storeNames.map(store => `<td style="font-weight: 600;">$${(periodTotal.stores[store] || 0).toFixed(2)}</td>`).join('')}
                  <td style="font-weight: 700; color: #1976d2; font-size: 14px;">$${periodTotal.total.toFixed(2)}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      console.log("PDF export window opened successfully");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Error exporting to PDF. Please try again.");
    }
  };

  // Get data for rendering
  const summaryStats = getSummaryStats();
  const storeBreakdown = getStoreBreakdown();
  const categoryBreakdown = getCategoryBreakdown();
  const dailyData = getDailyData();
  const periodTotal = getPeriodTotal();

  // Modal-style Multi-select filter component
  const ModalMultiSelectFilter = ({ field, currentValues, onValuesChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef(null);

    const isDisabled = field.options.length === 0 || field.disabled;

    const filteredOptions = field.options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openDropdown = () => {
      if (!isDisabled && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setButtonPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
        setIsOpen(true);
        setSearchTerm("");
        console.log('Modal dropdown opened');
      }
    };

    const closeDropdown = () => {
      setIsOpen(false);
      setSearchTerm("");
      console.log('Modal dropdown closed');
    };

    const handleOptionSelect = (value) => {
      console.log('Option selected:', value, '- keeping modal open');
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      onValuesChange(newValues);
    };

    const handleSelectAll = () => {
      console.log('Select all clicked - keeping modal open');
      if (currentValues.length === field.options.length) {
        onValuesChange([]);
      } else {
        onValuesChange(field.options.map(option => option.value));
      }
    };

    return (
      <>
        {/* Dropdown Trigger Button */}
        <div style={{ position: "relative", minWidth: "250px" }}>
          <div
            ref={buttonRef}
            onClick={openDropdown}
            style={{
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              padding: "12px 16px",
              backgroundColor: isDisabled ? "#f5f5f5" : "white",
              cursor: isDisabled ? "not-allowed" : "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "48px",
              transition: "border-color 0.2s",
              borderColor: isOpen ? "#1976d2" : "#e0e0e0",
              opacity: isDisabled ? 0.6 : 1,
              userSelect: "none",
            }}
          >
            <span style={{ fontSize: "14px", color: isDisabled ? "#999" : "#333" }}>
              {isDisabled 
                ? field.disabled 
                  ? field.key === "location" 
                    ? "Select company first"
                    : `Loading ${field.label.toLowerCase()}...`
                  : `Loading ${field.label.toLowerCase()}...`
                : currentValues.length === 0 
                  ? `Select ${field.label}` 
                  : `${currentValues.length} ${field.label.toLowerCase()} selected`}
            </span>
            <span style={{ 
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", 
              transition: "transform 0.2s",
              color: isDisabled ? "#999" : "#333"
            }}>
              ▼
            </span>
          </div>
        </div>

        {/* Modal Dropdown */}
        {isOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              zIndex: 50000,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }}
            onClick={closeDropdown}
          >
            {/* Dropdown Content */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: buttonPosition.top + 4,
                left: buttonPosition.left,
                width: Math.max(buttonPosition.width, 300),
                backgroundColor: "white",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {/* Header */}
              <div style={{ 
                padding: "16px", 
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: "#f8f9fa",
                borderRadius: "6px 6px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontWeight: "600", color: "#333" }}>
                  Select {field.label}
                </span>
                <button
                  onClick={closeDropdown}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#666",
                    padding: "4px",
                    borderRadius: "4px",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Search Input */}
              <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
                <input
                  type="text"
                  placeholder={`Search ${field.label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Select All Button */}
              {field.options.length > 0 && (
                <div
                  onClick={handleSelectAll}
                  style={{
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f0f0f0",
                    backgroundColor: "#f8f9fa",
                    fontWeight: "500",
                    fontSize: "14px",
                    color: "#1976d2",
                    userSelect: "none",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#e8f4f8"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                >
                  {currentValues.length === field.options.length ? "Deselect All" : "Select All"}
                  <span style={{ float: "right", color: "#666", fontSize: "12px" }}>
                    {currentValues.length}/{field.options.length}
                  </span>
                </div>
              )}

              {/* Options List */}
              <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleOptionSelect(option.value)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor: currentValues.includes(option.value) ? "#e3f2fd" : "white",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "14px",
                      userSelect: "none",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!currentValues.includes(option.value)) {
                        e.target.style.backgroundColor = "#f5f5f5";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!currentValues.includes(option.value)) {
                        e.target.style.backgroundColor = "white";
                      }
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid #1976d2",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: currentValues.includes(option.value) ? "#1976d2" : "white",
                        flexShrink: 0,
                      }}
                    >
                      {currentValues.includes(option.value) && (
                        <span style={{ color: "white", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                      )}
                    </div>
                    <span style={{ flex: 1 }}>{option.label}</span>
                  </div>
                ))}

                {/* No Options Message */}
                {filteredOptions.length === 0 && (
                  <div 
                    style={{ 
                      padding: "20px 16px", 
                      color: "#666", 
                      fontSize: "14px",
                      textAlign: "center",
                      fontStyle: "italic"
                    }}
                  >
                    {field.options.length === 0 ? "No options available" : "No options found"}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ 
                padding: "12px 16px", 
                borderTop: "1px solid #f0f0f0",
                backgroundColor: "#f8f9fa",
                borderRadius: "0 0 6px 6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "12px", color: "#666" }}>
                  {currentValues.length} selected
                </span>
                <button
                  onClick={closeDropdown}
                  style={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    padding: "6px 16px",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Date Range Button Component
  const DateRangeButton = () => {
    return (
      <button
        onClick={() => setShowDateRangeModal(true)}
        style={{
          border: "2px solid #4a90e2",
          borderRadius: "12px",
          padding: "10px 16px",
          backgroundColor: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "16px",
          color: "#4a90e2",
          fontWeight: "400",
          transition: "all 0.2s",
          minWidth: "140px",
          height: "44px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = "#f0f8ff";
          e.target.style.transform = "translateY(-1px)";
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = "white";
          e.target.style.transform = "translateY(0px)";
        }}
      >
        <div style={{ 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "20px",
          height: "20px"
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <span>Date Range</span>
      </button>
    );
  };

  // Date Range Modal Component
  const DateRangeModal = () => {
    if (!showDateRangeModal) return null;

    const initialState = [
      {
        startDate: selectedDateRange.startDate || new Date(),
        endDate: selectedDateRange.endDate || new Date(),
        key: 'selection'
      }
    ];

    const [tempDateRange, setTempDateRange] = useState(initialState);

    const handleDateRangeChange = (range) => {
      setTempDateRange([range.selection]);
    };

    const handleApplyRange = () => {
      const range = tempDateRange[0];
      handleDateRangeSelect({
        startDate: range.startDate,
        endDate: range.endDate,
        startDateStr: range.startDate.toISOString().split('T')[0],
        endDateStr: range.endDate.toISOString().split('T')[0]
      });
    };

    const handleCancelRange = () => {
      setShowDateRangeModal(false);
    };

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000,
          padding: "20px",
        }}
        onClick={handleCancelRange}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "90%",
            maxWidth: "900px",
            maxHeight: "90vh",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "20px 24px",
            borderBottom: "1px solid #e0e0e0",
            flexShrink: 0
          }}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#333" }}>
              📅 Select Date Range
            </h2>
            <button
              onClick={handleCancelRange}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#666",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
          
          {/* Date Range Selector */}
          <div style={{ 
            flex: 1, 
            overflow: "auto",
            padding: "0"
          }}>
            <DateRangeSelector 
              initialState={tempDateRange}
              onSelect={handleDateRangeChange}
            />
          </div>

          {/* Footer with buttons */}
          <div style={{ 
            padding: "20px 24px",
            borderTop: "1px solid #e0e0e0",
            display: "flex", 
            gap: "12px", 
            justifyContent: "flex-end",
            backgroundColor: "#f8f9fa",
            flexShrink: 0
          }}>
            <button
              onClick={handleCancelRange}
              style={{
                backgroundColor: "white",
                color: "#666",
                border: "1px solid #e0e0e0",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#f5f5f5";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "white";
              }}
            >
              CANCEL
            </button>
            <button
              onClick={handleApplyRange}
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#1565c0";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#1976d2";
              }}
            >
              APPLY RANGE
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "20px",
        backgroundColor: "white",
        transition: "all 0.3s ease",
        minHeight: "120px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60px",
          height: "60px",
          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
          borderRadius: "0 12px 0 60px",
        }}
      />
      
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            padding: "12px",
            borderRadius: "12px",
            backgroundColor: `${color}15`,
            color: color,
            fontSize: "24px",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: color,
              marginBottom: "4px",
              lineHeight: "1.2",
            }}
          >
            {value}
          </div>
          <div style={{ fontSize: "13px", color: "#666", lineHeight: "1.3" }}>
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: "32px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Header */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <h1 style={{ 
            fontSize: "32px", 
            fontWeight: "700", 
            color: "#1a1a1a", 
            marginBottom: "8px",
            letterSpacing: "-0.5px"
          }}>
            Financial Dashboard
          </h1>
          <p style={{ 
            fontSize: "16px", 
            color: "#666", 
            margin: 0,
            fontWeight: "400"
          }}>
            Track costs, orders, and performance across all locations
          </p>
        </div>
        
        {/* Date Range Button in Header */}
        <DateRangeButton />
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: "#ffebee",
          color: "#c62828",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
          border: "1px solid #ef5350"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          backgroundColor: "#e3f2fd",
          color: "#1976d2",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
          border: "1px solid #2196f3",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <div style={{
            width: "16px",
            height: "16px",
            border: "2px solid #1976d2",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          Loading company and location data...
        </div>
      )}

      {/* Filters Section */}
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: "16px",
          backgroundColor: "white",
          padding: "24px",
          marginBottom: "32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
        onClick={(e) => e.stopPropagation()} // Catch any bubbling events
      >
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: "#1976d220",
                color: "#1976d2",
                fontSize: "20px",
              }}
            >
              🔍
            </div>
            <h3 style={{ 
              fontSize: "20px", 
              fontWeight: "600", 
              color: "#333",
              margin: 0
            }}>
              Filters
            </h3>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={handleClearFilters}
              style={{
                backgroundColor: "transparent",
                color: "#666",
                border: "1px solid #e0e0e0",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              disabled={financialDataLoading}
              style={{
                backgroundColor: financialDataLoading ? "#ccc" : "#1976d2",
                color: "white",
                border: "none",
                padding: "8px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: financialDataLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {financialDataLoading && (
                <div style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid white",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
              )}
              {financialDataLoading ? "Loading..." : "Apply Filters"}
            </button>
          </div>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "20px" 
        }}>
          {filterFields.map((field) => (
            <ModalMultiSelectFilter
              key={field.key}
              field={field}
              currentValues={field.key === "companies" ? selectedCompanies : selectedLocations}
              onValuesChange={(values) => handleFilterChange(field.key, values)}
            />
          ))}
        </div>

        {/* Active filter chips */}
        {(selectedLocations.length > 0 || selectedCompanies.length > 0 || (selectedDateRange.startDateStr && selectedDateRange.endDateStr)) && (
          <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
              Active Filters:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {selectedCompanies.map((companyValue) => {
                const company = companyLocationData.find(comp => comp.company_id.toString() === companyValue);
                return (
                  <span
                    key={companyValue}
                    style={{
                      backgroundColor: "#e8f5e8",
                      color: "#1976d2",
                      padding: "4px 8px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      border: "1px solid #2e7d32",
                    }}
                  >
                    🏢 {company?.company_name || companyValue}
                  </span>
                );
              })}
              {selectedLocations.map((locationValue) => {
                let locationName = locationValue;
                companyLocationData.forEach(company => {
                  company.locations.forEach(location => {
                    if (location.location_id.toString() === locationValue) {
                      locationName = location.location_name;
                    }
                  });
                });
                return (
                  <span
                    key={locationValue}
                    style={{
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                      padding: "4px 8px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      border: "1px solid #1976d2",
                    }}
                  >
                    📍 {locationName}
                  </span>
                );
              })}
              {selectedDateRange.startDateStr && selectedDateRange.endDateStr && (
                <span
                  style={{
                    backgroundColor: "#fff3e0",
                    color: "#ed6c02",
                    padding: "4px 8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    border: "1px solid #ed6c02",
                  }}
                >
                  📅 {formatDateRange()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading state for financial data */}
      {financialDataLoading && (
        <div style={{
          backgroundColor: "#e3f2fd",
          color: "#1976d2",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
          border: "1px solid #2196f3",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <div style={{
            width: "16px",
            height: "16px",
            border: "2px solid #1976d2",
            borderTop: "2px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          Loading financial data...
        </div>
      )}

      {/* No data message */}
      {!financialDataLoading && !financialData && !error && (
        <div style={{
          backgroundColor: "#e3f2fd",
          color: "#1976d2",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "24px",
          border: "1px solid #2196f3",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "20px", marginBottom: "8px" }}>📊</div>
          <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "8px" }}>
            Welcome to Financial Dashboard
          </div>
          <div style={{ fontSize: "14px" }}>
            1. Select a company from the dropdown<br/>
            2. Select a location from the dropdown<br/>
            3. Optionally select a date range<br/>
            4. Click "Apply Filters" to view financial data
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {(financialData || financialDataLoading) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <StatCard
            icon="💰"
            title="Total Cost"
            value={financialDataLoading ? "Loading..." : `${summaryStats.totalCost.toLocaleString()}`}
            subtitle={selectedDateRange.startDateStr && selectedDateRange.endDateStr ? formatDateRange() : "Selected period"}
            color="#1976d2"
          />
          <StatCard
            icon="🛒"
            title="Total Orders"
            value={financialDataLoading ? "Loading..." : summaryStats.totalOrders.toLocaleString()}
            subtitle={selectedDateRange.startDateStr && selectedDateRange.endDateStr ? formatDateRange() : "Selected period"}
            color="#2e7d32"
          />
          <StatCard
            icon="📈"
            title="Daily Average"
            value={financialDataLoading ? "Loading..." : `${summaryStats.dailyAverage.toLocaleString()}`}
            subtitle="Cost per day"
            color="#9c27b0"
          />
        </div>
      )}

      {/* Cost Breakdown Section */}
      {(financialData || financialDataLoading) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "24px",
            marginBottom: "32px",
          }}
        >
          {/* Cost Breakdown by Store */}
          <div
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "16px",
              backgroundColor: "white",
              padding: "28px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "24px",
                color: "#333",
              }}
            >
              Cost Breakdown by Store
            </h3>
            
            {financialDataLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666" }}>
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #1976d2",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                Loading store breakdown...
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {storeBreakdown.length === 0 ? (
                  <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>
                    No store data available
                  </div>
                ) : (
                  storeBreakdown.map((store, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 0",
                        borderBottom:
                          index < storeBreakdown.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "12px" }}
                      >
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: store.cost > 0 ? "#1976d2" : "#e0e0e0",
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>
                          {store.name}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{ fontSize: "15px", fontWeight: 600, color: "#333" }}
                        >
                          ${store.cost.toFixed(2)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {store.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cost Breakdown by Category */}
          <div
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "16px",
              backgroundColor: "white",
              padding: "28px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "24px",
                color: "#333",
              }}
            >
              Cost Breakdown by Category
            </h3>
            
            {financialDataLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666" }}>
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #1976d2",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></div>
                Loading category breakdown...
              </div>
            ) : (
              <div>
                {categoryBreakdown.length === 0 ? (
                  <div style={{ color: "#666", textAlign: "center", padding: "20px" }}>
                    No category data available
                  </div>
                ) : (
                  categoryBreakdown.map((category, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "20px 0",
                        borderBottom:
                          index < categoryBreakdown.length - 1
                            ? "1px solid #f0f0f0"
                            : "none",
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "12px" }}
                      >
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor:
                              index === 0
                                ? "#1976d2"
                                : index === 1
                                ? "#2e7d32"
                                : "#ed6c02",
                          }}
                        />
                        <span style={{ fontSize: "14px", color: "#333", fontWeight: "500" }}>
                          {category.name}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{ fontSize: "15px", fontWeight: 600, color: "#333" }}
                        >
                          ${category.cost.toFixed(2)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Cost Summary Table */}
      {(financialData || financialDataLoading) && (
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "16px",
            backgroundColor: "white",
            padding: "28px",
            marginBottom: "32px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "8px",
              color: "#333",
            }}
          >
            Daily Cost Summary
          </h3>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "28px" }}>
            Cost breakdown by day and store for {companySummaryData?.data?.company_name || 'selected company'}
          </p>

          {financialDataLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666", padding: "40px 0" }}>
              <div style={{
                width: "16px",
                height: "16px",
                border: "2px solid #1976d2",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              Loading daily cost summary...
            </div>
          ) : dailyData.length === 0 ? (
            <div style={{ color: "#666", textAlign: "center", padding: "40px 0" }}>
              No daily cost data available
            </div>
          ) : (
            <div style={{ overflowX: "auto", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                  backgroundColor: "white",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th
                      style={{
                        padding: "16px 12px",
                        border: "1px solid #e0e0e0",
                        fontWeight: 600,
                        textAlign: "left",
                        color: "#333",
                      }}
                    >
                      Date
                    </th>
                    {Object.keys(dailyData[0].stores).map((storeName) => (
                      <th
                        key={storeName}
                        style={{
                          padding: "16px 12px",
                          border: "1px solid #e0e0e0",
                          fontWeight: 600,
                          textAlign: "left",
                          color: "#333",
                        }}
                      >
                        {storeName}
                      </th>
                    ))}
                    <th
                      style={{
                        padding: "16px 12px",
                        border: "1px solid #e0e0e0",
                        fontWeight: 600,
                        textAlign: "left",
                        color: "#1976d2",
                      }}
                    >
                      Daily Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.map((row, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: index % 2 === 1 ? "#fafafa" : "white",
                      }}
                    >
                      <td
                        style={{
                          padding: "16px 12px",
                          border: "1px solid #e0e0e0",
                          fontWeight: 500,
                        }}
                      >
                        {row.date}
                      </td>
                      {Object.entries(row.stores).map(([store, value]) => (
                        <td
                          key={store}
                          style={{
                            padding: "16px 12px",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          {value > 0 ? (
                            <span
                              style={{
                                backgroundColor: "#e3f2fd",
                                color: "#1976d2",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "13px",
                                border: "1px solid #1976d2",
                                fontWeight: "500",
                              }}
                            >
                              ${value.toFixed(2)}
                            </span>
                          ) : (
                            <span style={{ color: "#999" }}>$0.00</span>
                          )}
                        </td>
                      ))}
                      <td
                        style={{
                          padding: "16px 12px",
                          border: "1px solid #e0e0e0",
                          fontWeight: 600,
                          color: "#1976d2",
                        }}
                      >
                        ${row.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {/* Period Total Row */}
                  {periodTotal.stores && (
                    <tr style={{ backgroundColor: "#e3f2fd", fontWeight: 600 }}>
                      <td
                        style={{
                          padding: "16px 12px",
                          border: "1px solid #e0e0e0",
                          fontWeight: 600,
                        }}
                      >
                        Period Total:
                      </td>
                      {Object.keys(dailyData[0].stores).map((store) => (
                        <td
                          key={store}
                          style={{
                            padding: "16px 12px",
                            border: "1px solid #e0e0e0",
                            fontWeight: 600,
                          }}
                        >
                          ${(periodTotal.stores[store] || 0).toFixed(2)}
                        </td>
                      ))}
                      <td
                        style={{
                          padding: "16px 12px",
                          border: "1px solid #e0e0e0",
                          fontWeight: 700,
                          color: "#1976d2",
                          fontSize: "16px",
                        }}
                      >
                        ${periodTotal.total.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Export Reports Section */}
      {(financialData || financialDataLoading) && (
        <div
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: "16px",
            backgroundColor: "white",
            padding: "28px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 600,
              marginBottom: "24px",
              color: "#333",
            }}
          >
            Export Reports
          </h3>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={exportToExcel}
              disabled={financialDataLoading || dailyData.length === 0}
              style={{
                backgroundColor: financialDataLoading || dailyData.length === 0 ? "#ccc" : "#1976d2",
                color: "white",
                border: "none",
                padding: "14px 28px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: financialDataLoading || dailyData.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                if (!financialDataLoading && dailyData.length > 0) {
                  e.target.style.backgroundColor = "#1565c0";
                }
              }}
              onMouseOut={(e) => {
                if (!financialDataLoading && dailyData.length > 0) {
                  e.target.style.backgroundColor = "#1976d2";
                }
              }}
            >
              📥 Export to Excel
            </button>
            <button
              onClick={exportToPDF}
              disabled={financialDataLoading || dailyData.length === 0}
              style={{
                backgroundColor: "white",
                color: financialDataLoading || dailyData.length === 0 ? "#ccc" : "#1976d2",
                border: financialDataLoading || dailyData.length === 0 ? "2px solid #ccc" : "2px solid #1976d2",
                padding: "14px 28px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: financialDataLoading || dailyData.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                if (!financialDataLoading && dailyData.length > 0) {
                  e.target.style.backgroundColor = "#f3f4f6";
                }
              }}
              onMouseOut={(e) => {
                if (!financialDataLoading && dailyData.length > 0) {
                  e.target.style.backgroundColor = "white";
                }
              }}
            >
              📄 Export to PDF
            </button>
            <button
              disabled={financialDataLoading || dailyData.length === 0}
              style={{
                backgroundColor: "white",
                color: financialDataLoading || dailyData.length === 0 ? "#ccc" : "#1976d2",
                border: financialDataLoading || dailyData.length === 0 ? "2px solid #ccc" : "2px solid #1976d2",
                padding: "14px 28px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: financialDataLoading || dailyData.length === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                if (!financialDataLoading && dailyData.length > 0) {
                  e.target.style.backgroundColor = "#f3f4f6";
                }
              }}
              onMouseOut={(e) => {
                if (!financialDataLoading && dailyData.length > 0) {
                  e.target.style.backgroundColor = "white";
                }
              }}
            >
              📧 Email Report
            </button>
          </div>
        </div>
      )}
      
      {/* Date Range Modal */}
      <DateRangeModal />
    </div>
  );
};

export default SummaryFinancialDashboard;
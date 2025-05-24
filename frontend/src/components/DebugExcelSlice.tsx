import React, { useState } from 'react';

// Import your typed hook (you'll need to adjust the import path)
// import { useAppSelector } from '../typedHooks';

const DebugExcelSlice = () => {
  const [expandedSections, setExpandedSections] = useState({});
  
  // Uncomment this line and adjust the import path
  // const excelState = useAppSelector((state) => state.excel);
  
  // For demo purposes - remove this when you use the real hook
  const excelState = {
    files: [],
    salesFiles: [],
    productMixFiles: [],
    financialFiles: [],
    salesWideFiles: [],
    allLocations: [],
    location: '',
    fileProcessed: false,
    loading: false,
    error: null,
    tableData: { table1: [], table2: [], table3: [], table4: [], table5: [], locations: [], dateRanges: [] }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const JsonDisplay = ({ data, title, sectionKey }) => (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px', 
      marginBottom: '16px',
      backgroundColor: 'white'
    }}>
      <div 
        onClick={() => toggleSection(sectionKey)}
        style={{ 
          padding: '12px 16px', 
          backgroundColor: '#f5f5f5', 
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>{title}</span>
        <span>{expandedSections[sectionKey] ? '▼' : '▶'}</span>
      </div>
      {expandedSections[sectionKey] && (
        <div style={{ padding: '16px' }}>
          <pre style={{ 
            backgroundColor: '#f8f9fa',
            padding: '12px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxHeight: '400px',
            margin: 0
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );

  // Console logging for debugging
  console.log('=== EXCEL SLICE DEBUG ===');
  console.log('Full Excel State:', excelState);
  console.log('Files:', excelState.files);
  console.log('Sales Files:', excelState.salesFiles);
  console.log('Product Mix Files:', excelState.productMixFiles);
  console.log('Financial Files:', excelState.financialFiles);
  console.log('Sales Wide Files:', excelState.salesWideFiles);
  console.log('All Locations:', excelState.allLocations);
  console.log('Current Location:', excelState.location);
  console.log('File Processed:', excelState.fileProcessed);
  console.log('Table Data:', excelState.tableData);
  console.log('Loading:', excelState.loading);
  console.log('Error:', excelState.error);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '24px', color: '#333' }}>
        Excel Slice Debug Information
      </h1>
      
      <div style={{ 
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '16px', color: '#444' }}>Quick Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          <div><strong>Files Count:</strong> {excelState.files?.length || 0}</div>
          <div><strong>Sales Files:</strong> {excelState.salesFiles?.length || 0}</div>
          <div><strong>Product Mix Files:</strong> {excelState.productMixFiles?.length || 0}</div>
          <div><strong>Financial Files:</strong> {excelState.financialFiles?.length || 0}</div>
          <div><strong>Sales Wide Files:</strong> {excelState.salesWideFiles?.length || 0}</div>
          <div><strong>All Locations:</strong> {excelState.allLocations?.length || 0}</div>
          <div><strong>Current Location:</strong> {excelState.location || 'None'}</div>
          <div><strong>File Processed:</strong> {excelState.fileProcessed ? 'Yes' : 'No'}</div>
          <div><strong>Loading:</strong> {excelState.loading ? 'Yes' : 'No'}</div>
          <div><strong>Error:</strong> {excelState.error || 'None'}</div>
        </div>
      </div>

      <JsonDisplay data={excelState.files} title="General Files" sectionKey="files" />
      <JsonDisplay data={excelState.salesFiles} title="Sales Files" sectionKey="salesFiles" />
      <JsonDisplay data={excelState.productMixFiles} title="Product Mix Files" sectionKey="productMixFiles" />
      <JsonDisplay data={excelState.financialFiles} title="Financial Files" sectionKey="financialFiles" />
      <JsonDisplay data={excelState.salesWideFiles} title="Sales Wide Files" sectionKey="salesWideFiles" />
      <JsonDisplay data={excelState.allLocations} title="All Locations" sectionKey="allLocations" />
      <JsonDisplay data={excelState.tableData} title="Current Table Data" sectionKey="tableData" />
      <JsonDisplay data={excelState.salesFilters} title="Sales Filters" sectionKey="salesFilters" />
      <JsonDisplay data={excelState.productMixFilters} title="Product Mix Filters" sectionKey="productMixFilters" />
      <JsonDisplay data={excelState.financialFilters} title="Financial Filters" sectionKey="financialFilters" />
      <JsonDisplay data={excelState.salesWideFilters} title="Sales Wide Filters" sectionKey="salesWideFilters" />
    </div>
  );
};

export default DebugExcelSlice;
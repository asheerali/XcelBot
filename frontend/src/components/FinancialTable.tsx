import React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

const FinancialTable = () => {
  // Table data structure that matches Image 1
  const tableData = [
    // SALES category (rows 0-2)
    {
      category: "Tw Net Sales",
      section: "SALES",
      thisWeeksTrend: "$8,268.68",
      lastWeeksTrend: { label: "Lw Net Sales", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Bdgt Net Sales", value: "$0.00" },
      twBdg: { value: "-57.99%", direction: "down", color: "red" }
    },
    {
      category: "Orders",
      section: "SALES",
      thisWeeksTrend: "372",
      lastWeeksTrend: { label: "Orders", value: "0" },
      twLw: "",
      thisWeeksBudget: { label: "Orders", value: "0" },
      twBdg: { value: "-52.75%", direction: "down", color: "red" }
    },
    {
      category: "Avg Ticket",
      section: "SALES",
      thisWeeksTrend: "$22.23",
      lastWeeksTrend: { label: "Avg Ticket", value: "" },
      twLw: "",
      thisWeeksBudget: { label: "Avg Ticket", value: "" },
      twBdg: { value: "-11.09%", direction: "down", color: "red" }
    },
    
    // LABOR COST category (rows 3-10)
    {
      category: "Lbr hrs",
      section: "LABOR COST",
      thisWeeksTrend: "120.00",
      lastWeeksTrend: { label: "Lbr hrs", value: "0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Lbr hrs", value: "0.00" },
      twBdg: { value: "-48.18%", direction: "up", color: "green" }
    },
    {
      category: "Lbr Pay",
      section: "LABOR COST",
      thisWeeksTrend: "$2,499.60",
      lastWeeksTrend: { label: "Lbr Pay", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Lbr Pay", value: "$0.00" },
      twBdg: { value: "-55.71%", direction: "down", color: "red" }
    },
    {
      category: "Lbr %",
      section: "LABOR COST",
      thisWeeksTrend: "30.23%",
      lastWeeksTrend: { label: "Lbr %", value: "" },
      twLw: { value: "30.23%", direction: "up", color: "red" },
      thisWeeksBudget: { label: "Lbr %", value: "" },
      twBdg: { value: "+1.56%", direction: "up", color: "red" }
    },
    {
      category: "SPMH",
      section: "LABOR COST",
      thisWeeksTrend: "$68.91",
      lastWeeksTrend: { label: "SPMH", value: "" },
      twLw: { value: "68.91%", direction: "up", color: "red" },
      thisWeeksBudget: { label: "SPMH", value: "" },
      twBdg: { value: "-18.93%", direction: "down", color: "red" }
    },
    {
      category: "LPMH",
      section: "LABOR COST",
      thisWeeksTrend: "$20.83",
      lastWeeksTrend: { label: "LPMH", value: "" },
      twLw: { value: "20.83%", direction: "up", color: "red" },
      thisWeeksBudget: { label: "LPMH", value: "" },
      twBdg: { value: "-14.53%", direction: "down", color: "green" }
    },
    
    // Additional LABOR COST rows
    {
      category: "Tw Johns",
      section: "LABOR COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "Tw Johns", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Tw Johns", value: "$0.00" },
      twBdg: { value: "-100.00%", direction: "up", color: "green" }
    },
    {
      category: "Terra",
      section: "LABOR COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "Terra", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Terra", value: "$0.00" },
      twBdg: { value: "-100.00%", direction: "up", color: "green" }
    },
    {
      category: "Metro",
      section: "LABOR COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "Metro", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Metro", value: "$0.00" },
      twBdg: { value: "-100.00%", direction: "up", color: "green" }
    },
    
    // FOOD COST category (rows 11-20)
    {
      category: "Victory",
      section: "FOOD COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "Victory", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Victory", value: "$0.00" },
      twBdg: { value: "-100.00%", direction: "up", color: "green" }
    },
    {
      category: "Central Kitchen",
      section: "FOOD COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "Central Kitchen", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Central Kitchen", value: "$0.00" },
      twBdg: { value: "-100.00%", direction: "up", color: "green" }
    },
    {
      category: "Other",
      section: "FOOD COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "Other", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Other", value: "$0.00" },
      twBdg: { value: "", direction: "", color: "" }
    },
    {
      category: "",
      section: "FOOD COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "", value: "$0.00" },
      twBdg: { value: "", direction: "", color: "" }
    },
    {
      category: "",
      section: "FOOD COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "", value: "$0.00" },
      twBdg: { value: "", direction: "", color: "" }
    },
    {
      category: "",
      section: "FOOD COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "", value: "$0.00" },
      twBdg: { value: "", direction: "", color: "" }
    },
    {
      category: "",
      section: "FOOD COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "", value: "$0.00" },
      twBdg: { value: "", direction: "", color: "" }
    },
    {
      category: "TTL",
      section: "FOOD COST",
      thisWeeksTrend: "$0.00",
      lastWeeksTrend: { label: "TTL", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "TTL", value: "$0.00" },
      twBdg: { value: "-100.00%", direction: "up", color: "green" }
    },
    {
      category: "Food Cost %",
      section: "FOOD COST",
      thisWeeksTrend: "0.00%",
      lastWeeksTrend: { label: "Food Cost %", value: "" },
      twLw: { value: "0.00%", direction: "up", color: "red" },
      thisWeeksBudget: { label: "Food Cost %", value: "" },
      twBdg: { value: "-30.00%", direction: "up", color: "green" }
    },
    {
      category: "Prime Cost $",
      section: "FOOD COST",
      thisWeeksTrend: "$2,499.60",
      lastWeeksTrend: { label: "Prime Cost $", value: "$0.00" },
      twLw: "",
      thisWeeksBudget: { label: "Prime Cost $", value: "$0.00" },
      twBdg: { value: "-78.36%", direction: "up", color: "green" }
    },
    {
      category: "Prime Cost %",
      section: "FOOD COST",
      thisWeeksTrend: "30.23%",
      lastWeeksTrend: { label: "Prime Cost %", value: "" },
      twLw: { value: "30.23%", direction: "up", color: "red" },
      thisWeeksBudget: { label: "Prime Cost %", value: "" },
      twBdg: { value: "-28.44%", direction: "up", color: "green" }
    }
  ];

  // Helper function to get the rows per section
  const getRowsInSection = (section) => {
    return tableData.filter(row => row.section === section);
  };

  // Calculate rows per section
  const salesRows = getRowsInSection("SALES");
  const laborCostRows = getRowsInSection("LABOR COST");
  const foodCostRows = getRowsInSection("FOOD COST");

  // Calculate heights for each section based on the number of rows
  const salesHeight = salesRows.length * 42;
  const laborCostHeight = laborCostRows.length * 42;
  const foodCostHeight = foodCostRows.length * 42;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Side Labels */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        width: '35px',
        flexShrink: 0,
        borderLeft: '1px solid #000',
        borderTop: '1px solid #000',
        borderBottom: '1px solid #000',
      }}>
        {/* SALES label */}
        <Box sx={{ 
          height: `${salesHeight}px`, 
          backgroundColor: '#0000cc',
          color: 'white',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          SALES
        </Box>
        
        {/* LABOR COST label */}
        <Box sx={{ 
          height: `${laborCostHeight}px`, 
          backgroundColor: '#cc0000',
          color: 'white',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          LABOR COST
        </Box>
        
        {/* FOOD COST label */}
        <Box sx={{ 
          height: `${foodCostHeight}px`, 
          backgroundColor: '#cc6600',
          color: 'white',
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          FOOD COST
        </Box>
      </Box>
      
      {/* Main Table */}
      <TableContainer sx={{ 
        flexGrow: 1, 
        border: '1px solid #000',
        overflowX: 'auto'
      }}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  backgroundColor: '#0000cc', 
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '20%',
                  border: '1px solid #000',
                  padding: '10px'
                }}
              >
                This Weeks Trend
              </TableCell>
              <TableCell 
                colSpan={2}
                sx={{ 
                  backgroundColor: '#fff8e1',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '32%',
                  border: '1px solid #000',
                  padding: '10px'
                }}
              >
                Last Weeks Trend
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#e65100', 
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '16%',
                  border: '1px solid #000',
                  padding: '10px'
                }}
              >
                TW/LW (+/-)
              </TableCell>
              <TableCell 
                colSpan={2}
                sx={{ 
                  backgroundColor: '#000000', 
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '32%',
                  border: '1px solid #000',
                  padding: '10px'
                }}
              >
                This Weeks Budget
              </TableCell>
              <TableCell 
                sx={{ 
                  backgroundColor: '#e65100', 
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '16%',
                  border: '1px solid #000',
                  padding: '10px'
                }}
              >
                TW/Bdg (+/-)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  height: '42px',
                  borderBottom: '1px solid #ccc',
                  backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff'
                }}
              >
                {/* Category & This Weeks Trend */}
                <TableCell 
                  sx={{ 
                    borderRight: '1px solid #ccc',
                    padding: '8px 12px',
                    fontWeight: row.category ? 'bold' : 'normal'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>{row.category}</Typography>
                    <Typography>{row.thisWeeksTrend}</Typography>
                  </Box>
                </TableCell>
                
                {/* Last Weeks Trend - Label & Value in separate cells */}
                <TableCell 
                  sx={{ 
                    borderRight: '1px solid #ccc',
                    padding: '8px 12px',
                    width: '16%'
                  }}
                >
                  {row.lastWeeksTrend.label}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    borderRight: '1px solid #ccc',
                    padding: '8px 12px',
                    width: '16%'
                  }}
                >
                  {row.lastWeeksTrend.value}
                </TableCell>
                
                {/* TW/LW (+/-) */}
                <TableCell 
                  align="center"
                  sx={{ 
                    borderRight: '1px solid #ccc',
                    padding: '8px 12px'
                  }}
                >
                  {row.twLw && row.twLw.value && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      {row.twLw.direction === 'up' && (
                        <span style={{ 
                          color: row.twLw.color, 
                          marginRight: '4px',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>▲</span>
                      )}
                      <Typography sx={{ color: row.twLw.color }}>
                        {row.twLw.value}
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                
                {/* This Weeks Budget - Label & Value in separate cells */}
                <TableCell 
                  sx={{ 
                    borderRight: '1px solid #ccc',
                    padding: '8px 12px',
                    width: '16%'
                  }}
                >
                  {row.thisWeeksBudget.label}
                </TableCell>
                <TableCell 
                  align="right"
                  sx={{ 
                    borderRight: '1px solid #ccc',
                    padding: '8px 12px',
                    width: '16%'
                  }}
                >
                  {row.thisWeeksBudget.value}
                </TableCell>
                
                {/* TW/Bdg (+/-) */}
                <TableCell 
                  align="right"
                  sx={{ 
                    padding: '8px 12px'
                  }}
                >
                  {row.twBdg && row.twBdg.value && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end'
                    }}>
                      <Typography sx={{ color: row.twBdg.color }}>
                        {row.twBdg.value}
                      </Typography>
                      {row.twBdg.direction === 'up' ? (
                        <span style={{ 
                          color: row.twBdg.color, 
                          marginLeft: '4px',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>▲</span>
                      ) : row.twBdg.direction === 'down' && (
                        <span style={{ 
                          color: row.twBdg.color, 
                          marginLeft: '4px',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}>▼</span>
                      )}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default FinancialTable;
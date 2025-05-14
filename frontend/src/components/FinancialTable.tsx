import React from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const FinancialTable = () => {
  // Table data structure matching the exact layout from the image
  const tableData = [
    // SALES category (rows 1-4)
    {
      category: "Tw Net Sales",
      section: "SALES",
      thisWeekLabel: "Tw Net Sales",
      thisWeekValue: "$7,174.76",
      lastWeekLabel: "Lw Net Sales",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "Bdgt Net Sales",
      budgetValue: "$0.00",
      twBdg: "-57.99%",
      twBdgColor: "#d32f2f",
      twBdgArrow: "down"
    },
    {
      category: "Orders",
      section: "SALES",
      thisWeekLabel: "Orders",
      thisWeekValue: "242",
      lastWeekLabel: "Orders",
      lastWeekValue: "0",
      twLw: "",
      budgetLabel: "Orders",
      budgetValue: "0",
      twBdg: "-52.75%",
      twBdgColor: "#d32f2f",
      twBdgArrow: "down"
    },
    {
      category: "Avg Ticket",
      section: "SALES",
      thisWeekLabel: "Avg Ticket",
      thisWeekValue: "$29.65",
      lastWeekLabel: "Avg Ticket",
      lastWeekValue: "",
      twLw: "",
      budgetLabel: "Avg Ticket",
      budgetValue: "",
      twBdg: "-11.09%",
      twBdgColor: "#d32f2f",
      twBdgArrow: "down"
    },
    {
      category: "",
      section: "SALES",
      thisWeekLabel: "",
      thisWeekValue: "",
      lastWeekLabel: "",
      lastWeekValue: "",
      twLw: "",
      budgetLabel: "",
      budgetValue: "",
      twBdg: "",
      twBdgColor: "",
      twBdgArrow: ""
    },
    
    // LABOR COST category (rows 5-9)
    {
      category: "Lbr hrs",
      section: "LABOR COST",
      thisWeekLabel: "Lbr hrs",
      thisWeekValue: "120.00",
      lastWeekLabel: "Lbr hrs",
      lastWeekValue: "0.00",
      twLw: "",
      budgetLabel: "Lbr hrs",
      budgetValue: "0.00",
      twBdg: "-48.18%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Lbr Pay",
      section: "LABOR COST",
      thisWeekLabel: "Lbr Pay",
      thisWeekValue: "$2,510.40",
      lastWeekLabel: "Lbr Pay",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "Lbr Pay",
      budgetValue: "$0.00",
      twBdg: "-55.71%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Lbr %",
      section: "LABOR COST",
      thisWeekLabel: "Lbr %",
      thisWeekValue: "34.99%",
      lastWeekLabel: "Lbr %",
      lastWeekValue: "",
      twLw: "34.99%",
      twLwColor: "#d32f2f",
      twLwArrow: "up",
      budgetLabel: "Lbr %",
      budgetValue: "",
      twBdg: "1.56%",
      twBdgColor: "#d32f2f",
      twBdgArrow: "up"
    },
    {
      category: "SPMH",
      section: "LABOR COST",
      thisWeekLabel: "SPMH",
      thisWeekValue: "thr",
      lastWeekLabel: "SPMH",
      lastWeekValue: "#VALUE!",
      twLw: "#VALUE!",
      budgetLabel: "SPMH",
      budgetValue: "",
      twBdg: "-18.93%",
      twBdgColor: "#d32f2f",
      twBdgArrow: "down"
    },
    {
      category: "LPMH",
      section: "LABOR COST",
      thisWeekLabel: "LPMH",
      thisWeekValue: "$20.92",
      lastWeekLabel: "a",
      lastWeekValue: "",
      twLw: "20.92%",
      twLwColor: "#d32f2f",
      twLwArrow: "up",
      budgetLabel: "LPMH",
      budgetValue: "",
      twBdg: "-14.53%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    
    // FOOD COST category (rows 10-23)
    {
      category: "Tw Johns",
      section: "FOOD COST",
      thisWeekLabel: "Tw Johns",
      thisWeekValue: "$0.00",
      lastWeekLabel: "Tw Johns",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "Tw Johns",
      budgetValue: "$0.00",
      twBdg: "-100.00%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Terra",
      section: "FOOD COST",
      thisWeekLabel: "Terra",
      thisWeekValue: "$167.80",
      lastWeekLabel: "Terra",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "Terra",
      budgetValue: "$0.00",
      twBdg: "-100.00%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Metro",
      section: "FOOD COST",
      thisWeekLabel: "Metro",
      thisWeekValue: "$653.04",
      lastWeekLabel: "Metro",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "Metro",
      budgetValue: "$0.00",
      twBdg: "-100.00%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Victory",
      section: "FOOD COST",
      thisWeekLabel: "Victory",
      thisWeekValue: "$0.00",
      lastWeekLabel: "Victory",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "Victory",
      budgetValue: "$0.00",
      twBdg: "-100.00%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Central Kitchen",
      section: "FOOD COST",
      thisWeekLabel: "Central Kitchen",
      thisWeekValue: "$3,640.89",
      lastWeekLabel: "Central Kitchen",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "Central Kitchen",
      budgetValue: "$0.00",
      twBdg: "-100.00%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Other",
      section: "FOOD COST",
      thisWeekLabel: "Other",
      thisWeekValue: "$59.00",
      lastWeekLabel: "Other",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "Other",
      budgetValue: "$0.00",
      twBdg: "",
      twBdgColor: "",
      twBdgArrow: ""
    },
    {
      category: "",
      section: "FOOD COST",
      thisWeekLabel: "",
      thisWeekValue: "$0.00",
      lastWeekLabel: "",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "",
      budgetValue: "$0.00",
      twBdg: "",
      twBdgColor: "",
      twBdgArrow: ""
    },
    {
      category: "",
      section: "FOOD COST",
      thisWeekLabel: "",
      thisWeekValue: "$0.00",
      lastWeekLabel: "",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "",
      budgetValue: "$0.00",
      twBdg: "",
      twBdgColor: "",
      twBdgArrow: ""
    },
    {
      category: "",
      section: "FOOD COST",
      thisWeekLabel: "",
      thisWeekValue: "$0.00",
      lastWeekLabel: "",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "",
      budgetValue: "$0.00",
      twBdg: "",
      twBdgColor: "",
      twBdgArrow: ""
    },
    {
      category: "",
      section: "FOOD COST",
      thisWeekLabel: "",
      thisWeekValue: "$0.00",
      lastWeekLabel: "",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "",
      budgetValue: "$0.00",
      twBdg: "",
      twBdgColor: "",
      twBdgArrow: ""
    },
    {
      category: "TTL",
      section: "FOOD COST",
      thisWeekLabel: "TTL",
      thisWeekValue: "$4,520.73",
      lastWeekLabel: "TTL",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "TTL",
      budgetValue: "$0.00",
      twBdg: "-100.00%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Food Cost %",
      section: "FOOD COST",
      thisWeekLabel: "Food Cost %",
      thisWeekValue: "63.01%",
      lastWeekLabel: "Food Cost %",
      lastWeekValue: "",
      twLw: "0.00%",
      twLwColor: "#d32f2f",
      twLwArrow: "up",
      budgetLabel: "Food Cost %",
      budgetValue: "",
      twBdg: "-30.00%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Prime Cost $",
      section: "FOOD COST",
      thisWeekLabel: "Prime Cost $",
      thisWeekValue: "$7,031.13",
      lastWeekLabel: "Prime Cost $",
      lastWeekValue: "$0.00",
      twLw: "",
      budgetLabel: "Prime Cost $",
      budgetValue: "$0.00",
      twBdg: "-78.36%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    },
    {
      category: "Prime Cost %",
      section: "FOOD COST",
      thisWeekLabel: "Prime Cost %",
      thisWeekValue: "98.00%",
      lastWeekLabel: "Prime Cost %",
      lastWeekValue: "",
      twLw: "30.23%",
      twLwColor: "#d32f2f",
      twLwArrow: "up",
      budgetLabel: "Prime Cost %",
      budgetValue: "",
      twBdg: "-28.44%",
      twBdgColor: "#2e7d32",
      twBdgArrow: "down"
    }
  ];

  return (
    <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', width: '100%' }}>
      <Box sx={{ display: 'flex', width: '100%', backgroundColor: '#ffffff' }}>
        {/* Side Labels */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '40px',
          flexShrink: 0,
          borderRight: '1px solid #e0e0e0',
        }}>
          {/* SALES label (rows 1-4) */}
          <Box sx={{ 
            height: '207px',
            backgroundColor: '#0000ee',
            color: 'white',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '15px',
            letterSpacing: '1px'
          }}>
            SALES
          </Box>
          
          {/* LABOR COST label (rows 5-9) */}
          <Box sx={{ 
            height: '260px',
            backgroundColor: '#b71c1c',
            color: 'white',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '15px',
            letterSpacing: '1px'
          }}>
            LABOR COST
          </Box>
          
          {/* FOOD COST label (rows 10-23) */}
          <Box sx={{ 
            height: '533px',
            backgroundColor: '#a45c00',
            color: 'white',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '15px',
            letterSpacing: '1px'
          }}>
            FOOD COST
          </Box>
        </Box>
        
        {/* Main Table */}
        <TableContainer sx={{ flexGrow: 1, overflowX: 'auto' }}>
          <Table size="small" sx={{ tableLayout: 'fixed', minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell 
                  colSpan={2}
                  align="center"
                  sx={{ 
                    backgroundColor: '#0000ee', 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '30%',
                    border: '1px solid #e0e0e0',
                    padding: '14px 8px'
                  }}
                >
                  This Weeks Trend
                </TableCell>
                <TableCell 
                  colSpan={2}
                  align="center"
                  sx={{ 
                    backgroundColor: '#fff8dc',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '30%',
                    border: '1px solid #e0e0e0',
                    padding: '14px 8px'
                  }}
                >
                  Last Weeks Trend
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    backgroundColor: '#ff6d00', 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '10%',
                    border: '1px solid #e0e0e0',
                    padding: '14px 8px'
                  }}
                >
                  TW/LW (+/-)
                </TableCell>
                <TableCell 
                  colSpan={2}
                  align="center"
                  sx={{ 
                    backgroundColor: '#000000', 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '20%',
                    border: '1px solid #e0e0e0',
                    padding: '14px 8px'
                  }}
                >
                  This Weeks Budget
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ 
                    backgroundColor: '#ff6d00', 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '16px',
                    width: '10%',
                    border: '1px solid #e0e0e0',
                    padding: '14px 8px'
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
                    height: '52px',
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: index % 2 === 0 ? '#fafafa' : '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  {/* This Weeks Trend - Label */}
                  <TableCell 
                    align="center"
                    sx={{ 
                      borderRight: '1px solid #e0e0e0',
                      padding: '8px 12px',
                      width: '15%',
                      fontSize: '15px',
                      fontWeight: 400
                    }}
                  >
                    {row.thisWeekLabel}
                  </TableCell>
                  {/* This Weeks Trend - Value */}
                  <TableCell 
                    align="center"
                    sx={{ 
                      borderRight: '1px solid #e0e0e0',
                      padding: '8px 12px',
                      width: '15%',
                      fontSize: '15px',
                      fontWeight: 400
                    }}
                  >
                    {row.thisWeekValue}
                  </TableCell>
                  
                  {/* Last Weeks Trend - Label */}
                  <TableCell 
                    align="center"
                    sx={{ 
                      borderRight: '1px solid #e0e0e0',
                      padding: '8px 12px',
                      width: '15%',
                      fontSize: '15px',
                      fontWeight: 400
                    }}
                  >
                    {row.lastWeekLabel}
                  </TableCell>
                  {/* Last Weeks Trend - Value */}
                  <TableCell 
                    align="center"
                    sx={{ 
                      borderRight: '1px solid #e0e0e0',
                      padding: '8px 12px',
                      width: '15%',
                      fontSize: '15px',
                      fontWeight: 400
                    }}
                  >
                    {row.lastWeekValue}
                  </TableCell>
                  
                  {/* TW/LW (+/-) */}
                  <TableCell 
                    align="center"
                    sx={{ 
                      borderRight: '1px solid #e0e0e0',
                      padding: '8px 12px',
                      fontSize: '15px',
                      fontWeight: 400
                    }}
                  >
                    {row.twLw && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 0.5
                      }}>
                        {row.twLwArrow === 'up' && (
                          <span style={{ 
                            color: row.twLwColor, 
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>▲</span>
                        )}
                        <Typography sx={{ 
                          color: row.twLwColor || 'inherit',
                          fontSize: '15px',
                          fontWeight: 400
                        }}>
                          {row.twLw}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  
                  {/* This Weeks Budget - Label */}
                  <TableCell 
                    align="center"
                    sx={{ 
                      borderRight: '1px solid #e0e0e0',
                      padding: '8px 12px',
                      width: '10%',
                      fontSize: '15px',
                      fontWeight: 400
                    }}
                  >
                    {row.budgetLabel}
                  </TableCell>
                  {/* This Weeks Budget - Value */}
                  <TableCell 
                    align="center"
                    sx={{ 
                      borderRight: '1px solid #e0e0e0',
                      padding: '8px 12px',
                      width: '10%',
                      fontSize: '15px',
                      fontWeight: 400
                    }}
                  >
                    {row.budgetValue}
                  </TableCell>
                  
                  {/* TW/Bdg (+/-) */}
                  <TableCell 
                    align="center"
                    sx={{ 
                      padding: '8px 12px',
                      fontSize: '15px',
                      fontWeight: 400
                    }}
                  >
                    {row.twBdg && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: 0.5
                      }}>
                        <Typography sx={{ 
                          color: row.twBdgColor || 'inherit',
                          fontSize: '15px',
                          fontWeight: 400
                        }}>
                          {row.twBdg}
                        </Typography>
                        {row.twBdgArrow === 'up' ? (
                          <span style={{ 
                            color: row.twBdgColor, 
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>▲</span>
                        ) : row.twBdgArrow === 'down' && (
                          <span style={{ 
                            color: row.twBdgColor, 
                            fontSize: '14px',
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
    </Paper>
  );
};

export default FinancialTable;
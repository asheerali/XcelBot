import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export function Financials() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State for dropdown selections
  const [store, setStore] = useState('0001: Midtown East');
  const [year, setYear] = useState('2025');
  const [dateRange, setDateRange] = useState('1 | 12/30/2024 - 01/05/2025');

  // Sample data for the Week-Over-Week Analysis
  const statsData = [
    { 
      label: 'Net Sales', 
      value: '$8,268.68', 
      bottomChange: '+0%',
      bottomLabel: '% Change'
    },
    { 
      label: 'Orders', 
      value: '372', 
      bottomChange: '+0%',
      bottomLabel: '% Change'
    },
    { 
      label: 'Avg Ticket', 
      value: '$22.23', 
      bottomChange: '22.23$',
      changeDirection: 'up',
      changeColor: 'green',
      bottomLabel: '$ Change'
    },
    { 
      label: 'Food Cost', 
      value: '0.00%', 
      bottomChange: '0.00%',
      changeDirection: 'up',
      changeColor: 'red',
      bottomLabel: '% Change'
    },
    { 
      label: 'Labor Cost', 
      value: '30.23%', 
      bottomChange: '30.23%',
      changeDirection: 'up',
      changeColor: 'red',
      bottomLabel: '% Change'
    },
    { 
      label: 'SPMH', 
      value: '$68.91', 
      bottomChange: '68.91$',
      changeDirection: 'up',
      changeColor: 'green',
      bottomLabel: '% Change'
    },
    { 
      label: 'LPMH', 
      value: '$20.83', 
      bottomChange: '20.83%',
      changeDirection: 'up',
      changeColor: 'red',
      bottomLabel: '% Change'
    },
  ];

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
      twBdg: { value: "+8.18%", direction: "up", color: "green" }
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

  return (
    <Box sx={{ p: 2, maxWidth: '100%' }}>
      {/* Dashboard Title */}
      <Typography 
        variant="h4" 
        component="h1" 
        align="center" 
        sx={{ 
          mb: 3, 
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
        }}
      >
        FINANCIAL DASHBOARD
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: isTablet ? 'column' : 'row', 
        justifyContent: 'space-between', 
        mb: 3,
        gap: 3
      }}>
        {/* Left Side Filters */}
        <Box sx={{ width: isTablet ? '100%' : '30%' }}>
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 0.5 }}>
              Store
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                displayEmpty
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cccccc',
                  }
                }}
              >
                <MenuItem value="0001: Midtown East">0001: Midtown East</MenuItem>
                <MenuItem value="0002: Downtown West">0002: Downtown West</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography sx={{ mb: 0.5 }}>
              Year
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                displayEmpty
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cccccc',
                  }
                }}
              >
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography sx={{ mb: 0.5 }}>
              Week / Date Range
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                displayEmpty
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cccccc',
                  }
                }}
              >
                <MenuItem value="1 | 12/30/2024 - 01/05/2025">1 | 12/30/2024 - 01/05/2025</MenuItem>
                <MenuItem value="2 | 01/06/2025 - 01/12/2025">2 | 01/06/2025 - 01/12/2025</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Week-Over-Week Analysis */}
        <Box sx={{ width: isTablet ? '100%' : '68%' }}>
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.25rem' } 
            }}
          >
            Week-Over-Week Analysis
          </Typography>
          
          {/* Stats Grid - Exact match to the image */}
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            border: '1px solid #ccc'
          }}>
            {statsData.map((stat, index) => (
              <Box key={index} sx={{ 
                width: `${100 / 7}%`, 
                borderRight: index < statsData.length - 1 ? '1px solid #ccc' : 'none',
                textAlign: 'center',
                padding: 1,
                boxSizing: 'border-box'
              }}>
                <Typography sx={{ color: 'blue', fontWeight: 'bold' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h6" sx={{ my: 1 }}>
                  {stat.value}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  {stat.changeDirection && (
                    stat.changeDirection === 'up' ? 
                      <ArrowUpwardIcon fontSize="small" sx={{ 
                        color: stat.changeColor, 
                        mr: 0.5 
                      }} /> : 
                      <ArrowDownwardIcon fontSize="small" sx={{ 
                        color: stat.changeColor, 
                        mr: 0.5 
                      }} />
                  )}
                  <Typography sx={{ color: stat.changeColor || 'blue' }}>
                    {stat.bottomChange}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'blue' }}>
                  {stat.bottomLabel}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Main Table with Side Category Labels */}
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
            height: `${3 * 42}px`, 
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
            height: `${8 * 42}px`, 
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
            height: `${10 * 42}px`, 
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
                  Category
                </TableCell>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#0000cc', 
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    width: '16%',
                    border: '1px solid #000',
                    padding: '10px'
                  }}
                >
                  This Weeks Trend
                </TableCell>
                <TableCell 
                  sx={{ 
                    backgroundColor: '#fff8e1',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    width: '16%',
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
                  sx={{ 
                    backgroundColor: '#000000', 
                    color: 'white',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    width: '16%',
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
                  {/* Category */}
                  <TableCell sx={{ 
                    borderRight: '1px solid #ccc',
                    padding: '8px 12px',
                    fontWeight: row.category ? 'bold' : 'normal'
                  }}>
                    {row.category}
                  </TableCell>
                  
                  {/* This Weeks Trend */}
                  <TableCell 
                    align="right"
                    sx={{ 
                      borderRight: '1px solid #ccc',
                      padding: '8px 12px'
                    }}
                  >
                    {row.thisWeeksTrend}
                  </TableCell>
                  
                  {/* Last Weeks Trend */}
                  <TableCell 
                    sx={{ 
                      borderRight: '1px solid #ccc',
                      padding: '8px 12px'
                    }}
                  >
                    {row.lastWeeksTrend.label && (
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {row.lastWeeksTrend.label}
                      </Typography>
                    )}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end'
                    }}>
                      {row.lastWeeksTrend.value}
                    </Box>
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
                          <ArrowUpwardIcon 
                            fontSize="small" 
                            sx={{ 
                              color: row.twLw.color, 
                              mr: 0.5 
                            }} 
                          />
                        )}
                        <Typography sx={{ color: row.twLw.color }}>
                          {row.twLw.value}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  
                  {/* This Weeks Budget */}
                  <TableCell 
                    sx={{ 
                      borderRight: '1px solid #ccc',
                      padding: '8px 12px'
                    }}
                  >
                    {row.thisWeeksBudget.label && (
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {row.thisWeeksBudget.label}
                      </Typography>
                    )}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end'
                    }}>
                      {row.thisWeeksBudget.value}
                    </Box>
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
                          <ArrowUpwardIcon 
                            fontSize="small" 
                            sx={{ 
                              color: row.twBdg.color, 
                              ml: 0.5 
                            }} 
                          />
                        ) : row.twBdg.direction === 'down' && (
                          <ArrowDownwardIcon 
                            fontSize="small" 
                            sx={{ 
                              color: row.twBdg.color, 
                              ml: 0.5 
                            }} 
                          />
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
    </Box>
  );
}
export default Financials;
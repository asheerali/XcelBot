// src/components/FinancialTablesComponent.tsx
import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Tabs,
  Tab,
  useTheme,
  alpha,
  Card
} from '@mui/material';

// Interface for financial data
interface FinancialData {
  store: string;
  value1: string | number;
  value2: string | number;
  value3: string | number;
  change1: string | number;
  change2: string | number;
  isGrandTotal?: boolean;
}

// Interface for table type
interface TableType {
  title: string;
  columns: string[];
  data: FinancialData[];
}

// TabPanel Component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

function TablePanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`financial-tabpanel-${index}`}
      aria-labelledby={`financial-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FinancialTablesComponent: React.FC = () => {
  const theme = useTheme();
  const [tableTab, setTableTab] = useState(0);

  // Handle table tab change
  const handleTableTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTableTab(newValue);
  };

  // Format value with color based on whether it's positive or negative
  const formatValueWithColor = (value: string | number): { value: string, color: string } => {
    if (typeof value === 'string') {
      // Convert percentage string to number for comparison
      if (value.includes('%')) {
        const numValue = parseFloat(value.replace('%', ''));
        return {
          value,
          color: numValue < 0 ? theme.palette.error.main : numValue > 0 ? theme.palette.success.main : 'inherit'
        };
      }
      // Handle dollar values
      if (value.includes('$')) {
        const numValue = parseFloat(value.replace('$', '').replace(/,/g, ''));
        return {
          value,
          color: numValue < 0 ? theme.palette.error.main : 'inherit'
        };
      }
      // Return as is for other strings
      return { value, color: 'inherit' };
    } else {
      // For number values
      return {
        value: value.toString(),
        color: value < 0 ? theme.palette.error.main : value > 0 ? theme.palette.success.main : 'inherit'
      };
    }
  };

  // Sample financial data tables
  const financialTables: TableType[] = [
    {
      title: "Sales",
      columns: ["Store", "Tw Sales", "Lw Sales", "Ly Sales", "Tw vs. Lw", "Tw vs. Ly"],
      data: [
        { store: "0001: Midtown East", value1: "$684,828.09", value2: "$682,457.38", value3: "$1,732,837.11", change1: "0.35%", change2: "-60.48%" },
        { store: "0002: Lenox Hill", value1: "$783,896.10", value2: "$783,896.10", value3: "$2,235,045.87", change1: "0.00%", change2: "-64.93%" },
        { store: "0003: Hell's Kitchen", value1: "$894,800.88", value2: "$891,400.08", value3: "$2,402,680.02", change1: "0.38%", change2: "-62.76%" },
        { store: "0004: Union Square", value1: "$230,012.76", value2: "$229,111.90", value3: "$535,126.89", change1: "0.39%", change2: "-57.02%" },
        { store: "0005: Flatiron", value1: "$773,556.81", value2: "$771,903.19", value3: "$1,831,389.44", change1: "0.21%", change2: "-57.76%" },
        { store: "0011: Williamsburg", value1: "$129,696.74", value2: "$129,696.74", value3: "$454,048.17", change1: "0.00%", change2: "-71.44%" },
        { store: "Grand Total", value1: "$3,496,791.38", value2: "$3,488,465.39", value3: "$9,191,127.50", change1: "0.24%", change2: "-61.95%", isGrandTotal: true },
      ]
    },
    {
      title: "Orders",
      columns: ["Store", "Tw Orders", "Lw Orders", "Ly Orders", "Tw vs. Lw", "Tw vs. Ly"],
      data: [
        { store: "0001: Midtown East", value1: "25,157", value2: "25,157", value3: "71,201", change1: "0.00%", change2: "-64.67%" },
        { store: "0002: Lenox Hill", value1: "38,239", value2: "38,239", value3: "104,549", change1: "0.00%", change2: "-63.42%" },
        { store: "0003: Hell's Kitchen", value1: "41,880", value2: "41,880", value3: "111,192", change1: "0.00%", change2: "-62.34%" },
        { store: "0004: Union Square", value1: "10,509", value2: "10,509", value3: "25,316", change1: "0.00%", change2: "-58.49%" },
        { store: "0005: Flatiron", value1: "35,434", value2: "35,434", value3: "88,407", change1: "0.00%", change2: "-59.92%" },
        { store: "0011: Williamsburg", value1: "1,283", value2: "1,283", value3: "749", change1: "0.00%", change2: "71.30%" },
        { store: "Grand Total", value1: "152,502", value2: "152,502", value3: "401,414", change1: "0.00%", change2: "-62.01%", isGrandTotal: true },
      ]
    },
    {
      title: "Average Ticket",
      columns: ["Store", "Tw Avg Ticket", "Lw Avg Ticket", "Ly Avg Ticket", "Tw vs. Lw", "Tw vs. Ly"],
      data: [
        { store: "0001: Midtown East", value1: "$27.22", value2: "$27.13", value3: "$24.34", change1: "0.35%", change2: "11.85%" },
        { store: "0002: Lenox Hill", value1: "$20.50", value2: "$20.50", value3: "$21.38", change1: "0.00%", change2: "-4.11%" },
        { store: "0003: Hell's Kitchen", value1: "$21.37", value2: "$21.28", value3: "$21.61", change1: "0.38%", change2: "-1.12%" },
        { store: "0004: Union Square", value1: "$21.89", value2: "$21.80", value3: "$21.14", change1: "0.39%", change2: "3.54%" },
        { store: "0005: Flatiron", value1: "$21.83", value2: "$21.78", value3: "$20.72", change1: "0.21%", change2: "5.38%" },
        { store: "0011: Williamsburg", value1: "$101.09", value2: "$101.09", value3: "$606.21", change1: "0.00%", change2: "-83.32%" },
        { store: "Grand Total", value1: "$22.93", value2: "$22.87", value3: "$22.90", change1: "0.24%", change2: "0.14%", isGrandTotal: true },
      ]
    },
    {
      title: "COGS",
      columns: ["Store", "Tw COGS", "Lw COGS", "Tw vs. Lw", "Tw Fc %", "Lw Fc %"],
      data: [
        { store: "0001: Midtown East", value1: "$209,202.98", value2: "$208,770.59", value3: "0.21%", change1: "30.55%", change2: "30.59%" },
        { store: "0002: Lenox Hill", value1: "$263,932.59", value2: "$263,932.59", value3: "0.00%", change1: "33.67%", change2: "33.67%" },
        { store: "0003: Hell's Kitchen", value1: "$286,700.07", value2: "$286,259.49", value3: "0.15%", change1: "32.04%", change2: "32.11%" },
        { store: "0004: Union Square", value1: "$67,410.90", value2: "$66,989.23", value3: "0.63%", change1: "29.31%", change2: "29.24%" },
        { store: "0005: Flatiron", value1: "$242,340.09", value2: "$241,910.65", value3: "0.18%", change1: "31.33%", change2: "31.34%" },
        { store: "0011: Williamsburg", value1: "$72,649.35", value2: "$72,162.13", value3: "0.68%", change1: "2.08%", change2: "2.07%" },
        { store: "Grand Total", value1: "$1,142,235.99", value2: "$1,140,024.68", value3: "0.19%", change1: "32.67%", change2: "32.68%", isGrandTotal: true },
      ]
    },
    {
      title: "Regular Pay",
      columns: ["Store", "Tw Reg Pay", "Lw Reg Pay", "Tw vs. Lw", "Tw Lc %", "Lw Lc %"],
      data: [
        { store: "0001: Midtown East", value1: "$120,317.61", value2: "$120,317.61", value3: "0.00%", change1: "17.57%", change2: "17.63%" },
        { store: "0002: Lenox Hill", value1: "$187,929.88", value2: "$186,309.88", value3: "0.87%", change1: "23.97%", change2: "23.77%" },
        { store: "0003: Hell's Kitchen", value1: "$200,590.94", value2: "$199,078.22", value3: "0.76%", change1: "22.42%", change2: "22.33%" },
        { store: "0004: Union Square", value1: "$56,704.25", value2: "$56,704.25", value3: "0.00%", change1: "24.65%", change2: "24.75%" },
        { store: "0005: Flatiron", value1: "$174,991.94", value2: "$173,694.02", value3: "0.75%", change1: "22.62%", change2: "22.50%" },
        { store: "0011: Williamsburg", value1: "$290,133.01", value2: "$290,929.09", value3: "-0.27%", change1: "8.30%", change2: "8.34%" },
        { store: "Grand Total", value1: "$1,030,667.64", value2: "$1,027,033.08", value3: "0.35%", change1: "29.47%", change2: "29.44%", isGrandTotal: true },
      ]
    },
    {
      title: "Labor Hours",
      columns: ["Store", "Tw Lb Hrs", "Lw Lb Hrs", "Tw vs. Lw"],
      data: [
        { store: "0001: Midtown East", value1: "5,737.37", value2: "5,737.37", value3: "0.00%", change1: "", change2: "" },
        { store: "0002: Lenox Hill", value1: "9,291.48", value2: "9,291.48", value3: "0.00%", change1: "", change2: "" },
        { store: "0003: Hell's Kitchen", value1: "9,436.65", value2: "9,436.65", value3: "0.00%", change1: "", change2: "" },
        { store: "0004: Union Square", value1: "2,830.92", value2: "2,830.92", value3: "0.00%", change1: "", change2: "" },
        { store: "0005: Flatiron", value1: "8,598.96", value2: "8,598.96", value3: "0.00%", change1: "", change2: "" },
        { store: "0011: Williamsburg", value1: "12,297.80", value2: "12,297.80", value3: "0.00%", change1: "", change2: "" },
        { store: "Grand Total", value1: "48,193.18", value2: "48,193.18", value3: "0.00%", change1: "", change2: "", isGrandTotal: true },
      ]
    },
    {
      title: "SPMH",
      columns: ["Store", "Tw SPMH", "Lw SPMH", "Tw vs. Lw"],
      data: [
        { store: "0001: Midtown East", value1: "117.44", value2: "389.74", value3: "-69.87%", change1: "", change2: "" },
        { store: "0002: Lenox Hill", value1: "84.34", value2: "84.34", value3: "0.00%", change1: "", change2: "" },
        { store: "0003: Hell's Kitchen", value1: "105.41", value2: "345.76", value3: "-69.51%", change1: "", change2: "" },
        { store: "0004: Union Square", value1: "71.39", value2: "198.36", value3: "-64.01%", change1: "", change2: "" },
        { store: "0005: Flatiron", value1: "99.08", value2: "305.27", value3: "-67.54%", change1: "", change2: "" },
        { store: "0011: Williamsburg", value1: "10.12", value2: "668.70", value3: "-98.49%", change1: "", change2: "" },
        { store: "Grand Total", value1: "$83.65", value2: "325.889628", value3: "-74.33%", change1: "", change2: "", isGrandTotal: true },
      ]
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Table filter tabs */}
      <Tabs 
        value={tableTab}
        onChange={handleTableTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            textTransform: 'none',
            minWidth: 'unset',
            fontWeight: 500,
            fontSize: '0.9rem',
            px: 3,
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              fontWeight: 600
            }
          }
        }}
      >
        <Tab label="All Tables" />
        <Tab label="Sales" />
        <Tab label="Orders" />
        <Tab label="Average Ticket" />
        <Tab label="COGS" />
        <Tab label="Regular Pay" />
        <Tab label="Labor Hours" />
        <Tab label="SPMH" />
      </Tabs>

      {/* All Tables Panel */}
      <TablePanel value={tableTab} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {financialTables.map((table, index) => (
            <Card 
              key={index} 
              elevation={2}
              sx={{ 
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: theme.palette.divider
              }}
            >
              {/* Table Header */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  px: 2,
                  py: 1
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {table.title}
                </Typography>
              </Box>
              
              {/* Table Content */}
              <TableContainer>
                <Table size="small" sx={{ '& th, & td': { px: 2, py: 1 } }}>
                  <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableRow>
                      {table.columns.map((column, colIndex) => (
                        <TableCell 
                          key={colIndex}
                          align={colIndex === 0 ? 'left' : 'right'}
                          sx={{ 
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            borderBottom: `2px solid ${theme.palette.primary.main}`
                          }}
                        >
                          {column}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {table.data.map((row, rowIndex) => {
                      // Determine if this is the last row (Grand Total)
                      const isLastRow = rowIndex === table.data.length - 1;
                      
                      return (
                        <TableRow 
                          key={rowIndex}
                          sx={{ 
                            backgroundColor: isLastRow ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
                            '&:hover': {
                              backgroundColor: isLastRow ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.action.hover, 0.1)
                            },
                            // Add a top border for the Grand Total row
                            ...(isLastRow && {
                              '& td': { 
                                borderTop: `1px solid ${theme.palette.divider}`,
                                fontWeight: 'bold'
                              }
                            })
                          }}
                        >
                          <TableCell 
                            sx={{ 
                              fontWeight: isLastRow ? 'bold' : 'medium',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row.store}
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            {row.value1}
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            {row.value2}
                          </TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            {row.value3}
                          </TableCell>
                          {row.change1 !== undefined && (
                            <TableCell 
                              align="right" 
                              sx={{ 
                                whiteSpace: 'nowrap',
                                color: formatValueWithColor(row.change1).color
                              }}
                            >
                              {row.change1}
                            </TableCell>
                          )}
                          {row.change2 !== undefined && (
                            <TableCell 
                              align="right" 
                              sx={{ 
                                whiteSpace: 'nowrap',
                                color: formatValueWithColor(row.change2).color
                              }}
                            >
                              {row.change2}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ))}
        </Box>
      </TablePanel>

      {/* Individual table panels */}
      {financialTables.map((table, index) => (
        <TablePanel value={tableTab} index={index + 1} key={index}>
          <Card 
            elevation={2}
            sx={{ 
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            {/* Table Header */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                px: 2,
                py: 1
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {table.title}
              </Typography>
            </Box>
            
            {/* Table Content */}
            <TableContainer>
              <Table size="small" sx={{ '& th, & td': { px: 2, py: 1 } }}>
                <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableRow>
                    {table.columns.map((column, colIndex) => (
                      <TableCell 
                        key={colIndex}
                        align={colIndex === 0 ? 'left' : 'right'}
                        sx={{ 
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          borderBottom: `2px solid ${theme.palette.primary.main}`
                        }}
                      >
                        {column}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {table.data.map((row, rowIndex) => {
                    // Determine if this is the last row (Grand Total)
                    const isLastRow = rowIndex === table.data.length - 1;
                    
                    return (
                      <TableRow 
                        key={rowIndex}
                        sx={{ 
                          backgroundColor: isLastRow ? alpha(theme.palette.primary.main, 0.05) : 'inherit',
                          '&:hover': {
                            backgroundColor: isLastRow ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.action.hover, 0.1)
                          },
                          // Add a top border for the Grand Total row
                          ...(isLastRow && {
                            '& td': { 
                              borderTop: `1px solid ${theme.palette.divider}`,
                              fontWeight: 'bold'
                            }
                          })
                        }}
                      >
                        <TableCell 
                          sx={{ 
                            fontWeight: isLastRow ? 'bold' : 'medium',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {row.store}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {row.value1}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {row.value2}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {row.value3}
                        </TableCell>
                        {row.change1 !== undefined && (
                          <TableCell 
                            align="right" 
                            sx={{ 
                              whiteSpace: 'nowrap',
                              color: formatValueWithColor(row.change1).color
                            }}
                          >
                            {row.change1}
                          </TableCell>
                        )}
                        {row.change2 !== undefined && (
                          <TableCell 
                            align="right" 
                            sx={{ 
                              whiteSpace: 'nowrap',
                              color: formatValueWithColor(row.change2).color
                            }}
                          >
                            {row.change2}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </TablePanel>
      ))}
    </Box>
  );
};

export default FinancialTablesComponent;
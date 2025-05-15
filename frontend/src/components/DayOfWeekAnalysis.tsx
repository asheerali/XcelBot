import React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

const DayOfWeekAnalysis = () => {
  // Data structure based on your Excel spreadsheet
  const dayOfWeekSalesData = [
    {
      day: "1 - Monday",
      twSales: "$78,342.48",
      lwSales: "$73,538.43",
      lySales: "$204,935.43",
      tytreand: "0.00%",
      lytrends: "-61.77%",
      twLwChange: "+6.53%",
      twLyChange: "-61.77%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "2 - Tuesday",
      twSales: "$136,646.72",
      lwSales: "$139,080.06",
      lySales: "$383,819.96",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "-1.75%",
      twLyChange: "-64.40%",
      isPositiveTwLw: false,
      isPositiveTwLy: false,
    },
    {
      day: "3 - Wednesday",
      twSales: "$154,380.90",
      lwSales: "$154,380.90",
      lySales: "$419,204.38",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-63.17%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "4 - Thursday",
      twSales: "$142,480.95",
      lwSales: "$142,480.95",
      lySales: "$395,944.62",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-64.01%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "5 - Friday",
      twSales: "$80,651.51",
      lwSales: "$80,651.51",
      lySales: "$223,736.74",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-63.95%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "6 - Saturday",
      twSales: "$834.99",
      lwSales: "$834.99",
      lySales: "$60,192.66",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-98.61%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "7 - Sunday",
      twSales: "$1,208.99",
      lwSales: "$1,208.99",
      lySales: "$45,003.32",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-97.31%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "Grand Total",
      twSales: "$594,546.54",
      lwSales: "$592,175.83",
      lySales: "$1,732,837.11",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "+0.40%",
      twLyChange: "-65.69%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
      isTotal: true,
    },
  ];

  const dayOfWeekOrdersData = [
    {
      day: "1 - Monday",
      twOrders: "3,328",
      lwOrders: "3,328",
      lyOrders: "10,238",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-67.49%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "2 - Tuesday",
      twOrders: "5,020",
      lwOrders: "5,020",
      lyOrders: "15,017",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-66.57%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "3 - Wednesday",
      twOrders: "5,025",
      lwOrders: "5,025",
      lyOrders: "15,688",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-67.97%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "4 - Thursday",
      twOrders: "5,362",
      lwOrders: "5,362",
      lyOrders: "15,246",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-64.83%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "5 - Friday",
      twOrders: "3,427",
      lwOrders: "3,427",
      lyOrders: "9,603",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-64.31%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "6 - Saturday",
      twOrders: "2",
      lwOrders: "2",
      lyOrders: "3,060",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-99.93%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "7 - Sunday",
      twOrders: "1",
      lwOrders: "1",
      lyOrders: "2,349",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-99.96%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "Grand Total",
      twOrders: "22,165",
      lwOrders: "22,165",
      lyOrders: "71,201",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-68.87%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
      isTotal: true,
    },
  ];

  const dayOfWeekAvgTicketData = [
    {
      day: "1 - Monday",
      twAvgTicket: "$400.75",
      lwAvgTicket: "$400.75",
      lyAvgTicket: "$981.27",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-59.16%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "2 - Tuesday",
      twAvgTicket: "$464.78",
      lwAvgTicket: "$464.78",
      lyAvgTicket: "$1,336.11",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-65.21%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "3 - Wednesday",
      twAvgTicket: "$488.08",
      lwAvgTicket: "$488.08",
      lyAvgTicket: "$1,356.76",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-64.03%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "4 - Thursday",
      twAvgTicket: "$449.57",
      lwAvgTicket: "$449.57",
      lyAvgTicket: "$2,383.05",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-81.13%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "5 - Friday",
      twAvgTicket: "$401.79",
      lwAvgTicket: "$401.79",
      lyAvgTicket: "$1,233.34",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "-67.42%",
      isPositiveTwLw: true,
      isPositiveTwLy: false,
    },
    {
      day: "6 - Saturday",
      twAvgTicket: "$834.99",
      lwAvgTicket: "$834.99",
      lyAvgTicket: "$237.09",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "+252.19%",
      isPositiveTwLw: true,
      isPositiveTwLy: true,
    },
    {
      day: "7 - Sunday",
      twAvgTicket: "$1,208.99",
      lwAvgTicket: "$1,208.99",
      lyAvgTicket: "$893.36",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "0.00%",
      twLyChange: "+35.33%",
      isPositiveTwLw: true,
      isPositiveTwLy: true,
    },
    {
      day: "Grand Total",
      twAvgTicket: "$26.82",
      lwAvgTicket: "$26.72",
      lyAvgTicket: "$24.34",
      tytreand: "0.00%",
      lytrends: "0.00%",
      twLwChange: "+0.40%",
      twLyChange: "+10.22%",
      isPositiveTwLw: true,
      isPositiveTwLy: true,
      isTotal: true,
    },
  ];

  const renderTable = (title, data, metrics) => (
    <Paper sx={{ mb: 4, overflow: "hidden" }}>
      <Typography
        variant="h5"
        sx={{
          p: 3,
          backgroundColor: "#f5f5f5",
          fontWeight: "bold",
          textAlign: "center",
          fontSize: "1.75rem",
        }}
      >
        {title}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                }}
              >
                Day of The Week
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                }}
              >
                {metrics.twLabel}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                }}
              >
                {metrics.lwLabel}
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                }}
              >
                {metrics.lyLabel}
              </TableCell>
              {/* 
 <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  backgroundColor: "#ffeb3b",
                  color: "#000",
                  fontSize: "1rem",
                }}
              >
                Ty Trends 
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  backgroundColor: "#ffeb3b",
                  color: "#000",
                  fontSize: "1rem",
                }}
              >
                Ly Trends
              </TableCell> */}

              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  backgroundColor: "#ffeb3b",
                  color: "#000",
                  fontSize: "1rem",
                }}
              >
                Tw/Lw (+/-)
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  backgroundColor: "#ffeb3b",
                  color: "#000",
                  fontSize: "1rem",
                }}
              >
                Tw/Ly (+/-)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  backgroundColor: row.isTotal
                    ? "#e0e0e0"
                    : index % 2 === 0
                    ? "#f9f9f9"
                    : "#fff",
                  "&:hover": {
                    backgroundColor: row.isTotal ? "#d0d0d0" : "#f0f0f0",
                  },
                }}
              >
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row.day}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row[metrics.twField]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row[metrics.lwField]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row[metrics.lyField]}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    color: row.isPositiveTwLw ? "green" : "red",
                    backgroundColor: row.isTotal ? "#fff3c4" : "transparent",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row.twLwChange}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: row.isTotal ? "bold" : "normal",
                    border: "1px solid #ddd",
                    color: row.isPositiveTwLy ? "green" : "red",
                    backgroundColor: row.isTotal ? "#fff3c4" : "transparent",
                    fontSize: row.isTotal ? "0.95rem" : "0.9rem",
                  }}
                >
                  {row.twLyChange}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box sx={{ p: 2 }}>
      {renderTable("Day of Week - Sales Analysis", dayOfWeekSalesData, {
        twLabel: "Tw Sales",
        lwLabel: "Lw Sales",
        lyLabel: "Ly Sales",
        twField: "twSales",
        tytrends: "tytrends",
        lytrends: "lytrends",
        lwField: "lwSales",
        lyField: "lySales",
      })}

      {renderTable("Day of Week - Orders Analysis", dayOfWeekOrdersData, {
        twLabel: "Tw Orders",
        lwLabel: "Lw Orders",
        lyLabel: "Ly Orders",
        twField: "twOrders",
        lwField: "lwOrders",
        lyField: "lyOrders",
      })}

      {renderTable(
        "Day of Week - Average Ticket Analysis",
        dayOfWeekAvgTicketData,
        {
          twLabel: "Tw Avg Tckt",
          lwLabel: "Lw Avg Tckt",
          lyLabel: "Ly Avg Tckt",
          twField: "twAvgTicket",
          lwField: "lwAvgTicket",
          lyField: "lyAvgTicket",
        }
      )}
    </Box>
  );
};

export default DayOfWeekAnalysis;

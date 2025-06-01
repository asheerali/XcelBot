import React, { useState } from 'react';
import { DateRangePicker, createStaticRanges } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  subMonths,
  format 
} from 'date-fns';
import Box from '@mui/material/Box';

interface DateRangeSelectorProps {
  initialState?: any[];
  onSelect: (range: any) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ 
  initialState,
  onSelect
}) => {
  // Default state if not provided
  const defaultState = [
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ];

  // Use provided initialState or default
  const [state, setState] = useState(initialState || defaultState);

  // Helper function to get the most recent Monday (or today if today is Monday)
  const getMostRecentMonday = (date: Date): Date => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysFromLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday becomes 6, others are days since Monday
    return addDays(date, -daysFromLastMonday);
  };

  // Helper function to create week-based ranges that end on Monday
  const createWeekBasedRange = (totalDays: number) => {
    return () => {
      const today = new Date();
      
      // Calculate the original date range
      const originalStartDate = addDays(today, -(totalDays - 1)); // -1 because we include today
      
      // Find the most recent Monday
      const lastMonday = getMostRecentMonday(today);
      
      // Calculate how many days we're losing by ending on Monday instead of today
      const dayOfWeek = today.getDay();
      const daysLost = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days from Monday to today
      
      // Extend the start date by the number of days lost
      const adjustedStartDate = addDays(originalStartDate, -daysLost);
      
      return {
        startDate: adjustedStartDate,
        endDate: lastMonday
      };
    };
  };

  // Define static ranges - UPDATED with week-end adjustment
  const staticRanges = createStaticRanges([
    {
      label: 'Today',
      range: () => ({
        startDate: new Date(),
        endDate: new Date()
      })
    },
    {
      label: 'Yesterday',
      range: () => ({
        startDate: addDays(new Date(), -1),
        endDate: addDays(new Date(), -1)
      })
    },
    {
      label: 'Last 7 Days',
      range: createWeekBasedRange(7)
    },
    {
      label: 'Last 30 Days',
      range: () => ({
        startDate: addDays(new Date(), -29),
        endDate: new Date()
      })
    },
    // UPDATED: Last 4 weeks with Monday adjustment
    {
      label: 'Last 4 Weeks',
      range: createWeekBasedRange(28) // 4 weeks * 7 days
    },
    // UPDATED: Last 8 weeks with Monday adjustment
    {
      label: 'Last 8 Weeks',
      range: createWeekBasedRange(56) // 8 weeks * 7 days
    },
    // UPDATED: Last 13 weeks with Monday adjustment
    {
      label: 'Last 13 Weeks',
      range: createWeekBasedRange(91) // 13 weeks * 7 days
    },
    {
      label: 'This Month',
      range: () => ({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date())
      })
    },
    {
      label: 'Last Month',
      range: () => {
        const now = new Date();
        const lastMonth = subMonths(now, 1);
        return {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth)
        };
      }
    },
    {
      label: 'This Week',
      range: () => ({
        startDate: startOfWeek(new Date(), { weekStartsOn: 1 }), // Start on Monday
        endDate: endOfWeek(new Date(), { weekStartsOn: 1 })
      })
    },
    {
      label: 'Last Week',
      range: () => {
        const now = new Date();
        const lastWeekStart = startOfWeek(addDays(now, -7), { weekStartsOn: 1 });
        const lastWeekEnd = endOfWeek(addDays(now, -7), { weekStartsOn: 1 });
        return {
          startDate: lastWeekStart,
          endDate: lastWeekEnd
        };
      }
    },
  
  ]);

  // Handle date range selection
  const handleSelect = (ranges: any) => {
    if (ranges.selection) {
      setState([ranges.selection]);
      
      // Format dates correctly for the backend
      const formattedStartDate = format(ranges.selection.startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(ranges.selection.endDate, 'yyyy-MM-dd');
      
      // Pass both Date objects and formatted strings to parent
      onSelect({
        startDate: ranges.selection.startDate,
        endDate: ranges.selection.endDate,
        startDateStr: formattedStartDate,
        endDateStr: formattedEndDate
      });
    }
  };

  return (
    <Box sx={{ 
      '& .rdrCalendarWrapper': {
        fontSize: '14px'
      },
      '& .rdrStaticRange': {
        padding: '8px 16px',
        '&:hover': {
          backgroundColor: '#f5f5f5'
        }
      },
      '& .rdrStaticRangeSelected': {
        backgroundColor: '#1976d2',
        color: 'white'
      },
      '& .rdrStaticRangeLabel': {
        fontSize: '14px'
      }
    }}>
      <DateRangePicker
        onChange={handleSelect}
        showSelectionPreview={true}
        moveRangeOnFirstSelection={false}
        months={2}
        ranges={state}
        direction="horizontal"
        staticRanges={staticRanges}
        inputRanges={[]}
        showDateDisplay={false}
        showMonthAndYearPickers={true}
      />
    </Box>
  );
};

export default DateRangeSelector;
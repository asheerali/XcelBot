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

  // Helper function to get the start of the current week (Monday)
  const getCurrentWeekStart = (date: Date): Date => {
    return startOfWeek(date, { weekStartsOn: 1 }); // Monday = 1
  };

  // Helper function to get the previous complete week (Monday to Sunday)
  const getPreviousWeek = () => {
    const today = new Date();
    const currentWeekStart = getCurrentWeekStart(today);
    
    // Get the start of last week (7 days before current week start)
    const lastWeekStart = addDays(currentWeekStart, -7);
    // Get the end of last week (6 days after last week start = Sunday)
    const lastWeekEnd = addDays(lastWeekStart, 6);
    
    return {
      startDate: lastWeekStart,
      endDate: lastWeekEnd
    };
  };

  // Helper function to get X complete weeks before the current week
  const getPreviousXWeeks = (numWeeks: number) => {
    return () => {
      const today = new Date();
      const currentWeekStart = getCurrentWeekStart(today);
      
      // Start from X weeks before the current week
      const startDate = addDays(currentWeekStart, -(numWeeks * 7));
      // End at the day before the current week starts (last Sunday)
      const endDate = addDays(currentWeekStart, -1);
      
      return {
        startDate,
        endDate
      };
    };
  };

  // Define static ranges - UPDATED with proper week logic
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
      range: () => ({
        startDate: addDays(new Date(), -6), // 6 days ago + today = 7 days
        endDate: new Date()
      })
    },
    {
      label: 'Last 30 Days',
      range: () => ({
        startDate: addDays(new Date(), -29), // 29 days ago + today = 30 days
        endDate: new Date()
      })
    },
    {
      label: 'Last Week',
      range: getPreviousWeek
    },
    {
      label: 'Last 2 Weeks',
      range: getPreviousXWeeks(2)
    },
    {
      label: 'Last 4 Weeks',
      range: getPreviousXWeeks(4)
    },
    {
      label: 'Last 8 Weeks',
      range: getPreviousXWeeks(8)
    },
    {
      label: 'Last 13 Weeks',
      range: getPreviousXWeeks(13)
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
        endDate: endOfWeek(new Date(), { weekStartsOn: 1 })     // End on Sunday
      })
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
        weekStartsOn={1}
      />
    </Box>
  );
};

export default DateRangeSelector;
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

  // Define static ranges
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
        startDate: addDays(new Date(), -6),
        endDate: new Date()
      })
    },
    {
      label: 'Last 30 Days',
      range: () => ({
        startDate: addDays(new Date(), -29),
        endDate: new Date()
      })
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
    }
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
    <DateRangePicker
      onChange={handleSelect}
      showSelectionPreview={true}
      moveRangeOnFirstSelection={false}
      months={2}
      ranges={state}
      direction="horizontal"
      staticRanges={staticRanges}
      inputRanges={[]}
    />
  );
};

export default DateRangeSelector;
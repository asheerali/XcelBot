import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useAppDispatch, useAppSelector } from '../typedHooks';
import { selectLocation } from '../store/excelSlice';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import PlaceIcon from '@mui/icons-material/Place';
import FilterListIcon from '@mui/icons-material/FilterList';
import PersonIcon from '@mui/icons-material/Person';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
// Sample dining options matching the image
const DINING_OPTIONS = [
    { group: 'Dine in', options: ['Dine In', 'Kiosk Dine-In'] },
    { group: 'Take out', options: ['Take Out', 'Online Ordering - Takeout', 'Kiosk Takeout'] },
    { group: 'Delivery', options: ['Delivery', 'Online Ordering - Delivery'] },
    { group: 'Third Party', options: [
            'DoorDash - Takeout', 'Uber Eats - Takeout', 'Grubhub - Takeout',
            'DoorDash - Delivery', 'Uber Eats - Delivery', 'Grubhub - Delivery'
        ] },
    { group: 'Other', options: ['Curbside', 'No dining option'] }
];
// Sample employee names
const EMPLOYEE_NAMES = [
    'James Smith', 'Maria Garcia', 'David Johnson', 'Lisa Williams',
    'Robert Brown', 'Sarah Miller', 'Michael Davis', 'Jennifer Wilson',
    'William Jones', 'Jessica Taylor', 'Thomas Moore', 'Emily Anderson'
];
// Helper function to format date from yyyy-MM-dd to MM/DD/YYYY
const formatDateToMMDDYYYY = (dateString) => {
    if (!dateString)
        return '';
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime()))
        return '';
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
};
// Helper function to parse date from MM/DD/YYYY to yyyy-MM-dd (for HTML date input)
const parseDateToYYYYMMDD = (dateString) => {
    if (!dateString)
        return '';
    // Check if the date string matches MM/DD/YYYY format
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dateRegex.test(dateString))
        return '';
    const [month, day, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
};
const FilterSection = ({ dateRangeType, availableDateRanges, onDateRangeChange, customDateRange, startDate, endDate, onStartDateChange, onEndDateChange, selectedLocation, onApplyFilters }) => {
    // Get all locations from Redux store
    const dispatch = useAppDispatch();
    const { allLocations, files } = useAppSelector((state) => state.excel);
    // State for filter popovers
    const [isDiningOpen, setIsDiningOpen] = useState(false);
    const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
    // State for selected filters
    const [selectedDiningOptions, setSelectedDiningOptions] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    // Handle location change
    const handleLocationChange = (event) => {
        const newLocation = event.target.value;
        dispatch(selectLocation(newLocation));
        onApplyFilters(); // Apply filters after changing location
    };
    // Handle dining options filter button click
    const handleDiningFilterClick = () => {
        setIsDiningOpen(true);
    };
    // Handle employee filter button click
    const handleEmployeeFilterClick = () => {
        setIsEmployeeOpen(true);
    };
    // Handle closing popovers
    const handleCloseDining = () => {
        setIsDiningOpen(false);
    };
    const handleCloseEmployee = () => {
        setIsEmployeeOpen(false);
    };
    // Handle dining option checkbox changes
    const handleDiningOptionChange = (option) => {
        setSelectedDiningOptions(prev => {
            if (prev.includes(option)) {
                return prev.filter(item => item !== option);
            }
            else {
                return [...prev, option];
            }
        });
    };
    // Handle employee checkbox changes
    const handleEmployeeChange = (employee) => {
        setSelectedEmployees(prev => {
            if (prev.includes(employee)) {
                return prev.filter(item => item !== employee);
            }
            else {
                return [...prev, employee];
            }
        });
    };
    // Handle clearing all dining options
    const handleClearDiningOptions = () => {
        setSelectedDiningOptions([]);
    };
    // Handle clearing all employees
    const handleClearEmployees = () => {
        setSelectedEmployees([]);
    };
    // References for the hidden date inputs
    const startDateInputRef = useRef(null);
    const endDateInputRef = useRef(null);
    // Handle date selection from native date picker
    const handleHiddenStartDateChange = (event) => {
        const htmlDateValue = event.target.value; // This is in yyyy-MM-dd format
        // Convert to MM/DD/YYYY before passing to the parent component
        const formattedDate = htmlDateValue ? formatDateToMMDDYYYY(htmlDateValue) : '';
        // Create a synthetic event with the formatted date
        const syntheticEvent = {
            ...event,
            target: {
                ...event.target,
                value: formattedDate
            }
        };
        onStartDateChange(syntheticEvent);
    };
    const handleHiddenEndDateChange = (event) => {
        const htmlDateValue = event.target.value; // This is in yyyy-MM-dd format
        // Convert to MM/DD/YYYY before passing to the parent component
        const formattedDate = htmlDateValue ? formatDateToMMDDYYYY(htmlDateValue) : '';
        // Create a synthetic event with the formatted date
        const syntheticEvent = {
            ...event,
            target: {
                ...event.target,
                value: formattedDate
            }
        };
        onEndDateChange(syntheticEvent);
    };
    // Handlers to open the native date picker
    const openStartDatePicker = () => {
        if (startDateInputRef.current) {
            startDateInputRef.current.showPicker();
        }
    };
    const openEndDatePicker = () => {
        if (endDateInputRef.current) {
            endDateInputRef.current.showPicker();
        }
    };
    // Whether popovers are open - fix to avoid boolean of boolean
    return (_jsxs(Box, { children: [_jsxs(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 'normal' }, children: ["Current file: temp.xlsx (Location: ", selectedLocation, ")"] }), _jsxs(Grid, { container: true, spacing: 2, alignItems: "flex-start", sx: { mb: 2 }, children: [_jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsxs(FormControl, { fullWidth: true, sx: { height: 80 }, children: [_jsx(InputLabel, { id: "location-select-label", children: "Location" }), _jsx(Select, { labelId: "location-select-label", id: "location-select", value: selectedLocation, label: "Location", onChange: handleLocationChange, startAdornment: _jsx(PlaceIcon, { sx: { mr: 1, ml: -0.5, color: 'primary.main' } }), children: allLocations.map((location) => (_jsx(MenuItem, { value: location, children: location }, location))) }), _jsxs(Typography, { variant: "caption", color: "text.secondary", children: [files.length, " file(s) available"] })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsxs(FormControl, { fullWidth: true, sx: { height: 80 }, children: [_jsx(InputLabel, { id: "date-range-select-label", children: "Date Range" }), _jsx(Select, { labelId: "date-range-select-label", id: "date-range-select", value: dateRangeType, label: "Date Range", onChange: onDateRangeChange, startAdornment: _jsx(FilterListIcon, { sx: { mr: 1, ml: -0.5, color: 'primary.main' } }), children: availableDateRanges.map((range) => (_jsx(MenuItem, { value: range, children: range }, range))) }), _jsx(Box, { height: 20 })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsxs(FormControl, { fullWidth: true, sx: { height: 80 }, children: [_jsx(InputLabel, { id: "dining-select-label", children: "Dining Options" }), _jsx(Select, { labelId: "dining-select-label", id: "dining-select", value: "", label: "Dining Options", open: isDiningOpen, onOpen: handleDiningFilterClick, onClose: handleCloseDining, renderValue: () => "", startAdornment: _jsx(RestaurantIcon, { sx: { mr: 1, ml: -0.5, color: 'primary.main' } }), endAdornment: selectedDiningOptions.length > 0 && (_jsx(Chip, { size: "small", label: selectedDiningOptions.length, color: "primary", sx: { mr: 2, height: 24, minWidth: 28 } })), children: _jsxs(Box, { sx: { p: 2, width: 280 }, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "bold", children: "Dining Options" }), selectedDiningOptions.length > 0 && (_jsxs(Button, { size: "small", onClick: (e) => {
                                                            e.stopPropagation();
                                                            handleClearDiningOptions();
                                                        }, color: "inherit", sx: { fontSize: '0.75rem' }, children: ["Clear All (", selectedDiningOptions.length, ")"] }))] }), DINING_OPTIONS.map((group, index) => (_jsxs(Box, { mb: 1, children: [_jsx(Typography, { variant: "subtitle2", fontWeight: "bold", color: "text.secondary", sx: { mb: 0.5 }, children: group.group }), _jsx(FormGroup, { onClick: (e) => e.stopPropagation(), children: group.options.map(option => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: selectedDiningOptions.includes(option), onChange: () => handleDiningOptionChange(option), size: "small" }), label: _jsx(Typography, { variant: "body2", children: option }) }, option))) }), index < DINING_OPTIONS.length - 1 && _jsx(Divider, { sx: { my: 1 } })] }, group.group))), _jsx(Box, { mt: 2, display: "flex", justifyContent: "flex-end", children: _jsx(Button, { variant: "contained", size: "small", onClick: (e) => {
                                                        e.stopPropagation();
                                                        handleCloseDining();
                                                    }, children: "Apply" }) })] }) }), _jsxs(Typography, { variant: "caption", color: "text.secondary", children: [selectedDiningOptions.length, " option(s) selected"] })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 3, children: _jsxs(FormControl, { fullWidth: true, sx: { height: 80 }, children: [_jsx(InputLabel, { id: "employee-select-label", children: "Employees" }), _jsx(Select, { labelId: "employee-select-label", id: "employee-select", value: "", label: "Employees", open: isEmployeeOpen, onOpen: handleEmployeeFilterClick, onClose: handleCloseEmployee, renderValue: () => "", startAdornment: _jsx(PersonIcon, { sx: { mr: 1, ml: -0.5, color: 'primary.main' } }), endAdornment: selectedEmployees.length > 0 && (_jsx(Chip, { size: "small", label: selectedEmployees.length, color: "primary", sx: { mr: 2, height: 24, minWidth: 28 } })), children: _jsxs(Box, { sx: { p: 2, width: 250 }, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [_jsx(Typography, { variant: "subtitle1", fontWeight: "bold", children: "Employees" }), selectedEmployees.length > 0 && (_jsxs(Button, { size: "small", onClick: (e) => {
                                                            e.stopPropagation();
                                                            handleClearEmployees();
                                                        }, color: "inherit", sx: { fontSize: '0.75rem' }, children: ["Clear All (", selectedEmployees.length, ")"] }))] }), _jsx(TextField, { placeholder: "Search employees...", variant: "outlined", size: "small", fullWidth: true, sx: { mb: 2 }, onClick: (e) => e.stopPropagation(), onKeyDown: (e) => e.stopPropagation() }), _jsx(FormGroup, { onClick: (e) => e.stopPropagation(), children: EMPLOYEE_NAMES.map(employee => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: selectedEmployees.includes(employee), onChange: () => handleEmployeeChange(employee), size: "small" }), label: _jsx(Typography, { variant: "body2", children: employee }) }, employee))) }), _jsx(Box, { mt: 2, display: "flex", justifyContent: "flex-end", children: _jsx(Button, { variant: "contained", size: "small", onClick: (e) => {
                                                        e.stopPropagation();
                                                        handleCloseEmployee();
                                                    }, children: "Apply" }) })] }) }), _jsxs(Typography, { variant: "caption", color: "text.secondary", children: [selectedEmployees.length, " employee(s) selected"] })] }) }), customDateRange && (_jsxs(_Fragment, { children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Box, { position: "relative", children: [_jsx(TextField, { label: "Start Date", type: "text", value: startDate, onChange: onStartDateChange, InputLabelProps: { shrink: true }, placeholder: "MM/DD/YYYY", fullWidth: true, sx: { height: 56 }, InputProps: {
                                                endAdornment: (_jsx(IconButton, { onClick: openStartDatePicker, edge: "end", children: _jsx(CalendarTodayIcon, {}) })),
                                                readOnly: true, // Make the text field read-only
                                            } }), _jsx("input", { ref: startDateInputRef, type: "date", onChange: handleHiddenStartDateChange, value: parseDateToYYYYMMDD(startDate), style: {
                                                position: 'absolute',
                                                width: '1px',
                                                height: '1px',
                                                opacity: 0
                                            } })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsxs(Box, { position: "relative", children: [_jsx(TextField, { label: "End Date", type: "text", value: endDate, onChange: onEndDateChange, InputLabelProps: { shrink: true }, placeholder: "MM/DD/YYYY", fullWidth: true, sx: { height: 56 }, InputProps: {
                                                endAdornment: (_jsx(IconButton, { onClick: openEndDatePicker, edge: "end", children: _jsx(CalendarTodayIcon, {}) })),
                                                readOnly: true, // Make the text field read-only
                                            } }), _jsx("input", { ref: endDateInputRef, type: "date", onChange: handleHiddenEndDateChange, value: parseDateToYYYYMMDD(endDate), style: {
                                                position: 'absolute',
                                                width: '1px',
                                                height: '1px',
                                                opacity: 0
                                            } })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 12, md: 6, children: _jsx(Button, { variant: "contained", color: "primary", onClick: onApplyFilters, disabled: !startDate || !endDate, sx: { height: 56, width: '100%' }, children: "Apply Filters" }) })] })), (selectedDiningOptions.length > 0 || selectedEmployees.length > 0) && (_jsx(Grid, { item: true, xs: 12, children: _jsxs(Box, { display: "flex", flexWrap: "wrap", gap: 1, mt: 1, children: [selectedDiningOptions.map(option => (_jsx(Chip, { label: option, size: "small", onDelete: () => handleDiningOptionChange(option), deleteIcon: _jsx(CloseIcon, { fontSize: "small" }), icon: _jsx(RestaurantIcon, { fontSize: "small" }), sx: { background: 'rgba(25, 118, 210, 0.08)' } }, option))), selectedEmployees.map(employee => (_jsx(Chip, { label: employee, size: "small", onDelete: () => handleEmployeeChange(employee), deleteIcon: _jsx(CloseIcon, { fontSize: "small" }), icon: _jsx(PersonIcon, { fontSize: "small" }), sx: { background: 'rgba(25, 118, 210, 0.08)' } }, employee)))] }) }))] })] }));
};
export default FilterSection;

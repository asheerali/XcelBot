import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  IconButton,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
} from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Send as SendIcon,
  PersonAdd as PersonAddIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

import apiClient from "../api/axiosConfig"; // Import the consistent API client

// Interfaces
interface ScheduledEmail {
  id: number;
  receiver_name: string;
  receiver_email: string;
  receiving_time: string;
}

interface EmailListItem {
  email: string;
  selected: boolean;
  name: string;
  nameMode: "auto" | "manual";
}

interface EmailSchedulerProps {
  open: boolean;
  onClose: () => void;
  selectedCompanies: string[];
  getCompanyName: (companyId: string) => string;
}

// Helper functions
const formatTimeToHHMM = (timeString: string) => {
  if (!timeString) return "";
  const timeMatch = timeString.match(/(\d{2}):(\d{2})/);
  return timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : timeString;
};

const generateAutoName = (email: string) => {
  return "default name selected";
};

const EmailScheduler: React.FC<EmailSchedulerProps> = ({
  open,
  onClose,
  selectedCompanies,
  getCompanyName,
}) => {
  // State variables
  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([]);
  const [emailSchedulerLoading, setEmailSchedulerLoading] = useState(false);
  const [editEmailDialog, setEditEmailDialog] = useState({
    open: false,
    email: null,
  });
  const [createMailsDialog, setCreateMailsDialog] = useState(false);
  const [emailsList, setEmailsList] = useState<string[]>([]);
  const [emailListItems, setEmailListItems] = useState<EmailListItem[]>([]);
  const [createMailsLoading, setCreateMailsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [globalScheduledTime, setGlobalScheduledTime] = useState("10:45");
  const [localError, setLocalError] = useState<string | null>(null);
  const [setGlobalTimeLoading, setSetGlobalTimeLoading] = useState(false);
  const [fetchingGlobalTime, setFetchingGlobalTime] = useState(false);

  // API function to get global time
  const fetchGlobalTimeAPI = async (companyId: string) => {
    try {
      console.log(
        "🕐 Fetching global time via apiClient for company:",
        companyId
      );

      const response = await apiClient.get(`/mails/globaltime/${companyId}`);
      console.log("✅ Global time fetched:", response.data);

      return response.data; // This should be a string like "11:30"
    } catch (error: any) {
      console.error("❌ Error fetching global time via apiClient:", error);

      // Handle axios error response
      if (error.response) {
        if (error.response.status === 404) {
          console.log("ℹ️ No global time set for this company, using default");
          return null; // No global time set, will use default
        }
        throw new Error(
          error.response.data?.detail ||
            `HTTP error! status: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error(
          "No response from server. Please check if the backend is running."
        );
      } else {
        throw new Error(error.message || "Unknown error occurred");
      }
    }
  };

  // Function to fetch and set global time
  const fetchAndSetGlobalTime = async (companyId: string) => {
    if (!companyId) {
      console.log("⚠️ No company ID provided, skipping global time fetch");
      return;
    }

    setFetchingGlobalTime(true);
    try {
      const globalTime = await fetchGlobalTimeAPI(companyId);

      if (globalTime) {
        console.log("🕐 Setting global time from API:", globalTime);
        setGlobalScheduledTime(globalTime);
      } else {
        console.log(
          "🕐 No global time returned, keeping default:",
          globalScheduledTime
        );
      }
    } catch (error: any) {
      console.error("❌ Error fetching global time:", error);
      // Don't show error to user for this non-critical operation
      // Just keep the default time
      console.log("🕐 Using default time due to error:", globalScheduledTime);
    } finally {
      setFetchingGlobalTime(false);
    }
  };

  // API function to set global time using apiClient
  const setGlobalTimeAPI = async (companyId: string, globalTime: string) => {
    try {
      console.log("🌐 Setting global time via apiClient:", {
        companyId,
        globalTime,
        endpoint: "/mails/set_global_time",
      });

      const response = await apiClient.post("/mails/set_global_time", {
        company_id: parseInt(companyId),
        global_time: globalTime,
      });

      console.log("✅ Global time API response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Error setting global time via apiClient:", error);

      // Handle axios error response
      if (error.response) {
        throw new Error(
          error.response.data?.detail ||
            `HTTP error! status: ${error.response.status}`
        );
      } else if (error.request) {
        throw new Error(
          "No response from server. Please check if the backend is running."
        );
      } else {
        throw new Error(error.message || "Unknown error occurred");
      }
    }
  };

  // Handle get global time button click
  const handleGetGlobalTime = async () => {
    if (selectedCompanies.length === 0) {
      setLocalError("Please select a company first");
      return;
    }

    try {
      setLocalError(null);
      await fetchAndSetGlobalTime(selectedCompanies[0]);

      // Show success message
      console.log("✅ Global time fetched successfully via button click");
    } catch (error: any) {
      console.error("❌ Error fetching global time via button:", error);
      setLocalError(`Failed to fetch global time: ${error.message}`);
    }
  };

  // Handle set global time
  const handleSetGlobalTime = async () => {
    if (selectedCompanies.length === 0) {
      setLocalError("Please select a company first");
      return;
    }

    if (!globalScheduledTime) {
      setLocalError("Please set a global time");
      return;
    }

    try {
      setSetGlobalTimeLoading(true);
      setLocalError(null);

      const result = await setGlobalTimeAPI(
        selectedCompanies[0],
        globalScheduledTime
      );

      // Show success message with the returned global time
      alert(
        `${result.message}\nReturned Global Time: ${result.global_time}\nYour Role: ${result.user_role}`
      );

      // Update the UI with the returned time from the API (11:30)
      setGlobalScheduledTime(result.global_time);

      console.log("Global time set successfully:", result);

      // 🔄 REFRESH: Automatically fetch scheduled emails to show updated times
      console.log(
        "🔄 Refreshing scheduled emails after setting global time..."
      );
      await fetchScheduledEmails();
      console.log("✅ Scheduled emails refreshed successfully");
    } catch (error: any) {
      // Handle permission denied or other errors
      if (
        error.message.includes("not allowed to set") ||
        error.message.includes("Permission denied")
      ) {
        setLocalError(
          "Access denied: You don't have permission to set global time. Only superuser or admin can perform this action."
        );
      } else {
        setLocalError(`Failed to set global time: ${error.message}`);
      }
    } finally {
      setSetGlobalTimeLoading(false);
    }
  };

  // Email Scheduler functions using apiClient
  const fetchScheduledEmails = async () => {
    if (selectedCompanies.length === 0) {
      setLocalError("Please select a company first");
      return;
    }

    setEmailSchedulerLoading(true);
    try {
      const companyId = selectedCompanies[0];
      console.log(
        "📧 Fetching scheduled emails via apiClient for company:",
        companyId
      );

      const response = await apiClient.get(`/mails/${companyId}`);
      console.log("✅ Scheduled emails fetched:", response.data);

      const emails: ScheduledEmail[] = response.data;
      setScheduledEmails(emails);
    } catch (err: any) {
      console.error("❌ Error fetching scheduled emails via apiClient:", err);

      let errorMessage = "Failed to fetch scheduled emails";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else {
          errorMessage = `Server error: ${
            err.response.data?.detail || err.response.status
          }`;
        }
      } else if (err.request) {
        errorMessage =
          "No response from server. Please check if the backend is running.";
      }

      setLocalError(errorMessage);
    } finally {
      setEmailSchedulerLoading(false);
    }
  };

  const handleDeleteScheduledEmail = async (email: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the scheduled email for ${email}?`
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ Deleting scheduled email via apiClient:", email);

      await apiClient.delete(`/mails/deleteschedule/${email}`);
      console.log("✅ Scheduled email deleted successfully");

      // Refresh the list
      await fetchScheduledEmails();
    } catch (err: any) {
      console.error("❌ Error deleting scheduled email via apiClient:", err);

      let errorMessage = "Failed to delete scheduled email";
      if (err.response) {
        errorMessage = `Server error: ${
          err.response.data?.detail || err.response.status
        }`;
      } else if (err.request) {
        errorMessage =
          "No response from server. Please check if the backend is running.";
      }

      setLocalError(errorMessage);
    }
  };

  const handleEditScheduledEmail = (emailData: ScheduledEmail) => {
    setEditEmailDialog({ open: true, email: emailData });
  };

  const handleUpdateScheduledEmail = async (
    mailId: number,
    updatedData: any
  ) => {
    try {
      const requestBody = {
        mail_id: mailId,
        ...updatedData,
      };

      console.log("✏️ Updating scheduled email via apiClient:", {
        mailId,
        requestBody,
      });

      const response = await apiClient.put(
        `/mails/updatemail/${mailId}`,
        requestBody
      );
      console.log("✅ Scheduled email updated successfully:", response.data);

      // Refresh the list
      await fetchScheduledEmails();
      setEditEmailDialog({ open: false, email: null });
    } catch (err: any) {
      console.error("❌ Error updating scheduled email via apiClient:", err);

      let errorMessage = "Failed to update scheduled email";
      if (err.response) {
        errorMessage = `Server error: ${
          err.response.data?.detail || err.response.status
        }`;
      } else if (err.request) {
        errorMessage =
          "No response from server. Please check if the backend is running.";
      }

      setLocalError(errorMessage);
    }
  };

  // Create Mails functions using apiClient
  const fetchEmailsList = async (companyId: string) => {
    setCreateMailsLoading(true);
    try {
      console.log(
        "📋 Fetching emails list via apiClient for company:",
        companyId
      );

      const response = await apiClient.get(
        `/mails/remainingmails/${companyId}`
      );
      console.log("✅ Emails list fetched:", response.data);

      const emails: string[] = response.data;
      setEmailsList(emails);

      // Initialize email list items WITHOUT individual time fields
      const items: EmailListItem[] = emails.map((email) => ({
        email,
        selected: false,
        name: generateAutoName(email),
        nameMode: "auto",
      }));
      setEmailListItems(items);
    } catch (err: any) {
      console.error("❌ Error fetching emails list via apiClient:", err);

      let errorMessage = "Failed to fetch emails list";
      if (err.response) {
        errorMessage = `Server error: ${
          err.response.data?.detail || err.response.status
        }`;
      } else if (err.request) {
        errorMessage =
          "No response from server. Please check if the backend is running.";
      }

      setLocalError(errorMessage);
    } finally {
      setCreateMailsLoading(false);
    }
  };

  const handleOpenCreateMails = () => {
    if (selectedCompanies.length === 0) {
      setLocalError("Please select a company first");
      return;
    }
    setCreateMailsDialog(true);
    fetchEmailsList(selectedCompanies[0]);
  };

  const handleSelectAllEmails = (checked: boolean) => {
    setSelectAll(checked);
    setEmailListItems((prev) =>
      prev.map((item) => ({ ...item, selected: checked }))
    );
  };

  const handleEmailSelection = (index: number, checked: boolean) => {
    setEmailListItems((prev) => {
      const newItems = [...prev];
      newItems[index].selected = checked;
      return newItems;
    });

    // Update select all state
    const allSelected = emailListItems.every((item, idx) =>
      idx === index ? checked : item.selected
    );
    setSelectAll(allSelected);
  };

  const handleNameModeChange = (index: number, mode: "auto" | "manual") => {
    setEmailListItems((prev) => {
      const newItems = [...prev];
      newItems[index].nameMode = mode;
      if (mode === "auto") {
        newItems[index].name = generateAutoName(newItems[index].email);
      }
      return newItems;
    });
  };

  const handleNameChange = (index: number, name: string) => {
    setEmailListItems((prev) => {
      const newItems = [...prev];
      newItems[index].name = name;
      return newItems;
    });
  };

  const handleAddCustomEmail = () => {
    if (!customEmail || !customEmail.includes("@")) {
      setLocalError("Please enter a valid email address");
      return;
    }

    // Check if email already exists
    if (emailListItems.some((item) => item.email === customEmail)) {
      setLocalError("Email already exists in the list");
      return;
    }

    const newItem: EmailListItem = {
      email: customEmail,
      selected: true,
      name: generateAutoName(customEmail),
      nameMode: "auto",
    };

    setEmailListItems((prev) => [...prev, newItem]);
    setCustomEmail("");
    setLocalError(null);
  };

  const handleCreateMails = async () => {
    const selectedItems = emailListItems.filter((item) => item.selected);

    if (selectedItems.length === 0) {
      setLocalError("Please select at least one email");
      return;
    }

    if (!globalScheduledTime) {
      setLocalError("Please set a scheduled time");
      return;
    }

    if (selectedCompanies.length === 0) {
      setLocalError("No company selected");
      return;
    }

    try {
      setCreateMailsLoading(true);

      const companyId = selectedCompanies[0];

      // Prepare data for API - each mail object includes company_id
      const mailsData = selectedItems.map((item) => ({
        receiver_name: item.name,
        receiver_email: item.email,
        receiving_time: globalScheduledTime,
        company_id: parseInt(companyId), // Convert to integer as expected by backend
      }));

      console.log("=== CREATE MAILS REQUEST VIA APICLIENT ===");
      console.log("Endpoint: /mails/createmails");
      console.log("Request Body:", JSON.stringify(mailsData, null, 2));
      console.log("Company ID:", companyId);
      console.log("Global Scheduled Time Applied:", globalScheduledTime);

      const response = await apiClient.post("/mails/createmails", mailsData);

      console.log("=== CREATE MAILS RESPONSE VIA APICLIENT ===");
      console.log("Response Data:", response.data);

      // Success
      setCreateMailsDialog(false);
      setEmailListItems([]);
      setCustomEmail("");
      setSelectAll(false);
      setGlobalScheduledTime("10:45"); // Reset to new default

      // Refresh the scheduled emails list
      await fetchScheduledEmails();

      alert(
        `Successfully created ${
          selectedItems.length
        } scheduled emails at ${globalScheduledTime} for company ${getCompanyName(
          companyId
        )}!`
      );
    } catch (err: any) {
      console.error("❌ Error creating mails via apiClient:", err);

      let errorMessage = "Failed to create scheduled emails";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else {
          errorMessage = `Server error: ${
            err.response.data?.detail || err.response.status
          }`;
        }
      } else if (err.request) {
        errorMessage =
          "No response from server. Please check if the backend is running.";
      }

      setLocalError(errorMessage);
    } finally {
      setCreateMailsLoading(false);
    }
  };

  // Fetch scheduled emails when dialog opens
  useEffect(() => {
    if (open && selectedCompanies.length > 0) {
      fetchScheduledEmails();
    }
  }, [open, selectedCompanies]);

  // Fetch global time when dialog opens or company changes
  useEffect(() => {
    if (open && selectedCompanies.length > 0) {
      fetchAndSetGlobalTime(selectedCompanies[0]);
    }
  }, [open, selectedCompanies]);

  // Also fetch global time when create mails dialog opens
  useEffect(() => {
    if (createMailsDialog && selectedCompanies.length > 0) {
      fetchAndSetGlobalTime(selectedCompanies[0]);
    }
  }, [createMailsDialog, selectedCompanies]);

  // Reset states when dialog closes
  const handleClose = () => {
    setEditEmailDialog({ open: false, email: null });
    setCreateMailsDialog(false);
    setEmailListItems([]);
    setCustomEmail("");
    setSelectAll(false);
    setGlobalScheduledTime("10:45");
    setLocalError(null);
    onClose();
  };

  return (
    <>
      {/* Main Email Scheduler Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ScheduleIcon color="primary" />
              <Typography variant="h6">Email Scheduler</Typography>
              {selectedCompanies.length > 0 && (
                <Chip
                  label={getCompanyName(selectedCompanies[0])}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
            </Box>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {localError && (
            <Box sx={{ mb: 2 }}>
              <Typography color="error" variant="body2">
                {localError}
              </Typography>
            </Box>
          )}
          {emailSchedulerLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : scheduledEmails.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <ScheduleIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No Scheduled Emails
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no emails currently scheduled for this company.
              </Typography>
            </Box>
          ) : (
            <List>
              {scheduledEmails.map((email, index) => (
                <React.Fragment key={email.id}>
                  <ListItem
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {email.receiver_name}
                          </Typography>
                          <Chip
                            label={email.receiver_email}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Scheduled Time:{" "}
                          {formatTimeToHHMM(email.receiving_time)}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleEditScheduledEmail(email)}
                          title="Edit"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteScheduledEmail(email.receiver_email)
                          }
                          title="Delete"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < scheduledEmails.length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleOpenCreateMails}
              color="secondary"
              disabled={selectedCompanies.length === 0}
            >
              Create New Mails / Set Global Time
            </Button>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={handleClose} variant="outlined">
                Close
              </Button>
              <Button
                onClick={fetchScheduledEmails}
                variant="contained"
                startIcon={<RefreshIcon />}
                disabled={selectedCompanies.length === 0}
              >
                Refresh
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Create Mails Dialog */}
      <Dialog
        open={createMailsDialog}
        onClose={() => {
          setCreateMailsDialog(false);
          setEmailListItems([]);
          setCustomEmail("");
          setSelectAll(false);
          setGlobalScheduledTime("10:45");
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonAddIcon color="primary" />
              <Typography variant="h6">Create Scheduled Emails</Typography>
              {selectedCompanies.length > 0 && (
                <Chip
                  label={getCompanyName(selectedCompanies[0])}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
            <IconButton
              onClick={() => {
                setCreateMailsDialog(false);
                setEmailListItems([]);
                setCustomEmail("");
                setSelectAll(false);
                setGlobalScheduledTime("10:45");
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {createMailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {/* Enhanced Global Time Scheduler Section */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: "2px solid #1976d2",
                  borderRadius: 1,
                  backgroundColor: "#e3f2fd",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AccessTimeIcon color="primary" />
                  Global Scheduled Time Management
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    label="Scheduled Time"
                    type="time"
                    value={globalScheduledTime}
                    onChange={(e) => setGlobalScheduledTime(e.target.value)}
                    sx={{ minWidth: 150 }}
                    size="small"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    helperText="This time will be applied to all selected emails"
                    disabled={fetchingGlobalTime}
                    InputProps={{
                      endAdornment: fetchingGlobalTime ? (
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                      ) : null,
                    }}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleGetGlobalTime}
                    disabled={
                      fetchingGlobalTime || selectedCompanies.length === 0
                    }
                    startIcon={
                      fetchingGlobalTime ? (
                        <CircularProgress size={16} />
                      ) : (
                        <RefreshIcon />
                      )
                    }
                    sx={{ minWidth: 140 }}
                  >
                    {fetchingGlobalTime ? "Fetching..." : "Get Global Time"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleSetGlobalTime}
                    disabled={
                      setGlobalTimeLoading ||
                      selectedCompanies.length === 0 ||
                      !globalScheduledTime
                    }
                    startIcon={
                      setGlobalTimeLoading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <AccessTimeIcon />
                      )
                    }
                    sx={{ minWidth: 120 }}
                  >
                    {setGlobalTimeLoading ? "Setting..." : "Set Global Time"}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    Current time: <strong>{globalScheduledTime}</strong>
                    {selectedCompanies.length > 0 && (
                      <>
                        {" "}
                        for{" "}
                        <strong>{getCompanyName(selectedCompanies[0])}</strong>
                      </>
                    )}
                    {fetchingGlobalTime && (
                      <>
                        {" "}
                        <em>(loading...)</em>
                      </>
                    )}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ mt: 1, display: "block" }}
                >
                  💡 Click "Get Global Time" to fetch current time | Only
                  superusers and admins can set global time
                  {fetchingGlobalTime && (
                    <>
                      <br />
                      🕐 Fetching current global time from server...
                    </>
                  )}
                </Typography>
              </Box>

              {/* Add Custom Email Section */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Add Custom Email
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Enter email address"
                    sx={{ flex: 1 }}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddCustomEmail}
                    disabled={!customEmail}
                  >
                    Add
                  </Button>
                </Box>
              </Box>

              {/* Emails Table */}
              {emailListItems.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <PersonAddIcon
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No Emails Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add custom emails or check if the company has any emails
                    configured.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {/* Select All */}
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      backgroundColor: "#f5f5f5",
                      borderRadius: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectAll}
                          onChange={(e) =>
                            handleSelectAllEmails(e.target.checked)
                          }
                          indeterminate={
                            emailListItems.some((item) => item.selected) &&
                            !emailListItems.every((item) => item.selected)
                          }
                        />
                      }
                      label={
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600 }}
                        >
                          Select All Emails (
                          {
                            emailListItems.filter((item) => item.selected)
                              .length
                          }{" "}
                          of {emailListItems.length} selected)
                        </Typography>
                      }
                    />
                  </Box>

                  {/* Emails Table */}
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell sx={{ fontWeight: 600 }}>Select</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Email Address
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            Name Mode
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {emailListItems.map((item, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Checkbox
                                checked={item.selected}
                                onChange={(e) =>
                                  handleEmailSelection(index, e.target.checked)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {item.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <TextField
                                value={item.name}
                                onChange={(e) =>
                                  handleNameChange(index, e.target.value)
                                }
                                disabled={item.nameMode === "auto"}
                                size="small"
                                sx={{ minWidth: 150 }}
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <RadioGroup
                                  row
                                  value={item.nameMode}
                                  onChange={(e) =>
                                    handleNameModeChange(
                                      index,
                                      e.target.value as "auto" | "manual"
                                    )
                                  }
                                >
                                  <FormControlLabel
                                    value="auto"
                                    control={<Radio size="small" />}
                                    label="Auto"
                                    sx={{
                                      "& .MuiFormControlLabel-label": {
                                        fontSize: "0.875rem",
                                      },
                                    }}
                                  />
                                  <FormControlLabel
                                    value="manual"
                                    control={<Radio size="small" />}
                                    label="Manual"
                                    sx={{
                                      "& .MuiFormControlLabel-label": {
                                        fontSize: "0.875rem",
                                      },
                                    }}
                                  />
                                </RadioGroup>
                              </FormControl>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {emailListItems.filter((item) => item.selected).length} emails
              selected for scheduling at {globalScheduledTime}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => {
                  setCreateMailsDialog(false);
                  setEmailListItems([]);
                  setCustomEmail("");
                  setSelectAll(false);
                  setGlobalScheduledTime("10:45");
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMails}
                variant="contained"
                startIcon={
                  createMailsLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <SendIcon />
                  )
                }
                disabled={
                  createMailsLoading ||
                  emailListItems.filter((item) => item.selected).length === 0
                }
              >
                {createMailsLoading ? "Creating..." : "Create Scheduled Emails"}
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog
        open={editEmailDialog.open}
        onClose={() => setEditEmailDialog({ open: false, email: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditIcon color="primary" />
            <Typography variant="h6">Edit Scheduled Email</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {editEmailDialog.email && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Receiver Name"
                defaultValue={editEmailDialog.email.receiver_name}
                sx={{ mb: 2 }}
                id="edit-receiver-name"
              />
              <TextField
                fullWidth
                label="Receiver Email"
                type="email"
                defaultValue={editEmailDialog.email.receiver_email}
                sx={{ mb: 2 }}
                id="edit-receiver-email"
              />
              <TextField
                fullWidth
                label="Receiving Time"
                value={formatTimeToHHMM(editEmailDialog.email.receiving_time)}
                sx={{ mb: 2 }}
                id="edit-receiving-time"
                helperText="Time cannot be edited. Use 'Set Global Time' to change scheduled times."
                InputProps={{
                  readOnly: true,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditEmailDialog({ open: false, email: null })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (editEmailDialog.email) {
                const nameInput = document.getElementById(
                  "edit-receiver-name"
                ) as HTMLInputElement;
                const emailInput = document.getElementById(
                  "edit-receiver-email"
                ) as HTMLInputElement;

                // Only update name and email, keep the original time
                const updatedData = {
                  receiver_name: nameInput.value,
                  receiver_email: emailInput.value,
                  receiving_time: editEmailDialog.email.receiving_time, // Keep original time
                };

                handleUpdateScheduledEmail(
                  editEmailDialog.email.id,
                  updatedData
                );
              }
            }}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmailScheduler;

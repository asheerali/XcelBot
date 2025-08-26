import React, { useEffect, useState, useMemo } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  Divider,
  Box,
  Paper,
  IconButton,
  Stack,
} from "@mui/material";
import apiClient from "../api/axiosConfig";// adjust import path to your project
import { CheckCircle, XCircle, RefreshCcw } from "lucide-react";

type UserRecord = {
  id: number;
  name: string;
  email: string;
  phone_number?: string | null;
  role?: string | null;
  permissions?: string[] | null;
  assignedLocations?: { location_id: number; company_id: number; location_name: string }[] | null;
  isActive?: boolean | null;
  companyId?: number | null;
  createdAt?: string | null;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Not available";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPermission = (p: string) =>
  p
    .split("_")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const ProfileInfoPage: React.FC = () => {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await apiClient.get("/company-overview/user-details");

      if (!res || !Array.isArray(res.data)) {
        throw new Error("Invalid response format. Expected an array of users");
      
      }

      if (res.data.length === 0) {
        throw new Error("No user data found");
      }

      const u = res.data[0] as UserRecord;

      if (!u || !u.id || !u.name || !u.email) {
        throw new Error("Invalid user data. Missing required fields");
      }
    console.log("Response data for users:", res.data);
      setUser({
        id: u.id,
        name: u.name,
        email: u.email,
        phone_number: u.phone_number ?? null,
        role: u.role ?? "User",
        permissions: Array.isArray(u.permissions) ? u.permissions : [],
        assignedLocations: Array.isArray(u.assignedLocations) ? u.assignedLocations : [],
        isActive: typeof u.isActive === "boolean" ? u.isActive : null,
        companyId: typeof u.companyId === "number" ? u.companyId : null,
        createdAt: u.createdAt ?? null,
      });
    } catch (e: any) {
      const msg =
        typeof e?.message === "string" && e.message.length > 0
          ? e.message
          : "Failed to fetch user data";
      setError(msg);
      console.error("Error fetching user details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const isAdmin = useMemo(
    () => (user?.role || "").toLowerCase() === "admin" || (user?.role || "").toLowerCase() === "superuser",
    [user?.role]
  );

  if (loading) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <CircularProgress size={50} />
        <Typography variant="body1" color="textSecondary" sx={{ marginTop: 2 }}>
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card sx={{ maxWidth: 400 }}>
          <CardContent>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <Typography variant="h6" color="textPrimary" gutterBottom>
              Error loading profile
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {error}
            </Typography>
            <Button
              onClick={fetchUser}
              variant="contained"
              color="primary"
              sx={{ width: "100%" }}
              startIcon={<RefreshCcw />}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Typography variant="body1" color="textSecondary">
          No user data available
        </Typography>
        <Button
          onClick={fetchUser}
          variant="outlined"
          color="primary"
          sx={{ marginTop: 2 }}
          startIcon={<RefreshCcw />}
        >
          Fetch again
        </Button>
      </Box>
    );
  }

  const displayPermissions = user.permissions ?? [];
  const displayLocations = user.assignedLocations ?? [];

  return (
    <Box className="min-h-screen bg-gray-50 py-8 px-4">
      <Box className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <Paper sx={{ padding: 4, boxShadow: 3, borderRadius: 2, marginBottom: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item>
              <Avatar sx={{ bgcolor: "primary.main", width: 100, height: 100 }}>
                {user.name[0]}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" color="textPrimary">{user.name}</Typography>
              <Typography variant="body1" color="textSecondary">{user.role || "User"}</Typography>
              {user.isActive ? (
                <Chip label="Active" color="success" sx={{ marginTop: 1 }} />
              ) : (
                <Chip label="Inactive" color="error" sx={{ marginTop: 1 }} />
              )}
            </Grid>
          </Grid>
        </Paper>

        {/* Permissions Section */}
        <Card sx={{ borderRadius: 2, boxShadow: 3, marginBottom: 4 }}>
          <CardHeader
            title="Permissions"
            subheader={isAdmin ? "All permissions (Admin)" : "Limited access"}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          />
          <CardContent>
            {isAdmin ? (
              <Typography variant="body2" color="textSecondary">
                All permissions (Admin access)
              </Typography>
            ) : displayPermissions.length > 0 ? (
              <Grid container spacing={2}>
                {displayPermissions.map((perm, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Chip
                      label={formatPermission(perm)}
                      color="primary"
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        padding: "10px 15px",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        textTransform: "capitalize",
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No permissions assigned
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Locations Section */}
        <Card sx={{ borderRadius: 2, boxShadow: 3, marginBottom: 4 }}>
          <CardHeader
            title="Assigned Locations"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          />
          <CardContent>
            {isAdmin ? (
              <Typography variant="body2" color="textSecondary">
                All locations (Admin access)
              </Typography>
            ) : displayLocations.length > 0 ? (
              <Grid container spacing={2}>
                {displayLocations.map((loc, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Chip
                      label={loc.location_name || "Unknown location"}
                      variant="outlined"
                      fullWidth
                      sx={{
                        borderRadius: 2,
                        padding: "10px 15px",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        textTransform: "capitalize",
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No locations assigned
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Account Details Section */}
        <Card sx={{ borderRadius: 2, boxShadow: 3, marginBottom: 4 }}>
          <CardHeader title="Account Details" sx={{ borderBottom: 1, borderColor: "divider" }} />
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              <strong>User ID:</strong> {user.id}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Company ID:</strong> {user.companyId ?? "Not available"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Created at:</strong> {formatDate(user.createdAt)}
            </Typography>
          </CardContent>
        </Card>

        {/* Refresh Button
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 3 }}>
          <Button
            onClick={fetchUser}
            variant="contained"
            color="secondary"
            sx={{ width: "100%", maxWidth: 200 }}
            startIcon={<RefreshCcw />}
          >
            Refresh Profile
          </Button>
        </Box> */}
      </Box>
    </Box>
  );
};

export default ProfileInfoPage;

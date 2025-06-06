import React, { useState } from "react";

const PermissionsTable = () => {
  const [selectedStore, setSelectedStore] = useState(
    "sophies-cuban-bryant-park"
  );
  const [selectedUser, setSelectedUser] = useState("");
  const [userRoles, setUserRoles] = useState({
    1: "Manager",
    2: "Server",
    3: "Cashier",
    4: "Kitchen Staff",
  });
  const [permissions, setPermissions] = useState({
    "Excel Upload": { allow: true },
    "Sales Split": { allow: true },
    "Product Mix": { allow: true },
    Financials: { allow: false },
    "Companywide Sales": { allow: false },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(false);

  const stores = [
    {
      value: "sophies-cuban-bryant-park",
      label: "Sophie's Cuban - Bryant Park",
    },
    { value: "sophies-cuban-midtown", label: "Sophie's Cuban - Midtown" },
    { value: "sophies-cuban-brooklyn", label: "Sophie's Cuban - Brooklyn" },
  ];

  const users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Mike Johnson" },
    { id: 4, name: "Sarah Williams" },
  ];

  const permissionsList = [
    { key: "Excel Upload", label: "Excel Upload" },
    { key: "Sales Split", label: "Sales Split" },
    { key: "Product Mix", label: "Product Mix" },
    { key: "Financials", label: "Financials" },
    { key: "Companywide Sales", label: "Companywide Sales" },
  ];

  const handleAllowToggle = (permissionKey) => {
    if (!isEditing) return;

    setPermissions((prev) => ({
      ...prev,
      [permissionKey]: {
        ...prev[permissionKey],
        allow: !prev[permissionKey].allow,
      },
    }));
  };

  const handleRoleChange = (userId, newRole) => {
    if (!isEditing) return;

    setUserRoles((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleSave = () => {
    setSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const getSelectedUserData = () => {
    const user = users.find((user) => user.id == selectedUser);
    if (!user) return null;
    return {
      ...user,
      role: userRoles[user.id] || "User",
    };
  };

  const getRoleColor = (role) => {
    return role === "Manager" ? "#dc3545" : "#6c757d";
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#333",
            }}
          >
            User Permissions Management
          </h1>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Manage user access permissions for Excel uploads and data access
          </p>

          {/* Controls */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "5px",
                }}
              >
                Store Location
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                {stores.map((store) => (
                  <option key={store.value} value={store.value}>
                    {store.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "5px",
                }}
              >
                Select User
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({userRoles[user.id] || "User"})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {selectedUser && (
                <>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div
            style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "20px",
              border: "1px solid #c3e6cb",
            }}
          >
            Permissions updated successfully!
          </div>
        )}

        {/* User Info and Permissions Table */}
        {selectedUser && (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #dee2e6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  margin: 0,
                  color: "#333",
                }}
              >
                {stores.find((s) => s.value === selectedStore)?.label}
              </h2>

              {/* User Role Management */}
              {getSelectedUserData() && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    {getSelectedUserData().name}
                  </span>

                  {/* Role Toggle Buttons */}
                  <div style={{ display: "flex", gap: "4px" }}>
                    <button
                      onClick={() => handleRoleChange(selectedUser, "Manager")}
                      disabled={!isEditing}
                      style={{
                        padding: "4px 12px",
                        fontSize: "12px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isEditing ? "pointer" : "not-allowed",
                        backgroundColor:
                          getSelectedUserData().role === "Manager"
                            ? "#dc3545"
                            : "#e9ecef",
                        color:
                          getSelectedUserData().role === "Manager"
                            ? "white"
                            : "#6c757d",
                        fontWeight:
                          getSelectedUserData().role === "Manager"
                            ? "600"
                            : "normal",
                        opacity: !isEditing ? 0.7 : 1,
                      }}
                    >
                      Manager
                    </button>
                    <button
                      onClick={() => handleRoleChange(selectedUser, "User")}
                      disabled={!isEditing}
                      style={{
                        padding: "4px 12px",
                        fontSize: "12px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isEditing ? "pointer" : "not-allowed",
                        backgroundColor:
                          getSelectedUserData().role === "User"
                            ? "#6c757d"
                            : "#e9ecef",
                        color:
                          getSelectedUserData().role === "User"
                            ? "white"
                            : "#6c757d",
                        fontWeight:
                          getSelectedUserData().role === "User"
                            ? "600"
                            : "normal",
                        opacity: !isEditing ? 0.7 : 1,
                      }}
                    >
                      User
                    </button>
                  </div>
                </div>
              )}
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6c757d",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Permission
                  </th>
                  <th
                    style={{
                      padding: "12px 20px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#6c757d",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Allow
                  </th>
                </tr>
              </thead>
              <tbody>
                {permissionsList.map((permission, index) => (
                  <tr
                    key={permission.key}
                    style={{
                      backgroundColor: index % 2 === 0 ? "white" : "#f8f9fa",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 20px",
                        fontSize: "14px",
                        color: "#333",
                      }}
                    >
                      {permission.label}
                    </td>
                    <td style={{ padding: "12px 20px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={permissions[permission.key]?.allow || false}
                        onChange={() => handleAllowToggle(permission.key)}
                        disabled={!isEditing}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: isEditing ? "pointer" : "not-allowed",
                          opacity: !isEditing ? 0.5 : 1,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!selectedUser && (
          <div
            style={{
              backgroundColor: "white",
              padding: "60px 20px",
              textAlign: "center",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ color: "#6c757d" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                }}
              >
                👤
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#333",
                }}
              >
                Select a User
              </h3>
              <p style={{ color: "#6c757d" }}>
                Choose a user from the dropdown above to view and edit their
                permissions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionsTable;

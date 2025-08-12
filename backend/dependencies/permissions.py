from typing import List, Optional


ROLE_HIERARCHY = {
    "superuser": 1,
    "admin": 2,
    "manager": 3,
    "user": 4,
    "trial": 5  # optional, if trial is in your system
}

def can_update(current_user_role: str, target_role: str) -> bool:
    # Superuser can update anyone
    if current_user_role == "superuser":
        return True
    # Admin can update user + manager
    if current_user_role == "admin" and target_role in ["manager", "user"]:
        return True
    # Auditor can update user
    if current_user_role == "manager" and target_role == "user":
        return True
    return False



def can_set_global_time(user_role: str) -> bool:
    """Check if user can set global time (only superuser and admin)"""
    return user_role in ["superuser", "admin"]

def can_access_company_data(user_role: str, user_company_id: Optional[int], target_company_id: int) -> bool:
    """Check if user can access data for a specific company"""
    # Superuser can access any company
    if user_role == "superuser":
        return True
    # Admin can access any company (adjust this based on your requirements)
    if user_role == "admin":
        return True
    # Other users can only access their own company data
    return user_company_id == target_company_id

def get_role_level(role: str) -> int:
    """Get the hierarchy level of a role (lower number = higher privilege)"""
    return ROLE_HIERARCHY.get(role, 999)  # Return high number for unknown roles

def is_higher_role(current_role: str, target_role: str) -> bool:
    """Check if current role has higher privileges than target role"""
    return get_role_level(current_role) < get_role_level(target_role)

def get_allowed_roles_for_creation(current_user_role: str) -> List[str]:
    """Get list of roles that the current user can create"""
    if current_user_role == "superuser":
        return ["admin", "manager", "user", "trial"]
    elif current_user_role == "admin":
        return ["manager", "user", "trial"]
    elif current_user_role == "manager":
        return ["user", "trial"]
    else:
        return []  # Regular users cannot create other users

def validate_permission_or_raise(current_user_role: str, target_role: str, action: str = "perform this action"):
    """Validate permission and raise HTTPException if not allowed"""
    from fastapi import HTTPException, status
    
    if not can_update(current_user_role, target_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied. Your role '{current_user_role}' cannot {action} on '{target_role}' role."
        )
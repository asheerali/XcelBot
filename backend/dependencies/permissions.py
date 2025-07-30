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

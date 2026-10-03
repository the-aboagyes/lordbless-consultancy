/* =========================================================
   LORDBLESS CONSULTANCY
   ACCESS CONTROL ENGINE
   ========================================================= */


/* ---------------------------------------------------------
   PERMISSION CHECK
   --------------------------------------------------------- */

function hasPermission(user, permission) {

    if (!user) {
        return false;
    }

    const permissions = getUserPermissions(user);

    /* Super Admin */
    if (permissions.includes("*")) {
        return true;
    }

    return permissions.includes(permission);
}


/* ---------------------------------------------------------
   DESK ACCESS
   --------------------------------------------------------- */

function canAccessDesk(user, deskId) {

    if (!user || !deskId) {
        return false;
    }

    /* Super Admin */
    if (user.role === "super_admin") {
        return true;
    }

    /* Finance Manager */
    if (user.role === "finance_manager") {
        return false;
    }

    return user.desk === deskId;
}


/* ---------------------------------------------------------
   ENQUIRY DESK ACCESS
   --------------------------------------------------------- */

function canAccessEnquiry(user, enquiry) {

    if (!user || !enquiry) {
        return false;
    }

    /* Super Admin */
    if (user.role === "super_admin") {
        return true;
    }

    /* Finance Manager does not operate desk enquiries */
    if (user.role === "finance_manager") {
        return false;
    }

    return enquiry.desk === user.desk;
}


/* ---------------------------------------------------------
   FILTER ENQUIRIES BY DESK
   --------------------------------------------------------- */

function getAccessibleEnquiries(user, enquiries) {

    if (!user || !Array.isArray(enquiries)) {
        return [];
    }

    /* Super Admin sees everything */
    if (user.role === "super_admin") {
        return enquiries;
    }

    /* Finance Manager does not receive desk enquiry access */
    if (user.role === "finance_manager") {
        return [];
    }

    return enquiries.filter(
        enquiry => enquiry.desk === user.desk
    );
}


/* ---------------------------------------------------------
   FINANCE ACCESS
   --------------------------------------------------------- */

function canAccessFinance(user) {

    if (!user) {
        return false;
    }

    return (
        user.role === "super_admin" ||
        user.role === "finance_manager"
    );
}


/* ---------------------------------------------------------
   USER MANAGEMENT
   --------------------------------------------------------- */

function canManageUsers(user) {

    return hasPermission(
        user,
        "users.manage"
    );
}


/* ---------------------------------------------------------
   ACCESSIBLE DESKS
   --------------------------------------------------------- */

function getAccessibleDesks(user) {

    if (!user) {
        return [];
    }

    /* Super Admin */
    if (user.role === "super_admin") {
        return LORDBLESS_ACCESS_DATA.desks;
    }

    /* Finance Manager */
    if (user.role === "finance_manager") {
        return [];
    }

    const desk = getDesk(user.desk);

    return desk ? [desk] : [];
}


/* ---------------------------------------------------------
   ROLE LABEL
   --------------------------------------------------------- */

function getRoleLabel(roleId) {

    const role = getRole(roleId);

    return role
        ? role.name
        : "Unknown Role";
}


/* ---------------------------------------------------------
   DESK LABEL
   --------------------------------------------------------- */

function getDeskLabel(deskId) {

    if (deskId === "all") {
        return "All Desks";
    }

    const desk = getDesk(deskId);

    return desk
        ? desk.name
        : "Unassigned";
}


/* ---------------------------------------------------------
   ACCESS SUMMARY
   --------------------------------------------------------- */

function getAccessSummary(user) {

    if (!user) {
        return {
            role: "Unknown",
            desk: "Unassigned",
            finance: false
        };
    }

    return {
        role: getRoleLabel(user.role),
        desk: getDeskLabel(user.desk),
        finance: canAccessFinance(user)
    };
}
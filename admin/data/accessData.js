/* =========================================================
   LORDBLESS CONSULTANCY
   ADMIN ACCESS DATA
   Roles • Desks • Permissions
   ========================================================= */

const LORDBLESS_ACCESS_DATA = {

    /* -----------------------------------------------------
       DESKS
       ----------------------------------------------------- */

    desks: [
        {
            id: "canada_us",
            name: "Canada & U.S. Desk",
            shortName: "Canada & U.S.",
            countries: [
                "Canada",
                "United States"
            ],
            active: true
        },

        {
            id: "germany_europe",
            name: "Germany & Europe Desk",
            shortName: "Germany & Europe",
            countries: [
                "Germany",
                "France",
                "Netherlands",
                "Belgium",
                "Austria",
                "Ireland",
                "Spain",
                "Italy",
                "Portugal",
                "Switzerland",
                "Sweden",
                "Denmark",
                "Finland",
                "Norway"
            ],
            active: true
        },

        {
            id: "china",
            name: "China Desk",
            shortName: "China",
            countries: [
                "China"
            ],
            active: true
        }
    ],


    /* -----------------------------------------------------
       ROLES
       ----------------------------------------------------- */

    roles: [

        {
            id: "super_admin",
            name: "Super Admin",
            description: "Full system access and administrative control.",
            level: 100
        },

        {
            id: "finance_manager",
            name: "Finance Manager",
            description: "Manages LORDBLESS financial operations.",
            level: 80
        },

        {
            id: "desk_manager",
            name: "Desk Manager",
            description: "Manages enquiries and clients within an assigned desk.",
            level: 60
        },

        {
            id: "desk_officer",
            name: "Desk Officer",
            description: "Handles assigned desk enquiries and client activities.",
            level: 40
        }
    ],


    /* -----------------------------------------------------
       PERMISSIONS
       ----------------------------------------------------- */

    permissions: [

        "dashboard.view",

        "enquiries.view",
        "enquiries.update",
        "enquiries.assign",

        "clients.view",
        "clients.update",

        "followups.view",
        "followups.manage",

        "documents.view",
        "documents.manage",

        "assessments.view",
        "assessments.manage",

        "stories.view",
        "stories.manage",

        "finance.view",
        "finance.manage",

        "users.view",
        "users.manage",

        "settings.view",
        "settings.manage"
    ],


    /* -----------------------------------------------------
       ROLE PERMISSIONS
       ----------------------------------------------------- */

    rolePermissions: {

        /* FULL SYSTEM ACCESS */
        super_admin: [
            "*"
        ],


        /* FINANCE MANAGER */
        finance_manager: [
            "dashboard.view",

            "finance.view",
            "finance.manage",

            "clients.view",

            "enquiries.view"
        ],


        /* DESK MANAGER */
        desk_manager: [

            "dashboard.view",

            "enquiries.view",
            "enquiries.update",
            "enquiries.assign",

            "clients.view",
            "clients.update",

            "followups.view",
            "followups.manage",

            "documents.view",
            "documents.manage",

            "assessments.view",
            "assessments.manage",

            "stories.view",
            "stories.manage"
        ],


        /* DESK OFFICER */
        desk_officer: [

            "dashboard.view",

            "enquiries.view",
            "enquiries.update",

            "clients.view",

            "followups.view",
            "followups.manage",

            "documents.view",
            "documents.manage",

            "assessments.view"
        ]
    },

    /* -----------------------------------------------------
       MOCK USERS
       ----------------------------------------------------- */
        users: [
        {
            id: "USR-001",
            name: "Super Admin",
            role: "super_admin",
            desk: "all",
            login: "admin",
            active: true
        },

        {
            id: "USR-006",
            name: "TEAM MEMBER 01",
            role: "desk_officer",
            desk: "germany_europe",
            login: "team01",
            active: true
        }
    ]
};


/* ---------------------------------------------------------
   HELPER FUNCTIONS
   --------------------------------------------------------- */

function getRole(roleId) {

    return LORDBLESS_ACCESS_DATA.roles.find(
        role => role.id === roleId
    );

}


function getDesk(deskId) {

    return LORDBLESS_ACCESS_DATA.desks.find(
        desk => desk.id === deskId
    );

}


function getUser(userId) {

    return LORDBLESS_ACCESS_DATA.users.find(
        user => user.id === userId
    );

}


function getUserPermissions(user) {

    if (!user) {
        return [];
    }

    return LORDBLESS_ACCESS_DATA.rolePermissions[user.role] || [];

}
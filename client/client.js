/**
 * ============================================================
 * LORDBLESS CONSULTANCY
 * CLIENT PORTAL CONTROLLER
 * ============================================================
 *
 * BATCH 2
 * Premium Client Dashboard
 *
 * IMPORTANT:
 * - Supabase Auth and the linked public.clients profile establish identity.
 * - Journeys, finance, messages, and document content remain prototype data.
 * - Do not use prototype records to determine authenticated ownership.
 * ============================================================
 */


/* ============================================================
   CLIENT ACCOUNT
   ============================================================ */

   const LORDBLESS_DEVELOPMENT_CLIENT_ID =
    "LBC-CLIENT-0001";

const LORDBLESS_SHARED_CLIENT =
    window.LORDBLESS_PORTAL_MOCK_DATA.getClient(
        LORDBLESS_DEVELOPMENT_CLIENT_ID
    );

const LORDBLESS_CLIENT_DEVELOPMENT_FIXTURE = {

    id:
        LORDBLESS_SHARED_CLIENT.id,

    fullName:
        LORDBLESS_SHARED_CLIENT.fullName,

    email:
        LORDBLESS_SHARED_CLIENT.email,

    whatsapp:
        "+233201234567",

    currentCountry:
        "Ghana",

    nationality:
        "Ghanaian",

    dateOfBirth:
        "1992-06-14",

    passportNumber:
        "G12345678",

    passportIssueDate:
        "2021-12-16",

    passportExpiryDate:
        "2026-12-15",

    currentTransactionId:
        "LBC-2026-00021",


    /* ========================================================
       PERMANENT DOCUMENT LIBRARY
       ======================================================== */

    documents: [

        {
            id:
                "DOC-0001",

            type:
                "passport",

            name:
                "International Passport",

            filename:
                "passport.pdf",

            status:
                "approved",

            issueDate:
                "2021-12-16",

            expiryDate:
                "2026-12-15",

            isCurrent:
                true
        },


        {
            id:
                "DOC-0002",

            type:
                "cv",

            name:
                "Curriculum Vitae",

            filename:
                "kwame-mensah-cv.pdf",

            status:
                "approved",

            issueDate:
                null,

            expiryDate:
                null,

            isCurrent:
                true
        },


        {
            id:
                "DOC-0003",

            type:
                "professional_certificate",

            name:
                "Professional Certificate",

            filename:
                "professional-certificate.pdf",

            status:
                "reviewing",

            issueDate:
                null,

            expiryDate:
                null,

            isCurrent:
                true
        }

    ],


    /* ========================================================
       CLIENT JOURNEYS
       ======================================================== */

    transactions: [

        {

            id:
                "LBC-2026-00021",

            services:
                ["careers"],

            service:
                "LORDBLESS GLOBAL CAREERS",

            title:
                "Germany Career Journey",

            desk:
                "germany_europe",

            destination:
                "Germany",

            status:
                "in_progress",

            statusLabel:
                "In Progress",

            progress:
                65,

            currentStep:
                "prepare",

            created:
                "2026-09-15",

            updated:
                "2026-09-16",

            description:
                "Career pathway and relocation support for Germany.",

            nextStep:
                "Complete your client details and upload the requested documents."

        },


        {

            id:
                "LBC-2026-00008",

            services:
                ["travel"],

            service:
                "LORDBLESS TRAVEL",

            title:
                "China Business Trip",

            desk:
                "china",

            destination:
                "China",

            status:
                "completed",

            statusLabel:
                "Completed",

            progress:
                100,

            currentStep:
                "continue",

            created:
                "2026-07-10",

            updated:
                "2026-08-02",

            description:
                "Business travel planning and support for China.",

            nextStep:
                "Journey completed. Your transaction remains available in your history."

        }

    ]

};

const LORDBLESS_CLIENT_ACCOUNT = {
    id: null,
    fullName: "",
    email: "",
    whatsapp: "",
    currentCountry: "",
    nationality: "",
    dateOfBirth: "",
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    currentTransactionId: null,
    documents: [],
    transactions: []
};

/* ============================================================
   SHARED PORTAL MOCK DATA
   ============================================================

   Development-only helper for the shared mock client and
   journey reference data. Authenticated startup does not call it.

   This is temporary development infrastructure.

   Remaining journey data will be migrated separately.
   ============================================================ */

function applySharedPortalMockClient() {

    if (
        !window.LORDBLESS_PORTAL_MOCK_DATA ||
        typeof
            window.LORDBLESS_PORTAL_MOCK_DATA.getClient !==
            "function" ||
        typeof
            window.LORDBLESS_PORTAL_MOCK_DATA.getClientJourneys !==
            "function"
    ) {

        console.warn(
            "LORDBLESS: Shared portal mock data is not available."
        );

        return;
    }


    const sharedClient =
        window.LORDBLESS_PORTAL_MOCK_DATA.getClient(
            LORDBLESS_DEVELOPMENT_CLIENT_ID
        );


    const sharedJourneys =
        window.LORDBLESS_PORTAL_MOCK_DATA.getClientJourneys(
            LORDBLESS_DEVELOPMENT_CLIENT_ID
        );


    if (!sharedClient) {

        console.warn(
            "LORDBLESS: Active mock client was not found."
        );

        return;
    }


    /* ========================================================
       CLIENT IDENTITY
       ======================================================== */

    LORDBLESS_CLIENT_ACCOUNT.id =
        sharedClient.id;

    LORDBLESS_CLIENT_ACCOUNT.fullName =
        sharedClient.fullName ||
        sharedClient.name ||
        "";

    LORDBLESS_CLIENT_ACCOUNT.email =
        sharedClient.email ||
        "";


    /* ========================================================
       CURRENT JOURNEYS
       ======================================================== */

    LORDBLESS_CLIENT_ACCOUNT.transactions =
        sharedJourneys.map(
            (
                journey,
                index
            ) => {

                const serviceKey =
                    String(
                        journey.service || ""
                    ).toLowerCase();


                let serviceType =
                    "other";


                if (
                    serviceKey.includes(
                        "career"
                    )
                ) {

                    serviceType =
                        "careers";

                }
                else if (
                    serviceKey.includes(
                        "travel"
                    )
                ) {

                    serviceType =
                        "travel";

                }
                else if (
                    serviceKey.includes(
                        "business"
                    )
                ) {

                    serviceType =
                        "business";

                }


                return {

                    ...journey,

                    services: [
                        serviceType
                    ],

                    status:
                        index === 0
                            ? "in_progress"
                            : "completed",

                    statusLabel:
                        index === 0
                            ? "In Progress"
                            : "Completed",

                    progress:
                        index === 0
                            ? 65
                            : 100,

                    currentStep:
                        index === 0
                            ? "prepare"
                            : "continue",

                    created:
                        null,

                    updated:
                        null,

                    description:
                        journey.service
                            ? `${journey.service} support for ${journey.destination || "your selected destination"}.`
                            : "LORDBLESS journey support.",

                    nextStep:
                        index === 0
                            ? "Complete your client details and upload the requested documents."
                            : "Journey completed. Your transaction remains available in your history."

                };

            }
        );


    /* ========================================================
       CURRENT JOURNEY
       ======================================================== */

    LORDBLESS_CLIENT_ACCOUNT.currentTransactionId =
        sharedJourneys.length
            ? sharedJourneys[0].id
            : null;


    /* ========================================================
       TEMPORARY DOCUMENT RESET
       ========================================================

       The previous documents belonged to Kwame Mensah.

       Do not carry them into Akosua's account.
       Document data will be connected separately.
       ======================================================== */

    LORDBLESS_CLIENT_ACCOUNT.documents =
        [];

}


/* ============================================================
   APPLY SHARED MOCK CLIENT
   ============================================================ */

/* ============================================================
   JOURNEY STEPS
   ============================================================ */

/* ============================================================
   JOURNEY STEPS
   ============================================================ */

const LORDBLESS_JOURNEY_STEPS = [

    "discover",
    "assess",
    "plan",
    "prepare",
    "connect",
    "travel",
    "arrive",
    "continue"

];


/* ============================================================
   VIEW DEFINITIONS
   ============================================================ */

const CLIENT_VIEW_CONFIG = {

    overview: {
        title:
            "Overview"
    },

    journeys: {
        title:
            "My Journeys"
    },

    documents: {
        title:
            "My Documents"
    },

    messages: {
        title:
            "Messages"
    },

    payments: {
    title:
        "Finance"
},

    profile: {
        title:
            "My Profile"
    },

    support: {
        title:
            "Help & Support"
    }

};


/* ============================================================
   INITIALISE CLIENT PORTAL
   ============================================================ */

function initialiseClientPortal() {

    populateClientIdentity();

    renderDashboard();

    renderTransactionHistory();

    renderDocuments();

    initialiseNavigation();

    initialiseActions();

    initialiseModal();

    initialiseMobileSidebar();

    initialiseClientMessages();

    showView(
        "overview"
    );

}


let clientPortalInitialised = false;
let clientAuthLookupUserId = null;


function applyAuthenticatedClientRecord(client) {

    Object.assign(
        LORDBLESS_CLIENT_ACCOUNT,
        {
            id: client.id,
            fullName: client.full_name || "",
            email: client.email || "",
            whatsapp: client.whatsapp || "",
            currentCountry: client.current_country || "",
            nationality: client.nationality || "",
            dateOfBirth: "",
            passportNumber: "",
            passportIssueDate: "",
            passportExpiryDate: "",
            currentTransactionId: null,
            transactions: [],
            documents: []
        }
    );

}


async function handleClientPortalSession(session) {

    if (!session?.user) {
        window.location.replace("../portal-login.html");
        return;
    }

    if (clientAuthLookupUserId === session.user.id) {
        return;
    }

    clientAuthLookupUserId = session.user.id;

    try {
        let { data: account, error: accountError } =
            await lordblessSupabase
                .from("client_accounts")
                .select("client_id, access_status")
                .eq("auth_user_id", session.user.id)
                .maybeSingle();

        if (accountError) throw accountError;

        if (account?.access_status === "invited") {
            const { error: activationError } =
                await lordblessSupabase.rpc("activate_client_account");
            if (activationError) throw activationError;

            const refreshedAccount =
                await lordblessSupabase
                    .from("client_accounts")
                    .select("client_id, access_status")
                    .eq("auth_user_id", session.user.id)
                    .maybeSingle();

            if (refreshedAccount.error) throw refreshedAccount.error;
            account = refreshedAccount.data;
        }

        if (!account || account.access_status !== "active") {
            clientAuthLookupUserId = null;
            window.location.replace(
                "../portal-login.html?error=client-access-inactive"
            );
            return;
        }

        const { data: client, error: clientError } =
            await lordblessSupabase
                .from("clients")
                .select("id, full_name, email, whatsapp, current_country, nationality")
                .eq("id", account.client_id)
                .maybeSingle();

        if (clientError) throw clientError;
        if (!client || client.id !== account.client_id) {
            throw new Error("The linked client profile is unavailable.");
        }

        applyAuthenticatedClientRecord(client);

        const clientApp =
            document.getElementById("client-portal-app");

        if (clientApp) {
            clientApp.style.display = "";
        }

        if (!clientPortalInitialised) {
            clientPortalInitialised = true;
            initialiseClientPortal();
        }
    } catch (error) {
        clientAuthLookupUserId = null;
        console.error(
            "LORDBLESS CLIENT ACCOUNT RESOLUTION ERROR:",
            error
        );
        window.location.replace("../portal-login.html?error=client-account-unavailable");
    }

}


async function initialiseClientAuth() {

    lordblessSupabase.auth.onAuthStateChange(
        (event, session) => {

            if (event === "INITIAL_SESSION") {
                return;
            }

            void handleClientPortalSession(session);

        }
    );

    try {
        const { data, error } =
            await lordblessSupabase.auth.getSession();

        if (error) throw error;

        await handleClientPortalSession(
            data?.session || null
        );
    } catch (error) {
        console.error(
            "LORDBLESS CLIENT AUTH SESSION ERROR:",
            error
        );
        window.location.assign(
            "../portal-login.html"
        );
    }

}


async function signOutClient() {

    try {
        const { error } =
            await lordblessSupabase.auth.signOut();

        if (error) throw error;

        window.location.assign(
            "../portal-login.html"
        );
    } catch (error) {
        showModal(
            "Unable to Sign Out",
            error?.message || String(error)
        );
    }

}


/* ============================================================
   CLIENT IDENTITY
   ============================================================ */

function populateClientIdentity() {

    const formattedName =
        formatClientName(
            LORDBLESS_CLIENT_ACCOUNT.fullName
        );


    setText(
        "client-name",
        formattedName
    );

    setText(
        "client-id",
        LORDBLESS_CLIENT_ACCOUNT.id
    );

    setText(
        "client-email",
        LORDBLESS_CLIENT_ACCOUNT.email
    );


    setText(
        "sidebar-client-name",
        formattedName
    );

    setText(
        "sidebar-client-id",
        LORDBLESS_CLIENT_ACCOUNT.id
    );


    setText(
        "topbar-client-name",
        formattedName
    );

    setText(
        "topbar-client-email",
        LORDBLESS_CLIENT_ACCOUNT.email
    );


    setText(
        "summary-client-id",
        LORDBLESS_CLIENT_ACCOUNT.id
    );

    setText(
    "support-client-id",
    LORDBLESS_CLIENT_ACCOUNT.id
);

    setText(
        "profile-name",
        formattedName
    );

    setText(
        "profile-client-id",
        LORDBLESS_CLIENT_ACCOUNT.id
    );

    setText(
        "profile-email",
        LORDBLESS_CLIENT_ACCOUNT.email
    );

    setText(
        "profile-whatsapp",
        LORDBLESS_CLIENT_ACCOUNT.whatsapp
    );

    setText(
        "profile-nationality",
        LORDBLESS_CLIENT_ACCOUNT.nationality
    );

    setText(
        "profile-country",
        LORDBLESS_CLIENT_ACCOUNT.currentCountry
    );

    setText(
        "profile-passport",
        LORDBLESS_CLIENT_ACCOUNT.passportNumber
    );

    setText(
        "profile-passport-issue",
        formatDate(
            LORDBLESS_CLIENT_ACCOUNT.passportIssueDate
        )
    );

    setText(
        "profile-passport-expiry",
        formatDate(
            LORDBLESS_CLIENT_ACCOUNT.passportExpiryDate
        )
    );


    updatePassportProfileStatus();

}


/* ============================================================
   PASSPORT STATUS
   ============================================================ */

function updatePassportProfileStatus() {

    const statusElement =
        document.querySelector(
            ".profile-status-warning"
        );


    if (!statusElement) {
        return;
    }


    const expiryStatus =
        getExpiryStatus(
            LORDBLESS_CLIENT_ACCOUNT.passportExpiryDate
        );


    if (
        expiryStatus === "expired"
    ) {

        statusElement.textContent =
            "Expired";

        return;
    }


    if (
        expiryStatus === "urgent"
    ) {

        statusElement.textContent =
            "Renewal required soon";

        return;
    }


    if (
        expiryStatus === "attention"
    ) {

        statusElement.textContent =
            "Renewal approaching";

        return;
    }


    statusElement.textContent =
        "Valid";

}


/* ============================================================
   NAVIGATION
   ============================================================ */

function initialiseNavigation() {

    document
        .querySelectorAll(
            "[data-view]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showView(
                            button.dataset.view
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-view-link]"
        )
        .forEach(
            element => {

                const activate =
                    () => {

                        showView(
                            element.dataset.viewLink
                        );

                    };


                element.addEventListener(
                    "click",
                    activate
                );


                element.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();

                            activate();

                        }

                    }
                );

            }
        );

}


/* ============================================================
   SHOW VIEW
   ============================================================ */

function showView(
    viewName
) {

    if (
        !CLIENT_VIEW_CONFIG[
            viewName
        ]
    ) {

        viewName =
            "overview";

    }


    document
        .querySelectorAll(
            ".portal-view"
        )
        .forEach(
            view => {

                view.classList.toggle(
                    "active",
                    view.dataset.viewPanel ===
                        viewName
                );

            }
        );


    document
        .querySelectorAll(
            ".client-nav-item"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.view ===
                        viewName
                );

            }
        );


    setText(
        "view-title",
        CLIENT_VIEW_CONFIG[
            viewName
        ].title
    );


    closeMobileSidebar();


    if (
        viewName === "documents"
    ) {

        renderDocuments();

    }


     if (
        viewName === "journeys"
    ) {

        renderTransactionHistory();

    }


    if (
        viewName === "payments"
    ) {

        renderClientFinance();

    }

    if (
        viewName === "messages"
    ) {

        renderClientMessages();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* ============================================================
   CLIENT ALERTS
   ============================================================ */

function getClientMessages() {

    const bridge = window.LORDBLESS_PAYMENT_BRIDGE;
    const clientId = LORDBLESS_CLIENT_ACCOUNT.id;

    if (
        !clientId ||
        !bridge ||
        typeof bridge.getMessages !== "function"
    ) {
        return [];
    }

    return bridge.getMessages(clientId);

}


function updateClientMessageBadge() {

    const badge = document.getElementById("messages-badge");

    if (!badge) {
        return;
    }

    const bridge = window.LORDBLESS_PAYMENT_BRIDGE;
    const clientId = LORDBLESS_CLIENT_ACCOUNT.id;
    const unread = bridge && typeof bridge.getUnreadMessages === "function"
        ? bridge.getUnreadMessages(clientId)
        : [];

    badge.textContent = String(unread.length);
    badge.hidden = unread.length === 0;

}


function renderClientMessages() {

    const container = document.getElementById("messages-container");

    if (!container) {
        return;
    }

    updateClientMessageBadge();

    const messages = getClientMessages();

    if (!messages.length) {
        container.innerHTML = `
            <div class="empty-state-card">
                <div class="empty-state-icon">□</div>
                <h3>No new messages</h3>
                <p>There are currently no important notifications for your account.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="client-message-list">
            ${messages.map(message => `
                <article
                    class="client-message-card${message.read ? "" : " is-unread"}"
                    data-message-id="${escapeHTML(message.id)}"
                    tabindex="0"
                >
                    <div class="client-message-card-content">
                        <div class="client-message-card-heading">
                            <h3>${escapeHTML(message.title || "Notification")}</h3>
                            ${message.read ? "" : '<span class="client-message-unread-label">NEW</span>'}
                        </div>
                        <p>${escapeHTML(message.message || "")}</p>
                        <time datetime="${escapeHTML(message.createdAt || "")}">${escapeHTML(formatClientMessageDate(message.createdAt))}</time>
                    </div>
                    ${message.type === "payment_verified" && message.actionView === "payments" ? `
                        <button type="button" class="secondary-button" data-message-action="receipt" data-receipt-id="${escapeHTML(message.actionId || "")}">
                            VIEW RECEIPT
                        </button>
                    ` : message.actionView === "payments" ? `
                        <button type="button" class="secondary-button" data-message-action="payments">
                            VIEW PAYMENT
                        </button>
                    ` : message.actionView === "documents" ? `
                        <button type="button" class="secondary-button" data-message-action="documents">
                            VIEW DOCUMENTS
                        </button>
                    ` : ""}
                </article>
            `).join("")}
        </div>
    `;

}


function formatClientMessageDate(value) {

    if (!value) {
        return "";
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

}


function initialiseClientMessages() {

    const container = document.getElementById("messages-container");

    updateClientMessageBadge();

    if (container && container.dataset.alertsBound !== "true") {
        container.dataset.alertsBound = "true";

        container.addEventListener("click", event => {
            const card = event.target.closest("[data-message-id]");

            if (!card || !container.contains(card)) {
                return;
            }

            const bridge = window.LORDBLESS_PAYMENT_BRIDGE;

            if (bridge && typeof bridge.markMessageAsRead === "function") {
                bridge.markMessageAsRead(
                    card.dataset.messageId,
                    LORDBLESS_CLIENT_ACCOUNT.id
                );
            }

            updateClientMessageBadge();

            if (event.target.closest("[data-message-action='payments']")) {
                showView("payments");
            } else if (event.target.closest("[data-message-action='documents']")) {
                showView("documents");
            } else if (event.target.closest("[data-message-action='receipt']")) {
                const receiptAction = event.target.closest("[data-message-action='receipt']");
                const receiptId = receiptAction.dataset.receiptId;

                showView("payments");

                const receiptButton = Array.from(
                    document.querySelectorAll('[data-finance-action="view-receipt"]')
                ).find(button =>
                    button.getAttribute("data-receipt-id") === receiptId
                );

                if (receiptButton) {
                    receiptButton.click();
                }
            } else {
                renderClientMessages();
            }
        });

        container.addEventListener("keydown", event => {
            if (
                (event.key === "Enter" || event.key === " ") &&
                event.target.matches("[data-message-id]")
            ) {
                event.preventDefault();
                event.target.click();
            }
        });
    }

    window.addEventListener("lordbless:portal-data", () => {
        updateClientMessageBadge();

        if (document.getElementById("view-messages")?.classList.contains("active")) {
            renderClientMessages();
        }
    });

    window.addEventListener("lordbless:payment-data-updated", event => {
        const type = event.detail && event.detail.type;

        if (type === "message-created" || type === "message-read") {
            updateClientMessageBadge();

            if (document.getElementById("view-messages")?.classList.contains("active")) {
                renderClientMessages();
            }
        }
    });

}

/* ============================================================
   CLIENT FINANCE
   ============================================================ */

function renderClientFinance() {

    const container =
        document.getElementById(
            "client-finance-container"
        );


    if (
        !container ||
        !window.LORDBLESS_CLIENT_FINANCE
    ) {

        return;

    }


    window.LORDBLESS_CLIENT_FINANCE.render(
        container,
        {
            client:
                LORDBLESS_CLIENT_ACCOUNT,

            transactions:
                LORDBLESS_CLIENT_ACCOUNT.transactions || [],

                        paymentRequests:
    Array.isArray(
        window.LORDBLESS_PAYMENT_REQUESTS
    )
        ? window.LORDBLESS_PAYMENT_REQUESTS
        : [],

payments:
    Array.isArray(
        window.LORDBLESS_PAYMENTS
    )
        ? window.LORDBLESS_PAYMENTS
        : [],

        receipts:
            Array.isArray(
                window.LORDBLESS_RECEIPTS
            )
                ? window.LORDBLESS_RECEIPTS
                : []
    }
);
}

/* ============================================================
   DASHBOARD
   ============================================================ */

function renderDashboard() {

    const transactions =
        LORDBLESS_CLIENT_ACCOUNT.transactions || [];


    const documents =
        LORDBLESS_CLIENT_ACCOUNT.documents || [];


    const active =
        transactions.filter(
            transaction =>
                transaction.status !==
                "completed"
        );


    const completed =
        transactions.filter(
            transaction =>
                transaction.status ===
                "completed"
        );


    setText(
        "active-journey-count",
        active.length
    );


    setText(
        "completed-journey-count",
        completed.length
    );


    setText(
        "document-count",
        documents.length
    );


    setText(
        "pending-actions-count",
        getPendingActionCount()
    );


    renderDocumentSummary();


    const current =
        getCurrentTransaction();


    if (!current) {
        return;
    }


    setText(
        "overview-journey-reference",
        current.id
    );


    setText(
        "overview-journey-title",
        current.title
    );


    setText(
        "overview-journey-service",
        current.service
    );


    setText(
        "overview-journey-destination",
        current.destination
    );


    setText(
        "overview-journey-status",
        current.statusLabel
    );


    const progress =
        clampProgress(
            current.progress
        );


    setText(
        "overview-progress-label",
        `${progress}%`
    );


    const progressBar =
        document.getElementById(
            "overview-progress-bar"
        );


    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;

    }


    setText(
        "overview-next-step",
        current.nextStep
    );


    renderJourneyPhases(
        current
    );

}


/* ============================================================
   DOCUMENT SUMMARY
   ============================================================ */

function renderDocumentSummary() {

    const documents =
        LORDBLESS_CLIENT_ACCOUNT.documents || [];


    const approved =
        documents.filter(
            documentItem =>
                getDocumentStatus(
                    documentItem
                ) === "approved"
        ).length;


    const reviewing =
        documents.filter(
            documentItem =>
                getDocumentStatus(
                    documentItem
                ) === "reviewing"
        ).length;


    const attention =
        documents.filter(
            documentItem =>
                requiresDocumentAttention(
                    documentItem
                )
        ).length;


    setText(
        "document-total-count",
        documents.length
    );


    setText(
        "document-approved-count",
        approved
    );


    setText(
        "document-review-count",
        reviewing
    );


    setText(
        "document-attention-count",
        attention
    );

}


/* ============================================================
   PENDING ACTIONS
   ============================================================ */

function getPendingActionCount() {

    const documents =
        LORDBLESS_CLIENT_ACCOUNT.documents || [];


    return documents.filter(
        documentItem => {

            const status =
                getDocumentStatus(
                    documentItem
                );


            if (
                status === "rejected" ||
                status === "expired" ||
                status === "missing"
            ) {

                return true;

            }


            return false;

        }
    ).length;

}


/* ============================================================
   CURRENT TRANSACTION
   ============================================================ */

function getCurrentTransaction() {

    return (
        LORDBLESS_CLIENT_ACCOUNT.transactions
            .find(
                transaction =>
                    transaction.id ===
                    LORDBLESS_CLIENT_ACCOUNT.currentTransactionId
            )
    );

}


/* ============================================================
   JOURNEY PHASES
   ============================================================ */

function renderJourneyPhases(
    transaction
) {

    const container =
        document.querySelector(
            ".journey-phases"
        );


    if (!container) {
        return;
    }


    const currentIndex =
        LORDBLESS_JOURNEY_STEPS.indexOf(
            transaction.currentStep
        );


    const labels = {

        discover:
            "Discover",

        assess:
            "Assess",

        plan:
            "Plan",

        prepare:
            "Prepare",

        connect:
            "Connect",

        travel:
            "Travel",

        arrive:
            "Arrive",

        continue:
            "Continue"

    };


    container.innerHTML =
        LORDBLESS_JOURNEY_STEPS

            .filter(
                step =>
                    step !== "continue"
            )

            .map(
                (
                    step,
                    index
                ) => {

                    let className =
                        "";


                    if (
                        index <
                        currentIndex
                    ) {

                        className =
                            "complete";

                    } else if (
                        index ===
                        currentIndex
                    ) {

                        className =
                            "current";

                    }


                    return `

                        <span
                            class="${className}"
                        >
                            ${labels[step]}
                        </span>

                    `;

                }
            )

            .join("");

}


/* ============================================================
   TRANSACTION HISTORY
   ============================================================ */

function renderTransactionHistory() {

    const container =
        document.getElementById(
            "transaction-history"
        );


    if (!container) {
        return;
    }


    const transactions =
        LORDBLESS_CLIENT_ACCOUNT.transactions || [];


    if (!transactions.length) {

        container.innerHTML = `

            <div class="empty-state-card">

                <div class="empty-state-icon">
                    ◇
                </div>

                <h3>
                    No journeys yet
                </h3>

                <p>
                    Your LORDBLESS journeys will appear here.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        transactions
            .map(
                transaction =>
                    createTransactionCard(
                        transaction
                    )
            )
            .join("");


    container
        .querySelectorAll(
            "[data-transaction-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openTransaction(
                            button.dataset.transactionId
                        );

                    }
                );

            }
        );

}


/* ============================================================
   TRANSACTION CARD
   ============================================================ */

function createTransactionCard(
    transaction
) {

    const isCompleted =
        transaction.status ===
        "completed";


    const isCurrent =
        transaction.id ===
        LORDBLESS_CLIENT_ACCOUNT.currentTransactionId;


    const statusClass =
        isCompleted
            ? "completed"
            : "progress";


    const serviceInitial =
        getServiceInitial(
            transaction.services?.[0]
        );


    const progress =
        clampProgress(
            transaction.progress
        );


    return `

        <article
            class="transaction-card ${isCurrent ? "current" : ""}"
        >

            <div class="transaction-icon">
                ${escapeHTML(
                    serviceInitial
                )}
            </div>


            <div class="transaction-main">

                <div class="transaction-top">

                    <div>

                        <span
                            class="transaction-reference"
                        >
                            ${escapeHTML(
                                transaction.id
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                transaction.title
                            )}
                        </h3>

                    </div>


                    <span
                        class="
                            transaction-status
                            ${statusClass}
                        "
                    >
                        ${escapeHTML(
                            transaction.statusLabel
                        )}
                    </span>

                </div>


                <div class="transaction-meta">

                    <span>
                        ${escapeHTML(
                            transaction.service
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            transaction.destination
                        )}
                    </span>

                    <span>
                        Updated
                        ${formatDate(
                            transaction.updated
                        )}
                    </span>

                </div>


                <div
                    class="transaction-progress"
                >

                    <div
                        class="transaction-progress-bar"
                        style="width:${progress}%"
                    ></div>

                </div>


                <div
                    class="transaction-footer"
                >

                    <span>
                        ${progress}% complete
                    </span>


                    <button
                        type="button"
                        class="transaction-open-button"
                        data-transaction-id="${escapeHTML(
                            transaction.id
                        )}"
                    >

                        ${
                            isCurrent
                                ? "Open Journey →"
                                : "View Journey →"
                        }

                    </button>

                </div>

            </div>

        </article>

    `;

}


/* ============================================================
   OPEN TRANSACTION
   ============================================================ */

function openTransaction(
    transactionId
) {

    const transaction =
        LORDBLESS_CLIENT_ACCOUNT.transactions
            .find(
                item =>
                    item.id ===
                    transactionId
            );


    if (!transaction) {
        return;
    }


    LORDBLESS_CLIENT_ACCOUNT.currentTransactionId =
        transaction.id;


    renderDashboard();

    renderTransactionHistory();

    renderDocuments();


    showView(
        "journeys"
    );


    requestAnimationFrame(
        () => {

            const card =
                document.querySelector(
                    `[data-transaction-id="${transaction.id}"]`
                );


            if (card) {

                card.scrollIntoView({
                    behavior:
                        "smooth",

                    block:
                        "center"
                });

            }

        }
    );

}


/* ============================================================
   DOCUMENT CENTRE
   ============================================================ */

/*
 * SURGICAL PATCH:
 *
 * The document summary is NOT rendered here.
 *
 * The single summary already belongs to the page-level
 * document interface and is updated by renderDocumentSummary().
 *
 * This function now renders only:
 * - Permanent Document Library heading
 * - Existing document cards
 * - Existing upload interface
 *
 * No duplicate summary.
 * No old .document-upload-panel.
 * No Supabase.
 */

/* ============================================================
   DOCUMENT CENTRE
   ============================================================ */

function renderDocuments() {

    const container =
        document.getElementById(
            "document-centre-container"
        );


    if (!container) {

        return;

    }


    const documents =
        Array.isArray(
            LORDBLESS_CLIENT_ACCOUNT.documents
        )
            ? LORDBLESS_CLIENT_ACCOUNT.documents
            : [];


    const transaction =
        LORDBLESS_CLIENT_ACCOUNT.transactions
            .find(
                item =>
                    item.id ===
                    LORDBLESS_CLIENT_ACCOUNT
                        .currentTransactionId
            );


    /*
     * The dedicated Document Centre now owns
     * the complete document interface:
     *
     * 1. Journey Document Requests
     * 2. Permanent Document Library
     * 3. Universal Upload
     *
     * Admin-created requests are retrieved
     * through portalDataBridge.js.
     */

    if (
        window.LORDBLESS_DOCUMENT_CENTRE &&
        typeof
            window.LORDBLESS_DOCUMENT_CENTRE
                .renderDocumentCentre ===
            "function"
    ) {

        window.LORDBLESS_DOCUMENT_CENTRE
            .renderDocumentCentre(
                container,
                transaction,
                documents
            );

        return;

    }


    /*
     * Safety fallback.
     */

    container.innerHTML = `

        <section
            class="document-empty-section"
        >

            <p class="portal-eyebrow">
                DOCUMENT CENTRE
            </p>

            <h3>
                Document Centre unavailable
            </h3>

            <p>
                Please refresh the portal and try again.
            </p>

        </section>

    `;

}

/* ============================================================
   EMPTY DOCUMENT STATE
   ============================================================ */

function createEmptyDocumentState() {

    return `

        <div
            class="empty-state-card"
        >

            <div
                class="empty-state-icon"
            >
                ▣
            </div>

            <h3>
                No documents yet
            </h3>

            <p>
                Upload the documents requested
                for your LORDBLESS journey.
            </p>

            <br>

            <button
                type="button"
                class="primary-button"
                data-document-upload="new"
            >
                Upload Document
            </button>

        </div>

    `;

}


/* ============================================================
   DOCUMENT CARD
   ============================================================ */

function createDocumentCard(
    documentItem
) {

    const status =
        getDocumentStatus(
            documentItem
        );


    const statusLabel =
        getDocumentStatusLabel(
            status
        );


    const statusClass =
        getDocumentStatusClass(
            status
        );


    const expiryStatus =
        getExpiryStatus(
            documentItem.expiryDate
        );


    const expiryText =
        getDocumentExpiryText(
            documentItem
        );


    const actionLabel =
        status === "rejected" ||
        status === "expired"
            ? "Replace Document"
            : "Replace / Update";


    const attentionMessage =
        getDocumentAttentionMessage(
            documentItem
        );


    return `

        <article
            class="
                document-card
                ${statusClass}
            "
        >

            <div
                class="document-card-header"
            >

                <div>

                    <span
                        class="transaction-reference"
                    >
                        ${escapeHTML(
                            documentItem.id
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            documentItem.name
                        )}
                    </h3>

                </div>


                <span
                    class="
                        document-status
                        ${statusClass}
                    "
                >
                    ${escapeHTML(
                        statusLabel
                    )}
                </span>

            </div>


            <div
                class="document-card-meta"
            >

                <span>
                    ${escapeHTML(
                        documentItem.filename ||
                        "No file uploaded"
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        expiryText
                    )}
                </span>

                ${
                    documentItem.issueDate
                        ? `
                            <span>
                                Issued
                                ${formatDate(
                                    documentItem.issueDate
                                )}
                            </span>
                        `
                        : ""
                }

            </div>


            ${
                attentionMessage
                    ? `
                        <div
                            class="
                                document-attention-message
                            "
                        >
                            ${escapeHTML(
                                attentionMessage
                            )}
                        </div>
                    `
                    : ""
            }


            <div
                class="document-card-actions"
            >

                <button
                    type="button"
                    class="secondary-button"
                    data-document-view="${escapeHTML(
                        documentItem.id
                    )}"
                >
                    View Details
                </button>


                ${
                    status !== "approved" ||
                    expiryStatus !== "normal"
                        ? `
                            <button
                                type="button"
                                class="secondary-button"
                                data-document-replace="${escapeHTML(
                                    documentItem.id
                                )}"
                            >
                                ${actionLabel}
                            </button>
                        `
                        : `
                            <button
                                type="button"
                                class="secondary-button"
                                data-document-replace="${escapeHTML(
                                    documentItem.id
                                )}"
                            >
                                Replace / Update
                            </button>
                        `
                }

            </div>

        </article>

    `;

}


/* ============================================================
   DOCUMENT ACTIONS
   ============================================================ */

function attachDocumentActions() {

    document
        .querySelectorAll(
            "[data-document-view]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const documentItem =
                            findDocument(
                                button.dataset.documentView
                            );


                        if (
                            documentItem
                        ) {

                            showDocumentDetails(
                                documentItem
                            );

                        }

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-document-replace]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const input =
                            document.getElementById(
                                "client-document-upload"
                            );


                        if (!input) {
                            return;
                        }


                        input.dataset.replaceDocument =
                            button.dataset.documentReplace;


                        input.click();

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-document-upload='new']"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const input =
                            document.getElementById(
                                "client-document-upload"
                            );


                        if (!input) {
                            return;
                        }


                        input.dataset.replaceDocument =
                            "";


                        input.click();

                    }
                );

            }
        );


    const input =
        document.getElementById(
            "client-document-upload"
        );


    if (input) {

        input.addEventListener(
            "change",
            handleDocumentUpload
        );

    }

}


/* ============================================================
   DOCUMENT LOOKUP
   ============================================================ */

function findDocument(
    documentId
) {

    return (
        LORDBLESS_CLIENT_ACCOUNT.documents
            .find(
                documentItem =>
                    documentItem.id ===
                    documentId
            )
    );

}


/* ============================================================
   DOCUMENT UPLOAD
   ============================================================ */

function handleDocumentUpload(
    event
) {

    const file =
        event.target.files?.[0];


    if (!file) {
        return;
    }


    const replacementId =
        event.target.dataset.replaceDocument;


    if (replacementId) {

        const documentItem =
            findDocument(
                replacementId
            );


        if (documentItem) {

            documentItem.filename =
                file.name;

            documentItem.status =
                "reviewing";

            documentItem.isCurrent =
                true;

        }


        event.target.value = "";

        delete event.target.dataset.replaceDocument;


        renderDashboard();

        renderDocuments();


        showModal(
            "Document Submitted",
            `${file.name} has been submitted as a replacement and is now marked Under Review.`
        );


        return;

    }


    const nextNumber =
        LORDBLESS_CLIENT_ACCOUNT.documents.length + 1;


    LORDBLESS_CLIENT_ACCOUNT.documents.push({

        id:
            `DOC-${String(
                nextNumber
            ).padStart(
                4,
                "0"
            )}`,

        type:
            "additional",

        name:
            getReadableFileName(
                file.name
            ),

        filename:
            file.name,

        status:
            "reviewing",

        issueDate:
            null,

        expiryDate:
            null,

        isCurrent:
            true

    });


    event.target.value = "";

    delete event.target.dataset.replaceDocument;


    renderDashboard();

    renderDocuments();


    showModal(
        "Document Submitted",
        `${file.name} has been added to your permanent document library and is now Under Review.`
    );

}


/* ============================================================
   DOCUMENT DETAILS
   ============================================================ */

function showDocumentDetails(
    documentItem
) {

    const status =
        getDocumentStatus(
            documentItem
        );


    const expiryText =
        documentItem.expiryDate
            ? `Expiry date: ${formatDate(
                documentItem.expiryDate
            )}`
            : "No expiry date recorded.";


    const issueText =
        documentItem.issueDate
            ? `Issue date: ${formatDate(
                documentItem.issueDate
            )}`
            : "Issue date: Not recorded.";


    let message =

        `Document: ${documentItem.name}\n` +

        `Reference: ${documentItem.id}\n` +

        `File: ${
            documentItem.filename ||
            "Not uploaded"
        }\n` +

        `Status: ${
            getDocumentStatusLabel(
                status
            )
        }\n` +

        `${issueText}\n` +

        `${expiryText}`;


    const attention =
        getDocumentAttentionMessage(
            documentItem
        );


    if (attention) {

        message +=
            `\n\n${attention}`;

    }


    showModal(
        documentItem.name,
        message
    );

}


/* ============================================================
   DOCUMENT STATUS
   ============================================================ */

function getDocumentStatus(
    documentItem
) {

    if (!documentItem) {
        return "missing";
    }


    if (
        documentItem.status ===
        "rejected"
    ) {

        return "rejected";

    }


    if (
        documentItem.status ===
        "expired"
    ) {

        return "expired";

    }


    if (
        documentItem.expiryDate &&
        getExpiryStatus(
            documentItem.expiryDate
        ) === "expired"
    ) {

        return "expired";

    }


    return (
        documentItem.status ||
        "missing"
    );

}


/* ============================================================
   DOCUMENT STATUS LABEL
   ============================================================ */

function getDocumentStatusLabel(
    status
) {

    const labels = {

        missing:
            "Missing",

        uploaded:
            "Uploaded",

        reviewing:
            "Under Review",

        approved:
            "Approved",

        rejected:
            "Rejected",

        expired:
            "Expired",

        superseded:
            "Superseded"

    };


    return (
        labels[status] ||
        "Pending"
    );

}


/* ============================================================
   DOCUMENT STATUS CSS CLASS
   ============================================================ */

function getDocumentStatusClass(
    status
) {

    const allowed = [

        "missing",
        "uploaded",
        "reviewing",
        "approved",
        "rejected",
        "expired",
        "superseded"

    ];


    return allowed.includes(
        status
    )
        ? status
        : "reviewing";

}


/* ============================================================
   EXPIRY STATUS
   ============================================================ */

function getExpiryStatus(
    expiryDate
) {

    if (!expiryDate) {

        return "normal";

    }


    const expiry =
        new Date(
            expiryDate
        );


    if (
        Number.isNaN(
            expiry.getTime()
        )
    ) {

        return "normal";

    }


    const now =
        new Date();


    const difference =
        expiry.getTime() -
        now.getTime();


    if (
        difference <= 0
    ) {

        return "expired";

    }


    const days =
        difference /
        (
            1000 *
            60 *
            60 *
            24
        );


    if (
        days <= 90
    ) {

        return "urgent";

    }


    if (
        days <= 180
    ) {

        return "attention";

    }


    return "normal";

}


/* ============================================================
   DOCUMENT EXPIRY TEXT
   ============================================================ */

function getDocumentExpiryText(
    documentItem
) {

    if (
        !documentItem.expiryDate
    ) {

        return "No expiry date";

    }


    const expiryStatus =
        getExpiryStatus(
            documentItem.expiryDate
        );


    if (
        expiryStatus ===
        "expired"
    ) {

        return `Expired ${formatDate(
            documentItem.expiryDate
        )}`;

    }


    if (
        expiryStatus ===
        "urgent"
    ) {

        return `Expires ${formatDate(
            documentItem.expiryDate
        )} • Renewal required soon`;

    }


    if (
        expiryStatus ===
        "attention"
    ) {

        return `Expires ${formatDate(
            documentItem.expiryDate
        )} • Renewal approaching`;

    }


    return `Expires ${formatDate(
        documentItem.expiryDate
    )}`;

}


/* ============================================================
   DOCUMENT ATTENTION
   ============================================================ */

function requiresDocumentAttention(
    documentItem
) {

    if (!documentItem) {
        return false;
    }


    const status =
        getDocumentStatus(
            documentItem
        );


    if (
        status === "rejected" ||
        status === "expired" ||
        status === "missing"
    ) {

        return true;

    }


    const expiryStatus =
        getExpiryStatus(
            documentItem.expiryDate
        );


    return (
        expiryStatus === "urgent"
    );

}


/* ============================================================
   DOCUMENT ATTENTION MESSAGE
   ============================================================ */

function getDocumentAttentionMessage(
    documentItem
) {

    const status =
        getDocumentStatus(
            documentItem
        );


    if (
        status === "rejected"
    ) {

        return (
            "This document was rejected. " +
            "Please upload a corrected replacement."
        );

    }


    if (
        status === "expired"
    ) {

        return (
            "This document has expired. " +
            "Please upload a current replacement."
        );

    }


    const expiryStatus =
        getExpiryStatus(
            documentItem.expiryDate
        );


    if (
        expiryStatus === "urgent"
    ) {

        return (
            "This document expires within " +
            "3 months. Renewal is recommended."
        );

    }


    if (
        status === "missing"
    ) {

        return (
            "This document is required " +
            "but has not been uploaded."
        );

    }


    return "";

}


/* ============================================================
   READABLE FILE NAME
   ============================================================ */

function getReadableFileName(
    filename
) {

    if (!filename) {
        return "Additional Document";
    }


    const name =
        filename
            .replace(
                /\.[^/.]+$/,
                ""
            )
            .replace(
                /[-_]+/g,
                " "
            )
            .trim();


    if (!name) {
        return "Additional Document";
    }


    return name.replace(
        /\b\w/g,
        letter =>
            letter.toUpperCase()
    );

}


/* ============================================================
   ACTIONS
   ============================================================ */

function initialiseActions() {

    document
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        const action =
                            button.dataset.action;


                        if (
                            action ===
                            "new-journey"
                        ) {

                            event.preventDefault();

                            startNewJourney();

                            return;

                        }


                        if (
                            action ===
                            "view-current-journey"
                        ) {

                            event.preventDefault();

                            const current =
                                getCurrentTransaction();


                            if (current) {

                                showView(
                                    "journeys"
                                );


                                requestAnimationFrame(
                                    () => {

                                        const currentCard =
                                            document.querySelector(
                                                `[data-transaction-id="${current.id}"]`
                                            );


                                        if (
                                            currentCard
                                        ) {

                                            currentCard.scrollIntoView({
                                                behavior:
                                                    "smooth",

                                                block:
                                                    "center"
                                            });

                                        }

                                    }
                                );

                            }


                            return;

                        }


                        if (
                            action ===
                            "complete-pending-actions"
                        ) {

                            event.preventDefault();

                            showView(
                                "documents"
                            );

                            return;

                        }


                        if (
                            action ===
                            "sign-out"
                        ) {

                            event.preventDefault();
                            signOutClient();

                        }

                    }
                );

            }
        );

}


/* ============================================================
   NEW JOURNEY
   ============================================================ */

function startNewJourney() {

    showModal(
        "Start a New Journey",
        "Your existing LORDBLESS Client ID remains with you. The new journey request workflow will be connected in a later stage."
    );

}


/* ============================================================
   MOBILE SIDEBAR
   ============================================================ */

function initialiseMobileSidebar() {

    const button =
        document.getElementById(
            "mobile-sidebar-button"
        );


    const sidebar =
        document.getElementById(
            "client-sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebar-overlay"
        );


    if (
        !button ||
        !sidebar ||
        !overlay
    ) {

        return;

    }


    button.addEventListener(
        "click",
        () => {

            const open =
                sidebar.classList.contains(
                    "open"
                );


            if (open) {

                closeMobileSidebar();

                return;

            }


            sidebar.classList.add(
                "open"
            );

            overlay.classList.add(
                "open"
            );

            button.setAttribute(
                "aria-expanded",
                "true"
            );

        }
    );


    overlay.addEventListener(
        "click",
        closeMobileSidebar
    );

}


/* ============================================================
   CLOSE MOBILE SIDEBAR
   ============================================================ */

function closeMobileSidebar() {

    const sidebar =
        document.getElementById(
            "client-sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebar-overlay"
        );


    const button =
        document.getElementById(
            "mobile-sidebar-button"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "open"
        );

    }


    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* ============================================================
   MODAL
   ============================================================ */

function initialiseModal() {

    const modal =
        document.getElementById(
            "portal-modal"
        );


    const closeButton =
        document.getElementById(
            "modal-close"
        );


    const actionButton =
        document.getElementById(
            "modal-action"
        );


    if (!modal) {
        return;
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePortalModal
        );

    }


    if (actionButton) {

        actionButton.addEventListener(
            "click",
            closePortalModal
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closePortalModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                    "Escape" &&
                modal.classList.contains(
                    "open"
                )
            ) {

                closePortalModal();

            }

        }
    );

}


/* ============================================================
   SHOW MODAL
   ============================================================ */

function showModal(
    title,
    description
) {

    const modal =
        document.getElementById(
            "portal-modal"
        );


    if (!modal) {
        return;
    }


    setText(
        "modal-title",
        title
    );


    setText(
        "modal-description",
        description
    );


    modal.classList.add(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    const closeButton =
        document.getElementById(
            "modal-close"
        );


    if (closeButton) {

        setTimeout(
            () => {

                closeButton.focus();

            },
            50
        );

    }

}


/* ============================================================
   CLOSE MODAL
   ============================================================ */

function closePortalModal() {

    const modal =
        document.getElementById(
            "portal-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "open"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* ============================================================
   HELPER: SET TEXT
   ============================================================ */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value ??
            "";

    }

}


/* ============================================================
   HELPER: FORMAT CLIENT NAME
   ============================================================ */

function formatClientName(
    name
) {

    if (!name) {
        return "";
    }


    return String(name)
        .toLowerCase()
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


/* ============================================================
   HELPER: SERVICE INITIAL
   ============================================================ */

function getServiceInitial(
    serviceKey
) {

    const initials = {

        careers:
            "C",

        travel:
            "T",

        business:
            "B",

        tourism:
            "T",

        study:
            "S",

        education:
            "E",

        mobility:
            "M"

    };


    return (
        initials[
            String(
                serviceKey ||
                ""
            ).toLowerCase()
        ] ||
        "LB"
    );

}


/* ============================================================
   HELPER: FORMAT DATE
   ============================================================ */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "Date unavailable";

    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateString
        );

    }


    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    ).format(
        date
    );

}


/* ============================================================
   HELPER: CLAMP PROGRESS
   ============================================================ */

function clampProgress(
    value
) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return 0;

    }


    return Math.min(
        100,
        Math.max(
            0,
            number
        )
    );

}


/* ============================================================
   HELPER: ESCAPE HTML
   ============================================================ */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   GLOBAL ACCESS
   ============================================================ */

window.LORDBLESS_CLIENT_ACCOUNT =
    LORDBLESS_CLIENT_ACCOUNT;


window.LORDBLESS_JOURNEY_STEPS =
    LORDBLESS_JOURNEY_STEPS;


window.showClientView =
    showView;


window.openTransaction =
    openTransaction;


window.closePortalModal =
    closePortalModal;


/* ============================================================
   DOM READY
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initialiseClientAuth
);

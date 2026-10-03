/* =========================================================
   LORDBLESS CONSULTANCY
   Client Account Activation
   Batch 6

   Purpose:
   - Prepare permanent client account activation
   - Tie activation to permanent client_id
   - Support multiple transactions per client
   - Prepare future Supabase Auth integration
   - Never store passwords in frontend code
   ========================================================= */

(function () {
    "use strict";

    const ACCOUNT_STATUS = {
        INVITED: "invited",
        ACTIVATION_REQUIRED: "activation_required",
        ACTIVE: "active",
        SUSPENDED: "suspended",
        CLOSED: "closed"
    };

    const ACCOUNT_STATUS_LABELS = {
        invited: "Invitation Sent",
        activation_required: "Activation Required",
        active: "Active",
        suspended: "Suspended",
        closed: "Closed"
    };

    /*
     * Temporary frontend activation state.
     *
     * IMPORTANT:
     * This is only a frontend model until Supabase Auth is connected.
     * No password or authentication credential is stored here.
     */

    let state = {
        client: null,
        status: ACCOUNT_STATUS.INVITED,
        activationSent: false,
        activationSentAt: null,
        activationToken: null
    };


    /* =========================================================
       INITIALISE
       ========================================================= */

    function initialise(client) {
        if (!client || !client.id) {
            console.warn(
                "LORDBLESS ACCOUNT ACTIVATION: Invalid client."
            );
            return getState();
        }

        state.client = {
            id: client.id,
            fullName: client.fullName || "",
            email: client.email || "",
            whatsapp: client.whatsapp || "",
            currentCountry: client.currentCountry || "",
            nationality: client.nationality || ""
        };

        state.status = ACCOUNT_STATUS.INVITED;
        state.activationSent = false;
        state.activationSentAt = null;
        state.activationToken = null;

        return getState();
    }


    /* =========================================================
       CREATE ACTIVATION INVITATION
       ========================================================= */

    function createActivationInvitation() {
        if (!state.client || !state.client.id) {
            throw new Error(
                "A valid client is required before activation."
            );
        }

        if (!state.client.email) {
            throw new Error(
                "A client email address is required."
            );
        }

        /*
         * Temporary token for frontend demonstration only.
         *
         * Production version will NOT generate authentication
         * tokens in the browser. Supabase Auth / Edge Functions
         * will handle the secure invitation process.
         */

        state.activationToken =
            "TEMP-" +
            state.client.id +
            "-" +
            Date.now();

        state.activationSent = true;
        state.activationSentAt = new Date().toISOString();
        state.status = ACCOUNT_STATUS.ACTIVATION_REQUIRED;

        const activationData = {
            clientId: state.client.id,
            fullName: state.client.fullName,
            email: state.client.email,
            whatsapp: state.client.whatsapp,
            status: state.status,
            activationSentAt: state.activationSentAt
        };

        document.dispatchEvent(
            new CustomEvent(
                "lordbless:client-activation-invited",
                {
                    detail: activationData
                }
            )
        );

        return activationData;
    }


    /* =========================================================
       MARK ACCOUNT ACTIVE
       ========================================================= */

    function activateAccount() {
        if (!state.client || !state.client.id) {
            throw new Error(
                "No client account has been initialised."
            );
        }

        state.status = ACCOUNT_STATUS.ACTIVE;

        const activationData = {
            clientId: state.client.id,
            fullName: state.client.fullName,
            email: state.client.email,
            status: state.status,
            activatedAt: new Date().toISOString()
        };

        document.dispatchEvent(
            new CustomEvent(
                "lordbless:client-account-activated",
                {
                    detail: activationData
                }
            )
        );

        return activationData;
    }


    /* =========================================================
       ACCOUNT STATUS
       ========================================================= */

    function setStatus(status) {
        if (!Object.values(ACCOUNT_STATUS).includes(status)) {
            throw new Error(
                "Invalid LORDBLESS client account status."
            );
        }

        state.status = status;

        document.dispatchEvent(
            new CustomEvent(
                "lordbless:client-account-status-changed",
                {
                    detail: {
                        clientId: state.client?.id || null,
                        status
                    }
                }
            )
        );

        return getState();
    }


    function getStatus() {
        return state.status;
    }


    function getStatusLabel(status = state.status) {
        return (
            ACCOUNT_STATUS_LABELS[status] ||
            "Unknown"
        );
    }


    /* =========================================================
       ACCESS CHECK
       ========================================================= */

    function canAccessClientPortal() {
        return state.status === ACCOUNT_STATUS.ACTIVE;
    }


    function canActivate() {
        return (
            state.status === ACCOUNT_STATUS.INVITED ||
            state.status === ACCOUNT_STATUS.ACTIVATION_REQUIRED
        );
    }


    /* =========================================================
       ACCOUNT SUMMARY
       ========================================================= */

    function getAccountSummary() {
        if (!state.client) {
            return null;
        }

        return {
            clientId: state.client.id,
            fullName: state.client.fullName,
            email: state.client.email,
            whatsapp: state.client.whatsapp,
            status: state.status,
            statusLabel: getStatusLabel(),
            activationSent: state.activationSent,
            activationSentAt: state.activationSentAt,
            portalAccess: canAccessClientPortal()
                ? "granted"
                : "blocked"
        };
    }


    /* =========================================================
       STATE
       ========================================================= */

    function getState() {
        return {
            client: state.client
                ? { ...state.client }
                : null,

            status: state.status,

            statusLabel:
                getStatusLabel(),

            activationSent:
                state.activationSent,

            activationSentAt:
                state.activationSentAt,

            portalAccess:
                canAccessClientPortal()
        };
    }


    /* =========================================================
       ADMIN PAYMENT → ACCOUNT ACTIVATION BRIDGE
       ========================================================= */

    document.addEventListener(
        "lordbless:receipt-generated",
        function (event) {

            const receipt =
                event.detail || {};

            /*
             * The receipt should contain the client information.
             * The production backend will use the permanent
             * client_id from Supabase.
             */

            if (
                !receipt.client ||
                !receipt.client.clientId
            ) {
                return;
            }

            initialise(receipt.client);

            /*
             * At this point the system prepares the account
             * activation invitation.
             */

            try {
                createActivationInvitation();

                console.log(
                    "LORDBLESS CLIENT ACCOUNT ACTIVATION READY:",
                    getAccountSummary()
                );

            } catch (error) {

                console.error(
                    "LORDBLESS ACCOUNT ACTIVATION ERROR:",
                    error
                );
            }
        }
    );


    /* =========================================================
       PUBLIC API
       ========================================================= */

    window.LORDBLESS_ACCOUNT_ACTIVATION = {

        ACCOUNT_STATUS,

        initialise,

        createActivationInvitation,

        activateAccount,

        setStatus,

        getStatus,

        getStatusLabel,

        canAccessClientPortal,

        canActivate,

        getAccountSummary,

        getState
    };


    console.log(
        "LORDBLESS ACCOUNT ACTIVATION: Ready."
    );

})();
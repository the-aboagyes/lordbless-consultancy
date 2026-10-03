/* =========================================================
   LORDBLESS CONSULTANCY
   Client Access Flow
   Batch 6B

   Purpose:
   - Control client portal access state
   - Connect permanent client_id to portal access
   - Prepare future Supabase Auth integration
   - Support multiple transactions under one client account
   - Never store passwords in frontend code
   ========================================================= */

(function () {
    "use strict";

    const ACCESS_STATES = {
        INVITED: "invited",
        ACTIVATION_REQUIRED: "activation_required",
        ACTIVE: "active",
        SUSPENDED: "suspended",
        CLOSED: "closed"
    };

    let state = {
        client: null,
        accessState: ACCESS_STATES.INVITED,
        authenticated: false,
        currentTransactionId: null
    };


    /* =========================================================
       INITIALISE
       ========================================================= */

    function initialise(client, transactionId = null) {

        if (!client || !client.id) {
            console.warn(
                "LORDBLESS CLIENT ACCESS: Invalid client."
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

        state.currentTransactionId =
            transactionId || null;

        state.accessState =
            ACCESS_STATES.INVITED;

        state.authenticated = false;

        return getState();
    }


    /* =========================================================
       SET ACCESS STATE
       ========================================================= */

    function setAccessState(accessState) {

        if (
            !Object.values(ACCESS_STATES)
                .includes(accessState)
        ) {
            throw new Error(
                "Invalid LORDBLESS client access state."
            );
        }

        state.accessState = accessState;

        if (
            accessState !== ACCESS_STATES.ACTIVE
        ) {
            state.authenticated = false;
        }

        document.dispatchEvent(
            new CustomEvent(
                "lordbless:client-access-state-changed",
                {
                    detail: {
                        clientId:
                            state.client?.id || null,
                        accessState
                    }
                }
            )
        );

        return getState();
    }


    /* =========================================================
       ACTIVATION REQUIRED
       ========================================================= */

    function requireActivation() {

        setAccessState(
            ACCESS_STATES.ACTIVATION_REQUIRED
        );

        return getState();
    }


    /* =========================================================
       ACTIVATE ACCOUNT
       ========================================================= */

    function activateAccount() {

        if (!state.client) {
            throw new Error(
                "No client account is loaded."
            );
        }

        setAccessState(
            ACCESS_STATES.ACTIVE
        );

        state.authenticated = true;

        const accessData = {
            clientId: state.client.id,
            fullName: state.client.fullName,
            email: state.client.email,
            accessState: state.accessState,
            authenticated: state.authenticated,
            activatedAt:
                new Date().toISOString()
        };

        document.dispatchEvent(
            new CustomEvent(
                "lordbless:client-access-granted",
                {
                    detail: accessData
                }
            )
        );

        return accessData;
    }


    /* =========================================================
       AUTHENTICATION STATE
       ========================================================= */

    function signIn() {

        /*
         * Temporary frontend behaviour only.

         * Production authentication will be handled by
         * Supabase Auth.

         * No password is accepted, stored, or checked here.
         */

        if (
            state.accessState !==
            ACCESS_STATES.ACTIVE
        ) {
            return {
                success: false,
                reason: "account_not_active"
            };
        }

        state.authenticated = true;

        document.dispatchEvent(
            new CustomEvent(
                "lordbless:client-signed-in",
                {
                    detail: {
                        clientId:
                            state.client.id,
                        authenticated: true
                    }
                }
            )
        );

        return {
            success: true,
            clientId: state.client.id
        };
    }


    function signOut() {

        state.authenticated = false;

        document.dispatchEvent(
            new CustomEvent(
                "lordbless:client-signed-out",
                {
                    detail: {
                        clientId:
                            state.client?.id || null
                    }
                }
            )
        );

        return {
            success: true
        };
    }


    /* =========================================================
       PORTAL ACCESS
       ========================================================= */

    function canAccessPortal() {

        return (
            state.accessState ===
            ACCESS_STATES.ACTIVE &&
            state.authenticated === true
        );
    }


    function requirePortalAccess() {

        if (canAccessPortal()) {
            return true;
        }

        document.dispatchEvent(
            new CustomEvent(
                "lordbless:client-access-denied",
                {
                    detail: {
                        clientId:
                            state.client?.id || null,
                        accessState:
                            state.accessState,
                        authenticated:
                            state.authenticated
                    }
                }
            )
        );

        return false;
    }


    /* =========================================================
       TRANSACTION SELECTION
       ========================================================= */

    function setCurrentTransaction(
        transactionId
    ) {

        if (!transactionId) {
            return false;
        }

        state.currentTransactionId =
            transactionId;

        document.dispatchEvent(
            new CustomEvent(
                "lordbless:transaction-selected",
                {
                    detail: {
                        clientId:
                            state.client?.id || null,
                        transactionId
                    }
                }
            )
        );

        return true;
    }


    function getCurrentTransactionId() {

        return state.currentTransactionId;
    }


    /* =========================================================
       ACCESS SUMMARY
       ========================================================= */

    function getAccessSummary() {

        return {
            clientId:
                state.client?.id || null,

            fullName:
                state.client?.fullName || "",

            email:
                state.client?.email || "",

            accessState:
                state.accessState,

            authenticated:
                state.authenticated,

            portalAccess:
                canAccessPortal(),

            currentTransactionId:
                state.currentTransactionId
        };
    }


    /* =========================================================
       STATE
       ========================================================= */

    function getState() {

        return {
            client:
                state.client
                    ? { ...state.client }
                    : null,

            accessState:
                state.accessState,

            authenticated:
                state.authenticated,

            portalAccess:
                canAccessPortal(),

            currentTransactionId:
                state.currentTransactionId
        };
    }


    /* =========================================================
       LISTEN FOR ACCOUNT ACTIVATION
       ========================================================= */

    document.addEventListener(
        "lordbless:client-account-activated",
        function (event) {

            const account =
                event.detail || {};

            if (
                !account.clientId
            ) {
                return;
            }

            /*
             * Keep the permanent client identity.
             */

            if (
                !state.client ||
                state.client.id !==
                account.clientId
            ) {
                state.client = {
                    id: account.clientId,
                    fullName:
                        account.fullName || "",
                    email:
                        account.email || "",
                    whatsapp:
                        account.whatsapp || ""
                };
            }

            setAccessState(
                ACCESS_STATES.ACTIVE
            );

            console.log(
                "LORDBLESS CLIENT ACCESS ACTIVATED:",
                getAccessSummary()
            );
        }
    );


    /* =========================================================
       LISTEN FOR ACCOUNT SUSPENSION
       ========================================================= */

    document.addEventListener(
        "lordbless:client-account-suspended",
        function () {

            setAccessState(
                ACCESS_STATES.SUSPENDED
            );
        }
    );


    /* =========================================================
       LISTEN FOR ACCOUNT CLOSURE
       ========================================================= */

    document.addEventListener(
        "lordbless:client-account-closed",
        function () {

            setAccessState(
                ACCESS_STATES.CLOSED
            );
        }
    );


    /* =========================================================
       PUBLIC API
       ========================================================= */

    window.LORDBLESS_CLIENT_ACCESS = {

        ACCESS_STATES,

        initialise,

        setAccessState,

        requireActivation,

        activateAccount,

        signIn,

        signOut,

        canAccessPortal,

        requirePortalAccess,

        setCurrentTransaction,

        getCurrentTransactionId,

        getAccessSummary,

        getState
    };


    console.log(
        "LORDBLESS CLIENT ACCESS: Ready."
    );

})();
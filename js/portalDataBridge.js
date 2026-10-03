/* ============================================================
   LORDBLESS PORTAL DATA BRIDGE
   ============================================================

   Temporary local/mock communication layer between:

   ADMIN PORTAL
        ↕
   CLIENT PORTAL

   This will later be replaced by Supabase.

   CURRENTLY CONNECTED:
   - Document Requests

   FUTURE:
   - Documents
   - Payments
   - Messages
   ============================================================ */

(function () {

    "use strict";


    const STORAGE_KEY =
        "LORDBLESS_PORTAL_DATA_BRIDGE_V1";


    const CHANNEL_NAME =
        "LORDBLESS_PORTAL_CHANNEL_V1";


    let channel = null;


    /* ========================================================
       LOAD DATA
    ======================================================== */

    function loadData() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );


            if (!raw) {

                return {
                    documentRequests: []
                };

            }


            const parsed =
                JSON.parse(raw);

            const storedData =
                parsed && typeof parsed === "object"
                    ? parsed
                    : {};


            return {

                ...storedData,

                documentRequests:
                    Array.isArray(
                        storedData.documentRequests
                    )
                        ? storedData.documentRequests
                        : []

            };

        }

        catch (error) {

            console.warn(
                "LORDBLESS Portal Bridge: unable to load data.",
                error
            );


            return {
                documentRequests: []
            };

        }

    }


    /* ========================================================
       SAVE DATA
    ======================================================== */

    function saveData(data) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );

        }

        catch (error) {

            console.warn(
                "LORDBLESS Portal Bridge: unable to save data.",
                error
            );

        }

    }


    /* ========================================================
       BROADCAST
    ======================================================== */

    function broadcast(
        eventName,
        payload
    ) {

        const message = {

            event:
                eventName,

            payload:
                payload,

            timestamp:
                new Date().toISOString()

        };


        if (channel) {

            try {

                channel.postMessage(
                    message
                );

            }

            catch (error) {

                console.warn(
                    "LORDBLESS Portal Bridge broadcast failed.",
                    error
                );

            }

        }


        /*
         * Same-page notification.
         */

        window.dispatchEvent(

            new CustomEvent(
                "lordbless:portal-data",
                {
                    detail: message
                }
            )

        );

    }


    /* ========================================================
       CREATE / UPDATE DOCUMENT REQUEST
    ======================================================== */

    function saveDocumentRequest(
        request
    ) {

        if (!request) {

            return null;

        }


        const data =
            loadData();


        const existingIndex =
            data.documentRequests.findIndex(
                item =>
                    item.id ===
                    request.id
            );


        const storedRequest = {

            ...request,

            updatedAt:
                new Date().toISOString()

        };


        if (
            existingIndex >= 0
        ) {

            data.documentRequests[
                existingIndex
            ] = storedRequest;

        }

        else {

            data.documentRequests.push(
                storedRequest
            );

        }


        saveData(
            data
        );


        broadcast(
            "document-request-updated",
            storedRequest
        );


        return storedRequest;

    }


    /* ========================================================
       GET DOCUMENT REQUESTS
    ======================================================== */

    function getDocumentRequests(
        clientId,
        transactionId
    ) {

        const data =
            loadData();


        return data.documentRequests.filter(
            request => {

                if (
                    clientId &&
                    request.clientId !==
                    clientId
                ) {

                    return false;

                }


                if (
                    transactionId &&
                    request.transactionId !==
                    transactionId
                ) {

                    return false;

                }


                return true;

            }
        );

    }


    /* ========================================================
       INITIALISE BROADCAST CHANNEL
    ======================================================== */

    if (
        "BroadcastChannel" in window
    ) {

        try {

            channel =
                new BroadcastChannel(
                    CHANNEL_NAME
                );


            channel.addEventListener(
                "message",
                event => {

                    const message =
                        event.data;


                    if (!message) {
                        return;
                    }


                    window.dispatchEvent(

                        new CustomEvent(
                            "lordbless:portal-data",
                            {
                                detail:
                                    message
                            }
                        )

                    );

                }
            );

        }

        catch (error) {

            console.warn(
                "LORDBLESS Portal Bridge: BroadcastChannel unavailable.",
                error
            );

        }

    }


    /* ========================================================
       STORAGE EVENT
       ======================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key !==
                STORAGE_KEY
            ) {

                return;

            }


            window.dispatchEvent(

                new CustomEvent(
                    "lordbless:portal-data",
                    {
                        detail: {

                            event:
                                "portal-data-changed",

                            timestamp:
                                new Date().toISOString()

                        }
                    }
                )

            );

        }
    );


    /* ========================================================
       GLOBAL API
    ======================================================== */

    window.LORDBLESS_PORTAL_BRIDGE = {

        version:
            "1.0.0",

        load:
            loadData,

        saveDocumentRequest:
            saveDocumentRequest,

        getDocumentRequests:
            getDocumentRequests

    };


})();

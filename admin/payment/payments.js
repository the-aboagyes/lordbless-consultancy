/* =========================================================
   LORDBLESS ADMIN
   PAYMENTS MANAGEMENT
   =========================================================

   Responsibilities:
   - Display all client payment records
   - Display payment summary
   - Display outstanding balances
   - Display payment history
   - Open client payment detail
   - Open existing Payment Request engine
   - Connect to paymentDataBridge.js

   IMPORTANT:
   This file does NOT replace:
   - paymentRequest.js
   - paymentVerification.js
   - receiptGenerator.js
   - paymentHistory.js
   - paymentDataBridge.js
========================================================= */

(function () {

    "use strict";


    /* =====================================================
   STATE
===================================================== */

const PAYMENT_STATE = {

    clients: [],

    selectedClient: null,

    selectedTransaction: null,

    container: null

};


/* =====================================================
   HELPERS
===================================================== */

    /* =====================================================
       HELPERS
    ===================================================== */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#039;");
    }


    function formatCurrency(
        amount,
        currency = "EUR"
    ) {

        const value =
            Number(amount) || 0;

        try {

            return new Intl.NumberFormat(
                "en-GB",
                {
                    style: "currency",
                    currency: currency
                }
            ).format(value);

        } catch (error) {

            return `${currency} ${value.toFixed(2)}`;

        }

    }


    function getClientId(client) {

        return (
            client?.id ||
            client?.clientId ||
            client?.reference ||
            ""
        );

    }


    function getClientName(client) {

        return (
            client?.fullName ||
            client?.full_name ||
            client?.name ||
            "Unnamed Client"
        );

    }


    function getTransactionId(transaction) {

        return (
            transaction?.id ||
            transaction?.transactionId ||
            transaction?.enquiry_reference ||
            transaction?.reference ||
            ""
        );

    }


    function getTransactionTitle(transaction) {

        return (
            transaction?.title ||
            transaction?.transactionTitle ||
            (
                Array.isArray(transaction?.services)
                    ? transaction.services.join(" + ")
                    : transaction?.service
            ) ||
            "Journey"
        );

    }


    /* =====================================================
       PAYMENT DATA
    ===================================================== */

    function getPaymentData() {

        if (
            window.LORDBLESS_PAYMENT_BRIDGE &&
            typeof window.LORDBLESS_PAYMENT_BRIDGE.load ===
                "function"
        ) {

            return window.LORDBLESS_PAYMENT_BRIDGE.load();

        }


        return {

            paymentRequests: [],
            paymentRecords: [],
            invoices: [],
            receipts: []

        };

    }


    function getPaymentRequests() {

        const data =
            getPaymentData();

        return Array.isArray(
            data.paymentRequests
        )
            ? data.paymentRequests
            : [];

    }


    function getPaymentRecords() {

        const data =
            getPaymentData();

        return Array.isArray(
            data.paymentRecords
        )
            ? data.paymentRecords
            : [];

    }


    function getInvoices() {

        const data =
            getPaymentData();

        return Array.isArray(
            data.invoices
        )
            ? data.invoices
            : [];

    }


    function getReceipts() {

        const data =
            getPaymentData();

        return Array.isArray(
            data.receipts
        )
            ? data.receipts
            : [];

    }


    /* =====================================================
       CLIENT PAYMENT CALCULATION
    ===================================================== */

    function getClientPaymentRequests(
        clientId,
        transactionId = null
    ) {

        return getPaymentRequests()
            .filter(request => {

                if (
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

            });

    }


    function getClientPaymentRecords(
        clientId,
        transactionId = null
    ) {

        return getPaymentRecords()
            .filter(record => {

                if (
                    record.clientId !==
                    clientId
                ) {
                    return false;
                }

                if (
                    transactionId &&
                    record.transactionId !==
                    transactionId
                ) {
                    return false;
                }

                return true;

            });

    }


    function getClientInvoices(
        clientId,
        transactionId = null
    ) {

        return getInvoices()
            .filter(invoice => {

                if (
                    invoice.clientId !==
                    clientId
                ) {
                    return false;
                }

                if (
                    transactionId &&
                    invoice.transactionId !==
                    transactionId
                ) {
                    return false;
                }

                return true;

            });

    }


    function getClientReceipts(
        clientId,
        transactionId = null
    ) {

        return getReceipts()
            .filter(receipt => {

                if (
                    receipt.clientId !==
                    clientId
                ) {
                    return false;
                }

                if (
                    transactionId &&
                    receipt.transactionId !==
                    transactionId
                ) {
                    return false;
                }

                return true;

            });

    }


    function getPaidAmount(
        clientId,
        transactionId = null
    ) {

        const records =
            getClientPaymentRecords(
                clientId,
                transactionId
            );


        return records.reduce(
            (
                total,
                record
            ) => {

                const status =
                    String(
                        record.status || ""
                    ).toLowerCase();


                if (
                    status === "paid" ||
                    status === "verified" ||
                    status === "completed"
                ) {

                    return total +
                        (
                            Number(
                                record.amount
                            ) || 0
                        );

                }


                return total;

            },
            0
        );

    }


    function getRequestedAmount(
        clientId,
        transactionId = null
    ) {

        const requests =
            getClientPaymentRequests(
                clientId,
                transactionId
            );


        return requests.reduce(
            (
                total,
                request
            ) => {

                return total +
                    (
                        Number(
                            request.amount
                        ) || 0
                    );

            },
            0
        );

    }


    function getOutstandingAmount(
        clientId,
        transactionId = null
    ) {

        const requests =
            getClientPaymentRequests(
                clientId,
                transactionId
            );


        const records =
            getClientPaymentRecords(
                clientId,
                transactionId
            );


        const totalRequested =
            requests.reduce(
                (
                    total,
                    request
                ) => {

                    return total +
                        (
                            Number(
                                request.amount
                            ) || 0
                        );

                },
                0
            );


        const totalPaid =
            records.reduce(
                (
                    total,
                    record
                ) => {

                    const status =
                        String(
                            record.status || ""
                        ).toLowerCase();


                    if (
                        status === "paid" ||
                        status === "verified" ||
                        status === "completed"
                    ) {

                        return total +
                            (
                                Number(
                                    record.amount
                                ) || 0
                            );

                    }


                    return total;

                },
                0
            );


        return Math.max(
            0,
            totalRequested -
            totalPaid
        );

    }


    /* =====================================================
       CLIENT COLLECTION
    ===================================================== */

   function buildClientPaymentList(
    clients = []
) {

    return clients
        .map(client => {

            const clientId =
                getClientId(client);

            if (!clientId) {
                return null;
            }

            const requests =
                getClientPaymentRequests(
                    clientId
                );

            const records =
                getClientPaymentRecords(
                    clientId
                );

            const invoices =
                getClientInvoices(
                    clientId
                );

            const receipts =
                getClientReceipts(
                    clientId
                );

            const paid =
                getPaidAmount(
                    clientId
                );

            const requested =
                getRequestedAmount(
                    clientId
                );

            const outstanding =
                getOutstandingAmount(
                    clientId
                );

            return {

                client,

                clientId,

                requests,

                records,

                invoices,

                receipts,

                paid,

                requested,

                outstanding

            };

        })
        .filter(Boolean);

}

    /* =====================================================
       RENDER MAIN PAYMENTS VIEW
    ===================================================== */

    function renderPayments(
        container,
        clients = []
    ) {

        if (!container) {
            return;
        }


        PAYMENT_STATE.clients =
            clients;


        const paymentClients =
            buildClientPaymentList(
                clients
            );


        const totalPaid =
            paymentClients.reduce(
                (
                    total,
                    item
                ) =>
                    total + item.paid,
                0
            );


        const totalOutstanding =
            paymentClients.reduce(
                (
                    total,
                    item
                ) =>
                    total + item.outstanding,
                0
            );


        const pendingRequests =
            paymentClients.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    item.requests.filter(
                        request =>
                            String(
                                request.status ||
                                ""
                            ).toLowerCase() ===
                            "pending"
                    ).length,
                0
            );


        container.innerHTML = `

            <div class="payments-page">

                <div class="page-header">

                    <div>

                        <span class="section-eyebrow">
                            FINANCE
                        </span>

                        <h1>
                            Payments
                        </h1>

                        <p>
                            Manage client payments,
                            outstanding balances and
                            payment requests.
                        </p>

                    </div>

                </div>


                <!-- SUMMARY -->

                <div class="payment-summary-grid">

                    <div class="payment-summary-card">

                        <span>
                            Total Paid
                        </span>

                        <strong>
                            ${formatCurrency(totalPaid)}
                        </strong>

                    </div>


                    <div class="payment-summary-card">

                        <span>
                            Outstanding
                        </span>

                        <strong>
                            ${formatCurrency(
                                totalOutstanding
                            )}
                        </strong>

                    </div>


                    <div class="payment-summary-card">

                        <span>
                            Pending Requests
                        </span>

                        <strong>
                            ${pendingRequests}
                        </strong>

                    </div>

                </div>


                <!-- CLIENT PAYMENT LIST -->

                <div class="payment-client-section">

                    <div class="detail-section-header">

                        <div>

                            <span class="section-eyebrow">
                                CLIENTS
                            </span>

                            <h3>
                                Client Payment Records
                            </h3>

                        </div>

                    </div>


                    <div
                        class="payment-client-list"
                        id="admin-payment-client-list"
                    >

                        ${
                            paymentClients.length
                                ? paymentClients
                                    .map(
                                        renderClientPaymentRow
                                    )
                                    .join("")
                                : `
                                    <div class="empty-state">

                                        No payment
                                        records available.

                                    </div>
                                `
                        }

                    </div>

                </div>


                <!-- CLIENT DETAIL -->

                <div
                    id="admin-payment-detail"
                    class="admin-payment-detail"
                ></div>

            </div>

        `;


        attachPaymentClientRows();

    }


    /* =====================================================
       CLIENT ROW
    ===================================================== */

    function renderClientPaymentRow(
        item
    ) {

        const client =
            item.client;


        return `

            <button
                type="button"
                class="payment-client-row"
                data-client-id="${escapeHtml(
                    item.clientId
                )}"
            >

                <span class="payment-client-main">

                    <strong>
                        ${escapeHtml(
                            getClientName(client)
                        )}
                    </strong>

                    <small>
                        ${escapeHtml(
                            client?.email || ""
                        )}
                    </small>

                </span>


                <span class="payment-client-amount">

                    <small>
                        Paid
                    </small>

                    <strong>
                        ${formatCurrency(
                            item.paid
                        )}
                    </strong>

                </span>


                <span class="payment-client-amount">

                    <small>
                        Outstanding
                    </small>

                    <strong>
                        ${formatCurrency(
                            item.outstanding
                        )}
                    </strong>

                </span>


                <span class="payment-client-arrow">
                    →
                </span>

            </button>

        `;

    }


    /* =====================================================
       ATTACH CLIENT ROWS
    ===================================================== */

    function attachPaymentClientRows() {

        document
            .querySelectorAll(
                ".payment-client-row"
            )
            .forEach(row => {

                row.addEventListener(
                    "click",
                    function () {

                        const clientId =
                            row.dataset.clientId;


                        openClientPayments(
                            clientId
                        );

                    }
                );

            });

    }


    /* =====================================================
       OPEN CLIENT PAYMENTS
    ===================================================== */

    function openClientPayments(
        clientId
    ) {

        const item =
            buildClientPaymentList(
                PAYMENT_STATE.clients
            )
            .find(
                paymentClient =>
                    paymentClient.clientId ===
                    clientId
            );


        if (!item) {
            return;
        }


        PAYMENT_STATE.selectedClient =
            item.client;


        const detail =
            document.getElementById(
                "admin-payment-detail"
            );


        if (!detail) {
            return;
        }


        detail.innerHTML =
            renderClientPaymentDetail(
                item
            );


        attachPaymentActions(
            item
        );

    }


    /* =====================================================
       CLIENT PAYMENT DETAIL
    ===================================================== */

    function renderClientPaymentDetail(
        item
    ) {

        const client =
            item.client;


        const requests =
            item.requests || [];


        const records =
            item.records || [];


        const transactionIds = [

            ...requests.map(
                request =>
                    request.transactionId
            ),

            ...records.map(
                record =>
                    record.transactionId
            )

        ].filter(Boolean);


        const uniqueTransactionIds =
            [...new Set(transactionIds)];


        return `

            <div class="client-payment-detail">

                <div class="client-payment-detail-header">

                    <div>

                        <span class="section-eyebrow">
                            CLIENT PAYMENT PROFILE
                        </span>

                        <h2>
                            ${escapeHtml(
                                getClientName(client)
                            )}
                        </h2>

                        <p>
                            ${escapeHtml(
                                client?.email || ""
                            )}
                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn btn-primary"
                        id="admin-request-payment"
                    >
                        + Request Payment
                    </button>

                </div>


                <div class="payment-detail-summary">

                    <div>

                        <span>
                            Total Requested
                        </span>

                        <strong>
                            ${formatCurrency(
                                item.requested
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Total Paid
                        </span>

                        <strong>
                            ${formatCurrency(
                                item.paid
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Outstanding
                        </span>

                        <strong>
                            ${formatCurrency(
                                item.outstanding
                            )}
                        </strong>

                    </div>

                </div>


                <div class="payment-detail-section">

                    <div class="detail-section-header">

                        <div>

                            <span class="section-eyebrow">
                                REQUESTS
                            </span>

                            <h3>
                                Payment Requests
                            </h3>

                        </div>

                    </div>


                    ${
                        requests.length
                            ? `
                                <div class="payment-history-list">

                                    ${requests
                                        .map(
                                            renderPaymentRequestRow
                                        )
                                        .join("")}

                                </div>
                            `
                            : `
                                <div class="empty-state">

                                    No payment requests
                                    have been created.

                                </div>
                            `
                    }

                </div>


                <div class="payment-detail-section">

                    <div class="detail-section-header">

                        <div>

                            <span class="section-eyebrow">
                                HISTORY
                            </span>

                            <h3>
                                Payments Made
                            </h3>

                        </div>

                    </div>


                    ${
                        records.length
                            ? `
                                <div class="payment-history-list">

                                    ${records
                                        .map(
                                            renderPaymentRecordRow
                                        )
                                        .join("")}

                                </div>
                            `
                            : `
                                <div class="empty-state">

                                    No verified payments
                                    recorded yet.

                                </div>
                            `
                    }

                </div>


                ${
                    uniqueTransactionIds.length
                        ? `
                            <div class="payment-detail-section">

                                <div class="detail-section-header">

                                    <div>

                                        <span class="section-eyebrow">
                                            JOURNEYS
                                        </span>

                                        <h3>
                                            Payment Activity
                                        </h3>

                                    </div>

                                </div>

                                <div>

                                    ${uniqueTransactionIds
                                        .map(
                                            id => `
                                                <div class="payment-transaction-row">

                                                    <span>
                                                        ${escapeHtml(id)}
                                                    </span>

                                                </div>
                                            `
                                        )
                                        .join("")}

                                </div>

                            </div>
                        `
                        : ""
                }

            </div>

        `;

    }


    /* =====================================================
       REQUEST ROW
    ===================================================== */

    function renderPaymentRequestRow(
        request
    ) {

        const status =
            String(
                request.status ||
                "pending"
            );


        return `

            <div class="payment-history-row">

                <div>

                    <strong>
                        ${formatCurrency(
                            request.amount,
                            request.currency ||
                            "EUR"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            request.description ||
                            request.requestType ||
                            "Payment Request"
                        )}
                    </span>

                </div>


                <div>

                    <span class="payment-status">
                        ${escapeHtml(
                            status
                        )}
                    </span>

                    <small>
                        ${escapeHtml(
                            request.reference ||
                            request.id ||
                            ""
                        )}
                    </small>

                </div>

            </div>

        `;

    }


    /* =====================================================
       PAYMENT RECORD ROW
    ===================================================== */

    function renderPaymentRecordRow(
        record
    ) {

        return `

            <div class="payment-history-row">

                <div>

                    <strong>
                        ${formatCurrency(
                            record.amount,
                            record.currency ||
                            "EUR"
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            record.description ||
                            record.paymentMethod ||
                            "Payment"
                        )}
                    </span>

                </div>


                <div>

                    <span class="payment-status">
                        ${escapeHtml(
                            record.status ||
                            "Paid"
                        )}
                    </span>

                    <small>
                        ${escapeHtml(
                            record.paidAt ||
                            record.createdAt ||
                            ""
                        )}
                    </small>

                </div>

            </div>

        `;

    }


    /* =====================================================
       PAYMENT ACTIONS
    ===================================================== */

    function attachPaymentActions(
        item
    ) {

        const button =
            document.getElementById(
                "admin-request-payment"
            );


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            function () {

                openPaymentRequest(
                    item
                );

            }
        );

    }


    /* =====================================================
       OPEN PAYMENT REQUEST
    ===================================================== */

    function openPaymentRequest(
        item
    ) {

        const client =
            item.client;


        const clientId =
            getClientId(client);


        const requests =
            item.requests || [];


        const transactionId =
            requests[0]?.transactionId ||
            client?.currentTransactionId ||
            client?.transactionId ||
            null;


        const transaction = {

            id:
                transactionId ||
                `CLIENT-${clientId}`,

            title:
                client?.currentTransactionTitle ||
                "Client Payment",

            destination:
                client?.destination ||
                "",

            service:
                client?.service ||
                null,

            services:
                Array.isArray(client?.services)
                    ? client.services
                    : []

        };


        const container =
            document.getElementById(
                "admin-payment-detail"
            );


        if (
            !container
        ) {
            return;
        }


        const requestContainer =
            document.createElement(
                "div"
            );


        requestContainer.id =
            "admin-payment-request-container";


        requestContainer.className =
            "admin-payment-request-container";


        container.appendChild(
            requestContainer
        );


        if (
            window.LORDBLESS_PAYMENT_REQUEST &&
            typeof window
                .LORDBLESS_PAYMENT_REQUEST
                .render ===
                "function"
        ) {

            window.LORDBLESS_PAYMENT_REQUEST.render(

                requestContainer,

                client,

                transaction,

                {
                    currency: "EUR"
                }

            );

            return;

        }


        requestContainer.innerHTML = `

            <div class="empty-state">

                Payment Request engine
                is not available.

            </div>

        `;

    }


    /* =====================================================
       REFRESH
    ===================================================== */

    function refresh() {

    const container =
        PAYMENT_STATE.container;


    if (
        container &&
        PAYMENT_STATE.clients.length
    ) {

        renderPayments(
            container,
            PAYMENT_STATE.clients
        );

    }

}

    /* =====================================================
       PAYMENT DATA UPDATE LISTENER
    ===================================================== */

    document.addEventListener(
        "lordbless:payment-data-updated",
        function () {

            refresh();

        }
    );


    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                "LORDBLESS_PORTAL_DATA_BRIDGE_V1"
            ) {

                refresh();

            }

        }
    );


    /* =====================================================
       GLOBAL API
    ===================================================== */

    window.LORDBLESS_ADMIN_PAYMENTS = {

        state:
            PAYMENT_STATE,

        render:
            renderPayments,

        refresh:

            refresh,

        openClientPayments:

            openClientPayments,

        openPaymentRequest:

            openPaymentRequest,

        getPaymentRequests:

            getPaymentRequests,

        getPaymentRecords:

            getPaymentRecords,

        getClientPaymentRequests:

            getClientPaymentRequests,

        getClientPaymentRecords:

            getClientPaymentRecords,

        getPaidAmount:

            getPaidAmount,

        getOutstandingAmount:

            getOutstandingAmount

    };


})();
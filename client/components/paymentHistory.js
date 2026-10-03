/* ============================================================
   LORDBLESS CONSULTANCY
   CLIENT PAYMENT & RECEIPT HISTORY
   ------------------------------------------------------------
   Frontend-first component.
   Supabase persistence will be connected during integration.
   ============================================================ */

(function () {
    "use strict";

    const CURRENCY_LIST = [
        "EUR",
        "GHS",
        "USD",
        "CAD",
        "GBP",
        "CNY"
    ];

    let state = {
        client: null,
        transactions: [],
        paymentRequests: [],
        payments: [],
        receipts: [],
        activeFilter: "all"
    };


    /* ---------------------------------------------------------
       HELPERS
       --------------------------------------------------------- */

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function formatMoney(amount, currency = "EUR") {
        if (
            amount === null ||
            amount === undefined ||
            amount === ""
        ) {
            return "—";
        }

        const number = Number(amount);

        if (!Number.isFinite(number)) {
            return "—";
        }

        return new Intl.NumberFormat("en", {
            style: "currency",
            currency,
            minimumFractionDigits: 2
        }).format(number);
    }


    function formatDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
    }

    function formatDateTime(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function statusLabel(status) {
        const labels = {
            draft: "Draft",
            sent: "Payment Due",
            viewed: "Payment Due",
            payment_submitted: "Under Review",
            paid: "Paid",
            overdue: "Overdue",
            cancelled: "Cancelled",
            expired: "Expired",
            pending: "Pending",
            confirmed: "Confirmed",
            rejected: "Rejected",
            refunded: "Refunded",
            issued: "Receipt Issued",
            voided: "Voided"
        };

        return labels[status] || status || "Unknown";
    }


    function statusClass(status) {
        return String(status || "")
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");
    }


    function getItems(paymentRequest) {
        if (
            Array.isArray(paymentRequest.items) &&
            paymentRequest.items.length
        ) {
            return paymentRequest.items;
        }

        return [];
    }


    function getPaymentDescription(paymentRequest) {
        const items = getItems(paymentRequest);

        if (!items.length) {
            return paymentRequest.description || "Payment";
        }

        return items
            .map(item => item.name)
            .join(", ");
    }


    function getReceiptForPayment(payment) {
        return state.receipts.find(
            receipt =>
                receipt.paymentId === payment.id ||
                receipt.payment_id === payment.id ||
                receipt.paymentReference === payment.paymentReference ||
                receipt.payment_reference === payment.payment_reference
        );
    }


    /* ---------------------------------------------------------
       FILTER
       --------------------------------------------------------- */

    function filteredPaymentRequests() {

        if (state.activeFilter === "all") {
            return state.paymentRequests;
        }

        if (state.activeFilter === "pending") {
            return state.paymentRequests.filter(request =>
                [
                    "sent",
                    "viewed",
                    "overdue"
                ].includes(request.status)
            );
        }

        if (state.activeFilter === "paid") {
            return state.paymentRequests.filter(request =>
                request.status === "paid"
            );
        }

        return state.paymentRequests;
    }


    /* ---------------------------------------------------------
       RENDER
       --------------------------------------------------------- */

    function render(container, data = {}) {

        if (!container) {
            return;
        }

        state = {
            client: data.client || null,
            transactions: data.transactions || [],
            paymentRequests: data.paymentRequests || [],
            payments: data.payments || [],
            receipts: data.receipts || [],
            activeFilter: "all"
        };

        container.innerHTML = `
            <div class="lbc-client-finance">

                <div class="lbc-client-finance-header">

                    <div>
                        <span class="lbc-client-finance-eyebrow">
                            MY FINANCE
                        </span>

                        <h2>
                            PAYMENTS & RECEIPTS
                        </h2>

                        <p>
                            View your LORDBLESS payment requests,
                            confirmed payments and official receipts.
                        </p>
                    </div>

                </div>


                <!-- SUMMARY -->

                <div class="lbc-client-finance-summary">

                    <div class="lbc-client-finance-stat">

                        <span>
                            PAYMENT REQUESTS
                        </span>

                        <strong>
                            ${state.paymentRequests.length}
                        </strong>

                    </div>


                    <div class="lbc-client-finance-stat">

                        <span>
                            CONFIRMED PAYMENTS
                        </span>

                        <strong>
                            ${
                                state.payments.filter(
                                    payment =>
                                        payment.status === "confirmed"
                                ).length
                            }
                        </strong>

                    </div>


                    <div class="lbc-client-finance-stat">

                        <span>
                            RECEIPTS
                        </span>

                        <strong>
                            ${state.receipts.length}
                        </strong>

                    </div>

                </div>


                <!-- PAYMENT REQUESTS -->

                <section class="lbc-client-finance-section">

                    <div class="lbc-client-finance-section-header">

                        <div>
                            <h3>
                                PAYMENT REQUESTS
                            </h3>

                            <p>
                                Payment requests issued by
                                LORDBLESS CONSULTANCY.
                            </p>
                        </div>


                        <div class="lbc-client-finance-tabs">

                            <button
                                type="button"
                                data-filter="all"
                                class="active"
                            >
                                ALL
                            </button>

                            <button
                                type="button"
                                data-filter="pending"
                            >
                                DUE
                            </button>

                            <button
                                type="button"
                                data-filter="paid"
                            >
                                PAID
                            </button>

                        </div>

                    </div>


                    <div class="lbc-client-payment-list">

                        ${renderPaymentRequests()}

                    </div>

                </section>


                <!-- PAYMENT HISTORY -->

                <section class="lbc-client-finance-section">

                    <div class="lbc-client-finance-section-header">

                        <div>
                            <h3>
                                PAYMENT HISTORY
                            </h3>

                            <p>
                                Payments verified by the
                                LORDBLESS Finance team.
                            </p>
                        </div>

                    </div>


                    <div class="lbc-client-payment-list">

                        ${renderPayments()}

                    </div>

                </section>


                <!-- RECEIPTS -->

                <section class="lbc-client-finance-section">

                    <div class="lbc-client-finance-section-header">

                        <div>
                            <h3>
                                OFFICIAL RECEIPTS
                            </h3>

                            <p>
                                Your official LORDBLESS payment receipts.
                            </p>
                        </div>

                    </div>


                    <div class="lbc-client-receipt-list">

                        ${renderReceipts()}

                    </div>

                </section>

            </div>
        `;

        bindEvents(container);
    }


    /* ---------------------------------------------------------
       PAYMENT REQUESTS
       --------------------------------------------------------- */

    function renderPaymentRequests() {

        const requests =
            filteredPaymentRequests();

        if (!requests.length) {
            return `
                <div class="lbc-client-finance-empty">
                    No payment requests found.
                </div>
            `;
        }


        return requests.map(request => {

            const amount =
                request.amount ??
                request.total ??
                0;

            const currency =
                request.currency ||
                request.primaryCurrency ||
                "EUR";

            const description =
                getPaymentDescription(request);

            const isPaid =
                request.status === "paid";


            return `
                <article
                    class="lbc-client-payment-card"
                >

                    <div class="lbc-client-payment-main">

                        <div>

                            <span class="lbc-client-payment-label">
                                ${
                                    escapeHtml(
                                        request.invoiceNumber ||
                                        request.invoice_number ||
                                        "PAYMENT REQUEST"
                                    )
                                }
                            </span>

                            <h4>
                                ${escapeHtml(description)}
                            </h4>

                            <p>
                                ${
                                    escapeHtml(
                                        request.enquiryReference ||
                                        request.enquiry_reference ||
                                        ""
                                    )
                                }
                            </p>

                        </div>


                        <div class="lbc-client-payment-amount">

                            <strong>
                                ${formatMoney(
                                    amount,
                                    currency
                                )}
                            </strong>

                            <span
                                class="lbc-client-status
                                ${statusClass(request.status)}"
                            >
                                ${escapeHtml(
                                    statusLabel(request.status)
                                )}
                            </span>

                        </div>

                    </div>


                    <div class="lbc-client-payment-meta">

                        <span>
                            Issued:
                            ${formatDate(
                                request.createdAt ||
                                request.created_at
                            )}
                        </span>

                        ${
                            request.dueDate ||
                            request.due_date
                                ? `
                                    <span>
                                        Due:
                                        ${formatDate(
                                            request.dueDate ||
                                            request.due_date
                                        )}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    ${
                        isPaid
                            ? `
                                <div class="lbc-client-payment-paid">
                                    ✓ Payment confirmed by Finance
                                </div>
                            `
                            : `
                                <div class="lbc-client-payment-instructions">

                                    <strong>
                                        PAYMENT INSTRUCTIONS
                                    </strong>

                                    <p>
                                        Please make payment using
                                        the payment instructions
                                        provided by LORDBLESS CONSULTANCY.
                                        Your payment will be verified
                                        by our Finance team.
                                    </p>

                                </div>
                            `
                    }

                </article>
            `;

        }).join("");
    }


    /* ---------------------------------------------------------
       PAYMENT HISTORY
       --------------------------------------------------------- */

    function renderPayments() {

        if (!state.payments.length) {
            return `
                <div class="lbc-client-finance-empty">
                    No confirmed payments yet.
                </div>
            `;
        }


        return state.payments.map(payment => {

            const receipt =
                getReceiptForPayment(payment);

            const amount =
                payment.amount ||
                payment.total ||
                0;

            const currency =
                payment.currency ||
                "EUR";


            return `
                <article
                    class="lbc-client-payment-card confirmed"
                >

                    <div class="lbc-client-payment-main">

                        <div>

                            <span class="lbc-client-payment-label">
                                PAYMENT
                            </span>

                            <h4>
                                ${
                                    escapeHtml(
                                        payment.description ||
                                        payment.paymentType ||
                                        "LORDBLESS Payment"
                                    )
                                }
                            </h4>

                            <p>
                                ${
                                    escapeHtml(
                                        payment.paymentReference ||
                                        payment.payment_reference ||
                                        ""
                                    )
                                }
                            </p>

                        </div>


                        <div class="lbc-client-payment-amount">

                            <strong>
                                ${formatMoney(
                                    amount,
                                    currency
                                )}
                            </strong>

                            <span class="lbc-client-status confirmed">
                                CONFIRMED
                            </span>

                        </div>

                    </div>


                    <div class="lbc-client-payment-meta">

                        <span>
                            Paid:
                            ${formatDate(
                                payment.confirmedAt ||
                                payment.confirmed_at ||
                                payment.createdAt ||
                                payment.created_at
                            )}
                        </span>


                        <span>
                            ${
                                escapeHtml(
                                    payment.paymentMethod ||
                                    payment.payment_method ||
                                    ""
                                )
                            }
                        </span>

                    </div>


                    ${
                        receipt
                            ? `
                                <div class="lbc-client-payment-actions">

                                    <button
                                        type="button"
                                        class="lbc-client-action-button"
                                        data-action="view-receipt"
                                        data-receipt-id="${escapeHtml(
                                            receipt.id ||
                                            receipt.receiptNumber ||
                                            receipt.receipt_number ||
                                            ""
                                        )}"
                                    >
                                        VIEW RECEIPT
                                    </button>

                                </div>
                            `
                            : ""
                    }

                </article>
            `;

        }).join("");
    }

       /* ---------------------------------------------------------
       RECEIPTS
       --------------------------------------------------------- */

    function renderReceipts() {

        if (!state.receipts.length) {
            return `
                <div class="lbc-client-finance-empty">
                    No official receipts available yet.
                </div>
            `;
        }


        return state.receipts.map(receipt => {

            const amount =
                receipt.amount ??
                receipt.totalPaid ??
                receipt.total_paid ??
                0;


            const currency =
                receipt.currency ||
                "EUR";


            const receiptId =
                receipt.id ||
                receipt.receiptNumber ||
                receipt.receipt_number ||
                "";


            return `
                <article
                    class="lbc-client-receipt-card"
                    data-receipt-card="true"
                >

                    <div>

                        <span>
                            OFFICIAL RECEIPT
                        </span>

                        <h4>
                            ${
                                escapeHtml(
                                    receipt.receiptNumber ||
                                    receipt.receipt_number ||
                                    ""
                                )
                            }
                        </h4>

                        <p>
                            ${
                                escapeHtml(
                                    receipt.serviceDescription ||
                                    receipt.service_description ||
                                    "LORDBLESS CONSULTANCY"
                                )
                            }
                        </p>

                    </div>


                    <div class="lbc-client-receipt-right">

                        <strong>
                            ${formatMoney(
                                amount,
                                currency
                            )}
                        </strong>

                        <small>
                            ${formatDate(
                                receipt.issuedAt ||
                                receipt.issued_at
                            )}
                        </small>

                    </div>


                    <!-- RECEIPT ACTIONS -->

                    <div
                        class="lbc-client-receipt-actions"
                        style="
                            display:flex !important;
                            align-items:center !important;
                            justify-content:flex-end !important;
                            gap:10px !important;
                            width:100% !important;
                            margin-top:16px !important;
                            padding-top:14px !important;
                            border-top:1px solid #e8ebf0 !important;
                            visibility:visible !important;
                            opacity:1 !important;
                        "
                    >

                        <button
                            type="button"
                            class="lbc-client-action-button"
                            data-action="view-receipt"
                            data-receipt-id="${escapeHtml(
                                receiptId
                            )}"
                            style="
                                display:inline-flex !important;
                                align-items:center !important;
                                justify-content:center !important;
                                min-width:128px !important;
                                padding:9px 15px !important;
                                border:1px solid #17233b !important;
                                border-radius:8px !important;
                                background:#17233b !important;
                                color:#ffffff !important;
                                font-size:11px !important;
                                font-weight:800 !important;
                                letter-spacing:.04em !important;
                                cursor:pointer !important;
                                visibility:visible !important;
                                opacity:1 !important;
                            "
                        >
                            VIEW RECEIPT
                        </button>


                        <button
                            type="button"
                            class="lbc-client-action-button secondary"
                            data-action="download-receipt"
                            data-receipt-id="${escapeHtml(
                                receiptId
                            )}"
                            style="
                                display:inline-flex !important;
                                align-items:center !important;
                                justify-content:center !important;
                                min-width:110px !important;
                                padding:9px 15px !important;
                                border:1px solid #d8dde5 !important;
                                border-radius:8px !important;
                                background:#ffffff !important;
                                color:#344054 !important;
                                font-size:11px !important;
                                font-weight:800 !important;
                                letter-spacing:.04em !important;
                                cursor:pointer !important;
                                visibility:visible !important;
                                opacity:1 !important;
                            "
                        >
                            DOWNLOAD
                        </button>

                    </div>

                </article>
            `;

        }).join("");
    }

    /* ---------------------------------------------------------
       EVENTS
       --------------------------------------------------------- */

           container
            .querySelectorAll("[data-action]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();


                        const action =
                            this.dataset.action;


                        const receiptId =
                            this.dataset.receiptId;


                        if (
                            action === "view-receipt"
                        ) {

                            viewReceipt(
                                receiptId
                            );

                        }


                        if (
                            action === "download-receipt"
                        ) {

                            downloadReceipt(
                                receiptId
                            );

                        }

                    }
                );

            });

    /* ---------------------------------------------------------
       VIEW RECEIPT
       --------------------------------------------------------- */

    function viewReceipt(receiptId) {

        const receipt =
            state.receipts.find(
                item =>
                    String(
                        item.id ||
                        item.receiptNumber ||
                        item.receipt_number
                    ) === String(receiptId)
            );

        if (!receipt) {
            showMessage(
                "Receipt could not be found.",
                true
            );

            return;
        }


        /*
         * Preserve the existing event for any future
         * listeners without depending on another viewer.
         */
        document.dispatchEvent(
            new CustomEvent(
                "lordbless:view-receipt",
                {
                    detail: receipt
                }
            )
        );


        openReceiptViewer(
            receipt
        );
    }


    /* ---------------------------------------------------------
       RECEIPT VIEWER
       --------------------------------------------------------- */

    function openReceiptViewer(
        receipt
    ) {

        if (!receipt) {
            return;
        }


        const existing =
            document.querySelector(
                ".lbc-client-receipt-viewer"
            );

        if (existing) {
            existing.remove();
        }


        const receiptNumber =
            receipt.receiptNumber ||
            receipt.receipt_number ||
            "Official Receipt";


        const amount =
            receipt.amount ??
            receipt.totalPaid ??
            receipt.total_paid ??
            0;


        const currency =
            receipt.currency ||
            "EUR";


        const status =
            String(
                receipt.status ||
                "issued"
            ).toLowerCase();


        const isVoid =
            status === "void" ||
            status === "voided";


        const clientName =
            receipt.clientName ||
            receipt.client_name ||
            state.client?.name ||
            state.client?.fullName ||
            "—";


        const clientId =
            receipt.clientId ||
            receipt.client_id ||
            state.client?.id ||
            state.client?.clientId ||
            "—";


        const journey =
            receipt.transactionTitle ||
            receipt.transaction_title ||
            receipt.service ||
            "—";


        const destination =
            receipt.destination ||
            "—";


        const paymentDate =
            receipt.paymentDate ||
            receipt.payment_date ||
            receipt.paidAt ||
            receipt.paid_at ||
            receipt.issuedAt ||
            receipt.issued_at ||
            null;


        const paymentMethod =
            receipt.paymentMethod ||
            receipt.payment_method ||
            (
                receipt.verification &&
                (
                    receipt.verification.method ||
                    receipt.verification.paymentMethod
                )
            ) ||
            "—";


        const paymentReference =
            receipt.paymentReference ||
            receipt.payment_reference ||
            receipt.transactionReference ||
            receipt.transaction_reference ||
            "—";


        const description =
            receipt.description ||
            receipt.serviceDescription ||
            receipt.service_description ||
            receipt.service ||
            "Payment received";


        const issuedAt =
            receipt.issuedAt ||
            receipt.issued_at ||
            receipt.createdAt ||
            receipt.created_at ||
            null;


        const overlay =
            document.createElement(
                "div"
            );

        overlay.className =
            "lbc-client-receipt-viewer";


        overlay.innerHTML = `

            <div
                class="lbc-client-receipt-viewer-backdrop"
                data-receipt-close
            ></div>


            <section
                class="lbc-client-receipt-viewer-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="lbc-client-receipt-title"
            >

                <div
                    class="lbc-client-receipt-viewer-header"
                >

                    <div>

                        <span
                            class="lbc-client-receipt-viewer-eyebrow"
                        >
                            OFFICIAL RECEIPT
                        </span>

                        <h2
                            id="lbc-client-receipt-title"
                        >
                            ${escapeHtml(
                                receiptNumber
                            )}
                        </h2>

                    </div>


                    <button
                        type="button"
                        class="lbc-client-receipt-viewer-close"
                        aria-label="Close receipt"
                        data-receipt-close
                    >
                        ×
                    </button>

                </div>


                <div
                    class="lbc-client-receipt-document"
                >

                    <div
                        class="lbc-client-receipt-document-header"
                    >

                        <div
                            class="lbc-client-receipt-brand"
                        >

                            <img
                                src="../images/service-images/lordbless-header-logo.png"
                                alt="LORDBLESS CONSULTANCY"
                                class="lbc-client-receipt-logo"
                            >

                            <div>

                                <strong>
                                    LORDBLESS CONSULTANCY
                                </strong>

                            </div>

                        </div>


                        <div
                            class="lbc-client-receipt-document-meta"
                        >

                            <span>
                                RECEIPT NO.
                            </span>

                            <strong>
                                ${escapeHtml(
                                    receiptNumber
                                )}
                            </strong>

                            <small>
                                Issued
                                ${escapeHtml(
                                    formatDateTime(
                                        issuedAt
                                    )
                                )}
                            </small>

                        </div>

                    </div>


                    <div
                        class="lbc-client-receipt-details"
                    >

                        <div
                            class="lbc-client-receipt-detail-section-title"
                        >
                            PAYMENT DETAILS
                        </div>


                        <div
                            class="lbc-client-receipt-grid"
                        >

                            <div>
                                <span>
                                    Client
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        clientName
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Client ID
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        clientId
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Journey
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        journey
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Destination
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        destination
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Payment Date
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        formatDate(
                                            paymentDate
                                        )
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Payment Method
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        paymentMethod
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Payment Reference
                                </span>

                                <strong>
                                    ${escapeHtml(
                                        paymentReference
                                    )}
                                </strong>
                            </div>

                        </div>

                    </div>


                    <div
                        class="lbc-client-receipt-amount-panel"
                    >

                        <div>

                            <span>
                                AMOUNT PAID
                            </span>

                            <strong>
                                ${escapeHtml(
                                    formatMoney(
                                        amount,
                                        currency
                                    )
                                )}
                            </strong>

                        </div>


                        <span
                            class="
                                lbc-client-receipt-paid-badge
                                ${isVoid ? "is-void" : ""}
                            "
                        >
                            ${isVoid ? "VOID" : "PAID"}
                        </span>

                    </div>


                    <div
                        class="lbc-client-receipt-description"
                    >

                        <div
                            class="lbc-client-receipt-detail-section-title"
                        >
                            DESCRIPTION
                        </div>

                        <p>
                            ${escapeHtml(
                                description
                            )}
                        </p>

                    </div>


                    <div
                        class="lbc-client-receipt-authentication"
                    >

                        <strong>
                            ${
                                isVoid
                                    ? "Receipt voided"
                                    : "Payment received"
                            }
                        </strong>

                        <span>
                            ${
                                isVoid
                                    ? "This receipt is no longer valid as a record of payment."
                                    : "Payment received and recorded by LORDBLESS CONSULTANCY."
                            }
                        </span>

                    </div>


                    <div
                        class="lbc-client-receipt-electronic-note"
                    >
                        This receipt was electronically generated.
                        No physical signature is required.
                    </div>

                </div>

            </section>

        `;


        const styleId =
            "lbc-client-receipt-viewer-styles";


        if (
            !document.getElementById(
                styleId
            )
        ) {

            const style =
                document.createElement(
                    "style"
                );

            style.id =
                styleId;


            style.textContent = `

.lbc-client-receipt-viewer {
    position: fixed;
    inset: 0;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px;
    box-sizing: border-box;
}


.lbc-client-receipt-viewer-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(15, 23, 42, .62);
    backdrop-filter: blur(4px);
}


.lbc-client-receipt-viewer-modal {
    position: relative;
    z-index: 1;
    width: min(920px, 100%);
    max-height: calc(100vh - 56px);
    overflow: auto;
    border-radius: 18px;
    background: #f7f8fa;
    box-shadow: 0 24px 70px rgba(15, 23, 42, .25);
    font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}


.lbc-client-receipt-viewer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 24px;
    background: #17233b;
    color: #ffffff;
}


.lbc-client-receipt-viewer-eyebrow {
    display: block;
    margin-bottom: 5px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .16em;
    opacity: .72;
}


.lbc-client-receipt-viewer-header h2 {
    margin: 0;
    font-size: 19px;
    line-height: 1.25;
    font-weight: 800;
}


.lbc-client-receipt-viewer-close {
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 10px;
    background: rgba(255,255,255,.10);
    color: #ffffff;
    font-size: 24px;
    cursor: pointer;
}


.lbc-client-receipt-document {
    margin: 22px;
    overflow: hidden;
    border: 1px solid #e4e7ec;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: 0 10px 28px rgba(15,23,42,.08);
}


.lbc-client-receipt-document-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 26px;
    padding: 30px 34px;
    border-bottom: 1px solid #e8ebf0;
}


.lbc-client-receipt-brand {
    display: flex;
    align-items: center;
    gap: 14px;
}


.lbc-client-receipt-logo {
    display: block;
    width: 72px;
    height: auto;
    object-fit: contain;
}


.lbc-client-receipt-brand strong {
    color: #17233b;
    font-size: 19px;
    letter-spacing: .01em;
}


.lbc-client-receipt-document-meta {
    text-align: right;
}


.lbc-client-receipt-document-meta span {
    display: block;
    margin-bottom: 5px;
    color: #9a7421;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .13em;
}


.lbc-client-receipt-document-meta strong {
    display: block;
    color: #17233b;
    font-size: 15px;
}


.lbc-client-receipt-document-meta small {
    display: block;
    margin-top: 5px;
    color: #7b8493;
    font-size: 11px;
}


.lbc-client-receipt-details,
.lbc-client-receipt-description {
    padding: 24px 34px;
    border-bottom: 1px solid #e8ebf0;
}


.lbc-client-receipt-detail-section-title {
    margin-bottom: 16px;
    color: #717b8c;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .13em;
}


.lbc-client-receipt-grid {
    display: grid;
    grid-template-columns:
        repeat(2, minmax(0, 1fr));
    gap: 0 34px;
}


.lbc-client-receipt-grid > div {
    min-width: 0;
    padding: 12px 0;
    border-top: 1px solid #eef0f3;
}


.lbc-client-receipt-grid > div:nth-child(-n+2) {
    border-top: 0;
    padding-top: 0;
}


.lbc-client-receipt-grid span {
    display: block;
    margin-bottom: 4px;
    color: #8a93a3;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .07em;
}


.lbc-client-receipt-grid strong {
    display: block;
    color: #26344d;
    font-size: 13px;
    line-height: 1.45;
    overflow-wrap: anywhere;
}


.lbc-client-receipt-amount-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin: 24px 34px;
    padding: 20px 22px;
    border: 1px solid #e8dfcf;
    border-radius: 13px;
    background: #fbf8f1;
}


.lbc-client-receipt-amount-panel span:first-child {
    display: block;
    margin-bottom: 4px;
    color: #7d6a43;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .13em;
}


.lbc-client-receipt-amount-panel strong {
    display: block;
    color: #17233b;
    font-size: 27px;
    line-height: 1.15;
}


.lbc-client-receipt-paid-badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 12px;
    border: 1px solid #cfe0d2;
    border-radius: 999px;
    background: #f2f8f3;
    color: #285c35;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .10em;
}


.lbc-client-receipt-paid-badge:before {
    content: "✓";
    font-size: 12px;
}


.lbc-client-receipt-paid-badge.is-void {
    border-color: #ead4d4;
    background: #fff5f5;
    color: #8a3030;
}


.lbc-client-receipt-paid-badge.is-void:before {
    content: "!";
}


.lbc-client-receipt-description p {
    margin: 0;
    color: #344054;
    font-size: 13px;
    line-height: 1.6;
}


.lbc-client-receipt-authentication {
    padding: 20px 34px;
    border-bottom: 1px solid #e8ebf0;
}


.lbc-client-receipt-authentication strong {
    display: block;
    margin-bottom: 4px;
    color: #26344d;
    font-size: 13px;
}


.lbc-client-receipt-authentication span {
    display: block;
    color: #667085;
    font-size: 11px;
    line-height: 1.55;
}


.lbc-client-receipt-electronic-note {
    padding: 17px 34px 22px;
    color: #8a93a3;
    font-size: 10px;
    line-height: 1.5;
    text-align: center;
}


@media (max-width: 680px) {

    .lbc-client-receipt-viewer {
        padding: 0;
    }


    .lbc-client-receipt-viewer-modal {
        width: 100%;
        max-height: 100vh;
        height: 100vh;
        border-radius: 0;
    }


    .lbc-client-receipt-document {
        margin: 12px;
    }


    .lbc-client-receipt-document-header {
        flex-direction: column;
        padding: 24px;
    }


    .lbc-client-receipt-document-meta {
        width: 100%;
        text-align: left;
    }


    .lbc-client-receipt-details,
    .lbc-client-receipt-description {
        padding: 22px 24px;
    }


    .lbc-client-receipt-grid {
        grid-template-columns: 1fr;
    }


    .lbc-client-receipt-grid > div:nth-child(2) {
        border-top: 1px solid #eef0f3;
        padding-top: 12px;
    }


    .lbc-client-receipt-amount-panel {
        margin: 20px 24px;
        align-items: flex-start;
        flex-direction: column;
    }


    .lbc-client-receipt-authentication,
    .lbc-client-receipt-electronic-note {
        padding-left: 24px;
        padding-right: 24px;
    }

}
`;


            document.head.appendChild(
                style
            );
        }


        document.body.appendChild(
            overlay
        );


        const closeViewer =
            function () {

                const activeViewer =
                    document.querySelector(
                        ".lbc-client-receipt-viewer"
                    );

                if (activeViewer) {
                    activeViewer.remove();
                }
            };


        overlay
            .querySelectorAll(
                "[data-receipt-close]"
            )
            .forEach(
                element =>
                    element.addEventListener(
                        "click",
                        closeViewer
                    )
            );


        overlay.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Escape") {
                    closeViewer();
                }

            }
        );


        setTimeout(
            function () {

                const closeButton =
                    overlay.querySelector(
                        ".lbc-client-receipt-viewer-close"
                    );

                if (closeButton) {
                    closeButton.focus();
                }

            },
            
        );

    }

    /* ---------------------------------------------------------
       DOWNLOAD
       --------------------------------------------------------- */

    function downloadReceipt(receiptId) {

        const receipt =
            state.receipts.find(
                item =>
                    String(
                        item.id ||
                        item.receiptNumber ||
                        item.receipt_number
                    ) === String(receiptId)
            );

        if (!receipt) {
            showMessage(
                "Receipt could not be found.",
                true
            );

            return;
        }


        document.dispatchEvent(
            new CustomEvent(
                "lordbless:download-receipt",
                {
                    detail: receipt
                }
            )
        );


        showMessage(
            "Receipt download will be available when PDF storage is connected."
        );
    }


    /* ---------------------------------------------------------
       MESSAGE
       --------------------------------------------------------- */

    function showMessage(
        message,
        isError = false
    ) {

        const existing =
            document.querySelector(
                ".lbc-client-finance-toast"
            );

        if (existing) {
            existing.remove();
        }


        const toast =
            document.createElement("div");

        toast.className =
            `lbc-client-finance-toast ${
                isError ? "error" : "success"
            }`;

        toast.textContent =
            message;

        document.body.appendChild(toast);


        setTimeout(() => {
            toast.remove();
        }, 4000);
    }


    /* ---------------------------------------------------------
       PUBLIC API
       --------------------------------------------------------- */

    window.LORDBLESS_CLIENT_PAYMENT_HISTORY = {

        render,

        getState: function () {
            return {
                ...state
            };
        },

        setData: function (data) {

            state = {
                ...state,
                ...data
            };

            if (state.container) {
                render(
                    state.container,
                    state
                );
            }

        }

    };

})();
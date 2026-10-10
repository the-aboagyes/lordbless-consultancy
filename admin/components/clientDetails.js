/* =========================================
   LORDBLESS ADMIN CLIENT DETAILS
========================================= */

(function () {
    function escapeClientDetails(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function textValue(value) {
        if (Array.isArray(value)) {
            return value.map(textValue).filter(Boolean).join(", ");
        }
        if (value === null || value === undefined || typeof value === "object") {
            return "";
        }
        return String(value).trim();
    }

    function labelFor(key) {
        return String(key)
            .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, character => character.toUpperCase());
    }

    function clientDisplayId(client) {
        const permanentId = client?.clientCode || client?.client_code;
        if (permanentId) return permanentId;

        const internalId = String(client?.id || "").trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            .test(internalId);

        return isUuid ? "ID pending" : internalId || "ID pending";
    }

    function detailRows(values) {
        return Object.entries(values || {})
            .map(([key, value]) => ({ key, value: textValue(value) }))
            .filter(item => item.value)
            .map(item => `
                <div class="detail-row">
                    <span>${escapeClientDetails(labelFor(item.key))}</span>
                    <strong>${escapeClientDetails(item.value)}</strong>
                </div>
            `)
            .join("");
    }

    function serviceSections(enquiry) {
        const serviceValues = Array.isArray(enquiry.services)
            ? enquiry.services
            : enquiry.services ? [enquiry.services]
                : enquiry.service ? [enquiry.service] : [];
        const requested = serviceValues.map(value => textValue(value).toLowerCase());
        const sections = [
            { key: "education", title: "Education", matches: ["education", "study", "university"] },
            { key: "careers", title: "Careers and Work", matches: ["career", "work", "job"] },
            { key: "travel", title: "Travel", matches: ["travel", "tourism", "business travel"] },
            { key: "business", title: "Business", matches: ["business", "trade"] },
            { key: "mobility", title: "Global Mobility", matches: ["mobility", "settlement", "migration"] },
            { key: "general", title: "General Request", matches: ["general", "other"] }
        ];
        const relevant = sections.filter(section =>
            requested.some(service => section.matches.some(match => service.includes(match)))
        );
        const selectedSections = relevant.length
            ? relevant
            : sections.filter(section => detailRows(enquiry[section.key] || ""));

        return selectedSections.map(section => {
            const rows = detailRows(enquiry[section.key]);
            return rows ? `
                <section class="detail-card full-width">
                    <h3>${escapeClientDetails(section.title)} Details</h3>
                    ${rows}
                </section>
            ` : "";
        }).join("");
    }

    function accessStatus(portalState) {
        if (portalState.loading) return "Checking portal account…";
        if (portalState.error) return "Unable to verify";
        if (!portalState.account) return "Not Created";

        const status = String(portalState.account.access_status || "").trim();
        if (!status) return "Status unavailable";
        return status.replaceAll("_", " ").replace(/\b\w/g, character => character.toUpperCase());
    }

    function renderPortalAccess(portalState, clientId) {
        const status = accessStatus(portalState);
        const canCreate = Boolean(
            !portalState.loading &&
            !portalState.error &&
            !portalState.account &&
            portalState.canCreate &&
            clientId
        );
        const canResendInvitation = Boolean(
            !portalState.loading &&
            !portalState.error &&
            portalState.account?.access_status === "invited" &&
            portalState.canResend &&
            clientId
        );

        return `
            <section class="detail-card full-width" aria-labelledby="client-portal-access-title">
                <h3 id="client-portal-access-title">Portal Access</h3>
                <div class="detail-row">
                    <span>Portal Account</span>
                    <strong>${escapeClientDetails(status)}</strong>
                </div>
                ${portalState.error
                    ? `<p class="client-portal-access-message" role="alert">${escapeClientDetails(portalState.error)}</p>`
                    : ""}
                ${portalState.message
                    ? `<p class="client-portal-access-message" role="status">${escapeClientDetails(portalState.message)}</p>`
                    : ""}
                ${canCreate ? `
                    <button
                        type="button"
                        class="button button-primary"
                        data-client-portal-action="create"
                        data-client-id="${escapeClientDetails(clientId)}"
                    >
                        CREATE PORTAL ACCESS
                    </button>
                    <p data-client-portal-message class="client-portal-access-message" role="status" aria-live="polite"></p>
                ` : ""}
                ${canResendInvitation ? `
                    <button
                        type="button"
                        class="button button-primary"
                        data-client-portal-action="resend-invitation"
                        data-client-id="${escapeClientDetails(clientId)}"
                    >
                        RESEND INVITATION
                    </button>
                    <p data-client-portal-message class="client-portal-access-message" role="status" aria-live="polite"></p>
                ` : ""}
                ${!portalState.loading && !portalState.error && !portalState.account && !portalState.canCreate
                    ? `<p>Portal access can only be created by an administrator with the required permission.</p>`
                    : ""}
            </section>
        `;
    }

    function renderEnquiry(container, model) {
        const enquiry = model.enquiry || {};
        const client = { ...(enquiry.client || {}), ...(model.client || {}) };
        const journey = enquiry.journey && typeof enquiry.journey === "object"
            ? enquiry.journey
            : {};
        const travel = enquiry.travel && typeof enquiry.travel === "object"
            ? enquiry.travel
            : {};
        const clientName = client.fullName || client.full_name || enquiry.client_name || enquiry.full_name;
        const destination = journey.destination || enquiry.destination || travel.destination;
        const timeframe = journey.timeframe || journey.travelDates || journey.travel_dates ||
            enquiry.timeframe || enquiry.travel_dates || enquiry.travelDates || travel.travelPeriod;
        const preferredContact = journey.preferredContact || journey.preferred_contact ||
            enquiry.preferredContact || enquiry.preferred_contact;
        const additionalInformation = journey.additionalInformation || journey.additional_information ||
            enquiry.additionalInformation || enquiry.additional_information ||
            enquiry.general?.additionalInformation;
        const services = Array.isArray(enquiry.services)
            ? enquiry.services
            : enquiry.services ? [enquiry.services]
                : enquiry.service ? [enquiry.service] : [];
        const submitted = enquiry.createdAt || enquiry.created_at || enquiry.submitted_at ||
            enquiry.submittedAt || "";
        const portalState = model.portalState || model;

        container.innerHTML = `
            <div class="enquiry-detail-page client-enquiry-view">
                <div class="detail-page-header">
                    <div>
                        <div class="topbar-label">CLIENT DETAILS</div>
                        <h2>${escapeClientDetails(clientName || "Client")}</h2>
                        <p>${escapeClientDetails(enquiry.reference || enquiry.enquiry_reference || enquiry.id || "Enquiry")}</p>
                    </div>
                    <button type="button" class="button button-secondary" data-close-client-details>
                        BACK TO ENQUIRIES
                    </button>
                </div>

                <div class="detail-grid">
                    <section class="detail-card">
                        <h3>Client Information</h3>
                        ${detailRows({
                            "Client ID": clientDisplayId(client),
                            "Full name": clientName,
                            Email: client.email || enquiry.client_email || enquiry.email,
                            WhatsApp: client.whatsapp || client.phone || enquiry.client_whatsapp || enquiry.whatsapp,
                            "Current country": client.currentCountry || client.current_country || enquiry.current_country,
                            Nationality: client.nationality || enquiry.nationality
                        }) || `<p>Client information has not been provided.</p>`}
                    </section>

                    <section class="detail-card">
                        <h3>Enquiry Information</h3>
                        ${detailRows({
                            "Enquiry reference": enquiry.reference || enquiry.enquiry_reference || enquiry.id,
                            "Submission date": submitted,
                            Status: enquiry.status,
                            "Services requested": services,
                            Destination: destination,
                            "Timeframe / travel dates": timeframe,
                            "Preferred contact": preferredContact,
                            Purpose: enquiry.purpose || travel.purpose || enquiry.business?.purpose
                        }) || `<p>Enquiry details have not been provided.</p>`}
                    </section>

                    ${serviceSections(enquiry)}

                    <section class="detail-card full-width">
                        <h3>Additional Information</h3>
                        <p>${escapeClientDetails(textValue(additionalInformation) || "Not provided")}</p>
                    </section>

                    ${renderPortalAccess(portalState, model.clientId)}
                </div>
            </div>
        `;

        container.querySelector("[data-close-client-details]")?.addEventListener("click", () => {
            document.getElementById("enquiry-modal")?.classList.add("hidden");
        });
    }

    window.LORDBLESS_CLIENT_DETAILS = window.LORDBLESS_CLIENT_DETAILS || {};
    window.LORDBLESS_CLIENT_DETAILS.renderEnquiry = renderEnquiry;
})();

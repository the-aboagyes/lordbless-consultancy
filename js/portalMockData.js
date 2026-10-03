/* ============================================================
   LORDBLESS CONSULTANCY
   SHARED PORTAL MOCK DATA
   ============================================================

   PURPOSE
   -------
   Shared local/mock reference data for:

   ADMIN PORTAL
        ↕
   CLIENT PORTAL

   This file is temporary development infrastructure.

   It will later be replaced by Supabase data access.

   IMPORTANT ARCHITECTURE
   ----------------------
   • One permanent client account.
   • A client may have multiple journeys.
   • Client ID is permanent.
   • Journey / transaction IDs are separate references.
   • Document requests are NOT stored here.
   • Permanent documents are NOT stored here.
   • Payments are NOT stored here.

   Those operational records are handled separately by:
       portalDataBridge.js

   IMPORTANT
   ---------
   This file does NOT decide which client is currently logged in.

   The Client Portal must provide the client ID.

   In production, the client ID will come from Supabase Auth.
   ============================================================ */


/* ============================================================
   SHARED CLIENT DATA
   ============================================================ */

const LORDBLESS_PORTAL_MOCK_CLIENTS = [

    {
        id: "LBC-CLIENT-0001",
        name: "KWAME MENSAH",
        fullName: "KWAME MENSAH",
        email: "kwame@example.com"
    },

    {
        id: "LBC-CLIENT-0002",
        name: "AMA BOATENG",
        fullName: "AMA BOATENG",
        email: "ama@example.com"
    },

    {
        id: "LBC-CLIENT-0003",
        name: "JOHN SMITH",
        fullName: "JOHN SMITH",
        email: "john@example.com"
    },

    {
        id: "LBC-CLIENT-0004",
        name: "ABENA MENSAH",
        fullName: "ABENA MENSAH",
        email: "abena@example.com"
    },

    {
        id: "LBC-CLIENT-0005",
        name: "DANIEL OWUSU",
        fullName: "DANIEL OWUSU",
        email: "daniel@example.com"
    },

    {
        id: "LBC-CLIENT-0006",
        name: "AKOSUA ADJEI",
        fullName: "AKOSUA ADJEI",
        email: "akosua@example.com"
    },

    {
        id: "LBC-CLIENT-0007",
        name: "MICHAEL ASANTE",
        fullName: "MICHAEL ASANTE",
        email: "michael@example.com"
    },

    {
        id: "LBC-CLIENT-0008",
        name: "GRACE OSEI",
        fullName: "GRACE OSEI",
        email: "grace@example.com"
    },

    {
        id: "LBC-CLIENT-0009",
        name: "SAMUEL FRIMPONG",
        fullName: "SAMUEL FRIMPONG",
        email: "samuel@example.com"
    },

    {
        id: "LBC-CLIENT-0010",
        name: "ESTHER BOATENG",
        fullName: "ESTHER BOATENG",
        email: "esther@example.com"
    },

    {
        id: "LBC-CLIENT-0011",
        name: "PATRICK ADU",
        fullName: "PATRICK ADU",
        email: "patrick@example.com"
    },

    {
        id: "LBC-CLIENT-0012",
        name: "RACHEL ASAMOAH",
        fullName: "RACHEL ASAMOAH",
        email: "rachel@example.com"
    },

    {
        id: "LBC-CLIENT-0013",
        name: "ERIC OPOKU",
        fullName: "ERIC OPOKU",
        email: "eric@example.com"
    },

    {
        id: "LBC-CLIENT-0014",
        name: "FELICIA ARTHUR",
        fullName: "FELICIA ARTHUR",
        email: "felicia@example.com"
    },

    {
        id: "LBC-CLIENT-0015",
        name: "ISAAC KUMI",
        fullName: "ISAAC KUMI",
        email: "isaac@example.com"
    },

    {
        id: "LBC-CLIENT-0016",
        name: "LINDA YAAH",
        fullName: "LINDA YAAH",
        email: "linda@example.com"
    },

    {
        id: "LBC-CLIENT-0017",
        name: "BENJAMIN QUAYE",
        fullName: "BENJAMIN QUAYE",
        email: "benjamin@example.com"
    },

    {
        id: "LBC-CLIENT-0018",
        name: "JOYCE DARKO",
        fullName: "JOYCE DARKO",
        email: "joyce@example.com"
    },

    {
        id: "LBC-CLIENT-0019",
        name: "RICHARD AMPOFO",
        fullName: "RICHARD AMPOFO",
        email: "richard@example.com"
    },

    {
        id: "LBC-CLIENT-0020",
        name: "PRISCILLA ASANTE",
        fullName: "PRISCILLA ASANTE",
        email: "priscilla@example.com"
    }

];


/* ============================================================
   SHARED JOURNEY / TRANSACTION DATA
   ============================================================ */

const LORDBLESS_PORTAL_MOCK_JOURNEYS = [

    {
        id: "LBC-2026-00021",
        clientId: "LBC-CLIENT-0001",
        title: "Germany Career Journey",
        destination: "Germany",
        service: "LORDBLESS GLOBAL CAREERS"
    },

    {
        id: "LBC-2026-00022",
        clientId: "LBC-CLIENT-0002",
        title: "Germany Career Journey",
        destination: "Germany",
        service: "LORDBLESS GLOBAL CAREERS"
    },

    {
        id: "LBC-2026-00023",
        clientId: "LBC-CLIENT-0003",
        title: "China Business Trip",
        destination: "China",
        service: "LORDBLESS BUSINESS"
    },

    {
        id: "LBC-2026-00024",
        clientId: "LBC-CLIENT-0004",
        title: "UK Travel Journey",
        destination: "United Kingdom",
        service: "LORDBLESS TRAVEL"
    },

    {
        id: "LBC-2026-00025",
        clientId: "LBC-CLIENT-0005",
        title: "Germany Career Journey",
        destination: "Germany",
        service: "LORDBLESS GLOBAL CAREERS"
    },

    {
        id: "LBC-2026-00026",
        clientId: "LBC-CLIENT-0006",
        title: "Canada Career Journey",
        destination: "Canada",
        service: "LORDBLESS GLOBAL CAREERS"
    },

    {
        id: "LBC-2026-00027",
        clientId: "LBC-CLIENT-0007",
        title: "China Business Trip",
        destination: "China",
        service: "LORDBLESS BUSINESS"
    },

    {
        id: "LBC-2026-00028",
        clientId: "LBC-CLIENT-0008",
        title: "France Travel Journey",
        destination: "France",
        service: "LORDBLESS TRAVEL"
    },

    {
        id: "LBC-2026-00029",
        clientId: "LBC-CLIENT-0009",
        title: "Germany Career Journey",
        destination: "Germany",
        service: "LORDBLESS GLOBAL CAREERS"
    },

    {
        id: "LBC-2026-00030",
        clientId: "LBC-CLIENT-0010",
        title: "UK Travel Journey",
        destination: "United Kingdom",
        service: "LORDBLESS TRAVEL"
    }

];


/* ============================================================
   CLIENT LOOKUP
   ============================================================ */

function getPortalMockClient(clientId) {

    if (!clientId) {
        return null;
    }

    return (
        LORDBLESS_PORTAL_MOCK_CLIENTS.find(
            client => client.id === clientId
        ) || null
    );

}


/* ============================================================
   GET CLIENT BY EMAIL
   ============================================================ */

function getPortalMockClientByEmail(email) {

    if (!email) {
        return null;
    }

    const normalizedEmail =
        String(email)
            .trim()
            .toLowerCase();

    return (
        LORDBLESS_PORTAL_MOCK_CLIENTS.find(
            client =>
                String(client.email || "")
                    .trim()
                    .toLowerCase() === normalizedEmail
        ) || null
    );

}


/* ============================================================
   JOURNEY LOOKUP
   ============================================================ */

function getPortalMockJourney(journeyId) {

    if (!journeyId) {
        return null;
    }

    return (
        LORDBLESS_PORTAL_MOCK_JOURNEYS.find(
            journey => journey.id === journeyId
        ) || null
    );

}


/* ============================================================
   GET ALL JOURNEYS FOR A CLIENT
   ============================================================ */

function getPortalMockClientJourneys(clientId) {

    if (!clientId) {
        return [];
    }

    return LORDBLESS_PORTAL_MOCK_JOURNEYS.filter(
        journey => journey.clientId === clientId
    );

}


/* ============================================================
   VALIDATE CLIENT + JOURNEY RELATIONSHIP
   ============================================================ */

function isPortalMockJourneyOwnedByClient(
    journeyId,
    clientId
) {

    if (!journeyId || !clientId) {
        return false;
    }

    return LORDBLESS_PORTAL_MOCK_JOURNEYS.some(
        journey =>
            journey.id === journeyId &&
            journey.clientId === clientId
    );

}


/* ============================================================
   DEVELOPMENT API
   ============================================================ */

window.LORDBLESS_PORTAL_MOCK_DATA = {

    clients:
        LORDBLESS_PORTAL_MOCK_CLIENTS,

    journeys:
        LORDBLESS_PORTAL_MOCK_JOURNEYS,

    getClient:
        getPortalMockClient,

    getClientByEmail:
        getPortalMockClientByEmail,

    getJourney:
        getPortalMockJourney,

    getClientJourneys:
        getPortalMockClientJourneys,

    isJourneyOwnedByClient:
        isPortalMockJourneyOwnedByClient

};
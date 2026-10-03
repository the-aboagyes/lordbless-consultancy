# LORDBLESS PORTAL WORKFLOW MAP

Version: 1.0
Status: Development Blueprint

---

# 1. PURPOSE

This document defines how information and actions move between:

- LORDBLESS Main Website
- Admin Portal
- Client Portal
- Temporary Local Data Bridge
- Future Supabase Backend

The current system uses local/mock data.

Supabase will replace the temporary local infrastructure later.

---

# 2. CORE ARCHITECTURE

CURRENT DEVELOPMENT ARCHITECTURE

    ADMIN PORTAL
          |
          v
    PORTAL DATA BRIDGE
          |
          v
    CLIENT PORTAL


FUTURE PRODUCTION ARCHITECTURE

    MAIN WEBSITE
          |
          +------------------+
          |                  |
          v                  v
    CLIENT PORTAL      ADMIN PORTAL
          |                  |
          +--------+---------+
                   |
                   v
              SUPABASE
                   |
          +--------+--------+
          |        |        |
          v        v        v
       Database  Storage   Auth


---

# 3. IMPORTANT DATA PRINCIPLE

REFERENCE DATA and OPERATIONAL DATA are different.

REFERENCE DATA

Examples:

- Clients
- Client IDs
- Journeys
- Journey IDs
- Basic service information

Temporary source:

    portalMockData.js

Future source:

    Supabase Database


OPERATIONAL DATA

Examples:

- Document Requests
- Payment Requests
- Payments
- Messages
- Notifications
- Status changes
- Uploads
- Verification actions

Temporary communication/storage layer:

    portalDataBridge.js

Future source:

    Supabase Database + Supabase Storage


---

# 4. CLIENT OWNERSHIP PRINCIPLE

Every client has a permanent Client ID.

Example:

    LBC-CLIENT-0001

A client may have:

- Multiple journeys
- Multiple transactions
- Multiple document requests
- Multiple payments
- Multiple messages

Client ID identifies the CLIENT.

Journey ID identifies the JOURNEY.

Transaction ID identifies the TRANSACTION.

These IDs must not be confused.

Example:

    Client:
    LBC-CLIENT-0001

    Journey:
    LBC-JOURNEY-00021

    Transaction:
    LBC-2026-00021


---

# 5. DOCUMENT WORKFLOW

## 5.1 Document Request

DOCUMENT REQUEST is journey-specific.

Typical flow:

    ADMIN
      |
      | Create Document Request
      v
    PORTAL DATA BRIDGE
      |
      v
    CLIENT PORTAL
      |
      | Client sees request
      v
    CLIENT UPLOADS DOCUMENT
      |
      v
    ADMIN REVIEWS
      |
      +-------------------+
      |                   |
      v                   v
    APPROVED            REJECTED
      |                   |
      v                   v
    PERMANENT          CLIENT ACTION
    DOCUMENT LIBRARY   REQUIRED


---

## 5.2 Document Request Statuses

Possible statuses:

    Requested
    Submitted
    Under Review
    Approved
    Rejected
    Action Required
    Waived

The exact status used depends on the workflow implemented in the portal.

---

## 5.3 Permanent Document Library

Permanent documents belong to the CLIENT.

They are not permanently owned by one journey.

Example:

    Passport
       |
       +---- Germany Journey
       |
       +---- Canada Journey
       |
       +---- Travel Journey

An approved permanent document may therefore support multiple applicable journeys.

---

## 5.4 Document Principle

IMPORTANT:

    REQUEST != DOCUMENT

A request asks the client to provide something.

A document is the actual file belonging to the client.

Example:

    Admin requests:
    Birth Certificate

    Client uploads:
    birth-certificate.pdf

    Admin approves:

    Birth Certificate becomes part of
    the Permanent Document Library.


---

# 6. PAYMENT WORKFLOW

Payment Request is created by Admin/Finance.

Typical flow:

    ADMIN / FINANCE
          |
          | Create Payment Request
          v
    PORTAL DATA BRIDGE
          |
          v
    CLIENT PORTAL
          |
          | Client views request
          v
    CLIENT MAKES PAYMENT
          |
          | Payment details / proof
          v
    PAYMENT RECORD
          |
          v
    ADMIN / FINANCE
          |
          | Verify payment
          v
    VERIFIED PAYMENT
          |
          +------------------+
          |                  |
          v                  v
    PAYMENT HISTORY       RECEIPT
                             |
                             v
                       CLIENT PORTAL


---

# 7. PAYMENT OBJECTS

The following objects must remain separate:

    Payment Request
    Payment
    Invoice
    Receipt
    Payment History


Payment Request:

    "LORDBLESS is requesting this payment."


Payment:

    "The client submitted this payment."


Invoice:

    "Formal financial request/document."


Receipt:

    "Official confirmation that payment
     has been verified."


Payment History:

    "Record of payment-related events."


---

# 8. PAYMENT REQUEST

A Payment Request may contain:

- Payment Request ID
- Client ID
- Journey ID
- Transaction ID
- Request type
- Title
- Description
- Amount
- Currency
- Due date
- Status
- Invoice ID
- Payment ID
- Receipt ID
- Admin note
- Creation date
- Update date

Supported currencies:

    EUR
    USD
    GHS


---

# 9. PAYMENT STATUS FLOW

Typical flow:

    REQUESTED
        |
        v
    CLIENT VIEWED
        |
        v
    PAYMENT PENDING
        |
        v
    PAYMENT SUBMITTED
        |
        v
    UNDER REVIEW
        |
        v
    VERIFIED


Alternative outcomes:

    UNDER REVIEW
        |
        v
    REJECTED


Administrative cancellation:

    REQUESTED / PENDING
        |
        v
    CANCELLED


---

# 10. PAYMENT VERIFICATION PRINCIPLE

The client does not verify their own payment.

Client:

    Submits payment information/proof.

Admin / Finance:

    Reviews payment.

Admin / Finance:

    Marks payment as verified.

Only after verification should an official receipt be issued.


---

# 11. RECEIPT WORKFLOW

    VERIFIED PAYMENT
          |
          v
    RECEIPT GENERATED
          |
          v
    RECEIPT STORED
          |
          v
    CLIENT PORTAL
          |
          v
    PAYMENT HISTORY


Receipt numbering should follow the established
LORDBLESS receipt structure.

Example:

    LBC-REC-2026-00001


---

# 12. MESSAGE WORKFLOW

Messages are portal-based communication.

Typical flow:

    ADMIN
      |
      | Send Message
      v
    PORTAL DATA BRIDGE
      |
      v
    CLIENT PORTAL
      |
      | Read / Reply
      v
    ADMIN PORTAL


Messages may relate to:

- General communication
- Journey updates
- Document requests
- Payment requests
- Payment updates
- Action required
- Appointments
- Support
- System notifications


---

# 13. CONVERSATION STRUCTURE

A client may have multiple conversations.

A conversation may belong to:

- Client
- Journey
- Transaction
- Payment
- Document request
- General support

Example:

    Conversation:
    Germany Career Journey

        Message 1:
        LORDBLESS requests document.

        Message 2:
        Client replies.

        Message 3:
        Admin responds.


---

# 14. MESSAGE STATUS

Possible message statuses:

    Draft
    Sent
    Delivered
    Read
    Archived
    Deleted


---

# 15. READ / UNREAD

Client Portal should clearly indicate unread messages.

Example:

    Messages

    Unread: 2


When the client opens a message:

    isRead = true

    readAt = timestamp


Admin should have equivalent unread indicators
for messages received from clients.


---

# 16. MESSAGE ATTACHMENTS

Messages may contain attachments.

Examples:

- PDF
- Image
- Invoice
- Receipt
- Other document

An attachment should contain:

- Attachment ID
- Message ID
- File name
- File type
- MIME type
- File size
- Storage path
- URL
- Uploaded by
- Upload timestamp


---

# 17. CLIENT PORTAL OVERVIEW

The Client Portal Overview should eventually surface
important pending actions from all major systems.

Example:

    PENDING ACTIONS

    Document Request
    Birth Certificate required

    Payment Request
    EUR 1,500 pending

    Message
    New message from LORDBLESS


The Overview should summarize.

The detailed action should occur inside:

    My Documents
    Payments
    Messages


---

# 18. ADMIN PORTAL RESPONSIBILITIES

ADMIN PORTAL controls administrative workflows.

ADMIN may:

- Create document requests
- Review documents
- Approve documents
- Reject documents
- Create payment requests
- Verify payments
- Generate receipts
- Send messages
- Respond to client messages
- Update journey information
- Manage client records


---

# 19. CLIENT PORTAL RESPONSIBILITIES

CLIENT PORTAL allows the client to:

- View journeys
- View document requests
- Upload documents
- View permanent documents
- View payment requests
- Submit payment information/proof
- View payment history
- Download receipts
- View messages
- Reply to messages
- Update permitted profile information


---

# 20. ACCESS PRINCIPLE

Client data must always be filtered by Client ID.

Example:

    Current Client:
    LBC-CLIENT-0001

The Client Portal must only display records belonging
to that client.

For example:

    documentRequest.clientId
        ===
    currentClient.id


and:

    paymentRequest.clientId
        ===
    currentClient.id


and:

    message.clientId
        ===
    currentClient.id


---

# 21. ADMIN → CLIENT

The following actions originate primarily from Admin:

    Document Request
    Payment Request
    Message
    Journey Update
    Action Required Notification


---

# 22. CLIENT → ADMIN

The following actions originate primarily from Client:

    Document Upload
    Payment Submission
    Message Reply
    Requested Information
    Profile Information Update


---

# 23. ADMIN VERIFICATION

Some client actions require Admin verification.

Examples:

    Client Upload
          |
          v
    Admin Review
          |
          v
    Approved / Rejected


Payment:

    Client Payment Submission
          |
          v
    Finance Review
          |
          v
    Verified / Rejected


---

# 24. TEMPORARY LOCAL BRIDGE

Current development bridge:

    portalDataBridge.js


Current responsibility:

    Admin
       ↓
    Local Storage / Bridge
       ↓
    Client


The bridge may eventually support:

    Document Requests
    Documents
    Payment Requests
    Payments
    Messages
    Notifications


---

# 25. BROADCASTING

The local development bridge may use browser
communication mechanisms to notify another portal
instance that data has changed.

Example event:

    document-request-updated


Future examples:

    payment-request-updated

    payment-updated

    receipt-issued

    message-created

    message-read

    journey-updated


These events are development mechanisms.

They will eventually be replaced or supplemented
by Supabase real-time functionality.


---

# 26. SUPABASE MIGRATION

The current local architecture is temporary.

Future production architecture:

    Supabase Auth
          |
          v
    User Identity
          |
          v
    Supabase Database
          |
          +------------------+
          |                  |
          v                  v
       Admin              Client
       Portal             Portal


Supabase Storage will handle uploaded files.

Potential storage categories:

    /documents/
    /payment-proofs/
    /invoices/
    /receipts/
    /message-attachments/


---

# 27. SUPABASE AUTH PRINCIPLE

The Client Portal should eventually determine the
current client from authenticated identity.

Current development:

    Mock / temporary client identity


Future:

    Supabase Auth User
          |
          v
    Client Profile
          |
          v
    Client ID


The Client ID remains the permanent business identifier.

---

# 28. MAIN WEBSITE INTEGRATION

The main LORDBLESS website will eventually connect
to the same Supabase backend.

Target architecture:

    LORDBLESS MAIN WEBSITE
              |
        +-----+-----+
        |           |
        v           v
    CLIENT       ADMIN
    LOGIN        LOGIN
        |           |
        v           v
    CLIENT       ADMIN
    PORTAL       PORTAL
        \           /
         \         /
          \       /
           SUPABASE


---

# 29. IMPORTANT DEVELOPMENT RULES

Do not duplicate data unnecessarily.

Do not create separate client identities in multiple
files.

Do not mix:

    Client ID
    Journey ID
    Transaction ID


Do not mix:

    Payment Request
    Payment
    Invoice
    Receipt


Do not mix:

    Document Request
    Permanent Document


Do not bypass the shared bridge for new Admin → Client
communication while the local architecture is active.


---

# 30. CURRENT DEVELOPMENT STATUS

DOCUMENTS

    Admin → Client Request
    Status: CONNECTED

    Client Upload
    Status: FUNCTIONAL

    Admin Review
    Status: EXISTING WORKFLOW


PAYMENTS

    Payment Data Model
    Status: PREPARED

    Payment Request
    Status: NEXT CONNECTION TASK

    Payment Verification
    Status: EXISTING STRUCTURE

    Invoice
    Status: EXISTING STRUCTURE

    Receipt
    Status: EXISTING STRUCTURE

    Payment History
    Status: EXISTING STRUCTURE


MESSAGES

    Message Data Model
    Status: PREPARED

    Admin → Client Messaging
    Status: NEXT DEVELOPMENT TASK


SUPABASE

    Status: FINAL INTEGRATION PHASE


---

# 31. DEVELOPMENT ORDER

The agreed development sequence is:

    1. Document Request
          ↓
    2. Document UI Polish
          ↓
    3. Payment Request Connection
          ↓
    4. Message Connection
          ↓
    5. Payment Verification / Receipt Flow
          ↓
    6. Make all Admin Portal buttons functional
          ↓
    7. Make all Client Portal buttons functional
          ↓
    8. Full portal testing
          ↓
    9. Supabase Auth
          ↓
    10. Supabase Database
          ↓
    11. Supabase Storage
          ↓
    12. Main Website Integration


---

# 32. FINAL PRINCIPLE

The portals should behave as one connected
LORDBLESS system.

The user should not feel that:

    Website
    Admin Portal
    Client Portal

are separate applications.

They should experience:

    ONE LORDBLESS PLATFORM

with different interfaces for different roles.

Admin manages.

Client responds.

Supabase becomes the permanent source of truth.

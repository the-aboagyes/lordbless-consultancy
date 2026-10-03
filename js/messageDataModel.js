/* ============================================================
   LORDBLESS MESSAGE DATA MODEL
   ============================================================

   Purpose:
   --------
   Shared data structure for the LORDBLESS messaging system.

   Covers:
   - Conversations
   - Messages
   - Sender / Recipient
   - Read / Unread status
   - Message types
   - Attachments
   - Timestamps
   - Message priority
   - Conversation status

   ARCHITECTURE
   ------------
   ADMIN PORTAL
        |
        | sends message
        v
   MESSAGE / CONVERSATION
        |
        v
   CLIENT PORTAL
        |
        | reply / read
        v
   ADMIN PORTAL

   This is temporary local/mock infrastructure.

   Later:
   Local Mock Data
        ↓
   Supabase Database

   This file defines the STRUCTURE of messaging data.
   It does not send email, WhatsApp or external messages.

   ============================================================ */

(function () {

    "use strict";


    /* ========================================================
       MESSAGE TYPES
       ======================================================== */

    const LORDBLESS_MESSAGE_TYPES = {

        GENERAL:
            "General",

        JOURNEY_UPDATE:
            "Journey Update",

        DOCUMENT_REQUEST:
            "Document Request",

        PAYMENT_REQUEST:
            "Payment Request",

        PAYMENT_UPDATE:
            "Payment Update",

        ACTION_REQUIRED:
            "Action Required",

        APPOINTMENT:
            "Appointment",

        SYSTEM:
            "System",

        SUPPORT:
            "Support"

    };


    /* ========================================================
       MESSAGE STATUS
       ======================================================== */

    const LORDBLESS_MESSAGE_STATUS = {

        DRAFT:
            "Draft",

        SENT:
            "Sent",

        DELIVERED:
            "Delivered",

        READ:
            "Read",

        ARCHIVED:
            "Archived",

        DELETED:
            "Deleted"

    };


    /* ========================================================
       CONVERSATION STATUS
       ======================================================== */

    const LORDBLESS_CONVERSATION_STATUS = {

        OPEN:
            "Open",

        PENDING:
            "Pending",

        RESOLVED:
            "Resolved",

        CLOSED:
            "Closed",

        ARCHIVED:
            "Archived"

    };


    /* ========================================================
       MESSAGE PRIORITY
       ======================================================== */

    const LORDBLESS_MESSAGE_PRIORITY = {

        LOW:
            "Low",

        NORMAL:
            "Normal",

        HIGH:
            "High",

        URGENT:
            "Urgent"

    };


    /* ========================================================
       SENDER TYPES
       ======================================================== */

    const LORDBLESS_SENDER_TYPES = {

        CLIENT:
            "Client",

        ADMIN:
            "Admin",

        SYSTEM:
            "System"

    };


    /* ========================================================
       ATTACHMENT TYPES
       ======================================================== */

    const LORDBLESS_ATTACHMENT_TYPES = {

        DOCUMENT:
            "Document",

        IMAGE:
            "Image",

        PDF:
            "PDF",

        INVOICE:
            "Invoice",

        RECEIPT:
            "Receipt",

        OTHER:
            "Other"

    };


    /* ========================================================
       CREATE CONVERSATION
       ========================================================

       A conversation belongs to a client.

       A client may have multiple conversations.

       A conversation may be connected to:
       - A journey
       - A transaction
       - A payment request
       - A document request

       This allows messages to remain organised
       without forcing every message to belong
       to a specific journey.
       ======================================================== */

    function createConversation(
        data = {}
    ) {

        const now =
            new Date().toISOString();


        return {

            id:
                data.id ||
                `CONV-${Date.now()}`,

            clientId:
                data.clientId ||
                null,

            journeyId:
                data.journeyId ||
                null,

            transactionId:
                data.transactionId ||
                null,


            /* ------------------------------------------------
               CONVERSATION INFORMATION
               ------------------------------------------------ */

            subject:
                data.subject ||
                "LORDBLESS Conversation",

            category:
                data.category ||
                LORDBLESS_MESSAGE_TYPES.GENERAL,

            status:
                data.status ||
                LORDBLESS_CONVERSATION_STATUS.OPEN,

            priority:
                data.priority ||
                LORDBLESS_MESSAGE_PRIORITY.NORMAL,


            /* ------------------------------------------------
               PARTICIPANTS
               ------------------------------------------------ */

            clientName:
                data.clientName ||
                null,

            adminName:
                data.adminName ||
                null,

            assignedDesk:
                data.assignedDesk ||
                null,


            /* ------------------------------------------------
               MESSAGE SUMMARY
               ------------------------------------------------ */

            lastMessageId:
                data.lastMessageId ||
                null,

            lastMessagePreview:
                data.lastMessagePreview ||
                "",

            lastMessageAt:
                data.lastMessageAt ||
                now,


            /* ------------------------------------------------
               UNREAD COUNTERS
               ------------------------------------------------ */

            unreadForClient:
                Number(
                    data.unreadForClient || 0
                ),

            unreadForAdmin:
                Number(
                    data.unreadForAdmin || 0
                ),


            /* ------------------------------------------------
               TIMESTAMPS
               ------------------------------------------------ */

            createdAt:
                data.createdAt ||
                now,

            updatedAt:
                data.updatedAt ||
                now,

            closedAt:
                data.closedAt ||
                null

        };

    }


    /* ========================================================
       CREATE MESSAGE
       ========================================================

       A message belongs to a conversation.

       Sender and recipient are explicit.

       This allows the same structure to support:

       Admin → Client
       Client → Admin
       System → Client
       System → Admin
       ======================================================== */

    function createMessage(
        data = {}
    ) {

        const now =
            new Date().toISOString();


        return {

            id:
                data.id ||
                `MSG-${Date.now()}`,

            conversationId:
                data.conversationId ||
                null,


            /* ------------------------------------------------
               RELATIONSHIPS
               ------------------------------------------------ */

            clientId:
                data.clientId ||
                null,

            journeyId:
                data.journeyId ||
                null,

            transactionId:
                data.transactionId ||
                null,


            /* ------------------------------------------------
               SENDER
               ------------------------------------------------ */

            senderId:
                data.senderId ||
                null,

            senderName:
                data.senderName ||
                null,

            senderType:
                data.senderType ||
                LORDBLESS_SENDER_TYPES.SYSTEM,


            /* ------------------------------------------------
               RECIPIENT
               ------------------------------------------------ */

            recipientId:
                data.recipientId ||
                null,

            recipientName:
                data.recipientName ||
                null,

            recipientType:
                data.recipientType ||
                null,


            /* ------------------------------------------------
               MESSAGE CONTENT
               ------------------------------------------------ */

            type:
                data.type ||
                LORDBLESS_MESSAGE_TYPES.GENERAL,

            subject:
                data.subject ||
                "",

            body:
                data.body ||
                "",


            /* ------------------------------------------------
               STATUS
               ------------------------------------------------ */

            status:
                data.status ||
                LORDBLESS_MESSAGE_STATUS.SENT,

            priority:
                data.priority ||
                LORDBLESS_MESSAGE_PRIORITY.NORMAL,


            /* ------------------------------------------------
               READ / UNREAD
               ------------------------------------------------ */

            isRead:
                Boolean(
                    data.isRead || false
                ),

            readAt:
                data.readAt ||
                null,


            /* ------------------------------------------------
               ATTACHMENTS
               ------------------------------------------------ */

            attachments:
                Array.isArray(
                    data.attachments
                )
                    ? data.attachments
                    : [],


            /* ------------------------------------------------
               REPLY CONNECTION
               ------------------------------------------------ */

            replyToMessageId:
                data.replyToMessageId ||
                null,


            /* ------------------------------------------------
               TIMESTAMPS
               ------------------------------------------------ */

            sentAt:
                data.sentAt ||
                now,

            deliveredAt:
                data.deliveredAt ||
                null,

            createdAt:
                data.createdAt ||
                now,

            updatedAt:
                data.updatedAt ||
                now

        };

    }


    /* ========================================================
       CREATE ATTACHMENT
       ======================================================== */

    function createAttachment(
        data = {}
    ) {

        const now =
            new Date().toISOString();


        return {

            id:
                data.id ||
                `ATT-${Date.now()}`,

            messageId:
                data.messageId ||
                null,


            /* ------------------------------------------------
               FILE INFORMATION
               ------------------------------------------------ */

            name:
                data.name ||
                "",

            fileName:
                data.fileName ||
                "",

            fileType:
                data.fileType ||
                LORDBLESS_ATTACHMENT_TYPES.OTHER,

            mimeType:
                data.mimeType ||
                "",

            size:
                Number(
                    data.size || 0
                ),


            /* ------------------------------------------------
               STORAGE
               ------------------------------------------------ */

            url:
                data.url ||
                null,

            storagePath:
                data.storagePath ||
                null,


            /* ------------------------------------------------
               METADATA
               ------------------------------------------------ */

            uploadedBy:
                data.uploadedBy ||
                null,

            uploadedAt:
                data.uploadedAt ||
                now

        };

    }


    /* ========================================================
       MESSAGE NOTIFICATION
       ========================================================

       Lightweight notification information.

       This allows the portal to show:

       "You have 2 unread messages"

       without loading the entire conversation.
       ======================================================== */

    function createMessageNotification(
        data = {}
    ) {

        const now =
            new Date().toISOString();


        return {

            id:
                data.id ||
                `NOTIF-${Date.now()}`,

            clientId:
                data.clientId ||
                null,

            recipientId:
                data.recipientId ||
                null,

            messageId:
                data.messageId ||
                null,

            conversationId:
                data.conversationId ||
                null,


            /* ------------------------------------------------
               NOTIFICATION CONTENT
               ------------------------------------------------ */

            type:
                data.type ||
                LORDBLESS_MESSAGE_TYPES.GENERAL,

            title:
                data.title ||
                "New Message",

            body:
                data.body ||
                "",


            /* ------------------------------------------------
               STATUS
               ------------------------------------------------ */

            isRead:
                Boolean(
                    data.isRead || false
                ),

            readAt:
                data.readAt ||
                null,


            /* ------------------------------------------------
               TIMESTAMP
               ------------------------------------------------ */

            createdAt:
                data.createdAt ||
                now

        };

    }


    /* ========================================================
       MESSAGE THREAD SUMMARY
       ========================================================

       Used by the Messages page to display a list of
       conversations without rendering every message.

       Example:

       Germany Career Journey
       "Please upload your Birth Certificate..."
       2 unread
       ======================================================== */

    function createConversationSummary(
        data = {}
    ) {

        return {

            conversationId:
                data.conversationId ||
                null,

            clientId:
                data.clientId ||
                null,

            journeyId:
                data.journeyId ||
                null,

            transactionId:
                data.transactionId ||
                null,

            subject:
                data.subject ||
                "",

            category:
                data.category ||
                LORDBLESS_MESSAGE_TYPES.GENERAL,

            status:
                data.status ||
                LORDBLESS_CONVERSATION_STATUS.OPEN,

            priority:
                data.priority ||
                LORDBLESS_MESSAGE_PRIORITY.NORMAL,

            lastMessagePreview:
                data.lastMessagePreview ||
                "",

            lastMessageAt:
                data.lastMessageAt ||
                null,

            unreadCount:
                Number(
                    data.unreadCount || 0
                )

        };

    }


    /* ========================================================
       VALIDATION HELPERS
       ======================================================== */

    function isValidMessageType(
        type
    ) {

        return Object.values(
            LORDBLESS_MESSAGE_TYPES
        ).includes(
            type
        );

    }


    function isValidMessageStatus(
        status
    ) {

        return Object.values(
            LORDBLESS_MESSAGE_STATUS
        ).includes(
            status
        );

    }


    function isValidConversationStatus(
        status
    ) {

        return Object.values(
            LORDBLESS_CONVERSATION_STATUS
        ).includes(
            status
        );

    }


    function isValidMessagePriority(
        priority
    ) {

        return Object.values(
            LORDBLESS_MESSAGE_PRIORITY
        ).includes(
            priority
        );

    }


    /* ========================================================
       MARK MESSAGE AS READ
       ======================================================== */

    function markMessageAsRead(
        message
    ) {

        if (!message) {

            return null;

        }


        message.isRead =
            true;

        message.status =
            LORDBLESS_MESSAGE_STATUS.READ;

        message.readAt =
            new Date().toISOString();

        message.updatedAt =
            new Date().toISOString();


        return message;

    }


    /* ========================================================
       MARK MESSAGE AS UNREAD
       ======================================================== */

    function markMessageAsUnread(
        message
    ) {

        if (!message) {

            return null;

        }


        message.isRead =
            false;

        message.status =
            LORDBLESS_MESSAGE_STATUS.DELIVERED;

        message.readAt =
            null;

        message.updatedAt =
            new Date().toISOString();


        return message;

    }


    /* ========================================================
       PUBLIC MESSAGE DATA MODEL
       ======================================================== */

    window.LORDBLESS_MESSAGE_MODEL = {

        /* Types */

        messageTypes:
            LORDBLESS_MESSAGE_TYPES,

        messageStatus:
            LORDBLESS_MESSAGE_STATUS,

        conversationStatus:
            LORDBLESS_CONVERSATION_STATUS,

        messagePriority:
            LORDBLESS_MESSAGE_PRIORITY,

        senderTypes:
            LORDBLESS_SENDER_TYPES,

        attachmentTypes:
            LORDBLESS_ATTACHMENT_TYPES,


        /* Factory functions */

        createConversation:
            createConversation,

        createMessage:
            createMessage,

        createAttachment:
            createAttachment,

        createNotification:
            createMessageNotification,

        createConversationSummary:
            createConversationSummary,


        /* Message actions */

        markAsRead:
            markMessageAsRead,

        markAsUnread:
            markMessageAsUnread,


        /* Validation */

        isValidMessageType:
            isValidMessageType,

        isValidMessageStatus:
            isValidMessageStatus,

        isValidConversationStatus:
            isValidConversationStatus,

        isValidMessagePriority:
            isValidMessagePriority

    };


    /* ========================================================
       READY MESSAGE
       ======================================================== */

    console.log(
        "LORDBLESS MESSAGE DATA MODEL: Ready."
    );

})();
/* ============================================================
   LORDBLESS CONSULTANCY
   PHASE UNLOCK ENGINE
   ------------------------------------------------------------
   Payment-confirmation-driven journey progression.

   FLOW:
   Payment Confirmed
        ↓
   Receipt Issued
        ↓
   Next Phase Unlocked

   Frontend-first.
   Supabase/RLS integration comes later.
   ============================================================ */

(function () {
    "use strict";


    /* ---------------------------------------------------------
       LORDBLESS GLOBAL JOURNEY
       --------------------------------------------------------- */

    const JOURNEY_PHASES = [
        {
            key: "discover",
            label: "DISCOVER",
            order: 1
        },
        {
            key: "assess",
            label: "ASSESS",
            order: 2
        },
        {
            key: "plan",
            label: "PLAN",
            order: 3
        },
        {
            key: "prepare",
            label: "PREPARE",
            order: 4
        },
        {
            key: "connect",
            label: "CONNECT",
            order: 5
        },
        {
            key: "travel",
            label: "TRAVEL",
            order: 6
        },
        {
            key: "arrive",
            label: "ARRIVE",
            order: 7
        },
        {
            key: "continue",
            label: "CONTINUE",
            order: 8
        }
    ];


    /* ---------------------------------------------------------
       STATE
       --------------------------------------------------------- */

    let state = {
        transaction: null,
        unlockedPhases: [],
        currentPhase: "discover"
    };


    /* ---------------------------------------------------------
       HELPERS
       --------------------------------------------------------- */

    function getPhaseIndex(phaseKey) {

        return JOURNEY_PHASES.findIndex(
            phase => phase.key === phaseKey
        );
    }


    function getPhase(phaseKey) {

        return JOURNEY_PHASES.find(
            phase => phase.key === phaseKey
        );
    }


    function getNextPhase(phaseKey) {

        const index =
            getPhaseIndex(phaseKey);

        if (
            index < 0 ||
            index >= JOURNEY_PHASES.length - 1
        ) {
            return null;
        }

        return JOURNEY_PHASES[index + 1];
    }


    function normalisePhase(phase) {

        if (!phase) {
            return "discover";
        }

        return String(phase)
            .toLowerCase()
            .trim();
    }


    /* ---------------------------------------------------------
       INITIALISE TRANSACTION
       --------------------------------------------------------- */

    function initialise(transaction) {

        state.transaction =
            transaction || null;

        state.currentPhase =
            normalisePhase(
                transaction?.currentStep ||
                transaction?.currentPhase ||
                "discover"
            );


        /*
         * Existing progress can be supplied by the backend
         * later. For now, phases up to the current phase are
         * considered available.
         */

        const currentIndex =
            getPhaseIndex(
                state.currentPhase
            );

        state.unlockedPhases =
            JOURNEY_PHASES
                .slice(
                    0,
                    Math.max(currentIndex + 1, 1)
                )
                .map(
                    phase => phase.key
                );


        return getState();
    }


    /* ---------------------------------------------------------
       IS PHASE UNLOCKED?
       --------------------------------------------------------- */

    function isUnlocked(phaseKey) {

        return state.unlockedPhases.includes(
            normalisePhase(phaseKey)
        );
    }


    /* ---------------------------------------------------------
       UNLOCK NEXT PHASE
       --------------------------------------------------------- */

    function unlockNextPhase() {

        const nextPhase =
            getNextPhase(
                state.currentPhase
            );


        if (!nextPhase) {

            return {
                success: true,
                completed: true,
                message:
                    "The LORDBLESS journey is complete."
            };

        }


        if (
            !state.unlockedPhases.includes(
                nextPhase.key
            )
        ) {

            state.unlockedPhases.push(
                nextPhase.key
            );

        }


        state.currentPhase =
            nextPhase.key;


        if (state.transaction) {

            state.transaction.currentStep =
                nextPhase.key;

            state.transaction.currentPhase =
                nextPhase.key;

            state.transaction.updatedAt =
                new Date().toISOString();

        }


        const result = {

            success: true,

            completed: false,

            previousPhase:
                getPhase(
                    state.currentPhase
                ),

            unlockedPhase:
                nextPhase,

            transaction:
                state.transaction

        };


        document.dispatchEvent(
            new CustomEvent(
                "lordbless:phase-unlocked",
                {
                    detail: result
                }
            )
        );


        return result;
    }


    /* ---------------------------------------------------------
       PAYMENT → PHASE UNLOCK
       --------------------------------------------------------- */

    function handlePaymentConfirmed(
        paymentConfirmation
    ) {

        if (!paymentConfirmation) {
            return;
        }


        const payment =
            paymentConfirmation.verification ||
            paymentConfirmation;


        if (
            payment.status !== "confirmed"
        ) {
            return;
        }


        /*
         * Receipt generation happens first.
         * We wait for the receipt-generated event.
         */

        state.pendingPayment =
            paymentConfirmation;
    }


    /* ---------------------------------------------------------
       RECEIPT → PHASE UNLOCK
       --------------------------------------------------------- */

    function handleReceiptGenerated(
        event
    ) {

        const receipt =
            event.detail;


        if (!receipt) {
            return;
        }


        /*
         * Only unlock if a confirmed payment is associated
         * with this receipt.
         */

        if (!state.pendingPayment) {
            return;
        }


        const result =
            unlockNextPhase();


        result.receipt =
            receipt;


        document.dispatchEvent(
            new CustomEvent(
                "lordbless:client-phase-ready",
                {
                    detail: result
                }
            )
        );


        state.pendingPayment =
            null;
    }


    /* ---------------------------------------------------------
       MANUAL PHASE CONTROL
       --------------------------------------------------------- */

    function unlockPhase(
        phaseKey,
        reason = "admin"
    ) {

        const phase =
            getPhase(
                normalisePhase(phaseKey)
            );


        if (!phase) {

            return {
                success: false,
                message: "Invalid journey phase."
            };

        }


        if (
            !state.unlockedPhases.includes(
                phase.key
            )
        ) {

            state.unlockedPhases.push(
                phase.key
            );

        }


        document.dispatchEvent(
            new CustomEvent(
                "lordbless:phase-manually-unlocked",
                {
                    detail: {
                        phase,
                        reason,
                        transaction:
                            state.transaction
                    }
                }
            )
        );


        return {
            success: true,
            phase,
            reason
        };
    }


    /* ---------------------------------------------------------
       LOCK PHASE
       --------------------------------------------------------- */

    function lockPhase(phaseKey) {

        const key =
            normalisePhase(
                phaseKey
            );


        state.unlockedPhases =
            state.unlockedPhases.filter(
                phase =>
                    phase !== key
            );


        document.dispatchEvent(
            new CustomEvent(
                "lordbless:phase-locked",
                {
                    detail: {
                        phase: key,
                        transaction:
                            state.transaction
                    }
                }
            )
        );
    }


    /* ---------------------------------------------------------
       GET STATE
       --------------------------------------------------------- */

    function getState() {

        return {

            transaction:
                state.transaction,

            currentPhase:
                state.currentPhase,

            currentPhaseDetails:
                getPhase(
                    state.currentPhase
                ),

            unlockedPhases:
                [...state.unlockedPhases],

            phases:
                JOURNEY_PHASES.map(
                    phase => ({
                        ...phase,
                        unlocked:
                            isUnlocked(
                                phase.key
                            ),
                        current:
                            phase.key ===
                            state.currentPhase
                    })
                )

        };
    }


    /* ---------------------------------------------------------
       EVENT LISTENERS
       --------------------------------------------------------- */

    document.addEventListener(
        "lordbless:payment-confirmed",
        function (event) {

            handlePaymentConfirmed(
                event.detail
            );

        }
    );


    document.addEventListener(
        "lordbless:receipt-generated",
        function (event) {

            handleReceiptGenerated(
                event
            );

        }
    );


    /* ---------------------------------------------------------
       PUBLIC API
       --------------------------------------------------------- */

    window.LORDBLESS_PHASE_UNLOCK = {

        phases:
            JOURNEY_PHASES,

        initialise,

        isUnlocked,

        unlockNextPhase,

        unlockPhase,

        lockPhase,

        getState

    };

})();
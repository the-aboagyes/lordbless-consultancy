"use strict";

/* ============================================================
   LORDBLESS PORTAL LOGIN
   ============================================================

   PURPOSE
   -------
   Common authentication entry point for:

   - Admin users
   - Client users
   - Invitation password setup
   - Password recovery

   IMPORTANT BUSINESS RULES
   -------------------------
   1. Invitation acceptance does NOT activate a client.
   2. Setting a password does NOT activate a client.
   3. Only access_status = "active" routes to the full client portal.
   4. access_status = "invited" remains in password setup mode.
   5. Existing password recovery must continue to work.
   6. Do not modify the Edge Function from this file.

   ============================================================ */


/* ============================================================
   DOM REFERENCES
   ============================================================ */

const portalLoginForm =
    document.getElementById("portal-login-form");

const portalEmailInput =
    document.getElementById("portal-email");

const portalPasswordInput =
    document.getElementById("portal-password");

const portalForgotPasswordButton =
    document.getElementById("portal-forgot-password");

const portalRecoveryForm =
    document.getElementById("portal-recovery-form");

const portalRecoveryEmailInput =
    document.getElementById("portal-recovery-email");

const portalRecoveryBackButton =
    document.getElementById("portal-recovery-back");

const portalResetPasswordForm =
    document.getElementById("portal-reset-password-form");

const portalNewPasswordInput =
    document.getElementById("portal-new-password");

const portalConfirmPasswordInput =
    document.getElementById("portal-confirm-password");

const portalAuthMessage =
    document.getElementById("portal-auth-message");

const portalSignOutButton =
    document.getElementById("portal-sign-out");

const portalSignInButton =
    portalLoginForm.querySelector('[type="submit"]');


/* ============================================================
   INTERNAL STATE
   ============================================================ */

let portalRedirectStarted = false;

let portalResolutionVersion = 0;

let portalResetMode = false;

let portalPasswordResetComplete = false;

let portalRecoveryEmail = "";


/*
 * Invitation links can contain:
 *
 * ?type=invite
 *
 * or:
 *
 * #type=invite
 *
 * The invitation URL should take priority over normal
 * session routing.
 */
const recoveryHashParams = new URLSearchParams(
    window.location.hash.slice(1)
);

const recoveryQueryParams = new URLSearchParams(
    window.location.search
);

const authLinkType =
    recoveryHashParams.get("type") ||
    recoveryQueryParams.get("type");

const isInviteLink =
    authLinkType === "invite";

const isRecoveryLink =
    authLinkType === "recovery";


/* ============================================================
   INITIAL UI STATE
   ============================================================ */

/*
 * Establish a deterministic initial UI state.
 *
 * This prevents the page from temporarily displaying:
 *
 * - Login form
 * - Sign Out button
 *
 * at the same time while authentication is being resolved.
 */

function initializePortalUi() {

    portalLoginForm.hidden = false;

    portalForgotPasswordButton.hidden = false;

    portalRecoveryForm.hidden = true;

    portalResetPasswordForm.hidden = true;

    portalSignOutButton.hidden = true;

    portalSignInButton.disabled = false;

    portalAuthMessage.dataset.error = "false";

    portalAuthMessage.textContent =
        "Sign in with your LORDBLESS account.";
}


/* ============================================================
   PASSWORD RESET / SETUP UI
   ============================================================ */

function showPasswordResetForm(session) {

    /*
     * Invalidate any currently running portal-resolution process.
     *
     * Once password setup begins, normal portal routing must stop.
     */
    portalResolutionVersion++;

    portalResetMode = true;

    portalPasswordResetComplete = false;

    portalRecoveryEmail =
        session?.user?.email ||
        portalRecoveryEmail;

    if (session?.user?.email) {
        portalEmailInput.value =
            session.user.email;
    }

    portalLoginForm.hidden = true;

    portalForgotPasswordButton.hidden = true;

    portalRecoveryForm.hidden = true;

    portalResetPasswordForm.hidden = false;

    portalSignOutButton.hidden = true;

    portalAuthMessage.dataset.error = "false";

    portalAuthMessage.textContent =
        "Set a new password for your LORDBLESS account.";
}


/* ============================================================
   NORMAL LOGIN UI
   ============================================================ */

function showPortalLogin(message) {

    portalResetMode = false;

    portalLoginForm.hidden = false;

    portalForgotPasswordButton.hidden = false;

    portalRecoveryForm.hidden = true;

    portalResetPasswordForm.hidden = true;

    portalSignOutButton.hidden = true;

    portalSignInButton.disabled = false;

    portalAuthMessage.dataset.error = "false";

    portalAuthMessage.textContent =
        message;
}


/* ============================================================
   PORTAL ROLE ROUTING
   ============================================================ */

function routePortalRole(role) {

    if (portalRedirectStarted) {
        return;
    }

    const destinations = {
        admin: "admin/index.html",
        client: "client/index.html"
    };

    if (!destinations[role]) {
        return;
    }

    portalRedirectStarted = true;

    window.location.assign(
        destinations[role]
    );
}


/* ============================================================
   RESOLVE PORTAL ACCESS
   ============================================================ */

async function resolvePortalAccess(user) {

    const [
        staffResult,
        clientResult
    ] = await Promise.all([

        lordblessSupabase
            .from("staff_profiles")
            .select("user_id, active")
            .eq("user_id", user.id)
            .maybeSingle(),

        lordblessSupabase
            .from("client_accounts")
            .select(
                "auth_user_id, client_id, access_status"
            )
            .eq("auth_user_id", user.id)
            .maybeSingle()

    ]);


    if (staffResult.error) {
        throw staffResult.error;
    }

    if (clientResult.error) {
        throw clientResult.error;
    }


    const staff =
        staffResult.data;

    const client =
        clientResult.data;


    /* ----------------------------------------------------------
       CONFLICT PROTECTION
       ---------------------------------------------------------- */

    if (staff && client) {

        throw new Error(
            "This account has conflicting staff and client access. Contact LORDBLESS support."
        );
    }


    /* ----------------------------------------------------------
       ADMIN
       ---------------------------------------------------------- */

    if (staff?.active) {

        return {
            portal: "admin"
        };
    }


    /* ----------------------------------------------------------
       CLIENT
       ---------------------------------------------------------- */

    if (client) {

        /*
         * FULL ACCESS
         *
         * Only "active" can enter the full client portal.
         */
        if (client.access_status === "active") {

            return {
                portal: "client"
            };
        }


        /*
         * INVITED
         *
         * This means the client has not completed the
         * invitation/password setup stage.
         *
         * IMPORTANT:
         * This does NOT activate the client.
         */
        if (client.access_status === "invited") {

            return {
                invited: true
            };
        }


        /*
         * Any other non-active state remains restricted.
         */
        return {

            pending: true,

            message:
                `Your Client Portal access is ${client.access_status.replaceAll("_", " ")}. Contact LORDBLESS support if you need assistance.`

        };
    }


    /* ----------------------------------------------------------
       INACTIVE STAFF
       ---------------------------------------------------------- */

    if (staff && !staff.active) {

        throw new Error(
            "This staff account is inactive. Contact LORDBLESS support."
        );
    }


    /* ----------------------------------------------------------
       NO PORTAL ACCESS
       ---------------------------------------------------------- */

    throw new Error(
        "Portal access has not been assigned to this account. Contact LORDBLESS support."
    );
}


/* ============================================================
   HANDLE AUTHENTICATED SESSION
   ============================================================ */

async function handlePortalSession(session) {

    /*
     * Password setup always takes priority.
     */
    if (
        portalResetMode ||
        portalPasswordResetComplete
    ) {
        return;
    }


    const version =
        ++portalResolutionVersion;


    /* ----------------------------------------------------------
       NO SESSION
       ---------------------------------------------------------- */

    if (!session?.user) {

        showPortalLogin(
            "Sign in with your LORDBLESS account."
        );

        return;
    }


    /* ----------------------------------------------------------
       SESSION EXISTS
       ---------------------------------------------------------- */

    portalLoginForm.hidden = true;

    portalForgotPasswordButton.hidden = true;

    portalRecoveryForm.hidden = true;

    portalSignOutButton.hidden = false;

    portalAuthMessage.dataset.error = "false";

    portalAuthMessage.textContent =
        "Checking your portal access...";


    try {

        const access =
            await resolvePortalAccess(session.user);


        /*
         * A newer authentication event may have started
         * another resolution.
         */
        if (
            version !== portalResolutionVersion
        ) {
            return;
        }


        /* ------------------------------------------------------
           INVITED CLIENT
           ------------------------------------------------------ */

        if (access.invited) {

            /*
             * Do NOT activate the client.
             *
             * The existing password setup form is reused.
             */
            showPasswordResetForm(session);

            return;
        }


        /* ------------------------------------------------------
           OTHER RESTRICTED CLIENT
           ------------------------------------------------------ */

        if (access.pending) {

            portalSignOutButton.hidden = false;

            portalAuthMessage.dataset.error = "true";

            portalAuthMessage.textContent =
                access.message;

            return;
        }


        /* ------------------------------------------------------
           ACTIVE ADMIN / CLIENT
           ------------------------------------------------------ */

        portalAuthMessage.textContent =
            "Access confirmed. Opening your portal...";

        routePortalRole(
            access.portal
        );

    } catch (error) {

        if (
            version !== portalResolutionVersion
        ) {
            return;
        }

        portalAuthMessage.dataset.error = "true";

        portalAuthMessage.textContent =
            error?.message ||
            String(error);

    }
}


/* ============================================================
   HANDLE LOGIN
   ============================================================ */

portalLoginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        portalPasswordResetComplete = false;

        portalSignInButton.disabled = true;

        portalAuthMessage.dataset.error = "false";

        portalAuthMessage.textContent =
            "Signing in...";


        try {

            const {
                data,
                error
            } =
                await lordblessSupabase.auth.signInWithPassword({

                    email:
                        portalEmailInput.value.trim(),

                    password:
                        portalPasswordInput.value

                });


            if (error) {
                throw error;
            }


            portalPasswordInput.value = "";


            await handlePortalSession(
                data.session
            );


            portalSignInButton.disabled = false;

        } catch (error) {

            portalAuthMessage.dataset.error = "true";

            portalAuthMessage.textContent =
                error?.message ||
                String(error);

            portalSignInButton.disabled = false;
        }
    }
);


/* ============================================================
   FORGOT PASSWORD
   ============================================================ */

portalForgotPasswordButton.addEventListener(
    "click",
    () => {

        portalLoginForm.hidden = true;

        portalForgotPasswordButton.hidden = true;

        portalRecoveryForm.hidden = false;

        portalResetPasswordForm.hidden = true;

        portalSignOutButton.hidden = true;

        portalRecoveryEmailInput.value =
            portalEmailInput.value.trim();

        portalRecoveryEmailInput.focus();

        portalAuthMessage.dataset.error = "false";

        portalAuthMessage.textContent =
            "Enter your email to receive a password reset link.";
    }
);


/* ============================================================
   BACK FROM RECOVERY
   ============================================================ */

portalRecoveryBackButton.addEventListener(
    "click",
    () => {

        showPortalLogin(
            "Sign in with your LORDBLESS account."
        );
    }
);


/* ============================================================
   SEND PASSWORD RECOVERY EMAIL
   ============================================================ */

portalRecoveryForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        const recoveryButton =
            portalRecoveryForm.querySelector(
                '[type="submit"]'
            );

        recoveryButton.disabled = true;

        portalAuthMessage.dataset.error = "false";

        portalAuthMessage.textContent =
            "Sending password reset link...";


        try {

            const email =
                portalRecoveryEmailInput.value.trim();


            const {
                error
            } =
                await lordblessSupabase.auth
                    .resetPasswordForEmail(
                        email,
                        {
                            redirectTo:
                                "https://lordblessconsultancy.com/portal-login.html"
                        }
                    );


            if (error) {
                throw error;
            }


            portalAuthMessage.textContent =
                "If an account exists for that email, a password reset link has been sent.";

        } catch (error) {

            portalAuthMessage.dataset.error = "true";

            portalAuthMessage.textContent =
                error?.message ||
                String(error);

        } finally {

            recoveryButton.disabled = false;
        }
    }
);


/* ============================================================
   PASSWORD SETUP / PASSWORD RESET
   ============================================================ */

portalResetPasswordForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const newPassword =
            portalNewPasswordInput.value;


        /* ------------------------------------------------------
           PASSWORD CONFIRMATION
           ------------------------------------------------------ */

        if (
            newPassword !==
            portalConfirmPasswordInput.value
        ) {

            portalAuthMessage.dataset.error = "true";

            portalAuthMessage.textContent =
                "The new password and confirmation do not match.";

            portalConfirmPasswordInput.focus();

            return;
        }


        const resetButton =
            portalResetPasswordForm.querySelector(
                '[type="submit"]'
            );


        resetButton.disabled = true;

        portalAuthMessage.dataset.error = "false";

        portalAuthMessage.textContent =
            "Updating your password...";


        try {

            /* --------------------------------------------------
               UPDATE SUPABASE AUTH PASSWORD
               -------------------------------------------------- */

            const {
                error
            } =
                await lordblessSupabase.auth.updateUser({
                    password:
                        newPassword
                });


            if (error) {
                throw error;
            }


            portalRecoveryEmail =
                portalRecoveryEmail ||
                portalEmailInput.value.trim();


            /* --------------------------------------------------
               SIGN OUT AFTER PASSWORD SETUP
               -------------------------------------------------- */

            let signOutFailed = false;


            try {

                const {
                    error: signOutError
                } =
                    await lordblessSupabase.auth.signOut();


                signOutFailed =
                    Boolean(signOutError);

            } catch {

                signOutFailed = true;
            }


            /* --------------------------------------------------
               CLEAR PASSWORD FIELDS
               -------------------------------------------------- */

            portalNewPasswordInput.value = "";

            portalConfirmPasswordInput.value = "";


            if (portalRecoveryEmail) {

                portalEmailInput.value =
                    portalRecoveryEmail;
            }


            portalPasswordInput.value = "";


            /*
             * Prevent the auth listener from immediately
             * re-routing the user after successful setup.
             */
            portalPasswordResetComplete = true;


            const successMessage =
                "Your password has been updated. You can now sign in with your new password.";


            showPortalLogin(

                signOutFailed

                    ? `${successMessage} If your session remains active, refresh this page before signing in.`

                    : successMessage

            );

        } catch (error) {

            portalAuthMessage.dataset.error = "true";

            portalAuthMessage.textContent =
                error?.message ||
                String(error);

        } finally {

            resetButton.disabled = false;
        }
    }
);


/* ============================================================
   SIGN OUT
   ============================================================ */

portalSignOutButton.addEventListener(
    "click",
    async () => {

        portalSignOutButton.disabled = true;


        try {

            const {
                error
            } =
                await lordblessSupabase.auth.signOut();


            if (error) {
                throw error;
            }


            portalPasswordInput.value = "";

            portalSignInButton.disabled = false;


            /*
             * Reset password/setup state after explicit sign-out.
             */
            portalResetMode = false;

            portalPasswordResetComplete = false;


            await handlePortalSession(null);

        } catch (error) {

            portalAuthMessage.dataset.error = "true";

            portalAuthMessage.textContent =
                error?.message ||
                String(error);

        } finally {

            portalSignOutButton.disabled = false;
        }
    }
);


/* ============================================================
   AUTH STATE CHANGE
   ============================================================ */

lordblessSupabase.auth.onAuthStateChange(
    (event, session) => {

        /* ------------------------------------------------------
           PASSWORD RECOVERY
           ------------------------------------------------------ */

        if (event === "PASSWORD_RECOVERY") {

            showPasswordResetForm(session);

            return;
        }


        /*
         * If password setup is already active, do not allow
         * another auth event to replace the password form.
         */
        if (
            portalResetMode ||
            portalPasswordResetComplete
        ) {
            return;
        }


        /*
         * INITIAL_SESSION is deliberately ignored here because
         * getSession() below is the authoritative initialization
         * path. This prevents duplicate session resolution.
         */
        if (event === "INITIAL_SESSION") {
            return;
        }


        /*
         * Any subsequent sign-in/sign-out event is resolved
         * normally.
         */
        void handlePortalSession(
            session
        );
    }
);


/* ============================================================
   INITIAL AUTHENTICATION RESOLUTION
   ============================================================ */

async function initializeAuthentication() {

    /*
     * ----------------------------------------------------------
     * INVITATION / RECOVERY URL
     * ----------------------------------------------------------
     *
     * We DO NOT immediately show the password form here.
     *
     * Instead, we first obtain the Supabase session.
     *
     * This prevents the URL state and the session state from
     * competing with each other.
     */

    try {

        const {
            data,
            error
        } =
            await lordblessSupabase.auth.getSession();


        if (error) {
            throw error;
        }


        const session =
            data?.session;


        /* ------------------------------------------------------
           INVITATION LINK
           ------------------------------------------------------ */

        if (isInviteLink) {

            if (session?.user) {

                showPasswordResetForm(
                    session
                );

                return;
            }


            /*
             * If the invitation link is present but Supabase has
             * not established a session, remain on the login
             * interface rather than falsely claiming access.
             */
            showPortalLogin(
                "Open the invitation link again to continue setting up your account."
            );

            return;
        }


        /* ------------------------------------------------------
           PASSWORD RECOVERY LINK
           ------------------------------------------------------ */

        if (isRecoveryLink) {

            if (session?.user) {

                showPasswordResetForm(
                    session
                );

                return;
            }


            showPortalLogin(
                "Open the password reset link again to continue."
            );

            return;
        }


        /* ------------------------------------------------------
           NORMAL SESSION
           ------------------------------------------------------ */

        await handlePortalSession(
            session
        );

    } catch (error) {

        portalAuthMessage.dataset.error = "true";

        portalAuthMessage.textContent =
            error?.message ||
            String(error);

        portalSignInButton.disabled = false;
    }
}


/* ============================================================
   START
   ============================================================ */

/*
 * Establish the UI before authentication resolution begins.
 */
initializePortalUi();


/*
 * Then allow Supabase authentication to determine whether
 * the user is:
 *
 * - unauthenticated
 * - invited
 * - restricted
 * - active admin
 * - active client
 */
void initializeAuthentication(); 
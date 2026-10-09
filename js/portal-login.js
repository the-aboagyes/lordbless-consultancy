"use strict";

/*
 * LORDBLESS portal login
 *
 * Requires the page to provide `lordblessSupabase` before this script runs.
 * This file intentionally does not initialize a new Supabase client because
 * the supplied source did not include the URL, key, or client setup.
 *
 * Business rules:
 * - Accepting an invitation or setting a password does not activate a client.
 * - Only access_status === "active" enters the client portal.
 * - Invited clients are shown the password setup form.
 * - The Edge Function is not changed by this script.
 */

const portalLoginForm = document.getElementById("portal-login-form");
const portalEmailInput = document.getElementById("portal-email");
const portalPasswordInput = document.getElementById("portal-password");
const portalForgotPasswordButton = document.getElementById("portal-forgot-password");
const portalRecoveryForm = document.getElementById("portal-recovery-form");
const portalRecoveryEmailInput = document.getElementById("portal-recovery-email");
const portalRecoveryBackButton = document.getElementById("portal-recovery-back");
const portalResetPasswordForm = document.getElementById("portal-reset-password-form");
const portalNewPasswordInput = document.getElementById("portal-new-password");
const portalConfirmPasswordInput = document.getElementById("portal-confirm-password");
const portalAuthMessage = document.getElementById("portal-auth-message");
const portalSignOutButton = document.getElementById("portal-sign-out");
const portalSignInButton = portalLoginForm.querySelector('[type="submit"]');

let portalRedirectStarted = false;
let portalResolutionVersion = 0;
let portalResetMode = false;
let portalPasswordResetComplete = false;
let portalRecoveryEmail = "";

const recoveryHashParams = new URLSearchParams(window.location.hash.slice(1));
const recoveryQueryParams = new URLSearchParams(window.location.search);
const authLinkType = recoveryHashParams.get("type") || recoveryQueryParams.get("type");
const isInviteLink = authLinkType === "invite";
const isRecoveryLink = authLinkType === "recovery";

function initializePortalUi() {
    portalLoginForm.hidden = false;
    portalForgotPasswordButton.hidden = false;
    portalRecoveryForm.hidden = true;
    portalResetPasswordForm.hidden = true;
    portalSignOutButton.hidden = true;
    portalSignInButton.disabled = false;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = "Sign in with your LORDBLESS account.";
}

function showPasswordResetForm(session) {
    // Stop any in-flight portal access check before showing password setup.
    portalResolutionVersion++;
    portalResetMode = true;
    portalPasswordResetComplete = false;
    portalRecoveryEmail = session?.user?.email || portalRecoveryEmail;

    if (session?.user?.email) {
        portalEmailInput.value = session.user.email;
    }

    portalLoginForm.hidden = true;
    portalForgotPasswordButton.hidden = true;
    portalRecoveryForm.hidden = true;
    portalResetPasswordForm.hidden = false;
    portalSignOutButton.hidden = true;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = "Set a new password for your LORDBLESS account.";
}

function showPortalLogin(message) {
    portalResetMode = false;
    portalLoginForm.hidden = false;
    portalForgotPasswordButton.hidden = false;
    portalRecoveryForm.hidden = true;
    portalResetPasswordForm.hidden = true;
    portalSignOutButton.hidden = true;
    portalSignInButton.disabled = false;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = message;
}

function routePortalRole(role) {
    if (portalRedirectStarted) return;

    const destinations = {
        admin: "admin/index.html",
        client: "client/index.html"
    };

    if (!destinations[role]) return;

    portalRedirectStarted = true;
    window.location.assign(destinations[role]);
}

async function resolvePortalAccess(user) {
    const [staffResult, clientResult] = await Promise.all([
        lordblessSupabase
            .from("staff_profiles")
            .select("user_id, active")
            .eq("user_id", user.id)
            .maybeSingle(),
        lordblessSupabase
            .from("client_accounts")
            .select("auth_user_id, client_id, access_status")
            .eq("auth_user_id", user.id)
            .maybeSingle()
    ]);

    if (staffResult.error) throw staffResult.error;
    if (clientResult.error) throw clientResult.error;

    const staff = staffResult.data;
    const client = clientResult.data;

    if (staff && client) {
        throw new Error("This account has conflicting staff and client access. Contact LORDBLESS support.");
    }

    if (staff?.active) return { portal: "admin" };

    if (client) {
        if (client.access_status === "active") return { portal: "client" };
        if (client.access_status === "invited") return { invited: true };

        const status = String(client.access_status || "unknown").replaceAll("_", " ");
        return {
            pending: true,
            message: `Your Client Portal access is ${status}. Contact LORDBLESS support if you need assistance.`
        };
    }

    if (staff && !staff.active) {
        throw new Error("This staff account is inactive. Contact LORDBLESS support.");
    }

    throw new Error("Portal access has not been assigned to this account. Contact LORDBLESS support.");
}

async function handlePortalSession(session) {
    if (portalResetMode || portalPasswordResetComplete) return;

    const version = ++portalResolutionVersion;

    if (!session?.user) {
        showPortalLogin("Sign in with your LORDBLESS account.");
        return;
    }

    portalLoginForm.hidden = true;
    portalForgotPasswordButton.hidden = true;
    portalRecoveryForm.hidden = true;
    portalSignOutButton.hidden = false;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = "Checking your portal access...";

    try {
        const access = await resolvePortalAccess(session.user);
        if (version !== portalResolutionVersion) return;

     
if (access.invited) {
    portalSignOutButton.hidden = false;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent =
        "Your password is set. Your Client Portal access is pending Finance verification of your initial assessment payment.";
    return;
}

        if (access.pending) {
            portalSignOutButton.hidden = false;
            portalAuthMessage.dataset.error = "true";
            portalAuthMessage.textContent = access.message;
            return;
        }

        portalAuthMessage.textContent = "Access confirmed. Opening your portal...";
        routePortalRole(access.portal);
    } catch (error) {
        if (version !== portalResolutionVersion) return;
        portalAuthMessage.dataset.error = "true";
        portalAuthMessage.textContent = error?.message || String(error);
    }
}

portalLoginForm.addEventListener("submit", async event => {
    event.preventDefault();
    portalPasswordResetComplete = false;
    portalSignInButton.disabled = true;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = "Signing in...";

    try {
        const { data, error } = await lordblessSupabase.auth.signInWithPassword({
            email: portalEmailInput.value.trim(),
            password: portalPasswordInput.value
        });
        if (error) throw error;

        portalPasswordInput.value = "";
        await handlePortalSession(data.session);
        portalSignInButton.disabled = false;
    } catch (error) {
        portalAuthMessage.dataset.error = "true";
        portalAuthMessage.textContent = error?.message || String(error);
        portalSignInButton.disabled = false;
    }
});

portalForgotPasswordButton.addEventListener("click", () => {
    portalLoginForm.hidden = true;
    portalForgotPasswordButton.hidden = true;
    portalRecoveryForm.hidden = false;
    portalResetPasswordForm.hidden = true;
    portalSignOutButton.hidden = true;
    portalRecoveryEmailInput.value = portalEmailInput.value.trim();
    portalRecoveryEmailInput.focus();
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = "Enter your email to receive a password reset link.";
});

portalRecoveryBackButton.addEventListener("click", () => {
    showPortalLogin("Sign in with your LORDBLESS account.");
});

portalRecoveryForm.addEventListener("submit", async event => {
    event.preventDefault();
    const recoveryButton = portalRecoveryForm.querySelector('[type="submit"]');
    recoveryButton.disabled = true;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = "Sending password reset link...";

    try {
        const email = portalRecoveryEmailInput.value.trim();
        const { error } = await lordblessSupabase.auth.resetPasswordForEmail(email, {
            redirectTo: "https://lordblessconsultancy.com/portal-login.html"
        });
        if (error) throw error;
        portalAuthMessage.textContent = "If an account exists for that email, a password reset link has been sent.";
    } catch (error) {
        portalAuthMessage.dataset.error = "true";
        portalAuthMessage.textContent = error?.message || String(error);
    } finally {
        recoveryButton.disabled = false;
    }
});

portalResetPasswordForm.addEventListener("submit", async event => {
    event.preventDefault();
    const newPassword = portalNewPasswordInput.value;

    if (newPassword !== portalConfirmPasswordInput.value) {
        portalAuthMessage.dataset.error = "true";
        portalAuthMessage.textContent = "The new password and confirmation do not match.";
        portalConfirmPasswordInput.focus();
        return;
    }

    const resetButton = portalResetPasswordForm.querySelector('[type="submit"]');
    resetButton.disabled = true;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = "Updating your password...";

    try {
        const { error } = await lordblessSupabase.auth.updateUser({ password: newPassword });
        if (error) throw error;

        // Clear expired invitation/recovery tokens after successful password setup.
window.history.replaceState(
    {},
    document.title,
    window.location.pathname
);

        portalRecoveryEmail = portalRecoveryEmail || portalEmailInput.value.trim();
        let signOutFailed = false;

        try {
            const { error: signOutError } = await lordblessSupabase.auth.signOut();
            signOutFailed = Boolean(signOutError);
        } catch {
            signOutFailed = true;
        }

        portalNewPasswordInput.value = "";
        portalConfirmPasswordInput.value = "";
        if (portalRecoveryEmail) portalEmailInput.value = portalRecoveryEmail;
        portalPasswordInput.value = "";

        // Prevent the auth listener from routing immediately after password setup.
        portalPasswordResetComplete = true;
        const successMessage = "Your password has been updated. You can now sign in with your new password.";
        showPortalLogin(signOutFailed
            ? `${successMessage} If your session remains active, refresh this page before signing in.`
            : successMessage);
    } catch (error) {
        portalAuthMessage.dataset.error = "true";
        portalAuthMessage.textContent = error?.message || String(error);
    } finally {
        resetButton.disabled = false;
    }
});

portalSignOutButton.addEventListener("click", async () => {
    portalSignOutButton.disabled = true;

    try {
        const { error } = await lordblessSupabase.auth.signOut();
        if (error) throw error;

        portalPasswordInput.value = "";
        portalSignInButton.disabled = false;
        portalResetMode = false;
        portalPasswordResetComplete = false;
        await handlePortalSession(null);
    } catch (error) {
        portalAuthMessage.dataset.error = "true";
        portalAuthMessage.textContent = error?.message || String(error);
    } finally {
        portalSignOutButton.disabled = false;
    }
});

lordblessSupabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
        showPasswordResetForm(session);
        return;
    }

    if (portalResetMode || portalPasswordResetComplete) return;
    if (event === "INITIAL_SESSION") return;
    void handlePortalSession(session);
});

async function initializeAuthentication() {
    try {
        const { data, error } = await lordblessSupabase.auth.getSession();
        if (error) throw error;
        const session = data?.session;

        if (isInviteLink) {
            if (session?.user) {
                showPasswordResetForm(session);
            } else {
                showPortalLogin("Open the invitation link again to continue setting up your account.");
            }
            return;
        }

        if (isRecoveryLink) {
            if (session?.user) {
                showPasswordResetForm(session);
            } else {
                showPortalLogin("Open the password reset link again to continue.");
            }
            return;
        }

        await handlePortalSession(session);
    } catch (error) {
        portalAuthMessage.dataset.error = "true";
        portalAuthMessage.textContent = error?.message || String(error);
        portalSignInButton.disabled = false;
    }
}

initializePortalUi();
void initializeAuthentication();
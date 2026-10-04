"use strict";

const portalLoginForm =
    document.getElementById("portal-login-form");
const portalEmailInput =
    document.getElementById("portal-email");
const portalPasswordInput =
    document.getElementById("portal-password");
const portalAuthMessage =
    document.getElementById("portal-auth-message");
const portalSignOutButton =
    document.getElementById("portal-sign-out");
const portalSignInButton =
    portalLoginForm.querySelector('[type="submit"]');

let portalRedirectStarted = false;
let portalResolutionVersion = 0;


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
    let client = clientResult.data;

    if (client?.access_status === "invited") {
        const { error: activationError } =
            await lordblessSupabase.rpc("activate_client_account");
        if (activationError) throw activationError;

        const { data: refreshedClient, error: refreshError } =
            await lordblessSupabase
                .from("client_accounts")
                .select("auth_user_id, client_id, access_status")
                .eq("auth_user_id", user.id)
                .maybeSingle();

        if (refreshError) throw refreshError;
        client = refreshedClient;
    }

    if (staff && client) {
        throw new Error("This account has conflicting staff and client access. Contact LORDBLESS support.");
    }

    if (staff?.active) return { portal: "admin" };

    if (client) {
        if (client.access_status === "active") {
            return { portal: "client" };
        }
        return {
            pending: true,
            message: `Your Client Portal access is ${client.access_status.replaceAll("_", " ")}. Contact LORDBLESS support if you need assistance.`
        };
    }

    if (staff && !staff.active) {
        throw new Error("This staff account is inactive. Contact LORDBLESS support.");
    }

    throw new Error("Portal access has not been assigned to this account. Contact LORDBLESS support.");
}


async function handlePortalSession(session) {
    const version = ++portalResolutionVersion;

    if (!session?.user) {
        portalLoginForm.hidden = false;
        portalSignInButton.disabled = false;
        portalSignOutButton.hidden = true;
        portalAuthMessage.dataset.error = "false";
        portalAuthMessage.textContent =
            "Sign in with your LORDBLESS account.";
        return;
    }

    portalLoginForm.hidden = true;
    portalSignOutButton.hidden = false;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = "Checking your portal access...";

    try {
        const access = await resolvePortalAccess(session.user);
        if (version !== portalResolutionVersion) return;

        if (access.pending) {
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
    portalSignInButton.disabled = true;
    portalAuthMessage.dataset.error = "false";
    portalAuthMessage.textContent = "Signing in...";

    try {
        const { data, error } =
            await lordblessSupabase.auth.signInWithPassword({
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


portalSignOutButton.addEventListener("click", async () => {
    portalSignOutButton.disabled = true;

    try {
        const { error } = await lordblessSupabase.auth.signOut();
        if (error) throw error;
        portalPasswordInput.value = "";
        portalSignInButton.disabled = false;
        await handlePortalSession(null);
    } catch (error) {
        portalAuthMessage.dataset.error = "true";
        portalAuthMessage.textContent = error?.message || String(error);
    } finally {
        portalSignOutButton.disabled = false;
    }
});


lordblessSupabase.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION") return;
    void handlePortalSession(session);
});


lordblessSupabase.auth.getSession().then(({ data, error }) => {
    if (error) {
        portalAuthMessage.dataset.error = "true";
        portalAuthMessage.textContent = error.message;
        portalSignInButton.disabled = false;
        return;
    }

    void handlePortalSession(data.session);
}).catch(error => {
    portalAuthMessage.dataset.error = "true";
    portalAuthMessage.textContent = error?.message || String(error);
    portalSignInButton.disabled = false;
});

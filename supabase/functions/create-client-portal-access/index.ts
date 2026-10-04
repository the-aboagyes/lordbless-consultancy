import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const inviteRedirectUrl = Deno.env.get("PORTAL_INVITE_REDIRECT_URL");
const allowedOrigins = (Deno.env.get("PORTAL_ALLOWED_ORIGINS") || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const jsonHeaders = {
    "Content-Type": "application/json",
    "Vary": "Origin",
};

function response(
    status: number,
    body: Record<string, unknown>,
    origin?: string,
) {
    const headers = new Headers(jsonHeaders);
    if (origin && allowedOrigins.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
        headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
        headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    }
    return new Response(JSON.stringify(body), { status, headers });
}

function isUuid(value: unknown): value is string {
    return typeof value === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

Deno.serve(async (request) => {
    const origin = request.headers.get("origin") || undefined;

    if (origin && !allowedOrigins.includes(origin)) {
        return response(403, { error: "Origin is not allowed." });
    }

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                ...jsonHeaders,
                ...(origin ? {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                } : {}),
            },
        });
    }

    if (request.method !== "POST") {
        return response(405, { error: "Method not allowed." }, origin);
    }

    if (!supabaseUrl || !serviceRoleKey || !inviteRedirectUrl) {
        return response(500, { error: "Portal invitation function is not configured." }, origin);
    }

    const authorization = request.headers.get("Authorization") || "";
    const accessToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!accessToken) {
        return response(401, { error: "An authenticated staff session is required." }, origin);
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } =
        await serviceClient.auth.getUser(accessToken);
    const caller = authData.user;
    if (authError || !caller) {
        return response(401, { error: "The staff session is invalid or expired." }, origin);
    }

    const { data: profile, error: profileError } = await serviceClient
        .from("staff_profiles")
        .select("user_id, active")
        .eq("user_id", caller.id)
        .maybeSingle();

    if (profileError || !profile?.active) {
        return response(403, { error: "Active staff access is required." }, origin);
    }

    const { data: staffRoles, error: rolesError } = await serviceClient
        .from("staff_roles")
        .select("role_code")
        .eq("user_id", caller.id);

    const { data: directPermissions, error: directPermissionsError } =
        await serviceClient
            .from("staff_permissions")
            .select("permission_code")
            .eq("user_id", caller.id);

    if (rolesError || directPermissionsError) {
        return response(500, { error: "Unable to verify staff permissions." }, origin);
    }

    const roleCodes = (staffRoles || []).map((item) => item.role_code);
    const directPermissionCodes = (directPermissions || [])
        .map((item) => item.permission_code);

    let rolePermissionCodes: string[] = [];
    if (roleCodes.length) {
        const { data: rolePermissions, error: rolePermissionsError } =
            await serviceClient
                .from("role_permissions")
                .select("permission_code")
                .in("role_code", roleCodes);

        if (rolePermissionsError) {
            return response(500, { error: "Unable to verify staff permissions." }, origin);
        }
        rolePermissionCodes = (rolePermissions || [])
            .map((item) => item.permission_code);
    }

    const canCreateAccess = roleCodes.includes("overall_admin") ||
        directPermissionCodes.includes("admin.all") ||
        directPermissionCodes.includes("clients.portal_access") ||
        rolePermissionCodes.includes("clients.portal_access") ||
        rolePermissionCodes.includes("admin.all");

    if (!canCreateAccess) {
        return response(403, { error: "You do not have permission to create Client Portal access." }, origin);
    }

    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return response(400, { error: "A JSON request body is required." }, origin);
    }

    const clientId = body.client_id;
    if (!isUuid(clientId)) {
        return response(400, { error: "A valid client_id is required." }, origin);
    }

    const { data: client, error: clientError } = await serviceClient
        .from("clients")
        .select("id, email")
        .eq("id", clientId)
        .maybeSingle();

    if (clientError || !client) {
        return response(404, { error: "The client record was not found." }, origin);
    }
    if (!client.email?.trim()) {
        return response(422, { error: "This client record has no email address for an invitation." }, origin);
    }

    const { data: existingAccount, error: accountLookupError } =
        await serviceClient
            .from("client_accounts")
            .select("auth_user_id, access_status")
            .eq("client_id", client.id)
            .maybeSingle();

    if (accountLookupError) {
        return response(500, { error: "Unable to check existing portal access." }, origin);
    }
    if (existingAccount) {
        return response(409, { error: "This client already has a linked portal account." }, origin);
    }

    const { data: inviteData, error: inviteError } =
        await serviceClient.auth.admin.inviteUserByEmail(
            client.email.trim(),
            { redirectTo: inviteRedirectUrl },
        );

    const invitedUser = inviteData.user;
    if (inviteError || !invitedUser) {
        return response(409, { error: inviteError?.message || "The invitation could not be created." }, origin);
    }

    const { error: metadataError } = await serviceClient.auth.admin
        .updateUserById(invitedUser.id, {
            app_metadata: {
                ...invitedUser.app_metadata,
                portal_role: "client",
            },
        });

    if (metadataError) {
        await serviceClient.auth.admin.deleteUser(invitedUser.id);
        return response(500, { error: "The invitation role could not be assigned." }, origin);
    }

    const { error: linkError } = await serviceClient
        .from("client_accounts")
        .insert({
            auth_user_id: invitedUser.id,
            client_id: client.id,
            access_status: "invited",
            invited_at: new Date().toISOString(),
        });

    if (linkError) {
        await serviceClient.auth.admin.deleteUser(invitedUser.id);
        return response(500, { error: "The invitation was created but the client link could not be saved." }, origin);
    }

    return response(201, {
        success: true,
        client_id: client.id,
        access_status: "invited",
    }, origin);
});

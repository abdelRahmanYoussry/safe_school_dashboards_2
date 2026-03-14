import { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// The real backend API base URL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const BACKEND_AUTH_PATH = "/safeschool/auth/dashboard-login";

export function setupAuth(app: Express) {
    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
    }

    // 1) Super Admin Session
    const superSessionSettings: session.SessionOptions = {
        name: "super.sid",
        secret: process.env.REPL_ID || "school-super-hub-secret",
        resave: false,
        saveUninitialized: false,
        store: new MemoryStore({
            checkPeriod: 86400000,
        }),
        cookie: {
            secure: app.get("env") === "production",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    };
    const superSessionMiddleware = session(superSessionSettings);

    // 2) School Admin Session
    const adminSessionSettings: session.SessionOptions = {
        name: "admin.sid",
        secret: process.env.REPL_ID || "school-admin-hub-secret",
        resave: false,
        saveUninitialized: false,
        store: new MemoryStore({
            checkPeriod: 86400000,
        }),
        cookie: {
            secure: app.get("env") === "production",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    };
    const adminSessionMiddleware = session(adminSessionSettings);

    // 3) Conditional Middleware Router
    app.use((req, res, next) => {
        let scope = req.headers["x-session-scope"] as string | undefined;
        const url = req.url;
        
        // Fallback scope detection based on URL path or referer
        if (!scope) {
            if (url.startsWith('/api/admin')) {
                scope = "admin";
            } else if (req.headers.referer?.toLowerCase().includes('/admin')) {
                scope = "admin";
            }
        }

        if (process.env.NODE_ENV === "development") {
            const hasHeader = req.headers["x-session-scope"] ? `header: ${req.headers["x-session-scope"]}` : 'header: none';
            const detectedScope = scope || 'super';
            // Only log API requests to keep terminal clean
            if (url.startsWith('/api')) {
                console.log(`[auth] Scope: ${detectedScope.toUpperCase()} | request: ${url} (${hasHeader}${!req.headers["x-session-scope"] && scope ? ' | path-fallback' : ''})`);
            }
        }

        if (scope === "admin") {
            adminSessionMiddleware(req, res, next);
        } else {
            // Default to super admin
            superSessionMiddleware(req, res, next);
        }
    });

    /**
     * POST /api/login
     * Proxies credentials to the real backend at localhost:3000.
     * Stores the JWT access_token in the session on success.
     */
    app.post("/api/login", async (req, res) => {
        const { email, password } = req.body;
        const scope = req.headers["x-session-scope"];

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        try {
            console.log(`[auth] Login attempt for ${email} on scope: ${scope}`);
            const backendRes = await fetch(`${BACKEND_URL}${BACKEND_AUTH_PATH}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ email, password, rememberMe: true }),
            });

            const data = await backendRes.json() as any;

            if (!backendRes.ok || data.error) {
                console.log(`[auth] Login failed for ${email}: ${data?.message || 'Invalid credentials'}`);
                return res.status(401).json({ message: data?.message || "Invalid email or password" });
            }

            // Store JWT + user info in session
            const sessionData = req.session as any;
            sessionData.accessToken = data.data.access_token;
            sessionData.refreshToken = data.data.refresh_token;
            sessionData.user = data.data.user;

            console.log(`[auth] Login success for ${email}. Session ID: ${req.sessionID} (Scope: ${scope})`);
            return res.json(data.data.user);
        } catch (err: any) {
            console.error("[auth] Backend login proxy error:", err.message);
            return res.status(500).json({ message: "Could not reach the authentication server. Is the backend running on port 3000?" });
        }
    });

    app.post("/api/logout", (req, res) => {
        req.session.destroy(() => {
            res.sendStatus(204);
        });
    });

    app.get("/api/user", (req, res) => {
        const sessionData = req.session as any;
        if (!sessionData?.user) return res.status(401).json({ message: "Not authenticated" });
        res.json(sessionData.user);
    });
}

/**
 * Middleware to require an active session.
 * Attaches the session's JWT to res.locals so route handlers can use it for backend calls.
 */
export function requireAuth(req: any, res: any, next: any) {
    const sessionData = req.session as any;
    if (!sessionData?.user || !sessionData?.accessToken) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    res.locals.accessToken = sessionData.accessToken;
    next();
}

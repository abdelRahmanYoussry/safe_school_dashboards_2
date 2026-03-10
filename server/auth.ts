import { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// The real backend API base URL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const BACKEND_AUTH_PATH = "/safeschool/auth/dashboard-login";

export function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
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

    if (app.get("env") === "production") {
        app.set("trust proxy", 1);
    }

    app.use(session(sessionSettings));

    /**
     * POST /api/login
     * Proxies credentials to the real backend at localhost:3000.
     * Stores the JWT access_token in the session on success.
     */
    app.post("/api/login", async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        try {
            const backendRes = await fetch(`${BACKEND_URL}${BACKEND_AUTH_PATH}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ email, password, rememberMe: true }),
            });

            const data = await backendRes.json() as any;

            if (!backendRes.ok || data.error) {
                return res.status(401).json({ message: data?.message || "Invalid email or password" });
            }

            // Store JWT + user info in session
            const sessionData = req.session as any;
            sessionData.accessToken = data.data.access_token;
            sessionData.refreshToken = data.data.refresh_token;
            sessionData.user = data.data.user;

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

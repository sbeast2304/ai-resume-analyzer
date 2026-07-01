import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/auth", "routes/auth.tsx"), // <-- 'routes' ki jagah 'route' use hoga aur .tsx extension aayega
] satisfies RouteConfig;
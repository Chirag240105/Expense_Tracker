// Re-export everything from userContext so both import paths work.
// Files importing from "context/Context" get the same live context object
// as files importing from "context/userContext".
export { UserContext } from "./UserContext.js";
export { UserProvider } from "./userContext.jsx";
export { useUser } from "./useUser.js";

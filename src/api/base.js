// Single source of truth for the backend base URL.
//
// Default is the relative path /zbss/api, which the browser resolves
// against whichever host loaded the page:
//   - intranet -> aps2.zemenbank.com/zbss/api
//   - public   -> zhr.zemenbank.com/zbss/api (rewritten by 10.1.1.24 to the backend)
// One build works in both places.
//
// Override via VITE_API_BASE in .env.development (or any env file) if you
// need to point dev at a remote backend, e.g. VITE_API_BASE=https://staging.example.com/zbss/api
export const API_BASE = import.meta.env.VITE_API_BASE || '/zbss/api';

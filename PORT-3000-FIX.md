## Quick Fix for Port 3000 Stuck on Windows

If your dev server (Next.js, Turbo, etc.) doesn't close cleanly and leaves port 3000 stuck, use the following steps:

1. Use the provided script:
   - Run `pwsh ./kill-port-3000.ps1` in your project root.
   - Or, if you want a shortcut, add this to your package.json scripts:
     ```json
     "scripts": {
       "kill-port-3000": "pwsh ./kill-port-3000.ps1"
     }
     ```
   - Then run: `npm run kill-port-3000` or `pnpm kill-port-3000`

2. This will force-kill any process using port 3000.

### Why does this happen?
- Some dev tools on Windows don't handle shutdown signals well, especially with Ctrl+C or Ctrl+X.
- This script is a safe workaround to avoid manual process hunting.

---

If you want to automate this further or bind it to a keyboard shortcut, let me know!

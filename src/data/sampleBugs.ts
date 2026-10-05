export interface SampleBug {
  id: string;
  name: string;
  severityLabel: string;
  category: string;
  rawText: string;
  context?: string;
}

export const SAMPLE_BUGS: SampleBug[] = [
  {
    id: 'stripe-timeout-checkout',
    name: 'Payment 504 Gateway & Double Billing',
    severityLabel: 'Critical',
    category: 'Backend / Billing',
    rawText: `URGENT: Customers complaining they got billed twice on Black Friday deals!
Support received 14 tickets in the last 20 minutes from users trying to buy the Annual Pro plan.
They click "Place Order", the spinner spins for like 60 seconds, then screen turns white or shows "504 Gateway Timeout".
Naturally, people clicked "Place Order" again 3 times. Now their credit cards show multiple $240 pending authorizations!
Checking Sentry: we see a bunch of \`AxiosError: timeout of 30000ms exceeded\` hitting \`/api/v2/checkout/charge\`.
Database CPU is sitting at 94% on primary Postgres.
Here is the error snippet from the logs:
[2026-10-05T21:40:12.312Z] ERROR [CheckoutWorker-pool-4] - POST https://api.stripe.com/v1/payment_intents failed: 504 Timeout after 30000ms.
[2026-10-05T21:40:12.315Z] ERROR [CheckoutWorker-pool-4] - Unhandled transaction abort: QueryFailedError: canceling statement due to statement timeout (PID 48291).
User ID affected examples: usr_9941a, usr_8820f, usr_11204.
Is Stripe down or is our lock table toasted? We need to stop duplicate charges ASAP!`,
    context: 'Node.js Express microservice with TypeORM, PostgreSQL 16 on AWS RDS, Stripe API v2024, Redis lock cache.',
  },
  {
    id: 'safari-memory-leak',
    name: 'iOS Safari Memory Exhaustion Crash',
    severityLabel: 'High',
    category: 'Frontend / Mobile Web',
    rawText: `Hey team, QA reported that our analytics dashboard completely crashes on iPhone 15 Pro (iOS 17 & 18 Safari).
Steps from QA:
1. Log into mobile web at /dashboard/metrics
2. Scroll down past the 8 SVG live-updating charts
3. Switch date range picker from "Today" to "Last 30 Days" about 4 or 5 times
4. The entire browser tab turns gray and reloads with the native iOS banner: "This webpage was reloaded because a problem repeatedly occurred."
Tested on Chrome desktop: memory goes from 85MB up to 920MB and never gets garbage collected when switching tabs.
Console shows thousands of:
[Warning] CanvasRenderingContext2D / SVG WebGL context lost or unbounded retain count on ResizeObserver callback.
Looks like every time the chart re-renders, the event listeners or Canvas contexts aren't being disposed.
Our enterprise client executive is presenting from an iPad tomorrow morning!`,
    context: 'React 19 SPA, Tailwind CSS, Recharts / D3.js, WebSocket live telemetry feed.',
  },
  {
    id: 'oauth-token-race',
    name: 'Multi-Tab OAuth Refresh Desync',
    severityLabel: 'Medium',
    category: 'Auth / Security',
    rawText: `User bug report from forum:
"Whenever I have your app open in two browser tabs at once, after working for about an hour I get randomly booted out to the login screen. It says 'Invalid Refresh Token (Revoked)'.
If I only have one tab open, I can stay logged in all day without getting logged out."

Dev investigation:
Our access tokens expire every 15 minutes. The frontend Axios interceptor intercepts 401s and hits /api/auth/refresh with the one-time refresh token cookie.
When two tabs are open, both tabs fire the 401 interceptor almost simultaneously within 12 milliseconds of each other.
Tab 1's refresh request hits the server and rotates the refresh token in Redis.
Tab 2's refresh request arrives with the OLD refresh token that was just invalidated!
Server thinks someone is doing a replay attack because the old token was used after rotation, so the auth security middleware triggers an emergency revoke for ALL user sessions!`,
    context: 'Next.js frontend, Go auth service, JWT with 15min expiry, Redis rotating refresh token store.',
  },
  {
    id: 'hydration-dark-mode-flash',
    name: 'SSR Hydration Mismatch & Dark Mode Glitch',
    severityLabel: 'Low',
    category: 'UI / UX',
    rawText: `Hey, noticed an annoying visual glitch on initial page load when system preference is set to dark mode.
When you visit the site from a fresh incognito window:
1. Screen flashes blinding white for about 150ms
2. Then dark mode kicks in
3. In browser dev tools console, there's a big red warning:
"Hydration failed because the server-rendered HTML didn't match the client.
Expected server HTML to contain class='light' but client rendered class='dark'."
Also, the avatar dropdown menu in the top right renders with broken inline styles until you click somewhere else on the page.
Doesn't cause any data loss or crash, but looks very amateurish for our marketing landing pages.`,
    context: 'React 19 with SSR / Vite, next-themes, CSS dark mode toggle.',
  },
];

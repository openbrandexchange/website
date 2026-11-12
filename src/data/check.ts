// The online OBX compatibility check (/<lang>/check/). The page is static; /js/check.js runs the
// form against the API at /api/check (a Pages Function in front of the conformance container).

/**
 * Cloudflare Turnstile site key of the check form: the widget "openbrandexchange.com compatibility
 * check" (managed; hostnames openbrandexchange.com and openbrandexchange.pages.dev). Public by
 * design; the secret lives only in the obx-checker Worker. The e2e tests stub Turnstile.
 */
export const TURNSTILE_SITE_KEY = '0x4AAAAAAF-e3OHv1vV53SJJ';

/** Turnstile, explicit rendering. Loaded by /js/check.js on the check page only. */
export const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** The API of the check: POST runs a check (NDJSON stream), GET ?id= returns a stored report. */
export const CHECK_API = '/api/check';

/** Where a test id is defined: its row in the conformance tables of the spec. */
export const SPEC_TEST_URL = 'https://github.com/openbrandexchange/spec/blob/main/docs/conformance.md#:~:text=';

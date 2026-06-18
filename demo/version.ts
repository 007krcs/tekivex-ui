// Single source of truth for the version shown in the demo chrome.
// Imported from the repo root package.json so it can never drift from the
// published version (previously hardcoded "v3.17.0" in three places).
import pkg from '../package.json';

export const TKX_VERSION = `v${pkg.version}`;

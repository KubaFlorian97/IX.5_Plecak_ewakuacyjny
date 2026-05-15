"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

/**
 * =========================
 *  CONFIG (edit here)
 * =========================
 */
const CONFIG = {
    remotePackageJsonUrl:
        "https://raw.githubusercontent.com/zpe-projekty/zpe-port/refs/heads/main/package.json",
    localPackageJsonPath: "./packages/zpe-port/package.json",

    // Domyślnie co 24h
    intervalMs: 24 * 60 * 60 * 1000,

    // Jeśli true: nie wypisuje warningów/errorów komunikacji (domyślnie true)
    quiet: true,

    cacheFileName: ".check-cache.json",
    requestTimeoutMs: 8000,
    maxRedirects: 5
};

/**
 * ANSI colors (bez zależności typu chalk)
 */
const COLOR = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    dim: "\x1b[2m",
    bold: "\x1b[1m"
};

function green(s) {
    return `${COLOR.green}${s}${COLOR.reset}`;
}
function red(s) {
    return `${COLOR.red}${s}${COLOR.reset}`;
}
function yellow(s) {
    return `${COLOR.yellow}${s}${COLOR.reset}`;
}
function dim(s) {
    return `${COLOR.dim}${s}${COLOR.reset}`;
}
function bold(s) {
    return `${COLOR.bold}${s}${COLOR.reset}`;
}

/**
 * -------------------------
 * SemVer (minimal, solid)
 * -------------------------
 */
function parseSemver(version) {
    if (typeof version !== "string") return null;
    const v = version.trim();
    const [coreAndPre] = v.split("+", 1);
    const [core, pre = ""] = coreAndPre.split("-", 2);

    const parts = core.split(".");
    if (parts.length < 1 || parts.length > 3) return null;

    const major = toInt(parts[0]);
    const minor = toInt(parts[1] ?? "0");
    const patch = toInt(parts[2] ?? "0");
    if (major === null || minor === null || patch === null) return null;

    const prerelease = pre === "" ? [] : pre.split(".").map(String);
    return { major, minor, patch, prerelease };
}

function toInt(s) {
    if (!/^\d+$/.test(String(s))) return null;
    const n = Number(s);
    return Number.isSafeInteger(n) ? n : null;
}

function compareSemver(aStr, bStr) {
    const a = parseSemver(aStr);
    const b = parseSemver(bStr);
    if (!a || !b) return null;

    if (a.major !== b.major) return a.major > b.major ? 1 : -1;
    if (a.minor !== b.minor) return a.minor > b.minor ? 1 : -1;
    if (a.patch !== b.patch) return a.patch > b.patch ? 1 : -1;

    const aPre = a.prerelease;
    const bPre = b.prerelease;
    const aHas = aPre.length > 0;
    const bHas = bPre.length > 0;

    if (!aHas && !bHas) return 0;
    if (!aHas && bHas) return 1;
    if (aHas && !bHas) return -1;

    const len = Math.max(aPre.length, bPre.length);
    for (let i = 0; i < len; i++) {
        const ai = aPre[i];
        const bi = bPre[i];

        if (ai === undefined) return -1;
        if (bi === undefined) return 1;

        const aNum = /^\d+$/.test(ai) ? Number(ai) : null;
        const bNum = /^\d+$/.test(bi) ? Number(bi) : null;

        if (aNum !== null && bNum !== null) {
            if (aNum !== bNum) return aNum > bNum ? 1 : -1;
        } else if (aNum !== null && bNum === null) {
            return -1;
        } else if (aNum === null && bNum !== null) {
            return 1;
        } else {
            if (ai !== bi) return ai > bi ? 1 : -1;
        }
    }
    return 0;
}

/**
 * -------------------------
 * Remote fetch (http/https)
 * -------------------------
 */
function fetchJson(url, { timeoutMs, maxRedirects }) {
    return new Promise((resolve, reject) => {
        const doRequest = (currentUrl, redirectsLeft) => {
            const lib = currentUrl.startsWith("https:") ? https : http;

            const req = lib.get(currentUrl, (res) => {
                const { statusCode, headers } = res;

                if (
                    statusCode &&
                    statusCode >= 300 &&
                    statusCode < 400 &&
                    headers.location
                ) {
                    if (redirectsLeft <= 0) {
                        res.resume();
                        return reject(
                            new Error(
                                `Too many redirects while fetching ${url}`
                            )
                        );
                    }
                    const nextUrl = new URL(
                        headers.location,
                        currentUrl
                    ).toString();
                    res.resume();
                    return doRequest(nextUrl, redirectsLeft - 1);
                }

                if (!statusCode || statusCode < 200 || statusCode >= 300) {
                    res.resume();
                    return reject(
                        new Error(
                            `HTTP ${statusCode} while fetching ${currentUrl}`
                        )
                    );
                }

                let data = "";
                res.setEncoding("utf8");
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(
                            new Error(
                                `Invalid JSON from ${currentUrl}: ${e.message}`
                            )
                        );
                    }
                });
            });

            req.on("error", reject);
            req.setTimeout(timeoutMs, () => {
                req.destroy(
                    new Error(
                        `Timeout after ${timeoutMs}ms while fetching ${currentUrl}`
                    )
                );
            });
        };

        doRequest(url, maxRedirects);
    });
}

/**
 * -------------------------
 * Cache (.updaterc) helpers
 * -------------------------
 */
function readCache(cachePath) {
    try {
        const raw = fs.readFileSync(cachePath, "utf8");
        const json = JSON.parse(raw);
        return json && typeof json === "object" ? json : null;
    } catch {
        return null;
    }
}

function writeCacheAtomic(cachePath, data) {
    const dir = path.dirname(cachePath);
    const tmp = path.join(
        dir,
        `${path.basename(cachePath)}.tmp-${process.pid}-${Date.now()}`
    );
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tmp, cachePath);
}

function readLocalVersion(localPackageJsonAbsPath) {
    const raw = fs.readFileSync(localPackageJsonAbsPath, "utf8");
    const json = JSON.parse(raw);
    if (!json || typeof json.version !== "string") {
        throw new Error(
            `Local package.json missing "version": ${localPackageJsonAbsPath}`
        );
    }
    return json.version.trim();
}

function parseCheckedAtMs(cache) {
    if (!cache || typeof cache.checkedAt !== "string") return NaN;
    const t = Date.parse(cache.checkedAt);
    return Number.isFinite(t) ? t : NaN;
}

/**
 * =========================
 * The Webpack Plugin
 * =========================
 */
class ZpePortUpdatePlugin {
    constructor() {
        this.name = "ZpePortUpdatePlugin";
    }

    apply(compiler) {
        const projectRoot = compiler.context || process.cwd();
        const cachePath = path.join(projectRoot, CONFIG.cacheFileName);
        const localPkgPath = path.resolve(
            projectRoot,
            CONFIG.localPackageJsonPath
        );

        compiler.hooks.done.tapPromise(this.name, async () => {
            let localVersion;
            try {
                localVersion = readLocalVersion(localPkgPath);
            } catch (e) {
                // Błąd lokalny jest istotny — nawet przy quiet
                console.log(red(`[zpe-port] updater error: ${e.message}`));
                return;
            }

            const cache = readCache(cachePath) || {};
            const lastCheckedAtMs = parseCheckedAtMs(cache);
            const now = Date.now();

            const shouldFetch =
                !cache.remoteVersion ||
                !Number.isFinite(lastCheckedAtMs) ||
                now - lastCheckedAtMs >= CONFIG.intervalMs;

            // Próg “za stare / niepewne” = 2x interval
            const staleThresholdMs = 2 * CONFIG.intervalMs;

            // Flaga: czy próba odświeżenia się nie udała
            let fetchFailed = false;

            if (shouldFetch) {
                try {
                    const remotePkg = await fetchJson(
                        CONFIG.remotePackageJsonUrl,
                        {
                            timeoutMs: CONFIG.requestTimeoutMs,
                            maxRedirects: CONFIG.maxRedirects
                        }
                    );

                    const remoteVersion =
                        remotePkg && typeof remotePkg.version === "string"
                            ? remotePkg.version.trim()
                            : null;

                    if (!remoteVersion) {
                        throw new Error(
                            `Remote package.json missing "version" at ${CONFIG.remotePackageJsonUrl}`
                        );
                    }

                    const nextCache = {
                        library: "zpe-port",
                        remotePackageJsonUrl: CONFIG.remotePackageJsonUrl,
                        localPackageJsonPath: CONFIG.localPackageJsonPath,
                        remoteVersion,
                        checkedAt: new Date().toISOString()
                    };

                    writeCacheAtomic(cachePath, nextCache);
                } catch (e) {
                    fetchFailed = true;
                    if (!CONFIG.quiet) {
                        console.log(
                            yellow(`[zpe-port] updater warning: ${e.message}`)
                        );
                    }
                }
            }

            // Porównanie zawsze: bierzemy remoteVersion z cache po ewentualnym fetch
            const cacheNow = readCache(cachePath) || {};
            const remoteVersion =
                typeof cacheNow.remoteVersion === "string"
                    ? cacheNow.remoteVersion.trim()
                    : null;
            const checkedAtMs = parseCheckedAtMs(cacheNow);

            // Jeśli nie mamy żadnej zdalnej wersji -> nieznane
            if (!remoteVersion) {
                console.log(
                    yellow(
                        "[zpe-port] status unknown: cannot determine remote version (manual check required)"
                    )
                );
                console.log(dim(`[zpe-port] local ${localVersion}`));
                return;
            }

            // Jeśli zdalne dane są zbyt stare (albo fetch się sypie od dawna)
            const ageMs = Number.isFinite(checkedAtMs)
                ? now - checkedAtMs
                : Number.POSITIVE_INFINITY;
            const isStale = ageMs > staleThresholdMs;

            const cmp = compareSemver(localVersion, remoteVersion);

            // Jeśli remote > local => update required (to jest “pewne” nawet jeśli dane stare)
            if (cmp !== null && cmp < 0) {
                console.log(
                    bold(
                        red(
                            `[zpe-port] update required (local ${localVersion} < remote ${remoteVersion})`
                        )
                    )
                );
                return;
            }

            // Jeśli semver nieparsowalny -> fallback na równość stringów
            if (cmp === null) {
                if (localVersion !== remoteVersion) {
                    console.log(
                        magenta(
                            `[zpe-port] update required (local ${localVersion} vs remote ${remoteVersion})`
                        )
                    );
                    return;
                }
                // local == remote (stringowo) -> może być stale => unknown, inaczej up to date
                if (isStale) {
                    console.log(
                        yellow(
                            "[zpe-port] status unknown: remote version info is stale (manual check required)"
                        )
                    );
                } else {
                    console.log(green(bold("[zpe-port] up to date")));
                }
                return;
            }

            // cmp >= 0 => lokalna jest równa lub nowsza od zdalnej
            // Ale jeśli nie jesteśmy w stanie odświeżać przez >2*interval, to “up to date” zamieniamy na “unknown”.
            if (isStale) {
                console.log(
                    yellow(
                        "[zpe-port] status unknown: remote version info is stale (manual check required)"
                    )
                );
                // opcjonalnie detal (bez spamowania): tylko gdy quiet=false
                if (!CONFIG.quiet) {
                    const checkedAtIso =
                        typeof cacheNow.checkedAt === "string"
                            ? cacheNow.checkedAt
                            : "unknown time";
                    console.log(
                        dim(`[zpe-port] last remote check: ${checkedAtIso}`)
                    );
                }
                return;
            }

            console.log(green(bold("[zpe-port] up to date")));
        });
    }
}

module.exports = ZpePortUpdatePlugin;

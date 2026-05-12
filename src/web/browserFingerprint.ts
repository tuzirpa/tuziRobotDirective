import type { Browser, Page, Target } from 'puppeteer-core';

/** 单次浏览器进程内保持一致，降低「同会话多页」信号突变 */
export type BrowserFingerprintProfile = {
    userAgent: string;
    acceptLanguage: string;
    hardwareConcurrency: number;
    languages: string[];
    /** Chrome 在 Windows 上 navigator.platform 多为 Win32 */
    platform: string;
};

const CHROME_MAJORS = [120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132];

const LANG_PRESETS = [
    'zh-CN,zh;q=0.9,en;q=0.8',
    'zh-CN,zh;q=0.9',
    'en-US,en;q=0.9,zh-CN;q=0.8',
    'zh-TW,zh;q=0.9,en;q=0.8'
];

const HW_CORES = [4, 6, 8, 8, 12, 12, 16, 16];

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function chromeVersionString(): string {
    const major = pick(CHROME_MAJORS);
    const a = Math.floor(Math.random() * 5000) + 1000;
    const b = Math.floor(Math.random() * 200);
    return `${major}.0.${a}.${b}`;
}

/**
 * 生成一组「看起来像正常 Windows Chrome」的客户端信号。
 * 说明：无法替代独立 IP、独立用户目录；WebGL/Canvas/字体级指纹需专业浏览器或扩展，此处为轻量混淆。
 */
export function createRandomFingerprint(): BrowserFingerprintProfile {
    const ver = chromeVersionString();
    const userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ver} Safari/537.36`;
    const acceptLanguage = pick(LANG_PRESETS);
    const hardwareConcurrency = pick(HW_CORES);
    const primary = acceptLanguage.startsWith('en') ? 'en-US' : acceptLanguage.startsWith('zh-TW') ? 'zh-TW' : 'zh-CN';
    const languages =
        primary === 'en-US'
            ? ['en-US', 'en', 'zh-CN']
            : primary === 'zh-TW'
              ? ['zh-TW', 'zh', 'en']
              : ['zh-CN', 'zh', 'en'];
    return {
        userAgent,
        acceptLanguage,
        hardwareConcurrency,
        languages,
        platform: 'Win32'
    };
}

function buildEvaluateOnNewDocumentSource(profile: BrowserFingerprintProfile): string {
    const langs = JSON.stringify(profile.languages);
    const plat = JSON.stringify(profile.platform);
    const hw = profile.hardwareConcurrency;
    return `(() => {
  try {
    const hw = ${hw};
    const langs = ${langs};
    const plat = ${plat};
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => hw, configurable: true });
    Object.defineProperty(navigator, 'language', { get: () => langs[0], configurable: true });
    Object.defineProperty(navigator, 'languages', { get: () => Object.freeze([...langs]), configurable: true });
    Object.defineProperty(navigator, 'platform', { get: () => plat, configurable: true });
    Object.defineProperty(navigator, 'webdriver', { get: () => false, configurable: true });
  } catch (e) {}
})();`;
}

async function applyToPage(page: Page, profile: BrowserFingerprintProfile): Promise<void> {
    await page.setUserAgent(profile.userAgent);
    await page.setExtraHTTPHeaders({
        'Accept-Language': profile.acceptLanguage
    });
    const src = buildEvaluateOnNewDocumentSource(profile);
    await page.evaluateOnNewDocument(src);
}

/**
 * 对当前所有页及之后新建的页面注入指纹（仅应在「新启动」的浏览器上调用一次）。
 */
export async function installFingerprintOnBrowser(
    browser: Browser,
    profile: BrowserFingerprintProfile
): Promise<void> {
    const pages = await browser.pages();
    for (const p of pages) {
        await applyToPage(p, profile).catch((err) =>
            console.warn('浏览器指纹应用到页面失败(可忽略):', err?.message || err)
        );
    }

    const onTarget = async (target: Target) => {
        if (target.type() !== 'page') return;
        const p = await target.page();
        if (!p) return;
        await applyToPage(p, profile).catch((err) =>
            console.warn('浏览器指纹应用到新页面失败:', err?.message || err)
        );
    };
    browser.on('targetcreated', onTarget);
}

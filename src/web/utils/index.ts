import { Page } from 'puppeteer-core';

/**
 * 设置浏览器页面 防检测
 * @param page 页面对象
 */
export async function setBrowserPage(page: Page) {
    // 设置user_agent
    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0'
    );
    // 设置webdriver
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'plugins', {
            get: () => [
                {
                    0: {
                        type: 'application/x-google-chrome-pdf',
                        suffixes: 'pdf',
                        description: 'Portable Document Format',
                        enabledPlugin: Plugin
                    },
                    description: 'Portable Document Format',
                    filename: 'internal-pdf-viewer',
                    length: 1,
                    name: 'Chrome PDF Plugin'
                },
                {
                    0: {
                        type: 'application/pdf',
                        suffixes: 'pdf',
                        description: '',
                        enabledPlugin: Plugin
                    },
                    description: '',
                    filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
                    length: 1,
                    name: 'Chrome PDF Viewer'
                },
                {
                    0: {
                        type: 'application/x-nacl',
                        suffixes: '',
                        description: 'Native Client Executable',
                        enabledPlugin: Plugin
                    },
                    1: {
                        type: 'application/x-pnacl',
                        suffixes: '',
                        description: 'Portable Native Client Executable',
                        enabledPlugin: Plugin
                    },
                    description: '',
                    filename: 'internal-nacl-plugin',
                    length: 2,
                    name: 'Native Client'
                }
            ]
        });
    });
    await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        window.navigator.chrome = {
            runtime: {},
            loadTimes: function () {},
            csi: function () {},
            app: {}
        };
    });
    await page.evaluateOnNewDocument(() => {
        // @ts-ignore
        // window.navigator.language = 'zh-CN';
        Object.defineProperty(navigator, 'language', { get: () => 'zh-CN' });
    });
}

/**
 * 判断selector是否为xpath
 * @param selector 选择器
 * @returns 
 */
export function isXpath(selector: string) {
    return selector.startsWith('/') || selector.startsWith('(');
}

/**
 * 将selector转换为xpath
 * @param selector 选择器
 * @returns 
 */
export function toSelector(selector: string) {
    if (isXpath(selector)) {
        return `::-p-xpath(${selector})`;
    }
    return selector;
}


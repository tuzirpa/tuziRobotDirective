import type { Browser, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.tabOperate.createNewTabAndCloseOthers',
    displayName: '新建标签并关闭其他标签',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在浏览器${browser}中新建标签页并关闭其他所有标签页，保存至：${page}',
    inputs: {
        browser: {
            name: 'browser',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '浏览器对象',
                type: 'variable',
                filtersType: 'web.browser',
                autoComplete: true
            }
        },
        forceClose: {
            name: 'forceClose',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '是否强制关闭',
                type: 'boolean',
                defaultValue: false,
                tip: '是否强制关闭标签页，如果为true则跳过beforeunload事件监听，强制关闭可能被阻止关闭的标签页'
            }
        }
    },
    outputs: {
        page: {
            name: '',
            display: '标签页对象',
            type: 'web.page',
            addConfig: {
                label: '标签页对象',
                type: 'variable',
                defaultValue: 'page'
            }
        }
    }
};

/** 单页关闭超时（毫秒）。默认 page.close() 会走 beforeunload，部分页面会无限期挂起，导致 Promise.all 永远等不到 */
const CLOSE_PAGE_TIMEOUT_MS = 30000;
/** 获取 pages / 创建页面的超时，避免底层 CDP 调用异常时卡死 */
const GET_PAGES_TIMEOUT_MS = 15000;

function closeTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error('关闭标签页超时')), CLOSE_PAGE_TIMEOUT_MS)
    );
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms))
    ]);
}

/**
 * 浏览器内部/扩展页：往往不会以「普通标签」形式出现在标签栏，但 browser.pages() 里仍可能出现，
 * 例如地址栏联想弹出层 chrome://omnibox-popup...（自动化侧可见，肉眼不一定能当标签点到）。
 * about:blank 等仍按普通页走 page.close，避免误判。
 */
function isBrowserInternalPageUrl(url: string): boolean {
    const u = (url || '').toLowerCase();
    return (
        u.startsWith('chrome://') ||
        u.startsWith('edge://') ||
        u.startsWith('devtools://') ||
        u.startsWith('chrome-extension://') ||
        u.startsWith('moz-extension://')
    );
}

async function closeTargetByCdp(page: Page): Promise<void> {
    const session = await page.target().createCDPSession();
    try {
        const res = (await session.send('Target.getTargetInfo')) as {
            targetInfo: { targetId: string };
        };
        await session.send('Target.closeTarget', { targetId: res.targetInfo.targetId });
    } finally {
        try {
            await session.detach();
        } catch {
            /* ignore */
        }
    }
}

async function closeOtherPage(page: Page, forceClose: boolean): Promise<void> {
    if (page.isClosed()) {
        return;
    }

    let url = '';
    try {
        url = page.url();
    } catch {
        url = '';
    }

    // 这些页面经常无法通过 page.close 正常关闭（会卡住）
    if (url && isBrowserInternalPageUrl(url)) {
        console.debug('检测到内部页面，改用 CDP 关闭/跳过:', url);
        try {
            await withTimeout(closeTargetByCdp(page), CLOSE_PAGE_TIMEOUT_MS, 'CDP 关闭内部页面超时');
        } catch (e) {
            console.warn('内部页面 CDP 关闭失败，直接跳过:', e);
        }
        return;
    }

    const closeSkipUnload = async (): Promise<void> => {
        if (page.isClosed()) return;
        try {
            await page.close({ runBeforeUnload: false });
            console.debug('已跳过 beforeunload 关闭标签页');
        } catch (e) {
            console.error('跳过 beforeunload 关闭仍失败:', e);
        }
    };

    try {
        if (forceClose) {
            await Promise.race([page.close({ runBeforeUnload: false }), closeTimeoutPromise()]);
        } else {
            await Promise.race([page.close(), closeTimeoutPromise()]);
        }
    } catch (err) {
        console.warn('关闭标签页超时或失败，将尝试强制关闭:', err);
        await closeSkipUnload();
    }
}

export const impl = async function ({
    browser,
    forceClose
}: {
    browser: Browser;
    forceClose: boolean;
}) {
    const newPage = await withTimeout(browser.newPage(), GET_PAGES_TIMEOUT_MS, '新建标签页超时');
    console.debug('新标签页已创建');

    console.debug('开始获取当前所有标签页');
    const pages = await withTimeout(browser.pages(), GET_PAGES_TIMEOUT_MS, '获取标签页列表超时');
    console.debug('获取标签页数量', pages.length);

    const closePromises: Promise<void>[] = [];

    for (const page of pages) {
        if (page === newPage) {
            continue;
        }
        if (page.isClosed()) {
            console.debug('页面已关闭，跳过');
            continue;
        }
        closePromises.push(
            (async () => {
                try {
                    const u = page.url();
                    console.debug('准备关闭标签页', u);
                } catch {
                    console.debug('准备关闭标签页(获取 url 失败)');
                }
                await closeOtherPage(page, forceClose);
                console.debug('关闭标签页结束');
            })()
        );
    }

    if (closePromises.length > 0) {
        console.debug('开始等待关闭其他标签页，总数', closePromises.length);
        await Promise.allSettled(closePromises);
    }

    console.debug(`已处理关闭 ${closePromises.length} 个其他标签页，保留新创建的标签页`);

    return { page: newPage };
};


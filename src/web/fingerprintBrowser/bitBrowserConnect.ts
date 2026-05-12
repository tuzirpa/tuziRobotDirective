import puppeteer, { Browser } from 'puppeteer-core';
import { Block, DirectiveTree } from 'tuzirobot/types';
import { bitBrowserOpen } from './bitBrowserApi';

/**
 * 通过比特浏览器 Local API 打开环境并连接 Puppeteer。
 * 指纹、代理等在比特客户端中配置。
 */
export const config: DirectiveTree = {
    name: 'web.fingerprint.bitBrowserConnect',
    displayName: '连接比特浏览器',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '比特 Local API ${apiBaseUrl} 窗口 ${browserWindowId}，打开 ${url}',
    inputs: {
        apiBaseUrl: {
            name: 'apiBaseUrl',
            value: 'http://127.0.0.1:54345',
            type: 'string',
            addConfig: {
                label: 'Local API 根地址',
                type: 'string',
                placeholder: 'http://127.0.0.1:54345',
                defaultValue: 'http://127.0.0.1:54345',
                required: true,
                tip: '比特浏览器设置中的本地服务地址，见官方文档 /browser/open'
            }
        },
        browserWindowId: {
            name: 'browserWindowId',
            value: '',
            type: 'string',
            addConfig: {
                label: '浏览器窗口ID',
                type: 'string',
                required: true,
                placeholder: '比特客户端中环境的窗口 id',
                tip: '对应接口 POST /browser/open 的 id'
            }
        },
        url: {
            name: 'url',
            value: '',
            type: 'string',
            addConfig: {
                label: '打开地址',
                type: 'textarea',
                placeholder: '选填，连接成功后在此标签页导航',
                defaultValue: '',
                tip: '留空则只连接，不跳转'
            }
        },
        loadTimeout: {
            name: 'loadTimeout',
            value: '30',
            type: 'number',
            addConfig: {
                label: '页面加载超时(秒)',
                type: 'string',
                defaultValue: '30',
                isAdvanced: true,
                tip: '填写 url 时生效'
            }
        },
        openArgs: {
            name: 'openArgs',
            value: '',
            type: 'string',
            addConfig: {
                label: '打开参数 args',
                type: 'textarea',
                placeholder: '空格分隔，如: --headless',
                isAdvanced: true,
                tip: '传给 /browser/open 的 args 数组（按空格拆分）'
            }
        },
        loadExtensions: {
            name: 'loadExtensions',
            value: 'false',
            type: 'string',
            addConfig: {
                label: '加载扩展中心已启用插件',
                type: 'select',
                defaultValue: 'false',
                options: [
                    { label: '否', value: 'false' },
                    { label: '是', value: 'true' }
                ],
                isAdvanced: true,
                tip: 'loadExtensions'
            }
        },
        extractIp: {
            name: 'extractIp',
            value: 'false',
            type: 'string',
            addConfig: {
                label: '尝试自动提取IP',
                type: 'select',
                defaultValue: 'false',
                options: [
                    { label: '否', value: 'false' },
                    { label: '是', value: 'true' }
                ],
                isAdvanced: true,
                tip: 'extractIp，见官方文档'
            }
        }
    },
    outputs: {
        browser: {
            name: '',
            display: '浏览器对象',
            type: 'web.browser',
            addConfig: {
                label: '浏览器对象',
                type: 'variable',
                defaultValue: 'web_browser'
            }
        },
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

export const impl = async function (
    {
        apiBaseUrl,
        browserWindowId,
        url,
        loadTimeout,
        openArgs,
        loadExtensions,
        extractIp
    }: {
        apiBaseUrl: string;
        browserWindowId: string;
        url: string;
        loadTimeout: number;
        openArgs: string;
        loadExtensions: string;
        extractIp: string;
    },
    _block: Block
) {
    const base = (apiBaseUrl && String(apiBaseUrl).trim()) || 'http://127.0.0.1:54345';
    const wid = browserWindowId && String(browserWindowId).trim();
    if (!wid) {
        throw new Error('请填写「浏览器窗口ID」');
    }

    let args: string[] | undefined;
    if (openArgs && openArgs.trim()) {
        args = openArgs.trim().split(/\s+/).filter(Boolean);
    }
    const loadExt = loadExtensions === 'true' || loadExtensions === '1';
    const extIp = extractIp === 'true' || extractIp === '1';

    console.log('比特浏览器 Local API:', base, '窗口ID:', wid);
    const openRes = await bitBrowserOpen(base, {
        id: wid,
        args,
        loadExtensions: loadExt,
        extractIp: extIp
    });

    const errHint = openRes.msg || openRes.message || JSON.stringify(openRes);
    if (!openRes.success || !openRes.data?.ws) {
        throw new Error(`比特浏览器打开失败（请确认客户端已启动且 Local API 已开启）: ${errHint}`);
    }

    const ws = openRes.data.ws;
    console.log('比特浏览器 ws:', ws, 'http:', openRes.data.http);

    const browser: Browser = await Promise.race([
        puppeteer.connect({
            browserWSEndpoint: ws,
            defaultViewport: null,
            protocolTimeout: 600000
        }),
        new Promise<never>((_resolve, reject) =>
            setTimeout(() => reject(new Error(`连接比特浏览器 CDP 超时(30s): ${ws}`)), 30000)
        )
    ]);

    const pages = await browser.pages();
    const page = pages[pages.length - 1];

    if (url && String(url).trim()) {
        let openUrl = String(url).trim();
        openUrl.startsWith('http') || (openUrl = 'http://' + openUrl);
        const timeoutSec = Number(loadTimeout) || 30;
        console.log('打开地址', openUrl);
        await page.goto(openUrl, { timeout: timeoutSec * 1000 });
    }

    return { browser, page };
};

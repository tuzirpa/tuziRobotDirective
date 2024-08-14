import puppeteer, { Page } from 'puppeteer';
import { DirectiveTree } from 'tuzirobot/types';
import child_process from 'child_process';
import { setBrowserPage } from './utils';

export const config: DirectiveTree = {
    name: 'web.create',
    displayName: '创建浏览器',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '启动${webType}并打开${url},保存至：${browser}',
    inputs: {
        webType: {
            name: 'webType',
            value: '',
            display: '内置浏览器',
            type: 'string',
            addConfig: {
                required: true,
                label: '浏览器类型',
                type: 'select',
                options: [
                    {
                        label: '内置浏览器',
                        value: 'tuziChrome'
                    },
                    {
                        label: '谷歌浏览器',
                        value: 'chrome'
                    },
                    {
                        label: 'Edge',
                        value: 'edge'
                    },
                    {
                        label: '自定义浏览器路径',
                        value: 'custom'
                    }
                ],
                defaultValue: 'tuziChrome',
                tip: '选择浏览器类型'
            }
        },
        executablePath: {
            name: 'executablePath',
            value: '',
            type: 'string',
            addConfig: {
                label: '浏览器路径',
                placeholder:
                    '如填写请输入浏览器路径，如：C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
                type: 'filePath',
                defaultValue: '',
                tip: '浏览器路径',
                filters: 'this.inputs.webType.value === "custom"'
            }
        },
        url: {
            name: 'url',
            value: '',
            type: 'string',
            addConfig: {
                label: '地址',
                type: 'textarea',
                placeholder:
                    '选填，如填写请输入地址 如：http://www.baidu.com 或 https://www.taobao.com',
                defaultValue: '',
                tip: '打开的地址'
            }
        },
        loadTimeout: {
            name: 'timeout',
            value: '30',
            type: 'number',
            addConfig: {
                label: '超时',
                type: 'string',
                placeholder: '不填或填0表示一直等待到加载完成，打开url超时时间，单位：秒',
                isAdvanced: true,
                required: true,
                defaultValue: '30',
                tip: '超时时间，单位：秒'
            }
        },
        userDataDir: {
            name: 'userDataDir',
            value: '',
            type: 'string',
            addConfig: {
                label: '用户目录',
                placeholder: '记录 cookie、缓存、用户登录数据等（比如 网站的登录状态）。',
                type: 'filePath',
                defaultValue: '',
                openDirectory: true,
                tip: '浏览器用户数据路径'
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

function regQueryExeCutablePath(regPath: string) {
    return new Promise<string>((resolve, reject) => {
        child_process.exec(`REG QUERY "${regPath}"`, function (error, stdout, _stderr) {
            if (error != null) {
                reject(error);
                return;
            }
            let exePath = '';
            const lines = stdout.split('\n');
            for (let index = 0; index < lines.length; index++) {
                const line = lines[index];
                line.indexOf('REG_SZ') !== -1 &&
                    (exePath = line.substring(line.indexOf('REG_SZ') + 6));
                if (exePath) {
                    break;
                }
            }

            const ep = exePath.trim().replace(/\\/g, '/');
            resolve(ep);
        });
    });
}

async function getExeCutablePath(type: string) {
    //读取注册表获取浏览器路径
    let path = '';

    async function regeditGet(regPoint: string, type: string) {
        let path1 = '';
        switch (type) {
            case 'chrome':
                //读取windows注册表 HKEY_LOCAL_MACHINE\SOFTWARE\Clients\StartMenuInternet\Google Chrome\DefaultIcon
                path1 = await regQueryExeCutablePath(
                    `${regPoint}\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe`
                );

                break;
            case 'edge':
                //HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe
                path1 = await regQueryExeCutablePath(
                    `${regPoint}\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe`
                );
                break;
            default:
                break;
        }
        return path1;
    }
    try {
        path = await regeditGet('HKEY_CURRENT_USER', type);
    } catch (error) {
        path = '';
    }
    if (!path) {
        path = await regeditGet('HKEY_LOCAL_MACHINE', type);
    }

    return path;
}

export const impl = async function ({
    webType,
    url,
    loadTimeout,
    executablePath,
    userDataDir
}: {
    webType: string;
    url: string;
    executablePath: string;
    loadTimeout: number;
    userDataDir: string;
}) {
    let executablePathA = '';
    if (webType === 'custom') {
        executablePathA = executablePath;
    } else {
        if (webType !== 'tuziChrome') {
            executablePathA = await getExeCutablePath(webType);
            if (!executablePathA) {
                const webBrowser = config.inputs.webType.addConfig.options?.find(
                    (item) => item.value === webType
                );
                throw new Error(`本地未安装 ${webBrowser?.label}，请设置先安装`);
            }
        }
    }

    //设备信息整合

    const ops: any = {
        headless: false,
        defaultViewport: null,
        ignoreDefaultArgs: ['--enable-automation'],
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    executablePathA && (ops.executablePath = executablePathA);
    console.debug('浏览器路径', ops.executablePath);

    ops.userDataDir = userDataDir;
    console.debug('用户目录', userDataDir);
    const browser = await puppeteer.launch(ops);

    const pages = await browser.pages();
    const page = pages[pages.length - 1];
    await setBrowserPage(page);
    if (url) {
        url.startsWith('http') || (url = 'http://' + url);
        await page.goto(url, { timeout: loadTimeout * 1000 });
    }
    return { browser, page };
};

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
                    }
                ],
                defaultValue: 'tuziChrome',
                tip: '选择浏览器类型'
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
                label: '浏览器用户数据路径',
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
    try {
        switch (type) {
            case 'chrome':
                //读取windows注册表 HKEY_LOCAL_MACHINE\SOFTWARE\Clients\StartMenuInternet\Google Chrome\DefaultIcon

                path = await regQueryExeCutablePath(
                    'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe'
                );

                break;
            case 'edge':
                //HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe
                path = await regQueryExeCutablePath(
                    'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe'
                );
                break;
            default:
                break;
        }
    } catch (error) {
        switch (type) {
            case 'chrome':
                //读取windows注册表 HKEY_LOCAL_MACHINE\SOFTWARE\Clients\StartMenuInternet\Google Chrome\DefaultIcon

                path = await regQueryExeCutablePath(
                    'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe'
                );

                break;
            case 'edge':
                //HKEY_LOCAL_MACHINE\SOFTWARE\Clients\StartMenuInternet\Microsoft Edge\DefaultIcon
                path = await regQueryExeCutablePath(
                    'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\msedge.exe'
                );
                break;
            default:
                break;
        }
    }

    return path;
}

export const impl = async function ({
    webType,
    url,
    loadTimeout,
    userDataDir
}: {
    webType: string;
    url: string;
    loadTimeout: number;
    userDataDir: string;
}) {
    let executablePathA = '';
    if (webType !== 'tuziChrome') {
        executablePathA = await getExeCutablePath(webType);
        // if (executablePath === '') {
        //     sendLog('error', `本地未安装 ${displayName}，请设置先安装 ${displayName}`, block);
        //     throw new Error('未设置chrome路径');
        // }
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
    console.log('userDataDir', userDataDir);
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

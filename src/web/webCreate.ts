// import { Page } from 'puppeteer-core';
import puppeteer, { Browser } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { getTuziAppInfo, getCurApp, sendLog } from 'tuzirobot/commonUtil';
import child_process, { exec, spawn } from 'child_process';
import path, { join } from 'path';
import fs from 'fs';
import { getAvailablePort } from './utils/portUtils';
import { Block } from 'tuzirobot/types';
import { tmpdir } from 'os';

// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// puppeteer.use(StealthPlugin());

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
                    },
                    {
                        label: '复用其他应用创建的浏览器',
                        value: 'useOtherApp'
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
        useOtherApp: {
            name: 'executablePath',
            value: '',
            type: 'string',
            addConfig: {
                label: '本地已安装的应用',
                placeholder:
                    '本地已安装的应用，用此参数复用其他应用创建的浏览器，必须选运行其他应用并有启动浏览器',
                type: 'select',
                getOptions: async (directive, appInfo, getOptionUtils) => {
                    const options = await getOptionUtils.getUserApps();
                    return options
                        .filter((item) => item.id !== appInfo.id)
                        .map((item) => {
                            return {
                                label: item.name,
                                value: item.id
                            };
                        });
                },
                defaultValue: '',
                filters: 'this.inputs.webType.value === "useOtherApp"'
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
                tip: '默认在使用当前应用的目录下创建userData目录，可自定义'
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

export const impl = async function (
    {
        webType,
        url,
        loadTimeout,
        executablePath,
        userDataDir,
        useOtherApp
    }: {
        webType: string;
        url: string;
        executablePath: string;
        loadTimeout: number;
        userDataDir: string;
        useOtherApp: string;
    },
    _block: Block
) {
    let executablePathA = '';
    console.log(webType, 'webType');
    let wsUrl: string = '';
    const tuziAppInfo = getTuziAppInfo();
    let browser: Browser;

    const browserJsonPath = path.join(tuziAppInfo.USER_DIR, 'browser.json');
    if (!fs.existsSync(browserJsonPath)) {
        fs.writeFileSync(browserJsonPath, JSON.stringify([]));
    }
    const browserJson = fs.readFileSync(browserJsonPath, 'utf-8');
    const browserJsonObj: any[] = JSON.parse(browserJson);

    const curApp = getCurApp();
    const curAppBrowser = browserJsonObj.find((item) => item.appId === curApp.APP_ID);
    if (curAppBrowser) {
        console.log(
            `当前应用之前启动过一个浏览器，wsUrl:${curAppBrowser.wsUrl}，直接复用之前的浏览器`
        );
        browser = await puppeteer.connect({
            browserWSEndpoint: curAppBrowser.wsUrl,
            defaultViewport: null
        });
    } else if (webType === 'useOtherApp') {
        console.log('复用其他应用创建的浏览器', useOtherApp);

        const browserJson = browserJsonObj.find((item) => item.appId === useOtherApp);
        if (!browserJson) {
            throw new Error(`未找到应用${useOtherApp} 的浏览器信息`);
        }
        console.log(`复用其他应用[${browserJson.appName}]创建的浏览器,${browserJson.wsUrl}`);
        browser = await puppeteer.connect({
            browserWSEndpoint: browserJson.wsUrl,
            defaultViewport: null
        });
    } else {
        const curApp = getCurApp();

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
            } else {
                executablePathA = path.join(
                    tuziAppInfo.USER_DIR,
                    'tuziChrome',
                    'chrome-win64',
                    'chrome.exe'
                );
                if (!fs.existsSync(executablePathA)) {
                    throw new Error(`内置浏览器还未安装完成，请等待安装完成后使用`);
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

        ops.userDataDir = userDataDir || path.join(curApp.APP_DIR, 'userData');

        console.debug('用户目录', userDataDir);
        const port = await getAvailablePort(11922);
        console.debug('端口', port);

        const args = ['--start-maximized'];
        const startCmd = `"${
            ops.executablePath
        }" --no-first-run --remote-debugging-port=${port} --disk-cache-dir="${
            ops.userDataDir
        }" --user-data-dir="${ops.userDataDir}" ${args.join(' ')}`;

        console.debug('启动命令', startCmd);

        const startRes = await new Promise<string>((resolve, reject) => {
            const child = exec(startCmd);
            // 子进程代码
            /* const closeBack = (data: any) => {
                if (data.action === 'close') {
                    sendLog('info', `接收停止消息：${JSON.stringify(data)}`, _block);
                    child.kill();
                }
            };
            process.on('message', closeBack);
            process.on('exit', () => {
                console.log('应用进程退出,关闭浏览器');
                browser && browser.close();
                const browserJson = fs.readFileSync(browserJsonPath, 'utf-8');
                let browserJsonObj: any[] = JSON.parse(browserJson);
                browserJsonObj = browserJsonObj.filter((item) => item.wsUrl !== wsUrl);
                fs.writeFileSync(browserJsonPath, JSON.stringify(browserJsonObj));
                process.off('message', closeBack);
            }); */
            child.on('error', (err) => {
                reject(err);
            });
            // child.on('exit', (code, signal) => {
            //     sendLog('info', `浏览器进程已退出，退出码：${code}，信号：${signal}`, _block);
            //     browser && browser.close();
            //     const browserJson = fs.readFileSync(browserJsonPath, 'utf-8');
            //     let browserJsonObj: any[] = JSON.parse(browserJson);
            //     browserJsonObj = browserJsonObj.filter((item) => item.wsUrl !== wsUrl);
            //     fs.writeFileSync(browserJsonPath, JSON.stringify(browserJsonObj));
            //     process.off('message', closeBack);
            // });
            child.stderr?.on('data', (data) => {
                const err = data.toString();
                const matchData = data.match(
                    /ws:\/\/127.0.0.1:\d+\/devtools\/browser\/[0-9A-Za-z-]+/
                );
                if (err.includes('listening on ws://127.0.0.1:') && matchData) {
                    wsUrl = matchData[0];
                    resolve(wsUrl);
                }
            });
        });
        console.log('启动成功 wsUrl:', startRes);
        wsUrl = startRes;
        browserJsonObj.push({
            wsUrl: startRes,
            appName: curApp.APP_NAME,
            appId: curApp.APP_ID,
            time: new Date().toLocaleString()
        });
        fs.writeFileSync(browserJsonPath, JSON.stringify(browserJsonObj));
        browser = await puppeteer.connect({
            browserWSEndpoint: wsUrl,
            defaultViewport: ops.defaultViewport
        });

        // 创建一个临时文件
        const tempFilePath = join(curApp.APP_DIR, 'browserCloseScript.js');
        //这边创建一个子进程，监听浏览器进程的关闭消息，接收到关闭消息后清理记录浏览器的文件
        const childCode = `
            //关闭浏览器监听脚本
            (async ()=>{
                const puppeteer = require('puppeteer-core');
                const fs = require('fs');
                const browserJsonPath = '${browserJsonPath.replace(/\\/g, '/')}';
                const tempFilePath = '${tempFilePath.replace(/\\/g, '/')}';
                const wsUrl = '${wsUrl}';
                const browser = await puppeteer.connect({
                    browserWSEndpoint: wsUrl,
                    defaultViewport: null
                });
                browser.on('disconnected', () => {
                    console.log('浏览器已断开连接，关闭浏览器');
                    const browserJson = fs.readFileSync(browserJsonPath, 'utf-8');
                    let browserJsonObj = JSON.parse(browserJson);
                    browserJsonObj = browserJsonObj.filter((item) => item.wsUrl !== wsUrl);
                    fs.writeFileSync(browserJsonPath, JSON.stringify(browserJsonObj));
                    fs.unlinkSync(tempFilePath);
                    process.exit();
                });
            })()
        `;
        fs.writeFileSync(tempFilePath, childCode);

        // 创建一个子进程
        const child = spawn('node', [tempFilePath], {
            detached: true,
            stdio: ['ignore', 'ignore', 'ignore']
        });

        // 让子进程独立运行
        child.unref();
    }

    console.log('浏览器连接成功');
    // const page = await browser.newPage();
    const pages = await browser.pages();
    console.log('标签页数量', pages.length);
    const page = pages[pages.length - 1];
    // await setBrowserPage(page);
    if (url) {
        console.log('打开地址', url);
        url.startsWith('http') || (url = 'http://' + url);
        await page.goto(url, { timeout: loadTimeout * 1000 });
    }
    return { browser, page };
};

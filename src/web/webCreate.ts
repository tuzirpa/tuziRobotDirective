// import { Page } from 'puppeteer-core';
import child_process, { exec, fork } from 'child_process';
import fs from 'fs';
import path, { join } from 'path';
import puppeteer, { Browser } from 'puppeteer-core';
import { getCurApp, getTuziAppInfo } from 'tuzirobot/commonUtil';
import { Block, DirectiveTree } from 'tuzirobot/types';
import { getAvailablePort } from './utils/portUtils';
import { md5 } from '../utils/md5';

// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// puppeteer.use(StealthPlugin());

export const config: DirectiveTree = {
    name: 'web.create',
    displayName: '创建浏览器',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '启动${webType}并打开${url},保存至：${browser},复用：${useOtherApp}',
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
                                label: item.name + (item.type === 'into' ? '（导入）' : ''),
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
        },
        proxyServer: {
            name: 'proxyServer',
            value: '',
            type: 'string',
            addConfig: {
                label: '代理服务器',
                type: 'string',
                placeholder: '例如: 127.0.0.1:8080 或 user:pass@127.0.0.1:8080',
                tip: '支持 ip:port 或 username:password@ip:port 格式',
                isAdvanced: true
            }
        },
        windowSize: {
            name: 'windowSize',
            value: '',
            type: 'string',
            addConfig: {
                label: '窗口大小',
                type: 'string',
                placeholder: '例如: 1920x1080  中间 "x" 为英文x',
                tip: '设置浏览器窗口大小，格式为"宽x高"，不填则最大化',
                isAdvanced: true
            }
        },
        customArgs: {
            name: 'customArgs',
            value: '',
            type: 'string',
            addConfig: {
                label: '自定义启动参数',
                type: 'textarea',
                placeholder: '自定义浏览器启动参数，多个参数用空格分隔',
                tip: '添加额外的浏览器启动命令行参数，如 --disable-web-security --disable-features=IsolateOrigins',
                isAdvanced: true
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
        useOtherApp,
        proxyServer,
        windowSize,
        customArgs
    }: {
        webType: string;
        url: string;
        executablePath: string;
        loadTimeout: number;
        userDataDir: string;
        useOtherApp: string;
        proxyServer: string;
        windowSize: string;
        customArgs: string;
    },
    _block: Block
) {
    return new Promise(async (resolve, reject) => {
    let executablePathA = '';
    console.log(webType, 'webType');
    let wsUrl: string = '';
    const tuziAppInfo = getTuziAppInfo();
    let browser: Browser;
    let proxyAuth: { username: string; password: string } | undefined;

    const browserJsonPath = path.join(tuziAppInfo.USER_DIR, 'browser.json');
    if (!fs.existsSync(browserJsonPath)) {
        fs.writeFileSync(browserJsonPath, JSON.stringify([]));
    }
    const browserJson = fs.readFileSync(browserJsonPath, 'utf-8');
    const browserJsonObj: any[] = JSON.parse(browserJson);

    const curApp = getCurApp();

     //设备信息整合
     const ops: any = {
        headless: false,
        defaultViewport: null,
        ignoreDefaultArgs: ['--enable-automation'],
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    };


    ops.userDataDir = userDataDir || path.join(curApp.APP_DIR, 'userData');
    if(ops.userDataDir.includes('\\')){
        ops.userDataDir = ops.userDataDir.replace(/\\/g, '/');
    }
    console.debug('用户目录', ops.userDataDir);

    const curAppBrowser = browserJsonObj.find((item) => item.appId === curApp.APP_ID && item.userDataDir === ops.userDataDir);
    if (curAppBrowser) {
        console.log(
            `当前应用之前启动过一个浏览器 用户目录 ${curAppBrowser.userDataDir}，wsUrl:${curAppBrowser.wsUrl}，直接复用之前的浏览器`
        );
        setTimeout(()=>{
            reject(new Error(`连接之前创建的浏览器失败：${curAppBrowser.wsUrl}，超时：30秒`))
        },30000)
        browser = await puppeteer.connect({
            browserWSEndpoint: curAppBrowser.wsUrl,
            defaultViewport: null,
            protocolTimeout: 600000
        });
    } else if (webType === 'useOtherApp') {
        console.log('复用其他应用创建的浏览器', useOtherApp);

        const browserJson = browserJsonObj.find((item) => item.appId === useOtherApp);
        if (!browserJson) {
            throw new Error(`未找到应用${useOtherApp} 的浏览器信息`);
        }
        console.log(`复用其他应用[${browserJson.appName}]创建的浏览器,${browserJson.wsUrl}`);
        setTimeout(()=>{
            reject(new Error(`连接之前创建的浏览器失败：${curAppBrowser.wsUrl}，超时：30秒`))
        },30000)
        browser = await puppeteer.connect({
            browserWSEndpoint: browserJson.wsUrl,
            defaultViewport: null,
            protocolTimeout: 600000
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

        executablePathA && (ops.executablePath = executablePathA);
        console.debug('浏览器路径', ops.executablePath);
        
    
        const args = [];
        
        // 处理自定义启动参数
        let customArgsArray: string[] = [];
        if (customArgs && customArgs.trim()) {
            customArgsArray = customArgs.trim().split(' ').filter(Boolean);
            console.debug('检测到自定义启动参数:', customArgsArray);
        }
        
        // 检查用户是否已经设置了特定参数
        const hasWindowSize = customArgsArray.some(arg => arg.startsWith('--window-size='));
        const hasMaximized = customArgsArray.some(arg => arg === '--start-maximized');
        const hasProxyServer = customArgsArray.some(arg => arg.startsWith('--proxy-server='));
        const hasDebugPort = customArgsArray.some(arg => arg.startsWith('--remote-debugging-port='));
        if(!hasDebugPort){
            const port = await getAvailablePort(11922);
            console.debug('端口', port);
            customArgsArray.push(`--remote-debugging-port=${port}`);
        }
        // 处理窗口大小（如果用户未在自定义参数中指定）
        if (!hasWindowSize && !hasMaximized) {
            if (windowSize) {
                const [width, height] = windowSize.toLowerCase().split('x').map(Number);
                if (isNaN(width) || isNaN(height)) {
                    throw new Error('窗口大小格式错误，应为"宽x高"，例如: 1920x1080');
                }
                args.push(`--window-size=${width},${height}`);
            } else {
                args.push('--start-maximized');
            }
        }
        
        // 处理代理设置（如果用户未在自定义参数中指定）
        if (!hasProxyServer && proxyServer) {
            if (proxyServer.includes('@')) {
                const [auth, host] = proxyServer.split('@');
                const [username, password] = auth.split(':');
                proxyAuth = { username, password };
                args.push(`--proxy-server=${host}`);
                console.debug('添加代理服务器:', host);
            } else {
                args.push(`--proxy-server=${proxyServer}`);
                console.debug('添加代理服务器:', proxyServer);
            }
        }
        
        // 添加所有自定义参数
        args.push(...customArgsArray);
        
    
        
        let startCmd = `"${
            ops.executablePath
        }" --no-first-run --disk-cache-dir="${
            ops.userDataDir
        }" --user-data-dir="${ops.userDataDir}" ${args.join(' ')} --allow-insecure-localhost`;
        
        console.debug('启动命令', startCmd);

        const startRes = await new Promise<string>((resolve, reject) => {
            const child = exec(startCmd);
            child.on('error', (err) => {
                reject(err);
            });
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
            userDataDir: ops.userDataDir,
            time: new Date().toLocaleString()
        });
        fs.writeFileSync(browserJsonPath, JSON.stringify(browserJsonObj));
        browser = await puppeteer.connect({
            browserWSEndpoint: wsUrl,
            defaultViewport: ops.defaultViewport,
            protocolTimeout: 600000
        });
        
        // 创建一个临时文件
        const tempFilePath = join(curApp.APP_DIR, `browserCloseScript${md5(wsUrl)}.js`);
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

        // 创建一个子进程来监听浏览器关闭
        const child = fork(tempFilePath, [], {
            detached: true,
            stdio: 'ignore'
        });

        // 让子进程独立运行
        child.unref();
    }

    console.log('浏览器连接成功');
    // const page = await browser.newPage();
    const pages = await browser.pages();
    console.log('标签页数量', pages.length);
    const page = pages[pages.length - 1];
    
    // 如果有代理认证信息，设置认证
    if (proxyAuth) {
        page.authenticate(proxyAuth).then(()=>{
            console.debug('代理认证设置成功');
        }).catch((err)=>{
            console.error('代理认证设置失败', err);
        })
        console.debug('等待代理认证设置');
        //打开一个页面，等待代理认证设置
        page.goto("http://www.baidu.com").catch((err)=>{
            console.error('默认打开百度触发代理认证窗口', err);
        })
    }

    // await setBrowserPage(page);
    if (url) {
        console.log('打开地址', url);
        url.startsWith('http') || (url = 'http://' + url);
        await page.goto(url, { timeout: loadTimeout * 1000 });
    }
    resolve({ browser, page });
});
};

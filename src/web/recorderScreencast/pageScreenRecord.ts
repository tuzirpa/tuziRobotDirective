import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.recorderScreencast.pageScreenRecord',
    icon: 'icon-web-record',
    displayName: '页面录屏',
    comment: '在页面${browserPage}中进行录屏，并保存到本地${fileSavePath}。',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        fileSavePath: {
            name: 'fileSavePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '文件保存路径',
                placeholder: '选择要文件保存路径',
                type: 'filePath',
                defaultValue: '',
                required: true,
                openDirectory: true,
                tip: '文件保存路径'
            }
        }
    },
    outputs: {
        recorderObj: {
            name: '',
            display: '录屏对象',
            type: 'web.recorderScreencast.pageScreenRecord',
            addConfig: {
                label: '录屏对象',
                type: 'variable',
                defaultValue: '录屏对象'
            }
        },
    }
};

export const impl = async function ({
    browserPage,
    fileSavePath
}: {
    browserPage: Page;
    fileSavePath: string;
}) {
    // 开始录屏
    const filePath = `${fileSavePath}/recording${Date.now()}`;
    const recorder = await browserPage.screencast({ 
        path: `${filePath}.webm`});

    return { recorderObj: {recorder, filePath:`${filePath}.webm`} };
}; 
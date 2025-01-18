import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.pageScreenshotSaveFile',
    icon: 'icon-web-create',
    displayName: '页面中元素截图保存到本地',
    comment:
        '在页面${browserPage}中选中元素${selector}，并对其进行截图，并保存到本地${fileSavePath}。',
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
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: 'css选择器',
                placeholder: '不填写则默认截取整个页面',
                type: 'string',
                defaultValue: '',
                tip: '不填写则默认截取整个页面'
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

    outputs: {}
};

export const impl = async function ({
    browserPage,
    selector,
    fileSavePath
}: {
    browserPage: Page;
    selector: string;
    fileSavePath: string;
}) {
    if (selector) {
        const fileElement = await browserPage.waitForSelector(selector);
        if (fileElement) {
            await fileElement.screenshot({
                path: fileSavePath + '/' + new Date().getTime() + '.png'
            });
        }
    } else {
        await browserPage.screenshot({
            path: fileSavePath + '/' + new Date().getTime() + '.png',
            fullPage: true
        });
    }

    console.log('截图保存成功！');
};

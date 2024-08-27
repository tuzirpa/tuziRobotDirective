import { Page } from 'puppeteer-core';
import os from 'os';
import { DirectiveTree } from '../types';

export const config: DirectiveTree = {
    name: 'web.pageScreenshotClipboard',
    icon: 'icon-web-create',
    displayName: '页面中元素截图至剪贴板',
    comment: '在页面${browserPage}中选中元素${selector}，并对其进行截图至剪贴板',
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
        }
    },

    outputs: {}
};

export const impl = async function ({
    browserPage,
    selector
}: {
    browserPage: Page;
    selector: string;
}) {
    const tmpFile = os.tmpdir() + '/' + new Date().getTime() + '.png';
    if (selector) {
        const fileElement = await browserPage.waitForSelector(selector);
        if (fileElement) {
            await fileElement.screenshot({
                type: 'png',
                path: tmpFile
            });
        }
    } else {
        await browserPage.screenshot({
            fullPage: true,
            type: 'png',
            path: tmpFile
        });
    }

    console.log('截图保存成功！');
};

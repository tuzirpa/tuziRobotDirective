import { Page, ElementHandle } from 'puppeteer-core';
import os from 'os';
import { DirectiveTree } from 'tuzirobot/types';
import hmc from 'hmc-win32';
import { toSelector } from './utils';
export const config: DirectiveTree = {
    name: 'web.pageScreenshotClipboard',
    icon: 'icon-web-create',
    displayName: '页面中元素截图至剪贴板-iframe元素可能白图',
    comment: '在页面${browserPage}中${element ? "对元素" : selector ? "对匹配选择器" + selector + "的元素" : ""}进行截图至剪贴板',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true,
                tip: '要截图的元素对象'
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '元素选择器',
                placeholder: '请输入CSS或XPath选择器，不填写则截取整个页面',
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '支持CSS或XPath选择器，不填写则截取整个页面'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    browserPage,
    element,
    selector
}: {
    browserPage: Page;
    element?: ElementHandle;
    selector?: string;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        const tmpFile = os.tmpdir() + '/' + new Date().getTime() + '.png';

        if (element) {
            await element.screenshot({
                type: 'png',
                path: tmpFile
            });
        } else if (selector) {
            selector = toSelector(selector);
            const targetElement = await browserPage.$(selector);
            if (!targetElement) {
                throw new Error('未找到匹配选择器的元素');
            }
            await targetElement.screenshot({
                type: 'png',
                path: tmpFile
            });
        } else {
            await browserPage.screenshot({
                fullPage: true,
                type: 'png',
                path: tmpFile
            });
        }

        hmc.Clipboard.writeFilePaths([tmpFile]);

        console.log('截图保存成功！');
    } catch (error) {
        console.error('截图保存失败:', error);
        throw error;
    }
};

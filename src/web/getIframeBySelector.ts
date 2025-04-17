import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from './utils';
export const config: DirectiveTree = {
    name: 'web.getIframeBySelector',
    icon: 'icon-iframe-selector',
    displayName: '通过选择器获取iframe',
    comment: '在页面${browserPage}中通过选择器${selector}获取iframe并保存到${webIframe}',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                placeholder: '选择标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true,
                required: true
            }
        },
        elementHandle: {
            name: 'elementHandle',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: 'iframe元素对象',
                placeholder: '直接传入iframe元素对象',
                type: 'variable',
                filtersType: 'web.Element'
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: 'iframe选择器',
                placeholder: '请输入CSS或XPath选择器',
                type: 'string',
                elementLibrarySupport: true,
                tip: '支持CSS选择器（如iframe#content）或XPath（如//iframe）'
            }
        }
    },
    outputs: {
        webIframe: {
            name: 'webIframe',
            display: 'iframe页面对象',
            type: 'web.iframe',
            addConfig: {
                label: 'iframe对象',
                type: 'variable',
                defaultValue: 'webFrame'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    elementHandle,
    selector
}: {
    browserPage: Page;
    elementHandle: ElementHandle | null;
    selector: string;
}) {
    try {
        let targetFrame: ElementHandle<Element> | null = elementHandle;

        // 如果未直接传入元素对象，则通过选择器查找
        if (!targetFrame && selector) {
            // 处理XPath选择器
            selector = toSelector(selector);

            // 先尝试CSS选择器
            targetFrame = await browserPage.$(selector);
        }

        if (!targetFrame) {
            throw new Error(`未找到匹配选择器 "${selector}" 的iframe元素`);
        }

        // 将ElementHandle转换为Frame对象
        const frame = await targetFrame.contentFrame();
        if (!frame) {
            throw new Error('找到的元素不是有效的iframe');
        }

        return { webIframe: frame };

    } catch (error: any) {
        console.error('获取iframe失败:', error);
        throw new Error(`获取iframe失败: ${error.message}`);
    }
}; 
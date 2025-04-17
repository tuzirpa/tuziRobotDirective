import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';

export const config: DirectiveTree = {
    name: 'web.mouse.mouseMoveToElement',
    sort: 2,
    displayName: '移动鼠标到元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中，移动鼠标到元素${selector}或${element}上',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '网页对象',
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
                autoComplete: true
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                elementLibrarySupport: true,
                placeholder: '请输入CSS或XPath选择器 (例如: #id, .class, //div/span)',
                label: 'CSS或XPath选择器',
                type: 'textarea'
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
    browserPage: Page | Frame;
    element?: ElementHandle;
    selector?: string;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        // 确保是 Page 对象
        if (!('mouse' in browserPage)) {
            throw new Error('当前对象不支持鼠标操作');
        }

        let targetElement = element;
        
        // 如果没有传入元素对象，则使用选择器查找
        if (!targetElement && selector) {
            selector = toSelector(selector);
            const foundElement = await browserPage.$(selector);
            if (foundElement) {
                targetElement = foundElement;
            }
        }

        if (!targetElement) {
            throw new Error('未找到指定元素');
        }

        // 获取元素的位置信息
        const box = await targetElement.boundingBox();
        if (!box) {
            throw new Error('无法获取元素位置');
        }

        // 计算元素中心点
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;

        // 移动鼠标到元素中心点
        await (browserPage as Page).mouse.move(x, y);

    } catch (error) {
        console.error('移动鼠标失败:', error);
        throw error;
    }
}; 
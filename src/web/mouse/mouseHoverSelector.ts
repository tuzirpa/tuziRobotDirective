import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.mouse.mouseHoverSelector',
    sort: 2,
    displayName: '鼠标悬停(选择器)',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面对象${browserPage}中获取元素${selector}并悬停，元素超时时间${timeout}秒',
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
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '元素选择器',
                placeholder: '支持 CSS 例:#id .class 或 xpath 例://div[text()="hello"]',
                elementLibrarySupport: true,
                type: 'textarea'
            }
        },
        timeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间',
                type: 'string',
                defaultValue: 30
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    browserPage,
    selector,
    timeout
}: {
    browserPage: Page | Frame;
    selector: string;
    timeout: number;
}) {
    let element: ElementHandle<Element> | null = null;
    if (selector.startsWith('//')) {
        selector = `::-p-xpath(${selector})`;
    }
    
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }
        element = await browserPage.waitForSelector(selector, {
            timeout: timeout * 1000
        });

        if (element) {
            await element.hover();
        } else {
            throw new Error(`未找到元素：${selector}`);
        }
    } catch (error) {
        console.log(error);
        throw new Error(`超时${timeout}秒，未找到元素：${selector}`);
    }
}; 
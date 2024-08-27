import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'web.cssElementClick',
    sort: 2,
    displayName: 'CSS点击元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面对象${browserPage}中获取元素${selector} 并点击，元素超时时间${timeout}秒',
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

const impl = async function ({
    browserPage,
    selector,
    timeout
}: {
    browserPage: Page | Frame;
    selector: string;
    timeout: number;
}) {
    let webElement: ElementHandle<Element> | null;
    if (selector.startsWith('//')) {
        selector = `::-p-xpath(${selector})`;
    }
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }
        webElement = await browserPage.waitForSelector(selector, {
            timeout: timeout * 1000
        });
    } catch (error) {
        console.log(error);
        throw new Error(`超时${timeout}秒，未找到元素：${selector}`);
    }
    if (webElement) {
        async function tap(c = 5) {
            try {
                await webElement?.tap();
            } catch (error) {
                if (c > 0) {
                    await tap(c - 1);
                    return;
                }
                await new Promise((resolve) => setTimeout(resolve, 0.3));
            }
        }
        await tap();
    } else {
        throw new Error(`未找到元素：${selector}`);
    }
};

export { config, impl };

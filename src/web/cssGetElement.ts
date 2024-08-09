import { Frame, Page } from 'puppeteer';
import { DirectiveTree } from '../types';

export const config: DirectiveTree = {
    name: 'web.cssGetElement',
    sort: 2,
    displayName: 'CSS或XPath获取元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment:
        '在页面${browserPage}中，使用CSS或XPath选择器${selector}获取元素,超时时间${timeout}秒,并保存到变量${webElement}',
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
                placeholder:
                    '请输入CSS或XPath选择器 (例如: #id, .class, input[type="text"], //div/span)',
                label: 'CSS或XPath选择器',
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
                placeholder:
                    '不填写或0禁用超时(永久等待到元素出现)，-1为直接获取（不等待，可能获取不到元素），单位：秒',
                type: 'string',
                defaultValue: '30'
            }
        }
    },

    outputs: {
        webElement: {
            name: '',
            display: '元素对象',
            type: 'web.Element',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                defaultValue: 'webElement'
            }
        }
    }
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
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        let webElement;
        if (selector.startsWith('//')) {
            selector = `::-p-xpath(${selector})`;
        }
        webElement = await browserPage.waitForSelector(selector, {
            timeout: timeout * 1000
        });
        return { webElement };
    } catch (error) {
        console.log(error);
        return { webElement: '' };
    }
};

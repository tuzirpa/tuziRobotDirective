import { ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { isXpath, toSelector } from './utils';
export const config: DirectiveTree = {
    name: 'web.getChildElementList',
    sort: 2,
    displayName: '获取元素的子元素列表',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在元素${element}下查找子元素列表${selector}，并保存到变量${childElementList}中。',
    inputs: {
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
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
                required: true,
                elementLibrarySupport: true,
                placeholder:
                    '请输入CSS或XPath选择器 (例如: #id, .class, input[type="text"], //div/span)',
                label: 'CSS或XPath选择器',
                type: 'textarea'
            }
        }
    },

    outputs: {
        childElementList: {
            name: '',
            display: '元素对象',
            type: 'web.Element',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                defaultValue: 'childElementList'
            }
        }
    }
};

export const impl = async function ({
    element,
    selector
}: {
    element: ElementHandle;
    selector: string;
    timeout: number;
}) {
    if (isXpath(selector)) {
        selector = toSelector(`.${selector}`);
    } else {
        selector = toSelector(`:scope > ${selector}`);
    }
    const childElementList = await element.$$(selector);
    return { childElementList: childElementList ? childElementList : [] };
};

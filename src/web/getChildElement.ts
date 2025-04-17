import { ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector,isXpath } from './utils';
export const config: DirectiveTree = {
    name: 'web.getChildElement',
    sort: 2,
    displayName: '获取元素的子元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在元素${element}下查找子元素${selector}，并保存到变量${childElement}中。',
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
        childElement: {
            name: '',
            display: '元素对象',
            type: 'web.Element',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                defaultValue: 'childElement'
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
}) {

    if (isXpath(selector)) {
        selector = `::-p-xpath(.${selector})`;
    }
    const childElement = await element.$(selector);
    return { childElement };
};

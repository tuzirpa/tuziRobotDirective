import { ElementHandle, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from './utils';
export const config: DirectiveTree = {
    name: 'web.getElements',
    icon: 'icon-web-create',
    displayName: '获取相似元素',
    comment:
        '在页面${browserPage}中获取 ${selector} 匹配的元素，元素列表保存到${elements},元素个数保存到${elementCount}',
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
                autoComplete: true
            }
        },
        selector: {
            name: 'iframeSrc',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: 'css或者xpath选择器',
                placeholder: "请输入css选择器或xpath选择器 xpath 示例：//*[@id='test']",
                elementLibrarySupport: true,
                type: 'textarea'
            }
        }
    },

    outputs: {
        elements: {
            name: '',
            display: '数组-元素列表',
            type: 'array',
            addConfig: {
                label: '元素列表',
                type: 'variable',
                defaultValue: 'elements'
            }
        },
        elementCount: {
            name: '',
            display: '数字-元素个数',
            type: 'number',
            addConfig: {
                label: '元素个数',
                type: 'variable',
                defaultValue: 'elementCount'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    selector
}: {
    browserPage: Page;
    selector: string;
}) {
    selector = toSelector(selector);
    const elements = await browserPage.$$(selector);

    return { elements, elementCount: elements.length };
};

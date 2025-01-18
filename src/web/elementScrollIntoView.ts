import { ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementScrollIntoView',
    sort: 2,
    displayName: '将元素滚动到视图中',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将元素${element}滚动到视图中，使其可见。',
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
        }
    },

    outputs: {}
};

export const impl = async function ({ element }: { element: ElementHandle }) {
    await element.scrollIntoView();
};

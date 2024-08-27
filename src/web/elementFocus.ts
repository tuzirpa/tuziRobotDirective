import { ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from '../types';

const config: DirectiveTree = {
    name: 'web.elementFocus',
    sort: 2,
    displayName: '元素聚焦',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '元素聚焦${element}',
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

const impl = async function ({ element }: { element: ElementHandle }) {
    await element.focus();
};

export { config, impl };

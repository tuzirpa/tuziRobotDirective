import { ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'web.elementClick',
    sort: 2,
    displayName: '点击元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '点击${element}',
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
    await element.click();
};

export { config, impl };

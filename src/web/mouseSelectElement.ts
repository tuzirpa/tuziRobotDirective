import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.mouseSelectElement',
    sort: 2,
    displayName: '鼠标悬停在元素上',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '鼠标悬停在${element}元素上，用于模拟用户操作。',
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
    element.hover();
};

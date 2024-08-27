import { Page } from 'puppeteer-core';
import { DirectiveTree } from '../../types';
export const config: DirectiveTree = {
    name: 'web.mouseMove',
    icon: 'icon-web-create',
    displayName: '移动鼠标',
    comment: '在页面${page}中，移动鼠标到坐标${x},${y}',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        x: {
            name: 'x',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '水平位置X坐标',
                type: 'string'
            }
        },
        y: {
            name: 'y',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '垂直位置Y坐标',
                type: 'string'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ page, x, y }: { page: Page; x: number; y: number }) {
    console.log('move mouse to x: ' + x + ' y: ' + y);
    await page.mouse.move(x, y);
};

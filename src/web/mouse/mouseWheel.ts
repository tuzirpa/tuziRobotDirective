import { Page } from 'puppeteer-core';
import { DirectiveTree } from '../../types';
export const config: DirectiveTree = {
    name: 'web.mouseWheel',
    icon: 'icon-web-create',
    displayName: '鼠标滚轮',
    comment: '在页面${page}中，水平滚动${deltaX}像素，垂直滚动${deltaY}像素。',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                placeholder: '请输入标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        deltaX: {
            name: 'deltaX',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                placeholder: '滚轮的水平偏移量 例如：100 单位：像素',
                label: 'X方向滚动距离',
                type: 'string'
            }
        },
        deltaY: {
            name: 'deltaY',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                placeholder: '滚轮的垂直偏移量 例如：100 单位：像素',
                label: 'Y方向滚动距离',
                type: 'string'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({
    page,
    deltaX,
    deltaY
}: {
    page: Page;
    deltaX: number;
    deltaY: number;
}) {
    await page.mouse.wheel({ deltaX, deltaY });
};

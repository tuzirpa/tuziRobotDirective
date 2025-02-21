import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.mouse.mouseDragAndDrop',
    icon: 'icon-web-create',
    displayName: '鼠标拖动并释放',
    comment:
        '在页面${page}中, 鼠标拖动并释放, 从(${startX}, ${startY})到(${endX}, ${endY}), 延迟${delay}毫秒',
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
        startX: {
            name: 'startX',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '拖动起点X坐标',
                type: 'string'
            }
        },
        startY: {
            name: 'startY',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '拖动起点Y坐标',
                type: 'string'
            }
        },
        endX: {
            name: 'endX',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '拖动结束点X坐标',
                type: 'string'
            }
        },
        endY: {
            name: 'endY',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '拖动结束点Y坐标',
                type: 'string'
            }
        },

        delay: {
            name: 'delay',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '延迟',
                placeholder: '单位毫秒',
                type: 'string',
                defaultValue: '0'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({
    page,
    startX,
    startY,
    endX,
    endY,
    delay
}: {
    page: Page;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    delay: number;
}) {
    const start = { x: startX, y: startY };
    const target = { x: endX, y: endY };
    await page.mouse.dragAndDrop(start, target, { delay: delay });
    console.log('鼠标拖动并释放成功');
};

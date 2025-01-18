import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.mouseClick',
    icon: 'icon-web-create',
    displayName: '鼠标点击',
    comment: '在页面${page}中，坐标(${x}, ${y})处 单击${count}次',
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
        x: {
            name: 'x',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                placeholder: '请输入鼠标的水平位置 例如：100',
                label: '鼠标的水平位置',
                type: 'string'
            }
        },
        y: {
            name: 'y',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                placeholder: '请输入鼠标的垂直位置 例如：100',
                label: '鼠标的垂直位置',
                type: 'string'
            }
        },
        count: {
            name: 'count',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '点击次数',
                type: 'string',
                placeholder: '请输入单击次数 例如：1、2、3',
                defaultValue: '1'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({
    page,
    x,
    y,
    count
}: {
    page: Page;
    x: number;
    y: number;
    count: number;
}) {
    await page.mouse.click(x, y, { count });
};

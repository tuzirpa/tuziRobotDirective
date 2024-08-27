import { MouseButton, Page } from 'puppeteer-core';
import { DirectiveTree } from '../../types';
export const config: DirectiveTree = {
    name: 'web.mouseDown',
    icon: 'icon-web-create',
    displayName: '按下鼠标',
    comment: '在页面${page}中, 按下鼠标${button}键',
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
        button: {
            name: 'button',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '选择鼠标按钮',
                type: 'select',
                defaultValue: 'left',
                options: [
                    { label: '左键', value: 'left' },
                    { label: '右键', value: 'right' },
                    { label: '中键', value: 'middle' },
                    { label: '后退键', value: 'back' },
                    { label: '前进键', value: 'forward' }
                ]
            }
        }
    },

    outputs: {
        key: {
            name: 'key',
            display: '按下鼠标的键',
            type: 'web.mouseButton',
            addConfig: {
                label: '按下鼠标的键',
                type: 'variable',
                defaultValue: ''
            }
        }
    }
};

export const impl = async function ({ page, button }: { page: Page; button: MouseButton }) {
    console.log('按下鼠标键', button);
    await page.mouse.down({ button });
    return { key: button };
};

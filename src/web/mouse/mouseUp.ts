import { MouseButton, Page } from 'puppeteer-core';
import { DirectiveTree } from '../../types';
export const config: DirectiveTree = {
    name: 'web.mouseUp',
    icon: 'icon-web-create',
    displayName: '释放鼠标',
    comment: '在页面${page}中, 按下鼠标${button}键后释放鼠标',
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
                label: '鼠标按下键',
                type: 'string',
                filtersType: 'web.mouseButton',
                required: true,
                autoComplete: true
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ page, button }: { page: Page; button: MouseButton }) {
    await page.mouse.up({ button });
    console.log('鼠标释放成功', button);
};

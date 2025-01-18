import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.pageExecuteScript',
    icon: 'icon-web-create',
    displayName: '页面中执行JavaScript脚本',
    comment: '在页面${browserPage}中执行JavaScript脚本',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '浏览器对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        script: {
            name: 'script',
            value: '',
            display: '脚本内容',
            type: 'string',
            addConfig: {
                label: '脚本内容',
                type: 'textarea',
                defaultValue: '',
                required: true,
                tip: '需要执行的JavaScript脚本'
            }
        }
    },

    outputs: {
        scriptResult: {
            name: '',
            display: 'javascript脚本执行结果',
            type: 'string',
            addConfig: {
                label: 'javascript脚本执行结果',
                type: 'variable',
                defaultValue: 'scriptResult',
                required: true,
                tip: 'javascript脚本执行结果'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    script
}: {
    browserPage: Page;
    script: string;
}) {
    const scriptResult = await browserPage.evaluate(script);
    return { scriptResult };
};

import { Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementOperate.completeWaitElement',
    sort: 19,
    displayName: '完成等待元素',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '等待${waitPromise}完成后，再等待元素消失',
    inputs: {
        waitPromise: {
            name: 'waitPromise',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '等待Promise',
                type: 'variable',
                tip: '从开始等待元素指令获取的Promise'
            }
        },
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '网页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '元素选择器',
                placeholder: '请输入CSS或XPath选择器',
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '支持CSS或XPath选择器'
            }
        },
        timeout: {
            name: 'timeout',
            value: '30',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间(秒)',
                type: 'string',
                defaultValue: '30',
                tip: '等待超时时间'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    waitPromise,
    browserPage,
    selector,
    timeout = 30
}: {
    waitPromise: Promise<any>;
    browserPage: Page | Frame;
    selector: string;
    timeout?: number;
}) {
    try {
        // 等待元素出现
        console.debug('等待元素出现...');
        const element =await waitPromise;
        console.debug('元素已出现');

        // 等待元素消失
        console.debug('等待元素消失...');
        await Promise.race([
            browserPage.waitForSelector(selector, {
                hidden: true,
                timeout: timeout * 1000
            }),
            browserPage.waitForFunction(
                (sel) => !document.querySelector(sel),
                { timeout: timeout * 1000 },
                element
            )
        ]);
        console.debug('元素已消失');

    } catch (error) {
        console.error('等待元素出现或消失失败:', error);
        throw error;
    }
}; 
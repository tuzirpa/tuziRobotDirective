import { ElementHandle, Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementOperate.completeWaitElement',
    sort: 19,
    displayName: '完成等待元素出现后消失任务(异步)',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '等待${waitPromise}完成后，再等待元素消失',
    inputs: {
        waitForElement: {
            name: 'waitForElement',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '等待元素出现后消失的对象',
                type: 'variable',
                autoComplete: true,
                filtersType: 'web.elementOperate.waitForElement',
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
    waitForElement,
    browserPage,
    timeout = 30
}: {
    waitForElement: { waitPromise: Promise<ElementHandle<Element>>, selector: string };
    browserPage: Page | Frame;
    timeout?: number;
}) {
    try {
        // 等待元素出现
        console.debug('等待元素出现...');
        try {
            await waitForElement.waitPromise;
            console.debug('元素已出现');
        } catch (error) {
            console.error('等待元素出现失败:', error);
            throw error;
        }

        // 等待元素消失
        console.debug('等待元素消失...');
        // 等待 element 消失
        await browserPage.waitForSelector(waitForElement.selector, {
            hidden: true,
            timeout: timeout * 1000
        });

        console.debug('元素已消失');

    } catch (error) {
        console.error('等待元素出现或消失失败:', error);
        throw error;
    }
}; 
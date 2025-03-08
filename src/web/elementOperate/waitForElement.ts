import { Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.elementOperate.waitForElement',
    sort: 17,
    displayName: '等待元素出现/消失',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中等待${selector}元素${existence === "notExists" ? "消失" : "出现"}',
    inputs: {
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
        existence: {
            name: 'existence',
            value: 'exists',
            display: '',
            type: 'string',
            addConfig: {
                label: '等待条件',
                type: 'select',
                required: true,
                options: [
                    { label: '出现', value: 'exists' },
                    { label: '消失(包含隐藏和移除)', value: 'notExists' }
                ],
                tip: '等待元素出现或消失(包含隐藏和从DOM中移除)'
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
    browserPage,
    selector,
    existence = 'exists',
    inViewport = false,
    timeout = 30
}: {
    browserPage: Page | Frame;
    selector: string;
    existence: 'exists' | 'notExists';
    inViewport?: boolean;
    timeout?: number;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        if (!selector) {
            throw new Error('元素选择器不能为空');
        }

        // 转换XPath选择器
        if (selector.startsWith('//')) {
            selector = `::-p-xpath(${selector})`;
        }

        if (existence === 'exists') {
            // 等待元素出现
            await browserPage.waitForSelector(selector, {
                visible: true,
                timeout: timeout * 1000
            });
        } else {
            // 等待元素消失（隐藏或移除）
            await Promise.race([
                // 等待元素隐藏
                browserPage.waitForSelector(selector, {
                    hidden: true,
                    timeout: timeout * 1000
                }),
                // 等待元素从DOM中移除
                browserPage.waitForFunction(
                    (sel) => !document.querySelector(sel),
                    { timeout: timeout * 1000 },
                    selector
                )
            ]);
        }

    } catch (error) {
        const action = existence === 'exists' 
            ? '出现'
            : '消失';
        console.error(`等待元素${action}失败:`, error);
        throw error;
    }
}; 
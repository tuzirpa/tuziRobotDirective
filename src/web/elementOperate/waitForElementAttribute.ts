import { Frame, Page, ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from '../utils';

export const config: DirectiveTree = {
    name: 'web.elementOperate.waitForElementAttribute',
    sort: 19,
    displayName: '等待元素属性变成特定值',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中等待${selector?selector:element}元素的${attributeName}属性${matchType == "equals" ? "等于" : matchType == "contains" ? "包含" : matchType == "startsWith" ? "以" : matchType == "endsWith" ? "以" : "匹配"}${expectedValue}，超时${timeout}秒',
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
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '元素对象',
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true,
                tip: '如果提供了元素对象，则直接使用该元素，忽略选择器'
            }
        },
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '元素选择器',
                placeholder: '请输入CSS或XPath选择器',
                type: 'textarea',
                elementLibrarySupport: true,
                tip: '支持CSS或XPath选择器，如果提供了元素对象则忽略此参数'
            }
        },
        attributeName: {
            name: 'attributeName',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '属性名称',
                placeholder: '例如: class, id, data-value, disabled 等',
                type: 'string',
                tip: '要等待的HTML属性名称'
            }
        },
        expectedValue: {
            name: 'expectedValue',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '期望值',
                placeholder: '请输入期望的属性值',
                type: 'string',
                tip: '要等待的属性值'
            }
        },
        matchType: {
            name: 'matchType',
            value: 'equals',
            display: '等于',
            type: 'string',
            addConfig: {
                label: '匹配方式',
                type: 'select',
                required: true,
                options: [
                    { label: '等于', value: 'equals' },
                    { label: '包含', value: 'contains' },
                    { label: '以...开始', value: 'startsWith' },
                    { label: '以...结束', value: 'endsWith' },
                    { label: '正则匹配', value: 'regex' },
                    { label: '不等于', value: 'notEquals' },
                    { label: '不包含', value: 'notContains' }
                ],
                tip: '选择属性值的匹配方式'
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
                placeholder: '请输入时长 单次最大600秒，如需更久请重新添加一条指令',
                defaultValue: '30',
                tip: '等待超时时间'
            }
        }
    },
    outputs: {
        actualValue: {
            name: 'actualValue',
            display: '实际属性值',
            type: 'string',
            addConfig: {
                label: '实际属性值',
                type: 'variable',
                defaultValue: 'actualValue',
                tip: '等待成功时返回的实际属性值'
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    element,
    selector,
    attributeName,
    expectedValue,
    matchType = 'equals',
    timeout = 30
}: {
    browserPage: Page | Frame;
    element?: ElementHandle;
    selector?: string;
    attributeName: string;
    expectedValue: string;
    matchType?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'notEquals' | 'notContains';
    timeout?: number;
}) {
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }

        if (!attributeName) {
            throw new Error('属性名称不能为空');
        }

        if (expectedValue === undefined || expectedValue === null) {
            throw new Error('期望值不能为空');
        }

        let targetElement: ElementHandle | null = null;

        // 如果提供了元素对象，直接使用
        if (element) {
            targetElement = element;
        } else if (selector) {
            // 转换XPath选择器
            const convertedSelector = toSelector(selector);
            // 等待元素出现
            await browserPage.waitForSelector(convertedSelector, {
                visible: true,
                timeout: timeout * 1000
            });
            targetElement = await browserPage.$(convertedSelector);
        } else {
            throw new Error('必须提供元素对象或选择器');
        }

        if (!targetElement) {
            throw new Error('无法找到目标元素');
        }

        // 获取元素的唯一标识，用于在 waitForFunction 中查找
        let elementSelector: string | null = null;
        const tempId = `__temp_attr_wait_${Date.now()}`;
        await targetElement.evaluate((el, tempId) => {
            (el as HTMLElement).setAttribute('data-temp-wait-id', tempId);
        }, tempId);
        elementSelector = `[data-temp-wait-id="${tempId}"]`;

        // 使用 waitForFunction 等待属性值匹配
        try {
            await browserPage.waitForFunction(
                (sel, attrName, expected, matchType) => {
                    const el = document.querySelector(sel);
                    if (!el) {
                        return false;
                    }

                    const actual = el.getAttribute(attrName);
                    if (actual === null) {
                        return false;
                    }

                    switch (matchType) {
                        case 'equals':
                            return actual === expected;
                        case 'contains':
                            return actual.includes(expected);
                        case 'startsWith':
                            return actual.startsWith(expected);
                        case 'endsWith':
                            return actual.endsWith(expected);
                        case 'regex':
                            try {
                                const regex = new RegExp(expected);
                                return regex.test(actual);
                            } catch {
                                return false;
                            }
                        case 'notEquals':
                            return actual !== expected;
                        case 'notContains':
                            return !actual.includes(expected);
                        default:
                            return actual === expected;
                    }
                },
                {
                    timeout: timeout * 1000,
                },
                elementSelector,
                attributeName,
                expectedValue,
                matchType
            );

            // 等待成功后，获取实际属性值
            const actualValue = await targetElement.evaluate((el, attrName) => {
                return el.getAttribute(attrName);
            }, attributeName);

            // 清理临时标记
            if (elementSelector && elementSelector.includes('data-temp-wait-id')) {
                await targetElement.evaluate((el) => {
                    el.removeAttribute('data-temp-wait-id');
                });
            }

            return { actualValue: actualValue || '' };
        } catch (error: any) {
            // 清理临时标记
            if (elementSelector && elementSelector.includes('data-temp-wait-id')) {
                try {
                    await targetElement.evaluate((el) => {
                        el.removeAttribute('data-temp-wait-id');
                    });
                } catch {}
            }

            // 获取当前值用于错误信息
            let currentValue: string | null = null;
            try {
                currentValue = await targetElement.evaluate((el, attrName) => {
                    return el.getAttribute(attrName);
                }, attributeName);
            } catch {}

            throw new Error(
                `等待元素属性 "${attributeName}" 变成 "${expectedValue}" 超时。当前值: ${currentValue || 'null'}`
            );
        }

    } catch (error: any) {
        console.error('等待元素属性失败:', error);
        throw error;
    }
};


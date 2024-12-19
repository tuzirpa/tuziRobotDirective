import { ElementHandle, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'web.cssElementInput',
    sort: 2,
    displayName: 'css或xpath填写输入框',
    icon: 'icon-web-create',
    remark: '',
    isControl: false,
    isControlEnd: false,
    comment:
        '在页面${page}上，元素${selector}上输入${content}, 是否聚焦${isFocus}, 是否追加${isAppend}, 延迟${delay}秒',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
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
                elementLibrarySupport: true,
                placeholder:
                    '请输入CSS或XPath选择器 (例如: #id, .class, input[type="text"], //div/span)',
                label: 'CSS或XPath选择器',
                type: 'textarea'
            }
        },
        content: {
            name: 'content',
            value: '',
            type: 'string',
            addConfig: {
                placeholder: '请输入要输入的内容',
                label: '输入的内容',
                type: 'string',
                defaultValue: ''
            }
        },
        isFocus: {
            name: 'isFocus',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '是否聚焦',
                type: 'boolean',
                defaultValue: true
            }
        },
        isAppend: {
            name: 'isAppend',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '是否追加内容',
                type: 'boolean',
                defaultValue: false
            }
        },
        delay: {
            name: 'delay',
            value: '',
            type: 'number',
            addConfig: {
                placeholder: '输入每个字的间隔时间，单位：秒 不填则默认为0',
                label: '延迟时间',
                type: 'string',
                defaultValue: 0
            }
        },
        timeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间',
                placeholder:
                    '不填写或0禁用超时(永久等待到元素出现)，-1为直接获取（不等待，可能获取不到元素），单位：秒',
                type: 'string',
                defaultValue: '30'
            }
        }
    },
    outputs: {}
};

const impl = async function ({
    browserPage,
    selector,
    content,
    isFocus,
    isAppend,
    delay = 0,
    timeout
}: {
    browserPage: Page;
    selector: string;
    content: string;
    isFocus: boolean;
    isAppend: boolean;
    delay: number;
    timeout: number;
}) {
    let element;
    if (selector.startsWith('//')) {
        selector = `::-p-xpath(${selector})`;
    }
    element = await browserPage.waitForSelector(selector, {
        timeout: timeout * 1000
    });
    if (element === null) {
        throw new Error(`元素${selector}未找到`);
    }
    if (isFocus) {
        await element.focus();
    }
    if (!isAppend) {
        await element.evaluate((el) => ((el as HTMLInputElement).value = ''));
    }
    await element.type(content, { delay: delay * 1000 });
};

export { config, impl };

import { ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

const config: DirectiveTree = {
    name: 'web.elementInput',
    sort: 2,
    displayName: '填写输入框',
    icon: 'icon-web-create',
    remark: '',
    isControl: false,
    isControlEnd: false,
    comment:
        '在元素${element}上输入${content}, 是否聚焦${isFocus}, 是否追加${isAppend}, 延迟${delay}秒',
    inputs: {
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '元素对象',
                placeholder: '请选择元素对象',
                required: true,
                type: 'variable',
                filtersType: 'web.Element',
                autoComplete: true
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
        }
    },
    outputs: {}
};

const impl = async function ({
    element,
    content,
    isFocus,
    isAppend,
    delay = 0
}: {
    element: ElementHandle;
    content: string;
    isFocus: boolean;
    isAppend: boolean;
    delay: number;
}) {
    if (isFocus) {
        await element.focus();
    }
    if (!isAppend) {
        await element.evaluate((el) => ((el as HTMLInputElement).value = ''));
    }
    await element.type(content, { delay: delay * 1000 });
};

export { config, impl };

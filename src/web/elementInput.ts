import { ElementHandle } from 'puppeteer';
import { DirectiveTree } from '../types';

const config: DirectiveTree = {
    name: 'web.elementInput',
    sort: 2,
    displayName: '填写输入框',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在元素${element}上输入${content}',
    inputs: {
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '网页对象',
                placeholder: '请选择网页对象',
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
                required: true,
                placeholder: '请输入要输入的内容',
                label: '输入的内容',
                type: 'string'
            }
        },
        delay: {
            name: 'delay',
            value: '',
            type: 'number',
            addConfig: {
                placeholder: '输入每个字的间隔时间，单位：秒 不填则默认为0',
                label: '延迟时间',
                type: 'string'
            }
        }
    },
    outputs: {}
};

const impl = async function ({
    element,
    content,
    delay = 0
}: {
    element: ElementHandle;
    content: string;
    delay: number;
}) {
    await element.evaluate((el) => ((el as HTMLInputElement).value = ''));
    await element.type(content, { delay: delay * 1000 });
};

export { config, impl };

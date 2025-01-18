import { ElementHandle } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.getElementProperty',
    sort: 2,
    displayName: '获取元素属性',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '获取元素${selector}的属性${propertyName}的值, 并将其赋值给变量${propertyValue}',
    inputs: {
        element: {
            name: 'element',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '选择元素对象',
                type: 'variable',
                filtersType: 'web.element',
                autoComplete: true
            }
        },
        propertyName: {
            name: 'propertyName',
            value: '',
            display: '文本内容',
            type: 'string',
            addConfig: {
                required: true,
                label: '选择获取的属性',
                type: 'select',
                options: [
                    {
                        label: '文本内容',
                        value: 'innerText'
                    },
                    {
                        label: 'html内容',
                        value: 'innerHTML'
                    },
                    {
                        label: 'src属性',
                        value: 'src'
                    },
                    {
                        label: '自定义属性',
                        value: 'custom'
                    }
                ],
                defaultValue: 'innerText',
                tip: '获取的属性的值'
            }
        },

        customPropertyName: {
            name: 'customPropertyName',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '自定义属性名称',
                placeholder: '请输入自定义属性名称 (data-开头)',
                type: 'string',
                filters: 'this.inputs.propertyName.value === "custom"'
            }
        }
    },

    outputs: {
        propertyValue: {
            name: '',
            display: '字符串-元素属性值',
            type: 'string',
            addConfig: {
                label: '属性值',
                type: 'variable',
                defaultValue: 'webElementProperty'
            }
        }
    }
};

export const impl = async function ({
    element,
    propertyName,
    customPropertyName
}: {
    element: ElementHandle<Element>;
    propertyName: string;
    customPropertyName: string;
}) {
    // 处理data-属性
    if (propertyName === 'custom') {
        const val = await element.evaluate((el, prop) => el.getAttribute(prop), customPropertyName);
        return {
            propertyValue: val ? val.toString() : ''
        };
    }

    const propertyValue = await element.getProperty(propertyName);
    const value = await propertyValue.jsonValue();
    return {
        propertyValue: value ? value.toString() : ''
    };
};

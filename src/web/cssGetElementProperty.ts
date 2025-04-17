import { Frame, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
import { toSelector } from './utils';
export const config: DirectiveTree = {
    name: 'web.cssGetElementProperty',
    sort: 2,
    displayName: 'CSS获取元素属性值',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment:
        '在${browserPage}页面中，通过CSS选择器${selector},超时时间${timeout}秒, 获取元素属性${property},并保存到变量${propertyValue}',
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
                label: '元素选择器',
                placeholder: '支持 CSS 例:#id .class 或 xpath 例://div[text()="hello"]',
                elementLibrarySupport: true,
                type: 'textarea'
            }
        },
        property: {
            name: 'property',
            value: '',
            display: '文本内容',
            type: 'string',
            addConfig: {
                required: true,
                label: '选择获取的属性',
                type: 'select',
                options: [
                    {
                        label: '文本内容-不保留换行',
                        value: 'textContent'
                    },
                    {
                        label: '文本内容-保留换行',
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
                        label: 'href属性',
                        value: 'href'
                    },
                    {
                        label: 'value属性',
                        value: 'value'
                    },
                    {
                        label: 'class属性',
                        value: 'className'
                    },
                    {
                        label: 'id属性',
                        value: 'id'
                    },
                    {
                        label: 'name属性',
                        value: 'name'
                    },
                    {
                        label: 'title属性',
                        value: 'title'
                    },
                    {
                        label: 'alt属性',
                        value: 'alt'
                    },
                    {
                        label: 'type属性',
                        value: 'type'
                    },
                    {
                        label: '自定义属性',
                        value: 'custom'
                    }
                ],
                defaultValue: 'textContent',
                tip: '获取的属性的值'
            }
        },
        customProperty: {
            name: 'customProperty',
            value: '',
            display: '自定义属性名',
            type: 'string',
            addConfig: {
                required: false,
                filters: 'this.inputs.property.value === "custom"',
                label: '自定义属性名',
                type: 'textarea',
                placeholder: '请输入自定义属性名',
                tip: '获取的自定义属性的值'
            }
        },
        timeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间',
                type: 'string',
                defaultValue: 30
            }
        }
    },

    outputs: {
        propertyValue: {
            name: 'propertyValue',
            display: '元素属性值',
            type: 'string',
            addConfig: {
                label: '元素属性值',
                type: 'variable',
                defaultValue: ''
            }
        }
    }
};

export const impl = async function ({
    browserPage,
    selector,
    property,
    customProperty,
    timeout
}: {
    browserPage: Page;
    selector: string;
    property: string;
    customProperty: string;
    timeout: number;
}) {
    
    try {
        if (!browserPage) {
            throw new Error('浏览器页面对象不能为空');
        }
        selector = toSelector(selector);
        const webElement = await browserPage.waitForSelector(selector, {
            timeout: timeout * 1000
        });

        if (webElement) {
            if (property === 'custom') {
                property = customProperty;
            }
            
            const propertyValue = await webElement.getProperty(property);
            return {
                propertyValue: await propertyValue.jsonValue()
            };
        }

        return { propertyValue: '' };
    } catch (error) {
        throw error;
    }
};

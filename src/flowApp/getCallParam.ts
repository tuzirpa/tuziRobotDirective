import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'flowApp.getCallParam',
    displayName: '获取调用参数',
    comment: '从流程参数${arrayObj}中取出第${index}项保存到${item}',
    inputs: {
        index: {
            name: 'index',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                required: true,
                label: '项下标（索引）',
                type: 'string'
            }
        }
    },

    outputs: {
        item: {
            name: '',
            display: '数组项数据',
            type: 'object',
            addConfig: {
                label: '对象',
                type: 'variable',
                defaultValue: 'arrayItem'
            }
        }
    },

    async toCode(directive, block) {
        const { index } = directive.inputs;
        const { item } = directive.outputs;
        return `var {item: ${item.name}} = await robotUtil.system.flowApp.getCallParam({arrayObj: _callParams,index: ${index.value} },${block})`;
    }
};

export const impl = async function ({ arrayObj, index }: { arrayObj: Array<any>; index: number }) {
    if (!Array.isArray(arrayObj)) {
        throw new Error('选择的对象不是数组');
    }
    if (index < 1 || index > arrayObj.length) {
        console.warn('获取调用参数失败，数组索引超出范围 返回undefined');
        return { item: undefined };
    }
    const item = arrayObj[index - 1];
    return { item };
};

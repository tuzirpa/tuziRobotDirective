
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'dataProcessing.getArrayItem',
    displayName: '取数组项',
    comment: '从数组${arrayObj}中取出第${index}项保存到${item}',
    inputs: {
        arrayObj: {
            name: 'arrayObj',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '数组对象',
                placeholder: '选择数组对象',
                type: 'variable',
                filtersType: 'array',
                autoComplete: true
            }
        },
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
    }
};

export const impl = async function ({ arrayObj, index }: { arrayObj: Array<any>; index: number }) {
    if (!Array.isArray(arrayObj)) {
        throw new Error('选择的对象不是数组');
    }
    if (index < 0 || index >= arrayObj.length) {
        throw new Error('数组索引超出范围 长度:' + arrayObj.length + ' 下标:' + index);
    }
    const item = arrayObj[index];
    return { item };
};

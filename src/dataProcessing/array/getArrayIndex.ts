import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'dataProcessing.getArrayIndex',
    displayName: '获取数组元素下标',
    comment: '从数组${arrayObj}中查找${searchValue}的下标位置保存到${index}',
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
        searchValue: {
            name: 'searchValue',
            value: '',
            display: '',
            type: 'object',
            addConfig: {
                required: true,
                label: '查找的值',
                type: 'string',
                placeholder: '要查找的元素值'
            }
        },
        fromIndex: {
            name: 'fromIndex',
            value: '0',
            display: '',
            type: 'number',
            addConfig: {
                required: false,
                label: '开始查找位置',
                type: 'string',
                placeholder: '从哪个位置开始查找（可选）'
            }
        }
    },
    outputs: {
        index: {
            name: '',
            display: '元素下标',
            type: 'number',
            addConfig: {
                label: '下标',
                type: 'variable',
                defaultValue: 'arrayIndex'
            }
        }
    }
};

export const impl = async function ({ arrayObj, searchValue, fromIndex = 0 }: { 
    arrayObj: Array<any>; 
    searchValue: any;
    fromIndex?: number;
}) {
    if (!Array.isArray(arrayObj)) {
        throw new Error('选择的对象不是数组');
    }

    // 使用 indexOf 方法查找元素下标
    const index = arrayObj.indexOf(searchValue, fromIndex);

    // 如果找不到元素，返回 -1
    return { index };
}; 
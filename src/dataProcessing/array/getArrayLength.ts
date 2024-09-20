import { DirectiveTree } from '../../types';
export const config: DirectiveTree = {
    name: 'dataProcessing.array.getArrayLength',
    displayName: '获取数组长度',
    comment: '获取${array}数组的长度,并将结果赋值给${length}变量',
    inputs: {
        array: {
            name: 'array',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '数组对象',
                placeholder: '数组对象',
                type: 'variable',
                filtersType: 'array',
                autoComplete: true
            }
        }
    },

    outputs: {
        length: {
            name: 'length',
            display: '数组长度',
            type: 'number',
            addConfig: {
                label: '数组长度',
                type: 'variable',
                defaultValue: ''
            }
        }
    }
};

export const impl = async function ({ array }: { array: Array<any> }) {
    return { length: array.length };
};

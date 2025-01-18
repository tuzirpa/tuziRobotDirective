import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'dataProcessing.map.keyGetValue',
    displayName: '获取Map指定元素',
    comment: '设置Map存储数据，将数据存入${mapObj}对象中,key为${key},value为${value}',
    inputs: {
        mapObj: {
            name: 'mapObj',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: 'Map对象',
                placeholder: '选择Map对象',
                type: 'variable',
                filtersType: 'map',
                autoComplete: true
            }
        },
        key: {
            name: 'key',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '数据key',
                placeholder: '数据key',
                type: 'string',
                autoComplete: true
            }
        }
    },

    outputs: {
        mapValue: {
            name: 'mapValue',
            display: '返回Map的Value',
            type: 'variable',
            addConfig: {
                label: '返回Map的Value',
                type: 'variable',
                defaultValue: ''
            }
        }
    }
};

export const impl = async function ({ mapObj, key }: { mapObj: Map<any, any>; key: any }) {
    return { mapValue: mapObj.get(key) };
};

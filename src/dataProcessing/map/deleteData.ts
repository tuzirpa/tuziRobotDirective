import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'dataProcessing.map.deleteData',
    displayName: '删除Map数据',
    comment: '删除Map数据,${mapObj}为Map对象,${key}为数据key',
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

    outputs: {}
};

export const impl = async function ({ mapObj, key }: { mapObj: Map<any, any>; key: string }) {
    mapObj.delete(key);
    console.log('删除Map数据成功', 'key:', key, mapObj);
};

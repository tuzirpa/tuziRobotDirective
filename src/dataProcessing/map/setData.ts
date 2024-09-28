import { DirectiveTree } from 'tuzirobot/types';
import { typeToCode } from 'tuzirobot/commonUtil';
export const config: DirectiveTree = {
    name: 'dataProcessing.map.setData',
    displayName: '设置Map存储数据',
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
        },
        value: {
            name: 'value',
            value: '',
            display: '',
            type: 'object',
            addConfig: {
                required: true,
                label: '数据值',
                placeholder: '数据值',
                type: 'object',
                autoComplete: true
            }
        }
    },

    outputs: {}

    // async toCode(directive, block) {
    //     const mapObj = directive.inputs.mapObj.value;
    //     const key = directive.inputs.key.value;
    //     const value = directive.inputs.value;

    //     return `await robotUtil.system.dataProcessing.map.setData({"mapObj": ${mapObj}, "key": '${key}', "value": ${typeToCode(
    //         value
    //     )}},${block});`;
    // }
};

export const impl = async function ({
    mapObj,
    key,
    value
}: {
    mapObj: Map<any, any>;
    key: any;
    value: any;
}) {
    mapObj.set(key, value);
    console.log('设置Map数据', 'key:', key, 'value:', value);
};

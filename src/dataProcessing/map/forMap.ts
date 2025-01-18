import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'dataProcessing.map.forMap',
    isControl: true,
    isLoop: true,
    isControlEnd: false,
    displayName: '循环Map数据',
    comment: '循环Map数据 ${mapObj}',
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
        }
    },

    outputs: {
        key: {
            name: 'key',
            type: 'string',
            display: 'Map键',
            addConfig: {
                required: true,
                type: 'variable',
                label: 'Map键'
            }
        },
        value: {
            name: 'value',
            type: 'string',
            display: 'Map值',
            addConfig: {
                required: true,
                type: 'variable',
                label: 'Map值'
            }
        }
    },
    async toCode(directive, block) {
        const { mapObj } = directive.inputs;
        const { key, value } = directive.outputs;
        const code = `for (const [${key.name}, ${value.name}] of await robotUtil.system.dataProcessing.map.forMap(${mapObj.value},${block})) {`;
        return code;
    }
};

export const impl = async function (mapObj: Map<any, any>) {
    return mapObj.entries();
};

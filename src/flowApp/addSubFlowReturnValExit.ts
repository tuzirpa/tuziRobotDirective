import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowApp.addSubFlowReturnValExit',
    displayName: '子流程添加返回值并返回（退出子流程）',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '添加返回值${val}到返回值列表中',
    inputs: {
        val: {
            name: 'val',
            value: '',
            type: 'array',
            addConfig: {
                label: '添加要返回的变量列表',
                type: 'variable',
                multiple: true,
                // required: true,
                tip: '添加要返回的内容'
            }
        }
    },
    outputs: {},
    async toCode(directive, block) {
        const { val } = directive.inputs;
        return `await robotUtil.system.flowApp.addSubFlowReturnVal({val: [${val.value}] },_returnVal,${block});return _returnVal;`;
    }
};

export const impl = async function (
    {
        val
    }: {
        val: any;
    },
    returnVal: any[]
) {
    returnVal.push(...val);
};

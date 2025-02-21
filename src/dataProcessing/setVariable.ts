import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'dataProcessing.setVariable',
    displayName: '设置变量',
    isControl: false,
    isControlEnd: false,
    comment: '设置${varType}变量 ${varName} 值为 ${varValue}',
    inputs: {
        varType: {
            name: '变量类型',
            value: '',
            display: '文本',
            type: 'string',
            addConfig: {
                label: '变量类型',
                type: 'select',
                required: true,
                defaultValue: 'string',
                tip: '选择变量类型',
                options: [
                    {
                        label: '文本',
                        value: 'string'
                    },
                    {
                        label: '数字',
                        value: 'number'
                    },
                    {
                        label: '任意对象',
                        value: 'object'
                    }
                ]
            }
        },
        varValue: {
            name: '变量值',
            value: '',
            type: 'object',
            addConfig: {
                label: '变量值',
                type: 'textarea',
                defaultValue: ''
            }
        }
    },
    outputs: {
        varName: {
            name: '',
            type: 'string',
            display: '字符串',

            addConfig: {
                label: '变量名',
                type: 'variable',
                defaultValue: 'variable'
            }
        }
    }
};

export const impl = async function ({ varType, varValue }: { varType: string; varValue: string }) {
    let varName: any = varValue;
    if (varType === 'number') {
        varName = Number(varValue);
    }

    if (varType === 'jsonObj') {
        try {
            varName = JSON.parse(varValue);
        } catch (error) {
            throw new Error('json对象格式错误');
        }
    }
    return { varName };
};

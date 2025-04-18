import { DirectiveTree } from 'tuzirobot/types';
import { typeToCode } from 'tuzirobot/commonUtil';

export const config: DirectiveTree = {
    name: 'dataProcessing.modificationVariable',
    displayName: '修改变量',
    isControl: false,
    isControlEnd: false,
    comment: '修改变量 ${varKey} 值为 ${varValue}',
    inputs: {
        varKey: {
            name: '',
            type: 'string',
            value: '',
            display: '',
            addConfig: {
                label: '要修改的变量',
                required: true,
                type: 'variable'
            }
        },
        varValue: {
            name: '变量值',
            value: '',
            type: 'object',
            enableExpression: true,
            addConfig: {
                label: '变量值',
                type: 'textarea',
                defaultValue: ''
            }
        }
    },
    outputs: {},

    async toCode(directive, block) {
        const name = directive.inputs.varKey.value;
        let varValue = directive.inputs.varValue;

        return `${name} = await robotUtil.system.dataProcessing.modificationVariable({"varValue": ${typeToCode(
            varValue
        )}},${block});`;
    }
};

export const impl = async function ({ varValue }: { varValue: any }) {
    return varValue;
};

import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowControl.catch',
    displayName: 'CATCH 异常处理',
    icon: 'icon-warning',
    sort: 21,
    isControl: true,
    isControlEnd: true,
    comment: '捕获异常并执行处理逻辑',
    inputs: {
        
    },
    outputs: {
        errorVariable: {
            name: '错误变量',
            type: 'string',
            display: '错误变量',
            addConfig: {
                label: '错误变量',
                type: 'variable',
                required: true,
                defaultValue: 'error',
                tip: '错误变量名称',
            },
        },
    },
    async toCode(directive, _block) {
        const { errorVariable } = directive.outputs;
        return `} catch (tempError) { ${errorVariable.name} = tempError;`;
    }
};

export const impl = async function () {
    // 实现为空，因为catch的逻辑在运行时由JavaScript引擎处理
};
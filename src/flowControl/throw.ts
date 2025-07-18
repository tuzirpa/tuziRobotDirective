import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowControl.throw',
    displayName: 'THROW 抛出异常',
    icon: 'icon-warning',
    sort: 22,
    isControl: false,
    isControlEnd: false,
    comment: '抛出一个异常，通常与TRY/CATCH配合使用',
    inputs: {
        errorMessage: {
            name: '异常消息',
            value: '抛出异常',
            type: 'string',
            display: '异常消息',
            addConfig: {
                label: '异常消息',
                type: 'textarea',
                required: false,
                defaultValue: '抛出异常',
                tip: '要抛出的异常消息内容',
            },
        },
    },
    outputs: {},
};

export const impl = async function ({ errorMessage }: { errorMessage: string }) {
    const message = errorMessage;
    throw new Error(message);
}; 
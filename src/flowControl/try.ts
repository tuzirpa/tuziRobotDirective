import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowControl.try',
    key: 'flowControl.try',
    displayName: 'TRY 异常捕获',
    icon: 'icon-warning',
    sort: 20,
    isControl: true,
    isControlEnd: false,
    comment: '尝试执行以下操作，如果发生异常则进入CATCH块处理',
    inputs: {},
    outputs: {},
    async toCode(_directive, _block) {
        return `try {`;
    }
};

export const impl = async function () {
    // 实现为空，因为try本身不需要任何逻辑
};

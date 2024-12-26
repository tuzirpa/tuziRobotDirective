import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'flowControl.tryEnd',
    key: 'flowControl.tryEnd',
    displayName: 'TRY-CATCH 结束',
    icon: 'icon-warning',
    sort: 22,
    isControl: false,
    isControlEnd: true,
    comment: '异常处理结束',
    inputs: {},
    outputs: {},
    async toCode(_directive, _block) {
        return `}`;
    }
};

export const impl = async function () {
    // 实现为空，因为tryEnd本身不需要任何逻辑
}; 
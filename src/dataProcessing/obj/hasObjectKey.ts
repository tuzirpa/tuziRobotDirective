import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'dataProcessing.obj.hasKey',
    sort: 4,
    displayName: '判断对象是否包含键',
    icon: 'icon-search',
    isControl: false,
    isControlEnd: false,
    description: '判断对象是否包含指定的键名',
    comment: '判断${object}对象是否包含键名${key}，结果保存到${result}中',
    inputs: {
        object: {
            name: 'object',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '目标对象',
                type: 'variable',
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
                label: '键名',
                type: 'string'
            }
        }
    },
    outputs: {
        result: {
            name: 'result',
            type: 'variable',
            addConfig: {
                required: true,
                label: '结果',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ object, key }: { object: any; key: string }): Promise<{ result: boolean }> {
    if (!object || typeof object !== 'object') {
        throw new Error('目标必须是一个有效的对象');
    }

    if (!key || typeof key !== 'string') {
        throw new Error('键名必须是非空字符串');
    }

    try {
        const result = Object.prototype.hasOwnProperty.call(object, key);
        return { result };
    } catch (error: any) {
        throw new Error(`判断对象键名失败: ${error.message || '未知错误'}`);
    }
}; 
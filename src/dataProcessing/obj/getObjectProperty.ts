import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'dataProcessing.obj.getProperty',
    sort: 5,
    displayName: '获取对象属性值',
    icon: 'icon-property',
    isControl: false,
    isControlEnd: false,
    description: '获取对象指定属性的值',
    comment: '获取${object}对象的${key}属性值，结果保存到${result}中',
    inputs: {
        object: {
            name: 'object',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '目标对象',
                placeholder: '请输入对象',
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
                label: '属性名',
                placeholder: '请输入属性名',
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
                label: '属性值',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ object, key }: { object: any; key: string }): Promise<{ result: any }> {
    if (!object || typeof object !== 'object') {
        throw new Error('目标必须是一个有效的对象');
    }

    if (!key || typeof key !== 'string') {
        throw new Error('属性名必须是非空字符串');
    }

    try {
        if (!Object.prototype.hasOwnProperty.call(object, key)) {
            throw new Error(`对象不存在属性: ${key}`);
        }
        return { result: object[key] };
    } catch (error: any) {
        throw new Error(`获取对象属性值失败: ${error.message || '未知错误'}`);
    }
}; 
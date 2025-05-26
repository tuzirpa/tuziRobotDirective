import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'dataProcessing.obj.getValues',
    sort: 2,
    displayName: '获取对象所有值',
    icon: 'icon-data',
    isControl: false,
    isControlEnd: false,
    description: '获取对象的所有值，返回值数组',
    comment: '获取${object}对象的所有值，结果保存到${result}中',
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
        }
    },
    outputs: {
        result: {
            name: 'result',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '结果数组',
                placeholder: '存储对象所有值的数组',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ object }: { object: any }): Promise<{ result: any[] }> {
    if (!object || typeof object !== 'object') {
        throw new Error('目标必须是一个有效的对象');
    }

    try {
        const values = Object.values(object);
        return { result: values };
    } catch (error: any) {
        throw new Error(`获取对象值失败: ${error.message || '未知错误'}`);
    }
}; 
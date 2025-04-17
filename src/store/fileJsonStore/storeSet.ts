import { DirectiveTree } from 'tuzirobot/types';
import { JsonStorage } from '../../utils/JsonStore';

export const config: DirectiveTree = {
    name: 'store.setJsonValue',
    sort: 2,
    displayName: '设置JSON存储值',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将${value}值存储到${store}的${key}键中',
    inputs: {
        store: {
            name: 'store',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                placeholder: '请选择存储对象',
                label: '存储对象',
                defaultValue: '',
                type: 'variable',
                filtersType: 'store.fileJsonStore.JsonStorage',
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
                placeholder: '请输入存储键名',
                label: '键名',
                defaultValue: '',
                type: 'string'
            }
        },
        value: {
            name: 'value',
            value: '',
            display: '',
            type: 'object',
            addConfig: {
                required: true,
                placeholder: '请输入要存储的值',
                label: '存储值',
                defaultValue: '',
                type: 'textarea'
            }
        }
    },
    outputs: {
        result: {
            name: '',
            display: '存储结果',
            type: 'object',
            addConfig: {
                required: false,
                label: '存储结果',
                defaultValue: 'storeResult',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ store, key, value }: { store: JsonStorage; key: string; value: any }) {
    const result = store.set(key, value);
    return { result };
};

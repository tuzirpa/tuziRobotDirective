import { DirectiveTree } from 'tuzirobot/types';
import { JsonStorage } from '../../utils/JsonStore';

export const config: DirectiveTree = {
    name: 'store.getJsonValue',
    sort: 3,
    displayName: '获取JSON存储值',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '从${store}中获取${key}键的值并赋值给${value}变量',
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
        defaultValue: {
            name: 'defaultValue',
            value: '',
            display: '',
            type: 'object',
            addConfig: {
                required: false,
                label: '默认值',
                placeholder: '请输入默认值,如果键名不存在,则返回默认值',
                defaultValue: '',
                type: 'textarea'
            }
        }
    },
    outputs: {
        value: {
            name: '',
            display: '获取的值',
            type: 'variable',
            addConfig: {
                required: true,
                label: '获取的值',
                defaultValue: 'storedValue',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ store, key, defaultValue }: { store: JsonStorage; key: string; defaultValue: any }) {
    let value = store.get(key);
    value = value ?? defaultValue;
    return { value };
};

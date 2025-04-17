import { DirectiveTree } from 'tuzirobot/types';
import { JsonStorage } from '../../utils/JsonStore';

export const config: DirectiveTree = {
    name: 'store.deleteJsonValue',
    sort: 4,
    displayName: '删除JSON存储',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '从${store}中删除${key}键的值',
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
                placeholder: '请输入要删除的键名',
                label: '键名',
                defaultValue: '',
                type: 'string'
            }
        }
    },
    outputs: {
        result: {
            name: '',
            display: '删除结果',
            type: 'variable',
            addConfig: {
                label: '删除结果-返回被删除的值',
                defaultValue: 'deleteResult',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ store, key }: { store: JsonStorage; key: string }) {
    return { result: store.delete(key) };
}; 
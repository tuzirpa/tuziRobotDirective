import { DirectiveTree } from 'tuzirobot/types';
import { JsonStorage } from '../../utils/JsonStore';

export const config: DirectiveTree = {
    name: 'store.clearJsonStore',
    sort: 5,
    displayName: '清空JSON存储',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '清空${store}中的所有数据',
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
        }
    },
    outputs: {}
};

export const impl = async function ({ store }: { store: JsonStorage }) {
    store.clear();
    return {};
}; 
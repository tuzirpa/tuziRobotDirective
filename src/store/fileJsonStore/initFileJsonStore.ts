import { DirectiveTree } from 'tuzirobot/types';
import { JsonStorage } from '../../utils/JsonStore';

export const config: DirectiveTree = {
    name: 'store.initJsonStore',
    sort: 1,
    displayName: '初始化JSON存储',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '初始化JSON存储文件${filePath},并将存储对象赋值给${store}变量',
    inputs: {
        filePath: {
            name: 'filePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                placeholder: '请填写JSON存储文件路径',
                label: 'JSON文件路径',
                defaultValue: 'data.json',
                type: 'string'
            }
        }
    },
    outputs: {
        store: {
            name: '',
            display: '存储对象',
            type: 'store.fileJsonStore.JsonStorage',
            addConfig: {
                required: true,
                label: '存储对象',
                defaultValue: 'jsonStore',
                type: 'variable'
            }
        }
    }
};

export const impl = async function ({ filePath }: { filePath: string }) {
    const store = new JsonStorage(filePath);
    return { store };
};

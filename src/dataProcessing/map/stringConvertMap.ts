import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'dataProcessing.map.stringConvertMap',
    displayName: 'JSON字符串转Map对象',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将JSON字符串${jsonContent}转换为MAP对象,并输出到变量${jsonObj}',
    inputs: {
        jsonContent: {
            name: 'jsonContent',
            value: '',
            type: 'string',
            addConfig: {
                label: 'Json文本',
                type: 'string',
                placeholder: '请输入json文本 例如：{"name": "tuzi", "age": 18}',
                defaultValue: '',
                tip: ''
            }
        }
    },
    outputs: {
        mapObj: {
            name: '',
            type: 'Map',
            display: 'Map对象',
            addConfig: {
                label: 'Map对象',
                type: 'variable',
                defaultValue: 'Map对象',
                tip: ''
            }
        }
    }
};

export const impl = async function ({ jsonContent }: { jsonContent: string }) {
    const jsonObj = JSON.parse(jsonContent);
    const mapObj = new Map();
    for (const key in jsonObj) {
        mapObj.set(key, jsonObj[key]);
    }
    return { mapObj };
};

import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'dataProcessing.stringConvertObj',
    displayName: 'JSON字符串转对象',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将JSON字符串${jsonContent}转换为对象,并输出到变量${jsonObj}',
    inputs: {
        jsonContent: {
            name: 'jsonContent',
            value: '',
            type: 'string',
            addConfig: {
                label: 'Json文本',
                type: 'textarea',
                placeholder: '请输入json文本 例如：{"name": "tuzi", "age": 18}',
                defaultValue: '',
                tip: ''
            }
        }
    },
    outputs: {
        jsonObj: {
            name: '',
            type: 'any',
            display: 'JSON对象',
            addConfig: {
                label: 'JSON对象',
                type: 'variable',
                defaultValue: 'JSON对象',
                tip: ''
            }
        }
    }
};

export const impl = async function ({ jsonContent }: { jsonContent: string }) {
    const jsonObj = JSON.parse(jsonContent);
    return { jsonObj };
};

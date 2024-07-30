import { DirectiveTree } from '../types';

export const config: DirectiveTree = {
    name: 'dataProcessing.objConvertString',
    displayName: '对象转JSON字符串',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '将对象${obj}转换为JSON字符串,并将结果赋值给${content}',
    inputs: {
        obj: {
            name: 'obj',
            value: '',
            type: 'variable',
            addConfig: {
                label: '转换的对象',
                type: 'variable',
                placeholder: '请输入转换的对象',
                defaultValue: '',
                tip: '转换的对象'
            }
        }
    },
    outputs: {
        content: {
            name: 'content',
            type: 'string',
            display: '转换结果',
            addConfig: {
                label: '转换结果',
                type: 'variable',
                tip: '转换结果'
            }
        }
    }
};

const conver = (content: any) => {
    const cacheMap = new Map();
    const convertMapToObject = (map: Map<any, any>) => {
        const obj: Record<any, any> = {};
        for (const [key, value] of map.entries()) {
            obj[key] = ((value) => {
                const cacheKey = value;
                if (cacheMap.has(cacheKey)) {
                    return cacheMap.get(cacheKey);
                }

                if (value instanceof Map) {
                    return convertMapToObject(value);
                } else if (Array.isArray(value)) {
                    value = value.map((item) => {
                        if (item instanceof Map) {
                            return convertMapToObject(item);
                        }
                        return item;
                    });
                    cacheMap.set(cacheKey, value);
                    return value;
                }

                cacheMap.set(cacheKey, value);
                return value;
            })(value);
        }
        return obj;
    };

    if (content instanceof Map) {
        content = convertMapToObject(content);
    } else if (Array.isArray(content)) {
        const arr = [];
        for (let item of content) {
            if (item instanceof Map) {
                arr.push(convertMapToObject(item));
            } else {
                arr.push(item);
            }
        }
        content = arr;
    }

    cacheMap.clear();
    return content;
};

export const impl = async function ({ obj }: { obj: any }) {
    const content = JSON.stringify(conver(obj), null, 2);
    return { content };
};

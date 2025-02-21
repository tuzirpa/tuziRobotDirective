import { randomUUID } from 'node:crypto';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'text.genUUIDString',
    icon: 'icon-web-create',
    displayName: '生成唯一文本',
    description:
        '生成一个随机的UUID字符串(32位文本 列如: 476b252642c14be29194c320d086d655)，并保存到变量中',
    comment: '生成唯一文本,保存到变量${text}',
    inputs: {},

    outputs: {
        text: {
            name: '',
            display: '字符串',
            type: 'string',
            addConfig: {
                label: '生成的文本',
                type: 'variable',
                defaultValue: '唯一文本'
            }
        }
    }
};

export const impl = async function () {
    const text = randomUUID().replace(/-/g, '');
    return { text };
};

import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';
export const config: DirectiveTree = {
    name: 'web.getUrlParam',
    icon: 'icon-web-create',
    displayName: '获取网址参数',
    comment:
        '获取网址${url}中的参数${paramKey}，保存到变量${paramValue}中,注：如有多个一样的参数只获取第一个',
    inputs: {
        url: {
            name: 'url',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '网站',
                placeholder: '请输入网址 例如：https://www.baidu.com?word=hello',
                type: 'textarea'
            }
        },
        paramKey: {
            name: 'paramKey',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '参数名',
                placeholder: '请输入参数名 例如：word',
                type: 'string'
            }
        }
    },

    outputs: {
        paramValue: {
            name: '',
            display: '浏览器参数值',
            type: 'array',
            addConfig: {
                label: '参数值',
                type: 'variable',
                defaultValue: 'paramValue'
            }
        }
    }
};

export const impl = async function ({ url, paramKey }: { url: string; paramKey: string }) {
    console.log('url:', url, 'paramKey:', paramKey);

    if (url.includes('?')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const value = params.get(paramKey);
        if (value) {
            return { paramValue: value };
        }
    }
    return { paramValue: '' };
};

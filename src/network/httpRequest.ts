import { DirectiveTree } from '../types';
import axios from 'axios';

const config: DirectiveTree = {
    name: 'network.httpRequest',
    sort: 2,
    displayName: 'http请求',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '发起http请求,请求方法为${method}',
    inputs: {
        method: {
            name: 'method',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '请求方法',
                required: true,
                type: 'select',
                options: [
                    {
                        label: 'GET',
                        value: 'GET'
                    },
                    {
                        label: 'POST',
                        value: 'POST'
                    }
                ],
                defaultValue: 'GET'
            }
        },
        url: {
            name: 'url',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: 'URL',
                required: true,
                type: 'string',
                placeholder: '请输入URL'
            }
        },

        protocolHeader: {
            name: 'protocolHeader',
            value: '',
            display: '',
            type: 'textarea',
            addConfig: {
                label: '协议头',
                type: 'textarea',
                placeholder: `设置请求协议头，例如：
        Accept: application/json, text/plain, */*
        Accept-Encoding: gzip, deflate, br, zstd
        Accept-Language: zh-CN,zh;q=0.9
        Cache-Control: no-cache
        `,
                defaultValue: ''
            }
        },

        protocolBody: {
            name: 'protocolBody',
            value: '',
            display: '',
            type: 'textarea',
            addConfig: {
                label: '协议体',
                type: 'textarea',
                placeholder: '提交的数据体',
                filters: "this.inputs.method.value == 'POST'"
            }
        }
    },
    outputs: {
        resResult: {
            name: '',
            display: '请求结果',
            type: 'string',
            addConfig: {
                label: '请求结果',
                type: 'variable',
                defaultValue: 'resResult'
            }
        }
    }
};

const impl = async function ({
    method,
    url,
    protocolHeader,
    protocolBody
}: {
    method: string;
    url: string;
    protocolHeader: string;
    protocolBody: string;
}) {
    let headers;
    if (protocolHeader) {
        headers = protocolHeader.split('\n').reduce((acc, cur) => {
            const [key, value] = cur.split(':');
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {} as Record<string, string>);
    }

    const resResult = await axios({
        method: method,
        url: url,
        data: protocolBody,
        headers: headers
    });

    return { resResult: resResult.data };
};

export { config, impl };

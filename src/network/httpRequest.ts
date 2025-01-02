import { DirectiveTree } from 'tuzirobot/types';
import axios, { AxiosRequestConfig, Method } from 'axios';

export const config: DirectiveTree = {
    name: 'network.httpRequest',
    displayName: 'HTTP请求',
    icon: 'icon-http',
    comment: '发起HTTP请求，请求方法为${method}，URL为${url}',
    inputs: {
        method: {
            name: 'method',
            value: '',
            type: 'string',
            addConfig: {
                label: '请求方法',
                type: 'select',
                required: true,
                defaultValue: 'GET',
                options: [
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' },
                    { label: 'PUT', value: 'PUT' },
                    { label: 'DELETE', value: 'DELETE' },
                    { label: 'PATCH', value: 'PATCH' },
                    { label: 'HEAD', value: 'HEAD' },
                    { label: 'OPTIONS', value: 'OPTIONS' }
                ]
            }
        },
        url: {
            name: 'url',
            value: '',
            type: 'string',
            addConfig: {
                label: 'URL',
                type: 'string',
                required: true,
                placeholder: '请输入完整的URL地址，例如: https://api.example.com/data'
            }
        },
        headers: {
            name: 'headers',
            value: '',
            type: 'textarea',
            addConfig: {
                label: '请求头',
                type: 'textarea',
                placeholder: `请求头信息，每行一个，格式为 key: value
例如:
Content-Type: application/json
Authorization: Bearer token
Accept: application/json`,
                isAdvanced: true
            }
        },
        body: {
            name: 'body',
            value: '',
            type: 'textarea',
            addConfig: {
                label: '请求体',
                type: 'textarea',
                placeholder: '请输入请求体内容，支持JSON格式',
                filters: "['POST', 'PUT', 'PATCH'].includes(this.inputs.method.value)",
                tip: '仅在 POST/PUT/PATCH 请求时可用'
            }
        },
        timeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                label: '超时时间',
                type: 'string',
                defaultValue: '30',
                placeholder: '请求超时时间（秒）',
                isAdvanced: true
            }
        }
    },
    outputs: {
        response: {
            name: 'response',
            type: 'variable',
            display: '响应数据',
            addConfig: {
                label: '响应数据',
                type: 'variable',
                defaultValue: 'httpResponse'
            }
        },
        statusCode: {
            name: 'statusCode',
            type: 'number',
            display: '状态码',
            addConfig: {
                label: '状态码',
                type: 'variable',
                defaultValue: 'httpStatus'
            }
        }
    }
};

export const impl = async function ({
    method,
    url,
    headers: rawHeaders,
    body,
    timeout = 30
}: {
    method: Method;
    url: string;
    headers?: string;
    body?: string;
    timeout?: number;
}) {
    try {
        const headers = rawHeaders?.split('\n').reduce((acc, line) => {
            const [key, ...values] = line.split(':');
            if (key && values.length) {
                acc[key.trim()] = values.join(':').trim();
            }
            return acc;
        }, {} as Record<string, string>);

        const config: AxiosRequestConfig = {
            method,
            url,
            headers,
            timeout: timeout * 1000
        };

        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                config.data = JSON.parse(body);
            } catch {
                config.data = body;
            }
        }

        const response = await axios(config);

        return {
            response: response.data,
            statusCode: response.status
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`HTTP请求失败: ${error.message}${error.response ? `, 状态码: ${error.response.status}` : ''}`);
        }
        throw error;
    }
};

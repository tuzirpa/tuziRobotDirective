import { DirectiveTree } from 'tuzirobot/types';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

export const config: DirectiveTree = {
    name: 'network.uploadFile',
    displayName: 'HTTP上传文件 (未测试)',
    icon: 'icon-upload',
    comment: '上传文件到${url}，文件字段名为${fieldName}',
    inputs: {
        url: {
            name: 'url',
            value: '',
            type: 'string',
            addConfig: {
                label: '上传地址',
                type: 'string',
                required: true,
                placeholder: '请输入文件上传的URL地址'
            }
        },
        filePaths: {
            name: 'filePaths',
            value: '',
            type: 'object',
            addConfig: {
                label: '文件路径',
                type: 'object',
                required: true,
                placeholder: '文件路径或路径数组',
                tip: '可以是单个文件路径(字符串)或多个文件路径(字符串数组)'
            }
        },
        fieldName: {
            name: 'fieldName',
            value: '',
            type: 'string',
            addConfig: {
                label: '文件字段名',
                type: 'string',
                required: true,
                defaultValue: 'file',
                placeholder: '上传文件的字段名称',
                tip: '服务器接收文件的字段名'
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
Authorization: Bearer token`,
                isAdvanced: true
            }
        },
        extraFields: {
            name: 'extraFields',
            value: '',
            type: 'textarea',
            addConfig: {
                label: '额外字段',
                type: 'textarea',
                placeholder: `额外的表单字段，JSON格式
例如:
{
    "name": "测试文件",
    "type": "image"
}`,
                isAdvanced: true
            }
        },
        timeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                label: '超时时间',
                type: 'string',
                defaultValue: '60',
                placeholder: '上传超时时间（秒）',
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
                defaultValue: 'uploadResponse'
            }
        },
        statusCode: {
            name: 'statusCode',
            type: 'number',
            display: '状态码',
            addConfig: {
                label: '状态码',
                type: 'variable',
                defaultValue: 'uploadStatus'
            }
        }
    }
};

export const impl = async function ({
    url,
    filePaths,
    fieldName,
    headers: rawHeaders,
    extraFields,
    timeout = 60
}: {
    url: string;
    filePaths: string | string[];
    fieldName: string;
    headers?: string;
    extraFields?: string;
    timeout?: number;
}) {
    try {
        const formData = new FormData();
        const paths = Array.isArray(filePaths) ? filePaths : [filePaths];

        // 添加文件
        for (const filePath of paths) {
            if (!fs.existsSync(filePath)) {
                throw new Error(`文件不存在: ${filePath}`);
            }
            const fileName = path.basename(filePath);
            formData.append(fieldName, fs.createReadStream(filePath), fileName);
        }

        // 添加额外字段
        if (extraFields) {
            try {
                const fields = JSON.parse(extraFields);
                for (const [key, value] of Object.entries(fields)) {
                    formData.append(key, value);
                }
            } catch (error) {
                throw new Error('额外字段格式错误，请使用正确的JSON格式');
            }
        }

        // 处理请求头
        const headers = rawHeaders?.split('\n').reduce((acc, line) => {
            const [key, ...values] = line.split(':');
            if (key && values.length) {
                acc[key.trim()] = values.join(':').trim();
            }
            return acc;
        }, {} as Record<string, string>) || {};

        // 合并表单数据的请求头
        Object.assign(headers, formData.getHeaders());

        const response = await axios.post(url, formData, {
            headers,
            timeout: timeout * 1000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });

        return {
            response: response.data,
            statusCode: response.status
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`文件上传失败: ${error.message}${error.response ? `, 状态码: ${error.response.status}` : ''}`);
        }
        throw error;
    }
}; 
import { DirectiveTree } from 'tuzirobot/types';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { getCurApp } from 'tuzirobot/commonUtil';

const config: DirectiveTree = {
    name: 'network.downloadFile',
    sort: 2,
    displayName: '下载文件',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '文件${url} 下载到 ${downloadPath? downloadPath : "应用目录/download"}/${fileName ? fileName : "按URL文件名"}',
    inputs: {
        url: {
            name: 'url',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '下载链接',
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

        downloadPath: {
            name: 'downloadPath',
            value: '',
            type: 'string',
            addConfig: {
                label: '下载目录',
                type: 'filePath',
                defaultValue: '',
                placeholder: '请选择下载目录, 留空则使用当前工作目录',
                openDirectory: true,
                tip: '下载保存路径'
            }
        },

        fileName: {
            name: 'fileName',
            value: '',
            type: 'string',
            addConfig: {
                label: '保存的文件名',
                placeholder: '请输入文件名, 留空则使用URL文件名',
                type: 'filePath',
                defaultValue: '',
                tip: '保存的文件名',
                required: false
            }
        }
    },
    outputs: {
        filePath: {
            name: '',
            display: '文件路径',
            type: 'string',
            addConfig: {
                label: '文件路径',
                type: 'variable',
                defaultValue: 'filePath'
            }
        }
    }
};

const impl = async function ({
    url,
    downloadPath,
    fileName,
    protocolHeader
}: {
    url: string;
    downloadPath: string;
    fileName: string;
    protocolHeader: string;
}) {
    const downloadFile = async () => {
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
        const response = await axios({
            headers: headers,
            method: 'GET',
            url: url,
            responseType: 'stream', // 指定响应数据的流类型
            onDownloadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.debug(`下载进度... ${percentCompleted}%`);
                } else {
                    console.debug(`开始下载...`);
                }
            }
        });
        if(!downloadPath){
            downloadPath = getCurApp().APP_DIR;
            downloadPath = path.join(downloadPath, 'download');
        }
        if (!fs.existsSync(downloadPath)) {
            fs.mkdirSync(downloadPath, { recursive: true });
        }

        let tempName = path.basename(url);
        if (tempName.includes('?')) {
            tempName = tempName.split('?')[0];
        }

        const tempFileName = fileName || tempName;
        downloadPath = path.join(downloadPath, tempFileName);

        return new Promise((resolve, reject) => {
            // 使用管道流将响应数据直接写入文件
            const writer = fs.createWriteStream(downloadPath);
            writer.on('error', (err) => {
                reject(err);
            });
            response.data.pipe(writer);

            response.data.on('end', () => {
                console.log('文件下载成功!', downloadPath);
                resolve(downloadPath);
            });

            response.data.on('error', (err: any) => {
                console.error('文件下载失败:' + url, err);
                reject(err);
            });
        });
    };
    try{
        const filePath = await downloadFile();
        return { filePath };
    }catch(e){
        console.error('文件下载失败:' + url);
        throw e;
    }

};

export { config, impl };

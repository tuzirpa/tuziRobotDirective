const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { log } = require('console');

const url = 'https://gw.alicdn.com/tfs/TB1d0h2qVYqK1RjSZLeXXbXppXa-1125-960.png?getAvatar=avatar';
let downloadPath = 'F:\\goods\\goodsImg\\detail',
    fileName = 'aaaa.jpg?getAvatar=avatar',
    protocolHeader = '';

const downloadFile = async () => {
    let headers;
    if (protocolHeader) {
        headers = protocolHeader.split('\n').reduce((acc, cur) => {
            const [key, value] = cur.split(': ');
            if (key && value) {
                acc[key.trim()] = value.trim();
            }
            return acc;
        }, {});
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

    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath, { recursive: true });
    }

    let tempName = path.basename(url);
    if (tempName.includes('?')) {
        tempName = tempName.split('?')[0];
    }

    const tempFileName = fileName || tempName;
    downloadPath = path.join(downloadPath, tempFileName);
    // 使用管道流将响应数据直接写入文件
    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(downloadPath);
        writer.on('error', (err) => {
            reject(err);
        });
        response.data.pipe(writer);
        response.data.on('end', () => {
            resolve(downloadPath);
            console.log('文件下载成功!', downloadPath);
        });

        response.data.on('error', (err) => {
            reject(err);
            console.error('文件下载失败:', err);
        });
    });
};

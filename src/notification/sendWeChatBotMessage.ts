import { DirectiveTree } from 'tuzirobot/types';
import axios from 'axios';
import fs from 'fs/promises';
import crypto from 'crypto';

export const config: DirectiveTree = {
    name: 'notification.sendWeChatBotMessage',
    displayName: '发送企业微信机器人消息',
    icon: 'icon-web-create',
    comment: '发送 ${msgtype} 消息 ${msgtype === "图片" ? imagePath : content} 到企业微信机器人',
    inputs: {
        webhookUrl: {
            name: 'webhookUrl',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                label: 'Webhook地址',
                type: 'textarea',
                placeholder: '请输入企业微信机器人的Webhook地址',
                tip: '在企业微信群 -> 添加机器人 -> 复制Webhook地址'
            }
        },
        
        msgtype: {
            name: 'msgtype',
            value: 'text',
            display: '文本',
            type: 'string',
            addConfig: {
                label: '消息类型',
                type: 'select',
                options: [
                    { label: '文本', value: 'text' },
                    { label: 'Markdown', value: 'markdown' },
                    { label: '图片', value: 'image' }
                ],
                defaultValue: 'text'
            }
        },
        content: {
            name: 'content',
            value: '',
            type: 'string',
            addConfig: {
                required: false,
                label: '消息内容',
                type: 'textarea',
                placeholder: '请输入要发送的消息内容',
                tip: '支持markdown格式',
                filters: 'this.inputs.msgtype.value !== "image"'
            }
        },
        imagePath: {
            name: 'imagePath',
            value: '',
            type: 'string',
            addConfig: {
                label: '图片路径',
                type: 'filePath',
                placeholder: '本地图片路径或网络图片URL',
                filters: 'this.inputs.msgtype.value === "image"',
                tip: '支持本地图片路径或网络图片URL',
                extensions: ['jpg', 'jpeg', 'png', 'gif']
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    webhookUrl,
    content,
    msgtype = 'text',
    imagePath
}: {
    webhookUrl: string;
    content?: string;
    msgtype?: 'text' | 'markdown' | 'image';
    imagePath?: string;
}) {
    try {
        if (!webhookUrl) {
            throw new Error('Webhook地址不能为空');
        }

        if (msgtype !== 'image' && !content) {
            throw new Error('消息内容不能为空');
        }
        let data;
        if (msgtype === 'image') {
            if (!imagePath) {
                throw new Error('图片路径不能为空');
            }

            let imageBuffer: Buffer;
            if (imagePath.startsWith('http')) {
                // 下载网络图片
                const response = await axios.get(imagePath, {
                    responseType: 'arraybuffer'
                });
                imageBuffer = Buffer.from(response.data);
            } else {
                // 读取本地图片
                imageBuffer = await fs.readFile(imagePath);
            }
            //检验图片大小不能超过2MB
            if (imageBuffer.length > 2 * 1024 * 1024) {
                throw new Error('图片大小不能超过2MB');
            }
            // 计算MD5
            const md5 = crypto.createHash('md5').update(imageBuffer).digest('hex');
            // 转换为Base64
            const base64 = imageBuffer.toString('base64');

            data = {
                msgtype,
                image: {
                    base64,
                    md5
                }
            };
        } else {
          
            data = {
                msgtype,
                [msgtype]: {
                    content
                }
            };
        }

        const response = await axios.post(webhookUrl, data);

        if (response.data.errcode !== 0) {
            throw new Error(`发送失败: ${response.data.errmsg}`);
        }

        console.debug('企业微信机器人消息发送成功');

    } catch (error) {
        console.error('发送企业微信机器人消息失败:', error);
        throw error;
    }
}; 
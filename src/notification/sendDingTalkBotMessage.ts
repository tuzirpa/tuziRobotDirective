import { DirectiveTree } from 'tuzirobot/types';
import axios from 'axios';
import crypto from 'crypto';

export const config: DirectiveTree = {
    name: 'notification.sendDingTalkBotMessage',
    displayName: '发送钉钉机器人消息（未测试）',
    icon: 'icon-web-create',
    comment: '发送${content}到钉钉机器人',
    inputs: {
        webhookUrl: {
            name: 'webhookUrl',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                label: 'Webhook地址',
                type: 'textarea',
                placeholder: '请输入钉钉机器人的Webhook地址',
                tip: '在钉钉群 -> 智能群助手 -> 添加机器人 -> 复制Webhook地址'
            }
        },
        secret: {
            name: 'secret',
            value: '',
            type: 'string',
            addConfig: {
                label: '加签密钥',
                type: 'string',
                placeholder: '如果开启加签安全设置，请输入密钥',
                tip: '在机器人安全设置中获取'
            }
        },
        content: {
            name: 'content',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                label: '消息内容',
                type: 'textarea',
                placeholder: '请输入要发送的消息内容',
                tip: '支持markdown格式'
            }
        },
        msgtype: {
            name: 'msgtype',
            value: 'text',
            type: 'string',
            addConfig: {
                label: '消息类型',
                type: 'select',
                options: [
                    { label: '文本', value: 'text' },
                    { label: 'Markdown', value: 'markdown' }
                ],
                defaultValue: 'text'
            }
        },
        imagePath: {
            name: 'imagePath',
            value: '',
            type: 'string',
            addConfig: {
                label: '图片URL',
                type: 'string',
                placeholder: '网络图片URL',
                filters: 'this.inputs.msgtype.value === "markdown"',
                tip: '在markdown内容中可以使用 ![图片](图片URL) 语法插入图片'
            }
        },
        title: {
            name: 'title',
            value: '',
            type: 'string',
            addConfig: {
                label: '标题',
                type: 'string',
                placeholder: '消息标题(markdown类型必填)',
                filters: 'this.inputs.msgtype.value === "markdown"'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    webhookUrl,
    secret,
    content,
    msgtype = 'text',
    imagePath,
    title
}: {
    webhookUrl: string;
    secret?: string;
    content: string;
    msgtype?: 'text' | 'markdown';
    imagePath?: string;
    title?: string;
}) {
    try {
        if (!webhookUrl) {
            throw new Error('Webhook地址不能为空');
        }

        if (!content) {
            throw new Error('消息内容不能为空');
        }

        if (msgtype === 'markdown' && !title) {
            throw new Error('markdown类型消息必须提供标题');
        }

        if (msgtype === 'markdown' && !imagePath) {
            throw new Error('markdown类型消息必须提供图片路径');
        }

        let url = webhookUrl;
        
        // 如果提供了加签密钥，计算签名
        if (secret) {
            const timestamp = Date.now();
            const stringToSign = `${timestamp}\n${secret}`;
            const sign = crypto
                .createHmac('sha256', secret)
                .update(stringToSign)
                .digest('base64');

            url = `${webhookUrl}&timestamp=${timestamp}&sign=${encodeURIComponent(sign)}`;
        }

        const data = {
            msgtype,
            [msgtype]: msgtype === 'text' ? {
                content
            } : {
                title: title || '图片消息',
                text: imagePath ? `${content}\n![图片](${imagePath})` : content
            }
        };

        const response = await axios.post(url, data);

        if (response.data.errcode !== 0) {
            throw new Error(`发送失败: ${response.data.errmsg}`);
        }

        console.debug('钉钉机器人消息发送成功');

    } catch (error) {
        console.error('发送钉钉机器人消息失败:', error);
        throw error;
    }
}; 
import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.showMessage',
    displayName: '显示提示消息',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中显示提示消息${message}',
    inputs: {
        browserPage: {
            name: 'browserPage',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '网页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true,
                required: true
            }
        },
        message: {
            name: 'message',
            value: '',
            type: 'string',
            addConfig: {
                label: '提示消息',
                type: 'string',
                defaultValue: '',
                placeholder: '请输入要显示的提示消息',
                required: true
            }
        },
        duration: {
            name: 'duration',
            value: '3',
            type: 'number',
            addConfig: {
                label: '显示时长',
                type: 'string',
                defaultValue: '3',
                placeholder: '消息显示的时长（秒），0表示不自动关闭',
                isAdvanced: true
            }
        },
        position: {
            name: 'position',
            value: 'topRight',
            type: 'string',
            addConfig: {
                label: '显示位置',
                type: 'select',
                defaultValue: 'topRight',
                options: [
                    { label: '顶部', value: 'top' },
                    { label: '底部', value: 'bottom' },
                    { label: '中间', value: 'center' },
                    { label: '右上角', value: 'topRight' }
                ],
                isAdvanced: true
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    browserPage,
    message,
    duration = 3,
    position = 'topRight'
}: {
    browserPage: Page;
    message: string;
    duration?: number;
    position?: 'top' | 'bottom' | 'center' | 'topRight';
}) {
    // 将秒转换为毫秒
    const durationMs = duration * 1000;
    
    await browserPage.evaluate(
        (msg: string, dur: number, pos: string) => {
            // 移除已存在的消息
            const existingMsg = document.getElementById('tuzi-message');
            if (existingMsg) {
                existingMsg.remove();
            }

            // 创建消息容器
            const messageDiv = document.createElement('div');
            messageDiv.id = 'tuzi-message';
            
            // 根据位置设置样式
            let positionStyle = '';
            let transformStyle = '';
            
            if (pos === 'top') {
                positionStyle = 'top: 20px; left: 50%;';
                transformStyle = 'translateX(-50%)';
            } else if (pos === 'bottom') {
                positionStyle = 'bottom: 20px; left: 50%;';
                transformStyle = 'translateX(-50%)';
            } else if (pos === 'topRight') {
                positionStyle = 'top: 20px; right: 20px;';
                transformStyle = 'none';
            } else {
                positionStyle = 'top: 50%; left: 50%;';
                transformStyle = 'translate(-50%, -50%)';
            }
            
            messageDiv.style.cssText = `
                position: fixed;
                ${positionStyle}
                transform: ${transformStyle};
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 999998;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                max-width: 80%;
                word-wrap: break-word;
                animation: tuzi-message-fadein 0.3s ease-in;
            `;

            // 添加动画样式（如果还没有）
            if (!document.getElementById('tuzi-message-style')) {
                const style = document.createElement('style');
                style.id = 'tuzi-message-style';
                style.textContent = `
                    @keyframes tuzi-message-fadein {
                        from {
                            opacity: 0;
                            transform: ${pos === 'center' ? 'translate(-50%, -60%)' : pos === 'topRight' ? 'translateX(20px)' : pos === 'top' ? 'translateX(-50%) translateY(-20px)' : 'translateX(-50%) translateY(20px)'};
                        }
                        to {
                            opacity: 1;
                            transform: ${pos === 'center' ? 'translate(-50%, -50%)' : pos === 'topRight' ? 'none' : pos === 'top' ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(0)'};
                        }
                    }
                    @keyframes tuzi-message-fadeout {
                        from {
                            opacity: 1;
                            transform: ${pos === 'center' ? 'translate(-50%, -50%)' : pos === 'topRight' ? 'none' : pos === 'top' ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(0)'};
                        }
                        to {
                            opacity: 0;
                            transform: ${pos === 'center' ? 'translate(-50%, -60%)' : pos === 'topRight' ? 'translateX(20px)' : pos === 'top' ? 'translateX(-50%) translateY(-20px)' : 'translateX(-50%) translateY(20px)'};
                        }
                    }
                `;
                document.head.appendChild(style);
            }

            messageDiv.textContent = msg;

            // 添加到页面
            document.body.appendChild(messageDiv);

            // 如果设置了显示时长，自动关闭
            if (dur > 0) {
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.style.animation = 'tuzi-message-fadeout 0.3s ease-out';
                        setTimeout(() => {
                            if (messageDiv.parentNode) {
                                messageDiv.remove();
                            }
                        }, 300);
                    }
                }, dur);
            }
        },
        message,
        durationMs,
        position
    );
};


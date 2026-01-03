import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.waitForButtonClick',
    displayName: '等待按钮点击',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${browserPage}中创建按钮${buttonText}，等待用户点击',
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
        buttonText: {
            name: 'buttonText',
            value: '继续',
            type: 'string',
            addConfig: {
                label: '按钮名称',
                type: 'string',
                defaultValue: '继续',
                placeholder: '请输入按钮显示的文字',
                required: true
            }
        },
        buttonStyle: {
            name: 'buttonStyle',
            value: '',
            type: 'string',
            addConfig: {
                label: '按钮样式',
                type: 'textarea',
                placeholder: '可选，自定义CSS样式，例如: position: fixed; top: 50%; left: 50%; z-index: 9999; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;',
                isAdvanced: true
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    browserPage,
    buttonText = '继续',
    buttonStyle = ''
}: {
    browserPage: Page;
    buttonText?: string;
    buttonStyle?: string;
}) {
    // 在页面上创建按钮并等待点击
    await browserPage.evaluate(
        (text: string, style: string) => {
            return new Promise<void>((resolve) => {
                // 创建按钮（不使用容器，直接创建可拖动的按钮）
                const button = document.createElement('button');
                button.id = 'tuzi-wait-button';
                button.textContent = text;
                
                // 默认样式：右下角位置，可拖动
                const defaultStyle = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 24px;
                    font-size: 16px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: move;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    transition: background 0.3s;
                    z-index: 999999;
                    user-select: none;
                `;
                
                button.style.cssText = style || defaultStyle;

                // 拖动功能
                let isDragging = false;
                let hasMoved = false;
                let currentX = 0;
                let currentY = 0;
                let initialX = 0;
                let initialY = 0;
                let startX = 0;
                let startY = 0;

                button.addEventListener('mousedown', (e: MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    hasMoved = false;
                    isDragging = false;
                    startX = e.clientX;
                    startY = e.clientY;
                    
                    // 获取按钮当前位置
                    const rect = button.getBoundingClientRect();
                    initialX = e.clientX - rect.left;
                    initialY = e.clientY - rect.top;

                    const mouseMoveHandler = (moveEvent: MouseEvent) => {
                        const deltaX = Math.abs(moveEvent.clientX - startX);
                        const deltaY = Math.abs(moveEvent.clientY - startY);
                        
                        // 如果移动距离超过5px，认为是拖动
                        if (deltaX > 5 || deltaY > 5) {
                            hasMoved = true;
                            isDragging = true;
                            button.style.cursor = 'grabbing';
                            
                            currentX = moveEvent.clientX - initialX;
                            currentY = moveEvent.clientY - initialY;
                            
                            // 限制按钮在可视区域内
                            const maxX = window.innerWidth - button.offsetWidth;
                            const maxY = window.innerHeight - button.offsetHeight;
                            
                            currentX = Math.max(0, Math.min(currentX, maxX));
                            currentY = Math.max(0, Math.min(currentY, maxY));
                            
                            button.style.left = currentX + 'px';
                            button.style.top = currentY + 'px';
                            button.style.right = 'auto';
                            button.style.bottom = 'auto';
                        }
                    };

                    const mouseUpHandler = (upEvent: MouseEvent) => {
                        document.removeEventListener('mousemove', mouseMoveHandler);
                        document.removeEventListener('mouseup', mouseUpHandler);
                        
                        if (isDragging) {
                            isDragging = false;
                            button.style.cursor = 'move';
                        }
                        
                        // 如果移动过，阻止点击事件
                        if (hasMoved) {
                            upEvent.preventDefault();
                            upEvent.stopPropagation();
                        }
                    };

                    document.addEventListener('mousemove', mouseMoveHandler);
                    document.addEventListener('mouseup', mouseUpHandler);
                });

                // 按钮悬停效果
                button.addEventListener('mouseenter', () => {
                    if (!isDragging) {
                        button.style.background = '#0056b3';
                    }
                });
                button.addEventListener('mouseleave', () => {
                    if (!isDragging) {
                        button.style.background = '#007bff';
                    }
                });

                // 点击事件（只有在没有拖动的情况下才触发）
                button.addEventListener('click', (e: MouseEvent) => {
                    // 如果移动过，不触发点击
                    if (hasMoved || isDragging) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }
                    
                    e.preventDefault();
                    e.stopPropagation();
                    // 移除按钮
                    button.remove();
                    resolve();
                });

                // 将按钮添加到页面
                document.body.appendChild(button);
            });
        },
        buttonText,
        buttonStyle
    );
};


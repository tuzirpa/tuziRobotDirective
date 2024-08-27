import { Page } from 'puppeteer-core';
import { DirectiveTree } from '../../types';
export const config: DirectiveTree = {
    name: 'web.getPageContent',
    icon: 'icon-web-create',
    displayName: '获取标签页内容',
    comment: '在页面${page}中获取当前标签页的${webContent}内容，保存到变量${content}中',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },

        webContent: {
            name: 'webContent',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '获取内容',
                type: 'select',
                required: true,
                options: [
                    { label: '获取HTML', value: 'html' },
                    { label: '获取文本', value: 'text' }
                ],
                defaultValue: 'html'
            }
        }
    },

    outputs: {
        content: {
            name: 'content',
            display: '页面内容',
            type: 'string',
            addConfig: {
                label: '页面内容',
                type: 'variable',
                defaultValue: ''
            }
        }
    }
};

export const impl = async function ({ page, webContent }: { page: Page; webContent: string }) {
    const content = await page.content();
    if (webContent === 'html') {
        return { content };
    } else if (webContent === 'text') {
        return { content: content.replace(/<[^>]+>/g, '') };
    }
    return { content: '' };
};

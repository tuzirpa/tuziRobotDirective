import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.pages.waitForLoad',
    sort: 7,
    displayName: '等待页面加载完成',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '等待标签页${page}加载完成，等待条件为${waitUntil}',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                required: true,
                label: '标签页对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true,
                tip: '要等待加载完成的标签页'
            }
        },
        waitUntil: {
            name: 'waitUntil',
            value: 'load',
            display: '等待页面加载完成',
            type: 'string',
            addConfig: {
                label: '等待条件',
                type: 'select',
                options: [
                    { label: '等待页面加载完成', value: 'load' },
                    { label: '等待DOM加载完成', value: 'domcontentloaded' },
                    { label: '等待网络请求完成', value: 'networkidle0' },
                    { label: '等待大部分网络请求完成', value: 'networkidle2' }
                ],
                defaultValue: 'load',
                tip: '选择页面加载完成的判断条件'
            }
        },
        timeout: {
            name: 'timeout',
            value: '30',
            type: 'number',
            addConfig: {
                label: '超时时间(秒)',
                type: 'string',
                defaultValue: '30',
                tip: '等待超时时间'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({ 
    page,
    waitUntil,
    timeout
}: { 
    page: Page;
    waitUntil: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
    timeout: number;
}) {
    try {
        if (!page) {
            throw new Error('标签页对象不能为空');
        }

        await page.waitForNavigation({ 
            waitUntil,
            timeout: timeout * 1000 
        });

    } catch (error) {
        console.error('等待页面加载完成失败:', error);
        throw error;
    }
}; 
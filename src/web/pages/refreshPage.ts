import { Page, Frame } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.pages.refreshPage',
    sort: 6,
    displayName: '刷新页面',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '刷新标签页${page}',
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
                tip: '要刷新的标签页对象'
            }
        },
        waitUntil: {
            name: 'waitUntil',
            value: 'load',
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
                tip: '选择刷新后的等待条件'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({ 
    page,
    waitUntil
}: { 
    page: Page;
    waitUntil: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
}) {
    try {
        if (!page) {
            throw new Error('标签页对象不能为空');
        }

        await page.reload({ waitUntil });

    } catch (error) {
        console.error('刷新页面失败:', error);
        throw error;
    }
}; 
import puppeteer, { Browser, Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.tabOperate.createNewTabAndCloseOthers',
    displayName: '新建标签并关闭其他标签',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在浏览器${browser}中新建标签页并关闭其他所有标签页，保存至：${page}',
    inputs: {
        browser: {
            name: 'browser',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '浏览器对象',
                type: 'variable',
                filtersType: 'web.browser',
                autoComplete: true
            }
        },
        forceClose: {
            name: 'forceClose',
            value: '',
            type: 'boolean',
            addConfig: {
                label: '是否强制关闭',
                type: 'boolean',
                defaultValue: false,
                tip: '是否强制关闭标签页，如果为true则跳过beforeunload事件监听，强制关闭可能被阻止关闭的标签页'
            }
        }
    },
    outputs: {
        page: {
            name: '',
            display: '标签页对象',
            type: 'web.page',
            addConfig: {
                label: '标签页对象',
                type: 'variable',
                defaultValue: 'page'
            }
        }
    }
};

export const impl = async function ({ 
    browser, 
    forceClose 
}: { 
    browser: Browser; 
    forceClose: boolean;
}) {
    // 创建新标签页
    const newPage = await browser.newPage();
    console.debug('新标签页已创建');

    // 获取所有标签页
    const pages = await browser.pages();
    
    // 关闭除新标签页外的所有其他标签页
    const closePromises: Promise<void>[] = [];
    
    for (const page of pages) {
        // 跳过新创建的标签页
        if (page === newPage) {
            continue;
        }

        // 检查页面是否已关闭
        if (page.isClosed()) {
            console.debug('页面已关闭，跳过');
            continue;
        }

        // 根据是否强制关闭选择不同的关闭方式
        if (forceClose) {
            // 强制关闭：使用 runBeforeUnload: false 跳过 beforeunload 事件
            closePromises.push(
                (async () => {
                    try {
                        // 使用 runBeforeUnload: false 强制关闭，跳过 beforeunload 事件监听
                        await page.close({ runBeforeUnload: false });
                        console.debug('强制关闭标签页成功');
                    } catch (error) {
                        console.error('强制关闭标签页失败:', error);
                        // 如果强制关闭失败，尝试普通关闭
                        try {
                            await page.close();
                            console.debug('普通关闭标签页成功');
                        } catch (closeError) {
                            console.error('关闭标签页失败:', closeError);
                        }
                    }
                })()
            );
        } else {
            // 普通关闭
            closePromises.push(
                page.close().catch(error => {
                    console.error('关闭标签页失败:', error);
                })
            );
        }
    }

    // 等待所有关闭操作完成
    if (closePromises.length > 0) {
        await Promise.all(closePromises);
    }

    console.debug(`已关闭 ${pages.length - 1} 个标签页，保留新创建的标签页`);
    
    return { page: newPage };
};


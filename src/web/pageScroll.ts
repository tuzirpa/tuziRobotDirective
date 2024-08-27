import puppeteer, { Browser, Page } from 'puppeteer-core';
import { DirectiveTree } from '../types';

export const config: DirectiveTree = {
    name: 'web.pageScroll',
    displayName: '页面滚动',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment:
        '在标签${page}中,滚动到页面底部，每次滚动${scrollDistance}距离，间隔${scrollDelay}毫秒',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '标签对象',
                type: 'variable',
                filtersType: 'web.page',
                autoComplete: true
            }
        },

        scrollDistance: {
            name: 'scrollDistance',
            value: '100',
            display: '每次滚动距离',
            type: 'number',
            addConfig: {
                label: '每次滚动距离',
                type: 'variable',
                autoComplete: true,
                required: true,
                defaultValue: '100'
            }
        },
        scrollDelay: {
            name: 'scrollDelay',
            value: '600',
            display: '滚动延迟',
            type: 'number',
            addConfig: {
                label: '滚动延迟',
                type: 'variable',
                autoComplete: true,
                defaultValue: '600'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({
    page,
    scrollDistance,
    scrollDelay
}: {
    page: Page;
    scrollDistance: number;
    scrollDelay: number;
}) {
    // 获取页面的总高度
    let pageHeight = await page.evaluate(() => document.body.scrollHeight);

    let currentPosition = 0;
    while (currentPosition < pageHeight) {
        // 滚动页面
        await page.evaluate((scrollDistance) => {
            window.scrollBy({ left: 0, top: scrollDistance, behavior: 'smooth' });
        }, scrollDistance);

        currentPosition += scrollDistance;
        pageHeight = await page.evaluate(() => document.body.scrollHeight);

        console.log(
            '页面滚动中...',
            `currentPosition: ${currentPosition}, pageHeight: ${pageHeight}`
        );

        // 等待一段时间再进行下一次滚动
        await new Promise((resolve) => setTimeout(resolve, scrollDelay));
    }
};

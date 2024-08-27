import { ElementHandle, Page } from 'puppeteer-core';
import { DirectiveTree } from '../types';

const config: DirectiveTree = {
    name: 'web.fileSelect',
    sort: 2,
    displayName: '选择文件',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '在页面${page}选择文件',
    inputs: {
        page: {
            name: 'page',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '浏览器对象',
                required: true,
                type: 'variable',
                filtersType: 'web.browser',
                autoComplete: true
            }
        }
    },
    outputs: {
        filePath: {
            name: '',
            display: '文件路径',
            type: 'string',
            addConfig: {
                label: '文件路径',
                type: 'variable',
                defaultValue: 'filePath'
            }
        }
    }
};

const impl = async function ({ page }: { page: Page }) {
    const str = await page.evaluate(() => {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.click();
            input.onchange = (e: any) => {
                console.log(e.target.files[0]);
                resolve(input.value);
            };
        });
    });

    console.log('选择的文件路径：', str);

    return { filePath: str };
};

export { config, impl };

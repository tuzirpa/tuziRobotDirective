import { ElementHandle, Page } from 'puppeteer-core';
import { DirectiveTree } from '../types';
export const config: DirectiveTree = {
    name: 'web.updateFile',
    icon: 'icon-web-create',
    displayName: '上传文件',
    comment: '将页面${browserPage} 中选择元素${selector}，并上传文件${filePath}。',
    inputs: {
        browserPage: {
            name: 'browserPage',
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
        selector: {
            name: 'selector',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: 'css选择器',
                placeholder: '请填写选择上传元素的css选择器',
                type: 'string',
                defaultValue: '',
                required: true,
                tip: '上传元素的css选择器'
            }
        },
        timeout: {
            name: 'timeout',
            value: '',
            type: 'number',
            addConfig: {
                isAdvanced: true,
                label: '超时时间',
                type: 'string',
                defaultValue: 30
            }
        },
        filePath: {
            name: 'filePath',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '文件路径',
                placeholder: '选择要上传文件路径',
                type: 'filePath',
                defaultValue: '',
                required: true,
                openDirectory: false,
                tip: '选择要上传文件路径'
            }
        }
    },

    outputs: {}
};

export const impl = async function ({
    browserPage,
    selector,
    filePath,
    timeout
}: {
    browserPage: Page;
    selector: string;
    filePath: string;
    timeout: number;
}) {
    // 触发文件上传操作，这里假设是点击一个按钮来触发
    setTimeout(() => {
        browserPage.click(selector); // 替换为实际触发上传的按钮选择器
    }, 0);

    // 等待文件选择对话框出现
    const fileChooser = await browserPage.waitForFileChooser();

    // 选择本地文件，这里假设文件名为 example.txt，位于当前工作目录下
    await fileChooser.accept([filePath]); // 替换为实际文件的路径
    /* const fileElement = (await browserPage.waitForSelector(selector, {
		timeout: timeout * 1000,
	})) as ElementHandle<HTMLInputElement>;

	if (fileElement) {
		const tagName = await fileElement.evaluate(
			(element) => element.tagName
		);
		const type = await fileElement.evaluate((element) =>
			element.getAttribute("type")
		);

		if (tagName != "INPUT" || type != "file") {
			console.error("元素", selector, "不是文件上传元素！");
			return;
		}

		const accept = await fileElement.evaluate((element) =>
			element.getAttribute("accept")
		);

		if (accept) {
			console.log("上传元素接收的是", accept, "上传文件是", filePath);
		}

		await fileElement.uploadFile(filePath);
	} else {
		console.error("找不到元素", selector);
	} */
};

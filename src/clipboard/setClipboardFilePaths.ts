import { DirectiveTree } from 'tuzirobot/types';
import hmc from 'hmc-win32';
export const config: DirectiveTree = {
    name: 'clipboard.setClipboardFilePaths',
    icon: 'icon-web-create',
    displayName: '写入文件列表到剪贴板',
    comment: '写入文件列表${}到剪贴板',
    inputs: {
        filePaths: {
            name: 'filePaths',
            value: '',
            display: '',
            type: 'array',
            addConfig: {
                required: true,
                placeholder: '要写入剪贴板的文本内容',
                label: '文本内容',
                type: 'textarea',
                defaultValue: ''
            }
        }
    },

    outputs: {}
};

export const impl = async function ({ filePaths }: { filePaths: string[] }) {
    hmc.setClipboardFilePaths(filePaths);
};

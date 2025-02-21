import { Page } from 'puppeteer-core';
import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'web.recorderScreencast.recorderStop',
    icon: 'icon-web-stop',
    displayName: '停止录屏',
    comment: '停止当前的录屏并保存文件。',
    inputs: {
        recorderObj: {
            name: 'recorderObj',
            value: '',
            display: '',
            type: 'variable',
            addConfig: {
                label: '录屏对象',
                type: 'variable',
                required: true,
                filtersType: 'web.recorderScreencast.pageScreenRecord',
                autoComplete: true,
                tip: '传入录屏对象以停止录屏'
            }
        }
    },
    outputs: {}
};

export const impl = async function ({recorderObj: {
    recorder,
    filePath
}}: {
    recorderObj:{
        recorder: any; // 根据实际录屏对象类型进行调整
        filePath: string;
    }
}) {
    // 停止录屏
    await recorder.stop();
   
    console.log('录屏已停止！文件路径：', filePath);
}; 
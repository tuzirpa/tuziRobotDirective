import { DirectiveTree } from 'tuzirobot/types';

export const config: DirectiveTree = {
    name: 'text.interceptText',
    icon: 'icon-web-create',
    displayName: '截取文本内容',
    comment: '在文本${text}中，从${startPos === "0" ? "第一个字符" : startPos === "-1" ? "指定位置" : "指定文本"}开始截取，截取长度为${length}，保存到变量${interceptedText}中。',
    inputs: {
        text: {
            name: 'text',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '原始文本',
                placeholder: '原始文本',
                type: 'textarea',
                required: true
            }
        },
        startPos: {
            name: 'startPos',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '起始位置',
                placeholder: '起始位置',
                type: 'select',
                required: true,
                options: [
                    { label: '从第一个字符开始截取', value: '0' },
                    { label: '从指定位置开始截取', value: '-1' },
                    { label: '从指定文本开始截取', value: '-2' }
                ],
                defaultValue: '0'
            }
        },
        startIndex: {
            name: 'startIndex',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '起始字符的位置',
                placeholder: '请输入起始字符的位置',
                type: 'variable',
                defaultValue: '0',
                filters: "this.inputs.startPos.value === '-1'"
            }
        },
        startText: {
            name: 'startText',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '起始文本',
                placeholder: '请输入起始文本的内容',
                type: 'variable',
                defaultValue: '',
                filters: "this.inputs.startPos.value === '-2'"
            }
        },

        interceptWay: {
            name: 'interceptWay',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '截取方式',
                type: 'select',
                options: [
                    {
                        label: '截取到最后一个字符',
                        value: 'end'
                    },
                    {
                        label: '截取到指定长度',
                        value: 'custom'
                    }
                ],
                defaultValue: 'end'
            }
        },

        interceptLength: {
            name: 'interceptLength',
            value: '',
            display: '',
            type: 'number',
            addConfig: {
                label: '截取长度',
                type: 'variable',
                filters: "this.inputs.interceptWay.value === 'custom'",
                defaultValue: '0'
            }
        }
    },

    outputs: {
        subText: {
            name: '',
            display: '保存结果至',
            type: 'string',
            addConfig: {
                label: '保存结果至',
                type: 'variable',
                defaultValue: 'subText'
            }
        }
    }
};

export const impl = async function ({
    text,
    startPos,
    startIndex,
    startText,
    interceptWay,
    interceptLength
}: {
    text: string;
    startPos: string;
    startIndex: number;
    startText: string;
    interceptWay: string;
    interceptLength: number;
}) {
    let start = startPos === '-1' ? startIndex : startPos === '-2' ? text.indexOf(startText) : 0;
    let end = interceptWay === 'end' ? text.length - 1 : start + interceptLength;
    let subText = text.substring(start, end + 1);
    return { subText };
};

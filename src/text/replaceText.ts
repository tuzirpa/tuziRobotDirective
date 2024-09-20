import { DirectiveTree } from 'tuzirobot/types';
import { typeToCode } from 'tuzirobot/commonUtil';

export const config: DirectiveTree = {
    name: 'text.replaceText',
    icon: 'icon-web-create',
    displayName: '文本替换',
    comment: '文本替换${text},根据${extractionWay}方式,将${regexpValue}替换为${replaceValue}',
    inputs: {
        text: {
            name: 'text',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '文本内容',
                placeholder: '文本内容',
                type: 'textarea',
                required: true
            }
        },
        extractionWay: {
            name: 'extractionWay',
            value: '',
            display: '替换方式',
            type: 'string',
            addConfig: {
                label: '替换方式',
                type: 'select',
                required: true,
                options: [
                    { label: '替换内容', value: 'content' },
                    { label: '替换数字', value: '\\-?\\d+(\\.\\d+)?' },
                    { label: '替换手机号码', value: '(1[3-9]\\d{9})' },
                    {
                        label: '替换Email地址',
                        value: '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,})'
                    },
                    {
                        label: '替换身份证号码',
                        value: '([1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx])'
                    },
                    {
                        label: '自定义正则替换',
                        value: 'customRegex'
                    }
                ],
                defaultValue: 'content'
            }
        },
        regexpValue: {
            name: 'regexpValue',
            value: '',
            type: 'string',
            addConfig: {
                label: '被替换内容',
                placeholder: '请输入被替换的内容',
                type: 'string',
                defaultValue: '',
                filters:
                    'this.inputs.extractionWay.value === "customRegex" || this.inputs.extractionWay.value === "content"'
            }
        },
        replaceValue: {
            name: 'replaceValue',
            value: '',
            type: 'string',
            addConfig: {
                label: '替换为',
                placeholder: '请输入替换的内容',
                type: 'string',
                defaultValue: ''
            }
        }
    },

    outputs: {
        replaceResult: {
            name: '',
            display: '替换后的内容',
            type: 'string',
            addConfig: {
                label: '替换后的内容',
                type: 'variable',
                defaultValue: 'replaceResult'
            }
        }
    },

    async toCode(directive, _block) {
        const { replaceResult } = directive.outputs;
        const { text, extractionWay, regexpValue, replaceValue } = directive.inputs;
        const code = `var ${
            replaceResult.name
        } = await robotUtil.system.text.replaceText({ text: ${typeToCode(
            text
        )},extractionWay: "${extractionWay.value.replace(
            /\\/g,
            '\\\\'
        )}",regexpValue: "${regexpValue.value.replace(/\\/g, '\\\\')}",replaceValue: "${
            replaceValue.value
        }"},${_block});`;
        return code;
    }
};

export const impl = async function ({
    text,
    extractionWay,
    regexpValue,
    replaceValue
}: {
    text: string;
    extractionWay: string;
    regexpValue: string;
    replaceValue: string;
}) {
    if (text) {
        if (text.startsWith('/') && text.endsWith('/')) {
            text = text.slice(1, -1);
        }

        if (extractionWay != 'customRegex' && extractionWay != 'content') {
            regexpValue = extractionWay;
        }

        let replaceResult = text.replace(new RegExp(regexpValue, 'g'), replaceValue);
        return replaceResult;
    }

    return '';
};

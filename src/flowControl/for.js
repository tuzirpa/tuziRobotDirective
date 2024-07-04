const fs = require("fs");
const { typeToCode } = require("tuzirobot/commonUtil");

exports.config = {
	name: 'flowControl.for',
	key: 'flowControl.rangeIterator',
    displayName: 'For 循环',
    icon: 'icon-web-create',
    sort: 20,
    isControl: true,
    isControlEnd: false,
    comment: '从${startIndex}开始循环到${endIndex}结束，步长为${step}，循环位置保存至${index}',
    inputs: {
        startIndex: {
            name: '开始数值',
            value: '1',
            type: 'string',
            addConfig: {
                required: true,
                type: 'string',
                label: '开始数值',
                defaultValue: 1
            }
        },
        endIndex: {
            name: '结束数值',
            value: '',
            type: 'string',
            addConfig: {
                type: 'string',
                label: '结束数值',
                required: true
            }
        },
        step: {
            name: '增长值（步长）',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                type: 'string',
                label: '增长值（步长）',
                defaultValue: 1
            }
        }
    },
    outputs: {
        index: {
            name: 'loop_index',
            type: 'number',
            display: '数字',
            addConfig: {
                required: true,
                type: 'variable',
                label: '循环位置保存至'
            }
        }
    },
    async toCode(directive, block) {
        const { startIndex, endIndex, step } = directive.inputs;
        const { index } = directive.outputs;
        return `for (let ${index.name} of await robotUtil.system.flowControl.rangeIterator(Number(${typeToCode(startIndex)}), Number(${typeToCode(endIndex)}), Number(${typeToCode(step)}),${block})) {`;
    }
};

exports.impl = async function (start, end, step) {
	const result = [];
	for (let i = start; i <= end; i += step) {
		result.push(i);
	}
	console.log(`生成循环数成功: [${start},${end}],步长${step}，结果：${result}`);
	return result;
};

const fs = require('fs');
const { typeToCode } = require('tuzirobot/commonUtil');

exports.config = {
    name: 'flowControl.while',
    appendDirectiveNames: ['flowControl.for.end'],
    key: 'flowControl.whileTest',
    displayName: 'while 循环',
    icon: 'icon-web-create',
    sort: 30,
    isControl: true,
    isLoop: true,
    isControlEnd: false,
    comment: '判断${operand1} ${operator} ${operand2} 是否成立，如果成立进入循环,否则结束循环',
    inputs: {
        operand1: {
            name: '条件操作数1',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                type: 'string',
                label: '对象1'
            }
        },
        operator: {
            name: '关系',
            value: '==',
            display: '等于',
            type: 'string',
            addConfig: {
                type: 'select',
                label: '关系',
                required: true,
                options: [
                    { value: '==', label: '等于' },
                    { value: '!=', label: '不等于' },
                    { value: '>', label: '大于' },
                    { value: '<', label: '小于' },
                    { value: '>=', label: '大于等于' },
                    { value: '<=', label: '小于等于' },
                    { value: 'in', label: '包含' },
                    { value: 'notin', label: '不包含' },
                    { value: 'isTrue', label: '等于true' },
                    { value: 'noTrue', label: '不等true' },
                    { value: 'isNull', label: '是空值' },
                    { value: 'noNull', label: '不是空值' }
                ],
                defaultValue: '=='
            }
        },
        operand2: {
            name: '条件操作数2',
            value: '',
            type: 'string',
            addConfig: {
                required: true,
                type: 'string',
                label: '对象2',
                filters: `!(this.inputs.operator.value === 'isTrue' || this.inputs.operator.value === 'noTrue' || this.inputs.operator.value === 'isNull' || this.inputs.operator.value === 'noNull')`
            }
        }
    },
    outputs: {},
    async toCode(directive, block) {
        const { operand1, operator, operand2 } = directive.inputs;
        return `while (await robotUtil.system.flowControl.whileTest(${typeToCode(operand1)},'${
            operator.value
        }',${typeToCode(operand2)},${block})) {`;
    }
};

exports.impl = async function (operand1, operator, operand2) {
    /**
	 * 
		{ value: 'in', label: '包含' },
		{ value: 'notin', label: '不包含' },
		{ value: 'isTrue', label: '等于true' },
		{ value: 'noTrue', label: '不等true' },
		{ value: 'isNull', label: '是空值' },
		{ value: 'noNull', label: '不是空值' }
	 */
    if (operator === 'isNull') {
        return operand1 === null;
    } else if (operator === 'noNull') {
        return operand1 !== null;
    } else if (operator === 'isTrue') {
        return operand1 === true;
    } else if (operator === 'noTrue') {
        return operand1 !== true;
    } else if (operator === 'in') {
        return operand1.includes(operand2);
    } else if (operator === 'notin') {
        return !operand1.includes(operand2);
    }
    const result = eval(`${operand1}${operator}${operand2}`);
    return !!result;
};

const fs = require("fs");

exports.config = {
	name: 'dataProcessing.setVariable',
    displayName: '设置变量',
    isControl: false,
    isControlEnd: false,
    comment: '设置${varType}变量 ${varName} 值为 ${varValue}',
    inputs: {
        varType: {
            name: '变量类型',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '变量类型',
                type: 'select',
                required: true,
                defaultValue: 'string',
                tip: '选择变量类型',
                options: [
                    {
                        label: '字符串',
                        value: 'string'
                    },
                    {
                        label: '数字',
                        value: 'number'
                    },
                    {
                        label: '任意对象',
                        value: 'any'
                    }
                ]
            }
        },
        varValue: {
            name: '变量值',
            value: '',
            type: 'string',
            addConfig: {
                label: '变量值',
                type: 'string',
                defaultValue: ''
            }
        }
    },
    outputs: {
        varName: {
            name: '',
            type: 'string',
            display: '字符串',
            addConfig: {
                label: '变量名',
                type: 'variable',
                defaultValue: 'variable'
            }
        }
    }
};

exports.impl = async function ({ varType, varValue }) {
	let varName = varValue;
	if (varType === 'number') {
		varName = Number(varValue);
	}
	return {varName}
};

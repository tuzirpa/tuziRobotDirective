const fs = require("fs");

exports.config = {
	name: 'dataProcessing.logPrint',
    displayName: '输出日志',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '输出日志 ${content}',
    inputs: {
        content: {
            name: '要输出的内容',
            value: '',
            type: 'string',
            addConfig: {
                label: '输出内容',
                type: 'textarea',
                defaultValue: 'test',
                tip: '输出内容'
            }
        }
    },
    outputs: {}
};

exports.impl = async function ({ content }) {
	console.log(content);
};

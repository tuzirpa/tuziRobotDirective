const fs = require("fs");

exports.config = {
    name: 'flowControl.exit',
    displayName: '终止流程',
    icon: 'icon-web-create',
    sort: 40,
    isControl: false,
    isControlEnd: false,
    comment: '停止流程后续的所有操作并结束',
    inputs: {},
    outputs: {},
    async toCode(_directive, block) {
        return `await robotUtil.system.flowControl.exit(${block})`;
    }
};

exports.impl = async function () {
	console.log('终止流程');
	process.exit();
};

const fs = require("fs");

exports.config = {
	name: 'flowControl.break',
    displayName: '退出循环',
    icon: 'icon-web-create',
    isControl: false,
    sort: 31,
    isControlEnd: false,
    comment: '仅在循环中有效，用于退出循环',
    inputs: {},
    outputs: {},
    async toCode(_directive, _block) {
        return `break;`;
    }
};

exports.impl = async function () {
	
};

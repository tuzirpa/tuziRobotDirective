const fs = require("fs");

exports.config = {
	name: 'flowControl.for.end',
    displayName: '循环结束标记',
    icon: 'icon-web-create',
    isControl: false,
    sort: 21,
    isControlEnd: true,
    comment: '表示循环区域的尾部',
    inputs: {},
    outputs: {},
    async toCode(_directive, _block) {
        return `}`;
    }
};

exports.impl = async function () {
	
};

const fs = require("fs");

exports.config = {
	name: 'flowControl.else',
    displayName: 'Else',
    icon: 'icon-web-create',
    sort: 11,
    isControl: true,
    isElse: true,
    isControlEnd: false,
    comment: '否则执行以下操作',
    inputs: {},
    outputs: {},
    async toCode(_directive, _block) {
        return `} else {`;
    }
};

exports.impl = async function () {
};

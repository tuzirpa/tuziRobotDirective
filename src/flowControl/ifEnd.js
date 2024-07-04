const fs = require("fs");

exports.config = {
	name: 'flowControl.if.end',
    displayName: 'END IF',
    icon: 'icon-web-create',
    isControl: false,
    sort: 12,
    isControlEnd: true,
    comment: '结束条件',
    inputs: {},
    outputs: {},
    async toCode(_directive, _block) {
        return `}`;
    }
};

exports.impl = async function () {
	
};

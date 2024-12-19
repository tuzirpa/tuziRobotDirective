import { DirectiveTree } from 'tuzirobot/types';
import http from 'http';

export const config: DirectiveTree = {
    name: 'flowApp.flowDebugger',
    displayName: '断点动态运行指令',
    icon: 'icon-web-create',
    isControl: false,
    isControlEnd: false,
    comment: '调试模式下运行自动断点在此处，可以在当前断点环境下动态运行指令',
    inputs: {},
    outputs: {},
    async toCode(directive, block) {
        return `robotUtil.system.flowApp.flowDebugger(${block});while(true){await new Promise(resolve => setTimeout(resolve, 1000));if(globalThis.debuggerCodejs.length>0) eval(globalThis.debuggerCodejs.shift())}`;
    }
};

export const impl = async function () {
    console.log('flowApp.flowDebugger');
    //@ts-ignore
    globalThis.debuggerCodejs = [];
    http.createServer(function (req, res) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        const body: any[] = [];
        req.on('data', function (chunk) {
            body.push(chunk);
        });
        req.on('end', function () {
            const code = Buffer.concat(body).toString();
            //@ts-ignore
            globalThis.debuggerCodejs.push(code);
            res.end('ok');
        });
        res.end('flowApp.flowDebugger');
    }).listen(9015, '127.0.0.1');
    return;
};

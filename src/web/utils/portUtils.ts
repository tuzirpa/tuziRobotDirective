import { createServer, Socket } from 'node:net';

export function nextPort(port: number) {
    return port + 1;
}

export async function getAvailablePort(port: number = 3000): Promise<number> {
    if (port < 1 || port > 65535) {
        throw new Error('无可用的端口');
    }
    const _port = await checkPort(port);

    if (_port) {
        return _port;
    } else {
        console.debug(`端口 ${port} 被占用，尝试下一个...`);
        return getAvailablePort(nextPort(port));
    }
}

export function checkPort(port: number) {
    return new Promise<false | number>((resolve, _reject) => {
        // 启动个服务，使用指定端口
        const server = createServer(() => {});
        // 即使服务器正在监听，但它不会阻止程序退出
        server.unref();
        function onListen() {
            server.close();
            resolve(port);
        }
        server.once('listening', onListen);
        server.on('error', (_e) => {
            resolve(false);
        });
        server.listen(port, '127.0.0.1');
    });
}

import http from 'http';
import https from 'https';

/** 比特浏览器 Local API 通用响应（以官方文档为准） */
export type BitBrowserApiResult<T = unknown> = {
    success: boolean;
    data?: T;
    msg?: string;
    message?: string;
};

export type BitBrowserOpenData = {
    ws: string;
    http?: string;
    coreVersion?: string;
    driver?: string;
};

function postJson(baseUrl: string, apiPath: string, body: Record<string, unknown>): Promise<BitBrowserApiResult> {
    const root = baseUrl.replace(/\/$/, '');
    const url = new URL(apiPath.startsWith('/') ? root + apiPath : `${root}/${apiPath}`);
    const payload = JSON.stringify(body);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    const port = url.port || (isHttps ? '443' : '80');

    return new Promise((resolve, reject) => {
        const req = lib.request(
            {
                hostname: url.hostname,
                port,
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload, 'utf8')
                },
                agent: false
            },
            (res) => {
                const chunks: Buffer[] = [];
                res.on('data', (chunk: Buffer | string) => {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'utf8'));
                });
                res.on('end', () => {
                    const text = chunks.map((b) => b.toString('utf8')).join('');
                    try {
                        resolve(JSON.parse(text) as BitBrowserApiResult);
                    } catch {
                        reject(new Error(`比特浏览器 API 返回非 JSON（${res.statusCode}）: ${text.slice(0, 300)}`));
                    }
                });
            }
        );
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

/**
 * 打开浏览器窗口，返回 CDP WebSocket
 * @see https://doc.bitbrowser.cn/api-jie-kou-wen-dang/liu-lan-qi-jie-kou
 */
export async function bitBrowserOpen(
    baseUrl: string,
    options: {
        id: string;
        args?: string[];
        loadExtensions?: boolean;
        extractIp?: boolean;
    }
): Promise<BitBrowserApiResult<BitBrowserOpenData>> {
    const body: Record<string, unknown> = { id: options.id };
    if (options.args && options.args.length > 0) body.args = options.args;
    if (options.loadExtensions === true) body.loadExtensions = true;
    if (options.extractIp === true) body.extractIp = true;
    return postJson(baseUrl, '/browser/open', body) as Promise<BitBrowserApiResult<BitBrowserOpenData>>;
}

export async function bitBrowserHealth(baseUrl: string): Promise<BitBrowserApiResult> {
    return postJson(baseUrl, '/health', {});
}

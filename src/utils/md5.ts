import crypto from 'crypto';
/**
 * md5 签名
 * @param data 数据
 * @returns 返回md5 结果
 */
export function md5(data: string | Buffer){
    return crypto.createHash('md5').update(data).digest('hex').toUpperCase();
}
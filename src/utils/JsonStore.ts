import fs from 'fs';
import path from 'path';
import { getCurApp } from 'tuzirobot/commonUtil';

export class JsonStorage {
  filePath: string;
  currentData: any;
  constructor(filePath?: string) {
    filePath = filePath || './data.json';
    //filePath 是否绝对路径
    if (!path.isAbsolute(filePath)) {
      filePath = path.join(getCurApp().APP_DIR, 'runtime', filePath);
    }
 
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, '{}', 'utf8');
    }
    this.filePath = filePath;
    this.load();
  }

  // 读取 JSON 文件内容
  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        // 处理 JSON 解析错误
        throw new Error('JSON 解析错误');
      }
      if (err.code === 'ENOENT') {
        // 文件不存在时返回空对象
        return {};
      }
      throw err;
    }
  }

  // 写入 JSON 数据到文件
  write(data: any) {
    const jsonData = JSON.stringify(data, null, 2);
    if (fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, jsonData, 'utf8');
    } else {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, jsonData, 'utf8');
    }
  }

  // 更新 JSON 数据
  set(key: string, value: any) {
    this.currentData[key] = value;
    this.write(this.currentData);
    return this.currentData[key];
  }

  get(key: string) {
    return this.currentData[key];
  }

  delete(key: string) {
    const result = this.currentData[key];
    delete this.currentData[key];
    this.write(this.currentData);
    return result;
  }

  clear() {
    this.currentData = {};
    this.write(this.currentData);
  }

  save() {
    this.write(this.currentData);
  }

  load() {
    this.currentData = this.read();
  }

}
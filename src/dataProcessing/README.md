# 数据操作模块

本模块提供了各种数据处理和操作功能，包括变量操作、数据转换、日志记录、MD5加密等。

## 指令列表

### MD5加密 (dataProcessing.md5)

对输入数据或文件进行MD5加密，生成32位十六进制哈希值。

#### 功能特性

- **双重输入支持**: 支持文本输入和文件输入两种方式
- **智能验证**: 自动验证输入参数的有效性
- **错误处理**: 完善的错误处理和提示信息
- **高性能**: 基于Node.js原生crypto模块实现

#### 输入参数

- **inputData** (可选): 文本输入数据
  - 类型: 字符串
  - 说明: 需要加密的文本内容
  - 提示: 与文件输入二选一

- **inputFile** (可选): 文件输入路径
  - 类型: 文件路径
  - 说明: 需要加密的文件路径
  - 提示: 与文本输入二选一，支持任意文件类型（文本、图片、视频、可执行文件等）

#### 输出变量

- **md5Result**: MD5加密结果
  - 类型: 字符串
  - 说明: 32位大写十六进制MD5哈希值

#### 使用示例

##### 1. 文本加密

```typescript
// 加密文本字符串
const result = await dataProcessing.md5({ 
    inputData: 'hello world' 
});
console.log('MD5结果:', result.md5Result);
// 输出: 5EB63BBBE01EEED093CB22BB8F5ACDC3
```

##### 2. 文件加密

```typescript
// 加密文件内容
const result = await dataProcessing.md5({ 
    inputFile: './document.txt' 
});
console.log('文件MD5:', result.md5Result);
```

##### 3. 在流程中使用

```typescript
// 设置变量
const password = 'myPassword123';

// 生成密码哈希
const hashResult = await dataProcessing.md5({ 
    inputData: password 
});

// 保存哈希结果
const passwordHash = hashResult.md5Result;
console.log('密码哈希:', passwordHash);
```

#### 注意事项

1. **输入参数**: 必须提供`inputData`或`inputFile`其中之一，不能同时提供
2. **文件路径**: 文件路径必须是有效的，文件必须存在且可读
3. **编码处理**: 文件内容按二进制读取，支持任意文件类型（文本、图片、视频、可执行文件等）
4. **错误处理**: 所有错误都会抛出异常，包含详细的错误信息

#### 错误情况

- **无输入**: 当既没有提供文本也没有提供文件时
- **双重输入**: 当同时提供文本和文件输入时
- **文件不存在**: 当指定的文件路径不存在时
- **文件读取失败**: 当文件存在但无法读取时

#### 应用场景

- **密码加密**: 生成用户密码的MD5哈希值
- **文件校验**: 计算任意类型文件的MD5值用于完整性验证
- **数据签名**: 为数据生成唯一的数字指纹
- **安全存储**: 将敏感信息转换为不可逆的哈希值

#### 文件类型支持

MD5指令支持所有类型的文件，包括但不限于：

- **文本文件**: TXT、JSON、XML、HTML、CSS、JS、TS、PY、JAVA等
- **图片文件**: JPG、PNG、GIF、BMP、WebP、TIFF、SVG等
- **视频文件**: MP4、AVI、MOV、WMV、FLV、MKV等
- **音频文件**: MP3、WAV、FLAC、AAC、OGG等
- **文档文件**: PDF、DOC、DOCX、XLS、XLSX、PPT、PPTX等
- **压缩文件**: ZIP、RAR、7Z、TAR、GZ等
- **可执行文件**: EXE、MSI、APP、DEB、RPM等
- **其他二进制文件**: 数据库文件、配置文件、日志文件等

#### 技术实现

- 基于Node.js内置的`crypto`模块
- 使用`createHash('md5')`算法
- 输出为大写十六进制格式
- 支持任意长度的输入数据
- 文件内容按二进制读取，确保所有文件类型都能正确处理

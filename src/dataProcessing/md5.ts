import { DirectiveTree } from 'tuzirobot/types';
import { md5 } from '../utils/md5';
import { existsSync, readFileSync } from 'fs';

export const config: DirectiveTree = {
    name: 'dataProcessing.md5',
    displayName: 'MD5加密',
    isControl: false,
    isControlEnd: false,
    comment: '对${inputData}或${inputFile}进行MD5加密，结果保存到${md5Result}',
    inputs: {
        inputData: {
            name: '输入数据',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '输入数据',
                type: 'textarea',
                required: false,
                defaultValue: '',
                placeholder: '请输入需要加密的数据',
                tip: '支持文本、数字等任意字符串数据，与文件输入二选一'
            }
        },
        inputFile: {
            name: '输入文件',
            value: '',
            display: '',
            type: 'string',
            addConfig: {
                label: '输入文件',
                type: 'filePath',
                required: false,
                defaultValue: '',
                placeholder: '请选择需要加密的文件',
                tip: '支持任意文件类型，与数据输入二选一'
            }
        }
    },
    outputs: {
        md5Result: {
            name: '',
            type: 'string',
            display: 'MD5结果',
            addConfig: {
                label: 'MD5加密结果',
                type: 'variable',
                defaultValue: 'md5Result'
            }
        }
    }
};

export const impl = async function ({ inputData, inputFile }: { inputData?: string; inputFile?: string }) {
    try {
        // 检查输入参数
        if (!inputData && !inputFile) {
            throw new Error('必须提供输入数据或输入文件');
        }
        
        if (inputData && inputFile) {
            throw new Error('不能同时提供输入数据和输入文件，请选择其中一种');
        }

        let dataToHash: string | Buffer;

        if (inputData) {
            // 处理文本输入
            if (inputData.trim() === '') {
                throw new Error('输入数据不能为空');
            }
            dataToHash = inputData;
        } else if (inputFile) {
            // 处理文件输入
            if (!existsSync(inputFile)) {
                throw new Error(`文件不存在: ${inputFile}`);
            }
            
            try {
                // 读取文件内容 - 不指定编码，返回Buffer以支持所有文件类型
                dataToHash = readFileSync(inputFile);
            } catch (fileError) {
                const errorMessage = fileError instanceof Error ? fileError.message : String(fileError);
                throw new Error(`读取文件失败: ${errorMessage}`);
            }
        } else {
            throw new Error('未知的输入类型');
        }

        // 使用已有的md5函数进行加密
        const result = md5(dataToHash);
        
        return { md5Result: result };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`MD5加密失败: ${errorMessage}`);
    }
};

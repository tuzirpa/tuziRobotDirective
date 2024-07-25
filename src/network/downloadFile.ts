import { DirectiveTree } from "../types";
import axios from "axios";
import fs from "fs";
import path from "path";

const config: DirectiveTree = {
  name: "network.downloadFile",
  sort: 2,
  displayName: "下载文件",
  icon: "icon-web-create",
  isControl: false,
  isControlEnd: false,
  comment: "",
  inputs: {
    url: {
      name: "url",
      value: "",
      display: "",
      type: "string",
      addConfig: {
        label: "下载链接",
        required: true,
        type: "string",
        placeholder: "请输入URL",
      },
    },

    protocolHeader: {
      name: "protocolHeader",
      value: "",
      display: "",
      type: "textarea",
      addConfig: {
        label: "协议头",
        type: "textarea",
        placeholder: `设置请求协议头，例如：
        Accept: application/json, text/plain, */*
        Accept-Encoding: gzip, deflate, br, zstd
        Accept-Language: zh-CN,zh;q=0.9
        Cache-Control: no-cache
        `,
        defaultValue: "",
      },
    },

    downloadPath: {
      name: "downloadPath",
      value: "",
      type: "string",
      addConfig: {
        label: "下载目录",
        type: "filePath",
        defaultValue: "",
        openDirectory: true,
        tip: "下载保存路径",
        required: true,
      },
    },
  },
  outputs: {
    filePath: {
      name: "",
      display: "文件路径",
      type: "string",
      addConfig: {
        label: "文件路径",
        type: "variable",
        defaultValue: "filePath",
      },
    },
  },
};

const impl = async function ({
  url,
  downloadPath,
  protocolHeader,
}: {
  url: string;
  downloadPath: string;
  protocolHeader: string;
}) {
  const downloadFile = async () => {
    let headers;
    if (protocolHeader) {
      headers = protocolHeader.split("\n").reduce((acc, cur) => {
        const [key, value] = cur.split(": ");
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {} as Record<string, string>);
    }
    const response = await axios({
      headers: headers,
      method: "GET",
      url: url,
      responseType: "stream", // 指定响应数据的流类型
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.debug(`下载进度... ${percentCompleted}%`);
        } else {
          console.debug(`开始下载...`);
        }
      },
    });

    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
    }

    downloadPath = path.join(downloadPath, path.basename(url));
    // 使用管道流将响应数据直接写入文件
    response.data.pipe(fs.createWriteStream(downloadPath));

    return new Promise((resolve, reject) => {
      response.data.on("end", () => {
        resolve(downloadPath);
        console.log("文件下载成功! end", downloadPath);
      });

      response.data.on("error", (err: any) => {
        reject(err);
        console.error("文件下载失败:", err);
      });
    });
  };

  const filePath = await downloadFile();
  return { filePath };
};

export { config, impl };

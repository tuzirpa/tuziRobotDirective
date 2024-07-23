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
}: {
  url: string;
  downloadPath: string;
}) {
  const downloadFile = async () => {
    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream", // 指定响应数据的流类型
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          // @ts-ignore
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Downloading... ${percentCompleted}%`);
      },
    });

    downloadPath = path.join(downloadPath, path.basename(url));
    // 使用管道流将响应数据直接写入文件
    response.data.pipe(fs.createWriteStream(downloadPath));

    return new Promise((resolve, reject) => {
      response.data.on("end", () => {
        console.log("File downloaded successfully!", downloadPath);
        resolve(downloadPath);
      });

      response.data.on("error", (err: any) => {
        console.error("Error downloading file:", err);
        reject(err);
      });
    });
  };

  const filePath = await downloadFile();
  return { filePath };
};

export { config, impl };

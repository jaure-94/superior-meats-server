import fs from "fs/promises";
import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export async function uploadFiles(files = [], folder) {
    const uploadedFiles = [];

    for (const file of files) {
        try {
            const result = await imagekit.upload({
                file: await fs.readFile(file.path),
                fileName: file.originalname,
                folder,
                useUniqueFileName: true,
            });

            uploadedFiles.push(result.url);
        } finally {
            await fs.unlink(file.path).catch(() => undefined);
        }
    }

    return uploadedFiles;
}

export async function deleteFileByUrl(url) {
    if (!url) return false;

    const targetUrl = new URL(url);
    const targetPath = decodeURIComponent(targetUrl.pathname).replace(/\/$/, "");
    const fileName = targetPath.slice(targetPath.lastIndexOf("/") + 1);
    const folderPath = targetPath.slice(0, targetPath.lastIndexOf("/") + 1) || "/";
    const files = await imagekit.listFiles({ path: folderPath, name: fileName, limit: 1000 });
    const file = files.find((candidate) => {
        if (!candidate.url) return false;
        const candidatePath = decodeURIComponent(new URL(candidate.url).pathname).replace(/\/$/, "");
        return candidatePath === targetPath;
    });

    if (!file?.fileId) return false;

    await imagekit.deleteFile(file.fileId);
    return true;
}

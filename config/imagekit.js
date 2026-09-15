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

    const files = await imagekit.listFiles({
        searchQuery: `url = "${url.replace(/"/g, "\\\"")}"`,
        limit: 1,
    });

    if (!files[0]?.fileId) return false;

    await imagekit.deleteFile(files[0].fileId);
    return true;
}

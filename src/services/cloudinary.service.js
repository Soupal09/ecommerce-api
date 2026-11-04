
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

const uploadImage = (file, folder = "ecommerce/products") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve({
                    imageUrl: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        Readable.from(file.buffer).pipe(uploadStream);
    });
};

const deleteImage = async (publicId) => {
    return await cloudinary.uploader.destroy(publicId, {
        resource_type: "image"
    });
};

module.exports = {
    uploadImage,
    deleteImage
};

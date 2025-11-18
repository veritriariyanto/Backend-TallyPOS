import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

// Allowed image types
const allowedImageTypes = /jpeg|jpg|png|gif|webp/;

// File filter for images only
export const imageFileFilter = (req, file, callback) => {
  const extension = extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (
    !allowedImageTypes.test(extension) ||
    !allowedImageTypes.test(mimetype)
  ) {
    return callback(
      new BadRequestException(
        'Only image files are allowed (jpeg, jpg, png, gif, webp)',
      ),
      false,
    );
  }
  callback(null, true);
};

// Product image storage configuration
export const productImageStorage = diskStorage({
  destination: (req, file, callback) => {
    const uploadPath = './public/uploads/products';
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = extname(file.originalname);
    callback(null, `product-${uniqueSuffix}${extension}`);
  },
});

// User avatar storage configuration
export const userAvatarStorage = diskStorage({
  destination: (req, file, callback) => {
    const uploadPath = './public/uploads/users';
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = extname(file.originalname);
    callback(null, `user-${uniqueSuffix}${extension}`);
  },
});

// File size limits (5MB)
export const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

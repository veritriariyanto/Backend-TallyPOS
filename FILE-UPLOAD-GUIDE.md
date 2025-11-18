# TallyPOS Backend - File Upload Implementation

## ✅ Implementation Complete

### 1. Dependencies Installed
```bash
npm install --save multer @types/multer
```

### 2. Folder Structure Created
```
public/
  uploads/
    products/    # Product images
    users/       # User avatars
```

### 3. Files Created/Modified

#### `src/common/utils/file-upload.util.ts`
- Storage configuration for products and users
- Image file filter (jpeg, jpg, png, gif, webp)
- Max file size: 5MB
- Auto-generate unique filenames

#### `src/main.ts`
- Enable static file serving
- Files accessible at `/uploads/products/` and `/uploads/users/`

#### `src/products/products.controller.ts`
Added endpoints:
- `POST /products/upload-image` - Upload image only
- `POST /products/:id/upload-image` - Upload and update product

#### `src/users/users.controller.ts`
Added endpoints:
- `POST /users/upload-avatar` - Upload avatar only
- `POST /users/:id/upload-avatar` - Upload and update user avatar (admin)
- `POST /users/me/upload-avatar` - Upload current user's avatar

#### `src/users/entities/user.entity.ts`
- Added `avatarUrl` field

#### `src/database/migrations/1700000000007-AddAvatarUrlToUsers.ts`
- Migration to add avatar_url column

---

## 📝 API Documentation

### Product Image Upload

#### 1. Upload Image Only
```http
POST /products/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (form-data):
- image: [file]
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "filename": "product-1234567890-123456789.jpg",
  "url": "/uploads/products/product-1234567890-123456789.jpg",
  "path": "./public/uploads/products/product-1234567890-123456789.jpg"
}
```

#### 2. Upload and Update Product
```http
POST /products/:id/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (form-data):
- image: [file]
```

**Response:**
```json
{
  "message": "Image uploaded and product updated successfully",
  "filename": "product-1234567890-123456789.jpg",
  "url": "/uploads/products/product-1234567890-123456789.jpg",
  "product": {
    "id": "uuid",
    "name": "Product Name",
    "imageUrl": "/uploads/products/product-1234567890-123456789.jpg",
    ...
  }
}
```

---

### User Avatar Upload

#### 1. Upload Avatar Only
```http
POST /users/upload-avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (form-data):
- avatar: [file]
```

#### 2. Upload and Update User Avatar (Admin)
```http
POST /users/:id/upload-avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (form-data):
- avatar: [file]
```

#### 3. Upload My Avatar (Current User)
```http
POST /users/me/upload-avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (form-data):
- avatar: [file]
```

**Response:**
```json
{
  "message": "Avatar uploaded successfully",
  "filename": "user-1234567890-123456789.jpg",
  "url": "/uploads/users/user-1234567890-123456789.jpg",
  "user": {
    "id": "uuid",
    "username": "admin",
    "avatarUrl": "/uploads/users/user-1234567890-123456789.jpg",
    ...
  }
}
```

---

## 🔧 Usage in Frontend

### React/Vue Example

#### 1. Product Image Upload
```javascript
const uploadProductImage = async (file, productId) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`http://localhost:3000/products/${productId}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    console.log('Image URL:', data.url);
    // Use data.url to display image: http://localhost:3000/uploads/products/...
    
    return data;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

#### 2. User Avatar Upload
```javascript
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch('http://localhost:3000/users/me/upload-avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    console.log('Avatar URL:', data.url);
    
    return data;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

#### 3. Display Image
```jsx
// Product image
<img src={`http://localhost:3000${product.imageUrl}`} alt={product.name} />

// User avatar
<img src={`http://localhost:3000${user.avatarUrl}`} alt={user.fullName} />

// Or with placeholder
<img 
  src={product.imageUrl ? `http://localhost:3000${product.imageUrl}` : '/placeholder.jpg'} 
  alt={product.name} 
/>
```

#### 4. File Input Component
```jsx
const ImageUpload = ({ onUpload }) => {
  const [preview, setPreview] = useState(null);
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload
      onUpload(file);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
      {preview && (
        <img src={preview} alt="Preview" style={{ maxWidth: '200px' }} />
      )}
    </div>
  );
};
```

---

## 🚀 Next Steps

### 1. Run Migration
```bash
docker-compose exec backend-dev npm run migration:run
```

### 2. Restart Backend
```bash
docker-compose restart backend-dev
```

### 3. Test Upload
Use Postman or frontend:
```bash
# Test with curl
curl -X POST http://localhost:3000/products/upload-image \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg"
```

### 4. Access Uploaded Files
```
http://localhost:3000/uploads/products/product-1234567890-123456789.jpg
http://localhost:3000/uploads/users/user-1234567890-123456789.jpg
```

---

## ⚠️ Important Notes

### File Validation
- **Allowed types:** jpeg, jpg, png, gif, webp
- **Max size:** 5MB
- **Auto-validation:** Backend will reject invalid files

### Storage Location
- Files stored in `./public/uploads/`
- Accessible via `/uploads/` path
- **Note:** Add `public/uploads/` to `.gitignore` (already added)

### Production Considerations
1. **Use CDN/Cloud Storage** (AWS S3, Cloudinary, etc.) for production
2. **Implement image optimization** (resize, compress)
3. **Add cleanup** for old/unused images
4. **Set proper CORS** for production domain
5. **Consider security** (virus scanning, rate limiting)

### Docker Volume
Add to `docker-compose.yml` to persist uploads:
```yaml
volumes:
  - ./public:/app/public
```

---

## ✅ Checklist

- [x] Install multer dependencies
- [x] Create upload directories
- [x] Configure file upload utilities
- [x] Enable static file serving
- [x] Add product image upload endpoints
- [x] Add user avatar upload endpoints
- [x] Add avatarUrl field to User entity
- [x] Create migration for avatarUrl
- [x] Add .gitignore for uploads
- [x] Document API endpoints
- [x] Provide frontend examples

**Status: Ready for Frontend Integration! 🎉**

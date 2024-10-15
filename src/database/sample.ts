import { v4 as uuidv4 } from 'uuid';

const adminId = uuidv4();
const commonUser = {
  id: adminId,
  email: 'veltra.admin@gmail.com',
};

export const commonTimestamps = () => ({
  createdAt: new Date().toISOString(),
  createdBy: commonUser,
  updatedAt: new Date().toISOString(),
  updatedBy: commonUser,
});

const createPermission = (
  name: string,
  apiPath: string,
  method: string,
  module: string,
) => ({
  id: uuidv4(),
  name,
  apiPath,
  method,
  module,
  ...commonTimestamps(),
});

export const ADMIN_ROLE = 'ADMIN';
export const USER_ROLE = 'USER';

export const INIT_USER_LOGIN_PERMISSIONS = [
  createPermission(
    'Đăng xuất người dùng',
    '/api/v1/auth/logout',
    'POST',
    'AUTH',
  ),
  createPermission(
    'Lấy thông tin tài khoản của tôi',
    '/api/v1/auth/account',
    'GET',
    'AUTH',
  ),

  // Module Users
  createPermission(
    'Cập nhật thông tin hồ sơ người dùng',
    '/api/v1/users/update-profile',
    'PATCH',
    'USERS',
  ),
  createPermission(
    'Cập nhật mật khẩu hồ sơ người dùng',
    '/api/v1/users/update-password',
    'PUT',
    'USERS',
  ),
];

export const INIT_ADMIN_PERMISSIONS = [
  // Module Auth
  createPermission(
    'Đăng ký người dùng',
    '/api/v1/auth/register',
    'POST',
    'AUTH',
  ),
  createPermission(
    'Xác thực email',
    '/api/v1/auth/verify-email',
    'POST',
    'AUTH',
  ),
  createPermission(
    'Gửi lại email xác thực',
    '/api/v1/auth/resend-verify',
    'POST',
    'AUTH',
  ),
  createPermission(
    'Đăng nhập người dùng',
    '/api/v1/auth/login',
    'POST',
    'AUTH',
  ),
  createPermission(
    'Đăng xuất người dùng',
    '/api/v1/auth/logout',
    'POST',
    'AUTH',
  ),
  createPermission('Lấy token mới', '/api/v1/auth/refresh', 'GET', 'AUTH'),
  createPermission(
    'Lấy thông tin tài khoản của tôi',
    '/api/v1/auth/account',
    'GET',
    'AUTH',
  ),
  createPermission(
    'Quên mật khẩu',
    '/api/v1/auth/forgot-password',
    'POST',
    'AUTH',
  ),
  createPermission(
    'Đặt lại mật khẩu',
    '/api/v1/auth/reset-password',
    'POST',
    'AUTH',
  ),

  // Module Users
  createPermission(
    'Cập nhật thông tin hồ sơ người dùng',
    '/api/v1/users/update-profile',
    'PATCH',
    'USERS',
  ),
  createPermission(
    'Cập nhật mật khẩu hồ sơ người dùng',
    '/api/v1/users/update-password',
    'PUT',
    'USERS',
  ),
  createPermission(
    'Lấy thông tin người dùng theo ID',
    '/api/v1/users/:id',
    'GET',
    'USERS',
  ),
  createPermission(
    'Lấy danh sách người dùng với phân trang, lọc và sắp xếp',
    '/api/v1/users',
    'GET',
    'USERS',
  ),
  createPermission(
    'Cập nhật thông tin người dùng theo ID',
    '/api/v1/users/:id',
    'PATCH',
    'USERS',
  ),
  createPermission(
    'Xóa người dùng theo ID',
    '/api/v1/users/:id',
    'DELETE',
    'USERS',
  ),

  // Module Roles
  createPermission('Tạo vai trò mới', '/api/v1/roles', 'POST', 'ROLES'),
  createPermission(
    'Lấy thông tin vai trò theo ID',
    '/api/v1/roles/:id',
    'GET',
    'ROLES',
  ),
  createPermission(
    'Lấy thông tin vai trò với phân trang, lọc và sắp xếp',
    '/api/v1/roles',
    'GET',
    'ROLES',
  ),
  createPermission(
    'Cập nhật thông tin vai trò theo ID',
    '/api/v1/roles/:id',
    'PATCH',
    'ROLES',
  ),
  createPermission(
    'Vô hiệu hóa vai trò theo ID',
    '/api/v1/roles/:id',
    'DELETE',
    'ROLES',
  ),
  createPermission(
    'Xóa quyền hạn khỏi vai trò theo ID',
    '/api/v1/roles/:id/permissions',
    'DELETE',
    'ROLES',
  ),

  // Module Permissions
  createPermission(
    'Tạo quyền hạn mới',
    '/api/v1/permissions',
    'POST',
    'PERMISSIONS',
  ),
  createPermission(
    'Lấy thông tin quyền hạn theo ID',
    '/api/v1/permissions/:id',
    'GET',
    'PERMISSIONS',
  ),
  createPermission(
    'Lấy thông tin quyền hạn với phân trang, lọc và sắp xếp',
    '/api/v1/permissions',
    'GET',
    'PERMISSIONS',
  ),
  createPermission(
    'Cập nhật quyền hạn theo ID',
    '/api/v1/permissions/:id',
    'PATCH',
    'PERMISSIONS',
  ),
  createPermission(
    'Xóa quyền hạn theo ID',
    '/api/v1/permissions/:id',
    'DELETE',
    'PERMISSIONS',
  ),

  // Module Conversations
  createPermission(
    'Tạo mới hoặc mở cuộc trò chuyện ',
    '/api/v1/conversations',
    'POST',
    'CONVERSATIONS',
  ),
];

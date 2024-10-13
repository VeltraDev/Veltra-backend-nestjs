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

export const ADMIN_ROLE = 'ADMIN';
export const USER_ROLE = 'USER';

export const INIT_PERMISSIONS = [
  // Module Auth
  {
    id: uuidv4(),
    name: 'Đăng ký người dùng',
    apiPath: '/api/v1/auth/register',
    method: 'POST',
    module: 'AUTH',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Xác thực email',
    apiPath: '/api/v1/auth/verify-email',
    method: 'POST',
    module: 'AUTH',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Gửi lại email xác thực',
    apiPath: '/api/v1/auth/resend-verify',
    method: 'POST',
    module: 'AUTH',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Đăng nhập người dùng',
    apiPath: '/api/v1/auth/login',
    method: 'POST',
    module: 'AUTH',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Đăng xuất người dùng',
    apiPath: '/api/v1/auth/logout',
    method: 'POST',
    module: 'AUTH',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Lấy token mới',
    apiPath: '/api/v1/auth/refresh',
    method: 'GET',
    module: 'AUTH',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Lấy thông tin tài khoản của tôi',
    apiPath: '/api/v1/auth/account',
    method: 'GET',
    module: 'AUTH',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Quên mật khẩu',
    apiPath: '/api/v1/auth/forgot-password',
    method: 'POST',
    module: 'AUTH',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Đặt lại mật khẩu',
    apiPath: '/api/v1/auth/reset-password',
    method: 'POST',
    module: 'AUTH',
    ...commonTimestamps(),
  },

  // Module Users
  {
    id: uuidv4(),
    name: 'Cập nhật thông tin hồ sơ người dùng',
    apiPath: '/api/v1/users/update-profile',
    method: 'PATCH',
    module: 'USERS',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Cập nhật mật khẩu hồ sơ người dùng',
    apiPath: '/api/v1/users/update-password',
    method: 'PUT',
    module: 'USERS',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Lấy thông tin người dùng theo ID',
    apiPath: '/api/v1/users/:id',
    method: 'GET',
    module: 'USERS',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Lấy danh sách người dùng với phân trang, lọc và sắp xếp',
    apiPath: '/api/v1/users',
    method: 'GET',
    module: 'USERS',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Cập nhật thông tin người dùng theo ID',
    apiPath: '/api/v1/users/:id',
    method: 'PATCH',
    module: 'USERS',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Xóa người dùng theo ID',
    apiPath: '/api/v1/users/:id',
    method: 'DELETE',
    module: 'USERS',
    ...commonTimestamps(),
  },

  // Module Roles
  {
    id: uuidv4(),
    name: 'Tạo vai trò mới',
    apiPath: '/api/v1/roles',
    method: 'POST',
    module: 'ROLES',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Lấy thông tin vai trò theo ID',
    apiPath: '/api/v1/roles/:id',
    method: 'GET',
    module: 'ROLES',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Lấy thông tin vai trò với phân trang, lọc và sắp xếp',
    apiPath: '/api/v1/roles',
    method: 'GET',
    module: 'ROLES',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Cập nhật vai trò theo ID',
    apiPath: '/api/v1/roles/:id',
    method: 'PATCH',
    module: 'ROLES',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Xóa vai trò theo ID',
    apiPath: '/api/v1/roles/:id',
    method: 'DELETE',
    module: 'ROLES',
    ...commonTimestamps(),
  },

  // Module Permissions
  {
    id: uuidv4(),
    name: 'Tạo quyền hạn mới',
    apiPath: '/api/v1/permissions',
    method: 'POST',
    module: 'PERMISSIONS',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Lấy thông tin quyền hạn theo ID',
    apiPath: '/api/v1/permissions/:id',
    method: 'GET',
    module: 'PERMISSIONS',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Lấy thông tin quyền hạn với phân trang, lọc và sắp xếp',
    apiPath: '/api/v1/permissions',
    method: 'GET',
    module: 'PERMISSIONS',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Cập nhật quyền hạn theo ID',
    apiPath: '/api/v1/permissions/:id',
    method: 'PATCH',
    module: 'PERMISSIONS',
    ...commonTimestamps(),
  },
  {
    id: uuidv4(),
    name: 'Xóa quyền hạn theo ID',
    apiPath: '/api/v1/permissions/:id',
    method: 'DELETE',
    module: 'PERMISSIONS',
    ...commonTimestamps(),
  },
];

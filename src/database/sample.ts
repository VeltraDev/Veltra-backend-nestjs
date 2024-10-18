import { v4 as uuidv4 } from 'uuid';

const adminId = uuidv4();
const commonUser = {
  id: adminId,
  email: 'veltra.admin@gmail.com',
};

export const commonTimestamps = () => ({
  createdAt: new Date().toISOString(),
  // createdBy: commonUser,
  updatedAt: new Date().toISOString(),
  // updatedBy: commonUser,
});

const createPermission = (name, apiPath, method, module) => ({
  id: uuidv4(),
  name,
  apiPath,
  method,
  module,
  ...commonTimestamps(),
});

export const ADMIN_ROLE = 'ADMIN';
export const USER_ROLE = 'USER';

const PERMISSIONS = {
  FILE: [
    createPermission(
      'Tải file lên AWS S3',
      '/api/v1/files/upload',
      'POST',
      'FILE',
    ),
  ],

  AUTH: [
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
  ],
  USERS: [
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
  ],
  ROLES: [
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
  ],
  PERMISSIONS: [
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
  ],
  CONVERSATIONS: [
    createPermission(
      'Tạo mới cuộc trò chuyện',
      '/api/v1/conversations',
      'POST',
      'CONVERSATIONS',
    ),
    createPermission(
      'Lấy một cuộc trò chuyện theo ID',
      '/api/v1/conversations/:id',
      'GET',
      'CONVERSATIONS',
    ),
    createPermission(
      'Lấy tất cả cuộc trò chuyện của người dùng đang đăng nhập với điều kiện truy vấn',
      '/api/v1/conversations',
      'GET',
      'CONVERSATIONS',
    ),
    createPermission(
      'Cập nhật thông tin một cuộc trò chuyện',
      '/api/v1/conversations/:id/update-info',
      'PATCH',
      'CONVERSATIONS',
    ),
    createPermission(
      'Cập nhật thông tin admin của một cuộc trò chuyện',
      '/api/v1/conversations/:id/update-group-admin',
      'PUT',
      'CONVERSATIONS',
    ),
    createPermission(
      'Thêm người dùng vào một cuộc trò chuyện',
      '/api/v1/conversations/:id/add-users',
      'PUT',
      'CONVERSATIONS',
    ),
    createPermission(
      'Xóa người dùng khỏi một cuộc trò chuyện',
      '/api/v1/conversations/:id/remove-users',
      'PUT',
      'CONVERSATIONS',
    ),
    createPermission(
      'Người dùng đang đăng nhập rời khỏi một cuộc trò chuyện',
      '/api/v1/conversations/:id/leave',
      'DELETE',
      'CONVERSATIONS',
    ),
    createPermission(
      'Xóa một cuộc trò chuyện',
      '/api/v1/conversations/:id',
      'DELETE',
      'CONVERSATIONS',
    ),
  ],
  MESSAGES: [
    createPermission(
      'Xóa một tin nhắn',
      '/api/v1/messages/:id',
      'DELETE',
      'MESSAGES',
    ),
    createPermission(
      'Lấy thông tin một tin nhắn',
      '/api/v1/messages/:id',
      'GET',
      'MESSAGES',
    ),
    createPermission(
      'Tạo một tin nhắn mới',
      '/api/v1/messages',
      'POST',
      'MESSAGES',
    ),
  ],
};

export const INIT_USER_LOGIN_PERMISSIONS = [
  PERMISSIONS.AUTH.find((p) => p.name === 'Đăng xuất người dùng'),
  PERMISSIONS.AUTH.find((p) => p.name === 'Lấy thông tin tài khoản của tôi'),
  PERMISSIONS.USERS.find(
    (p) => p.name === 'Cập nhật thông tin hồ sơ người dùng',
  ),
  PERMISSIONS.USERS.find(
    (p) => p.name === 'Cập nhật mật khẩu hồ sơ người dùng',
  ),
  PERMISSIONS.CONVERSATIONS.find((p) => p.name === 'Tạo mới cuộc trò chuyện'),
  PERMISSIONS.CONVERSATIONS.find(
    (p) => p.name === 'Lấy một cuộc trò chuyện theo ID',
  ),
  PERMISSIONS.CONVERSATIONS.find(
    (p) =>
      p.name ===
      'Lấy tất cả cuộc trò chuyện của người dùng đang đăng nhập với điều kiện truy vấn',
  ),
  PERMISSIONS.CONVERSATIONS.find(
    (p) => p.name === 'Cập nhật thông tin một cuộc trò chuyện',
  ),
  PERMISSIONS.CONVERSATIONS.find(
    (p) => p.name === 'Cập nhật thông tin admin của một cuộc trò chuyện',
  ),
  PERMISSIONS.CONVERSATIONS.find(
    (p) => p.name === 'Thêm người dùng vào một cuộc trò chuyện',
  ),
  PERMISSIONS.CONVERSATIONS.find(
    (p) => p.name === 'Xóa người dùng khỏi một cuộc trò chuyện',
  ),
  PERMISSIONS.CONVERSATIONS.find(
    (p) => p.name === 'Người dùng đang đăng nhập rời khỏi một cuộc trò chuyện',
  ),
  PERMISSIONS.CONVERSATIONS.find((p) => p.name === 'Xóa một cuộc trò chuyện'),
  PERMISSIONS.MESSAGES.find((p) => p.name === 'Xóa một tin nhắn'),
  PERMISSIONS.MESSAGES.find((p) => p.name === 'Lấy thông tin một tin nhắn'),
  PERMISSIONS.MESSAGES.find((p) => p.name === 'Tạo một tin nhắn mới'),
  PERMISSIONS.FILE.find((p) => p.name === 'Tải file lên AWS S3'),
];

export const INIT_ADMIN_PERMISSIONS = [
  ...PERMISSIONS.FILE,
  ...PERMISSIONS.AUTH,
  ...PERMISSIONS.USERS,
  ...PERMISSIONS.ROLES,
  ...PERMISSIONS.PERMISSIONS,
  ...PERMISSIONS.CONVERSATIONS,
  ...PERMISSIONS.MESSAGES,
];

// src/exception/error-messages.enum.ts
export enum ErrorMessages {
  // General Errors
  INTERNAL_SERVER_ERROR = 'Internal server error',

  // Common Field Validations
  EMAIL_REQUIRED = 'Email là bắt buộc',
  EMAIL_INVALID = 'Email phải là một địa chỉ email hợp lệ',
  PASSWORD_REQUIRED = 'Mật khẩu hiện tại là bắt buộc',
  PASSWORD_STRING = 'Mật khẩu hiện tại phải là chuỗi',
  PASSWORD_RULES = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  CONFIRM_PASSWORD_REQUIRED = 'Xác nhận mật khẩu là bắt buộc',
  CONFIRM_PASSWORD_STRING = 'Xác nhận mật khẩu phải là chuỗi',
  CONFIRM_PASSWORD_MATCH = 'Mật khẩu mới và xác nhận mật khẩu không khớp',
  CURRENT_PASSWORD_INCORRECT = 'Mật khẩu hiện tại không đúng',
  TOKEN_REQUIRED = 'Token là bắt buộc',
  TOKEN_STRING = 'Token phải là chuỗi',

  // Specific Field Validations
  FIRST_NAME_REQUIRED = 'Tên là bắt buộc',
  FIRST_NAME_STRING = 'Tên phải là chuỗi ký tự',
  LAST_NAME_REQUIRED = 'Họ là bắt buộc',
  LAST_NAME_STRING = 'Họ phải là chuỗi ký tự',
  AVATAR_STRING = 'Ảnh đại diện phải là chuỗi ký tự',
  PHONE_NUMBER_VN_INVALID = 'Số điện thoại phải là số hợp lệ tại Việt Nam',

  // Password Specific Errors
  PASSWORD_SAME_AS_CURRENT = 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',

  // DTO Specific Errors
  VERIFY_EMAIL_TOKEN_REQUIRED = 'Mã xác thực email là bắt buộc',
  VERIFY_EMAIL_TOKEN_STRING = 'Mã xác thực email phải là chuỗi',
  RESET_PASSWORD_TOKEN_REQUIRED = 'Mã xác thực tạo mới mật khẩu là bắt buộc',
  RESET_PASSWORD_TOKEN_STRING = 'Mã xác thực tạo mới mật khẩu phải là chuỗi',
  REGISTER_USER_AVATAR_STRING = 'Avatar phải là chuỗi.',
  REGISTER_USER_PHONE_INVALID = 'Số điện thoại phải là số hợp lệ tại Việt Nam',
  IS_VERIFIED_BOOLEAN = 'Tình trạng xác thực phải là boolean',

  // Paginate, Filter, Sort Errors
  PAGE_NUMBER_MIN = 'Số trang phải lớn hơn hoặc bằng 1',
  SORT_BY_INVALID = 'Trường sắp xếp không hợp lệ',
  ORDER_INVALID = 'Thứ tự sắp xếp không hợp lệ',

  // User Errors
  EMAIL_ALREADY_USED = 'Email {email} đã được sử dụng.',
  PHONE_ALREADY_USED = 'Số điện thoại {phone} đã được sử dụng.',
  USER_NOT_FOUND_ID = 'Người dùng với id {id} không tồn tại.',
  USER_NOT_FOUND_EMAIL = 'Người dùng với email {email} không tồn tại trên hệ thống.',
  USER_NOT_FOUND_PHONE = 'Người dùng với số điện thoại {phone} không tồn tại trên hệ thống.',
  REFRESH_TOKEN_INVALID = 'Người dùng với id {id} không tồn tại hoặc refresh token không hợp lệ.',

  // Email Errors
  SEND_EMAIL_FAIL = 'Gửi email không thành công',

  // Field-Specific String Validations
  DISPLAY_STATUS_STRING = 'Trạng thái hiển thị phải là chuỗi ký tự',
  SEARCH_STRING = 'Trường tìm kiếm phải là chuỗi ký tự',
  ORDER_STRING = 'Trường thứ tự phải là chuỗi ký tự',
  SORT_BY_STRING = 'Trường sắp xếp phải là chuỗi ký tự',
}

export enum ErrorMessages {
  // General Errors
  INTERNAL_SERVER_ERROR = 'Internal server error',
  NO_ACCESS_ENDPOINT = 'Bạn không có quyền để truy cập endpoint này',
  NOT_DISABLE_ROLE = 'Không thể vô hiệu hóa vai trò do lỗi hệ thống',

  // Field Validations
  // -- Email Validations
  EMAIL_REQUIRED = 'Email là bắt buộc',
  EMAIL_INVALID = 'Email phải là một địa chỉ email hợp lệ',
  EMAIL_OR_PASSWORD_INVALID = 'Email hoặc mật khẩu không hợp lệ. Hãy thử lại!',
  EMAIL_ALREADY_USED = 'Email {email} đã được sử dụng',

  // -- Token Validations
  TOKEN_REQUIRED = 'Token là bắt buộc',
  TOKEN_STRING = 'Token phải là chuỗi',
  TOKEN_EXPIRED = 'Token đã hết hạn',
  TOKEN_INVALID = 'Token không hợp lệ',
  TOKEN_INVALID_OR_NO_TOKEN = 'Token không hợp lệ hoặc không có token trong Bearer Token',
  REFRESH_TOKEN_INVALID = 'Refresh token không hợp lệ',
  VERIFY_EMAIL_TOKEN_REQUIRED = 'Token email là bắt buộc',
  VERIFY_EMAIL_TOKEN_STRING = 'Token email phải là chuỗi',
  RESET_PASSWORD_TOKEN_REQUIRED = 'Token tạo mới mật khẩu là bắt buộc',
  RESET_PASSWORD_TOKEN_STRING = 'Token tạo mới mật khẩu phải là chuỗi',

  // -- Name Validations
  FIRST_NAME_REQUIRED = 'Tên là bắt buộc',
  FIRST_NAME_STRING = 'Tên phải là chuỗi ký tự',
  LAST_NAME_REQUIRED = 'Họ là bắt buộc',
  LAST_NAME_STRING = 'Họ phải là chuỗi ký tự',

  // -- Phone Number Validations
  PHONE_NUMBER_VN_INVALID = 'Số điện thoại phải là số hợp lệ tại Việt Nam',
  REGISTER_USER_PHONE_INVALID = 'Số điện thoại phải là số hợp lệ tại Việt Nam',
  PHONE_ALREADY_USED = 'Số điện thoại {phone} đã được sử dụng',
  USER_NOT_FOUND_PHONE = 'Người dùng với số điện thoại {phone} không tồn tại trên hệ thống',

  // -- Password Validations
  PASSWORD_REQUIRED = 'Mật khẩu hiện tại là bắt buộc',
  PASSWORD_STRING = 'Mật khẩu hiện tại phải là chuỗi',
  PASSWORD_RULES = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  CONFIRM_PASSWORD_REQUIRED = 'Xác nhận mật khẩu là bắt buộc',
  CONFIRM_PASSWORD_STRING = 'Xác nhận mật khẩu phải là chuỗi',
  CONFIRM_PASSWORD_MATCH = 'Mật khẩu mới và xác nhận mật khẩu không khớp',
  CURRENT_PASSWORD_INCORRECT = 'Mật khẩu hiện tại không đúng',
  PASSWORD_SAME_AS_CURRENT = 'Mật khẩu mới không được trùng với mật khẩu hiện tại',

  // -- Other Field Validations
  AVATAR_STRING = 'Ảnh đại diện phải là chuỗi ký tự',
  DISPLAY_STATUS_STRING = 'Trạng thái hiển thị phải là chuỗi ký tự',
  IS_VERIFIED = 'Tài khoản của bạn đã được xác thực trước đó',
  IS_VERIFIED_BOOLEAN = 'Tình trạng xác thực phải là boolean',
  INVALID_DATE = 'Ngày phải đúng định dạng',

  // Paginate, Filter, Sort Validations
  PAGE_NUMBER_MIN = 'Số trang phải lớn hơn hoặc bằng 1',
  LIMIT_RECORDS_MIN = 'Số lượng bản ghi muốn lấy phải lớn hơn hoặc bằng 1',
  SORT_BY_INVALID = 'Trường sắp xếp không hợp lệ',
  ORDER_INVALID = 'Thứ tự sắp xếp không hợp lệ',
  SEARCH_STRING = 'Trường tìm kiếm phải là chuỗi ký tự',
  ORDER_STRING = 'Trường thứ tự phải là chuỗi ký tự',
  SORT_BY_STRING = 'Trường sắp xếp phải là chuỗi ký tự',
  FETCH_USERS_FAILED = 'Không thể lấy thông tin người dùng, hãy kiểm tra truy vấn của bạn',

  // User Errors
  USER_NOT_FOUND_ID = 'Người dùng với id {id} không tồn tại',
  USER_NOT_FOUND_EMAIL = 'Người dùng với email {email} không tồn tại trên hệ thống',
  USER_NOT_EXISTED_OR_REFRESH_TOKEN_INVALID = 'Người dùng với id {id} không tồn tại hoặc refresh token không hợp lệ',
  USER_ID_ARRAY = 'Danh sách ID người dùng phải là một mảng chuỗi hợp lệ',

  // Email Errors
  SEND_EMAIL_FAIL = 'Gửi email không thành công',

  // Permission and Role Errors
  PERMISSION_NOT_FOUND = 'Permission với ID {id} không tồn tại',
  PERMISSION_NAME_REQUIRED = 'Tên quyền hạn là bắt buộc',
  PERMISSION_NAME_STRING = 'Tên quyền hạn phải là chuỗi ký tự',
  PERMISSION_API_PATH_REQUIRED = 'API path là bắt buộc',
  PERMISSION_API_PATH_STRING = 'API path phải là chuỗi ký tự',
  PERMISSION_METHOD_REQUIRED = 'Method là bắt buộc',
  PERMISSION_METHOD_STRING = 'Method phải là chuỗi ký tự',
  PERMISSION_MODULE_REQUIRED = 'Module là bắt buộc',
  PERMISSION_MODULE_STRING = 'Module phải là chuỗi ký tự',
  PERMISSION_SAME_API_MODULE = 'Quyền hạn với {methodAndPath} đã tồn tại trong module {module}',
  PERMISSION_ID_ARRAY = 'Danh sách ID quyền hạn phải là một mảng chuỗi hợp lệ',

  ROLE_NOT_FOUND = 'Role với ID {id} không tồn tại',
  ROLE_NAME_REQUIRED = 'Tên vai trò là bắt buộc',
  ROLE_NAME_STRING = 'Tên vai trò phải là chuỗi ký tự',
  ROLE_DESCRIPTION_STRING = 'Mô tả vai trò phải là chuỗi ký tự',
  ROLE_IS_ACTIVE_BOOLEAN = 'Trạng thái hoạt động phải là boolean',
  ROLE_ALREADY_EXISTS = 'Vai trò với tên {name} đã tồn tại',
  ROLEID_NOT_UUID_4 = 'Role ID không hợp lệ, phải là UUID phiên bản 4',
}

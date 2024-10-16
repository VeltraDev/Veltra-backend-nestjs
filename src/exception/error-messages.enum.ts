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
  MISSING_EMAIL = 'Email bị thiếu, hãy bổ sung thêm email',

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

  // -- Password Validations
  PASSWORD_REQUIRED = 'Mật khẩu hiện tại là bắt buộc',
  PASSWORD_STRING = 'Mật khẩu hiện tại phải là chuỗi',
  PASSWORD_RULES = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  CONFIRM_PASSWORD_REQUIRED = 'Xác nhận mật khẩu là bắt buộc',
  CONFIRM_PASSWORD_STRING = 'Xác nhận mật khẩu phải là chuỗi',
  CONFIRM_PASSWORD_MATCH = 'Mật khẩu mới và xác nhận mật khẩu không khớp',
  CURRENT_PASSWORD_INCORRECT = 'Mật khẩu hiện tại không đúng',
  PASSWORD_SAME_AS_CURRENT = 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
  MISSING_PASSWORD = 'Mật khẩu bị thiếu, hãy bổ sung thêm mật khẩu',

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
  USERID_NOT_UUID_4 = 'ID người dùng không hợp lệ, phải là UUID phiên bản 4',

  // Email Errors
  SEND_EMAIL_FAIL = 'Gửi email không thành công',

  // Permission and Role Errors
  PERMISSION_NOT_FOUND = 'Quyền hạn với ID {id} không tồn tại',
  PERMISSION_NAME_REQUIRED = 'Tên quyền hạn là bắt buộc',
  PERMISSION_NAME_STRING = 'Tên quyền hạn phải là chuỗi ký tự',
  PERMISSION_API_PATH_REQUIRED = 'API path là bắt buộc',
  PERMISSION_API_PATH_STRING = 'API path phải là chuỗi ký tự',
  PERMISSION_METHOD_REQUIRED = 'Method là bắt buộc',
  PERMISSION_METHOD_STRING = 'Method phải là chuỗi ký tự',
  PERMISSION_MODULE_REQUIRED = 'Module là bắt buộc',
  PERMISSION_MODULE_STRING = 'Module phải là chuỗi ký tự',
  PERMISSION_SAME_API_MODULE = 'Quyền hạn với {methodAndPath} đã tồn tại trên hệ thống và không thể tạo lại',
  PERMISSION_MODULE_EXISTS = 'Module với tên {module} đã tồn tại, vui lòng chọn tên module khác',
  PERMISSION_ID_ARRAY = 'Danh sách ID quyền hạn phải là một mảng chuỗi hợp lệ và không được để trống',
  PERMISSION_NOT_FOUND_IN_ROLE = 'Quyền hạn {permission} không có trong vai trò {role} này',

  ROLE_ID_NOT_FOUND = 'Vai trò với ID {id} không tồn tại',
  ROLE_NAME_NOT_FOUND = 'Vai trò với tên {name} không tồn tại',
  ROLE_NAME_REQUIRED = 'Tên vai trò là bắt buộc',
  ROLE_NAME_STRING = 'Tên vai trò phải là chuỗi ký tự',
  ROLE_DESCRIPTION_STRING = 'Mô tả vai trò phải là chuỗi ký tự',
  ROLE_IS_ACTIVE_BOOLEAN = 'Trạng thái hoạt động phải là boolean',
  ROLE_ALREADY_EXISTS = 'Vai trò với tên {name} đã tồn tại',
  ROLEID_NOT_UUID_4 = 'ID vai trò không hợp lệ, phải là UUID phiên bản 4',

  // Conversation Errors
  CONVERSATION_NAME_STRING = 'Tên cuộc trò chuyện phải là chuỗi ký tự.',
  CONVERSATION_PICTURE_STRING = 'Đường dẫn hình ảnh phải là chuỗi ký tự.',
  CONVERSATION_USERS_ARRAY = 'Danh sách người dùng phải là một mảng.',
  CONVERSATION_USERS_MIN_SIZE = 'Phải có ít nhất 1 người dùng trong cuộc trò chuyện.',
  CONVERSATION_USERS_UUID = 'ID của người dùng phải là UUID hợp lệ.',
  CONVERSATION_ADMIN_UUID = 'ID admin nhóm phải là UUID v4 hợp lệ.',
  CONVERSATION_USER_IDS_ARRAY = 'Danh sách userIds phải là một mảng.',
  CONVERSATION_USER_IDS_NOT_EMPTY = 'Danh sách userIds không được rỗng.',
  CONVERSATION_USER_IDS_UUID = 'Mỗi userId phải là UUID v4 hợp lệ.',
  CONVERSATION_NOT_FOUND = 'Cuộc trò chuyện với ID {id} không tồn tại.',
  CONVERSATION_GROUP_REQUIRED = 'Cuộc trò chuyện với ID {id} không phải là nhóm.',
  CONVERSATION_ONLY_ONE_USER = 'Cuộc trò chuyện đã bị xóa vì chỉ còn 1 thành viên.',
  CONVERSATION_CANNOT_DELETE_ADMIN = 'Bạn không có quyền xóa cuộc trò chuyện này vì bạn không phải là admin.',
  CONVERSATION_ADMIN_NOT_VALID = 'Admin mới không hợp lệ hoặc không phải thành viên nhóm.',
  CONVERSATION_USERS_NOT_FOUND = 'Người dùng với các ID {missingUserIds} không tồn tại.',
  CONVERSATION_CANNOT_CREATE_WITH_SELF = 'Người dùng không thể tạo cuộc trò chuyện với chính mình.',
  CONVERSATION_ALREADY_IN_GROUP = 'Tất cả người dùng với các ID sau đã là thành viên của nhóm: {alreadyInGroup}.',
  CONVERSATION_ALREADY_IN_GROUP_PARTIAL = 'Các người dùng sau đã là thành viên của nhóm: {alreadyInGroup}. Những người dùng còn lại sẽ được thêm vào nhóm.',
  CONVERSATION_USER_NOT_IN_GROUP = 'Người dùng không phải là thành viên của nhóm.',
  CONVERSATION_GROUP_CANNOT_UPDATE_ADMIN_1_1 = 'Không thể cập nhật admin cho cuộc trò chuyện 1-1.',

  // Message Errors
  MESSAGE_CONTENT_REQUIRED = 'Nội dung tin nhắn không được để trống.',
  MESSAGE_CONTENT_STRING = 'Nội dung tin nhắn phải là chuỗi ký tự.',
  MESSAGE_CONVERSATION_UUID = 'ID của cuộc trò chuyện phải là UUID hợp lệ.',
  MESSAGE_CONVERSATION_REQUIRED = 'ID cuộc trò chuyện không được để trống.',
  MESSAGE_SENDER_UUID = 'ID của người gửi phải là UUID hợp lệ.',
  MESSAGE_SENDER_REQUIRED = 'ID người gửi không được để trống.',
  MESSAGE_FILES_ARRAY = 'Files phải là một mảng đối tượng.',
  MESSAGE_SENDER_NOT_IN_CONVERSATION = 'Người gửi với ID {senderId} không nằm trong cuộc trò chuyện.',
  MESSAGE_NOT_FOUND = 'Tin nhắn với ID {messageId} không tồn tại.',
  MESSAGE_DELETE_FORBIDDEN = 'Bạn không có quyền xóa tin nhắn này.',
}

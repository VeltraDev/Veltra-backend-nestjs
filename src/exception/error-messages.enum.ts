export const ErrorMessages = {
  // General Errors (1000 - 1499)
  INTERNAL_SERVER_ERROR: { code: 1001, message: 'Internal server error' },
  NO_ACCESS_ENDPOINT: {
    code: 1003,
    message: 'Bạn không có quyền để truy cập endpoint này',
  },

  // Field Validations (1500 - 1999)
  // -- Email Validations (1500 - 1549)
  EMAIL_REQUIRED: { code: 1500, message: 'Email là bắt buộc' },
  EMAIL_INVALID: {
    code: 1501,
    message: 'Email phải là một địa chỉ email hợp lệ',
  },
  EMAIL_OR_PASSWORD_INVALID: {
    code: 1502,
    message: 'Email hoặc mật khẩu không hợp lệ. Hãy thử lại!',
  },
  EMAIL_ALREADY_USED: { code: 1503, message: 'Email {email} đã được sử dụng' },
  MISSING_EMAIL: {
    code: 1504,
    message: 'Email bị thiếu, hãy bổ sung thêm email',
  },
  NOT_VERIFIED_ACCOUNT: {
    code: 1505,
    message:
      'Người dùng vẫn chưa xác thực tài khoản, vui lòng kiểm tra email để xác thực tài khoản của bạn',
  },

  // -- Token Validations (1550 - 1599)
  TOKEN_REQUIRED: { code: 1550, message: 'Token là bắt buộc' },
  TOKEN_STRING: { code: 1551, message: 'Token phải là chuỗi' },
  TOKEN_EXPIRED: { code: 1552, message: 'Token đã hết hạn' },
  TOKEN_INVALID: { code: 1553, message: 'Token không hợp lệ' },
  TOKEN_INVALID_OR_NO_TOKEN: {
    code: 1554,
    message: 'Token không hợp lệ hoặc không có token trong Bearer Token',
  },
  REFRESH_TOKEN_INVALID: { code: 1555, message: 'Refresh token không hợp lệ' },
  VERIFY_EMAIL_TOKEN_REQUIRED: {
    code: 1556,
    message: 'Token email là bắt buộc',
  },
  VERIFY_EMAIL_TOKEN_STRING: {
    code: 1557,
    message: 'Token email phải là chuỗi',
  },
  RESET_PASSWORD_TOKEN_REQUIRED: {
    code: 1558,
    message: 'Token tạo mới mật khẩu là bắt buộc',
  },
  RESET_PASSWORD_TOKEN_STRING: {
    code: 1559,
    message: 'Token tạo mới mật khẩu phải là chuỗi',
  },
  MISSING_HEADERS_AUTHORIZATION: {
    code: 1560,
    message:
      'Request truyền lên bắt buộc phải đúng định dạng headers có key là Authorization',
  },
  MISSING_HEADERS_AUTHORIZATION_OR_VALUE_BEARER: {
    code: 1561,
    message:
      'Request truyền lên bắt buộc phải đúng định dạng với headers có key là Authorization và value bắt đầu bằng Bearer',
  },

  // -- Name Validations (1600 - 1649)
  FIRST_NAME_REQUIRED: { code: 1600, message: 'Tên là bắt buộc' },
  FIRST_NAME_STRING: { code: 1601, message: 'Tên phải là chuỗi ký tự' },
  LAST_NAME_REQUIRED: { code: 1602, message: 'Họ là bắt buộc' },
  LAST_NAME_STRING: { code: 1603, message: 'Họ phải là chuỗi ký tự' },

  // -- Password Validations (1650 - 1699)
  PASSWORD_REQUIRED: { code: 1650, message: 'Mật khẩu hiện tại là bắt buộc' },
  PASSWORD_STRING: { code: 1651, message: 'Mật khẩu hiện tại phải là chuỗi' },
  PASSWORD_RULES: {
    code: 1652,
    message:
      'Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  },
  CONFIRM_PASSWORD_REQUIRED: {
    code: 1653,
    message: 'Xác nhận mật khẩu là bắt buộc',
  },
  CONFIRM_PASSWORD_STRING: {
    code: 1654,
    message: 'Xác nhận mật khẩu phải là chuỗi',
  },
  CONFIRM_PASSWORD_MATCH: {
    code: 1655,
    message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
  },
  CURRENT_PASSWORD_INCORRECT: {
    code: 1656,
    message: 'Mật khẩu hiện tại không đúng',
  },
  PASSWORD_SAME_AS_CURRENT: {
    code: 1657,
    message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
  },
  MISSING_PASSWORD: {
    code: 1658,
    message: 'Mật khẩu bị thiếu, hãy bổ sung thêm mật khẩu',
  },

  // Other Field Validations (2000 - 2499)
  AVATAR_STRING: { code: 2000, message: 'Ảnh đại diện phải là chuỗi ký tự' },
  DISPLAY_STATUS_STRING: {
    code: 2001,
    message: 'Trạng thái hiển thị phải là chuỗi ký tự',
  },
  IS_VERIFIED: {
    code: 2002,
    message: 'Tài khoản của bạn đã được xác thực trước đó',
  },
  IS_VERIFIED_BOOLEAN: {
    code: 2003,
    message: 'Tình trạng xác thực phải là boolean',
  },
  INVALID_DATE: { code: 2004, message: 'Ngày phải đúng định dạng' },

  // Paginate, Filter, Sort Validations (2500 - 2999)
  PAGE_NUMBER_MIN: { code: 2500, message: 'Số trang phải lớn hơn hoặc bằng 1' },
  LIMIT_RECORDS_MIN: {
    code: 2501,
    message: 'Số lượng bản ghi muốn lấy phải lớn hơn hoặc bằng 1',
  },
  SORT_BY_INVALID: { code: 2502, message: 'Trường sắp xếp không hợp lệ' },
  ORDER_INVALID: { code: 2503, message: 'Thứ tự sắp xếp không hợp lệ' },
  SEARCH_STRING: { code: 2504, message: 'Trường tìm kiếm phải là chuỗi ký tự' },
  ORDER_STRING: { code: 2505, message: 'Trường thứ tự phải là chuỗi ký tự' },
  SORT_BY_STRING: { code: 2506, message: 'Trường sắp xếp phải là chuỗi ký tự' },
  FETCH_USERS_FAILED: {
    code: 2507,
    message:
      'Không thể lấy thông tin người dùng, hãy kiểm tra truy vấn của bạn',
  },

  // User Errors (3000 - 3499)
  USER_NOT_FOUND_ID: {
    code: 3000,
    message: 'Người dùng với id {id} không tồn tại',
  },
  USER_NOT_FOUND_EMAIL: {
    code: 3001,
    message: 'Người dùng với email {email} không tồn tại trên hệ thống',
  },
  USER_NOT_EXISTED_OR_REFRESH_TOKEN_INVALID: {
    code: 3002,
    message:
      'Người dùng với id {id} không tồn tại hoặc refresh token không hợp lệ',
  },
  USER_ID_ARRAY: {
    code: 3003,
    message: 'Danh sách ID người dùng phải là một mảng chuỗi hợp lệ',
  },
  USERID_NOT_UUID_4: {
    code: 3004,
    message: 'ID người dùng không hợp lệ, phải là UUID phiên bản 4',
  },

  // Email Errors (3500 - 3999)
  SEND_EMAIL_FAIL: { code: 3500, message: 'Gửi email không thành công' },

  // Permission and Role Errors (4000 - 4499)
  PERMISSION_NOT_FOUND: {
    code: 4000,
    message: 'Quyền hạn với ID {id} không tồn tại',
  },
  PERMISSION_NAME_REQUIRED: {
    code: 4001,
    message: 'Tên quyền hạn là bắt buộc',
  },
  PERMISSION_NAME_STRING: {
    code: 4002,
    message: 'Tên quyền hạn phải là chuỗi ký tự',
  },
  PERMISSION_API_PATH_REQUIRED: { code: 4003, message: 'API path là bắt buộc' },
  PERMISSION_API_PATH_STRING: {
    code: 4004,
    message: 'API path phải là chuỗi ký tự',
  },
  PERMISSION_METHOD_REQUIRED: { code: 4005, message: 'Method là bắt buộc' },
  PERMISSION_METHOD_STRING: {
    code: 4006,
    message: 'Method phải là chuỗi ký tự',
  },
  PERMISSION_MODULE_REQUIRED: { code: 4007, message: 'Module là bắt buộc' },
  PERMISSION_MODULE_STRING: {
    code: 4008,
    message: 'Module phải là chuỗi ký tự',
  },
  PERMISSION_SAME_API_MODULE: {
    code: 4009,
    message:
      'Quyền hạn với {methodAndPath} đã tồn tại trên hệ thống và không thể tạo lại',
  },
  PERMISSION_MODULE_EXISTS: {
    code: 4010,
    message:
      'Module với tên {module} đã tồn tại, vui lòng chọn tên module khác',
  },
  PERMISSION_ID_ARRAY: {
    code: 4011,
    message:
      'Danh sách ID quyền hạn phải là một mảng chuỗi hợp lệ và không được để trống',
  },
  PERMISSION_NOT_FOUND_IN_ROLE: {
    code: 4012,
    message: 'Quyền hạn {permission} không có trong vai trò {role} này',
  },

  ROLE_ID_NOT_FOUND: {
    code: 4500,
    message: 'Vai trò với ID {id} không tồn tại',
  },
  ROLE_NAME_NOT_FOUND: {
    code: 4501,
    message: 'Vai trò với tên {name} không tồn tại',
  },
  ROLE_NAME_REQUIRED: { code: 4502, message: 'Tên vai trò là bắt buộc' },
  ROLE_NAME_STRING: { code: 4503, message: 'Tên vai trò phải là chuỗi ký tự' },
  ROLE_DESCRIPTION_STRING: {
    code: 4504,
    message: 'Mô tả vai trò phải là chuỗi ký tự',
  },
  ROLE_IS_ACTIVE_BOOLEAN: {
    code: 4505,
    message: 'Trạng thái hoạt động phải là boolean',
  },
  ROLE_ALREADY_EXISTS: {
    code: 4506,
    message: 'Vai trò với tên {name} đã tồn tại',
  },
  ROLEID_NOT_UUID_4: {
    code: 4507,
    message: 'ID vai trò không hợp lệ, phải là UUID phiên bản 4',
  },
  NOT_DELETE_USER_ADMIN_ROLE: {
    code: 4508,
    message:
      'Không thể xóa vai trò USER hoặc ADMIN vì đây là 2 vai trò cơ bản của hệ thống',
  },

  // Conversation Errors (5000 - 5499)
  CONVERSATION_NAME_STRING: {
    code: 5000,
    message: 'Tên cuộc trò chuyện phải là chuỗi ký tự',
  },
  CONVERSATION_PICTURE_STRING: {
    code: 5001,
    message: 'Đường dẫn hình ảnh phải là chuỗi ký tự',
  },
  CONVERSATION_USERS_ARRAY: {
    code: 5002,
    message: 'Danh sách người dùng phải là một mảng',
  },
  CONVERSATION_USERS_MIN_SIZE: {
    code: 5003,
    message: 'Phải có ít nhất 2 người dùng trong cuộc trò chuyện',
  },
  CONVERSATION_USERS_UUID: {
    code: 5004,
    message: 'ID của người dùng phải là UUID hợp lệ',
  },
  CONVERSATION_ADMIN_UUID: {
    code: 5005,
    message: 'ID admin nhóm phải là UUID v4 hợp lệ',
  },
  CONVERSATION_USER_IDS_ARRAY: {
    code: 5006,
    message: 'Danh sách ID người dùng phải là một mảng',
  },
  CONVERSATION_USER_IDS_NOT_EMPTY: {
    code: 5007,
    message: 'Danh sách ID người dùng không được rỗng',
  },
  CONVERSATION_USER_IDS_UUID: {
    code: 5008,
    message: 'Mỗi userId phải là UUID v4 hợp lệ',
  },
  CONVERSATION_NOT_FOUND: {
    code: 5009,
    message: 'Cuộc trò chuyện với ID {id} không tồn tại',
  },
  CONVERSATION_GROUP_REQUIRED: {
    code: 5010,
    message: 'Cuộc trò chuyện với ID {id} không phải là nhóm',
  },
  CONVERSATION_ONLY_ONE_USER: {
    code: 5011,
    message: 'Cuộc trò chuyện đã bị xóa vì chỉ còn 1 thành viên',
  },
  CONVERSATION_CANNOT_DELETE_ADMIN: {
    code: 5012,
    message:
      'Bạn không có quyền xóa cuộc trò chuyện này vì bạn không phải là admin',
  },
  CONVERSATION_ADMIN_NOT_VALID: {
    code: 5013,
    message: 'Admin mới không hợp lệ hoặc không phải thành viên nhóm',
  },
  CONVERSATION_USERS_NOT_FOUND: {
    code: 5014,
    message: 'Người dùng với các ID {missingUserIds} không tồn tại',
  },
  CONVERSATION_CANNOT_CREATE_WITH_SELF: {
    code: 5015,
    message: 'Người dùng không thể tạo cuộc trò chuyện với chính mình',
  },
  CONVERSATION_ALREADY_IN_GROUP: {
    code: 5016,
    message:
      'Tất cả người dùng với các ID {alreadyInGroup} đã là thành viên của nhóm',
  },
  CONVERSATION_ALREADY_IN_GROUP_PARTIAL: {
    code: 5017,
    message:
      'Người dùng với ID {alreadyInGroup} đã là thành viên của nhóm. Những người dùng còn lại (nếu có) sẽ được thêm vào nhóm',
  },
  CONVERSATION_USER_NOT_IN_GROUP: {
    code: 5018,
    message: 'Người dùng không phải là thành viên của nhóm',
  },
  CONVERSATION_GROUP_CANNOT_UPDATE_ADMIN_1_1: {
    code: 5019,
    message: 'Không thể cập nhật admin cho cuộc trò chuyện 1-1',
  },
  CONVERSATION_NO_ACCESS: {
    code: 5020,
    message: 'Người dùng không có quyền truy cập vào cuộc trò chuyện này',
  },
  CONVERSATION_ADMIN_FORBIDDEN: {
    code: 5021,
    message:
      'Người dùng không thể thực hiện quyền hạn này vì không phải là admin nhóm',
  },
  FETCH_CONVERSATIONS_FAILED: {
    code: 5022,
    message:
      'Không thể lấy thông tin cuộc trò chuyện, hãy kiểm tra truy vấn của bạn',
  },
  CONVERSATION_CANNOT_UPDATE_ADMIN_TO_SELF: {
    code: 5023,
    message: 'Người dùng với ID {adminId} đã là admin của nhóm rồi',
  },
  CONVERSATION_NOT_GROUP_OR_TOO_SMALL: {
    code: 5024,
    message:
      'Cuộc trò chuyện hiện tại chỉ là 1-1, không phải là cuộc trò chuyện nhóm',
  },
  CONVERSATION_CANNOT_ADD_SELF: {
    code: 5025,
    message: 'Người dùng với ID {userId} không thể tự thêm chính mình vào nhóm',
  },
  CONVERSATION_ADMIN_OR_MEMBER_REQUIRED: {
    code: 5026,
    message: 'Bạn không phải là admin của nhóm này và không thể xóa người khác',
  },
  CONVERSATION_ADMIN_CANNOT_REMOVE_SELF: {
    code: 5027,
    message:
      'Admin không thể tự xóa chính mình khỏi nhóm. Vui lòng chuyển quyền admin cho thành viên khác trước',
  },
  CONVERSATION_1vs1_ALREADY_EXISTS: {
    code: 5028,
    message:
      'Bạn đã có cuộc trò chuyện riêng tư với người dùng này. Không thể tạo mới cuộc trò chuyện',
  },
  BODY_NAME_PICTURE_FOR_GROUP: {
    code: 5029,
    message:
      'Đây là cuộc trò chuyện riêng tư 1-1, ảnh đại diện và tên cuộc trò chuyện sẽ được lấy theo thông tin người đối diện',
  },
  DATA_CONVERSATION_MISSING_OR_INVALID: {
    code: 5030,
    message:
      'Dữ liệu cuộc hội thoại không hợp lệ do danh sách người dùng bị thiếu hoặc không được tải đúng cách',
  },

  // Message Errors (5500 - 5999)
  MESSAGE_CONTENT_REQUIRED: {
    code: 5500,
    message: 'Nội dung tin nhắn không được để trống',
  },
  MESSAGE_CONTENT_STRING: {
    code: 5501,
    message: 'Nội dung tin nhắn phải là chuỗi ký tự',
  },
  MESSAGE_CONVERSATION_UUID: {
    code: 5502,
    message: 'ID của cuộc trò chuyện phải là UUID hợp lệ',
  },
  MESSAGE_CONVERSATION_REQUIRED: {
    code: 5503,
    message: 'ID cuộc trò chuyện không được để trống',
  },
  MESSAGE_SENDER_UUID: {
    code: 5504,
    message: 'ID của người gửi phải là UUID hợp lệ',
  },
  MESSAGE_SENDER_REQUIRED: {
    code: 5505,
    message: 'ID người gửi không được để trống',
  },
  MESSAGE_FILES_ARRAY: {
    code: 5506,
    message:
      'Files phải là một mảng đối tượng có thông tin về URL và kiểu định dạng files',
  },
  MESSAGE_SENDER_NOT_IN_CONVERSATION: {
    code: 5507,
    message: 'Người gửi với ID {senderId} không nằm trong cuộc trò chuyện',
  },
  MESSAGE_NOT_FOUND: {
    code: 5508,
    message: 'Tin nhắn với ID {messageId} không tồn tại',
  },
  MESSAGE_DELETE_FORBIDDEN: {
    code: 5509,
    message:
      'Tin nhắn không phải của bạn nên bạn không có quyền xóa tin nhắn này',
  },
  MESSAGE_NO_ACCESS: {
    code: 5510,
    message: 'Bạn không có quyền xem tin nhắn này',
  },
  FETCH_MESSAGES_FAILED: {
    code: 5511,
    message: 'Không thể lấy thông tin tin nhắn, hãy kiểm tra truy vấn của bạn',
  },
  AT_LEAST_CONTENT_OR_FILES: {
    code: 5512,
    message:
      'Không được để tin nhắn bị trống, bạn ít nhất phải truyền lên nội dung tin nhắn hoặc files',
  },

  // Video call Errors (6000 - 6499)
  USER_EXISTED_VIDEO_CALL: {
    code: 6000,
    message:
      'Bạn đang trong một cuộc gọi khác. Hãy kết thúc cuộc gọi hiện tại để chuyển sang một cuộc gọi mới',
  },

  USER_NOT_ONLINE_STATUS: {
    code: 6001,
    message: 'Người dùng hiện tại đang không trực tuyến. Vui lòng gọi lại sau',
  },

  USER_CALL_ANOTHER_PEOPLE: {
    code: 6002,
    message: 'Người dùng hiện tại đang bận tham gia cuộc gọi khác',
  },

  NO_CALL_TO_ANSWER: {
    code: 6003,
    message: 'Không có cuộc gọi nào để trả lời',
  },

  NO_CALL_TO_END: {
    code: 6004,
    message: 'Không có cuộc gọi nào để kết thúc',
  },

  // Post and Reactions Errors (6500 - 6999)
  POST_NOT_FOUND: {
    code: 6500,
    message: 'Không tìm thấy bài viết với id {id}',
  },
  POST_NOT_OWNER: {
    code: 6501,
    message: 'Bạn không có quyền chỉnh sửa hoặc xóa bài viết này',
  },
  FETCH_POSTS_FAILED: {
    code: 6502,
    message: 'Lấy danh sách bài viết thất bại',
  },
  POST_CONTENT_REQUIRED: {
    code: 6503,
    message: 'Nội dung bài viết không được để trống',
  },
  POST_CONTENT_STRING: {
    code: 6504,
    message: 'Nội dung bài viết phải là chuỗi ký tự',
  },
  ATTACHMENT_URL_REQUIRED: {
    code: 6505,
    message: 'URL của tệp đính kèm không được để trống',
  },
  ATTACHMENT_URL_STRING: {
    code: 6506,
    message: 'URL của tệp đính kèm phải là chuỗi ký tự',
  },
  ATTACHMENT_TYPE_STRING: {
    code: 6507,
    message: 'Loại tệp đính kèm phải là chuỗi ký tự',
  },
  ATTACHMENTS_ARRAY: {
    code: 6508,
    message: 'Danh sách tệp đính kèm phải là một mảng',
  },

  REACTION_TYPE_REQUIRED: {
    code: 6509,
    message: 'Loại phản ứng không được để trống',
  },
  REACTION_TYPE_STRING: {
    code: 6510,
    message: 'Loại phản ứng phải là chuỗi ký tự',
  },
  REACTION_TYPE_ALREADY_EXISTS: {
    code: 6511,
    message: 'Loại phản ứng "{type}" đã tồn tại',
  },
  REACTION_TYPE_NOT_FOUND: {
    code: 6512,
    message: 'Không tìm thấy loại phản ứng với id {id}',
  },

  REACTION_TYPE_ID_REQUIRED: {
    code: 6513,
    message: 'ID loại phản ứng không được để trống',
  },
  REACTION_TYPE_ID_INVALID: {
    code: 6514,
    message: 'ID loại phản ứng không hợp lệ',
  },
  POST_ID_REQUIRED: {
    code: 6515,
    message: 'ID bài viết không được để trống',
  },
  POST_ID_INVALID: {
    code: 6516,
    message: 'ID bài viết không hợp lệ',
  },
  REACTION_ALREADY_EXISTS: {
    code: 6517,
    message: 'Bạn đã phản ứng với bài viết này',
  },
  REACTION_RECORD_NOT_FOUND: {
    code: 6518,
    message: 'Không tìm thấy phản ứng với id {id}',
  },
  REACTION_NOT_OWNER: {
    code: 6519,
    message: 'Bạn không có quyền xóa phản ứng này',
  },
};

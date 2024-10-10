export interface UsersInterface {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: string;
    name: string;
  };
  permissions?: {
    id: string;
    name: string;
    apiPath: string;
    method: string;
    module: string;
  }[];
}

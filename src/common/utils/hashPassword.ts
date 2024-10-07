import { genSaltSync, hashSync, compareSync } from 'bcryptjs';

export const getHashPassword = (password: string): string => {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
};

export const isValidPassword = (
  password: string,
  hashPasswordFromDB: string,
): boolean => {
  return compareSync(password, hashPasswordFromDB);
};

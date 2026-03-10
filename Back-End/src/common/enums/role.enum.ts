export const Role = {
  Student: 'student',
  Admin: 'admin',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

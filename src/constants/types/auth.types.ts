export interface TokenGenerate {
  id: string
  email: string
  role: string
  role_name: string
  full_name: string
}
export interface UserLoginParams {
  email: string
  password: string
  fcmToken :string
}
export interface UserRegisterParams {
  email: string
  password: string
  confirm_password: string
  full_name: string
}

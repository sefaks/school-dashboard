
import bcrypt from "bcryptjs"

export const saltAndHashPassword = (password: string) => {
  const saltRounds = 10 // Kendi gereksinimlerinize göre bu değeri değiştirebilirsiniz
  return bcrypt.hashSync(password, saltRounds)
}

// Şifreyi doğrula
export const verifyPassword = (password: string, hashedPassword: string) => {
  return bcrypt.compareSync(password, hashedPassword)
}

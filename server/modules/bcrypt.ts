import bcrypt from "bcrypt"

const rounds = 10

const generateSalt = async () => await bcrypt.genSalt(rounds)

export const hashPassword = async (plainPassword: string) => {
  const salt = await generateSalt()
  return await bcrypt.hash(plainPassword, salt)
}

export const comparePassword = async (
  hashedPassword: string,
  plainPassword: string
) => {
  const result = await bcrypt.compare(plainPassword, hashedPassword)
  return result
}

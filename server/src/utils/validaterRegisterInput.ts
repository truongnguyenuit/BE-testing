import { RegisterInput } from "../types/RegisterInput";

export const validateRegisterInput = (registerInput: RegisterInput) => {
  if (!registerInput.email.includes("@"))
    return {
      message: "Invalid email",
      errors: [{ field: "email", message: "Email must include @ symbol" }],
    };

  if (registerInput.username.includes("@"))
    return {
      message: "Invalid email",
      errors: [{ field: "email", message: "Username cannot include @ symbol" }],
    };

  if (registerInput.username.length <= 2)
    return {
      message: "Invalid username",
      errors: [
        { field: "username", message: "User length must be greater than 2" },
      ],
    };

  if (registerInput.password.length <= 2)
    return {
      message: "Invalid password",
      errors: [
        {
          field: "password",
          message: "Password length must be greater than 2",
        },
      ],
    };

  return null;
};

import type { RequestHandler } from "express";

type SignupFlag =
  | "ENABLE_CUSTOMER_SIGNUP"
  | "ENABLE_PROVIDER_SIGNUP";

export const requireSignupEnabled = (flag: SignupFlag): RequestHandler => {
  return (_req, res, next) => {
    if (process.env[flag] !== "true") {
      res.status(403).json({ message: "Cadastro desativado." });
      return;
    }

    next();
  };
};
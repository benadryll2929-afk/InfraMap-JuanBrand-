export const ADMIN_EMAIL = "admininframap@gmail.com";
export const ALLOWED_EMAIL_DOMAIN = "@ietirafaelnaviavaron.edu.co";

export const isAllowedEmail = (email = "") => {
  const normalizedEmail = email.toLowerCase();
  return (
    normalizedEmail === ADMIN_EMAIL ||
    normalizedEmail.endsWith(ALLOWED_EMAIL_DOMAIN)
  );
};

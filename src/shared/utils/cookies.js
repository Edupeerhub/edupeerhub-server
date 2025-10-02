function setAuthCookie(res, token) {
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    domain:
      process.env.NODE_ENV === "production" ? ".edupeerhub.com" : undefined,
  });
}

function clearAuthCookie(res) {
  res.clearCookie("jwt", {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    domain:
      process.env.NODE_ENV === "production" ? ".edupeerhub.com" : undefined,
  });
}

module.exports = { setAuthCookie, clearAuthCookie };

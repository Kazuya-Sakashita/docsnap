/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "next/core-web-vitals",
    // 他の extends...
    "prettier" // ← 最後に置く
  ]
}

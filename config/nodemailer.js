const nodemailer = require("nodemailer");
module.exports = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.MAILER_PASS,
  },
});

/*
  secure: true,
   يتم استخدام بروتوكول SSL / TLS لتشفير جميع المعلومات المرسلة والمستقبلة بين الخادم والعميل. هذا يجعل من الصعب على أطراف ثالثة
    التقاط أو تحليل المحتوى المرسل عبر شبكة الإنترنت. */

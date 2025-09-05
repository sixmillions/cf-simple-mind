import * as nodemailer from 'nodemailer';
import { MailInfo } from '../types';

const sendEmail = async function sendEmail(mailInfo: MailInfo): Promise<void> {
  // 1. 创建一个 transporter 对象，发送邮件的核心，它包含了 SMTP 服务的配置信息
  const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 994,              // SSL 端口
    secure: true,           
    auth: {
      user: "liubw95@163.com",
      pass: "SFNOMDTZFOPXTJNX",
    },
  });

  // 2. 设置邮件内容
  const mailOptions = {
    from: "liubw95@163.com",
    to: mailInfo.to,
    subject: `Mind: ${mailInfo.title}`,
    // text: options.text,  // 纯文本内容
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reminder: ${mailInfo.title}</h2>
        <p><strong>Description:</strong></p>
        <p>${mailInfo.description || 'No description provided'}</p>
        <p><strong>Scheduled Time:</strong> ${mailInfo.time}</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          This is an automated reminder sent by the subscription reminder system.
        </p>
        <p><a href="https://mind.sixmillions.cn/api/close/${mailInfo.id}?token=${mailInfo.token}">取消提醒</a></p>
      </div>
    `,             // HTML 内容
  };

  // 3. 发送邮件
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功:', info);
    // console.log('预览链接:', nodemailer.getTestMessageUrl(info)); // 如果使用 ethereal.email
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw new Error('邮件发送失败');
  }
}

export { sendEmail };
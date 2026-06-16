import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async enviarAlerta(datos: {
    tipo: string;
    mensaje: string;
    empresa: string;
    sucursal: string;
  }) {
    const { tipo, mensaje, empresa, sucursal } = datos;
    const asunto = `🚨 Alerta PowerPOS — ${tipo} — ${empresa}`;
    const cuerpo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px;">
          <h1 style="color: #FF6B35; margin: 0;">Power<span style="color: white">POS</span></h1>
          <p style="color: #999; margin: 5px 0 0;">Sistema de alertas</p>
        </div>
        <div style="background: #fff3f3; border-left: 4px solid #e53e3e; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h2 style="color: #e53e3e; margin: 0 0 10px;">🚨 ${tipo}</h2>
          <p style="color: #333; margin: 0;">${mensaje}</p>
        </div>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
          <p style="margin: 0; color: #666;"><strong>Empresa:</strong> ${empresa}</p>
          <p style="margin: 5px 0 0; color: #666;"><strong>Sucursal:</strong> ${sucursal}</p>
          <p style="margin: 5px 0 0; color: #666;"><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
          PowerPOS Pioneers — Sistema de gestión gastronómica
        </p>
      </div>
    `;

    const resultados = await Promise.allSettled([
      this.enviarEmail(asunto, cuerpo),
      this.enviarWhatsApp(mensaje, tipo),
      this.enviarSMS(mensaje, tipo),
    ]);

    resultados.forEach((resultado, index) => {
      const canal = ['Email', 'WhatsApp', 'SMS'][index];
      if (resultado.status === 'rejected') {
        this.logger.warn(`No se pudo enviar por ${canal}: ${resultado.reason}`);
      } else {
        this.logger.log(`✅ Alerta enviada por ${canal}`);
      }
    });

    return { enviado: true, canales: resultados.map((r, i) => ({
      canal: ['email', 'whatsapp', 'sms'][i],
      exitoso: r.status === 'fulfilled',
    }))};
  }

  private async enviarEmail(asunto: string, cuerpo: string) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Credenciales de email no configuradas');
    }

    await this.transporter.sendMail({
      from: `"PowerPOS Alerts" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_ADMIN,
      subject: asunto,
      html: cuerpo,
    });
  }

  private async enviarWhatsApp(mensaje: string, tipo: string) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Credenciales de Twilio no configuradas');
    }

    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE}`,
      to: `whatsapp:${process.env.ADMIN_PHONE}`,
      body: `🚨 *PowerPOS Alert*\n*${tipo}*\n\n${mensaje}\n\n_${new Date().toLocaleString('es-CO')}_`,
    });
  }

  private async enviarSMS(mensaje: string, tipo: string) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Credenciales de Twilio no configuradas');
    }

    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    await client.messages.create({
      from: process.env.TWILIO_PHONE,
      to: process.env.ADMIN_PHONE,
      body: `PowerPOS 🚨 ${tipo}: ${mensaje.substring(0, 140)}`,
    });
  }
}
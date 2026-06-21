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

  /**
   * Envía un mensaje de cumpleaños directamente al cliente (no al admin).
   * Intenta WhatsApp si tiene teléfono, y email si tiene correo.
   */
  async enviarFelicitacionCumpleanos(cliente: { nombre: string; telefono?: string | null; email?: string | null }, nombreEmpresa: string) {
    const primerNombre = cliente.nombre.split(' ')[0];
    const mensajeTexto = `🎉 ¡Feliz cumpleaños, ${primerNombre}! Todo el equipo de ${nombreEmpresa} te desea un día increíble. ¡Esperamos verte pronto para celebrar juntos! 🎂`;

    const intentos: Promise<void>[] = [];

    if (cliente.telefono && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      intentos.push(this.enviarWhatsAppA(cliente.telefono, mensajeTexto));
    }

    if (cliente.email && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const asunto = `🎉 ¡${nombreEmpresa} te desea un feliz cumpleaños!`;
      const cuerpo = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF6B35, #f7931e); padding: 30px; border-radius: 8px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎂 ¡Feliz Cumpleaños!</h1>
          </div>
          <div style="padding: 24px; text-align: center;">
            <p style="font-size: 16px; color: #333;">Hola <strong>${primerNombre}</strong>,</p>
            <p style="font-size: 16px; color: #333;">${mensajeTexto}</p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
            Con cariño, el equipo de ${nombreEmpresa}
          </p>
        </div>
      `;
      intentos.push(this.enviarEmailA(cliente.email, asunto, cuerpo));
    }

    const resultados = await Promise.allSettled(intentos);
    resultados.forEach((r, i) => {
      if (r.status === 'rejected') {
        this.logger.warn(`No se pudo felicitar a ${cliente.nombre}: ${r.reason}`);
      }
    });

    return { enviado: resultados.some((r) => r.status === 'fulfilled') };
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

  private async enviarEmailA(destinatario: string, asunto: string, cuerpo: string) {
    await this.transporter.sendMail({
      from: `"PowerPOS" <${process.env.SMTP_USER}>`,
      to: destinatario,
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

  private async enviarWhatsAppA(telefono: string, mensaje: string) {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    // Asegura el formato internacional para WhatsApp (Twilio Sandbox requiere que el destinatario
    // se haya unido previamente al sandbox con el código "join ...")
    const destino = telefono.startsWith('+') ? telefono : `+${telefono}`;

    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_PHONE}`,
      to: `whatsapp:${destino}`,
      body: mensaje,
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
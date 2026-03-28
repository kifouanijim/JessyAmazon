const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    }
});

async function sendOrderConfirmation(user, order) {
    if (!process.env.SMTP_USER) {
        console.log(`[Email simulé] Confirmation commande #${order.id} → ${user.email}`);
        return;
    }
    const itemsList = (order.items || []).map(i =>
        `<tr><td style="padding:8px;border-bottom:1px solid #334155;">${i.productName}</td><td style="padding:8px;border-bottom:1px solid #334155;text-align:center;">×${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #334155;text-align:right;">${(i.price * i.quantity).toLocaleString('fr-FR')} FCFA</td></tr>`
    ).join('');

    await transporter.sendMail({
        from: `"VotreMarché" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Confirmation de votre commande #${order.id} — VotreMarché`,
        html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#fff;padding:32px;border-radius:12px;">
                <h1 style="color:#f2c335;margin-bottom:8px;">Commande confirmée !</h1>
                <p style="color:#94a3b8;">Bonjour ${user.fullName},</p>
                <p style="color:#94a3b8;">Votre commande <strong style="color:#fff;">#${order.id}</strong> a bien été reçue.</p>
                <table style="width:100%;border-collapse:collapse;margin:24px 0;">
                    <thead><tr style="background:#1e293b;"><th style="padding:8px;text-align:left;">Produit</th><th style="padding:8px;">Qté</th><th style="padding:8px;text-align:right;">Prix</th></tr></thead>
                    <tbody>${itemsList}</tbody>
                </table>
                <p style="font-size:18px;font-weight:bold;color:#f2c335;">Total : ${order.total.toLocaleString('fr-FR')} FCFA</p>
                <p style="color:#94a3b8;margin-top:24px;">Livraison à : ${order.deliveryAddress}, ${order.deliveryCity}</p>
                <p style="color:#64748b;font-size:12px;margin-top:32px;">© 2025 VotreMarché — Congo-Brazzaville</p>
            </div>`
    });
}

module.exports = { sendOrderConfirmation };

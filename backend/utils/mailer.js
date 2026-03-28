const nodemailer = require('nodemailer');

function createTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
}

async function sendOrderConfirmation(toEmail, order) {
    const transporter = createTransporter();
    if (!transporter) return; // SMTP non configuré, on passe silencieusement

    const itemsHtml = (order.items || []).map(item => `
        <tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${item.productName}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${item.price.toLocaleString('fr-FR')} FCFA</td>
        </tr>`).join('');

    const discountHtml = order.discount > 0
        ? `<p style="color:#22c55e;">Réduction (${order.promoCode}) : -${order.discount.toLocaleString('fr-FR')} FCFA</p>`
        : '';

    const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;">
            <div style="background:#4a634e;color:white;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
                <h1 style="margin:0;">VotreMarché</h1>
                <p style="margin:8px 0 0;opacity:.8;">Confirmation de commande</p>
            </div>
            <div style="background:white;padding:24px;border-radius:0 0 8px 8px;">
                <h2>Commande #${order.id} confirmée !</h2>
                <p>Bonjour ${order.deliveryName},</p>
                <p>Nous avons bien reçu votre commande. Elle est en cours de traitement.</p>
                <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                    <thead><tr style="background:#f1f5f9;">
                        <th style="padding:10px;text-align:left;">Produit</th>
                        <th style="padding:10px;text-align:center;">Qté</th>
                        <th style="padding:10px;text-align:right;">Prix</th>
                    </tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div style="background:#f8fafc;padding:16px;border-radius:8px;">
                    ${discountHtml}
                    <p>Livraison : ${order.shippingCost.toLocaleString('fr-FR')} FCFA</p>
                    <p style="font-size:18px;font-weight:bold;color:#4a634e;">Total : ${order.total.toLocaleString('fr-FR')} FCFA</p>
                </div>
                <p style="margin-top:16px;">Livraison à : ${order.deliveryAddress}, ${order.deliveryCity}</p>
                <p style="color:#64748b;font-size:12px;margin-top:24px;">Merci de votre confiance — VotreMarché Congo-Brazzaville</p>
            </div>
        </div>`;

    try {
        await transporter.sendMail({
            from: `"VotreMarché" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: `Confirmation commande #${order.id} - VotreMarché`,
            html
        });
    } catch (err) {
        console.error('Email non envoyé:', err.message);
    }
}

module.exports = { sendOrderConfirmation };

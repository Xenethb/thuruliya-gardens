import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const orderData = await req.json();
        const { customer, items, subtotal, delivery, total, paymentMethod, orderId } = orderData;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'senethboteju@gmail.com',
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        // 1. Build the items list HTML
        const itemsHtml = items.map((item: any) => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px 0;">${item.product.name} (x${item.quantity})</td>
                <td style="padding: 10px 0; text-align: right;">Rs. ${(item.product.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('');

        // 2. The Detailed Email Template
        const emailBody = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #2C3E2B; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Thurulya Gardens</h1>
                    <p style="margin: 5px 0 0 0;">Order Confirmation #${orderId}</p>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="color: #2C3E2B;">Order Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead><tr style="border-bottom: 2px solid #2C3E2B;"><th style="text-align: left;">Product</th><th style="text-align: right;">Price</th></tr></thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>
                    
                    <div style="margin-top: 20px; text-align: right;">
                        <p>Subtotal: Rs. ${subtotal.toLocaleString()}</p>
                        <p>Delivery: ${delivery === 0 ? 'Free' : 'Rs. ' + delivery.toLocaleString()}</p>
                        <h3 style="color: #2C3E2B;">Total: Rs. ${total.toLocaleString()}</h3>
                    </div>

                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <h3 style="margin-top: 0;">Shipping Information</h3>
                        <p><strong>Name:</strong> ${customer.name}</p>
                        <p><strong>Address:</strong> ${customer.address}, ${customer.city}, ${customer.postalCode}</p>
                        <p><strong>Phone:</strong> ${customer.phone}</p>
                        <p><strong>WhatsApp:</strong> ${customer.whatsapp}</p>
                        <p><strong>Email:</strong> ${customer.email}</p>
                        <p><strong>Payment:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}</p>
                        <p><strong>Notes:</strong> ${customer.notes || 'None'}</p>
                    </div>
                </div>
                <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                    Thurulya Gardens Nursery & Landscaping
                </div>
            </div>
        `;

        // Send to Admin
        await transporter.sendMail({
            from: 'senethboteju@gmail.com',
            to: 'senethboteju@gmail.com',
            subject: `New Order #${orderId} - ${customer.name}`,
            html: `<h1>Admin Notification</h1>${emailBody}`
        });

        // Send to Customer
        if (customer.email) {
            await transporter.sendMail({
                from: 'senethboteju@gmail.com',
                to: customer.email,
                subject: `Your Thurulya Gardens Order #${orderId}`,
                html: `<h1>Thank you for your order!</h1>${emailBody}`
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
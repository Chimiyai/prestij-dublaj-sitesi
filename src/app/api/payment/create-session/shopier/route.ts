// src/app/api/payment/create-session/shopier/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import prisma from '@/lib/prisma';
import { Shopier } from 'shopier-api';
import jwt from 'jsonwebtoken'; // YENİ: jwt import et

// YENİ: Diğer API'lardan kopyaladığımız hibrit kimlik doğrulama mantığı
interface UserPayload {
  userId: number;
  email: string;
  username: string;
  // Gerekirse diğer alanlar
}

async function getAuthenticatedUser(request: NextRequest): Promise<UserPayload | null> {
  // 1. Yöntem: Bearer Token (Masaüstü Uygulaması)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as UserPayload;
      return decoded;
    } catch (e) {
      return null; 
    }
  }

  // 2. Yöntem: Session Cookie (Web Sitesi)
  const session = await getServerSession(authOptions);
  if (session?.user?.id && session.user.email && session.user.username) {
    return {
      userId: parseInt(session.user.id),
      email: session.user.email,
      username: session.user.username
    };
  }

  return null;
}
// --- BİTİŞ ---

export async function POST(request: NextRequest) {
  // Eski session mantığı yerine yeni hibrit fonksiyonu kullan
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: 'Giriş yapmalısınız.' }, { status: 401 });
  }

  try {
    const { projectId } = await request.json();
    if (!projectId) {
      return NextResponse.json({ message: 'Proje ID\'si gerekli.' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project || !project.price || project.price <= 0) {
      return NextResponse.json({ message: 'Satın alınabilir bir ürün bulunamadı.' }, { status: 404 });
    }

    const shopier = new Shopier(
        process.env.SHOPIER_API_KEY!,
        process.env.SHOPIER_API_SECRET!
    );

    const platformOrderId = `PRESTIJ-${projectId}-${user.userId}-${Date.now()}`;
    
    shopier.setBuyer({
      platform_order_id: platformOrderId,
      buyer_id_nr: String(user.userId), // String olması gerekebilir
      product_name: project.title,
      buyer_name: user.username,
      buyer_surname: '.',
      buyer_email: user.email,
      buyer_phone: '5555555555'
    });

    shopier.setOrderBilling({
      billing_address: "Adres Gerekli Değil",
      billing_city: "Istanbul",
      billing_country: "Türkiye",
      billing_postcode: "34000"
    });

    shopier.setOrderShipping({
      shipping_address: "Adres Gerekli Değil",
      shipping_city: "Istanbul",
      shipping_country: "Türkiye",
      shipping_postcode: "34000"
    });

    const paymentHTML = shopier.generatePaymentHTML(project.price);

    return NextResponse.json({ paymentHTML });

  } catch (error) {
    console.error("Shopier ödeme oturumu oluşturma hatası:", error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
    return NextResponse.json({ message: `Bir hata oluştu: ${errorMessage}` }, { status: 500 });
  }
}

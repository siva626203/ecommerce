import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET as string;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature === signature) {
      const event = JSON.parse(rawBody);
      
      // Handle payment capture
      if (event.event === 'payment.captured') {
        const paymentEntity = event.payload.payment.entity;
        const razorpayOrderId = paymentEntity.order_id;

        // Find the order in firestore by razorpayOrderId
        const q = query(collection(db, 'orders'), where("razorpayOrderId", "==", razorpayOrderId));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(async (document) => {
          await updateDoc(doc(db, 'orders', document.id), {
            paymentStatus: 'paid',
            status: 'processing'
          });
        });
      }

      return NextResponse.json({ status: 'ok' });
    } else {
      return NextResponse.json({ status: 'invalid signature' }, { status: 400 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

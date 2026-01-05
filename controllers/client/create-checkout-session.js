import { error } from '@functions';
import { Course } from '@models';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async (req, res) => {
  const { me } = req.user;
  if (!me) throw error(404, 'Missing required params');

  const { courseId, courseName } = req.body;
  if (!courseId || !courseName) throw error(400, 'Missing course details');

  const course = await Course.findById(courseId).lean();
  if (!course) throw error(404, 'Course not found');

  const effectivePrice = course?.sale?.isActive ? Number(course.sale.price) : Number(course.price);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      line_items: [
        {
          price_data: {
            currency: (course.currency || 'eur').toLowerCase(),
            product_data: {
              name: courseName,
              description: course.preview?.description || undefined,
            },
            unit_amount: Math.round(effectivePrice * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.APP_BASE_URL}/client/courses/${courseId}?success=true`,
      cancel_url: `${process.env.APP_BASE_URL}/client/courses/${courseId}`,
      customer_email: req.user.email,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      invoice_creation: {
        enabled: true, // Creates the invoice after successful payment
        invoice_data: {
          footer: 'Thank you for your purchase!',
        },
      },
      metadata: {
        courseId,
        userId: me,
        courseName,
        userEmail: req.user.email,
        price: effectivePrice,
      },
      allow_promotion_codes: true,
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    throw error(400, err.message || 'Failed to create checkout session');
  }
};

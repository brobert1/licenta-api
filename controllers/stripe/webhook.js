import { Order } from '../../models';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event = req.body;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      // Extract metadata from the session
      const { courseId, userId, price } = session.metadata;

      try {
        // Create a new order record
        await Order.create({
          course: courseId,
          identity: userId,
          amount: parseFloat(price),
          currency: session.currency,
        });
      } catch (error) {
        console.error('Error creating order record:', error);
      }

      break;
    }

    default:
      break;
  }

  return res.status(200).send();
};

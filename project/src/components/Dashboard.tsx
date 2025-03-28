import React from 'react';
import { Settings, CreditCard, Download, History, RefreshCw, MessagesSquare } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Dashboard() {
  const handleSubscription = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-license`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_subscription',
          priceId: 'your_stripe_price_id' // Replace with your actual Stripe price ID
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const handleResetLicense = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-license`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset_license'
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('License reset successfully');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error resetting license:', error);
      alert('Failed to reset license. Please try again.');
    }
  };

  const features = [
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: 'Manage Subscription',
      description: 'View and manage your Stripe subscription',
      action: handleSubscription
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: 'Reset License',
      description: 'Reset your license for use on a new machine',
      action: handleResetLicense
    },
    {
      icon: <History className="h-6 w-6" />,
      title: 'Invoice History',
      description: 'View your past Stripe invoices',
      action: () => console.log('View history')
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: 'Download Software',
      description: 'Get the latest version of our software',
      action: () => console.log('Download')
    },
    {
      icon: <MessagesSquare className="h-6 w-6" />,
      title: 'Discord Support',
      description: 'Join our Discord support server',
      action: () => window.open('YOUR_DISCORD_INVITE_LINK', '_blank')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Your Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                {React.cloneElement(feature.icon, { className: 'h-6 w-6 text-indigo-600' })}
              </div>
              <h2 className="ml-3 text-xl font-semibold text-gray-900">{feature.title}</h2>
            </div>
            <p className="text-gray-600 mb-4">{feature.description}</p>
            <button
              onClick={feature.action}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200"
            >
              {feature.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
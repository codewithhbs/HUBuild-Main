import React from 'react';

const Cancellation = () => {
  return (
    <div className="container mt-5 mb-5">
      <h1 className="text-center mb-4">Cancellation & Refund Policy</h1>
      <p className="text-muted">Last Updated: 20 February 2025</p>

      <p>
        At <strong>Help U Build</strong>, we strive to provide transparent and fair billing for our services. As our platform offers time-based consultations through chat and call with architects, interior designers, and Vastu experts, our policy is designed around usage-based charges.
      </p>

      <h3 className="mt-4">1. No Cancellations</h3>
      <p>
        Since our services are provided in real-time and billed on a per-minute basis, cancellations are not applicable once a session has started. Users are only charged for the exact duration of their consultation.
      </p>

      <h3 className="mt-4">2. Time-Based Billing</h3>
      <p>
        Wallet deductions occur strictly based on the time spent during a session:
      </p>
      <ul>
        <li><strong>Chat Sessions:</strong> Wallet is deducted for the actual time spent chatting with the provider. For example, a 10-minute chat results in a deduction equivalent to 10 minutes.</li>
        <li><strong>Call Sessions:</strong> Similar to chat, only the duration of the call is billed. If you speak with a provider for 15 minutes, your wallet will be charged accordingly.</li>
      </ul>

      <h3 className="mt-4">3. Refund Policy</h3>
      <p>
        Due to the real-time nature of our services, refunds are generally not provided. However, if you experience technical issues or face discrepancies in billing, please reach out to us. We will investigate the issue and offer refunds or credits where applicable.
      </p>

      <h3 className="mt-4">4. Failed Recharge Refunds</h3>
      <p>
        In the event of a failed recharge where the amount is debited from your bank account but not credited to your wallet, we ensure the following:
      </p>
      <ul>
        <li>The debited amount will either be refunded to your original payment method within 3-4 working days, or</li>
        <li>The amount will be directly credited to your wallet once the issue is resolved.</li>
      </ul>
      <p>
        If the refund does not reflect within the mentioned timeframe, please contact our support team with the transaction details.
      </p>

      <h3 className="mt-4">5. Billing Disputes</h3>
      <p>
        If you believe there has been an error in billing, please contact our support team within 7 days of the transaction. We will review your session details and resolve the matter promptly.
      </p>

      <h3 className="mt-4">6. Contact Us</h3>
      <p>
        For any questions or concerns regarding this Cancellation & Refund Policy, feel free to reach out:
      </p>
      <p>
        <strong>Help U Build</strong><br />
        Email: info@helpubuild.co.in<br />
        Phone:+91 9220441214
      </p>
    </div>
  );
};

export default Cancellation;

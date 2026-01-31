import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8">Refund Policy</h1>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Refund Eligibility</h2>
            <p className="mb-4">
              Due to the nature of digital products (license keys), we generally do not offer refunds once a key has been viewed or redeemed. However, we may consider refunds in the following cases:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The license key provided is invalid or non-functional.</li>
              <li>The product was out of stock after payment was confirmed.</li>
              <li>A technical error occurred on our end preventing delivery.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Non-Refundable Items</h2>
            <p className="mb-4">
              The following items are non-refundable:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Redeemed license keys.</li>
              <li>Products purchased by mistake if the key has been revealed.</li>
              <li>Account bans or suspensions resulting from the use of our software.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Requesting a Refund</h2>
            <p>
              To request a refund, please contact our support team through Discord or email. Please provide your order ID and a detailed explanation of the issue.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Processing Time</h2>
            <p>
              Refund requests are typically reviewed within 24-48 hours. If approved, the refund will be processed back to your original payment method within 5-10 business days.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

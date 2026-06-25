export const metadata = {
  title: 'Privacy Policy - Payparo',
  description: 'Payparo privacy policy and data usage information',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 md:p-12">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
          Privacy Policy Demo
        </h1>

        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
          <p className="mb-6">
            <strong>Last updated: June 25, 2026</strong>
          </p>

          <p className="mb-6">
            This is a demo privacy policy page for Payparo. Your privacy is important to us. It is our policy to respect your privacy regarding any information we may collect from you across our website and applications.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
            1. Data Collection
          </h2>
          <p className="mb-6">
            We collect personal information such as your name, email address, and payment details to provide you with the best possible service. We only ask for personal information when we truly need it to provide a service to you.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
            2. Data Usage
          </h2>
          <p className="mb-6">
            Your data is used to facilitate escrow transactions, verify your identity, and ensure a secure environment for all users. We only retain collected information for as long as necessary to provide you with your requested service.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
            3. Data Sharing
          </h2>
          <p className="mb-6">
            We do not sell your personal data to third parties. We may share necessary information with payment processors, identity verification services, and legal authorities when required by law to complete transactions and prevent fraud.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
            4. Security
          </h2>
          <p className="mb-6">
            We implement robust security measures, including encryption and secure server hosting, to protect your data. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use, or modification.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100">
            5. Contact Us
          </h2>
          <p className="mb-6">
            If you have any questions about how we handle user data and personal information, feel free to contact our support team at support@payparo.com.
          </p>
        </div>
      </div>
    </div>
  );
}

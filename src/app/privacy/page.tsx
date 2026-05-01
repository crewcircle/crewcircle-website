import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-lg text-gray-600 mb-6">
          Last updated: May 1, 2026
        </p>
        
        <div className="prose max-w-none">
          <p>At CrewCircle, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website crewcircle.co, use our services, or otherwise interact with us.</p>
          
          <h2 className="text-3xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
          <p>We may collect personal information that you voluntarily provide to us when you register on the website, use our services, or contact us.</p>
          
          <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Provide, operate, and maintain our website and services</li>
            <li>Improve, personalize, and expand our website and services</li>
            <li>Understand and analyze how you use our website and services</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you, either directly or through partners</li>
          </ul>
          
          <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Sharing Your Information</h2>
          <p>We may share your information in the following situations:</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>With service providers who help us operate our website and deliver our services</li>
            <li>For business transfers, such as mergers, acquisitions, or asset sales</li>
            <li>When required by law or to protect our legal rights</li>
          </ul>
          
          <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Your Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data.</p>
          
          <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Data Security</h2>
          <p>We implement appropriate technical and organizational measures to help protect the security, integrity, and privacy of your personal information.</p>
          
          <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. The updated version will be indicated by an updated &quot;Last updated&quot; date.</p>
          
          <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@crewcircle.co.</p>
        </div>
        
         <div className="mt-12 text-center">
           <Link href="/" className="px-6 py-3 bg-orange-500 text-white rounded-lg text-md font-bold hover:bg-orange-600 transition-all">
             Back to Home
           </Link>
         </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-lg text-gray-600 mb-6">
          Last updated: May 1, 2026
        </p>
         
        <div className="prose max-w-none">
          <p>Welcome to CrewCircle!</p>
           <p>These Terms of Service (&quot;Terms&quot;) govern your use of our website crewcircle.co and our services. Please read them carefully.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-8 mb-4">Acceptance of Terms</h2>
           <p>By accessing or using our website and services, you agree to be bound by these Terms. If you do not agree, please do not use our services.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Services Provided</h2>
           <p>CrewCircle provides workforce management, accounting, business card scanning, and Xero assistance tools for Australian small businesses.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">User Accounts</h2>
           <p>To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account and password.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">User Conduct</h2>
           <p>You agree to use our services only for lawful purposes and in accordance with these Terms.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Intellectual Property</h2>
           <p>The website and its original content, features, and functionality are owned by CrewCircle and are protected by international copyright, trademark, and other laws.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Third-Party Links</h2>
           <p>Our website may contain links to third-party websites or services that are not owned or controlled by CrewCircle.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Disclaimer of Warranties</h2>
           <p>Our services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. CrewCircle disclaims all warranties of any kind, whether express or implied.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Limitation of Liability</h2>
           <p>In no event shall CrewCircle be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Governing Law</h2>
           <p>These Terms shall be governed by and construed in accordance with the laws of Australia, without regard to its conflict of law principles.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Changes to Terms</h2>
           <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide notice.</p>
           
           <h2 className="text-3xl font-semibold text-gray-900 mt-6 mb-4">Contact Us</h2>
           <p>If you have any questions about these Terms, please contact us at legal@crewcircle.co.</p>
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

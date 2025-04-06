import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <Button variant="ghost" asChild className="mb-6 hover:bg-background/60">
                        <Link href="/" className="flex items-center">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>

                    <header className="mb-8">
                        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                        <p className="text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                    </header>

                    <GlassCard className="mb-8">
                        <GlassCardContent className="p-8 prose dark:prose-invert max-w-none">
                            <h2>1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using Newsletter Name Ideas' website and services, you agree to be bound by these Terms of
                                Service. If you do not agree to all the terms and conditions, you may not access or use our services.
                            </p>

                            <h2>2. Description of Services</h2>
                            <p>
                                Newsletter Name Ideas provides tools for generating newsletter names, validating domain availability,
                                checking social media handles, and accessing educational resources related to newsletter creation and growth.
                            </p>

                            <h2>3. User Accounts</h2>
                            <p>
                                Some features of our services may require you to create an account. You are responsible for maintaining
                                the confidentiality of your account credentials and for all activities that occur under your account.
                            </p>
                            <p>
                                You agree to provide accurate and complete information when creating an account and to update your
                                information to keep it accurate and current.
                            </p>

                            <h2>4. User Content</h2>
                            <p>
                                Our services may allow you to submit, upload, or share content. You retain ownership of any intellectual
                                property rights you hold in that content, but you grant us a worldwide, royalty-free license to use,
                                reproduce, modify, and distribute your content in connection with providing our services.
                            </p>
                            <p>
                                You are solely responsible for the content you submit and must ensure it does not violate any
                                third-party rights or applicable laws.
                            </p>

                            <h2>5. Intellectual Property</h2>
                            <p>
                                All content, features, and functionality of our website, including but not limited to text, graphics,
                                logos, icons, images, audio clips, and software, are owned by Newsletter Name Ideas or its licensors and are
                                protected by copyright, trademark, and other intellectual property laws.
                            </p>
                            <p>
                                You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly
                                perform, republish, download, store, or transmit any of our materials without our express written
                                consent.
                            </p>

                            <h2>6. Prohibited Uses</h2>
                            <p>You agree not to use our services:</p>
                            <ul>
                                <li>In any way that violates applicable laws or regulations</li>
                                <li>To impersonate or attempt to impersonate Newsletter Name Ideas, its employees, or other users</li>
                                <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of our services</li>
                                <li>To attempt to gain unauthorized access to our systems or user accounts</li>
                                <li>To introduce viruses, trojans, worms, or other malicious code</li>
                            </ul>

                            <h2>7. Termination</h2>
                            <p>
                                We may terminate or suspend your account and access to our services at our sole discretion, without
                                notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or
                                third parties, or for any other reason.
                            </p>

                            <h2>8. Disclaimer of Warranties</h2>
                            <p>
                                Our services are provided "as is" and "as available" without any warranties of any kind, either express
                                or implied. We do not guarantee that our services will be uninterrupted, secure, or error-free.
                            </p>

                            <h2>9. Limitation of Liability</h2>
                            <p>
                                To the maximum extent permitted by law, Newsletter Name Ideas shall not be liable for any indirect, incidental,
                                special, consequential, or punitive damages resulting from your use of or inability to use our services.
                            </p>

                            <h2>10. Changes to Terms</h2>
                            <p>
                                We may revise these Terms of Service at any time by posting an updated version on our website. Your
                                continued use of our services after any changes constitutes your acceptance of the revised terms.
                            </p>

                        </GlassCardContent>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}

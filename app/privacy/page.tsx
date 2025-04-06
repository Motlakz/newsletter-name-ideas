import { GlassCard, GlassCardContent } from "@/components/ui/glass-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
                        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                    </header>

                    <GlassCard className="mb-8">
                        <GlassCardContent className="p-8 prose dark:prose-invert max-w-none">
                            <h2>Introduction</h2>
                            <p>
                                At Newsletter Name Ideas, we respect your privacy and are committed to protecting your personal data. This
                                Privacy Policy explains how we collect, use, and safeguard your information when you use our website and
                                services.
                            </p>
                            <p>
                                Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you
                                have read, understood, and agree to be bound by the terms of this Privacy Policy.
                            </p>

                            <h2>Information We Collect</h2>
                            <p>We collect several types of information from and about users of our website, including:</p>
                            <ul>
                                <li>
                                    <strong>Personal Information:</strong> This includes your name, email address, and any other
                                    information you provide when using our newsletter naming and validation services.
                                </li>
                                <li>
                                    <strong>Usage Data:</strong> Information about how you interact with our website, including your
                                    newsletter name searches, domain checks, and other tool usage patterns.
                                </li>
                                <li>
                                    <strong>Device Information:</strong> Technical data about the devices you use to access our website,
                                    including IP address, browser type, and operating system.
                                </li>
                            </ul>

                            <h2>How We Use Your Information</h2>
                            <p>We use the information we collect for various purposes, including:</p>
                            <ul>
                                <li>Providing our newsletter naming and validation services</li>
                                <li>Improving and personalizing your experience with our tools</li>
                                <li>Communicating with you about our services and resources</li>
                                <li>Analyzing usage patterns to enhance our website functionality</li>
                                <li>Ensuring the security and reliability of our platform</li>
                            </ul>

                            <h2>Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal information from
                                unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the
                                Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                            </p>

                            <h2>Third-Party Services</h2>
                            <p>
                                Our website may contain links to third-party websites or services that are not owned or controlled by
                                Newsletter Name Ideas. We have no control over and assume no responsibility for the content, privacy policies,
                                or practices of any third-party websites or services.
                            </p>

                            <h2>Children's Privacy</h2>
                            <p>
                                Our services are not intended for use by children under the age of 13. We do not knowingly collect
                                personal information from children under 13. If you are a parent or guardian and believe your child has
                                provided us with personal information, please contact us.
                            </p>

                            <h2>Changes to This Privacy Policy</h2>
                            <p>
                                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                                Privacy Policy on this page and updating the "Last updated" date.
                            </p>

                        </GlassCardContent>
                    </GlassCard>
                </div>
            </div>
        </div>
    )
}

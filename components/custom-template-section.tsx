import Link from "next/link"
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardFooter } from "@/components/ui/glass-card"
import { ArrowRight, Download, Layout, Mail, Timer } from "lucide-react"
import { Button } from "./ui/button"

export function CustomTemplateSection() {
    return (
        <GlassCard className="mb-12">
            <GlassCardHeader>
                <h2 className="text-2xl font-bold">Custom Template Generator</h2>
                <p className="text-muted-foreground">
                    Need a template tailored to your specific newsletter? Our AI can help create a custom template.
                </p>
            </GlassCardHeader>
            <GlassCardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
                        <Layout className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-semibold mb-1">Choose Format</h3>
                        <p className="text-sm text-muted-foreground">
                            Select your preferred newsletter structure and components
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
                        <Mail className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-semibold mb-1">Customize Content</h3>
                        <p className="text-sm text-muted-foreground">
                            Specify your industry, audience, and content preferences
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
                        <Download className="h-8 w-8 text-primary mb-2" />
                        <h3 className="font-semibold mb-1">Download & Use</h3>
                        <p className="text-sm text-muted-foreground">Get your custom template in multiple formats</p>
                    </div>
                </div>
            </GlassCardContent>
            <GlassCardFooter className="flex justify-center">
                <Button
                    asChild
                    className="bg-gradient-to-r from-primary to-purple-400 hover:from-primary/90 hover:to-purple-400/90 text-white shadow-md hover:shadow-lg transition-all"
                >
                    <Link href="#" className="flex items-center">
                        Coming Soon <Timer className="h-4 w-4 animate-pulse" />
                    </Link>
                </Button>
            </GlassCardFooter>
        </GlassCard>
    )
}

export default CustomTemplateSection

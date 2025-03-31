import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/glass-card"
import { BarChart, TrendingUp, LineChart, PieChart } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Newsletter Trend Analysis</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover trending topics, naming patterns, and industry insights
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Trending Topics</h2>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">AI & Machine Learning</span>
                    <span className="text-green-600 dark:text-green-400 flex items-center">+24%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "85%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Personal Finance</span>
                    <span className="text-green-600 dark:text-green-400 flex items-center">+18%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "72%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Mental Health</span>
                    <span className="text-green-600 dark:text-green-400 flex items-center">+15%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "65%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Sustainability</span>
                    <span className="text-green-600 dark:text-green-400 flex items-center">+12%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "58%" }}></div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center gap-3">
                  <BarChart className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">Popular Naming Patterns</h2>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Alliteration (e.g., "Tech Talk")</span>
                    <span>32%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "32%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">The [Noun] (e.g., "The Hustle")</span>
                    <span>28%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "28%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Weekly/Daily [Topic]</span>
                    <span>22%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "22%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Single Word + Emoji</span>
                    <span>18%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "18%" }}></div>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          <GlassCard className="mb-8">
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <LineChart className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Newsletter Growth by Industry</h2>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg border border-muted">
                <p className="text-muted-foreground">Interactive chart coming soon</p>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">+32%</div>
                  <div className="text-sm text-muted-foreground">Technology</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">+28%</div>
                  <div className="text-sm text-muted-foreground">Finance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">+24%</div>
                  <div className="text-sm text-muted-foreground">Health</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">+18%</div>
                  <div className="text-sm text-muted-foreground">Entertainment</div>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>

          <GlassCard>
            <GlassCardHeader>
              <div className="flex items-center gap-3">
                <PieChart className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Newsletter Name Length Analysis</h2>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-48 flex items-center justify-center bg-muted/50 rounded-lg border border-muted">
                  <p className="text-muted-foreground">Pie chart coming soon</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center">
                        <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
                        Short (1-2 words)
                      </span>
                      <span>42%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center">
                        <span className="w-3 h-3 bg-primary/70 rounded-full mr-2"></span>
                        Medium (3 words)
                      </span>
                      <span>35%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium flex items-center">
                        <span className="w-3 h-3 bg-primary/40 rounded-full mr-2"></span>
                        Long (4+ words)
                      </span>
                      <span>23%</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Shorter newsletter names tend to have higher open rates and better brand recognition.
                  </p>
                </div>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
